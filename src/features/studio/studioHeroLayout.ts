import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";

/** How much room the page column (`#main-content`) gives a detail hero's
 *  action row: every action labelled, labelled with Share in the "..."
 *  menu, or round icon buttons. */
export type StudioPageWidthBucket = "wide" | "shareFolded" | "compact";

/** The page column widths where the labelled row stopped fitting on one
 *  line beside the full 248px rail (the old 1280px and 1440px viewport
 *  cuts), so a folded rail or a docked side panel now counts too. */
const PAGE_COLUMN_LABELLED_MIN_WIDTH = 1032;
const PAGE_COLUMN_SHARE_INLINE_MIN_WIDTH = 1192;

function bucketForPageWidth(pageWidth: number): StudioPageWidthBucket {
  if (pageWidth < PAGE_COLUMN_LABELLED_MIN_WIDTH) return "compact";
  if (pageWidth < PAGE_COLUMN_SHARE_INLINE_MIN_WIDTH) return "shareFolded";
  return "wide";
}

/** The listener shell's page column bucket, provided around the page. Null
 *  outside the shell and before the column has a width (no
 *  ResizeObserver, or no layout as in jsdom), where the viewport answers. */
export const StudioPageWidthBucketContext =
  createContext<StudioPageWidthBucket | null>(null);

/** Measures the shell's `<main>` and reduces its width to a bucket, so the
 *  shell re-renders only when the bucket changes. Measured in a layout
 *  effect, so the first paint already has the right action row. */
export function useStudioPageWidthBucket(
  pageRef: RefObject<HTMLElement | null>,
): StudioPageWidthBucket | null {
  const [pageWidthBucket, setPageWidthBucket] =
    useState<StudioPageWidthBucket | null>(null);
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const pageWidth = page.getBoundingClientRect().width;
      setPageWidthBucket(pageWidth > 0 ? bucketForPageWidth(pageWidth) : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(page);
    return () => observer.disconnect();
  }, [pageRef]);
  return pageWidthBucket;
}

/** Phones (the `--md` cut, 640px) and a phone on its side (500px tall or
 *  less): a detail hero's action row turns into the big Play plus round
 *  icon buttons with tooltips, so it stays on one line and the tracklist
 *  starts above the fold. */
export function useIsHeroCompact(): boolean {
  return useMediaQuery(`${mediaMax("md")}, (max-height: 500px)`);
}

/** The hero action row's secondary actions go icon-only (round buttons
 *  with tooltips) on phones and whenever the page column is under 1032px
 *  wide: a narrower column wrapped the album, track and episode heroes'
 *  labelled actions onto two rows. The column narrows with the viewport,
 *  the rail and the docked side panel alike. Outside the listener shell
 *  the old viewport cut (1279px) stands in. Play and "Play from {time}"
 *  keep their words. The layout itself follows `useIsHeroCompact`. */
export function useIsHeroActionsCompact(): boolean {
  const pageWidthBucket = useContext(StudioPageWidthBucketContext);
  const isPhoneOrShort = useIsHeroCompact();
  const isViewportCompact = useMediaQuery(mediaMax(1279));
  if (isPhoneOrShort) return true;
  if (pageWidthBucket === null) return isViewportCompact;
  return pageWidthBucket === "compact";
}

/** While the page column is under 1192px wide a hero's Share moves into its
 *  "..." menu with every way to share (useStudioFoldedShareItems), so the
 *  action row keeps one line. Outside the listener shell the old viewport
 *  cut (1439px) stands in. */
export function useIsHeroShareFolded(): boolean {
  const pageWidthBucket = useContext(StudioPageWidthBucketContext);
  const isViewportShareFolded = useMediaQuery(mediaMax(1439));
  if (pageWidthBucket === null) return isViewportShareFolded;
  return pageWidthBucket !== "wide";
}
