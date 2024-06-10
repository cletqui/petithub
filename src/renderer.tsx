import { jsxRenderer } from "hono/jsx-renderer";
import { PropsWithChildren } from "hono/jsx";
import { JSX } from "hono/jsx/jsx-runtime";

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

export const Loader = (): JSX.Element => {
  return (
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
  );
};

const ErrorContainer = () => {
  return (
    <div class="container">
      <p>{"No repository found"}</p>
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
};

export const renderer = jsxRenderer(
  ({ children, title }: PropsWithChildren<{ title?: string }>): JSX.Element => {
    return (
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>{title}</title>
          <meta name="description" content={title} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="/static/style.css" rel="stylesheet" />
        </head>
        <body>
          <header class="header">
            <h1>PetitHub</h1>
          </header>
          <div class="container-wrapper">{children}</div>
          <footer class="footer">
            <p>
              <a
                class="author-link"
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/cletqui/petithub"
              >
                PetitHub
              </a>
              -
              <a
                class="author-link"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.buymeacoffee.com/cletqui"
              >
                BuyMeACoffee
              </a>
            </p>
          </footer>
        </body>
      </html>
    );
  },
  { docType: "<!DOCTYPE html>", stream: true }
);
