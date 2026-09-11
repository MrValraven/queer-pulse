import { safeStorage } from "../../shared/storage/safeStorage";
import { CREATE_GATHERING_DRAFT_KEY_PREFIX } from "./createGathering.data";

/**
 * Where the create wizard keeps its drafts in this browser, and how they are
 * forgotten.
 *
 * Kept apart from `useCreateGatheringDraft` so `AuthProvider` can clear drafts
 * on sign-out without loading the gathering catalog the hook reads: this file
 * pulls in only the key prefix and the guarded storage seam.
 */

/** Where this member's draft lives. Signed-out or unresolved sessions share
 *  the `anon` slot. */
export function createGatheringDraftKey(
  memberId: string | null | undefined,
): string {
  return `${CREATE_GATHERING_DRAFT_KEY_PREFIX}:${memberId || "anon"}`;
}

/** Forget a stored draft (publish calls this). */
export function removeStoredDraft(storageKey: string): void {
  safeStorage.remove(storageKey);
}

/**
 * Forget every stored draft in this browser: the `anon` slot and each
 * member's. Signing out calls this (ruling F4), so the next person on a shared
 * device finds nobody else's unpublished gathering. A session that expires on
 * its own keeps its draft, so a member who signs back in picks up where they
 * left off.
 *
 * Keys are collected before any is removed, since each removal shifts the
 * indexes `localStorage.key` reads. Blocked storage leaves everything as it is.
 */
export function clearStoredGatheringDrafts(): void {
  const draftKeyStart = `${CREATE_GATHERING_DRAFT_KEY_PREFIX}:`;
  const draftKeys: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const storageKey = window.localStorage.key(index);
      if (storageKey?.startsWith(draftKeyStart)) draftKeys.push(storageKey);
    }
  } catch {
    return;
  }
  for (const draftKey of draftKeys) safeStorage.remove(draftKey);
}
