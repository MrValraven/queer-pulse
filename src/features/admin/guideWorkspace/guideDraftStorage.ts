import type { GuideDraft } from "./guideDraft";
import { GUIDE_DRAFT_STORAGE_PREFIX } from "./guideWorkspace.data";

export interface StoredGuideDraft {
  storedAt: string;
  /** The guide's `updatedAt` when the copy was written; null for a new guide. */
  baseUpdatedAt: string | null;
  draft: GuideDraft;
}

export function guideDraftStorageKey(guideId: string | null): string {
  return `${GUIDE_DRAFT_STORAGE_PREFIX}${guideId ?? "new"}`;
}

export function isStoredGuideDraft(value: unknown): value is StoredGuideDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const draft = candidate.draft as Record<string, unknown> | undefined;
  return (
    typeof candidate.storedAt === "string" &&
    (candidate.baseUpdatedAt === null ||
      typeof candidate.baseUpdatedAt === "string") &&
    typeof draft === "object" &&
    draft !== null &&
    typeof draft.title === "string" &&
    Array.isArray(draft.sections) &&
    Array.isArray(draft.sectionsPt)
  );
}

// Every access is guarded: storage can be blocked, full or absent (private
// windows, thumbnails), and recovery is a convenience that must never break
// the editor.

export function readStoredGuideDraft(key: string): StoredGuideDraft | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredGuideDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredGuideDraft(
  key: string,
  value: StoredGuideDraft,
): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best effort.
  }
}

export function removeStoredGuideDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Best effort.
  }
}
