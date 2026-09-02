import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { Repository } from "../components/repository";
import { pageCsp } from "../utils/headers";

/* A static snapshot of this repository, so the full UI renders without calling the
   GitHub API — for design work, offline debugging and screenshots.
   Mounted only in dev (see src/index.tsx); never deployed. */
const SAMPLE = {
  id: 811042081,
  name: "petithub",
  full_name: "cletqui/petithub",
  owner: {
    login: "cletqui",
    avatar_url: "https://avatars.githubusercontent.com/u/43882700?v=4",
    html_url: "https://github.com/cletqui",
  },
  description: "Explore random obscure GitHub repositories 🌌",
  html_url: "https://github.com/cletqui/petithub",
  created_at: "2024-06-05T20:37:42Z",
  updated_at: "2026-09-02T11:21:37Z",
  pushed_at: "2026-09-02T11:20:14Z",
  homepage: "https://petithub.pages.dev/",
  stargazers_count: 13,
  language: "TypeScript",
  forks_count: 0,
  license: { spdx_id: "MIT", name: "MIT License", key: "mit" },
  topics: [
    "cloudflare-pages",
    "github",
    "hono",
    "honojs",
    "octokit",
    "petittube",
    "random",
    "repository",
  ],
  visibility: "public",
  default_branch: "main",
  subscribers_count: 1,
};

type RepositoryData = Awaited<Parameters<typeof Repository>[0]["repository"]>;

/**
 * Builds the /__preview sub-app. Kept as a factory (no module-level side effects)
 * so a production build tree-shakes the whole route away.
 */
export const previewApp = (): Hono<{
  Bindings: Bindings;
  Variables: Variables;
}> => {
  const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
  app.use(pageCsp);

  /* Query flags: ?archived=1  ?org=1  ?noforking=1 */
  app.get("/", (c: Context<{ Bindings: Bindings; Variables: Variables }>) => {
    const q = c.req.query();
    const sample = {
      ...SAMPLE,
      archived: q.archived === "1",
      allow_forking: q.noforking !== "1",
      owner: { ...SAMPLE.owner, type: q.org === "1" ? "Organization" : "User" },
    } as unknown as RepositoryData;
    return c.render(<Repository repository={Promise.resolve(sample)} />, {
      repository: Promise.resolve(sample),
    });
  });

  return app;
};
