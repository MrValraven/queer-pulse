import { useContext, useEffect } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

interface UnsavedChangesGuardOptions {
  /** When true, in-app navigation and tab-close are guarded. */
  active: boolean;
  /** Message shown in the window.confirm prompt on in-app navigation. */
  confirmMessage: string;
  /** Called once the user confirms they want to leave (e.g. to clear dirty state). */
  onConfirmLeave?: () => void;
}

/**
 * Warn before losing unsaved edits. The app mounts a plain <BrowserRouter>, so
 * `useBlocker` is unavailable; this monkey-patches the history navigator's
 * push/replace to prompt, and adds a beforeunload guard for hard tab-close.
 * (Pattern lifted from ProfilePage's inline edit guard.)
 */
export function useUnsavedChangesGuard({
  active,
  confirmMessage,
  onConfirmLeave,
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
}
