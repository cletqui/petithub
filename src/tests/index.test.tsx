import app from "..";
import { verifyToken } from "./__mocks__/octokit";

const MOCK_ENV = {
  octokit: {},
  verifyToken,
};

describe("Testing API", () => {
  test("GET /api (no API key)", async () => {
    const res = await app.request("/api");
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });

  test("GET /api", async () => {
    const res = await app.request(
      "/api",
      {
        headers: {
          Authorization: "Bearer valid-token",
        },
      },
      MOCK_ENV
    );
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });

  test("POST /api (no API key)", async () => {
    const res = await app.request("/api", { method: "POST" });
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });
});

/*
describe("Testing ID", () => {
  test("GET /id", async () => {
    const res = await app.request("/id", {}, MOCK_ENV);
    expect(res.status).toBe(200);
  });
  
  test("GET /id/1296269", async () => {
    const res = await app.request("/id/1296269", {}, MOCK_ENV);
    expect(res.status).toBe(200);
  });
});
*/

/*
describe("Testing template", () => {
  test("GET /template", async () => {
    const res = await app.request("/template", {}, MOCK_ENV);
    expect(res.status).toBe(200);
  });
});
*/

/*
describe("Testing root", () => {
  test("GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });
});
*/

describe("Testing default redirect", () => {
  test("GET /test", async () => {
    const res = await app.request("/test");
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("/");
  });
});
