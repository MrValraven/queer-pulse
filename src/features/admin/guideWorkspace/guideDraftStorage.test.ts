import { afterEach, describe, expect, it } from "vitest";
import { emptyGuideDraft } from "./guideDraft";
import {
  guideDraftStorageKey,
  readStoredGuideDraft,
  removeStoredGuideDraft,
  writeStoredGuideDraft,
} from "./guideDraftStorage";

const KEY = guideDraftStorageKey("guide-1");

afterEach(() => window.localStorage.clear());

describe("guideDraftStorage", () => {
  it("keys by guide id, and by `new` for an unsaved guide", () => {
    expect(guideDraftStorageKey("guide-1")).toBe("qp:guide-draft:guide-1");
    expect(guideDraftStorageKey(null)).toBe("qp:guide-draft:new");
  });

  it("round-trips a stored draft", () => {
    const stored = {
      storedAt: "2026-09-11T14:02:00.000Z",
      baseUpdatedAt: null,
      draft: emptyGuideDraft(),
    };
    writeStoredGuideDraft(KEY, stored);
    expect(readStoredGuideDraft(KEY)).toEqual(stored);
    removeStoredGuideDraft(KEY);
    expect(readStoredGuideDraft(KEY)).toBeNull();
  });

  it("ignores malformed or foreign values", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(readStoredGuideDraft(KEY)).toBeNull();
    window.localStorage.setItem(KEY, JSON.stringify({ storedAt: 5 }));
    expect(readStoredGuideDraft(KEY)).toBeNull();
  });
});
