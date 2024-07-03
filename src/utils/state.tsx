import { Context, MiddlewareHandler, Next } from "hono";
import { setCookie, getCookie } from "hono/cookie";

import { Bindings, Variables } from "..";

export const generateState = (): MiddlewareHandler => {
  return async function generateState(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
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
  };
};

export const handleState = (): MiddlewareHandler => {
  return async function handleState(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const secret = getCookie(c, "state", "secure");
    const { state } = c.req.query();
    if (secret === state) {
      await next();
    } else {
      console.error(
        `State mismatched: expected ${secret} and received ${state}`
      );
      return c.redirect("/", 302);
    }
  };
};

const generateRandomString = (): string => {
  return Math.floor(Math.random() * Date.now()).toString(36);
};
