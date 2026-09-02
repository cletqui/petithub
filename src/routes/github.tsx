import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { generateState, handleState } from "../utils/state";
import { handleLogout } from "../utils/tokens";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* HELPERS */
const safePath = (path: string | undefined): string =>
  path && path.startsWith("/") && !path.startsWith("//") ? path : "/";

/* MIDDLEWARES */
app.use("/login", generateState);
app.use("/callback", handleState);
app.use("/logout", handleLogout);

/* ENDPOINTS */
app.get(
  "/login",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { CLIENT_ID } = c.env;
    const { state } = c.var;
    const redirect_url = new URL(c.req.url);
    redirect_url.pathname = "/github/callback";
    redirect_url.search = "";
    const searchParams = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirect_url.toString(),
      state,
    });
    return c.redirect(
      `https://github.com/login/oauth/authorize?${searchParams.toString()}`,
      302
    );
  }
);

app.get(
  "/callback",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    return c.redirect(safePath(c.req.query("callback_url")), 302);
  }
);

app.get(
  "/logout",
  async (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    return c.redirect(safePath(c.req.query("callback_url")), 302);
  }
);

export default app;
