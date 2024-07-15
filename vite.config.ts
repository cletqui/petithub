import { defineConfig } from "vite";
import build from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import cloudflareAdapter from "@hono/vite-dev-server/cloudflare";

export default defineConfig({
  plugins: [
    build(),
    devServer({
      adapter: cloudflareAdapter,
      entry: "src/index.tsx",
    }),
  ],
  optimizeDeps: { include: ["hono", "octokit"] },
  test: {
    include: ["**/*.test.tsx"],
    globals: true,
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.toml",
        },
      },
    },
  },
});
