import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { getMaxId, getOctokitInstance } from "../utils/octokit";
import { setCookie } from "hono/cookie";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { max_id, access_token } = c.var;
    const octokit = getOctokitInstance(c);
    const now = new Date().getTime();
    const id = access_token ? await getMaxId(octokit, max_id) : max_id;
    setCookie(c, "max_id", `${id}`, {
      path: "/",
      secure: true,
      httpOnly: false /* true */,
      maxAge: access_token ? 86400 : 600,
      sameSite: "Strict",
      prefix: "secure",
    });
    return c.json({ id, timestamp: now });
  }
);

export default app;
