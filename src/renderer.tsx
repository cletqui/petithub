import { jsxRenderer } from "hono/jsx-renderer";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    html_url: string;
  };
  fork: boolean;
  description: string;
  html_url: string;
}

export const Loader = () => {
  return (
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>
  );
};

export const Container = ({ repository }) => {
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
  ({ children, title }) => {
    return (
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>{`PetitHub ${title && `- ${title}`}`}</title>
          <meta name="description" content={`PetitHub - ${title}`} />
          <link href="/static/style.css" rel="stylesheet" />
        </head>
        <body>
          <h1>{"PetitHub"}</h1>
          <div class="container-wrapper">{children}</div>
          <div class="footer">
            <p>
              <a class="author-link" href="https://github.com/cletqui/petithub">
                {"PetitHub"}
              </a>
              {" - "}
              <a
                class="author-link"
                href="https://www.buymeacoffee.com/cletqui"
              >
                {"BuyMeACoffee"}
              </a>
            </p>
          </div>
        </body>
      </html>
    );
  },
  { docType: "<!DOCTYPE html>", stream: true }
);
