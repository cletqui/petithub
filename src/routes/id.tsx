import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { handleTokens } from "../utils/tokens";
import { getMaxId, handleMaxId } from "../utils/octokit";
import { setCookie } from "hono/cookie";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(handleMaxId);
app.use(handleTokens);

/* ENDPOINTS */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const {
      max_id: { id, timestamp: old },
      access_token,
      octokit,
    } = c.var;
    let update = id;
    let timestamp = old;
    if (access_token) {
      try {
        update = await getMaxId(octokit, id);
        timestamp = Date.now();
      } catch (error) {
        console.error(error);
      }
    }
    setCookie(c, "max_id", JSON.stringify({ id: update, timestamp }), {
      path: "/",
      secure: true,
      httpOnly: false,
      maxAge: 31557600,
      sameSite: "Strict",
      prefix: "secure",
    });
    return c.json({ id: update, timestamp });
  }
);

export default app;
