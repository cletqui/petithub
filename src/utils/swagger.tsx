import { Context } from "hono";

import { version } from "../../package.json";
import { Bindings, Variables } from "..";

export const swaggerDoc = (
  c: Context<{ Bindings: Bindings; Variables: Variables }>
) => {
  return {
    openapi: "3.1.0",
    info: {
      title: "API",
      version: version,
      description: "PetitHub - [GitHub](https://github.com/cletqui/petithub)",
      contact: {
        name: "cletqui",
        url: "https://github.com/cletqui/petithub/issues",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/license/MIT",
      },
    },
    servers: [
      { url: `${new URL(c.req.url).origin}/api`, description: "API" },
      { url: `https://petithub.pages.dev/api`, description: "API" },
    ],
    tags: [
      {
        name: "API",
        description: "Default API",
      },
    ],
  };
};
