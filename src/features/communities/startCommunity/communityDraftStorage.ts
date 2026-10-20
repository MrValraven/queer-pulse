import type { CommunityDraft } from "./startCommunity.data";

/** What a parked wizard needs to come back exactly where it was. */
export interface StoredCommunityDraft {
  draft: CommunityDraft;
  step: number;
}

/**
 * The server holds the Start-a-Community draft now (`/me/creator-drafts/community`,
 * through `useStartCommunityDraft`). An earlier build parked the wizard in
 * `sessionStorage` under `qp.community-draft.<slug>`, and that copy holds the
 * founder's own words about who a space is for. This file only reads that old
 * tab copy back once, so the wizard can restore it and upload it on its first
 * autosave, and clears it once that save lands. Nothing writes the key any
 * more, and sign-out clears every copy of it.
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

export function clearCommunityDraft(ownerSlug: string): void {
  try {
    sessionStorage.removeItem(keyFor(ownerSlug));
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
