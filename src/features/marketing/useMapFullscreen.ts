import { useCallback, useEffect, useState, type RefObject } from "react";
import { useScrollLock } from "../../shared/hooks";

/** "native" is the browser's Fullscreen API; "fallback" is a fixed overlay for
 *  browsers that do not offer it on ordinary elements (iPhone Safari). */
export type MapFullscreenMode = "native" | "fallback";

// Safari shipped the Fullscreen API prefixed for years and still exposes only
// the webkit names on some versions, so both spellings are read.
interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}
interface WebkitFullscreenDocument extends Document {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

function currentFullscreenElement(): Element | null {
  const webkitDocument = document as WebkitFullscreenDocument;
  return (
    document.fullscreenElement ?? webkitDocument.webkitFullscreenElement ?? null
  );
}

function canUseNativeFullscreen(element: HTMLElement): boolean {
  const webkitDocument = document as WebkitFullscreenDocument;
  const webkitElement = element as WebkitFullscreenElement;
  if (
    document.fullscreenEnabled &&
    typeof element.requestFullscreen === "function"
  ) {
    return true;
  }
  return (
    webkitDocument.webkitFullscreenEnabled === true &&
    typeof webkitElement.webkitRequestFullscreen === "function"
  );
}

function requestNativeFullscreen(element: HTMLElement): Promise<void> {
  const webkitElement = element as WebkitFullscreenElement;
  if (typeof element.requestFullscreen === "function") {
    return element.requestFullscreen();
  }
  return Promise.resolve(webkitElement.webkitRequestFullscreen?.());
}

function exitNativeFullscreen() {
  const webkitDocument = document as WebkitFullscreenDocument;
  const exitRequest =
    typeof document.exitFullscreen === "function"
      ? document.exitFullscreen()
      : webkitDocument.webkitExitFullscreen?.();
  // A rejection only means the document already left full screen.
  void Promise.resolve(exitRequest).catch(() => undefined);
}

/** Full screen for the directory map stage (the map and its floating list
 *  together). Uses the Fullscreen API where the browser offers it on an
 *  element, and otherwise pins the stage over the page with CSS: the caller
 *  keys both off `data-fullscreen` on the stage. The native state follows the
 *  document's own `fullscreenchange`, so leaving with Escape or the browser's
 *  own control keeps the button in sync. */
export function useMapFullscreen(stageRef: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState<MapFullscreenMode | null>(null);
  const isFullscreen = mode !== null;

  // The CSS overlay covers the viewport, so the page underneath must not
  // scroll while it is up. The native mode needs no lock: the browser already
  // shows only the stage.
  useScrollLock(mode === "fallback");

  useEffect(() => {
    function syncFromDocument() {
      const stage = stageRef.current;
      const isStageFullscreen =
        stage !== null && currentFullscreenElement() === stage;
      setMode((current) => {
        if (isStageFullscreen) return "native";
        return current === "native" ? null : current;
      });
    }
    document.addEventListener("fullscreenchange", syncFromDocument);
    document.addEventListener("webkitfullscreenchange", syncFromDocument);
    return () => {
      document.removeEventListener("fullscreenchange", syncFromDocument);
      document.removeEventListener("webkitfullscreenchange", syncFromDocument);
    };
  }, [stageRef]);

  // The browser gives native full screen its own Escape; the overlay gets one
  // here so both modes leave the same way.
  useEffect(() => {
    if (mode !== "fallback") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) setMode(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode]);

  // Leaving the map view while it is full screen must hand the page back.
  // The overlay's scroll lock releases through its own cleanup.
  useEffect(() => {
    const stage = stageRef.current;
    return () => {
      if (stage && currentFullscreenElement() === stage) exitNativeFullscreen();
    };
  }, [stageRef]);

  const enter = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!canUseNativeFullscreen(stage)) {
      setMode("fallback");
      return;
    }
    // The mode flips on `fullscreenchange`. A refused request (an iframe
    // without permission, a browser policy) still gets the overlay.
    requestNativeFullscreen(stage).catch(() => setMode("fallback"));
  }, [stageRef]);

  const exit = useCallback(() => {
    const stage = stageRef.current;
    if (stage && currentFullscreenElement() === stage) exitNativeFullscreen();
    setMode(null);
  }, [stageRef]);

  const toggle = useCallback(() => {
    if (isFullscreen) exit();
    else enter();
  }, [isFullscreen, enter, exit]);

  return { isFullscreen, mode, toggle, exit };
}
