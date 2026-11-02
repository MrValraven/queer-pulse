import { beforeEach, describe, expect, it } from "vitest";
import { safeStorage } from "../../../shared/storage/safeStorage";
import { ADD_MONTH_DRAFT_KEY_PREFIX } from "./addMonth.data";
import {
  addMonthDraftKey,
  clearStoredAddMonthDrafts,
  isAddMonthDraftWorthKeeping,
  readAddMonthDraft,
  removeAddMonthDraft,
  writeAddMonthDraft,
} from "./addMonthDraftStorage";
import {
  EMPTY_ADD_MONTH_STATE,
  type AddMonthPhoto,
  type AddMonthState,
} from "./addMonthState";

const storageKey = addMonthDraftKey("member-1");

function stateWithPhotos(
  rowPhoto: AddMonthPhoto | null,
  sharedCover: AddMonthPhoto | null = null,
): AddMonthState {
  return {
    ...EMPTY_ADD_MONTH_STATE,
    templateSlug: "queer-supper",
    sharedCover,
    rows: [
      {
        date: "2026-12-05",
        title: "First supper",
        description: "A long table",
        photo: rowPhoto,
        timeOverride: { startTime: "18:00", endTime: "21:00" },
      },
    ],
  };
}

describe("addMonthDraftStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("builds a key per member and one shared anon key", () => {
    expect(addMonthDraftKey("member-1")).toBe(
      `${ADD_MONTH_DRAFT_KEY_PREFIX}:member-1`,
    );
    expect(addMonthDraftKey(null)).toBe(`${ADD_MONTH_DRAFT_KEY_PREFIX}:anon`);
    expect(addMonthDraftKey(undefined)).toBe(
      `${ADD_MONTH_DRAFT_KEY_PREFIX}:anon`,
    );
  });

  it("round-trips a month through storage", () => {
    const state: AddMonthState = {
      ...stateWithPhotos({ key: "uploads/a.jpg", previewUrl: null }),
      timesTemplateSlug: "queer-supper",
      times: { startTime: "19:30", endTime: "22:00" },
      pledges: [true, false],
    };
    writeAddMonthDraft(storageKey, state, 1234);
    expect(readAddMonthDraft(storageKey)).toEqual({
      version: 1,
      savedAt: 1234,
      state,
    });
  });

  it("readAddMonthDraft keeps a storage key and forgets its dead blob preview", () => {
    writeAddMonthDraft(
      storageKey,
      stateWithPhotos({
        key: "uploads/abc.jpg",
        previewUrl: "blob:http://x/1",
      }),
      1,
    );
    expect(readAddMonthDraft(storageKey)!.state.rows[0]!.photo).toEqual({
      key: "uploads/abc.jpg",
      previewUrl: null,
    });
  });

  it("readAddMonthDraft drops demo blob keys, which die with the page", () => {
    const deadPhoto = { key: "blob:http://x/2", previewUrl: "blob:http://x/2" };
    writeAddMonthDraft(storageKey, stateWithPhotos(deadPhoto, deadPhoto), 1);
    expect(readAddMonthDraft(storageKey)!.state.rows[0]!.photo).toBeNull();
    expect(readAddMonthDraft(storageKey)!.state.sharedCover).toBeNull();
  });

  it("keeps an absolute preview URL from a library pick", () => {
    const libraryPhoto = {
      key: "uploads/lib.jpg",
      previewUrl: "https://cdn.example/lib.jpg",
    };
    writeAddMonthDraft(storageKey, stateWithPhotos(libraryPhoto), 1);
    expect(readAddMonthDraft(storageKey)!.state.rows[0]!.photo).toEqual(
      libraryPhoto,
    );
  });

  it("reads a corrupt or older-shaped entry as no draft", () => {
    safeStorage.set(storageKey, "{oops");
    expect(readAddMonthDraft(storageKey)).toBeNull();
    safeStorage.set(
      storageKey,
      JSON.stringify({ version: 1, savedAt: 1, state: { rows: "x" } }),
    );
    expect(readAddMonthDraft(storageKey)).toBeNull();
    safeStorage.set(
      storageKey,
      JSON.stringify({ version: 0, savedAt: 1, state: EMPTY_ADD_MONTH_STATE }),
    );
    expect(readAddMonthDraft(storageKey)).toBeNull();
  });

  it("reads a missing entry as no draft", () => {
    expect(readAddMonthDraft(storageKey)).toBeNull();
  });

  it("removeAddMonthDraft forgets one month", () => {
    writeAddMonthDraft(storageKey, stateWithPhotos(null), 1);
    removeAddMonthDraft(storageKey);
    expect(readAddMonthDraft(storageKey)).toBeNull();
  });

  it("clearStoredAddMonthDrafts forgets every member's month and leaves other keys", () => {
    const otherMemberKey = addMonthDraftKey("member-2");
    writeAddMonthDraft(storageKey, stateWithPhotos(null), 1);
    writeAddMonthDraft(otherMemberKey, stateWithPhotos(null), 1);
    writeAddMonthDraft(addMonthDraftKey(null), stateWithPhotos(null), 1);
    safeStorage.set("qp-theme", "dark");
    clearStoredAddMonthDrafts();
    expect(readAddMonthDraft(storageKey)).toBeNull();
    expect(readAddMonthDraft(otherMemberKey)).toBeNull();
    expect(readAddMonthDraft(addMonthDraftKey(null))).toBeNull();
    expect(safeStorage.get("qp-theme")).toBe("dark");
  });

  it("an untouched page is not worth keeping", () => {
    expect(isAddMonthDraftWorthKeeping(EMPTY_ADD_MONTH_STATE)).toBe(false);
  });

  it("a template or one date is worth keeping", () => {
    expect(
      isAddMonthDraftWorthKeeping({
        ...EMPTY_ADD_MONTH_STATE,
        templateSlug: "queer-supper",
      }),
    ).toBe(true);
    expect(isAddMonthDraftWorthKeeping(stateWithPhotos(null))).toBe(true);
  });
});
