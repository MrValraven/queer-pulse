import { describe, expect, it } from "vitest";
import {
  internalPlaceSlug,
  isOwnStudioUrl,
  studioKindInQuoteSnippet,
} from "./internalLinkTargets";

describe("internalPlaceSlug", () => {
  it("reads the slug from a queerpulse.com place link", () => {
    expect(
      internalPlaceSlug("https://queerpulse.com/local/directory/luz-bakery"),
    ).toBe("luz-bakery");
  });

  it("reads the slug from a www.queerpulse.com place link", () => {
    expect(
      internalPlaceSlug(
        "https://www.queerpulse.com/local/directory/luz-bakery",
      ),
    ).toBe("luz-bakery");
  });

  it("reads the slug from the host currently serving the app", () => {
    expect(
      internalPlaceSlug(`${window.location.origin}/local/directory/luz-bakery`),
    ).toBe("luz-bakery");
  });

  it("tolerates an optional trailing slash", () => {
    expect(
      internalPlaceSlug("https://queerpulse.com/local/directory/luz-bakery/"),
    ).toBe("luz-bakery");
  });

  it("ignores query string and hash", () => {
    expect(
      internalPlaceSlug(
        "https://queerpulse.com/local/directory/luz-bakery?utm_source=share#reviews",
      ),
    ).toBe("luz-bakery");
  });

  it("decodes a percent-encoded slug", () => {
    expect(
      internalPlaceSlug(
        "https://queerpulse.com/local/directory/caf%C3%A9-azul",
      ),
    ).toBe("café-azul");
  });

  it("returns null for a link to a different site", () => {
    expect(
      internalPlaceSlug("https://example.com/local/directory/luz-bakery"),
    ).toBeNull();
  });

  it("returns null for the bare directory index", () => {
    expect(
      internalPlaceSlug("https://queerpulse.com/local/directory"),
    ).toBeNull();
    expect(
      internalPlaceSlug("https://queerpulse.com/local/directory/"),
    ).toBeNull();
  });

  it("returns null for the list-a-business route", () => {
    expect(
      internalPlaceSlug("https://queerpulse.com/local/directory/list"),
    ).toBeNull();
  });

  it("returns null for the list-a-business edit route", () => {
    expect(
      internalPlaceSlug(
        "https://queerpulse.com/local/directory/list/abc123/edit",
      ),
    ).toBeNull();
  });

  it("returns null for the listing-claims route", () => {
    expect(
      internalPlaceSlug("https://queerpulse.com/local/directory/claims"),
    ).toBeNull();
  });

  it("returns null for a path nested deeper than one segment", () => {
    expect(
      internalPlaceSlug(
        "https://queerpulse.com/local/directory/luz-bakery/reviews",
      ),
    ).toBeNull();
  });

  it("returns null for an unrelated queerpulse.com page", () => {
    expect(internalPlaceSlug("https://queerpulse.com/communities")).toBeNull();
  });

  it("returns null for a malformed URL", () => {
    expect(internalPlaceSlug("not a url")).toBeNull();
  });
});

describe("isOwnStudioUrl", () => {
  it("is true for every Studio path on this deployment", () => {
    for (const url of [
      "https://queerpulse.com/studio/artist?id=abc",
      `${window.location.origin}/studio/preview/${"a".repeat(64)}`,
      "https://queerpulse.com/studio",
      "https://www.queerpulse.com/studio/library",
      "https://queerpulse.com/Studio/album?id=abc",
      "https://queerpulse.com/%73tudio/collection?id=abc",
      "https://queerpulse.com//studio/track?id=abc",
      "/studio/preview/token",
    ]) {
      expect(isOwnStudioUrl(url)).toBe(true);
    }
  });

  it("is false for another site, another port and a non-Studio path", () => {
    for (const url of [
      "https://example.com/studio/artist?id=abc",
      "https://queerpulse.com:8443/studio/artist?id=abc",
      "https://queerpulse.com/studio-guide",
      "https://queerpulse.com/local/directory/x",
      "not a url",
      "/\\evil.example/studio/track?id=abc",
    ]) {
      expect(isOwnStudioUrl(url)).toBe(false);
    }
  });
});

describe("studioKindInQuoteSnippet", () => {
  const playlistId = "1b2c3d4e-5f6a-4b7c-8d9e-0f1a2b3c4d5e";

  it("names the kind of a whole Studio link", () => {
    expect(
      studioKindInQuoteSnippet(
        `ouve isto https://queerpulse.com/studio/collection?id=${playlistId}`,
      ),
    ).toBe("playlist");
  });

  it("names the kind when the server cut the link short", () => {
    expect(
      studioKindInQuoteSnippet(
        "fiz uma playlist para a noite de quem chega e quero que ponhas as tuas também https://queerpulse.com/studio/collection?id=1b2c3d4e-5f6a…",
      ),
    ).toBe("playlist");
    expect(studioKindInQuoteSnippet("olha /studio/album?id=9a8b")).toBe(
      "release",
    );
  });

  it("is null without a Studio link and for another site's cut link", () => {
    expect(studioKindInQuoteSnippet("see you at 7")).toBeNull();
    expect(
      studioKindInQuoteSnippet("https://example.com/studio/track?id=3f2b…"),
    ).toBeNull();
  });

  it("reads a cut link after an opening bracket or guillemet", () => {
    expect(studioKindInQuoteSnippet("olha «/studio/album?id=9a8b")).toBe(
      "release",
    );
    expect(
      studioKindInQuoteSnippet("(https://queerpulse.com/studio/track?id=3f2b…"),
    ).toBe("track");
  });

  it("is null for a cut link glued to other text or carrying userinfo", () => {
    expect(
      studioKindInQuoteSnippet("example.com/studio/album?id=9a8b"),
    ).toBeNull();
    expect(
      studioKindInQuoteSnippet(
        "see:https://queerpulse.com/studio/album?id=9a8b",
      ),
    ).toBeNull();
    expect(
      studioKindInQuoteSnippet(
        "olha https://member@queerpulse.com/studio/collection?id=1b2c…",
      ),
    ).toBeNull();
  });

  it("is null for a cut link inside another link's run", () => {
    expect(
      studioKindInQuoteSnippet("https://example.com/a(/studio/track?id=9"),
    ).toBeNull();
  });
});
