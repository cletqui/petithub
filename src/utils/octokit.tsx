import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { Octokit as OctokitCore } from "@octokit/core";
import {
  restEndpointMethods,
  RestEndpointMethodTypes,
} from "@octokit/plugin-rest-endpoint-methods";

import { version } from "../../package.json";
import { Bindings, Variables } from "..";

export const Octokit = OctokitCore.plugin(restEndpointMethods);
export type Octokit = InstanceType<typeof Octokit>;

/**
 * Asynchronously verifies a token by calling the rate-limit endpoint (which does
 * not itself consume rate-limit budget).
 * @async @function verifyToken
 * @param {string} token The token to verify.
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c The Context object.
 * @returns {Promise<boolean>} A promise that resolves to true if the token is valid, false otherwise.
 */
const verifyToken = async (
  token: string,
  c: Context<{ Bindings: Bindings; Variables: Variables }>
): Promise<boolean> => {
  try {
    const octokit = getOctokitInstance(c, token);
    const { status } = await octokit.request("GET /rate_limit");
    return status === 200;
  } catch (_) {
    return false;
  }
};

/**
 * Middleware function to authenticate API requests using an access token.
 * @async @function apiAuth
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void | Response>} A promise that resolves after authenticating the request or returning an unauthorized response.
 */
export const apiAuth = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ): Promise<void | Response> => {
    const { access_token } = c.var;
    const header = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    const token = access_token || header;
    if (!token || !(await verifyToken(token, c))) {
      return c.text("Unauthorized", 401);
    }
    await next();
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
  ): Promise<void> => {
    const octokit = getOctokitInstance(c);
    c.set("octokit", octokit);
    await next();
  }
);

/**
 * Creates and returns an instance of Octokit for GitHub API.
 * @function getOctokitInstance
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The context object.
 * @param {string} [token] - Optional token for authentication.
 * @returns {Octokit} An instance of Octokit.
 */
export const getOctokitInstance = (
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
    userAgent: `PetitHub/${version}`,
  });
};

/**
 * Asynchronously fetches a page of public repositories starting from a given ID.
 * @async @function getRepositories
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {number} since - The ID to start fetching repositories from.
 * @returns {Promise<RestEndpointMethodTypes["repos"]["listPublic"]["response"]>} A promise that resolves to the response containing an array of repositories.
 */
const getRepositories = async (
  octokit: Octokit,
  since: number
): Promise<RestEndpointMethodTypes["repos"]["listPublic"]["response"]> => {
  return octokit.rest.repos.listPublic({ since });
};

/**
 * Asynchronously fetches repository information for a specific owner and repository name from the GitHub API.
 * @async @function getRepos
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<RestEndpointMethodTypes["repos"]["get"]["response"]>} A promise that resolves to the response containing the repository information.
 */
export const getRepos = async (
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<RestEndpointMethodTypes["repos"]["get"]["response"]> => {
  return octokit.rest.repos.get({ owner, repo });
};

/**
 * Asynchronously retrieves a specific repository by ID.
 * @async @function getRepository
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {number} id - The ID of the repository to retrieve.
 * @returns {Promise<RestEndpointMethodTypes["repos"]["get"]["response"]["data"]>} A promise that resolves to the requested repository.
 */
export const getRepository = async (
  octokit: Octokit,
  id: number
): Promise<RestEndpointMethodTypes["repos"]["get"]["response"]["data"]> => {
  // (id - 1) because `since` starts from the next id
  const { data, status, url } = await getRepositories(octokit, Number(id) - 1);
  if (status !== 200) {
    throw new Error(`${status} error at ${url}`);
  }
  if (data.length === 0) {
    throw new Error("Repository not found");
  }
  const {
    name,
    owner: { login },
  } = data[0];
  const { data: repository } = await getRepos(octokit, login, name);
  return repository;
};

/**
 * Returns a new array with the elements of `items` in random order (Fisher-Yates).
 * @function shuffle
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Asynchronously retrieves a random repository that has no stars, is not a fork and is not empty.
 *
 * Picks a random `since` offset, then inspects a handful of random candidates from
 * that page (one detailed request each) instead of scanning the whole page. If a
 * page comes back empty the ceiling is halved, so a stale `maxId` self-corrects.
 * @async @function getRandomRepository
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @param {number} maxId - The maximum ID to consider for repository selection.
 * @returns {Promise<RestEndpointMethodTypes["repos"]["get"]["response"]["data"]>} A promise that resolves to the selected repository.
 */
export const getRandomRepository = async (
  octokit: Octokit,
  maxId: number
): Promise<RestEndpointMethodTypes["repos"]["get"]["response"]["data"]> => {
  const maxIterations = 15;
  const candidatesPerPage = 3;
  let ceiling = maxId;
  for (let loop = 0; loop < maxIterations; loop++) {
    const since = Math.floor(Math.random() * ceiling);
    const { data: repositories } = await getRepositories(octokit, since);
    if (repositories.length === 0) {
      ceiling = Math.max(1, Math.floor(ceiling / 2));
      continue;
    }
    const candidates = shuffle(repositories.filter((repo) => !repo.fork)).slice(
      0,
      candidatesPerPage
    );
    for (const repo of candidates) {
      try {
        const { data: repos } = await getRepos(
          octokit,
          repo.owner.login,
          repo.name
        );
        if (repos.stargazers_count === 0 && repos.size > 0) {
          return repos;
        }
      } catch (_) {
        /* repo went private / was renamed / deleted since listing — skip */
      }
    }
  }
  throw new Error(`No repository found after ${maxIterations} iterations`);
};

/**
 * Asynchronously fetches a specific property value from the repository data.
 * @async @function fetchRepositoryData
 * @template T - The type of the repository data (Repository).
 * @template K - The type of the key to extract from the repository data.
 * @param {Promise<T>} repository - The Promise containing the repository data.
 * @param {K} key - The key to extract from the repository data.
 * @returns {Promise<T[K]>} A Promise that resolves with the extracted property value.
 */
export const fetchRepositoryData = async <T, K extends keyof T>(
  repository: Promise<T>,
  key: K
): Promise<T[K]> => {
  const repo = await repository;
  return repo[key];
};

/**
 * Asynchronously retrieves the authenticated user's information using the provided Octokit instance.
 * @async @function getAuthenticatedUser
 * @param {Octokit} octokit - The Octokit instance for GitHub API.
 * @returns {Promise<RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]>} A Promise that resolves to the user's information response.
 */
export const getAuthenticatedUser = async (
  octokit: Octokit
): Promise<
  RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]
> => {
  return octokit.rest.users.getAuthenticated();
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
    const MAX_ID = 1_000_000_000;
    const cookie = getCookie(c, "max_id", "secure");
    let max_id = { id: MAX_ID, timestamp: 0 };
    if (cookie) {
      try {
        const parsed = JSON.parse(cookie);
        if (typeof parsed?.id === "number" && parsed.id > 0) {
          max_id = { id: parsed.id, timestamp: Number(parsed.timestamp) || 0 };
        }
      } catch (_) {
        /* malformed cookie — fall back to the default */
      }
    }
    c.set("max_id", max_id);
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
  return last.data.length > 0
    ? Number(last.data[last.data.length - 1].id)
    : prev;
};
