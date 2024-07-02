import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { setCookieToken } from "../utils/cookie";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get(
  "/login",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { CLIENT_ID } = c.env;
    const { state } = c.var;
    const redirect_url = new URL(c.req.url);
    redirect_url.pathname = "/github/callback";
    const redirect_uri = redirect_url.toString();
    return c.redirect(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&state=${state}`,
      302
    );
  }
);

app.get(
  "/callback",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const { state: secret } = c.var;
    const code = c.req.query("code");
    const state = c.req.query("state");
    if (state === secret) {
      const response = await fetch(
        `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}`,
        { method: "POST" }
      );
      const tokens = await response.text();
      const responseParams = new URLSearchParams(tokens);
      const error = responseParams.get("error");
      const refreshToken = responseParams.get("refresh_token");
      const refreshTokenExpiresIn = responseParams.get(
        "refresh_token_expires_in"
      );
      if (refreshToken && refreshTokenExpiresIn) {
        setCookieToken(
          c,
          "refresh_token",
          refreshToken,
          Number(refreshTokenExpiresIn)
        );
      } else if (error) {
        const errorDescription = responseParams.get("error_description");
        console.error(error, errorDescription);
      }
      return c.redirect(
        `/github/access_token?${tokens}&callback_url=/welcome`,
        302
      );
    } else {
      console.error(
        `State mismatched: expected ${secret} and received ${state}`
      );
      return c.text(`State mismatched`, 500);
    }
  }
); // TODO fix oauth workflow (send tokens in a new URL as query params)

app.get(
  "/access_token",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const { CLIENT_ID, CLIENT_SECRET } = c.env;
    const callbackUrl = c.req.query("callback_url");
    const refreshToken = c.req.query("refresh_token");
    const accessToken = c.req.query("access_token");
    const expiresIn = c.req.query("expires_in");
    if (accessToken) {
      setCookieToken(c, "access_token", accessToken, Number(expiresIn));
    } else if (refreshToken) {
      const response = await fetch(
        `https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token`,
        { method: "POST" }
      );
      const tokens = await response.text();
      const responseParams = new URLSearchParams(tokens);
      const error = responseParams.get("error");
      const refreshedAccessToken = responseParams.get("access_token");
      const refreshedExpiresIn = responseParams.get("expires_in");
      if (refreshedAccessToken) {
        setCookieToken(
          c,
          "access_token",
          refreshedAccessToken,
          Number(refreshedExpiresIn)
        );
      } else if (error) {
        const errorDescription = responseParams.get("error_description");
        console.error(error, errorDescription);
      }
      return c.redirect("/github/login", 302);
    } else {
      return c.redirect("/login", 302);
    }
    return c.redirect(callbackUrl ? callbackUrl : "/welcome", 302); // TODO redirect with access_token to display account on /welcome
  }
);

export default app;
