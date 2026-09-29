import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDraftsForScope,
  loadDraft,
  saveDraft,
  setMessageDraftsScope,
} from "./drafts";

// ENG-404: an explicit sign-out wipes the signing-out member's composer drafts
// straight from `AuthProvider`, so the wipe keys off the scope it is handed
// and works whichever scope the module currently points at.

const BASE_KEY = "qp.messages.drafts.v1";

beforeEach(() => {
  window.localStorage.clear();
  setMessageDraftsScope(null);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  setMessageDraftsScope(null);
});

describe("clearDraftsForScope", () => {
  it("removes the given member's drafts while the store points elsewhere", () => {
    setMessageDraftsScope("member-a");
    saveDraft("conversation-1", "unsent to Sam");
    saveDraft("conversation-2", "unsent to Rui");
    setMessageDraftsScope(null);

    clearDraftsForScope("member-a");

    expect(window.localStorage.getItem(`${BASE_KEY}.u.member-a`)).toBeNull();
    setMessageDraftsScope("member-a");
    expect(loadDraft("conversation-1")).toBe("");
    expect(loadDraft("conversation-2")).toBe("");
  });

  it("also removes the un-suffixed base key", () => {
    saveDraft("conversation-1", "written before per-member scoping");

    clearDraftsForScope("member-a");

    expect(window.localStorage.getItem(BASE_KEY)).toBeNull();
  });

  it("leaves another member's bucket in place", () => {
    setMessageDraftsScope("member-b");
    saveDraft("conversation-1", "belongs to member b");

    clearDraftsForScope("member-a");

    expect(loadDraft("conversation-1")).toBe("belongs to member b");
  });

  it("clears the demo drafts for the demo scope", () => {
    setMessageDraftsScope("demo");
    saveDraft("conversation-1", "demo text");

    clearDraftsForScope("demo");

    expect(window.localStorage.getItem(BASE_KEY)).toBeNull();
  });

  it("clears the base key when no member id is known", () => {
    saveDraft("conversation-1", "signed-out leftover");

    clearDraftsForScope(null);

    expect(window.localStorage.getItem(BASE_KEY)).toBeNull();
  });

  it("does not throw when storage is blocked, and still tries every key", () => {
    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });

    expect(() => clearDraftsForScope("member-a")).not.toThrow();
    expect(removeItem).toHaveBeenCalledWith(`${BASE_KEY}.u.member-a`);
    expect(removeItem).toHaveBeenCalledWith(BASE_KEY);
  });
});
