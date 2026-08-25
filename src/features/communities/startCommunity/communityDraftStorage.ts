import type { CommunityDraft } from "./startCommunity.data";

/** What a parked wizard needs to come back exactly where it was. */
export interface StoredCommunityDraft {
  draft: CommunityDraft;
  step: number;
}

/**
 * The Start-a-Community wizard is nine chapters long and, until this existed,
 * lived only in component state: a reload, a phone backgrounding the PWA hard
 * enough to be killed, or a session refresh that bounced through OAuth all
 * threw the whole thing away. `useUnsavedChangesGuard` only ever caught a
 * deliberate navigation, never any of those.
 *
 * `sessionStorage` (not `localStorage`) on purpose: the draft belongs to this
 * tab and this sitting, and it holds the founder's own words about who a space
 * is for. It should not outlive the browsing session or follow them into a new
 * tab, and it is keyed per member so a shared device never hands one person's
 * half-written community to the next.
 */
const KEY_PREFIX = "qp.community-draft";

function keyFor(ownerSlug: string): string {
  return `${KEY_PREFIX}.${ownerSlug || "anon"}`;
}

export function readCommunityDraft(
  ownerSlug: string,
): StoredCommunityDraft | null {
  try {
    const raw = sessionStorage.getItem(keyFor(ownerSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCommunityDraft>;
    if (!parsed || typeof parsed !== "object" || !parsed.draft) return null;
    return {
      draft: parsed.draft,
      step: typeof parsed.step === "number" ? parsed.step : 0,
    };
  } catch {
    // A malformed or unreadable entry (private-mode storage, a shape from an
    // older build) must never block someone from starting a community.
    return null;
  }
}

export function writeCommunityDraft(
  ownerSlug: string,
  value: StoredCommunityDraft,
): void {
  try {
    sessionStorage.setItem(keyFor(ownerSlug), JSON.stringify(value));
  } catch {
    // Storage full or blocked — the wizard still works, it just won't survive
    // a reload. Nothing to tell the founder about mid-typing.
  }
}

export function clearCommunityDraft(ownerSlug: string): void {
  try {
    sessionStorage.removeItem(keyFor(ownerSlug));
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
