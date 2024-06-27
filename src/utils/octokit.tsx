import { Context } from "hono";
import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";

import { Repository } from "./renderer";
import { Bindings } from "..";

export const getOctokitInstance = (
  c: Context<{ Bindings: Bindings }>
): Octokit => {
  const { GITHUB_TOKEN } = c.env;
  return new Octokit({
    auth: GITHUB_TOKEN,
    headers: {
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

export const verifyToken = async (
  token: string,
  c: Context<{ Bindings: Bindings }>
) => {
  c.env.GITHUB_TOKEN = token;
  const octokit = getOctokitInstance(c);
  try {
    const { status } = await getRepos(octokit, "octocat", "Hello-World");
    return status === 200;
  } catch (error) {
    return false;
  }
};

const getRepositories = async (
  octokit: Octokit,
  since: number
): Promise<OctokitResponse<Repository[]>> => {
  try {
    return await octokit.request("GET /repositories", { since });
  } catch (error: any) {
    throw new Error(`Error fetching repositories since ${since}: ${error}`);
  }
};

export const getRepos = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<OctokitResponse<any>> => {
  try {
    return await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
  } catch (error: any) {
    throw new Error(`Error fetching repository for ${owner}/${repo}: ${error}`);
  }
};

export const getRepository = async (
  octokit: Octokit,
  id: number
): Promise<Repository> => {
  try {
    const { data, status, url } = await getRepositories(
      octokit,
      Number(id) - 1
    ); // (id - 1) because since starts from next id
    if (status === 200) {
      if (data.length === 0) {
        throw new Error("Repository not found");
      } else {
        const repo = data[0];
        const {
          name,
          owner: { login },
        } = repo;
        const { data: repository } = await getRepos(octokit, login, name);
        return repository;
      }
    } else {
      throw new Error(`${status} error at ${url}`);
    }
  } catch (error: any) {
    throw new Error(`Error fetching repository for id=${id}: ${error}`);
  }
};

export const getRandomRepository = async (
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
        try {
          const { data: repos } = await getRepos(octokit, login, name);
          const { stargazers_count, size } = repos;
          if (stargazers_count === 0 && size > 0) {
            return repos;
          }
          console.log(
            `${login}/${name} (stars: ${stargazers_count}, size: ${size})`
          );
        } catch (error: any) {
          console.log(`${login}/${name} (${error})`);
        }
      }
    }
    throw new Error(`No repository found with ${maxIterations} iterations`);
  } catch (error: any) {
    throw new Error(`Error fetching data: ${error}`);
  }
};

export const getMaxId = async (
  octokit: Octokit,
  id: number
): Promise<number> => {
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
  max = 50;
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
  console.log(`MIDDLE: ${middle}, RES: ${res}, LENGTH: ${last.data.length}`);
  return res;
};
