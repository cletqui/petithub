import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { prettyJSON } from "hono/pretty-json";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import {
  renderer,
  Loader,
  Container,
  RepositoryContainer,
} from "./utils/renderer";
import {
  getOctokitInstance,
  getRepositories,
  getRepos,
  verifyToken,
  getData,
  getMaxId,
} from "./utils/octokit";
import { getCookieId, setCookieId } from "./utils/cookie";

export type Bindings = {
  GITHUB_TOKEN: string;
};

/* APP */
const app = new Hono<{ Bindings: Bindings }>();

/* GLOBAL VARIABLES */
const MAX_ID = 815471592; // TBU

/* MIDDLEWARES */
app.use(renderer);
app.use(prettyJSON());
app.use("/api/*", cors({ origin: "*", allowMethods: ["GET"] }));
app.use("/api/*", bearerAuth({ verifyToken }));

/* ROUTES */
app.get(
  "/api",
  async (c: Context<{ Bindings: Bindings }>): Promise<Response> => {
    const octokit = getOctokitInstance(c);
    try {
      const repository = await getData(octokit, Number(MAX_ID));
      return c.json(repository);
    } catch (error: any) {
      console.error("Error fetching repository data:", error);
      return c.json({ error: "Failed to fetch repository data" }, 500);
    }
  }
);

app.get(
  "/api/:id",
  async (c: Context<{ Bindings: Bindings }>): Promise<Response> => {
    const { id } = c.req.param();
    const octokit = getOctokitInstance(c);
    const { data, status, url } = await getRepositories(
      octokit,
      Number(id) - 1
    ); // (id - 1) because since starts from next id
    if (status === 200) {
      if (data.length === 0) {
        return c.json({ error: "Repository not found" }, 404);
      }
      return c.json(data[0]);
    } else {
      return c.json({ error: `${status} error at ${url}` }, 500);
    }
  }
);

app.get(
  "/id",
  async (c: Context<{ Bindings: Bindings }>): Promise<Response> => {
    const octokit = getOctokitInstance(c);
    const id = await getMaxId(octokit, Number(MAX_ID));
    setCookieId(c, id);
    const timestamp = new Date();
    return c.json({ id, timestamp });
  }
);

app.get(
  "/template",
  async (c: Context<{ Bindings: Bindings }>): Promise<Response> => {
    const octokit = getOctokitInstance(c);
    const { data: repository } = await getRepos(
      octokit,
      "octocat",
      "Hello-World"
    );
    return c.render(
      <Suspense fallback={<Loader />}>
        <Container repository={repository} />
      </Suspense>,
      { title: "PetitHub - octocat/Hello-world" }
    );
  }
);

app.get("/", async (c: Context<{ Bindings: Bindings }>): Promise<Response> => {
  const octokit = getOctokitInstance(c);
  const cookieId = getCookieId(c);
  const maxId = cookieId || MAX_ID;
  return c.render(
    <Suspense fallback={<Loader />}>
      <RepositoryContainer octokit={octokit} maxId={maxId} />
    </Suspense>,
    { title: "PetitHub" } // TODO change this title dynamically
  );
});

app.get("*", (c) => {
  return c.redirect("/", 301);
});

export default app;
