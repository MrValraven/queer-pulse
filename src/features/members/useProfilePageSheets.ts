import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
 * A failed hide (or a patch the provider dropped before any save started, see
 * `onPatchLost` on the shared hook) is surfaced with the same toast pattern
 * `useInstantVisibilitySave` uses for "Who sees what": the control itself
 * lives inside `ProfileSettingsMenu`, which closes the moment an item is
 * clicked, so nothing on screen stays around to carry an inline error. A
 * toast is the only surface that survives the menu closing. The message names
 * which way the toggle actually landed (still visible, or still hidden)
 * rather than a generic failure, because a member who asked to hide and got
 * silence needs to know they are still visible, not just that "something"
 * did not save.
 */
export function useProfilePageSheets(): ProfilePageSheets {
  const [isWhoSeesWhatOpen, setIsWhoSeesWhatOpen] = useState(false);
  const [isAccountDataOpen, setIsAccountDataOpen] = useState(false);
  const { showToast } = useToast();
  const { t } = useTranslation();
  // What the toggle just asked for, so the async onSaved/onFailed/onPatchLost
  // handlers below (which fire on a later render, after `toggleHidden` has
  // returned) know which message applies. Set synchronously in `toggleHidden`
  // before `saveDraftPatch` is called, so it can never lag behind the save it
  // describes.
  const lastAction = useRef<"hide" | "unhide">("hide");

  const showFailureToast = () => {
    const key =
      lastAction.current === "hide"
        ? "members:profile.rail.hideToast.failedHide"
        : "members:profile.rail.hideToast.failedUnhide";
    showToast(t(key), "error");
  };

  const saveDraftPatch = useDeferredDraftSave({
    onSaved: () => {
      const key =
        lastAction.current === "hide"
          ? "members:profile.rail.hideToast.hidden"
          : "members:profile.rail.hideToast.visible";
      showToast(t(key), "success");
    },
    onFailed: showFailureToast,
    onPatchLost: showFailureToast,
  });

  const toggleHidden = (currentHiddenUntil: string | null | undefined) => {
    const isCurrentlyHidden =
      !!currentHiddenUntil && new Date(currentHiddenUntil) > new Date();
    lastAction.current = isCurrentlyHidden ? "unhide" : "hide";
    const nextValue = isCurrentlyHidden
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
