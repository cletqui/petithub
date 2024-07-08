import { JSX } from "hono/jsx/jsx-runtime";
import { Suspense } from "hono/jsx";

import { timeAgo, dateOptions } from "../utils/time";
import { constructUrl } from "../utils/url";

export const Repository = async ({
  repository,
}: {
  repository: Promise<RepositoryResponse["data"]>;
}) => {
  return (
    <Suspense fallback={<div>{"prout"}</div>}>
      <Container repository={await repository} />
    </Suspense>
  );
}; // TODO handle errors like https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2022-11-28#handling-rate-limit-errors

const Container = ({
  repository,
}: {
  repository: RepositoryResponse["data"];
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
                  href={`${constructUrl(homepage, "https://github.com/")}`}
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
}; // TODO refactor this Container
