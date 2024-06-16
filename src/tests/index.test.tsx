import app from "..";

const MOCK_ENV = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

describe("Testing API", () => {
  test("GET /api without API key", async () => {
    const res = await app.request("/api");
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
});

/*
describe("Testing template", () => {
  test("GET /template", async () => {
    const res = await app.request("/template");
    expect(res.status).toBe(200);
  });
});

describe("Testing root", () => {
  test("GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });
});
*/
