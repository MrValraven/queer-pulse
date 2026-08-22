import { useState } from "react";
import type { StoredDraft } from "./useListingDraft";

export interface ListingDraftBanner {
  /** True while the "you have an unfinished draft" banner should show. */
  isBannerVisible: boolean;
  /** Load the saved draft into the wizard, then dismiss the banner. */
  resumeDraft: () => void;
  /** Throw the saved draft away, then dismiss the banner. */
  discardDraft: () => void;
}

/**
 * The in-wizard resume banner. It is offered once per mount, when an autosaved
 * draft exists (demo only — live drafts are picked up from the landing list),
 * and either choice dismisses it for good, so nobody is asked twice about the
 * same draft in one sitting.
 */
export function useListingDraftBanner(
  saved: StoredDraft | null,
  clearDraft: () => void,
  onResume: (saved: StoredDraft) => void,
): ListingDraftBanner {
  const [isBannerVisible, setIsBannerVisible] = useState(Boolean(saved));

  return {
    isBannerVisible,
    resumeDraft: () => {
      if (saved) onResume(saved);
      setIsBannerVisible(false);
    },
    discardDraft: () => {
      clearDraft();
      setIsBannerVisible(false);
    },
  };
}
