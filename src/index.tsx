import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { logger } from "hono/logger";

import { renderer, Loader, RepositoryContainer, Login } from "./utils/renderer";
import { getOctokitInstance } from "./utils/octokit";
import { handleMaxId, handleTokens } from "./utils/cookie";
import { generateState, handleState } from "./utils/state";

import api from "./routes/api";
import id from "./routes/id";
import template from "./routes/template";
import petithub from "./routes/petithub";
import github from "./routes/github";
import welcome from "./routes/welcome";

/* TYPES */
export type Bindings = {
  GITHUB_TOKEN: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

export type Variables = {
  max_id: number;
  access_token?: string;
  refresh_token?: string;
  state?: string;
};

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(logger());
app.use(renderer);
app.use(handleMaxId());
app.use(handleTokens());
app.use("/", async (c, next) => {
  const { access_token, refresh_token } = c.var;
  console.log(access_token, refresh_token);
  if (!access_token) {
    // TODO allow some use without access_token and only redirect when out of free API usage
    if (!refresh_token) {
      // return c.redirect("/login", 302);
    } else {
      return c.redirect(
        `/github/access_token?refresh_token=${refresh_token}&callback_url=/`
      );
    }
  }
  await next();
}); // TODO handle token verification
app.use("/github/login", generateState());
app.use("/github/callback", handleState());

/* ROUTES */
app.route("/api", api);
app.route("/id", id);
app.route("/template", template);
app.route("/petithub", petithub);
app.route("/github", github);
app.route("/welcome", welcome);

app.get(
  "/login",
  (c: Context<{ Bindings: Bindings; Variables: Variables }>): Response => {
    return c.render(<Login message="" />, {
      title: "PetitHub - login",
    });
  }
); // TODO suppress login route and add specific button to login

/* ROOT */
app.get(
  "/",
  async (
    c: Context<{ Bindings: Bindings; Variables: Variables }>
  ): Promise<Response> => {
    const octokit = getOctokitInstance(c);
    const { max_id } = c.var;
    return c.render(
      <Suspense fallback={<Loader />}>
        <RepositoryContainer octokit={octokit} maxId={max_id} />
      </Suspense>,
      { title: "PetitHub" } // TODO change this title dynamically
    );
  }
);

/* DEFAULT */
app.get("*", (c) => {
  return c.redirect("/", 301);
});

export default app;
