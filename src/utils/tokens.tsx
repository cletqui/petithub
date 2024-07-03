import { Context, MiddlewareHandler, Next } from "hono";

import { Bindings, Variables } from "..";
import { getCookie, setCookie } from "hono/cookie";

export const handleTokens = (): MiddlewareHandler => {
  return async function handleTokens(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const accessToken = getCookie(c, "access_token", "secure");
    const refreshToken = getCookie(c, "refresh_token", "secure");
    c.set("access_token", accessToken);
    c.set("refresh_token", refreshToken);
    console.log(c.var);
    await next();
  };
};

export const refreshToken = (): MiddlewareHandler => {
  return async function refreshToken(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const { access_token, refresh_token } = c.var;
    const { path } = c.req;
    if (refresh_token && !access_token) {
      return c.redirect(
        `/github/access_token?refresh_token=${refresh_token}&callback_url=${path}`,
        302
      );
    }
    await next();
  };
};

const setToken = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  key: keyof Variables,
  value: string,
  expires: string
) => {
  c.set(key, value);
  setCookie(c, key, value, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: Number(expires),
    sameSite: "Strict",
    prefix: "secure",
  });
};

export const handleRefresh = (): MiddlewareHandler => {
  const fetchRefreshToken = async (
    clientId: string,
    clientSecret: string,
    code: string
  ) => {
    const response = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`,
      { method: "POST" }
    );
    const tokens = await response.text();
    const responseParams = new URLSearchParams(tokens);
    return Object.fromEntries(responseParams); // TODO implement interface {error, error_description, access_token, expires_in}
  };

  return async function handleRefresh(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const { code } = c.req.query();
    const {
      error,
      error_description,
      refresh_token,
      refresh_token_expires_in,
    } = await fetchRefreshToken(CLIENT_ID, CLIENT_SECRET, code);
    if (refresh_token) {
      setToken(c, "refresh_token", refresh_token, refresh_token_expires_in);
    } else {
      console.error(error, error_description);
    }
    await next();
  };
};

export const handleAccess = (): MiddlewareHandler => {
  const fetchAccessToken = async (
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ) => {
    const response = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`,
      { method: "POST" }
    );
    const tokens = await response.text();
    const responseParams = new URLSearchParams(tokens);
    return Object.fromEntries(responseParams); // TODO implement interface {error, error_description, access_token, expires_in}
  };

  return async function handleAccess(
    c: Context<{ Bindings: Bindings; Variables: Variables }>,
    next: Next
  ) {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const { refresh_token, access_token, expires_in } = c.req.query();
    if (access_token) {
      setToken(c, "access_token", access_token, expires_in);
    } else if (refresh_token) {
      const {
        error,
        error_description,
        access_token: update,
        expires_in: expires,
      } = await fetchAccessToken(CLIENT_ID, CLIENT_SECRET, refresh_token);
      if (update) {
        setToken(c, "access_token", update, expires);
      } else {
        console.error(error, error_description);
        return c.redirect("/github/login", 302);
      }
    }
    await next();
  };
};
