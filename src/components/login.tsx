import { Suspense } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { Octokit } from "octokit";

import { getAuthenticatedUser } from "../utils/octokit";

const LoginButton = () => {
  return (
    <button class="button">
      <img src="/static/icons/github.svg" alt="GitHub" class="icon" />
      <a href="/github/login">{"Login with GitHub"}</a>
    </button>
  );
};

const User = async ({ user }: { user: Promise<UserResponse> }) => {
  try {
    const c = useRequestContext();
    const { path } = c.req;
    const {
      data: { login, avatar_url },
    } = await user;
    return (
      <button class="button" onclick="logout">
        <a href={`/github/logout?callback_url=${path}`}>
          <img class="avatar" src={avatar_url} alt="avatar" />
          {login}
        </a>
      </button>
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
}; // TODO fix UI