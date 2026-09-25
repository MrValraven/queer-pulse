import { describe, expect, it } from "vitest";
import { internalPlaceSlug } from "./internalLinkTargets";

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
