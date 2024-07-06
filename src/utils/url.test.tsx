import { describe, expect, test } from "vitest";

import { constructUrl } from "./url";

describe("constructUrl", () => {
  test("should return the URL string when a valid URL is provided", () => {
    const urlString = "https://example.com";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).not.toBe(defaultUrl);
  });

  test("should return the default URL when an invalid URL is provided", () => {
    const urlString = "invalid-url";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).toBe(defaultUrl);
  });

  test("should return the default URL when an empty string is provided", () => {
    const urlString = "";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).toBe(defaultUrl);
  });

  test("should return the default URL when a URL with spaces is provided", () => {
    const urlString = "https:// example .com";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).toBe(defaultUrl);
  });

  test("should return the URL string when a URL with special characters is provided", () => {
    const urlString = "https://example.com/<>?";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).not.toBe(defaultUrl);
  });

  test("should return the URL string when a valid URL with query parameters is provided", () => {
    const urlString = "https://example.com?param=value";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).not.toBe(defaultUrl);
  });

  test("should return the URL string when a valid URL with a fragment is provided", () => {
    const urlString = "https://example.com#section";
    const defaultUrl = "https://default.com/";
    const result = constructUrl(urlString, defaultUrl);
    expect(result).not.toBe(defaultUrl);
  });
});
