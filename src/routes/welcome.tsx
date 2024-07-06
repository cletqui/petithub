import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { Welcome } from "../components/landing";
import { getOctokitInstance } from "../utils/octokit";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* ENDPOINTS */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const { access_token } = c.req.query();
    const octokit = getOctokitInstance(c, access_token);
    c.set("octokit", octokit);
    // deleteCookie(c, "state", stateCookieOptions); // TODO fix cookie storage/deletion
    return c.redirect("/");
    return c.render(<Welcome />);
  }
); // TODO improve UI

export default app;
