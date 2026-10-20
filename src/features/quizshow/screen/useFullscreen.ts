import { useCallback, useEffect, useState } from "react";

function isFullscreenSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function"
  );
}

function isDocumentFullscreen(): boolean {
  return typeof document !== "undefined" && document.fullscreenElement != null;
}

/** Full screen for the whole page, following the browser's own state (Esc included). */
export function useFullscreen(): {
  isSupported: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
} {
  const [isSupported] = useState(isFullscreenSupported);
  const [isFullscreen, setIsFullscreen] = useState(isDocumentFullscreen);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(isDocumentFullscreen());
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

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
