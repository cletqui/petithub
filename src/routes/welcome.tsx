import { Context, Hono } from "hono";

import { Bindings, Variables } from "..";
import { Welcome } from "../utils/renderer";

/* APP */
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/* ENDPOINTS */
app.get(
  "/",
  (c: Context<{ Bindings: Bindings; Variables: Variables }>): Response => {
    // deleteCookie(c, "state", stateCookieOptions); // TODO fix cookie storage/deletion
    return c.render(<Welcome />, {
      title: "PetitHub - welcome",
    });
  }
); // TODO improve UI

export default app;
