import { JSX } from "hono/jsx/jsx-runtime";
import { Suspense } from "hono/jsx";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

import { timeAgo, dateOptions } from "../utils/time";
import { constructUrl } from "../utils/url";
import { Loader } from "./loader";

type RepositoryData = RestEndpointMethodTypes["repos"]["get"]["response"]["data"];

const RepoButton = ({
  href,
  icon,
  label,
  count,
  caret,
}: {
  href: string;
  icon: string;
  label: string;
  count?: number;
  caret?: boolean;
}): JSX.Element => (
  <a class="button" target="_blank" rel="noopener noreferrer" href={href}>
    <img src={icon} alt="" class="icon" />
    <span class="label">{label}</span>
    {count !== undefined && <span class="counter">{count}</span>}
    {caret && (
      <img src="/static/icons/triangle.svg" alt="" class="icon caret" />
    )}
  </a>
);

const RepositoryError = (): JSX.Element => (
  <div class="container">
    <p>
      {"Couldn't load a repository right now — GitHub may be rate-limiting. "}
      <a href="/">{"Try again"}</a>
      {" or "}
      <a href="/github/login">{"sign in"}</a>
      {" to lift the limit."}
    </p>
  </div>
);

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

const ResolvedRepository = async ({
  repository,
}: {
  repository: Promise<RepositoryData>;
}) => {
  try {
    return <Container repository={await repository} />;
  } catch (_) {
    return <RepositoryError />;
  }
};

export const Repository = ({
  repository,
}: {
  repository: Promise<RepositoryData>;
}) => {
  return (
    <Suspense fallback={<Loader />}>
      <ResolvedRepository repository={repository} />
    </Suspense>
  );
};

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
    language,
    forks_count,
    license,
    topics,
    visibility,
    default_branch,
    subscribers_count,
    archived,
    allow_forking,
  } = repository;
  const { login, avatar_url, html_url: owner_html_url, type } = owner;
  const isOrg = type === "Organization";
  return (
    <div class="container">
      {archived && (
        <div class="archived-banner">
          <img src="/static/icons/archive.svg" alt="" class="icon" />
          {
            "This repository has been archived by the owner. It is now read-only."
          }
        </div>
      )}
      <div class="container-title">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={owner_html_url}
          title={login}
        >
          <img
            class={isOrg ? "avatar avatar-org" : "avatar"}
            src={avatar_url}
            alt={login}
          />
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
              <RepoButton
                href={`${html_url}/branches`}
                icon="/static/icons/branch.svg"
                label={default_branch}
                caret
              />
              <RepoButton
                href={`${html_url}/watchers`}
                icon="/static/icons/eye.svg"
                label="Watch"
                count={subscribers_count || 0}
              />
              {allow_forking !== false && (
                <RepoButton
                  href={`${html_url}/forks`}
                  icon="/static/icons/fork.svg"
                  label="Fork"
                  count={forks_count || 0}
                />
              )}
              <RepoButton
                href={`${html_url}/stargazers`}
                icon="/static/icons/star.svg"
                label="Star"
                count={stargazers_count || 0}
              />
            </div>
            <a
              class="button code-button"
              target="_blank"
              rel="noopener noreferrer"
              href={html_url}
            >
              <img src="/static/icons/code.svg" alt="" class="icon" />
              <span>{"Code"}</span>
              <img src="/static/icons/triangle.svg" alt="" class="icon caret" />
            </a>
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
                    <img class="avatar icon" src={avatar_url} alt="" />
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
                      alt=""
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
                      alt=""
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
                      alt=""
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
            <p class="sidebar-heading">
              <b>{"About"}</b>
            </p>
            {description && <p>{description}</p>}
            {homepage && (
              <p class="homepage">
                <img src="/static/icons/link.svg" alt="" class="icon" />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${constructUrl(homepage, "https://github.com/")}`}
                >
                  {homepage}
                </a>
              </p>
            )}
            {topics && topics.length > 0 && (
              <div class="topics">
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
                    alt=""
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
                  alt=""
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
                <img src="/static/icons/star.svg" alt="" class="icon" />
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
                <img src="/static/icons/eye.svg" alt="" class="icon" />
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
                <img src="/static/icons/fork.svg" alt="" class="icon" />
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
            <div class="block">
              <p class="sidebar-heading">
                <b>{"Languages"}</b>
              </p>
              <p class="language">
                <span
                  class="language-dot"
                  style={`background-color:${getLanguageColor(language)}`}
                />
                {language}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; // TODO refactor this Container
