import type { Conversation } from "./data";

// ── DEMO pin/favorite persistence ────────────────────────────────────────────
// Demo conversations DO have stable ids (unlike demo messages, which have no
// server id and never reach the row menu at all — see useMessagePinStar), so
// pin/favorite must actually work in demo mode, not sit inert. `useConversations`
// re-derives the demo list from the static `conversations` mock on every
// queryFn run (e.g. a pull-to-refresh `invalidateQueries`), so a plain
// react-query cache patch alone would be wiped on the next refetch. This
// module is the same "small localStorage-backed store, folded back in at read
// time" shape as `outbox.ts` — the override survives both a refetch and a
// reload, WhatsApp-like.

const STORAGE_KEY = "qp.messages.conversationPrefs.v1";

/** A conversation's DEMO pin/favorite override. Only the fields present were
 *  ever explicitly set this session — `applyConversationPrefs` falls back to
 *  the mock's own (always-absent) baseline for anything else. */
export interface ConversationPrefOverride {
  pinnedAt?: string;
  favorite?: boolean;
  muted?: boolean;
  /** ISO timestamp this chat was archived (demo-mode override, like
   *  `pinnedAt`). Undefined = not archived. */
  archivedAt?: string;
  /** ISO timestamp this chat was manually marked unread (demo-mode override,
   *  like `pinnedAt`/`archivedAt` — PRD-225). Undefined = not marked. */
  markedUnreadAt?: string;
}

export type ConversationPrefsMap = Record<string, ConversationPrefOverride>;

function isOverride(value: unknown): value is ConversationPrefOverride {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.pinnedAt === undefined ||
      typeof candidate.pinnedAt === "string") &&
    (candidate.favorite === undefined ||
      typeof candidate.favorite === "boolean") &&
    (candidate.muted === undefined || typeof candidate.muted === "boolean") &&
    (candidate.archivedAt === undefined ||
      typeof candidate.archivedAt === "string") &&
    (candidate.markedUnreadAt === undefined ||
      typeof candidate.markedUnreadAt === "string")
  );
}

/** Read the persisted overrides, tolerating a corrupt/absent/foreign payload. */
export function loadConversationPrefs(): ConversationPrefsMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: ConversationPrefsMap = {};
    for (const [conversationId, override] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (isOverride(override)) result[conversationId] = override;
    }
    return result;
  } catch {
    return {};
  }
}

function saveConversationPrefs(map: ConversationPrefsMap): void {
  try {
    const trimmed: ConversationPrefsMap = {};
    for (const [conversationId, override] of Object.entries(map)) {
      if (
        override.pinnedAt ||
        override.favorite ||
        override.muted ||
        override.archivedAt ||
        override.markedUnreadAt
      ) {
        trimmed[conversationId] = override;
      }
    }
    if (Object.keys(trimmed).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/** Merge one conversation's pin/favorite patch into the persisted overrides —
 *  called from `useConversationPrefs`' demo mutation branch. A field set to
 *  `undefined` explicitly clears it (unpin/unfavorite). */
export function writeConversationPrefOverride(
  conversationId: string,
  patch: ConversationPrefOverride,
): void {
  const map = loadConversationPrefs();
  const next: ConversationPrefsMap = {
    ...map,
    [conversationId]: { ...map[conversationId], ...patch },
  };
  saveConversationPrefs(next);
}

/** Fold the persisted overrides onto a list of mock conversations — called
 *  from `useConversations`' demo queryFn so a pin/favorite survives a refetch
 *  or a reload. The mock `conversations` array never seeds `pinnedAt`/
 *  `favorite` itself, so an absent override simply leaves the mock's own
 *  (always-absent) value in place. */
export function applyConversationPrefs(
  conversations: Conversation[],
): Conversation[] {
  const overrides = loadConversationPrefs();
  if (Object.keys(overrides).length === 0) return conversations;
  return conversations.map((conversation) => {
    const override = overrides[conversation.id];
    if (!override) return conversation;
    return {
      ...conversation,
      pinnedAt: override.pinnedAt ?? conversation.pinnedAt,
      favorite: override.favorite ?? conversation.favorite,
      muted: override.muted ?? conversation.muted,
      archivedAt: override.archivedAt ?? conversation.archivedAt,
      markedUnreadAt: override.markedUnreadAt ?? conversation.markedUnreadAt,
      // PRD-225: a manual mark-unread override makes the demo row unread too,
      // exactly mirroring the live adapter's `unreadCount > 0 || markedUnreadAt`.
      unread: conversation.unread || !!override.markedUnreadAt,
    };
  });
}

/** Wipe the overrides (called when demo mode flips — demo pin/favorite
 *  fiction must never bleed into a real session). Mirrors `clearOutbox`. */
export function clearConversationPrefs(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}
