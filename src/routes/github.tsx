import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { generateState, handleState } from "../utils/state";
import { handleAccess, handleRefresh } from "../utils/tokens";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use("/login", generateState());
app.use("/callback", handleState());
app.use("/callback", handleRefresh());
app.use("/access_token", handleAccess());

/* ENDPOINTS */
app.get(
  "/login",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { CLIENT_ID } = c.env;
    const { state } = c.var;
    const { url } = c.req;
    const redirect_url = new URL(url);
    redirect_url.pathname = "/github/callback";
    const searchParams = new URLSearchParams();
    searchParams.append("client_id", CLIENT_ID);
    searchParams.append("redirect_uri", redirect_url.toString());
    searchParams.append("state", state);
    return c.redirect(
      `https://github.com/login/oauth/authorize?${searchParams.toString()}`,
      302
    );
  }
);

app.get(
  "/callback",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const { refresh_token, access_token } = c.var;
    const searchParams = new URLSearchParams();
    refresh_token && searchParams.append("refresh_token", refresh_token);
    access_token && searchParams.append("access_token", access_token);
    access_token && searchParams.append("expires_in", `28800`);
    searchParams.append("callback_url", "/welcome");
    return c.redirect(`/github/access_token?${searchParams.toString()}`, 302);
  }
);

app.get(
  "/access_token",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const { callback_url } = c.req.query();
    return c.redirect(callback_url || "/welcome", 302);
  }
);

export default app;
