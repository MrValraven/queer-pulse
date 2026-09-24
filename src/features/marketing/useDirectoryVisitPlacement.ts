import { useLayoutEffect, useState, type RefObject } from "react";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { mediaMax } from "../../shared/theme/breakpoints";

/** The same 760px as `@container directorySpace (max-width: 760px)` in
 *  DirectorySpacePage.module.css: at or under it the body grid is one column. */
const SINGLE_COLUMN_MAX_WIDTH = 760;

/**
 * Which column mounts the visit card: `"rail"` while the body grid is two
 * columns, `"main"` while it is one, and `"unmeasured"` for the moment before
 * `.page` has been measured, when neither column mounts it.
 */
export type VisitPlacement = "main" | "rail" | "unmeasured";

/** The content-box width of `.page`, the size a container query on it reads.
 *  Fractional, like the container query, so the two agree to the sub-pixel. */
function contentWidthOf(page: HTMLElement): number {
  const style = getComputedStyle(page);
  return (
    page.getBoundingClientRect().width -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight)
  );
}

/**
 * Where the detail page's visit card belongs right now.
 *
 * The body grid collapses to one column for two independent reasons, and the
 * card goes to the rail only when neither applies: the viewport `--mobile`
 * media query (phones), and the `directorySpace` container query on `.page`
 * (the admin preview modals, narrow on a wide screen, where no viewport query
 * fires). A viewport check alone would put the card in the rail of a
 * one-column drawer.
 *
 * Measured in JS on purpose. The card holds a MapLibre map, so exactly one copy
 * of it may be mounted, and CSS can only hide or reorder elements that already
 * exist. A grid-areas restructure would have to flatten the main column into
 * the page grid, which ties every section's row height to the rail's content.
 *
 * A phone viewport answers `"main"` on the first render, from the media query
 * alone. Everywhere else the answer starts `"unmeasured"` and the first reading
 * happens in a layout effect, before paint, so the card mounts once, in the
 * right column, and no map is built for a column it is about to leave.
 * `.page`'s width depends only on the viewport and its own max-width, so
 * moving the card between columns cannot feed back into this reading.
 */
export function useDirectoryVisitPlacement(
  pageRef: RefObject<HTMLElement | null>,
): VisitPlacement {
  const isMobileViewport = useMediaQuery(mediaMax("mobile"));
  const [isPageWide, setIsPageWide] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    setIsPageWide(contentWidthOf(page) > SINGLE_COLUMN_MAX_WIDTH);
    // The reading above already stands on its own; an environment with no
    // ResizeObserver (some test setups) just keeps it and never tracks later
    // width changes, matching the guard every other resize-driven hook in
    // this codebase uses.
    if (typeof ResizeObserver === "undefined") return;
    // Later readings come straight from the observer entry: the content box
    // is exactly what the container query reads, with no style lookup on each
    // of the many height-only changes (reviews expanding, images loading).
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const inlineSize =
        entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      setIsPageWide(inlineSize > SINGLE_COLUMN_MAX_WIDTH);
    });
    observer.observe(page);
    return () => observer.disconnect();
  }, [pageRef]);

  if (isMobileViewport) return "main";
  if (isPageWide === null) return "unmeasured";
  return isPageWide ? "rail" : "main";
}
