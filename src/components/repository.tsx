import { JSX } from "hono/jsx/jsx-runtime";
import { Suspense } from "hono/jsx";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

import { timeAgo, dateOptions } from "../utils/time";
import { constructUrl } from "../utils/url";

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Scala: "#c22d40",
  R: "#198CE7",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Haskell: "#5e5086",
  Perl: "#0298c3",
  Lua: "#000080",
};

const getLanguageColor = (language: string | null): string =>
  (language && LANGUAGE_COLORS[language]) || "#8b949e";

export const Repository = async ({
  repository,
}: {
  repository: Promise<
    RestEndpointMethodTypes["repos"]["get"]["response"]["data"]
  >;
}) => {
  return (
    <Suspense fallback={<div>{"error"}</div>}>
      <Container repository={await repository} />
    </Suspense>
  );
}; // TODO handle errors like https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#handling-rate-limit-errors

const Container = ({
  repository,
}: {
  repository: RestEndpointMethodTypes["repos"]["get"]["response"]["data"];
}): JSX.Element => {
  const {
    id,
    name,
    full_name,
    owner,
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
  const { login, avatar_url, html_url: owner_html_url } = owner;
  return (
    <div class="container">
      <div class="container-title">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={owner_html_url}
          title={login}
        >
          <img class="avatar" src={avatar_url} alt="avatar" />
        </a>
        <span class="repo-title" title={`${full_name} (${id})`}>
          <a target="_blank" rel="noopener noreferrer" href={owner_html_url}>
            {login}
          </a>
          <span class="muted">{" / "}</span>
          <a target="_blank" rel="noopener noreferrer" href={html_url}>
            {name}
          </a>
        </span>
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
                <div>{subscribers_count || 0}</div>
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
                    <img class="avatar icon" src={avatar_url} alt="avatar" />
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
                {topics.map((topic: string) => (
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
                  href={`${constructUrl(homepage, "https://github.com/")}`}
                >
                  {homepage}
                </a>
              </p>
            )}
            {!description && !homepage && (!topics || topics.length === 0) && (
              <p>
                <i>{"No description, website, or topics provided."}</i>
              </p>
            )}
          </div>
          <div class={`block muted ${language ? "block-border" : ""}`}>
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
                  {`${license.spdx_id || license.name || license.key?.toUpperCase()} license`}
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
                {`${subscribers_count || 0} watching`}
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
                <p style="display:flex;align-items:center;gap:0.5rem;">
                  <span
                    class="language-dot"
                    style={`background-color:${getLanguageColor(language)}`}
                  />
                  {language}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; // TODO refactor this Container
