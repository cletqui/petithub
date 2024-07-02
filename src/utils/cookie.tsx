import { Context, MiddlewareHandler, Next } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";

import { Bindings, Variables } from "..";

export const handleMaxId = (): MiddlewareHandler => {
  return async function handleMaxId(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const max_id = getCookie(c, "max_id", "secure");
    const MAX_ID = 822080279; // TODO TBU
    c.set("max_id", Number(max_id) || MAX_ID);
    await next();
  };
};

export const handleTokens = (): MiddlewareHandler => {
  return async function handleTokens(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const accessToken = getCookie(c, "access_token", "secure");
    const refreshToken = getCookie(c, "refresh_token", "secure");
    c.set("access_token", accessToken);
    c.set("refresh_token", refreshToken);
    await next();
  };
};

export const setCookieToken = (
  c: Context,
  name: string,
  value: string,
  expires: number
): void => {
  setCookie(c, name, value, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: expires,
    sameSite: "Strict",
    prefix: "secure",
  });
};

export const stateCookieOptions: CookieOptions = {
  path: "/github",
  secure: true,
  httpOnly: true,
  maxAge: 600,
  sameSite: "none",
  prefix: "secure",
};
