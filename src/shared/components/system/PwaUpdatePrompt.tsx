import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";

/** Long enough to be reachable, since this toast asks for a decision. */
const UPDATE_TOAST_MS = 30_000;

/**
 * Registers the service worker and, when a new build is waiting, offers a
 * reload rather than taking one. The worker is registered with
 * `registerType: "prompt"` (vite.config.ts) precisely so the swap happens on
 * the user's say-so: auto-claiming mid-session can leave the running page
 * importing lazy chunks the new build no longer ships.
 *
 * Renders nothing — the UI is the toast.
 */
export function PwaUpdatePrompt() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  // `t` is a useCallback keyed on the active language, so it changes whenever
  // the user switches language. Reading it through a ref (rather than listing
  // it as an effect dependency) keeps the toast localised without re-running
  // the effect - and firing a duplicate toast - on a language change while
  // the update toast is already showing. The ref is synced from its own
  // effect (never written during render, per `react-hooks/refs`) so it still
  // always holds the latest translate function by the time the toast fires.
  const translateFunctionRef = useRef(t);
  useEffect(() => {
    translateFunctionRef.current = t;
  });

  useEffect(() => {
    if (!needRefresh) return;
    const translate = translateFunctionRef.current;
    showToast(translate("nav:updateAvailable"), "info", UPDATE_TOAST_MS, {
      label: translate("nav:updateReload"),
      onClick: () => updateServiceWorker(true),
    });
  }, [needRefresh, showToast, updateServiceWorker]);

  return null;
}
