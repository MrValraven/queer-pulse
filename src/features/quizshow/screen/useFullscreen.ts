import { useCallback, useState, useSyncExternalStore } from "react";

function isFullscreenSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

function isDocumentFullscreen(): boolean {
  return typeof document !== "undefined" && document.fullscreenElement != null;
}

function subscribeToFullscreen(onChange: () => void): () => void {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

/**
 * Full screen for the whole page, following the browser's own state (Esc
 * included). Read through useSyncExternalStore, which checks the state again
 * once it subscribes: a change that lands between the first render and the
 * subscription (the toolbar mounts late, after the game loads) still reaches
 * the button.
 */
export function useFullscreen(): {
  isSupported: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
} {
  const [isSupported] = useState(isFullscreenSupported);
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    isDocumentFullscreen,
    () => false,
  );

  const toggleFullscreen = useCallback(() => {
    if (!isSupported) return;
    // A refusal (an iframe without permission, a browser policy) leaves the page as it is.
    if (isDocumentFullscreen()) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }, [isSupported]);

  return { isSupported, isFullscreen, toggleFullscreen };
}
