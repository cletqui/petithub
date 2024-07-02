import { jsxRenderer } from "hono/jsx-renderer";
import { PropsWithChildren } from "hono/jsx";
import { JSX } from "hono/jsx/jsx-runtime";
import { HtmlEscapedString } from "hono/utils/html";
import { Octokit } from "@octokit/core";

import { getRandomRepository } from "./octokit";
import { timeAgo } from "./time";

interface OctokitErrorResponse {
  status: number;
  response: {
    data: {
      message: string;
    };
  };
}

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
  created_at?: string | null;
  updated_at?: string | null;
  pushed_at?: string | null;
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
  try {
    const repository = await getRandomRepository(octokit, maxId);
    /* const { full_name } = repository;
    const title = `PetitHub - ${full_name}`; */
    return <Container repository={repository} />;
  } catch (error: any) {
    const {
      status,
      response: {
        data: { message },
      },
    } = (error as OctokitErrorResponse) || {};
    if (status && status === 403) {
      return <Login message={message} />;
    } else {
      return <Loader />;
    }
  }
};

export const Loader = (): JSX.Element => {
  return (
    <div class="lds-ripple">
      <div />
      <div />
    </div>
  );
};

export const Login = ({ message }: { message: string }): JSX.Element => {
  return (
    <div class="container">
      <div class="container-title">{"Login"}</div>
      <p>{message}</p>
      <button>
        <a href={"/github/login"}>{"Login with Github"}</a>
      </button>
    </div>
  );
}; // TODO implement Demo/Github login

