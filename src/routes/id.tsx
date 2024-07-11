import { Context, Hono, Env } from "hono";

import {} from "..";
import { handleTokens } from "../utils/tokens";
import { getMaxId, handleMaxId } from "../utils/octokit";
import { setCookie } from "hono/cookie";

/* APP */
const app = new Hono<Env>();

/* MIDDLEWARES */
app.use(handleMaxId);
app.use(handleTokens);

/* ENDPOINTS */
app.get("/", async (c: Context<Env>): Promise<Response> => {
  const {
    max_id: { id, timestamp: old },
    access_token,
    octokit,
  } = c.var;
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
});

export default app;
