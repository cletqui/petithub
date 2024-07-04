import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { Octokit } from "octokit";
import { OctokitResponse } from "@octokit/types";

import { Repository } from "./renderer";
import { Bindings, Variables } from "..";

/**
 * Asynchronously verifies the token by checking the status of fetching repositories.
 * @async @function verifyToken
 * @param {string} token The token to verify.
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c The Context object.
 * @returns {Promise<boolean>} A promise that resolves to true if the token is valid, false otherwise.
 */
const verifyToken = async (
  token: string,
  c: Context<{ Bindings: Bindings; Variables: Variables }>
): Promise<boolean> => {
  const octokit = getOctokitInstance(c, token);
  try {
    const { status } = await getRepos(octokit, "octocat", "Hello-World");
    return status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Middleware function to authenticate API requests using an access token.
 * @async @function apiAuth
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after authenticating the request or returning an unauthorized response.
 */
export const apiAuth = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) => {
    console.log("MIDDLEWARE", "apiAuth");
    const { access_token } = c.var;
    const accessToken = access_token || c.req.header("Authorization");
    if (accessToken && (await verifyToken(accessToken, c))) {
      await next();
    }
    return c.text("Unauthorized", 401);
  }
);

/**
 * Middleware function to handle the creation of an Octokit instance and set it in the context.
 * @async @function handleOctokit
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after creating the Octokit instance.
 */
export const handleOctokit = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) => {
    console.log("MIDDLEWARE", "handleOctokit");
    const octokit = getOctokitInstance(c);
    c.set("octokit", octokit);
    await next();
  }
);

/**
 * Creates and returns an instance of Octokit for GitHub API.
 * @async @function getOctokitInstance
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The context object.
 * @param {string} [token] - Optional token for authentication.
 * @returns {Octokit} An instance of Octokit.
 */
const getOctokitInstance = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  token?: string
): Octokit => {
  const { access_token } = c.var;
  const accessToken = token || access_token;
  return new Octokit({
    auth: accessToken,
    headers: {
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

/**
 * Asynchronously fetches repositories from a specified ID.
 * @async @function getRepositories
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {number} since - The ID to start fetching repositories from.
 * @returns {Promise<OctokitResponse<Repository[]>>} A promise that resolves to the response containing an array of repositories.
 */
const getRepositories = async (
  octokit: Octokit,
  since: number
): Promise<OctokitResponse<Repository[]>> => {
  try {
    return await octokit.request("GET /repositories", { since });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Asynchronously fetches repository information for a specific owner and repository name from the GitHub API.
 * @async @function getRepos
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<OctokitResponse<any>>} A promise that resolves to the response containing the repository information.
 */
export const getRepos = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<OctokitResponse<any>> => {
  try {
    return await octokit.request("GET /repos/{owner}/{repo}", { owner, repo });
  } catch (error: any) {
    throw error;
  }
};

/**
 * Asynchronously retrieves a specific repository by ID.
 * @async @function getRepository
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {number} id - The ID of the repository to retrieve.
 * @returns {Promise<Repository>} A promise that resolves to the requested repository.
 */
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
    throw error;
  }
};

/**
 * Asynchronously retrieves a random repository that has no stars, is not a forked repo and is not empty.
 * @async @function getRandomRepository
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {number} maxId - The maximum ID to consider for repository selection.
 * @returns {Promise<Repository>} A promise that resolves to the selected repository.
 */
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
    throw error;
  }
};

/**
 * Middleware function to handle the maximum ID by setting it based on a cookie value or a default value.
 * @async @function handleMaxId
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after handling the maximum ID.
 */
export const handleMaxId = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) => {
    const max_id = getCookie(c, "max_id", "secure");
    const MAX_ID = 822080279; // TODO TBU
    c.set("max_id", max_id ? JSON.parse(max_id) : { id: MAX_ID, timestamp: 0 });
    await next();
  }
);

/**
 * Asynchronously finds the maximum ID of repositories starting from a specified id.
 * @async @function getMaxId
 * @param {Octokit} octokit The Octokit instance for GitHub API.
 * @param {number} id The initial ID to start the search from.
 * @returns {Promise<number>} A promise that resolves to the maximum repository ID found.
 */
export const getMaxId = async (
  octokit: Octokit,
  id: number
): Promise<number> => {
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
  }
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
    max -= 1;
  }
  const last = await getRepositories(octokit, middle);
  return last.data.length > 0 ? last.data[last.data.length - 1].id : prev;
};
