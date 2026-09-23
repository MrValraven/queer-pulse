import { safeStorage } from "../../shared/storage/safeStorage";

// Device-local recents, the same shape as `emojiRecents.ts`: never synced,
// never shared across devices, rewritten on every pick so the strip is always
// true most-recent-first. Only IDS are stored, because the sticker itself is
// already in the cached catalogue and storing a stale url would outlive a
// re-render of that sticker.
const STORAGE_KEY = "qp.messages.stickerRecents.v1";
const MAX_RECENT_COUNT = 24;

export function loadStickerRecents(): string[] {
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function recordStickerRecent(stickerId: string): void {
  const current = loadStickerRecents();
  const withoutDuplicate = current.filter((value) => value !== stickerId);
  safeStorage.set(
    STORAGE_KEY,
    JSON.stringify([stickerId, ...withoutDuplicate].slice(0, MAX_RECENT_COUNT)),
  );
}
