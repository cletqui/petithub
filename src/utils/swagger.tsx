import { Env } from "hono";
import { OpenAPIObjectConfigure, z } from "@hono/zod-openapi";

import { version } from "../../package.json";

/* SWAGGER */
export const swaggerDoc: OpenAPIObjectConfigure<Env, string> = {
  openapi: "3.1.0",
  info: {
    title: "API",
    version: version,
    description: "PetitHub - [GitHub](https://github.com/cletqui/petithub)",
    contact: {
      name: "cletqui",
      url: "https://github.com/cletqui/petithub/issues",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/license/MIT",
    },
  },
  servers: [
    { url: "http://localhost:5173/api", description: "API" }, // TODO
    { url: "https://petithub.pages.dev/api", description: "API" },
  ],
  tags: [
    {
      name: "API",
      description: "Default API",
    },
  ],
};

/* SCHEMAS */
export const ParamsSchema = z.object({
  id: z
    .string()
    .optional()
    .openapi({ param: { name: "id", in: "path" }, example: "1296269" }),
});

export const RepositorySchema = z
  .object({
    id: z.number().int().openapi({ example: 1296269 }),
    node_id: z.string().openapi({ example: "MDEwOlJlcG9zaXRvcnkxMjk2MjY5" }),
    name: z.string().openapi({ example: "Hello-World" }),
    full_name: z.string().openapi({ example: "octocat/Hello-World" }),
    owner: z
      .object({
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        login: z.string().openapi({ example: "octocat" }),
        id: z.number().int().openapi({ example: 1 }),
        node_id: z.string().openapi({ example: "MDQ6VXNlcjE=" }),
        avatar_url: z.string().url().openapi({
          example: "https://github.com/images/error/octocat_happy.gif",
        }),
        gravatar_id: z
          .string()
          .nullable()
          .optional()
          .openapi({ example: "41d064eb2195891e12d0413f63227ea7" }),
        url: z
          .string()
          .url()
          .openapi({ example: "https://api.github.com/users/octocat" }),
        html_url: z
          .string()
          .url()
          .openapi({ example: "https://github.com/octocat" }),
        followers_url: z.string().url().openapi({
          example: "https://api.github.com/users/octocat/followers",
        }),
        following_url: z.string().openapi({
          example:
            "https://api.github.com/users/octocat/following{/other_user}",
        }),
        gists_url: z.string().openapi({
          example: "https://api.github.com/users/octocat/gists{/gist_id}",
        }),
        starred_url: z.string().openapi({
          example:
            "https://api.github.com/users/octocat/starred{/owner}{/repo}",
        }),
        subscriptions_url: z.string().url().openapi({
          example: "https://api.github.com/users/octocat/subscriptions",
        }),
        organizations_url: z
          .string()
          .url()
          .openapi({ example: "https://api.github.com/users/octocat/orgs" }),
        repos_url: z
          .string()
          .url()
          .openapi({ example: "https://api.github.com/users/octocat/repos" }),
        events_url: z.string().openapi({
          example: "https://api.github.com/users/octocat/events{/privacy}",
        }),
        received_events_url: z.string().url().openapi({
          example: "https://api.github.com/users/octocat/received_events",
        }),
        type: z.string().openapi({ example: "User" }),
        site_admin: z.boolean(),
        starred_at: z
          .string()
          .optional()
          .openapi({ example: "2020-07-09T00:17:55Z" }),
      })
      .openapi("User"),
    private: z.boolean(),
    html_url: z
      .string()
      .url()
      .openapi({ example: "https://github.com/octocat/Hello-World" }),
    description: z
      .string()
      .nullable()
      .openapi({ example: "This your first repo!" }),
    fork: z.boolean(),
    url: z
      .string()
      .url()
      .openapi({ example: "https://api.github.com/repos/octocat/Hello-World" }),
    archive_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
    }),
    assignees_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
    }),
    blobs_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
    }),
    branches_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/branches{/branch}",
    }),
    collaborators_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
    }),
    comments_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/comments{/number}",
    }),
    commits_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/commits{/sha}",
    }),
    compare_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
    }),
    contents_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
    }),
    contributors_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/contributors",
    }),
    deployments_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/deployments",
    }),
    downloads_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/downloads",
    }),
    events_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/events",
    }),
    forks_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/forks",
    }),
    git_commits_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
    }),
    git_refs_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
    }),
    git_tags_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
    }),
    git_url: z
      .string()
      .openapi({ example: "git:github.com/octocat/Hello-World.git" }),
    issue_comment_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
    }),
    issue_events_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
    }),
    issues_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
    }),
    keys_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
    }),
    labels_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/labels{/name}",
    }),
    languages_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/languages",
    }),
    merges_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/merges",
    }),
    milestones_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/milestones{/number}",
    }),
    notifications_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
    }),
    pulls_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/pulls{/number}",
    }),
    releases_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/releases{/id}",
    }),
    ssh_url: z
      .string()
      .openapi({ example: "git@github.com:octocat/Hello-World.git" }),
    stargazers_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/stargazers",
    }),
    statuses_url: z.string().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
    }),
    subscribers_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/subscribers",
    }),
    subscription_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/subscription",
    }),
    tags_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/tags",
    }),
    teams_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/teams",
    }),
    trees_url: z.string().openapi({
      example:
        "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
    }),
    clone_url: z.string().optional(),
    mirror_url: z.string().nullable().optional(),
    hooks_url: z.string().url().openapi({
      example: "http://api.github.com/repos/octocat/Hello-World/hooks",
    }),
    svn_url: z.string().optional(),
    homepage: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    forks_count: z.number().int().optional(),
    stargazers_count: z.number().int().optional(),
    watchers_count: z.number().int().optional(),
    size: z.number().int().optional(),
    default_branch: z.string().optional(),
    open_issues_count: z.number().int().optional(),
    is_template: z.boolean().optional(),
    topics: z.array(z.string().optional()).optional(),
    has_issues: z.boolean().optional(),
    has_projects: z.boolean().optional(),
    has_wiki: z.boolean().optional(),
    has_pages: z.boolean().optional(),
    has_downloads: z.boolean().optional(),
    has_discussions: z.boolean().optional(),
    archived: z.boolean().optional(),
    disabled: z.boolean().optional(),
    visibility: z.string().optional(),
    pushed_at: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .openapi({ example: "2011-01-26T19:06:43Z" }),
    created_at: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .openapi({ example: "2011-01-26T19:01:12Z" }),
    updated_at: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .openapi({ example: "2011-01-26T19:14:43Z" }),
    permissions: z
      .object({
        admin: z.boolean().optional(),
        maintain: z.boolean().optional(),
        push: z.boolean().optional(),
        triage: z.boolean().optional(),
        pull: z.boolean().optional(),
      })
      .optional(),
    role_name: z.string().optional().openapi({ example: "admin" }),
    temp_clone_token: z.string().nullable().optional(),
    delete_branch_on_merge: z.boolean().optional(),
    subscribers_count: z.number().int().optional(),
    network_count: z.number().int().optional(),
    code_of_conduct: z
      .object({
        key: z.string().openapi({ example: "contributor_covenant" }),
        name: z.string().openapi({ example: "Contributor Covenant" }),
        url: z.string().url().openapi({
          example:
            "https://api.github.com/codes_of_conduct/contributor_covenant",
        }),
        body: z.string().nullable().optional(),
        html_url: z.string().url().nullable().openapi({
          example:
            "https://github.com/orgs/community/blob/main/code_of_conduct.md",
        }),
      })
      .optional(),
    license: z
      .object({
        key: z.string().openapi({ example: "mit" }),
        name: z.string().openapi({ example: "MIT License" }),
        spdx_id: z.string().nullable().optional().openapi({ example: "MIT" }),
        url: z
          .string()
          .url()
          .nullable()
          .openapi({ example: "https://api.github.com/licenses/mit" }),
        node_id: z.string().openapi({ example: "MDc6TGljZW5zZW1pdA==" }),
      })
      .nullable()
      .optional(),
    forks: z.number().int().optional(),
    open_issues: z.number().int().optional(),
    watchers: z.number().int().optional(),
    allow_forking: z.boolean().optional(),
    web_commit_signoff_required: z.boolean().optional(),
    security_and_analysis: z
      .object({
        advanced_security: z.object({
          status: z.enum(["enabled", "disabled"]),
        }),
        secret_scanning: z.object({
          status: z.enum(["enabled", "disabled"]),
        }),
        secret_scanning_push_protection: z.object({
          status: z.enum(["enabled", "disabled"]),
        }),
        dependabot_security_updates: z.object({
          status: z.enum(["enabled", "disabled"]),
        }),
      })
      .optional(),
  })
  .openapi("Repository");

export const ErrorSchema = z.object({ error: z.string() });
