import { beforeAll, describe, expect, it } from "vitest";
import { loadNamespace, loadPtNamespace } from "../../../shared/i18n/catalogs";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import { communityBadgeDisplayName } from "./communityBadgeDisplayName";

const resolvedCatalogs: Partial<Record<Language, Catalog>> = {};

beforeAll(async () => {
  resolvedCatalogs.en = await loadNamespace("en", "communities");
  resolvedCatalogs.pt = await loadPtNamespace("communities");
});

/** A `t` bound to the real `communities` catalog, so a missing key fails. */
function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const hit = resolveEntry(
      resolvedCatalogs[language],
      path,
      language,
      options,
    );
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

describe("communityBadgeDisplayName", () => {
  it("translates an untouched starter name", () => {
    const badge = { name: "Regular", starterKey: "regular" };
    expect(communityBadgeDisplayName(badge, makeT("pt"))).toBe("Habitual");
    expect(communityBadgeDisplayName(badge, makeT("en"))).toBe("Regular");
  });

  it("shows a renamed starter as stored", () => {
    const badge = { name: "Regulars", starterKey: "regular" };
    expect(communityBadgeDisplayName(badge, makeT("pt"))).toBe("Regulars");
    expect(communityBadgeDisplayName(badge, makeT("en"))).toBe("Regulars");
  });

  it("reads the starter name case-sensitively", () => {
    const badge = { name: "regular", starterKey: "regular" };
    expect(communityBadgeDisplayName(badge, makeT("pt"))).toBe("regular");
  });

  it("shows a custom badge as stored", () => {
    expect(
      communityBadgeDisplayName(
        { name: "Garden crew", starterKey: null },
        makeT("pt"),
      ),
    ).toBe("Garden crew");
    expect(
      communityBadgeDisplayName({ name: "Garden crew" }, makeT("pt")),
    ).toBe("Garden crew");
  });

  it("treats an unknown starter key as a custom badge", () => {
    expect(
      communityBadgeDisplayName(
        { name: "Veteran", starterKey: "veteran" },
        makeT("pt"),
      ),
    ).toBe("Veteran");
  });
});
