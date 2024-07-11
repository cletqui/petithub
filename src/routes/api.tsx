import { Context, Env } from "hono";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import {
  ErrorSchema,
  ParamsSchema,
  RepositorySchema,
  swaggerDoc,
} from "../utils/swagger";
import { handleMaxId } from "../utils/octokit";
import { handleTokens } from "../utils/tokens";
import { apiAuth, getRandomRepository, getRepository } from "../utils/octokit";

/* APP */
const app = new OpenAPIHono<Env>();

/* MIDDLEWARES */
app.use(poweredBy());
app.use(prettyJSON());
app.use(cors({ origin: "*", allowMethods: ["GET"], credentials: true }));
app.use(handleMaxId);
app.use(handleTokens);
app.use(apiAuth);

/* SWAGGER */
app.doc("/swagger/json", swaggerDoc);
app.get("/swagger", swaggerUI({ url: `/api/swagger/json`, version: "3.1" }));

/* ROUTES */
const route = createRoute({
  method: "get",
  path: "/{id}?",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: RepositorySchema,
        },
      },
      description: "Get a random repository",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Failed to fetch repository",
    },
  },
  tags: ["API"],
});

/* ENDPOINTS */
/* app.get(
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
        return c.json(repository, 200);
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
); */

app.openapi(route, async (c: Context<Env>) => {
  const { id } = c.req.param();
  console.log("ID:", id);
  const { max_id, octokit } = c.var;
  try {
    const repository = await getRandomRepository(octokit, max_id.id);
    return c.json(repository, 200);
  } catch (error: any) {
    return c.json({ error: "Failed to fetch repository data" }, 500);
  }
});

export default app;
