import type { ListingDraft } from "../marketing/listBusiness/listBusiness.data";
import { safeStorage } from "../../shared/storage/safeStorage";

/**
 * The browser-only copies that creator drafts used before they moved to the
 * server. The listing editor wrote `qp-listing-edit-draft.v1.<ref>` (plus
 * `.u.<scopeId>` for a live member) to localStorage and the community wizard
 * wrote `qp.community-draft.<slug>` to sessionStorage. Nothing writes these
 * keys any more: this module reads a leftover copy once so the editors can
 * offer it, and clears every copy on sign-out.
 */
export const LEGACY_LISTING_EDIT_DRAFT_KEY_BASE = "qp-listing-edit-draft.v1";
export const LEGACY_COMMUNITY_DRAFT_KEY_PREFIX = "qp.community-draft";

export interface LegacyListingEditDraft {
  draft: ListingDraft;
  savedAt: number;
  baseline: string;
}

/** Mirrors `useScopedLocalStorage`: demo keeps the base key, a member gets `.u.<scopeId>`, nobody gets null. */
export function legacyListingEditDraftKey(
  listingRef: string,
  scopeId: string | null,
): string | null {
  if (scopeId === null) return null;
  const baseKey = `${LEGACY_LISTING_EDIT_DRAFT_KEY_BASE}.${listingRef}`;
  return scopeId === "demo" ? baseKey : `${baseKey}.u.${scopeId}`;
}

export function readLegacyListingEditDraft(
  listingRef: string,
  scopeId: string | null,
): LegacyListingEditDraft | null {
  const storageKey = legacyListingEditDraftKey(listingRef, scopeId);
  if (storageKey === null) return null;
  const rawValue = safeStorage.get(storageKey);
  if (rawValue === null) return null;
  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Partial<LegacyListingEditDraft>;
    if (
      typeof candidate.savedAt !== "number" ||
      typeof candidate.baseline !== "string" ||
      typeof candidate.draft !== "object" ||
      candidate.draft === null
    ) {
      return null;
    }
    return {
      draft: candidate.draft,
      savedAt: candidate.savedAt,
      baseline: candidate.baseline,
    };
  } catch {
    return null;
  }
}

export function removeLegacyListingEditDraft(
  listingRef: string,
  scopeId: string | null,
): void {
  const storageKey = legacyListingEditDraftKey(listingRef, scopeId);
  if (storageKey !== null) safeStorage.remove(storageKey);
}

function removeKeysWithPrefix(
  pickStorage: () => Storage,
  prefix: string,
): void {
  try {
    const activeStorage = pickStorage();
    const matchingKeys: string[] = [];
    // Collect first: removing while walking shifts the indexes.
    for (let index = 0; index < activeStorage.length; index += 1) {
      const storageKey = activeStorage.key(index);
      if (storageKey !== null && storageKey.startsWith(prefix)) {
        matchingKeys.push(storageKey);
      }
    }
    for (const storageKey of matchingKeys) {
      try {
        activeStorage.removeItem(storageKey);
      } catch {
        /* storage blocked: nothing to clear */
      }
    }
  } catch {
    /* storage blocked: nothing to clear */
  }
}

/** Sign-out: every old listing edit copy (any member) and community copy (any tab slot). */
export function clearLegacyCreatorDraftCopies(): void {
  removeKeysWithPrefix(
    () => window.localStorage,
    `${LEGACY_LISTING_EDIT_DRAFT_KEY_BASE}.`,
  );
  removeKeysWithPrefix(
    () => window.sessionStorage,
    `${LEGACY_COMMUNITY_DRAFT_KEY_PREFIX}.`,
  );
}
