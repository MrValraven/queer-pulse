import { useContext, useEffect, useRef } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

interface UnsavedChangesGuardOptions {
  /** When true, in-app navigation and tab-close are guarded. */
  active: boolean;
  /** Message shown in the window.confirm prompt on in-app navigation. */
  confirmMessage: string;
  /** Called once the user confirms they want to leave (e.g. to clear dirty state). */
  onConfirmLeave?: () => void;
  /**
   * Also guard the browser Back button (`popstate`), which the push/replace
   * monkey-patch below can't see. Opt-in (default `false`) so existing
   * consumers are unaffected — only surfaces that want Back protection turn it
   * on. Uses a history sentinel: the first Back lands on a same-URL sentinel
   * entry where we prompt, then either honour or cancel the navigation.
   */
  guardBackButton?: boolean;
}

/**
 * Warn before losing unsaved edits. The app mounts a plain <BrowserRouter>, so
 * `useBlocker` is unavailable; this monkey-patches the history navigator's
 * push/replace to prompt, and adds a beforeunload guard for hard tab-close.
 * With `guardBackButton`, it also catches the browser Back button via a
 * history sentinel. (Pattern lifted from ProfilePage's inline edit guard.)
 */
export function useUnsavedChangesGuard({
  active,
  confirmMessage,
  onConfirmLeave,
  guardBackButton = false,
}: UnsavedChangesGuardOptions): void {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    if (!active) return;
    const historyNavigator = navigator as unknown as {
      push: (...args: unknown[]) => void;
      replace: (...args: unknown[]) => void;
    };
    const originalPush = historyNavigator.push;
    const originalReplace = historyNavigator.replace;
    const confirmLeave = () => {
      if (!window.confirm(confirmMessage)) return false;
      onConfirmLeave?.();
      return true;
    };
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
  }, [active, navigator, confirmMessage, onConfirmLeave]);

  useEffect(() => {
    if (!active) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [active]);

  // Latest-value refs so the popstate listener (registered once, keyed only on
  // `guardBackButton`) always reads the current dirty state / message / callback
  // without re-registering — re-registering would re-push sentinels and stack
  // up dead history entries. Synced in an effect (not during render) so a ref
  // write never happens mid-render.
  const activeRef = useRef(active);
  const confirmMessageRef = useRef(confirmMessage);
  const onConfirmLeaveRef = useRef(onConfirmLeave);
  useEffect(() => {
    activeRef.current = active;
    confirmMessageRef.current = confirmMessage;
    onConfirmLeaveRef.current = onConfirmLeave;
  });

  // Arm a history sentinel the FIRST time the guard goes active this mount, so
  // a Back press pops onto a same-URL entry we can intercept. Armed at most once
  // (a ref latch) so toggling dirty on/off never accumulates entries.
  const armedRef = useRef(false);
  useEffect(() => {
    if (!guardBackButton || !active || armedRef.current) return;
    armedRef.current = true;
    window.history.pushState(null, "");
  }, [guardBackButton, active]);

  useEffect(() => {
    if (!guardBackButton) return;
    const onPopState = () => {
      // A Back press already popped the sentinel. If there's nothing to guard
      // anymore, honour the Back (one more `back()` clears the sentinel we ate).
      if (!activeRef.current) {
        if (armedRef.current) {
          armedRef.current = false;
          window.removeEventListener("popstate", onPopState);
          window.history.back();
        }
        return;
      }
      if (window.confirm(confirmMessageRef.current)) {
        onConfirmLeaveRef.current?.();
        armedRef.current = false;
        window.removeEventListener("popstate", onPopState);
        // Consume the actual navigation the user asked for (past the sentinel).
        window.history.back();
      } else {
        // Cancel: re-arm so the next Back is caught too.
        window.history.pushState(null, "");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [guardBackButton]);
}
