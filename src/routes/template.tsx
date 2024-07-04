import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";

import { Bindings, Variables } from "..";
import { handleTokens } from "../utils/tokens";
import { Loader, Container } from "../utils/renderer";
import { getRepos } from "../utils/octokit";

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
    const owner = "cletqui";
    const repo = "petithub";
    const { data: repository } = await getRepos(octokit, owner, repo);
    return c.render(
      <Suspense fallback={<Loader />}>
        <Container repository={repository} />
      </Suspense>,
      { title: `PetitHub - ${owner}/${repo}` }
    );
  }
);

export default app;
