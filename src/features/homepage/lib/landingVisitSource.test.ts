import { describe, expect, it } from "vitest";
import {
  computeLandingSource,
  normalizeLandingSource,
} from "./landingVisitSource";

const OWN_HOST = "queerpulse.pt";

describe("computeLandingSource", () => {
  it("uses utm_source first, normalized", () => {
    expect(
      computeLandingSource(
        "?utm_source=Instagram%20Story&utm_medium=social",
        "https://www.google.com/",
        OWN_HOST,
      ),
    ).toBe("instagram-story");
  });

  it("falls back to the referrer hostname without www.", () => {
    expect(
      computeLandingSource("", "https://www.Google.com/search?q=x", OWN_HOST),
    ).toBe("google.com");
    expect(
      computeLandingSource("?ref=1", "https://l.instagram.com/", OWN_HOST),
    ).toBe("l.instagram.com");
  });

  it("ignores a blank utm_source", () => {
    expect(
      computeLandingSource("?utm_source=%20", "https://t.co/abc", OWN_HOST),
    ).toBe("t.co");
  });

  it("treats a same-site referrer as direct, www variants included", () => {
    expect(
      computeLandingSource("", "https://queerpulse.pt/feed", OWN_HOST),
    ).toBe("direct");
    expect(
      computeLandingSource("", "https://www.queerpulse.pt/feed", OWN_HOST),
    ).toBe("direct");
    expect(
      computeLandingSource(
        "",
        "https://queerpulse.pt/feed",
        "www.queerpulse.pt",
      ),
    ).toBe("direct");
  });

  it("compares hostnames without the port", () => {
    expect(
      computeLandingSource("", "http://localhost:5174/feed", "localhost:5174"),
    ).toBe("direct");
  });

  it("returns direct with no referrer or an invalid one", () => {
    expect(computeLandingSource("", "", OWN_HOST)).toBe("direct");
    expect(computeLandingSource("", "not a url", OWN_HOST)).toBe("direct");
  });
});

describe("normalizeLandingSource", () => {
  it("lower cases, replaces disallowed characters and trims dashes", () => {
    expect(normalizeLandingSource("  News/Letter!  ")).toBe("news-letter");
  });

  it("clamps to 64 characters", () => {
    expect(normalizeLandingSource("a".repeat(100))).toHaveLength(64);
  });

  it("trims a trailing dash the clamp exposes", () => {
    expect(normalizeLandingSource(`${"a".repeat(63)}!x`)).toBe("a".repeat(63));
  });

  it("falls back to direct when nothing is left", () => {
    expect(normalizeLandingSource("!!!")).toBe("direct");
  });
});
