import { jsxRenderer } from "hono/jsx-renderer";
import { PropsWithChildren } from "hono/jsx";
import { JSX } from "hono/jsx/jsx-runtime";
import { HtmlEscapedString } from "hono/utils/html";
import { Octokit } from "@octokit/core";

import { getRandomRepository } from "./octokit";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private?: boolean;
  owner: {
    login: string;
    avatar_url?: string;
    html_url: string;
  };
  fork: boolean;
  description: string | null;
  html_url: string;
  homepage?: string | null;
  size?: number;
  stargazers_count?: number;
  watchers_count?: number;
  language?: string | null;
  forks_count?: number;
  topics?: string[];
  visibility?: string;
  open_issues?: number;
  default_branch?: string;
  subscribers_count?: number;
}

export const RepositoryContainer = async ({
  octokit,
  maxId,
}: {
  octokit: Octokit;
  maxId: number;
}): Promise<HtmlEscapedString> => {
  const repository = await getRandomRepository(octokit, maxId);
  /* const { full_name } = repository;
  const title = `PetitHub - ${full_name}`; */
  return <Container repository={repository} />;
};

export const Loader = (): JSX.Element => {
  return (
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
  );
};

export const Container = ({
  repository,
}: {
  repository: Repository;
}): JSX.Element => {
  const {
    id,
    name,
    full_name,
    private: private_status,
    owner: { login, avatar_url, html_url: owner_html_url },
    description,
    html_url,
    homepage,
    size,
    stargazers_count,
    watchers_count,
    language,
    forks_count,
    topics,
    visibility,
    open_issues,
    default_branch,
    subscribers_count,
  } = repository;
  console.log(repository);
  return (
    <div class="container">
      <h2>
        <a target="_blank" rel="noopener noreferrer" href={owner_html_url}>
          <img class="avatar" src={avatar_url} alt="avatar_url" />
        </a>
        <a
          class="title"
          target="_blank"
          rel="noopener noreferrer"
          href={html_url}
        >
          {name}
        </a>
        <span class="visibility-badge">{visibility}</span>
      </h2>
      <h3>
        {full_name} <i>({id})</i>
      </h3>
      <p>{description}</p>
      <a
        class="repo-link"
        target="_blank"
        rel="noopener noreferrer"
        href={html_url}
      >
        {"Visit Repository"}
      </a>
      <p>
        {"by "}
        <a
          class="author-link"
          target="_blank"
          rel="noopener noreferrer"
          href={owner_html_url}
        >
          {login}
        </a>
      </p>
      <p>{`private: ${private_status}, homepage: ${homepage}, forks: ${forks_count}, stars: ${stargazers_count}, watchers: ${watchers_count}, subscribers: ${subscribers_count}, size: ${size}`}</p>
      <p>{`language: ${language}, topics: ${topics}, visibility: ${visibility}, open_issues: ${open_issues}, default_branch: ${default_branch}`}</p>
    </div>
  );
}; // TODO add more metadata (languages, tags, topics, stargazers, watchers, branches, commits, downloads)

export const renderer = jsxRenderer(
  ({ children, title }: PropsWithChildren<{ title?: string }>): JSX.Element => {
    return (
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>{title}</title>
          <meta
            name="description"
            content="Explore obscure GitHub repositories"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href="/static/style.css" />
          <link
            rel="icon"
            href="/static/icons/favicon.svg"
            type="image/svg+xml"
          />
          <link rel="manifest" href="/static/manifest.webmanifest" />
          <script src="/static/script.js" type="module"></script>
        </head>
        <body>
          <header class="header">
            <h1>PetitHub</h1>
          </header>
          <div class="container-wrapper">{children}</div>
          <footer class="footer">
            <p>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/cletqui/petithub"
              >
                <img
                  src="/static/icons/github.svg"
                  alt="GitHub"
                  class="icon github-icon"
                />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.buymeacoffee.com/cletqui"
              >
                <img
                  src="/static/icons/buymeacoffee.svg"
                  alt="BuyMeACoffee"
                  class="icon buymeacoffee-icon"
                />
              </a>
            </p>
          </footer>
        </body>
      </html>
    );
  },
  { docType: "<!DOCTYPE html>", stream: true }
);
