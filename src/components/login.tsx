import { Suspense } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

import { getAuthenticatedUser, type Octokit } from "../utils/octokit";

const LoginButton = () => {
  return (
    <a class="button" href="/github/login">
      <img src="/static/icons/github.svg" alt="" class="icon" />
      {"Login with GitHub"}
    </a>
  );
};

const User = async ({
  user,
}: {
  user: Promise<
    RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]
  >;
}) => {
  try {
    const c = useRequestContext();
    const { path } = c.req;
    const { data } = await user;
    const { login, avatar_url } = data;
    return (
      <a
        class="button"
        href={`/github/logout?callback_url=${encodeURIComponent(path)}`}
      >
        <img class="avatar" src={avatar_url} alt="" />
        {login}
      </a>
    );
  } catch (_) {
    return <LoginButton />;
  }
};

export const Login = async ({ octokit }: { octokit: Octokit }) => {
  const user = getAuthenticatedUser(octokit);
  return (
    <Suspense fallback={<LoginButton />}>
      <User user={user} />
    </Suspense>
  );
};
