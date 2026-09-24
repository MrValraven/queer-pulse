import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery } from "../../shared/hooks";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { mediaMax } from "../../shared/theme/breakpoints";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";

/** Which chapter of the chaptered skin editor is on screen. */
const CHAPTER_PARAM = "chapter";
/** The editor's pane param (`useEditorPane`), for the hand-off to publish. */
const PANE_PARAM = "pane";
const PUBLISH_PANE = "publish";

/** The same viewport cut `SubprofileEditorShell` mounts `.ed-switch` behind. */
const SWITCH_BAR_QUERY = mediaMax("lg");

export interface SkinChapterState {
  /** Undefined only when `chapters` is empty. */
  activeChapter: SkinChapterDescriptor | undefined;
  activeIndex: number;
  /** Switch chapters. Pushes history, so Back steps back a chapter. Does
   *  nothing for the chapter already on screen. */
  selectChapter: (key: string) => void;
  /** Leave the last chapter for the publish pane, pushed the same way. */
  goToPublish: () => void;
}

/**
 * The active chapter, held in the URL as `?chapter=`, the same idiom
 * `useEditorPane` uses for `?pane=`. A chapter survives a refresh, is
 * linkable, and the phone's Back gesture steps back a chapter. A missing or
 * unknown key falls back to the first chapter. Every other param is kept.
 */
export function useSkinChapter(
  chapters: SkinChapterDescriptor[],
): SkinChapterState {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedKey = searchParams.get(CHAPTER_PARAM);
  const requestedIndex = chapters.findIndex(
    (chapter) => chapter.key === requestedKey,
  );
  const activeIndex = requestedIndex >= 0 ? requestedIndex : 0;
  const activeChapter = chapters[activeIndex];
  const activeKey = activeChapter?.key;

  const selectChapter = useCallback(
    (key: string) => {
      if (key === activeKey) return;
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set(CHAPTER_PARAM, key);
        return next;
      });
    },
    [activeKey, setSearchParams],
  );

  // A query change keeps the scroll offset (ScrollManager treats it as a
  // filter), so the publish pane would open where the chapter footer was.
  // Start it at the top instead.
  const goToPublish = useCallback(() => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set(PANE_PARAM, PUBLISH_PANE);
      next.delete(CHAPTER_PARAM);
      return next;
    });
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotionNow() ? "instant" : "smooth",
    });
  }, [setSearchParams]);

  return { activeChapter, activeIndex, selectChapter, goToPublish };
}

/** Whether the chapter map has scrolled up under the sticky chrome: the
 *  anchor above it sits higher than its own `scroll-margin-top`, which is the
 *  chrome's height. A hidden pane reads 0 for both, so never counts. */
function isChapterMapOutOfView(anchor: HTMLElement): boolean {
  const chromeHeight =
    Number.parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
  return anchor.getBoundingClientRect().top < chromeHeight - 1;
}

/**
 * Publishes the mobile pane switcher's height as `--chapter-strip-offset` on
 * `rootRef`. Below 760px `.ed-switch` is stuck at `--sticky-top`, so the
 * anchor's scroll margin must clear that bar too, or a chapter switch would
 * park the chapter map underneath it. Measured, because the bar's height
 * follows the reader's font size.
 */
export function useSwitchBarOffset(rootRef: RefObject<HTMLElement | null>) {
  const hasSwitchBar = useMediaQuery(SWITCH_BAR_QUERY);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const switchBar = hasSwitchBar
      ? document.querySelector<HTMLElement>(".ed-switch")
      : null;
    if (!switchBar) {
      root.style.removeProperty("--chapter-strip-offset");
      return;
    }
    const apply = () =>
      root.style.setProperty(
        "--chapter-strip-offset",
        `${switchBar.offsetHeight}px`,
      );
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(apply);
    observer.observe(switchBar);
    return () => observer.disconnect();
  }, [hasSwitchBar, rootRef]);
}

/**
 * On a real chapter switch: scroll back up to the chapter map when it has
 * scrolled away (so the new chapter starts at its top), then move focus to
 * the chapter heading so a screen reader hears the change.
 *
 * Compares against the PREVIOUS key, seeded with the first one, for the reason
 * `EditorPaneRouter` gives: a "did mount" flag is defeated by StrictMode's
 * replayed effects and would steal focus and scroll on page load. Skipped
 * while the pane is hidden, where there is nothing to focus.
 */
export function useChapterArrival(
  chapterKey: string | undefined,
  refs: {
    anchorRef: RefObject<HTMLElement | null>;
    headingRef: RefObject<HTMLElement | null>;
  },
) {
  const { anchorRef, headingRef } = refs;
  const previousKeyRef = useRef(chapterKey);

  useEffect(() => {
    if (previousKeyRef.current === chapterKey) return;
    previousKeyRef.current = chapterKey;
    const anchor = anchorRef.current;
    const heading = headingRef.current;
    if (!anchor || !heading) return;
    if (heading.getClientRects().length === 0) return;
    if (isChapterMapOutOfView(anchor)) {
      anchor.scrollIntoView({
        behavior: prefersReducedMotionNow() ? "instant" : "smooth",
        block: "start",
      });
    }
    heading.focus({ preventScroll: true });
  }, [chapterKey, anchorRef, headingRef]);
}
