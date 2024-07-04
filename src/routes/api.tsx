import { Context, Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";

import { Bindings, Variables } from "..";
import { handleMaxId } from "../utils/octokit";
import { handleTokens } from "../utils/tokens";
import { apiAuth, getRandomRepository, getRepository } from "../utils/octokit";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(poweredBy());
app.use(prettyJSON());
app.use(cors({ origin: "*", allowMethods: ["GET"], credentials: true }));
app.use(handleMaxId);
app.use(handleTokens);
app.use(apiAuth);

/* ENDPOINTS */
app.get(
  "/",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    c.redirect("/api/random");
  }
); // TODO display Swagger

app.get(
  "/random",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { max_id, octokit } = c.var;
    try {
      const repository = await getRandomRepository(octokit, max_id.id);
      return c.json(repository);
    } catch (error: any) {
      return c.json({ error: "Failed to fetch repository data" }, 500);
    }
  }
);

app.get(
  "/:id",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { id } = c.req.param();
    const { octokit } = c.var;
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
