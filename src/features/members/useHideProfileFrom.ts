import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useHiddenFromList,
  useHideFrom,
  useUnhideFrom,
} from "./api/useHiddenFrom";
import { hideFromErrorCopy, unhideFromErrorCopy } from "./memberActionErrors";

/**
 * "Hide my profile from {name}" for another member's safety menu: the same
 * `POST /profiles/me/hidden-from/:slug` the "Who sees what" picker sends,
 * reachable from the profile itself, a limited card included. No confirm
 * step, like the picker: the server treats a repeat as a no-op. The toast
 * waits for the server, and a refusal names its cause (`hideFromErrorCopy`).
 *
 * Once hidden, the same item reads "Show my profile to {name}" and sends the
 * `DELETE` that "Who sees what" sends. Live mode reads the state from
 * `GET /profiles/me/hidden-from`, which both requests refresh. Demo mode
 * sends nothing and keeps no list, so it holds the state for this visit and
 * its toast says the hide resets on reload.
 *
 * Called by the menu itself, which stays mounted after it closes: the
 * per-call `mutate` callbacks only fire while their caller is mounted, and
 * the menu item unmounts the moment the menu closes.
 */
export function useHideProfileFrom(slug: string, firstName: string) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const hiddenFrom = useHiddenFromList();
  const hideFrom = useHideFrom();
  const unhideFrom = useUnhideFrom();
  const [isHiddenInDemo, setIsHiddenInDemo] = useState(false);
  const isHidden = demoMode
    ? isHiddenInDemo
    : (hiddenFrom.data ?? []).some((entry) => entry.slug === slug);

  const hide = () => {
    hideFrom.mutate(slug, {
      onSuccess: () => {
        if (demoMode) setIsHiddenInDemo(true);
        showToast(
          t(
            demoMode
              ? "safety:profileMenu.hiddenFromDemoToast"
              : "safety:profileMenu.hiddenFromToast",
            { name: firstName },
          ),
          "success",
        );
      },
      onError: (error) => {
        const cause = hideFromErrorCopy(error);
        showToast(t(cause.key, cause.values), "error");
      },
    });
  };

  const show = () => {
    unhideFrom.mutate(slug, {
      onSuccess: () => {
        if (demoMode) setIsHiddenInDemo(false);
        showToast(
          t("safety:profileMenu.shownToToast", { name: firstName }),
          "success",
        );
      },
      onError: (error) => {
        const cause = unhideFromErrorCopy(error);
        showToast(t(cause.key, cause.values), "error");
      },
    });
  };

  return {
    hide,
    show,
    isHidden,
    isBusy: hideFrom.isPending || unhideFrom.isPending,
  };
}
