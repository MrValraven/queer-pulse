import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";

/** How far past the top of the viewport counts toward the parallax shift. */
const COVER_PARALLAX_FACTOR = 0.12;
/** Hard cap on the cover shift so the motion stays a gentle nudge, never a slide. */
const COVER_SHIFT_MAX_PX = 24;

/**
 * Drives the persona page's scroll motion imperatively and returns a ref for the
 * root `<article className="pp">`.
 *
 * Why a hook and not the shared `<Reveal>` primitive: `Reveal` wraps its children
 * in an extra `<div>`, which would sit between `.pp` and its sections and break the
 * `.pp` tree's direct-child CSS layout. So this observes the existing section nodes
 * in place and only toggles a class on them.
 *
 * The `data-motion` gate: every hidden/pre-animation state in `persona-motion.css`
 * is scoped under `[data-motion]`. We set that attribute ONLY when motion is truly
 * enabled — not under reduced motion, and not where `IntersectionObserver` is
 * missing (jsdom / SSR). A page without `data-motion` therefore renders fully
 * visible with zero animation, which is exactly the correct reduced-motion and
 * no-JS fallback: nothing can get stuck invisible waiting for an entrance to play.
 */
export function usePersonaMotion(): RefObject<HTMLElement | null> {
  const rootRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionEnabled =
      !prefersReducedMotion && typeof IntersectionObserver !== "undefined";
    if (!motionEnabled) return;

    // Opt the tree into its hidden pre-animation states only now that we will
    // actually reveal them (see the `data-motion` note above).
    root.setAttribute("data-motion", "");

    // Section reveal: add `is-in` the first time each section scrolls into view.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      // No negative bottom inset: a one-shot reveal pinned near the very bottom
      // of a page that can't scroll further must still cross the trigger line
      // instead of stranding at opacity:0. `threshold` still holds the reveal
      // until ~12% of the section has entered the viewport.
      { threshold: 0.12, rootMargin: "0px" },
    );
    root
      .querySelectorAll(".pp-sec, .pp-spot, .pp-foot")
      .forEach((section) => observer.observe(section));

    // Cover parallax: only wire the scroll listener when a cover is present AND
    // actually rendered. The `page` and `workshop` skins set `.pp-cover {
    // display:none }` while keeping `data-has-cover`, so without this guard the
    // scroll + rAF + getBoundingClientRect + style-write loop would fire on
    // every frame for an invisible element. Layout is available here (we're in
    // a useLayoutEffect after the node is in the DOM), so getComputedStyle is
    // safe. This only skips the parallax wiring — the reveal observer above
    // still runs, and its cleanup below still tears everything down.
    const cover = root.querySelector(".pp-cover[data-has-cover]");
    let scrollListener: (() => void) | null = null;
    let pendingFrame: number | null = null;

    if (cover && getComputedStyle(cover).display !== "none") {
      const applyCoverShift = () => {
        pendingFrame = null;
        const coverRect = cover.getBoundingClientRect();
        // How far the cover's top has scrolled above the viewport top (>= 0).
        const scrolledPast = Math.max(0, -coverRect.top);
        const shift = Math.min(
          scrolledPast * COVER_PARALLAX_FACTOR,
          COVER_SHIFT_MAX_PX,
        );
        root.style.setProperty("--pp-cover-shift", `${shift}px`);
      };

      scrollListener = () => {
        // Coalesce bursts of scroll events into a single rAF-batched write.
        if (pendingFrame !== null) return;
        pendingFrame = requestAnimationFrame(applyCoverShift);
      };

      window.addEventListener("scroll", scrollListener, { passive: true });
      applyCoverShift();
    }

    return () => {
      observer.disconnect();
      if (scrollListener) window.removeEventListener("scroll", scrollListener);
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      root.style.removeProperty("--pp-cover-shift");
    };
  }, [prefersReducedMotion]);

  return rootRef;
}
