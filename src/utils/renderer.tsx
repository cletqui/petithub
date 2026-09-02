import { jsxRenderer } from "hono/jsx-renderer";
import { PropsWithChildren, Suspense } from "hono/jsx";
import { JSX } from "hono/jsx/jsx-runtime";
import { useRequestContext } from "hono/jsx-renderer";
import { StreamingContext } from "hono/jsx/streaming";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

import { fetchRepositoryData } from "./octokit";
import { Loader } from "../components/loader";
import { Login } from "../components/login";

type RepositoryData = RestEndpointMethodTypes["repos"]["get"]["response"]["data"];

const Head = ({
  repository,
}: {
  repository?: Promise<RepositoryData>;
}) => {
  const full_name = repository
    ? fetchRepositoryData(repository, "full_name").catch(() => "")
    : "";
  return (
    <head>
      <meta charset="UTF-8" />
      <Suspense fallback={<title>{"PetitHub"}</title>}>
        <title>
          {"PetitHub - "}
          {full_name}
        </title>
      </Suspense>
      <meta name="description" content="Explore obscure GitHub repositories" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="stylesheet" href="/static/style.css" />
      <link rel="icon" href="/static/icons/favicon.svg" type="image/svg+xml" />
      <link rel="manifest" href="/static/manifest.webmanifest" />
      <script src="/static/script.js" type="module"></script>
    </head>
  );
};

const Header = (): JSX.Element => {
  const c = useRequestContext();
  const { octokit } = c.var;
  return (
    <header class="header">
      <div class="header-brand">
        <a class="refresh-link" href="/" aria-label="Load another repository">
          <img class="icon refresh" src="/static/icons/refresh.svg" alt="" />
        </a>
        <h1 class="title">{"PetitHub"}</h1>
      </div>
      <Login octokit={octokit} />
    </header>
  );
};

const Footer = (): JSX.Element => {
  return (
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
  );
};

const Body = ({ children }: PropsWithChildren) => {
  return (
    <body>
      <Header />
      <div class="container-wrapper">
        <Suspense fallback={<Loader />}>{children}</Suspense>
      </div>
      <Footer />
    </body>
  );
};

export const renderer = jsxRenderer(
  ({
    children,
    repository,
  }: PropsWithChildren<{ repository?: Promise<RepositoryData> }>): JSX.Element => {
    const c = useRequestContext();
    const scriptNonce = c.get("cspNonce");
    return (
      <StreamingContext.Provider value={{ scriptNonce }}>
        <html lang="en">
          <Head repository={repository} />
          <Body children={children} />
        </html>
      </StreamingContext.Provider>
    );
  },
  { docType: "<!DOCTYPE html>", stream: true }
);
