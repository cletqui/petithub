import { Context, Next } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { Bindings, Variables } from "..";
import { handleRefresh } from "./tokens";

/**
 * Middleware function to generate and set a state.
 * @async @function generateState
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c - The Context object.
 * @param {Next} next - The callback function to proceed to the next middleware.
 * @returns {Promise<void>} A promise that resolves after generating and setting the state.
 */
export const generateState = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) => {
    const state = generateRandomString();
    setCookie(c, "state", state, {
      path: "/github",
      secure: true,
      httpOnly: true,
      maxAge: 600,
      sameSite: "none",
      prefix: "secure",
    });
    c.set("state", state);
    await next();
  }
);

/**
 * Middleware function to handle state verification and refresh.
 * @async @function handleState
 * @param {Context<{ Bindings: Bindings; Variables: Variables }>} c The context object.
 * @param {Next} next The callback function to proceed to the next middleware.
 * @returns {Promise<Response | void>} A promise that resolves on refreshing access_tokens or creating the octokit.
 */
export const handleState = createMiddleware(
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ): Promise<Response | void> => {
    const secret = getCookie(c, "state", "secure");
    const { state } = c.req.query();
    if (secret === state) {
      await handleRefresh(c, next);
    } else {
      console.error(
        `State mismatched: expected ${secret} and received ${state}`
      );
      return c.redirect("/", 302);
    }
  }
);

/**
 * Generates a random string using Math.random() and Date.now().
 * @function generateRandomString
 * @returns {string} A randomly generated string.
 */
const generateRandomString = (): string => {
  return Math.floor(Math.random() * Date.now()).toString(36);
};
