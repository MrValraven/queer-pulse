import { useContext, useEffect, useRef, type RefObject } from "react";
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
  scrollBeforeEdit,
}: {
  isEditing: boolean;
  isDirty: boolean;
  cancelEditing: () => void;
  /**
   * Window offset captured the moment the member opened the editor (null until
   * they have opened it once in this mount). Leaving edit mode returns them to
   * it, so the page they get back is the page they left.
   */
  scrollBeforeEdit: RefObject<number | null>;
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

  // Leaving edit mode (save, discard, "Go back") puts the member back exactly
  // where they were standing when they opened the editor, and restores focus to
  // the Edit CTA, which the editable hero unmounting would otherwise drop to
  // <body>.
  //
  // Both halves have to opt out of scrolling on their own terms. A bare
  // `focus()` scrolls the CTA into view itself, and the global
  // `html { scroll-behavior: smooth }` (base.css) animates that as a long glide
  // up the page, so focus is taken with `preventScroll` and the offset is
  // restored explicitly. `behavior: "instant"` rather than "auto", which would
  // defer to that same CSS: the landing has to be immediate.
  //
  // Scrolling the CTA into view instead of restoring the offset is not the same
  // thing and reads worse: it lands with the button jammed against the top of
  // the viewport, half of it under the floating AppNav, on a stretch of the page
  // the member never chose to be looking at.
  const wasEditing = useRef(false);
  useEffect(() => {
    if (wasEditing.current && !isEditing) {
      document.getElementById("profileEditCta")?.focus({ preventScroll: true });
      const offset = scrollBeforeEdit.current;
      if (offset !== null)
        window.scrollTo({ top: offset, behavior: "instant" });
    }
    wasEditing.current = isEditing;
  }, [isEditing, scrollBeforeEdit]);
}