export const Welcome = ({}): JSX.Element => {
  return (
    <div class="container">
      <div class="container-title">{"Welcome"}</div>
      <button>
        <a href="/">{"Browse random GitHub repositories"}</a>
      </button>
    </div>
  );
}; // TODO implement Demo/Github login

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
    created_at,
    updated_at,
    pushed_at,
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
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
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
          <div class="layout-main-header">
            <div class="row">
              <button id="branch-button" class="button">
                <img src="/static/icons/branch.svg" alt="branch" class="icon" />
                <div>{default_branch}</div>
              </button>
              <button id="watch-button" class="button">
                <img src="/static/icons/eye.svg" alt="watch" class="icon" />
                <div class="label">{"Watch"}</div>
                <div>{(watchers_count || 0) + (subscribers_count || 0)}</div>
              </button>
              <button id="fork-button" class="button">
                <img src="/static/icons/fork.svg" alt="fork" class="icon" />
                <div class="label">{"Fork"}</div>
                <div>{forks_count || 0}</div>
              </button>
              <button id="star-button" class="button">
                <img src="/static/icons/star.svg" alt="star" class="icon" />
                <div class="label">{"Star"}</div>
                <div>{stargazers_count || 0}</div>
              </button>
            </div>
            <button id="code-button" class="button code-button">
              <a target="_blank" rel="noopener noreferrer" href={html_url}>
                <img
                  src="/static/icons/code.svg"
                  alt="code"
                  class="icon icon"
                />
                <div>{"Code"}</div>
                <img
                  src="/static/icons/triangle.svg"
                  alt="go"
                  class="icon small-icon"
                />
              </a>
            </button>
          </div>
          <table class="main-table">
            <thead>
              <tr>
                <th>{"label"}</th>
                <th>{"value"}</th>
                <th>{"date"}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="avatar-row">
                <td class="label-column">
                  <a
                    class="author-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={owner_html_url}
                  >
                    <img
                      class="avatar icon"
                      src={avatar_url}
                      alt="avatar_url"
                    />

                    <b>{login}</b>
                  </a>
                </td>
                <td />
                <td />
              </tr>
              {created_at && (
                <tr>
                  <td class="label-column">
                    <img
                      src="/static/icons/create.svg"
                      alt="create"
                      class="icon small-icon"
                    />
                    {"creation"}
                  </td>
                  <td>
                    {new Date(created_at).toLocaleDateString(
                      "en-GB",
                      dateOptions
                    )}
                  </td>
                  <td class="ago-column">{timeAgo(new Date(created_at))}</td>
                </tr>
              )}
              {updated_at && (
                <tr>
                  <td class="label-column">
                    <img
                      src="/static/icons/update.svg"
                      alt="update"
                      class="icon small-icon"
                    />
                    {"update"}
                  </td>
                  <td>
                    {new Date(updated_at).toLocaleDateString(
                      "en-GB",
                      dateOptions
                    )}
                  </td>
                  <td class="ago-column">{timeAgo(new Date(updated_at))}</td>
                </tr>
              )}
              {pushed_at && (
                <tr>
                  <td class="label-column">
                    <img
                      src="/static/icons/push.svg"
                      alt="push"
                      class="icon small-icon"
                    />
                    {"push"}
                  </td>
                  <td>
                    {new Date(pushed_at).toLocaleDateString(
                      "en-GB",
                      dateOptions
                    )}
                  </td>
                  <td class="ago-column">{timeAgo(new Date(pushed_at))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div class="layout-sidebar">
          <div class="block">
            <p>
              <b>{"About"}</b>
            </p>
            {description && <p>{description}</p>}
            {topics && topics?.length > 0 && (
              <div>
                {topics.map((topic: any) => (
                  <a
                    class="topic"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://github.com/topics/${topic}`}
                  >
                    {topic}
                  </a>
                ))}
              </div>
            )}
            {homepage && (
              <p class="homepage">
                {" "}
                <img src="/static/icons/link.svg" alt="homepage" class="icon" />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${new URL(homepage)}`}
                >
                  {homepage}
                </a>
              </p>
            )}
            {!description && !homepage && topics?.length === 0 && (
              <p>
                <i>{"No description, website, or topics provided."}</i>
              </p>
            )}
          </div>
          <div class={`block muted ${language && "block-border"}`}>
            {license && (
              <p>
                <a
                  class="sidebar-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${html_url}/blob/${default_branch}/LICENSE`}
                >
                  <img
                    src="/static/icons/license.svg"
                    alt="license"
                    class="icon"
                  />
                  {`${license.key?.toUpperCase()} license`}
                </a>
              </p>
            )}
            <p>
              <a
                class="sidebar-link"
                target="_blank"
                rel="noopener noreferrer"
                href={`${html_url}/activity`}
              >
                <img
                  src="/static/icons/activity.svg"
                  alt="activity"
                  class="icon"
                />
                {"Activity"}
              </a>
            </p>
            <p>
              <a
                class="sidebar-link"
                target="_blank"
                rel="noopener noreferrer"
                href={`${html_url}/stargazers`}
              >
                <img src="/static/icons/star.svg" alt="stars" class="icon" />
                {`${stargazers_count || 0} stars`}
              </a>
            </p>
            <p>
              <a
                class="sidebar-link"
                target="_blank"
                rel="noopener noreferrer"
                href={`${html_url}/watchers`}
              >
                <img src="/static/icons/eye.svg" alt="watchers" class="icon" />
                {`${(watchers_count || 0) + (subscribers_count || 0)} watching`}
              </a>
            </p>
            <p>
              <a
                class="sidebar-link"
                target="_blank"
                rel="noopener noreferrer"
                href={`${html_url}/forks`}
              >
                <img src="/static/icons/fork.svg" alt="forks" class="icon" />
                {`${forks_count || 0} forks`}
              </a>
            </p>
            <p>
              <a
                class="sidebar-link"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/contact/report-content?content_url=${html_url}&report=${login}+%28user%29`}
              >
                {"Report repository"}
              </a>
            </p>
          </div>
          {language && (
            <>
              <b>{"Languages"}</b>
              <div class="block">
                <p>{language}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
            <a href="/login" title="PetitHub">
              <img
                src="/static/icons/github.svg"
                alt="GitHub"
                class="icon github-icon"
              />
            </a>
            <h1 class="title">{"PetitHub"}</h1>
            <div>
              <button>
                <a href="/github/login">{"Login"}</a>
              </button>
              <img
                class="icon refresh"
                src="/static/icons/refresh.svg"
                onclick="window.location.reload()"
              />
            </div>
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
