import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { Repository } from "../components/repository";
import { handleTokens } from "../utils/tokens";
import { getRepository } from "../utils/octokit";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(handleTokens);

/* ENDPOINTS */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { octokit } = c.var;
    const id = 811042081; // cletqui/petithub
    const repository = getRepository(octokit, id);
    return c.render(<Repository repository={repository} />, { repository });
  }
);

export default app;
