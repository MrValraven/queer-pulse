import { useEffect, type RefObject } from "react";

/** The custom property the rail's sticky `top` reads (DeskRail.module.css). */
export const RAIL_PIN_TOP_PROPERTY = "--desk-rail-pin-top";

/**
 * Fits the pinned rail to the viewport by writing its sticky `top`.
 *
 * A rail that fits pins at its sticky offset. A taller one pins by its
 * bottom instead: `top` becomes `innerHeight - railHeight - bottomGap`, a
 * negative offset, so the rail scrolls with the page until its end reaches
 * the viewport bottom and stays there. A card that grows while the page is
 * scrolled ("See all", "Show all sections") then pushes the rail up from its
 * bottom edge, and the control just pressed stays on screen. There is never a
 * scroller of its own.
 *
 * The offsets come from the rail's `scroll-margin-top` (the sticky offset)
 * and `scroll-margin-bottom` (the gap kept under it), which compute to pixels
 * whether or not the rail is pinned. The value is written straight to the
 * element inside the ResizeObserver callback, before paint, with no render.
 * Off while `isEnabled` is false, which is when the rail stacks under the
 * table and never pins.
 */
export function useRailFitsViewport(
  railRef: RefObject<HTMLElement | null>,
  isEnabled: boolean,
): void {
  useEffect(() => {
    const rail = railRef.current;
    if (!isEnabled || !rail) return;

    function measure() {
      if (!rail) return;
      const style = window.getComputedStyle(rail);
      const stickyTop = Number.parseFloat(style.scrollMarginTop);
      const bottomGap = Number.parseFloat(style.scrollMarginBottom);
      // An offset that does not read as pixels leaves the CSS default.
      if (!Number.isFinite(stickyTop) || !Number.isFinite(bottomGap)) return;
      const pinTop = Math.min(
        stickyTop,
        window.innerHeight - rail.offsetHeight - bottomGap,
      );
      rail.style.setProperty(RAIL_PIN_TOP_PROPERTY, `${pinTop}px`);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      rail.style.removeProperty(RAIL_PIN_TOP_PROPERTY);
    };
  }, [railRef, isEnabled]);
}
