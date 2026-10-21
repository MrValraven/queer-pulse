import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useStudioPlaybackSignals } from "./player/studioPlaybackSignals";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { useStudioPlayerSurface } from "./player/studioPlayerSurface";
import { StudioMiniPlayer } from "./player/ui/StudioMiniPlayer";
import { StudioNowPlayingHost } from "./player/ui/StudioNowPlaying";
import { StudioPlayerBar } from "./player/ui/StudioPlayerBar";
import { StudioQueuePanelHost } from "./player/ui/StudioQueuePanel";
import { StudioShortcutsSheetHost } from "./player/ui/StudioShortcutsSheet";
import { useStudioBarExit } from "./useStudioBarExit";
import styles from "./StudioPlayer.module.css";

/** ENG-01: the thin line along the bar's top edge while the stream loads or
 *  the audio waits for data. Decorative: the play button carries aria-busy. */
function StudioPlayerWaitLine() {
  const player = useStudioPlayer();
  const { isBuffering } = useStudioPlaybackSignals();
  const isWaiting = player.status === "loading" || isBuffering;
  return (
    <span
      className={styles.waitLine}
      data-active={isWaiting || undefined}
      aria-hidden="true"
    />
  );
}

/** The history-state key that stamps the shortcuts sheet's own entry. */
const SHORTCUTS_ENTRY_KEY = "studioShortcutsEntry";

function readShortcutsEntryStamp(): unknown {
  const state = window.history.state as Record<string, unknown> | null;
  return state?.[SHORTCUTS_ENTRY_KEY];
}

/** Pushes the sheet's entry, keeping every key the router put on the
 *  current state, with its index one higher (as useHistoryBackDismiss). */
function pushShortcutsEntry(entryId: string) {
  const current = (window.history.state ?? {}) as Record<string, unknown>;
  const currentIndex = typeof current.idx === "number" ? current.idx : 0;
  window.history.pushState(
    { ...current, idx: currentIndex + 1, [SHORTCUTS_ENTRY_KEY]: entryId },
    "",
  );
}

/** Unique across reloads, so a reloaded page never mistakes an old stamp
 *  left in history for its own. */
function createShortcutsEntryId(openCount: number): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${performance.timeOrigin}-${openCount}`;
}

/**
 * Back closes the shortcuts sheet before Now playing under it. The sheet
 * pushes its own entry, stamped with a unique id, and records the router's
 * location key. The popstate listener is registered with the bar (before
 * Now playing's) and in the capture phase, so it runs first. It swallows
 * only two pops:
 * - the one our own `back()` caused, after a close by button or Escape;
 * - a Back that leaves our entry while the sheet is open (the new state
 *   carries no stamp of ours) and while the router still sits on the key
 *   recorded at the push, which closes the sheet alone.
 * When the router moved while open (a push or a replace), the pop belongs
 * to the router: it goes through, and the sheet closes without a `back()`.
 * Every other pop clears the flags and goes through. A close pops our entry
 * only while it is still the current one.
 */
function useShortcutsBackDismiss(isOpen: boolean, onBack: () => void) {
  const routerKey = useLocation().key;
  const onBackRef = useRef(onBack);
  const isOpenRef = useRef(isOpen);
  const routerKeyRef = useRef(routerKey);
  const pushedRouterKeyRef = useRef<string | null>(null);
  const openCountRef = useRef(0);
  const entryIdRef = useRef<string | null>(null);
  const isAwaitingPopRef = useRef(false);
  const isMountedRef = useRef(false);
  useLayoutEffect(() => {
    onBackRef.current = onBack;
    isOpenRef.current = isOpen;
    routerKeyRef.current = routerKey;
  });

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const entryId = entryIdRef.current;
      const isOwnPop = isAwaitingPopRef.current;
      const hasRouterMoved =
        pushedRouterKeyRef.current !== routerKeyRef.current;
      isAwaitingPopRef.current = false;
      entryIdRef.current = null;
      pushedRouterKeyRef.current = null;
      if (isOwnPop) {
        event.stopImmediatePropagation();
        return;
      }
      if (entryId === null || !isOpenRef.current) return;
      if (hasRouterMoved) {
        onBackRef.current();
        return;
      }
      if (readShortcutsEntryStamp() === entryId) return;
      event.stopImmediatePropagation();
      onBackRef.current();
    };
    window.addEventListener("popstate", onPopState, { capture: true });
    return () =>
      window.removeEventListener("popstate", onPopState, { capture: true });
  }, []);

  useEffect(() => {
    if (isOpen && entryIdRef.current === null) {
      openCountRef.current += 1;
      const entryId = createShortcutsEntryId(openCountRef.current);
      pushShortcutsEntry(entryId);
      entryIdRef.current = entryId;
      pushedRouterKeyRef.current = routerKeyRef.current;
      return;
    }
    const entryId = entryIdRef.current;
    if (isOpen || entryId === null) return;
    entryIdRef.current = null;
    pushedRouterKeyRef.current = null;
    if (readShortcutsEntryStamp() !== entryId) return;
    isAwaitingPopRef.current = true;
    window.history.back();
  }, [isOpen]);

  // Unmounted while open (the queue emptied): pop our entry if it is still
  // current, a microtask later so StrictMode's simulated unmount keeps it.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      queueMicrotask(() => {
        const entryId = entryIdRef.current;
        if (isMountedRef.current || entryId === null) return;
        entryIdRef.current = null;
        if (readShortcutsEntryStamp() === entryId) window.history.back();
      });
    };
  }, []);
}

/**
 * The app-wide player. Mounted by StudioPlayerMount while something is
 * queued and the member has Studio access, and held through its exit when
 * the member closes it (useStudioBarExit). Desktop gets the full bar; at
 * the Studio tab-bar width (880px) a minimal card opens Now playing. The
 * three overlays it hosts portal to <body>. The bar and every overlay root
 * carry `data-studio-player`, so Sentry drops the clicks made on them on any
 * page (dropStudioPlayBreadcrumb).
 */
export function StudioPlayer({
  barRef,
}: {
  barRef?: (bar: HTMLElement | null) => void;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const surface = useStudioPlayerSurface();
  const isPhone = useMediaQuery(mediaMax(880));
  useShortcutsBackDismiss(surface.isShortcutsOpen, surface.closeShortcuts);
  const { item, isClosing, attachBar } = useStudioBarExit(
    player.currentItem,
    barRef,
  );
  if (!item) return null;
  return (
    <>
      <div className={styles.spacer} aria-hidden />
      <section
        ref={attachBar}
        className={styles.bar}
        aria-label={t("studio:playerBar.regionLabel")}
        data-closing={isClosing || undefined}
        inert={isClosing || undefined}
        data-studio-player=""
      >
        <StudioPlayerWaitLine />
        {isPhone ? (
          <StudioMiniPlayer item={item} />
        ) : (
          <StudioPlayerBar item={item} />
        )}
      </section>
      <StudioNowPlayingHost />
      <StudioQueuePanelHost />
      <StudioShortcutsSheetHost />
    </>
  );
}
