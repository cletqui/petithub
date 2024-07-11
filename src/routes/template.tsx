import { Context, Hono, Env } from "hono";

import { Repository } from "../components/repository";
import { handleTokens } from "../utils/tokens";
import { getRepository } from "../utils/octokit";

/* APP */
const app = new Hono<Env>();

/* MIDDLEWARES */
app.use(handleTokens);

/* ENDPOINTS */
app.get("/", async (c: Context<Env>): Promise<Response> => {
  const { octokit } = c.var;
  const id = 811042081; // cletqui/petithub
  const repository = getRepository(octokit, id);
  return c.render(<Repository repository={repository} />, { repository });
});

export default app;
