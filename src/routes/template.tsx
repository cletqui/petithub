import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";

import { Bindings, Variables } from "..";
import { Loader, Container } from "../utils/renderer";
import { getOctokitInstance, getRepos } from "../utils/octokit";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const octokit = getOctokitInstance(c);
    const owner = "octocat";
    const repo = "Hello-World";
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
