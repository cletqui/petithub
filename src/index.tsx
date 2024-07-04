import { Context, Hono } from "hono";
import { Suspense } from "hono/jsx";
import { logger } from "hono/logger";

import { renderer, Loader, RepositoryContainer } from "./utils/renderer";
import { getOctokitInstance, handleMaxId } from "./utils/octokit";
import { handleTokens, refreshToken } from "./utils/tokens";

import api from "./routes/api";
import github from "./routes/github";
import welcome from "./routes/welcome";
import template from "./routes/template";
import id from "./routes/id";

/* TYPES */
export type Bindings = {
  GITHUB_TOKEN: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
};

export type Variables = {
  max_id: { id: number; timestamp: number };
  access_token?: string;
  expires_in?: string;
  refresh_token?: string;
  state: string;
};

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* MIDDLEWARES */
app.use(logger());
app.use(renderer);
app.use("/", handleMaxId());
app.use("/", handleTokens());
app.use("/", refreshToken());

/* ROUTES */
app.route("/api", api);
app.route("/github", github);
app.route("/welcome", welcome);
app.route("/template", template);
app.route("/id", id);

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
        <RepositoryContainer octokit={octokit} maxId={max_id.id} />
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
