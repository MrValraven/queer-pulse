import { describe, expect, it } from "vitest";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { JOIN_REQUEST_SOURCES, sourceLabelKey } from "./joinRequestSource";

const AUDIENCE_SOURCES = [
  "for_businesses",
  "for_communities",
  "for_performers",
  "for_practitioners",
];

describe("audience join-request sources", () => {
  it("appends the four audience sources", () => {
    expect(JOIN_REQUEST_SOURCES.slice(-6, -2)).toEqual(AUDIENCE_SOURCES);
    expect(sourceLabelKey("for_performers")).toBe(
      "admin:members.verify.source.for_performers",
    );
  });

  it.each(["en", "pt"] as const)(
    "the %s admin catalog labels all four",
    async (language) => {
      const adminCatalog = await loadNamespace(language, "admin");
      const missing = AUDIENCE_SOURCES.filter(
        (source) => !adminCatalog[`members.verify.source.${source}`],
      );
      expect(missing).toEqual([]);
    },
  );
});

const STUDIO_SOURCES = ["studio_landing", "studio_artist"];

describe("Studio landing join-request sources", () => {
  it("appends the two Studio sources last", () => {
    expect(JOIN_REQUEST_SOURCES.slice(-2)).toEqual(STUDIO_SOURCES);
    expect(sourceLabelKey("studio_artist")).toBe(
      "admin:members.verify.source.studio_artist",
    );
  });

  it.each(["en", "pt"] as const)(
    "the %s admin catalog labels both Studio sources",
    async (language) => {
      const adminCatalog = await loadNamespace(language, "admin");
      const missing = STUDIO_SOURCES.filter(
        (source) => !adminCatalog[`members.verify.source.${source}`],
      );
      expect(missing).toEqual([]);
    },
  );
});
