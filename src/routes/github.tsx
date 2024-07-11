import { Context, Hono, Env } from "hono";

import { generateState, handleState } from "../utils/state";
import { handleAccess, handleLogout } from "../utils/tokens";

/* APP */
const app = new Hono<Env>();

/* MIDDLEWARES */
app.use("/login", generateState);
app.use("/callback", handleState);
app.use("/access_token", handleAccess);
app.use("/logout", handleLogout);

/* ENDPOINTS */
app.get("/login", async (c: Context<Env>): Promise<Response> => {
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
});

app.get("/callback", async (c: Context<Env>) => {
  const { refresh_token, access_token, expires_in } = c.var;
  const searchParams = new URLSearchParams();
  refresh_token && searchParams.append("refresh_token", refresh_token);
  access_token && searchParams.append("access_token", access_token);
  expires_in && searchParams.append("expires_in", expires_in);
  searchParams.append("callback_url", "/");
  return c.redirect(`/github/access_token?${searchParams.toString()}`, 302);
});

app.get("/access_token", async (c: Context<Env>) => {
  const { callback_url } = c.req.query();
  return c.redirect(callback_url || "/", 302);
});

app.get("/logout", async (c: Context<Env>) => {
  const { callback_url } = c.req.query();
  return c.redirect(callback_url || "/", 302);
});

export default app;
