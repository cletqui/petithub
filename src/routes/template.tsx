import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";

import { Bindings, Variables } from "..";
import { handleTokens, refreshToken } from "../utils/tokens";
import { Loader, Container } from "../utils/renderer";
import { getOctokitInstance, getRepos } from "../utils/octokit";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(handleTokens());
app.use(refreshToken());

/* ENDPOINTS */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const octokit = getOctokitInstance(c);
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
