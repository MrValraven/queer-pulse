const STORAGE_KEY = "qp:search:recents";
const MAX_RECENTS = 6;

/** Recent live-search queries, most-recent-first. Fails soft if storage is unavailable. */
export function readRecents(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

export function pushRecent(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const next = [
      trimmed,
      ...readRecents().filter(
        (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, MAX_RECENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are a non-critical nicety */
  }
}

/**
 * Forget every recent search in this browser. Sign-out and Quick Exit call
 * it, so the next person on a shared device never sees what the previous
 * member searched for.
 */
export function clearRecents(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: nothing was kept to forget */
  }
}
