import { Context, Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";

import { Bindings, Variables } from "..";
import {
  apiAuth,
  getOctokitInstance,
  getRandomRepository,
  getRepository,
} from "../utils/octokit";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(apiAuth());
app.use(poweredBy());
app.use(prettyJSON());
app.use(cors({ origin: "*", allowMethods: ["GET"], credentials: true }));

/* ENDPOINTS */
app.get(
  "",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const octokit = getOctokitInstance(c);
    const { max_id } = c.var;
    try {
      const repository = await getRandomRepository(octokit, max_id);
      return c.json(repository);
    } catch (error: any) {
      return c.json({ error: "Failed to fetch repository data" }, 500);
    }
  }
); // TODO fix request to "/api" that redirects to "/"

app.get(
  "/:id",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const id = c.req.param("id");
    const octokit = getOctokitInstance(c);
    try {
      const repository = await getRepository(octokit, Number(id));
      const { id: repositoryId } = repository;
      if (Number(id) === repositoryId) {
        return c.json(repository);
      } else {
        return c.json(
          {
            message: `Repository id:${id} not found.`,
            nextId: repositoryId,
          },
          404
        );
      }
    } catch (error: any) {
      return c.json({ error: "Failed to fetch repository data" }, 500);
    }
  }
);

export default app;
