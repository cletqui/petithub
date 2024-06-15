import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { prettyJSON } from "hono/pretty-json";
import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";
import { HtmlEscapedString } from "hono/utils/html";
import { bearerAuth } from "hono/bearer-auth";

import { renderer, Container, Loader, Repository } from "./renderer";

type Bindings = {
  GITHUB_TOKEN: string;
  MAX_ID: string; // TODO determine this ID automatically
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);
app.use(prettyJSON());
app.use(
  "/api/*",
  bearerAuth({
    verifyToken: async (token: string, c: Context) => {
      const octokit = getOctokitInstance(token);
      try {
        const { status } = await getRepos(octokit, "octocat", "Hello-World");
        return status === 200;
      } catch (error) {
        return false;
      }
    },
  })
);

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
        console.log(
          `${login}/${name} (stars: ${stargazers_count}, size: ${size})`
        );
      }
    }
    throw new Error(`No repository found with ${maxIterations} iterations`);
  } catch (error: any) {
    throw new Error(error);
  }
};

const getMaxId = async (octokit: Octokit, id: number) => {
  // Initial search to find a boundary where repositories stop
  let max = 10;
  let inc = 100;
  let prev = id;
  let next = id;
  let list = await getRepositories(octokit, id);
  while (list.data.length > 0 && max > 0) {
    prev = next;
    next += inc;
    list = await getRepositories(octokit, next);
    max -= 1;
    inc *= 10;
    console.log(
      `(${max}) MAX_ID: ${id}, PREV: ${prev}, NEXT: ${next}, INC: ${inc}, LENGTH: ${list.data.length}`
    );
  }
  console.log(
    `ID max is between ${prev} (where data.length = ${
      (await getRepositories(octokit, prev)).data.length
    }}) and ${next} (where data.length = ${
      (await getRepositories(octokit, next)).data.length
    })`
  );
  // Binary search to find the exact boundary
  max = 20;
  let middle = id;
  while (next - prev > 100 && max > 0) {
    middle = prev + Math.floor((next - prev) / 2);
    list = await getRepositories(octokit, middle);

    if (list.data.length > 0) {
      prev = middle;
    } else {
      next = middle;
    }
    console.log(
      `(${max}) PREV: ${prev}, MIDDLE: ${middle}, NEXT: ${next}, DELTA: ${
        next - prev
      }, LENGTH: ${list.data.length}, DECISION: ${
        list.data.length > 0 ? "prev = middle" : "next = middle"
      }`
    );
    max -= 1;
  }
  console.log(
    `Loop stopped because: ${
      list.data.length < 100
        ? `data.length = ${list.data.length}`
        : next - prev <= 100
        ? `next - prev = ${next - prev}`
        : `max = ${max}`
    }`
  );
  // Get the last repository ID in the determined range
  const last = await getRepositories(octokit, middle);
  const res = last.data.length > 0 ? last.data[last.data.length - 1].id : prev;
  console.log(
    `MIDDLE: ${middle}, RES: ${res}, LENGTH: ${last.data.length}`
  );
  return res;
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

app.get("/api", async (c: Context<{ Bindings: Bindings }>) => {
  const { GITHUB_TOKEN, MAX_ID } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  try {
    const repository = await getData(octokit, Number(MAX_ID));
    return c.json(repository);
  } catch (error: any) {
    console.error("Error fetching repository data:", error);
    return c.json({ error: "Failed to fetch repository data" }, 500);
  }
});

app.get("/api/:id", async (c: Context<{ Bindings: Bindings }>) => {
  const { id } = c.req.param();
  const { GITHUB_TOKEN } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  const { data } = await getRepositories(octokit, Number(id) - 1);
  if (data.length === 0) {
    return c.json({ error: "Repository not found" }, 404);
  }
  return c.json(data[0]);
}); // TODO check the status

app.get("/id", async (c: Context<{ Bindings: Bindings }>) => {
  const { GITHUB_TOKEN, MAX_ID } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  if (MAX_ID) {
    const id = await getMaxId(octokit, Number(MAX_ID));
    const timestamp = new Date();
    return c.json({ id, timestamp });
  } else {
    return c.text("No MAX_ID found", 404);
  }
});

app.get("/template", async (c: Context<{ Bindings: Bindings }>) => {
  const { GITHUB_TOKEN } = c.env;
  const octokit = getOctokitInstance(GITHUB_TOKEN);
  const { data: repository } = await getRepos(
    octokit,
    "octocat",
    "Hello-World"
  );
  return c.render(
    <Suspense fallback={<Loader />}>
      <Container repository={repository} />
    </Suspense>,
    { title: "PetitHub - octocat/Hello-world" }
  );
});

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
