import { Context, Next, Env, Variables } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { handleOctokit } from "./octokit";

/**
 * Middleware function to handle tokens, refresh access_token if needed and handle the octokit.
 * @async @function handleTokens
 * @param {Context<Env>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<Response | void>} A promise that resolves on refreshing access_tokens or creating the octokit.
 */
export const handleTokens = createMiddleware(
  async (c: Context<Env>, next: Next): Promise<Response | void> => {
    const accessToken = getCookie(c, "access_token", "secure");
    const refreshToken = getCookie(c, "refresh_token", "secure");
    c.set("access_token", accessToken);
    c.set("refresh_token", refreshToken);
    if (refreshToken && !accessToken) {
      const { path } = c.req;
      return c.redirect(
        `/github/access_token?refresh_token=${refreshToken}&callback_url=${path}`,
        302
      );
    }
    await handleOctokit(c, next);
  }
);

/**
 * Sets a token in the context and as a secure, HTTP-only cookie with specified attributes.
 * @function setToken
 * @param {Context<Env>} c - The Context object.
 * @param {keyof Variables} key - The key to set the token value in the context and cookie.
 * @param {string} value - The value of the token to be set.
 * @param {string} expires - The expiration time of the token in seconds.
 */
const setToken = (
  c: Context<Env>,
  key: keyof Variables,
  value: string,
  expires: string
): void => {
  c.set(key, value);
  setCookie(c, key, value, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: Number(expires),
    sameSite: "Lax", // Strict
    prefix: "secure",
  });
};

/**
 * Function to unset a token by setting its value to undefined and deleting its corresponding cookie.
 * @function unsetToken
 * @param {Context<Env>} c - The Context object.
 * @param {keyof Variables} key - The key of the token to unset from the Variables object.
 */
export const unsetToken = (c: Context<Env>, key: keyof Variables): void => {
  c.set(key, undefined);
  deleteCookie(c, key, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "Lax", // Strict
    prefix: "secure",
  });
};

/**
 * Asynchronously fetches a refresh token using a code.
 * @async @function fetchRefreshToken
 * @param {string} clientId The GitHub App client ID.
 * @param {string} clientSecret The GitHub App client secret.
 * @param {string} code The code for authentication.
 * @returns {Promise<Object>} A promise that resolves to an object containing the refresh token information.
 */
const fetchRefreshToken = async (
  clientId: string,
  clientSecret: string,
  code: string
): Promise<any> => {
  const response = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`,
    { method: "POST" }
  );
  const tokens = await response.text();
  const responseParams = new URLSearchParams(tokens);
  return Object.fromEntries(responseParams); // TODO implement interface (any)
};

/**
 * Middleware function to handle token refresh by fetching new tokens.
 * @async @function handleRefresh
 * @param {Context<Env>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after handling token refresh.
 */
export const handleRefresh = createMiddleware(
  async (c: Context<Env>, next: Next): Promise<void> => {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const { code } = c.req.query();
    const {
      error,
      error_description,
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
    } = await fetchRefreshToken(CLIENT_ID, CLIENT_SECRET, code);
    if (refresh_token) {
      setToken(c, "refresh_token", refresh_token, refresh_token_expires_in);
    }
    if (access_token) {
      c.set("access_token", access_token);
      c.set("expires_in", expires_in || "28800");
    } else {
      console.error(error, error_description);
    }
    await next();
  }
);

/**
 * Asynchronously fetches an access token using a refresh token.
 * @async @function fetchAccessToken
 * @param {string} clientId The GitHub App client ID.
 * @param {string} clientSecret The GitHub App client secret.
 * @param {string} refreshToken The refresh token to refresh.
 * @returns {Promise<Object>} A promise that resolves to an object containing the access token information.
 */
const fetchAccessToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<any> => {
  const response = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`,
    { method: "POST" }
  );
  const tokens = await response.text();
  const responseParams = new URLSearchParams(tokens);
  return Object.fromEntries(responseParams); // TODO implement interface (any)
};

/**
 * Middleware function to handle access tokens based on the presence of access_token or refresh_token in the request query.
 * @async @function handleAccess
 * @param {Context<Env>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<Response | void>} A promise that resolves after handling access tokens and potentially redirecting.
 */
export const handleAccess = createMiddleware(
  async (c: Context<Env>, next: Next): Promise<Response | void> => {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const { refresh_token, access_token, expires_in } = c.req.query();
    if (access_token) {
      setToken(c, "access_token", access_token, expires_in || "28800");
    } else if (refresh_token) {
      const {
        error,
        error_description,
        access_token: update,
        expires_in: expires,
      } = await fetchAccessToken(CLIENT_ID, CLIENT_SECRET, refresh_token);
      if (update) {
        setToken(c, "access_token", update, expires);
        c.set("expires_in", expires);
      } else {
        console.error(error, error_description);
        return c.redirect("/github/login", 302);
      }
    }
    await next();
  }
);

/**
 * Middleware function to handle user logout by unsetting refresh and access tokens.
 * @async @function handleLogout
 * @param {Context<Env>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after handling access tokens.
 */
export const handleLogout = createMiddleware(
  async (c: Context<Env>, next: Next): Promise<void> => {
    unsetToken(c, "refresh_token");
    unsetToken(c, "access_token");
    await next();
  }
);
