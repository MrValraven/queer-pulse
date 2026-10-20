import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLegacyCreatorDraftCopies,
  legacyListingEditDraftKey,
  readLegacyListingEditDraft,
} from "./legacyCreatorDraftStorage";

describe("legacy creator draft storage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("derives the old listing edit key for demo and for a member", () => {
    expect(legacyListingEditDraftKey("casa", "demo")).toBe(
      "qp-listing-edit-draft.v1.casa",
    );
    expect(legacyListingEditDraftKey("casa", "user-1")).toBe(
      "qp-listing-edit-draft.v1.casa.u.user-1",
    );
    expect(legacyListingEditDraftKey("casa", null)).toBeNull();
  });

  it("reads a well-formed old copy and refuses a broken one", () => {
    window.localStorage.setItem(
      "qp-listing-edit-draft.v1.casa.u.user-1",
      JSON.stringify({ draft: { name: "Casa" }, savedAt: 1, baseline: "x" }),
    );
    expect(readLegacyListingEditDraft("casa", "user-1")?.draft).toMatchObject({
      name: "Casa",
    });
    window.localStorage.setItem("qp-listing-edit-draft.v1.casa.u.user-1", "{");
    expect(readLegacyListingEditDraft("casa", "user-1")).toBeNull();
  });

  it("clears listing edit keys for every member and community keys for every tab slot", () => {
    window.localStorage.setItem("qp-listing-edit-draft.v1.a.u.one", "{}");
    window.localStorage.setItem("qp-listing-edit-draft.v1.b", "{}");
    window.localStorage.setItem("qp-theme", "dark");
    window.sessionStorage.setItem("qp.community-draft.marta", "{}");
    window.sessionStorage.setItem("qp.community-draft.anon", "{}");
    clearLegacyCreatorDraftCopies();
    expect(
      window.localStorage.getItem("qp-listing-edit-draft.v1.a.u.one"),
    ).toBeNull();
    expect(
      window.localStorage.getItem("qp-listing-edit-draft.v1.b"),
    ).toBeNull();
    expect(window.localStorage.getItem("qp-theme")).toBe("dark");
    expect(window.sessionStorage.length).toBe(0);
  });

  it("leaves storage alone and does not throw when site data is blocked", () => {
    vi.spyOn(Storage.prototype, "key").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => clearLegacyCreatorDraftCopies()).not.toThrow();
  });
});
