import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { handleTokens, refreshToken } from "../utils/tokens";
import { getMaxId, getOctokitInstance } from "../utils/octokit";
import { setCookie } from "hono/cookie";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(handleTokens());
app.use(refreshToken());

/* ENDPOINTS */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const {
      max_id: { id, timestamp: old },
      access_token,
    } = c.var;
    const octokit = getOctokitInstance(c);
    const update = access_token ? await getMaxId(octokit, id) : id;
    const timestamp = access_token ? new Date().getTime() : old;
    setCookie(c, "max_id", `{ "id": ${update}, "timestamp": ${timestamp} }`, {
      path: "/",
      secure: true,
      httpOnly: false, // true
      maxAge: 31557600,
      sameSite: "Strict",
      prefix: "secure",
    });
    return c.json({ id: update, timestamp: timestamp });
  }
);

export default app;
