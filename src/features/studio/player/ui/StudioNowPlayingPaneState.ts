import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { studioTrackQueryOptions } from "../../api/studioTrackQuery";
import { useStudioAccess } from "../../api/useStudioAccess";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import type { StudioNowPlayingTab } from "../studioPlayerSurface";

/** The controls a pane can hold Tab on. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Whether the track has words to show: timed lines, or plain lyrics in its
 *  detail. A private preview only has timed lines. While the detail is on
 *  its way the answer stays yes, so the pane never flips before it knows. */
function useHasWords(item: StudioQueueItem): boolean {
  const player = useStudioPlayer();
  const { demoMode } = useDemoMode();
  const { hasAccess, status } = useStudioAccess();
  const isPreview = Boolean(item.previewToken);
  const hasSyncedLines = (player.currentSyncedLyrics?.length ?? 0) > 0;
  const detail = useQuery({
    ...studioTrackQueryOptions(demoMode, item.trackId),
    enabled: !isPreview && !hasSyncedLines && (demoMode || hasAccess),
    meta: { silentError: true },
  });
  if (hasSyncedLines) return true;
  if (isPreview || status === "denied" || detail.isError) return false;
  if (!detail.data) return true;
  return detail.data.lyricStanzas.length > 0;
}

/**
 * The pane Now playing shows. A track with no words opens on the queue in
 * place of an empty Lyrics pane; the member can still pick Lyrics for that
 * track, and that choice holds until the track changes. `requestedTab` is
 * the pane asked for, which the phone uses to decide when to scroll.
 */
export function useNowPlayingActiveTab({
  item,
  paneIds,
  nowPlayingTab,
  setNowPlayingTab,
}: {
  item: StudioQueueItem;
  paneIds: readonly StudioNowPlayingTab[];
  nowPlayingTab: StudioNowPlayingTab;
  setNowPlayingTab: (tab: StudioNowPlayingTab) => void;
}) {
  const hasWords = useHasWords(item);
  const [lyricsPickedFor, setLyricsPickedFor] = useState<string | null>(null);
  const requestedTab = paneIds.includes(nowPlayingTab)
    ? nowPlayingTab
    : "lyrics";
  const isQueueFallback =
    requestedTab === "lyrics" && !hasWords && lyricsPickedFor !== item.trackId;
  return {
    requestedTab,
    activeTab: isQueueFallback ? ("queue" as const) : requestedTab,
    choose: (tab: StudioNowPlayingTab) => {
      if (tab === "lyrics") setLyricsPickedFor(item.trackId);
      setNowPlayingTab(tab);
    },
  };
}

/** Whether the tabpanel holds a control of its own. A panel with one needs
 *  no Tab stop itself (the rows take it); an empty one keeps its stop so a
 *  screen reader still reaches it. Rechecked as the pane's content lands. */
export function usePanelHoldsFocusables(
  panelRef: RefObject<HTMLElement | null>,
  /** Re-reads when this changes (the panel mounting after a phone width). */
  mountKey: unknown,
): boolean {
  const [holdsFocusables, setHoldsFocusables] = useState(false);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const read = () =>
      setHoldsFocusables(panel.querySelector(FOCUSABLE_SELECTOR) !== null);
    read();
    const observer = new MutationObserver(read);
    observer.observe(panel, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [panelRef, mountKey]);
  return holdsFocusables;
}

/** Whether a sticky element sits stuck at its offset inside the nearest
 *  dialog scroller, read by an IntersectionObserver (no layout reads on
 *  scroll). */
export function useIsStuck(elementRef: RefObject<HTMLElement | null>): boolean {
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    const scroller = element?.closest<HTMLElement>('[role="dialog"]');
    if (!element || !scroller || typeof IntersectionObserver === "undefined")
      return;
    const stickyTop = parseFloat(window.getComputedStyle(element).top) || 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.rootBounds) return;
        setIsStuck(
          entry.intersectionRatio < 1 &&
            entry.boundingClientRect.top <= entry.rootBounds.top,
        );
      },
      {
        root: scroller,
        rootMargin: `-${Math.ceil(stickyTop) + 1}px 0px 0px 0px`,
        threshold: 1,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);
  return isStuck;
}
