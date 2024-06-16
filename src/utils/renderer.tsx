import { jsxRenderer } from "hono/jsx-renderer";
import { PropsWithChildren } from "hono/jsx";
import { JSX } from "hono/jsx/jsx-runtime";
import { HtmlEscapedString } from "hono/utils/html";
import { Octokit } from "@octokit/core";

import { getData } from "./octokit";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    html_url: string;
  };
  fork: boolean;
  description: string | null;
  html_url: string;
}

export const RepositoryContainer = async ({
  octokit,
  maxId,
}: {
  octokit: Octokit;
  maxId: number;
}): Promise<HtmlEscapedString> => {
  const repository = await getData(octokit, maxId);
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
    owner: { login, html_url: owner_html_url },
    description,
    html_url,
    // forks_count,
    // stargazers_count,
    // watchers_count,
    // subscribers_count,
    // size,
  } = repository;
  return (
    <div class="container">
      <h2>{name}</h2>
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
