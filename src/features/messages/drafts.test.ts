import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearDraft,
  clearDrafts,
  loadDraft,
  loadDraftOrServerFallback,
  loadDrafts,
  saveDraft,
  setMessageDraftsScope,
} from "./drafts";

/**
 * The local-only, per-conversation composer draft store (SOC-16's instant
 * layer). `useDraftSync.test.ts` covers the server-sync layer built on top of
 * this; these cases are the localStorage persistence itself.
 */

beforeEach(() => {
  window.localStorage.clear();
  setMessageDraftsScope(null);
});

afterEach(() => {
  window.localStorage.clear();
  setMessageDraftsScope(null);
});

describe("saveDraft / loadDraft", () => {
  it("persists and reads back a conversation's draft text", () => {
    saveDraft("c1", "hello there");
    expect(loadDraft("c1")).toBe("hello there");
  });

  it("returns an empty string for a conversation with no stored draft", () => {
    expect(loadDraft("unknown-conversation")).toBe("");
  });

  it("drops the stored entry entirely when saved with empty text", () => {
    saveDraft("c1", "hello there");
    saveDraft("c1", "");
    expect(loadDraft("c1")).toBe("");
    expect(loadDrafts()).toEqual({});
  });

  it("keeps other conversations' drafts when one is cleared", () => {
    saveDraft("c1", "first");
    saveDraft("c2", "second");
    saveDraft("c1", "");
    expect(loadDraft("c1")).toBe("");
    expect(loadDraft("c2")).toBe("second");
  });
});

describe("clearDraft / clearDrafts", () => {
  it("clearDraft drops just the one conversation's draft", () => {
    saveDraft("c1", "first");
    saveDraft("c2", "second");
    clearDraft("c1");
    expect(loadDraft("c1")).toBe("");
    expect(loadDraft("c2")).toBe("second");
  });

  it("clearDrafts wipes every stored draft", () => {
    saveDraft("c1", "first");
    saveDraft("c2", "second");
    clearDrafts();
    expect(loadDrafts()).toEqual({});
  });
});

// `drafts.ts`'s own `STORAGE_KEY` constant is module-private (not exported),
// so this literal mirrors it exactly: `const STORAGE_KEY = "qp.messages.drafts.v1";`
const STORAGE_KEY = "qp.messages.drafts.v1";

describe("loadDrafts: tolerates a corrupt or foreign payload", () => {
  it("returns {} for invalid JSON instead of throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadDrafts()).toEqual({});
  });

  it("returns {} for a JSON value that isn't an object", () => {
    window.localStorage.setItem(STORAGE_KEY, "42");
    expect(loadDrafts()).toEqual({});
  });

  it("drops non-string / empty-string entries from a foreign payload", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ c1: "kept", c2: 5, c3: "" }),
    );
    expect(loadDrafts()).toEqual({ c1: "kept" });
  });
});

describe("loadDraftOrServerFallback: local-first, server-fallback (SOC-16)", () => {
  it("prefers the local draft over the server one when both exist", () => {
    saveDraft("c1", "local text");
    expect(loadDraftOrServerFallback("c1", "server text")).toBe("local text");
  });

  it("falls back to the server draft when there is no local copy", () => {
    expect(loadDraftOrServerFallback("c1", "server text")).toBe("server text");
  });

  it("is empty when neither a local nor a server draft exists", () => {
    expect(loadDraftOrServerFallback("c1", null)).toBe("");
    expect(loadDraftOrServerFallback("c1", undefined)).toBe("");
  });
});

describe("setMessageDraftsScope: per-member isolation on a shared device", () => {
  it("keeps two scopes' drafts in separate storage buckets", () => {
    setMessageDraftsScope("user-a");
    saveDraft("c1", "user a's draft");
    setMessageDraftsScope("user-b");
    expect(loadDraft("c1")).toBe("");
    saveDraft("c1", "user b's draft");
    setMessageDraftsScope("user-a");
    expect(loadDraft("c1")).toBe("user a's draft");
  });

  it("treats the 'demo' scope the same as no scope (the base key)", () => {
    setMessageDraftsScope(null);
    saveDraft("c1", "base draft");
    setMessageDraftsScope("demo");
    expect(loadDraft("c1")).toBe("base draft");
  });
});
