import { Context } from "hono";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { version } from "../../package.json";
import { Bindings, Variables } from "..";
import { ErrorSchema, RepositorySchema, ParamsSchema } from "../utils/schema";
import { handleMaxId } from "../utils/octokit";
import { handleTokens } from "../utils/tokens";
import { apiAuth, getRandomRepository, getRepository } from "../utils/octokit";

/* APP */
const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(poweredBy());
app.use(prettyJSON());
app.use(cors({ origin: "*", allowMethods: ["GET"], credentials: true }));
app.use(handleMaxId);
app.use(handleTokens);
app.use(apiAuth);

/* SECURITY */
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

/* SWAGGER */
app.get("/swagger", swaggerUI({ url: `/api/swagger.json`, version: "3.1" }));
app.doc31("/swagger.json", (c) => {
  return {
    openapi: "3.1.0",
    info: {
      title: "API",
      version: version,
      description: "PetitHub - [GitHub](https://github.com/cletqui/petithub)",
      contact: {
        name: "cletqui",
        url: "https://github.com/cletqui/petithub/issues",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/license/MIT",
      },
    },
    servers: [{ url: `${new URL(c.req.url).origin}/api`, description: "API" }],
    tags: [
      {
        name: "API",
        description: "Default API",
      },
    ],
  };
});

/* ROUTES */
const route = createRoute({
  method: "get",
  path: "/{id}?",
  request: {
    params: ParamsSchema,
  },
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: RepositorySchema,
        },
      },
      description: "Get a random repository",
    },
    302: {
      description: "Repository not found, redirecting to next repository",
    },
    401: {
      description: "Unauthorized (oauth login or authorization header needed)",
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
  description: "PetitHub API",
  externalDocs: {
    description: "Get a repository",
    url: "https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository",
  },
  tags: ["API"],
});

/* ENDPOINTS */
app.openapi(
  route,
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const { id } = c.req.param();
    const { max_id, octokit } = c.var;
    try {
      const repository = id
        ? await getRepository(octokit, Number(id))
        : await getRandomRepository(octokit, max_id.id);
      if (id && repository.id != Number(id)) {
        return c.redirect(`/api/${repository.id}`, 302);
      }
      return c.json(repository, 200);
    } catch (error: any) {
      return c.json({ message: "Failed to fetch repository data" }, 500);
    }
  }
);

export default app;
