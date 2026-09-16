import type { Conversation } from "./data";

// ── DEMO conversation prefs persistence ──────────────────────────────────────
// Demo conversations carry stable ids, so pin, favorite, mute, archive and
// mark-unread must actually work in demo mode. `useConversations` re-derives
// the demo list from the static `conversations` seed on every queryFn run (e.g.
// a pull-to-refresh `invalidateQueries`), so a plain react-query cache patch
// alone would be wiped on the next refetch. This module is the same "small
// localStorage-backed store, folded back in at read time" shape as `outbox.ts`:
// the override survives both a refetch and a reload, WhatsApp-like. The seed
// itself pins, favorites, mutes, archives and marks some rows unread, so an
// override records a clear explicitly (`null` or `false`) and wins over the seed.

const STORAGE_KEY = "qp.messages.conversationPrefs.v1";

/** A conversation's DEMO prefs override. A key that is present was set this
 *  session and wins over the seed, an explicit clear included (`null` for a
 *  timestamp, `false` for a flag); an absent key falls back to the seed. */
export interface ConversationPrefOverride {
  pinnedAt?: string | null;
  favorite?: boolean;
  muted?: boolean;
  /** ISO timestamp this chat was archived (demo-mode override, like
   *  `pinnedAt`). `null` = explicitly unarchived. */
  archivedAt?: string | null;
  /** ISO timestamp this chat was manually marked unread (demo-mode override,
   *  like `pinnedAt`/`archivedAt`, PRD-225). `null` = explicitly cleared. */
  markedUnreadAt?: string | null;
}

export type ConversationPrefsMap = Record<string, ConversationPrefOverride>;

type TimestampPrefKey = "pinnedAt" | "archivedAt" | "markedUnreadAt";
type FlagPrefKey = "favorite" | "muted";

const TIMESTAMP_PREF_KEYS: TimestampPrefKey[] = [
  "pinnedAt",
  "archivedAt",
  "markedUnreadAt",
];
const FLAG_PREF_KEYS: FlagPrefKey[] = ["favorite", "muted"];

function isOverride(value: unknown): value is ConversationPrefOverride {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    TIMESTAMP_PREF_KEYS.every(
      (key) =>
        candidate[key] === undefined ||
        candidate[key] === null ||
        typeof candidate[key] === "string",
    ) &&
    FLAG_PREF_KEYS.every(
      (key) =>
        candidate[key] === undefined || typeof candidate[key] === "boolean",
    )
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
      // A clear (`null`/`false`) is kept: it is what wins over a seeded value.
      if (Object.values(override).some((value) => value !== undefined)) {
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

/** Merge one conversation's prefs patch into the persisted overrides, called
 *  from `useConversationPrefs`' demo mutation branches. Every key the patch
 *  carries is recorded, including one set to `undefined` (unpin, unarchive,
 *  mark read), which is stored as an explicit clear so it outlives the seed. */
export function writeConversationPrefOverride(
  conversationId: string,
  patch: ConversationPrefOverride,
): void {
  const explicitPatch: ConversationPrefOverride = {};
  for (const key of TIMESTAMP_PREF_KEYS) {
    if (key in patch) explicitPatch[key] = patch[key] ?? null;
  }
  for (const key of FLAG_PREF_KEYS) {
    if (key in patch) explicitPatch[key] = patch[key] ?? false;
  }
  const map = loadConversationPrefs();
  const next: ConversationPrefsMap = {
    ...map,
    [conversationId]: { ...map[conversationId], ...explicitPatch },
  };
  saveConversationPrefs(next);
}

/** Fold the persisted overrides onto the demo seed rows, called from
 *  `useConversations`' demo queryFn so a toggle survives a refetch or a
 *  reload. A key present in the override wins, an explicit clear included;
 *  an absent key leaves the seed's own value in place. */
export function applyConversationPrefs(
  conversations: Conversation[],
): Conversation[] {
  const overrides = loadConversationPrefs();
  if (Object.keys(overrides).length === 0) return conversations;
  return conversations.map((conversation) => {
    const override = overrides[conversation.id];
    if (!override) return conversation;
    const hasMarkOverride = "markedUnreadAt" in override;
    const markedUnreadAt = hasMarkOverride
      ? (override.markedUnreadAt ?? undefined)
      : conversation.markedUnreadAt;
    return {
      ...conversation,
      pinnedAt:
        "pinnedAt" in override
          ? (override.pinnedAt ?? undefined)
          : conversation.pinnedAt,
      favorite:
        "favorite" in override ? override.favorite : conversation.favorite,
      muted: "muted" in override ? override.muted : conversation.muted,
      archivedAt:
        "archivedAt" in override
          ? (override.archivedAt ?? undefined)
          : conversation.archivedAt,
      markedUnreadAt,
      // PRD-225: once the override owns the mark, mirror the live adapter's
      // `unreadCount > 0 || markedUnreadAt`, so clearing a seeded mark reads
      // the row as read again and setting one reads it as unread.
      unread: hasMarkOverride
        ? (conversation.unreadCount ?? 0) > 0 || !!markedUnreadAt
        : conversation.unread,
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
