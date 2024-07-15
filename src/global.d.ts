import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: {
        repository?: Promise<
          RestEndpointMethodTypes["repos"]["get"]["response"]["data"]
        >;
      }
    ): Response;
  }
}
