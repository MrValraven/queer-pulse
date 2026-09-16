import { beforeEach, describe, expect, it } from "vitest";
import type { Conversation } from "./data";
import {
  applyConversationPrefs,
  clearConversationPrefs,
  loadConversationPrefs,
  writeConversationPrefOverride,
} from "./conversationPrefs";

// ENG-265 follow-up: the demo seed itself now pins, favorites, mutes, archives
// and marks rows unread, so an override has to record an explicit clear that
// beats the seed on every demo refetch.

const STORAGE_KEY = "qp.messages.conversationPrefs.v1";
const SEEDED_AT = "2026-09-14T18:30:00.000Z";

function seededRow(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "row",
    initials: "RW",
    tint: "plum",
    name: "Row",
    pronouns: "",
    connectedSince: "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function applyOne(row: Conversation): Conversation {
  return applyConversationPrefs([row])[0]!;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("conversationPrefs explicit clears", () => {
  it("keeps an unpinned seeded row unpinned across a refetch", () => {
    writeConversationPrefOverride("row", { pinnedAt: undefined });
    expect(
      applyOne(seededRow({ pinnedAt: SEEDED_AT })).pinnedAt,
    ).toBeUndefined();
  });

  it("stores a cleared timestamp as null", () => {
    writeConversationPrefOverride("row", { pinnedAt: undefined });
    expect(loadConversationPrefs().row).toEqual({ pinnedAt: null });
  });

  it("keeps un-favorite, unmute and unarchive against a seed that set them", () => {
    writeConversationPrefOverride("row", { favorite: false });
    writeConversationPrefOverride("row", { muted: false });
    writeConversationPrefOverride("row", { archivedAt: undefined });
    const applied = applyOne(
      seededRow({ favorite: true, muted: true, archivedAt: SEEDED_AT }),
    );
    expect(applied.favorite).toBe(false);
    expect(applied.muted).toBe(false);
    expect(applied.archivedAt).toBeUndefined();
  });

  it("recomputes unread from the count when a seeded mark-unread is cleared", () => {
    writeConversationPrefOverride("row", { markedUnreadAt: undefined });
    const markedOnly = applyOne(
      seededRow({ unread: true, markedUnreadAt: SEEDED_AT }),
    );
    expect(markedOnly.markedUnreadAt).toBeUndefined();
    expect(markedOnly.unread).toBe(false);

    const withCount = applyOne(
      seededRow({ unread: true, unreadCount: 2, markedUnreadAt: SEEDED_AT }),
    );
    expect(withCount.unread).toBe(true);
  });

  it("falls back to the seed for fields never overridden", () => {
    writeConversationPrefOverride("row", { favorite: true });
    const applied = applyOne(seededRow({ pinnedAt: SEEDED_AT, muted: true }));
    expect(applied.pinnedAt).toBe(SEEDED_AT);
    expect(applied.muted).toBe(true);
    expect(applied.favorite).toBe(true);
  });

  it("lets a later pin replace an earlier clear", () => {
    writeConversationPrefOverride("row", { pinnedAt: undefined });
    writeConversationPrefOverride("row", { pinnedAt: SEEDED_AT });
    expect(applyOne(seededRow()).pinnedAt).toBe(SEEDED_AT);
  });

  it("marks a row unread when the override sets the mark", () => {
    writeConversationPrefOverride("row", { markedUnreadAt: SEEDED_AT });
    const applied = applyOne(seededRow());
    expect(applied.markedUnreadAt).toBe(SEEDED_AT);
    expect(applied.unread).toBe(true);
  });
});

describe("conversationPrefs storage", () => {
  it("drops a malformed entry and keeps a valid one", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        broken: { pinnedAt: 42 },
        good: { favorite: false, archivedAt: null },
      }),
    );
    expect(loadConversationPrefs()).toEqual({
      good: { favorite: false, archivedAt: null },
    });
  });

  it("tolerates a payload that is not JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadConversationPrefs()).toEqual({});
  });

  it("clearConversationPrefs wipes every override", () => {
    writeConversationPrefOverride("row", { favorite: false });
    clearConversationPrefs();
    expect(loadConversationPrefs()).toEqual({});
  });
});
