// src/features/messages/emojiRecents.ts
import { safeStorage } from "../../shared/storage/safeStorage";

// ── Recently-used emoji (device-local) ───────────────────────────────────────
// Same "small localStorage-backed store, folded back in at read time" shape as
// `conversationPrefs.ts`: WhatsApp/Telegram both keep a per-device recents
// strip that survives a reload, never synced to the server and never shared
// across devices. The picker reads this once on open and rewrites it on every
// pick, so the strip is always the true most-recent-first order.

const STORAGE_KEY = "qp.messages.emojiRecents.v1";
const MAX_RECENT_COUNT = 24;

/** Just enough of `EmojiEntry` to render a recent button and give it an
 *  accessible name in either language, without depending on the full 81KB
 *  dataset being loaded — a recent glyph can render from this alone. */
export interface RecentEmoji {
  glyph: string;
  label: string;
  labelPt: string;
}

function isRecentEmoji(value: unknown): value is RecentEmoji {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.glyph === "string" &&
    typeof candidate.label === "string" &&
    typeof candidate.labelPt === "string"
  );
}

/** Read the persisted recents, most-recent-first, tolerating a corrupt/absent/
 *  foreign payload. */
export function loadEmojiRecents(): RecentEmoji[] {
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentEmoji);
  } catch {
    return [];
  }
}

/** Moves `entry` to the front of the recents strip (or inserts it there),
 *  deduplicated by glyph, capped at `MAX_RECENT_COUNT` — called on every pick
 *  so the strip always reflects true recency. */
export function recordEmojiRecent(entry: RecentEmoji): void {
  const current = loadEmojiRecents();
  const withoutDuplicate = current.filter(
    (candidate) => candidate.glyph !== entry.glyph,
  );
  const next = [entry, ...withoutDuplicate].slice(0, MAX_RECENT_COUNT);
  safeStorage.set(STORAGE_KEY, JSON.stringify(next));
}
