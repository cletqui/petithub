import { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { Bindings, Variables } from "..";
import { handleOctokit } from "./octokit";

const DEFAULT_EXPIRES_IN = "28800";

type GitHubTokenResponse = {
  error?: string;
  error_description?: string;
  access_token?: string;
  expires_in?: string;
  refresh_token?: string;
  refresh_token_expires_in?: string;
};

/**
 * Middleware function to handle tokens, refresh access_token if needed and handle the octokit.
 * @async @function handleTokens
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<Response | void>} A promise that resolves on refreshing access_tokens or creating the octokit.
 */
export const handleTokens = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ): Promise<Response | void> => {
    const accessToken = getCookie(c, "access_token", "secure");
    const refreshToken = getCookie(c, "refresh_token", "secure");
    c.set("access_token", accessToken);
    c.set("refresh_token", refreshToken);
    if (refreshToken && !accessToken) {
      const { CLIENT_ID, CLIENT_SECRET } = c.env;
      const { access_token, expires_in, error, error_description } =
        await fetchGitHubToken(CLIENT_ID, CLIENT_SECRET, {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        });
      if (access_token) {
        setToken(c, "access_token", access_token, expires_in);
      } else {
        console.error("token refresh failed", error, error_description);
        unsetToken(c, "refresh_token");
      }
    }
    await handleOctokit(c, next);
  }
);

/**
 * Sets a token in the context and as a secure, HTTP-only cookie with specified attributes.
 * @function setToken
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {keyof Variables} key - The key to set the token value in the context and cookie.
 * @param {string} value - The value of the token to be set.
 * @param {string} [expires] - The expiration time of the token in seconds.
 */
const setToken = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  key: keyof Variables,
  value: string,
  expires?: string
): void => {
  c.set(key, value);
  setCookie(c, key, value, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: Number(expires) || Number(DEFAULT_EXPIRES_IN),
    sameSite: "Lax",
    prefix: "secure",
  });
};

/**
 * Function to unset a token by setting its value to undefined and deleting its corresponding cookie.
 * @function unsetToken
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {keyof Variables} key - The key of the token to unset from the Variables object.
 */
export const unsetToken = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  key: keyof Variables
): void => {
  c.set(key, undefined);
  deleteCookie(c, key, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "Lax",
    prefix: "secure",
  });
};

/**
 * Exchanges a code or refresh token with GitHub's OAuth token endpoint. Credentials
 * and grant parameters are sent in the request body (never the URL) and the JSON
 * response is requested explicitly.
 * @async @function fetchGitHubToken
 * @param {string} clientId The GitHub App client ID.
 * @param {string} clientSecret The GitHub App client secret.
 * @param {Record<string, string>} params Grant-specific parameters (`code` or `refresh_token` + `grant_type`).
 * @returns {Promise<GitHubTokenResponse>} A promise that resolves to the token response.
 */
const fetchGitHubToken = async (
  clientId: string,
  clientSecret: string,
  params: Record<string, string>
): Promise<GitHubTokenResponse> => {
  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          ...params,
        }),
      }
    );
    return (await response.json()) as GitHubTokenResponse;
  } catch (error) {
    return { error: "request_failed", error_description: String(error) };
  }
};

/**
 * Middleware function to complete the OAuth code exchange and persist the resulting
 * tokens as secure cookies. Runs after the state check on `/github/callback`.
 * @async @function handleRefresh
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after handling token refresh.
 */
export const handleRefresh = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ): Promise<void> => {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const { code } = c.req.query();
    if (code) {
      const {
        error,
        error_description,
        access_token,
        expires_in,
        refresh_token,
        refresh_token_expires_in,
      } = await fetchGitHubToken(CLIENT_ID, CLIENT_SECRET, { code });
      if (refresh_token) {
        setToken(c, "refresh_token", refresh_token, refresh_token_expires_in);
      }
      if (access_token) {
        setToken(c, "access_token", access_token, expires_in);
        c.set("expires_in", expires_in || DEFAULT_EXPIRES_IN);
      } else {
        console.error("code exchange failed", error, error_description);
      }
    }
    await next();
  }
);

/**
 * Middleware function to handle user logout by unsetting refresh and access tokens.
 * @async @function handleLogout
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after handling access tokens.
 */
export const handleLogout = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ): Promise<void> => {
    unsetToken(c, "refresh_token");
    unsetToken(c, "access_token");
    await next();
  }
);
