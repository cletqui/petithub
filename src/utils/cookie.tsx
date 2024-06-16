import { Context } from "hono";
import { setCookie, getCookie } from "hono/cookie";

export const setCookieId = (c: Context, id: number): void => {
  setCookie(c, "max_id", String(id), {
    path: "/",
    secure: true,
    httpOnly: false,
    maxAge: 86400,
    sameSite: "Strict",
  });
};

export const getCookieId = (c: Context): number => {
  return Number(getCookie(c, "max_id"));
};
