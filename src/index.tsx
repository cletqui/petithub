import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { Octokit } from "octokit";

import { renderer } from "./utils/renderer";
import { handleTokens } from "./utils/tokens";
import { getRandomRepository, handleMaxId } from "./utils/octokit";
import { Repository } from "./components/repository";

import api from "./routes/api";
import github from "./routes/github";
import template from "./routes/template";
import id from "./routes/id";

/* TYPES */
export type Bindings = {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

export type Variables = {
  max_id: { id: number; timestamp: number };
  access_token?: string;
  expires_in?: string;
  refresh_token?: string;
  state: string;
  octokit: Octokit;
};

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(logger());
app.use(renderer);
app.use("/", handleMaxId);
app.use("/", handleTokens);

/* ROUTES */
app.route("/api", api);
app.route("/github", github);
app.route("/template", template);
app.route("/id", id);

/* ROOT */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { max_id, octokit } = c.var;
    const repository = getRandomRepository(octokit, max_id.id);
    return c.render(<Repository repository={repository} />, { repository });
  }
);

/* DEFAULT */
/* app.get(
  "*",
  (c: Context<{ Bindings: Bindings; Variables: Variables }>): Response => {
    return c.redirect("/", 301);
  }
); */

export default app;
