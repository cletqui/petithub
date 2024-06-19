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
  license?: { key?: string; name?: string } | null;
  topics?: string[];
  visibility?: string;
  open_issues?: number;
  default_branch?: string;
  subscribers_count?: number;
} // TODO complete this interface

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
    owner: { login, avatar_url, html_url: owner_html_url },
    description,
    html_url,
    homepage,
    stargazers_count,
    watchers_count,
    language,
    forks_count,
    license,
    topics,
    visibility,
    default_branch,
    subscribers_count,
  } = repository;
  console.log(repository);
  return (
    <div class="container">
      <div class="container-title">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={owner_html_url}
          title={login}
        >
          <img class="avatar" src={avatar_url} alt="avatar_url" />
        </a>
        <a
          class="repo-title"
          target="_blank"
          rel="noopener noreferrer"
          href={html_url}
          title={`${full_name} (${id})`}
        >
          {name}
        </a>
        <span class="visibility-badge">{visibility}</span>
      </div>
      <div class="container-layout">
        <div class="layout-main">
          <div class="row">
            <button id="branch-button" class="button">
              <img src="/static/icons/branch.svg" alt="branch" class="icon" />
              <div>{default_branch}</div>
            </button>
            <button id="watch-button" class="button">
              <img src="/static/icons/eye.svg" alt="watch" class="icon" />
              <div>{`Watch ${watchers_count}`}</div>
            </button>
            <button id="fork-button" class="button">
              <img src="/static/icons/fork.svg" alt="fork" class="icon" />
              <div>{`Fork ${forks_count}`}</div>
            </button>
            <button id="star-button" class="button">
              <img src="/static/icons/star.svg" alt="star" class="icon" />
              <div>{`Star ${stargazers_count}`}</div>
            </button>
          </div>
          <button id="code-button" class="button code-button">
            <a target="_blank" rel="noopener noreferrer" href={html_url}>
              <img src="/static/icons/code.svg" alt="code" class="icon icon" />
              <div>{"Code"}</div>
              <img
                src="/static/icons/triangle.svg"
                alt="go"
                class="icon small-icon"
              />
            </a>
          </button>
        </div>
        <div class="layout-sidebar">
          <b>{"About"}</b>
          {description && <p>{description}</p>}
          {homepage && (
            <p>
              <a href={homepage}>{homepage}</a>
            </p>
          )}
          {topics && topics?.length > 0 && <p>{JSON.stringify(topics)}</p>}
          {!description && !homepage && topics?.length === 0 && (
            <p>
              <i>{"No description, website, or topics provided."}</i>
            </p>
          )}
          {license && <p>{`${license.key} license`}</p>}
          <p>{"Activity"}</p>
          <p>{`${stargazers_count} stars`}</p>
          <p>{`${watchers_count} watching`}</p>
          <p>{`${forks_count} forks`}</p>
          <b>{"Languages"}</b>
          <p>{language}</p>
        </div>
      </div>
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
      <p>{`subscribers: ${subscribers_count}`}</p>
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
            <h1 class="title">{"PetitHub"}</h1>
          </header>
          <div class="container-wrapper">{children}</div>
          <footer class="footer">
            <p>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/cletqui/petithub"
                title="GitHub"
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
                title="BuyMeACoffee"
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
