import { Context, MiddlewareHandler, Next } from "hono";
import { setCookie, getCookie } from "hono/cookie";

import { Bindings, Variables } from "..";
import { stateCookieOptions } from "./cookie";

export const generateState = (): MiddlewareHandler => {
  return async function generateState(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const state = generateRandomString();
    setCookie(c, "state", state, stateCookieOptions);
    c.set("state", state);
    await next();
  };
};

export const handleState = (): MiddlewareHandler => {
  return async function handleState(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const state = getCookie(c, "state", "secure");
    c.set("state", state);
    await next();
  };
};

const generateRandomString = (): string => {
  return Math.floor(Math.random() * Date.now()).toString(36);
};
