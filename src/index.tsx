import { Context, Hono, Env } from "hono";
import { logger } from "hono/logger";

import { renderer } from "./utils/renderer";
import { Repository } from "./components/repository";
import { getRandomRepository, handleMaxId } from "./utils/octokit";
import { handleTokens } from "./utils/tokens";

import api from "./routes/api";
import github from "./routes/github";
import template from "./routes/template";
import id from "./routes/id";

/* APP */
const app = new Hono<Env>();

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
app.get("/", async (c: Context<Env>): Promise<Response> => {
  const { max_id, octokit } = c.var;
  const repository = getRandomRepository(octokit, max_id.id);
  return c.render(<Repository repository={repository} />, { repository });
});

/* DEFAULT */
/* app.get(
  "*",
  (c: Context<{ Bindings: Bindings; Variables: Variables }>): Response => {
    return c.redirect("/", 301);
  }
); */

export default app;
