import { describe, expect, it } from "vitest";
import {
  QUIET_PUBLIC_PATHS,
  isGatedPath,
  assertNoGatedPaths,
} from "./publicPaths.mjs";

describe("publicPaths", () => {
  it("marks known gated paths as gated", () => {
    expect(isGatedPath("/feed")).toBe(true);
    expect(isGatedPath("/messages")).toBe(true);
    expect(isGatedPath("/members/some-person")).toBe(true);
    expect(isGatedPath("/studio/dashboard")).toBe(true);
  });

  it("marks the quiet public surface as not gated", () => {
    expect(isGatedPath("/")).toBe(false);
    expect(isGatedPath("/resources/trans-healthcare")).toBe(false);
    expect(isGatedPath("/safety/emergency")).toBe(false);
  });

  it("contains no gated path", () => {
    expect(() => assertNoGatedPaths(QUIET_PUBLIC_PATHS)).not.toThrow();
  });

  it("throws listing every offending path", () => {
    expect(() => assertNoGatedPaths(["/feed", "/", "/messages"])).toThrow(
      /\/feed[\s\S]*\/messages/,
    );
  });

  it("excludes the de-indexed surfaces", () => {
    const deIndexedPrefixes = [
      "/magazine",
      "/cinema",
      "/studio",
      "/activism",
      "/archive",
      "/sustainer",
    ];
    const leaked = QUIET_PUBLIC_PATHS.filter((publicPath) =>
      deIndexedPrefixes.some(
        (prefix) =>
          publicPath === prefix || publicPath.startsWith(`${prefix}/`),
      ),
    );
    expect(leaked).toEqual([]);
  });

  it("has no duplicates", () => {
    expect(new Set(QUIET_PUBLIC_PATHS).size).toBe(QUIET_PUBLIC_PATHS.length);
  });

  it("lists every path root-relative", () => {
    for (const publicPath of QUIET_PUBLIC_PATHS) {
      expect(publicPath.startsWith("/")).toBe(true);
    }
  });
});
