import { Octokit } from "octokit";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

declare global {
  type RepositoriesResponse =
    RestEndpointMethodTypes["repos"]["listPublic"]["response"];
  type RepositoryResponse = RestEndpointMethodTypes["repos"]["get"]["response"];
  type UserResponse =
    RestEndpointMethodTypes["users"]["getAuthenticated"]["response"];
}

declare module "hono" {
  type Bindings = {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };

  type Variables = {
    max_id: { id: number; timestamp: number };
    access_token?: string;
    expires_in?: string;
    refresh_token?: string;
    state: string;
    octokit: Octokit;
  };

  type Env = { Bindings: Bindings; Variables: Variables };

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
