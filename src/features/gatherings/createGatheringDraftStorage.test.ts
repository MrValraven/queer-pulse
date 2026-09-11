import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredGatheringDrafts,
  createGatheringDraftKey,
  removeStoredDraft,
} from "./createGatheringDraftStorage";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createGatheringDraftKey", () => {
  it("scopes the draft to the member, with signed-out sessions sharing anon", () => {
    expect(createGatheringDraftKey("member-1")).toBe(
      "qp-create-gathering-draft-v1:member-1",
    );
    expect(createGatheringDraftKey(null)).toBe(
      "qp-create-gathering-draft-v1:anon",
    );
    expect(createGatheringDraftKey("")).toBe(
      "qp-create-gathering-draft-v1:anon",
    );
  });
});

describe("removeStoredDraft", () => {
  it("forgets one member's draft and keeps the others", () => {
    const memberKey = createGatheringDraftKey("member-1");
    const otherMemberKey = createGatheringDraftKey("member-2");
    window.localStorage.setItem(memberKey, "{}");
    window.localStorage.setItem(otherMemberKey, "{}");

    removeStoredDraft(memberKey);

    expect(window.localStorage.getItem(memberKey)).toBeNull();
    expect(window.localStorage.getItem(otherMemberKey)).toBe("{}");
  });
});

describe("clearStoredGatheringDrafts", () => {
  it("removes the anon slot and every member's draft", () => {
    const draftKeys = [
      createGatheringDraftKey(null),
      createGatheringDraftKey("member-1"),
      createGatheringDraftKey("member-2"),
    ];
    for (const draftKey of draftKeys) {
      window.localStorage.setItem(draftKey, "{}");
    }

    clearStoredGatheringDrafts();

    for (const draftKey of draftKeys) {
      expect(window.localStorage.getItem(draftKey)).toBeNull();
    }
  });

  it("keeps every value that is not a gathering draft", () => {
    window.localStorage.setItem("qp_logged_in", "true");
    window.localStorage.setItem("qp-theme", "dark");
    window.localStorage.setItem(createGatheringDraftKey("member-1"), "{}");

    clearStoredGatheringDrafts();

    expect(window.localStorage.getItem("qp_logged_in")).toBe("true");
    expect(window.localStorage.getItem("qp-theme")).toBe("dark");
    expect(window.localStorage.length).toBe(2);
  });

  it("clears drafts stored next to each other, whose indexes shift as each goes", () => {
    for (let memberNumber = 1; memberNumber <= 5; memberNumber += 1) {
      window.localStorage.setItem(
        createGatheringDraftKey(`member-${memberNumber}`),
        "{}",
      );
    }
    window.localStorage.setItem("qp-theme", "dark");

    clearStoredGatheringDrafts();

    expect(window.localStorage.length).toBe(1);
    expect(window.localStorage.getItem("qp-theme")).toBe("dark");
  });

  it("leaves storage alone and does not throw when site data is blocked", () => {
    window.localStorage.setItem(createGatheringDraftKey("member-1"), "{}");
    vi.spyOn(Storage.prototype, "key").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });

    expect(() => clearStoredGatheringDrafts()).not.toThrow();
    vi.restoreAllMocks();
    expect(
      window.localStorage.getItem(createGatheringDraftKey("member-1")),
    ).toBe("{}");
  });
});
