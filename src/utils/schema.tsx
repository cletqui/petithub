import { z } from "@hono/zod-openapi";

/* SCHEMAS */
export const ParamsSchema = z.object({
  id: z
    .string()
    .optional()
    .openapi({
      param: { name: "id", in: "path" },
      example: "1296269",
      description: "Repository ID",
    }),
});

const SimpleUserSchema = z
  .object({
    name: z.string().nullable().optional().openapi({ example: null }),
    email: z.string().nullable().optional().openapi({ example: null }),
    login: z.string().openapi({ example: "octocat" }),
    id: z.number().int().openapi({ example: 1 }),
    node_id: z.string().openapi({ example: "MDQ6VXNlcjE=" }),
    avatar_url: z.string().url().openapi({
      example: "https://github.com/images/error/octocat_happy.gif",
    }),
    gravatar_id: z
      .string()
      .nullable()
      .openapi({ example: "41d064eb2195891e12d0413f63227ea7" }),
    url: z
      .string()
      .url()
      .openapi({ example: "https://api.github.com/users/octocat" }),
    html_url: z
      .string()
      .url()
      .openapi({ example: "https://github.com/octocat" }),
    followers_url: z
      .string()
      .url()
      .openapi({ example: "https://api.github.com/users/octocat/followers" }),
    following_url: z.string().openapi({
      example: "https://api.github.com/users/octocat/following{/other_user}",
    }),
    gists_url: z.string().openapi({
      example: "https://api.github.com/users/octocat/gists{/gist_id}",
    }),
    starred_url: z.string().openapi({
      example: "https://api.github.com/users/octocat/starred{/owner}{/repo}",
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
    site_admin: z.boolean().openapi({ example: false }),
    starred_at: z
      .string()
      .optional()
      .openapi({ example: '"2020-07-09T00:17:55Z"' }),
  })
  .strict()
  .openapi({
    example: {
      login: "octocat",
      id: 1,
      node_id: "MDQ6VXNlcjE=",
      avatar_url: "https://github.com/images/error/octocat_happy.gif",
      gravatar_id: "41d064eb2195891e12d0413f63227ea7",
      url: "https://api.github.com/users/octocat",
      html_url: "https://github.com/octocat",
      followers_url: "https://api.github.com/users/octocat/followers",
      following_url:
        "https://api.github.com/users/octocat/following{/other_user}",
      gists_url: "https://api.github.com/users/octocat/gists{/gist_id}",
      starred_url:
        "https://api.github.com/users/octocat/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/octocat/subscriptions",
      organizations_url: "https://api.github.com/users/octocat/orgs",
      repos_url: "https://api.github.com/users/octocat/repos",
      events_url: "https://api.github.com/users/octocat/events{/privacy}",
      received_events_url:
        "https://api.github.com/users/octocat/received_events",
      type: "User",
      site_admin: false,
      starred_at: '"2020-07-09T00:17:55Z"',
    },
  });

export const RepositorySchema = z.object({
  id: z.number().int().openapi({ example: 1296269 }),
  node_id: z.string().openapi({ example: "MDEwOlJlcG9zaXRvcnkxMjk2MjY5" }),
  name: z.string().openapi({ example: "Hello-World" }),
  full_name: z.string().openapi({ example: "octocat/Hello-World" }),
  owner: SimpleUserSchema,
  private: z.boolean().openapi({ example: false }),
  html_url: z
    .string()
    .url()
    .openapi({ example: "https://github.com/octocat/Hello-World" }),
  description: z
    .string()
    .nullable()
    .openapi({ example: "This your first repo!" }),
  fork: z.boolean().openapi({ example: false }),
  url: z
    .string()
    .url()
    .openapi({ example: "https://api.github.com/repos/octocat/Hello-World" }),
  archive_url: z.string().openapi({
    example:
      "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
  }),
  assignees_url: z.string().openapi({
    example: "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
  }),
  blobs_url: z.string().openapi({
    example: "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
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
    example: "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
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
    example: "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
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
    example: "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
  }),
  clone_url: z
    .string()
    .url()
    .openapi({ example: "https://github.com/octocat/Hello-World.git" }),
  mirror_url: z
    .string()
    .url()
    .nullable()
    .openapi({ example: "git:git.example.com/octocat/Hello-World" }),
  hooks_url: z.string().url().openapi({
    example: "http://api.github.com/repos/octocat/Hello-World/hooks",
  }),
  svn_url: z
    .string()
    .url()
    .openapi({ example: "https://svn.github.com/octocat/Hello-World" }),
  homepage: z
    .string()
    .url()
    .nullable()
    .openapi({ example: "https://github.com" }),
  language: z.string().nullable().openapi({ example: null }),
  forks_count: z.number().int().openapi({ example: 9 }),
  stargazers_count: z.number().int().openapi({ example: 80 }),
  watchers_count: z.number().int().openapi({ example: 80 }),
  size: z.number().int().openapi({ example: 108 }),
  default_branch: z.string().openapi({ example: "master" }),
  open_issues_count: z.number().int().openapi({ example: 0 }),
  is_template: z.boolean().optional().openapi({ example: false }),
  topics: z
    .array(z.string())
    .optional()
    .openapi({ example: ["octocat", "atom", "electron", "api"] }),
  has_issues: z.boolean().openapi({ example: true }),
  has_projects: z.boolean().openapi({ example: true }),
  has_wiki: z.boolean().openapi({ example: true }),
  has_pages: z.boolean().openapi({ example: false }),
  has_downloads: z.boolean().optional().openapi({ example: true }),
  has_discussions: z.boolean().optional().openapi({ example: false }),
  archived: z.boolean().openapi({ example: false }),
  disabled: z.boolean().openapi({ example: false }),
  visibility: z.string().optional().openapi({ example: "public" }),
  pushed_at: z.string().openapi({ example: "2011-01-26T19:06:43Z" }),
  created_at: z.string().openapi({ example: "2011-01-26T19:01:12Z" }),
  updated_at: z.string().openapi({ example: "2011-01-26T19:14:43Z" }),
  permissions: z
    .object({
      admin: z.boolean().openapi({ example: false }),
      maintain: z.boolean().optional().openapi({ example: false }),
      push: z.boolean().openapi({ example: false }),
      triage: z.boolean().optional().openapi({ example: false }),
      pull: z.boolean().openapi({ example: true }),
    })
    .optional()
    .openapi({ example: { admin: false, push: false, pull: true } }),
  role_name: z.string().nullable().optional().openapi({ example: "read" }),
  temp_clone_token: z.string().nullable().optional().openapi({ example: null }),
  delete_branch_on_merge: z.boolean().optional().openapi({ example: false }),
  subscribers_count: z.number().int().optional().openapi({ example: 42 }),
  network_count: z.number().int().optional().openapi({ example: 0 }),
  code_of_conduct: z
    .object({
      key: z.string().openapi({ example: "citizen_code_of_conduct" }),
      name: z.string().openapi({ example: "Citizen Code of Conduct" }),
      url: z.string().url().openapi({
        example:
          "https://github.com/octocat/Hello-World/blob/master/CODE_OF_CONDUCT.md",
      }),
      body: z.string().optional().openapi({
        example:
          "We are committed to providing a welcoming and inspiring community for all...",
      }),
      html_url: z.string().url().nullable().openapi({
        example:
          "https://github.com/octocat/Hello-World/blob/master/CODE_OF_CONDUCT.md",
      }),
    })
    .optional()
    .openapi({
      example: {
        key: "citizen_code_of_conduct",
        name: "Citizen Code of Conduct",
        url: "https://github.com/octocat/Hello-World/blob/master/CODE_OF_CONDUCT.md",
        body: "We are committed to providing a welcoming and inspiring community for all...",
        html_url:
          "https://github.com/octocat/Hello-World/blob/master/CODE_OF_CONDUCT.md",
      },
    }),
  license: z
    .object({
      key: z.string().openapi({ example: "mit" }),
      name: z.string().openapi({ example: "MIT License" }),
      spdx_id: z.string().nullable().openapi({ example: "MIT" }),
      url: z
        .string()
        .url()
        .nullable()
        .openapi({ example: "https://api.github.com/licenses/mit" }),
      node_id: z.string().openapi({ example: "MDc6TGljZW5zZW1pdA==" }),
    })
    .nullable()
    .optional()
    .openapi({
      example: {
        key: "mit",
        name: "MIT License",
        spdx_id: "MIT",
        url: "https://api.github.com/licenses/mit",
        node_id: "MDc6TGljZW5zZW1pdA==",
      },
    }),
  forks: z.number().int().optional().openapi({ example: 9 }),
  open_issues: z.number().int().optional().openapi({ example: 0 }),
  watchers: z.number().int().optional().openapi({ example: 80 }),
  allow_forking: z.boolean().optional().openapi({ example: true }),
  web_commit_signoff_required: z
    .boolean()
    .optional()
    .openapi({ example: false }),
});

export const ErrorSchema = z.object({
  message: z.string(),
});
