import { useContext, useEffect, useRef } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Guards the profile editor against losing unsaved changes:
 *  - blocks in-app navigation (wrapping the router navigator under a plain
 *    <BrowserRouter>, since useBlocker needs a data router),
 *  - warns on hard unload (tab close / refresh),
 *  - restores focus to the Edit CTA when leaving edit mode.
 */
export function useProfileEditGuard({
  isEditing,
  isDirty,
  cancelEditing,
}: {
  isEditing: boolean;
  isDirty: boolean;
  cancelEditing: () => void;
}) {
  const { t } = useTranslation();

  // Block in-app navigation away from a dirty edit; confirm before discarding.
  // The app mounts a plain <BrowserRouter> (not a data router), so react-router's
  // useBlocker isn't available — instead we wrap the router's navigator so a
  // push/replace mid-edit prompts first. (Hard unloads are covered separately below.)
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const guardActive = isEditing && isDirty;
  useEffect(() => {
    if (!guardActive) return;
    // View push/replace as reassignable function properties (not the interface's
    // bound methods) so we can wrap then restore them — the cast also sidesteps
    // the unbound-method / readonly-assignment lint on those method signatures.
    const historyNavigator = navigator as unknown as {
      push: (...args: unknown[]) => void;
      replace: (...args: unknown[]) => void;
    };
    const originalPush = historyNavigator.push;
    const originalReplace = historyNavigator.replace;
    const confirmLeave = () => {
      if (!window.confirm(t("members:profileEdit.discardConfirm")))
        return false;
      cancelEditing();
      return true;
    };
    // Intentionally wrap + later restore the router navigator. This mutates a
    // value from useContext, which react-hooks/immutability forbids — but that's
    // the whole technique: UNSAFE_NavigationContext is React Router's sanctioned
    // escape hatch for blocking navigation under a plain <BrowserRouter>, and the
    // compiler can't model the wrap/restore. Scope the disable to this region.
    /* eslint-disable react-hooks/immutability */
    historyNavigator.push = (...args) => {
      if (confirmLeave()) originalPush.apply(historyNavigator, args);
    };
    historyNavigator.replace = (...args) => {
      if (confirmLeave()) originalReplace.apply(historyNavigator, args);
    };
    return () => {
      historyNavigator.push = originalPush;
      historyNavigator.replace = originalReplace;
    };
    /* eslint-enable react-hooks/immutability */
  }, [guardActive, navigator, cancelEditing, t]);

  // Warn on hard unload (tab close / refresh) while there are unsaved edits.
  useEffect(() => {
    if (!(isEditing && isDirty)) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isEditing, isDirty]);

  // Restore focus to the Edit CTA when leaving edit mode (the editable hero that
  // held focus unmounts, so focus would otherwise fall to <body>).
  const wasEditing = useRef(false);
  useEffect(() => {
    if (wasEditing.current && !isEditing) {
      document.getElementById("profileEditCta")?.focus();
    }
    wasEditing.current = isEditing;
  }, [isEditing]);
}
