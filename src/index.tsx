import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { prettyJSON } from "hono/pretty-json";
import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";
import { HtmlEscapedString } from "hono/utils/html";

import { renderer, Container, Loader, Repository } from "./renderer";

type Bindings = {
  GITHUB_TOKEN: string;
  MAX_ID: number;
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

const getRepository = async (
  octokit: Octokit,
  since: number
): Promise<OctokitResponse<Repository[]>> => {
  try {
    return await octokit.request("GET /repositories", { since });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    throw new Error("Failed to fetch repositories");
  }
};

const getStars = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<OctokitResponse<any[]>> => {
  try {
    return await octokit.request("GET /repos/{owner}/{repo}/stargazers", {
      owner,
      repo,
      per_page: 1,
      page: 1,
    });
  } catch (error) {
    console.error(`Error fetching stars for ${owner}/${repo}:`, error);
    throw new Error(`Failed to fetch stars for ${owner}/${repo}`);
  }
};

const getBranches = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<OctokitResponse<any[]>> => {
  try {
    return await octokit.request("GET /repos/{owner}/{repo}/branches", {
      owner,
      repo,
      per_page: 1,
      page: 1,
    });
  } catch (error) {
    console.error(`Error fetching branches for ${owner}/${repo}:`, error);
    throw new Error(`Failed to fetch branches for ${owner}/${repo}`);
  }
};

const getData = async (
  octokit: Octokit,
  maxId: number
): Promise<Repository> => {
  const maxIterations = 10; // max iterations
  const error = "Unknown error";
  for (let loop = 0; loop < maxIterations; loop++) {
    const since = Math.floor(Math.random() * maxId);
    const { data: repositories } = await getRepository(octokit, since);
    const originalRepositories = repositories.filter(
      (repo: Repository) => !repo.fork
    );
    for (const repo of originalRepositories) {
      const {
        name,
        owner: { login },
      } = repo;
      const { data: stars } = await getStars(octokit, login, name); // check if repo has no stars
      const { data: branches } = await getBranches(octokit, login, name); // check if repo has content (could use /contents too)
      if (stars.length === 0 && branches.length > 0) {
        return repo;
      }
      console.log(`${login}/${name}`);
    }
  }
  console.error(error);
  throw new Error(error);
};

const Repository = async ({
  octokit,
  maxId,
}: {
  octokit: Octokit;
  maxId: number;
}): Promise<HtmlEscapedString> => {
  const repository = await getData(octokit, maxId);
  /* const {
    name,
    owner: { login },
  } = repository;
  const title = `PetitHub - ${login}/${name}`; */
  return <Container repository={repository} />;
};

app.get("/json", async (c: Context<{ Bindings: Bindings }>) => { // TODO implement Bearer Authentication
  const { GITHUB_TOKEN, MAX_ID } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  try {
    const repository = await getData(octokit, MAX_ID);
    return c.json(repository);
  } catch (error) {
    console.error("Error fetching repository data:", error);
    return c.json({ error: "Failed to fetch repository data" }, 500);
  }
});

app.get("/json/:id", async (c: Context<{ Bindings: Bindings }>) => { // TODO implement Bearer Authentication
  const { id } = c.req.param();
  const { GITHUB_TOKEN } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  const { data } = await getRepository(octokit, Number(id) - 1);
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
      <Repository octokit={octokit} maxId={MAX_ID} />
    </Suspense>,
    { title: "PetitHub" } // TODO change this title dynamically
  );
});

export default app;
