import { useEffect, useRef, useState } from "react";
import type { ProfileDraft } from "../../app/providers/useProfile";

interface UseProfilePageSheetsArgs {
  /** `ProfileProvider`'s draft patcher — how the 24h hide is staged. */
  updateDraft: (patch: Partial<ProfileDraft>) => void;
  /** `ProfileProvider`'s save. Its identity changes once a patch is committed,
   *  which is what the effect below keys on. Its resolved value is ignored here
   *  (the provider reports failures itself), so the return type stays open. */
  save: () => unknown;
}

export interface ProfilePageSheets {
  isWhoSeesWhatOpen: boolean;
  openWhoSeesWhat: () => void;
  closeWhoSeesWhat: () => void;
  isAccountDataOpen: boolean;
  openAccountData: () => void;
  closeAccountData: () => void;
  /** Flip the owner's 24h self-hide, persisting immediately. Pass the profile's
   *  current `hiddenUntil` (the page resolves it after its loading guards). */
  toggleHidden: (currentHiddenUntil: string | null | undefined) => void;
}

/**
 * The owner-only sheet state on `/members/:slug`: "Who sees what", "Your data",
 * and the 24h hide toggle they sit beside in `ProfileSettingsMenu`. Lifted out
 * of `ProfilePage` so the page component stays inside the repo's 200-line rule.
 *
 * The hide toggle persists immediately (its own copy says "takes effect right
 * away", so it must not sit staged behind the normal Save button). `save()` is
 * a `useCallback` closed over the CURRENT `draft` (see `ProfileProvider.tsx`),
 * so calling it in the same tick as `updateDraft()` would ship the PRE-toggle
 * draft: React hasn't re-rendered between the two calls, so the `save`
 * reference is still stale. This is the same trap `useInstantVisibilitySave`
 * (in `WhoSeesWhatFieldToggles.tsx`) works around for the sheet's own instant
 * toggles. Queue the intent, then let an effect keyed on the fresh `save`
 * identity — which only changes once the provider has committed the patch —
 * fire the actual persist on the next render.
 */
export function useProfilePageSheets({
  updateDraft,
  save,
}: UseProfilePageSheetsArgs): ProfilePageSheets {
  const [isWhoSeesWhatOpen, setIsWhoSeesWhatOpen] = useState(false);
  const [isAccountDataOpen, setIsAccountDataOpen] = useState(false);

  const hasPendingHiddenToggle = useRef(false);
  useEffect(() => {
    if (!hasPendingHiddenToggle.current) return;
    hasPendingHiddenToggle.current = false;
    void save();
  }, [save]);

  const toggleHidden = (currentHiddenUntil: string | null | undefined) => {
    const nextValue =
      currentHiddenUntil && new Date(currentHiddenUntil) > new Date()
        ? null
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    hasPendingHiddenToggle.current = true;
    updateDraft({ hiddenUntil: nextValue });
  };

  return {
    isWhoSeesWhatOpen,
    openWhoSeesWhat: () => setIsWhoSeesWhatOpen(true),
    closeWhoSeesWhat: () => setIsWhoSeesWhatOpen(false),
    isAccountDataOpen,
    openAccountData: () => setIsAccountDataOpen(true),
    closeAccountData: () => setIsAccountDataOpen(false),
    toggleHidden,
  };
}
