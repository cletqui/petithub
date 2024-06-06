import { Hono } from "hono";
import { Suspense } from "hono/jsx";
import { prettyJSON } from "hono/pretty-json";
import { Octokit } from "@octokit/core";

import { renderer, Container, Loader } from "./renderer";

type Bindings = {
  GITHUB_TOKEN: string;
  MAX_ID: number;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);
app.use(prettyJSON());

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    html_url: string;
  };
  fork: boolean;
  description: string;
  html_url: string;
}

const getRepository = async (octokit: Octokit, since: number) => {
  return octokit.request("GET /repositories", {
    since,
    headers: {
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

const getStars = async (octokit: Octokit, owner: string, repo: string) => {
  return octokit.request("GET /repos/{owner}/{repo}/stargazers", {
    owner,
    repo,
    per_page: 1,
    page: 1,
    headers: {
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

const getData = async (
  octokit: Octokit,
  maxId: number
): Promise<Repository> => {
  let repository = null;
  const maxIterations = 10; // max iterations
  for (let loop = 0; loop < maxIterations; loop++) {
    const since = Math.floor(Math.random() * maxId);
    const { data: repositories } = await getRepository(octokit, since);
    repositories
      .filter((repo: Repository) => !repo.fork) // remove the forked repositories
      .some(async (repo: Repository) => {
        const {
          name,
          owner: { login },
        } = repo; // TODO remove the empty repositories
        const { data: stars } = await getStars(octokit, login, name); // TODO deal with errors
        if (stars.length === 0) {
          repository = repo;
          return true;
        }
        console.log(`${login}/${name}`);
        return false;
      });
    if (repository) {
      break;
    }
  }
  return repository;
};

const Repository = async ({ octokit, maxId }) => {
  const repository = await getData(octokit, maxId);
  return <Container repository={repository} />;
};

app.get("/json", async (c) => {
  const { GITHUB_TOKEN, MAX_ID } = c.env; // TODO move this into the functions
  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
  const repository = await getData(octokit, MAX_ID);
  return c.json(repository);
});

app.get("/json/:id", async (c) => {
  const { id } = c.req.param();
  const { GITHUB_TOKEN } = c.env;
  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
  const { data } = await getRepository(octokit, Number(id) - 1);
  return c.json(data[0]); // TODO check the status
});

app.get("/template", async (c) => {
  // TODO
  // 1296268
});

app.get("/", async (c) => {
  const { GITHUB_TOKEN, MAX_ID } = c.env;
  const octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
  return c.render(
    <Suspense fallback={<Loader />}>
      <Repository octokit={octokit} maxId={MAX_ID} />
    </Suspense>,
    { title: "test" } // TODO change the title dynamically
  );
});

export default app;
