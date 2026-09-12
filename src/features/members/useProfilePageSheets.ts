import { useState } from "react";
import { useDeferredDraftSave } from "../../app/providers/useDeferredDraftSave";

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
 * away", so it must not sit staged behind the normal Save button). That whole
 * lifecycle lives in `useDeferredDraftSave`: patch the shared draft, persist
 * once the draft actually carries the patch, and put the previous value back
 * if the save fails, so a toggle that did not store never keeps reading as if
 * it did. See that hook for why waiting on `save`'s identity (which this hook
 * used to do) fires too early and silently persists nothing.
 *
 * A failed hide never reaches the member as a message: the toggle simply flips
 * back, since `ProfileSettingsMenu` renders straight off the committed
 * `hiddenUntil`. Wiring an error toast in would need its own copy in both
 * languages, so it is left to whoever writes that string.
 */
export function useProfilePageSheets(): ProfilePageSheets {
  const [isWhoSeesWhatOpen, setIsWhoSeesWhatOpen] = useState(false);
  const [isAccountDataOpen, setIsAccountDataOpen] = useState(false);
  const saveDraftPatch = useDeferredDraftSave();

  const toggleHidden = (currentHiddenUntil: string | null | undefined) => {
    const nextValue =
      currentHiddenUntil && new Date(currentHiddenUntil) > new Date()
        ? null
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    saveDraftPatch({ hiddenUntil: nextValue });
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
