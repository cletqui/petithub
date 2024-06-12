import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { prettyJSON } from "hono/pretty-json";
import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";
import { HtmlEscapedString } from "hono/utils/html";

import { renderer, Container, Loader, Repository } from "./renderer";

type Bindings = {
  GITHUB_TOKEN: string;
  MAX_ID: string; // TODO determine this ID automatically
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);
app.use(prettyJSON());

const getOctokitInstance = (token: string): Octokit => {
  return new Octokit({
    auth: token,
    headers: {
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

const getRepositories = async (
  octokit: Octokit,
  since: number
): Promise<OctokitResponse<Repository[]>> => {
  try {
    return await octokit.request("GET /repositories", {
      since,
    });
  } catch (error: any) {
    console.error("Error fetching repositories:", error);
    throw new Error("Failed to fetch repositories");
  }
};

const getRepos = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<OctokitResponse<any>> => {
  try {
    return await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
  } catch (error: any) {
    console.error(`Error fetching repository for ${owner}/${repo}:`, error);
    throw new Error(`Failed to fetch repository for ${owner}/${repo}`);
  }
};

const getData = async (
  octokit: Octokit,
  maxId: number
): Promise<Repository> => {
  try {
    const maxIterations = 10; // max iterations
    for (let loop = 0; loop < maxIterations; loop++) {
      const since = Math.floor(Math.random() * maxId);
      const { data: repositories } = await getRepositories(octokit, since);
      const originalRepositories = repositories.filter(
        (repo: Repository) => !repo.fork
      );
      for (const repo of originalRepositories) {
        const {
          name,
          owner: { login },
        } = repo;
        const { data: repos } = await getRepos(octokit, login, name);
        const { stargazers_count, size } = repos;
        if (stargazers_count === 0 && size > 0) {
          return repos;
        }
        console.log(`${login}/${name}`);
      }
    }
    throw new Error(`No repository found with ${maxIterations} iterations`);
  } catch (error: any) {
    throw new Error(error);
  }
};

const Repository = async ({
  octokit,
  maxId,
}: {
  octokit: Octokit;
  maxId: number;
}): Promise<HtmlEscapedString> => {
  const repository = await getData(octokit, maxId);
  /* const { full_name } = repository;
  const title = `PetitHub - ${full_name}`; */
  return <Container repository={repository} />;
};

app.get("/json", async (c: Context<{ Bindings: Bindings }>) => {
  const { GITHUB_TOKEN, MAX_ID } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  try {
    const repository = await getData(octokit, Number(MAX_ID));
    return c.json(repository);
  } catch (error: any) {
    console.error("Error fetching repository data:", error);
    return c.json({ error: "Failed to fetch repository data" }, 500);
  }
}); // TODO require API token for /json*

app.get("/json/:id", async (c: Context<{ Bindings: Bindings }>) => {
  const { id } = c.req.param();
  const { GITHUB_TOKEN } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  const { data } = await getRepositories(octokit, Number(id) - 1);
  if (data.length === 0) {
    return c.json({ error: "Repository not found" }, 404);
  }
  return c.json(data[0]);
}); // TODO check the status

app.get("/", async (c: Context<{ Bindings: Bindings }>) => {
  const { GITHUB_TOKEN, MAX_ID } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  return c.render(
    <Suspense fallback={<Loader />}>
      <Repository octokit={octokit} maxId={Number(MAX_ID)} />
    </Suspense>,
    { title: "PetitHub" } // TODO change this title dynamically
  );
});

export default app;
