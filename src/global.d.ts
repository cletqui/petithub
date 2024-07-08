import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

declare global {
  type RepositoriesResponse =
    RestEndpointMethodTypes["repos"]["listPublic"]["response"];
  type RepositoryResponse = RestEndpointMethodTypes["repos"]["get"]["response"];
  type UserResponse =
    RestEndpointMethodTypes["users"]["getAuthenticated"]["response"];
}

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
