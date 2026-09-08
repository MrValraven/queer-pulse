import { describe, expect, it } from "vitest";
import { communities as en } from "../../../shared/i18n/catalogs/en/communities";
import { communities as pt } from "../../../shared/i18n/catalogs/pt/communities";
import {
  isSharedValueKey,
  RULE_PRESET_KEYS,
  SHARED_VALUE_LIBRARY,
  sharedValueByKey,
} from "./sharedValueLibrary.data";
import { resolvePresetRules } from "./startCommunity.data";

/** Strip the namespace a library key carries, leaving the catalog's own path. */
const path = (key: string) => key.replace(/^communities:/, "");

describe("the shared-value library", () => {
  it("gives every value a unique id and a translated string in both languages", () => {
    const ids = SHARED_VALUE_LIBRARY.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of SHARED_VALUE_LIBRARY) {
      expect(en[path(entry.key)], `EN copy for ${entry.id}`).toBeTruthy();
      expect(pt[path(entry.key)], `PT copy for ${entry.id}`).toBeTruthy();
    }
  });

  it("keeps every value inside the backend's 300-character rule cap", () => {
    for (const entry of SHARED_VALUE_LIBRARY) {
      expect(en[path(entry.key)]!.length).toBeLessThanOrEqual(300);
      expect(pt[path(entry.key)]!.length).toBeLessThanOrEqual(300);
    }
  });

  it("offers the four default presets as part of the library", () => {
    // Otherwise a founder who opens the picker is shown a value they already
    // hold as unticked, and adding it duplicates the sentence.
    for (const key of RULE_PRESET_KEYS) {
      expect(sharedValueByKey(key), key).toBeDefined();
    }
  });
});

describe("resolvePresetRules", () => {
  const t = (key: string) => `translated:${key}`;

  it("translates any library key, beyond the four defaults", () => {
    const picked = SHARED_VALUE_LIBRARY.find(
      (entry) => !RULE_PRESET_KEYS.includes(entry.key),
    )!;

    expect(resolvePresetRules([RULE_PRESET_KEYS[0]!, picked.key], t)).toEqual([
      `translated:${RULE_PRESET_KEYS[0]}`,
      `translated:${picked.key}`,
    ]);
  });

  it("passes a founder's own words through untouched", () => {
    expect(isSharedValueKey("We all bring cake.")).toBe(false);
    expect(resolvePresetRules(["We all bring cake."], t)).toEqual([
      "We all bring cake.",
    ]);
  });
});
