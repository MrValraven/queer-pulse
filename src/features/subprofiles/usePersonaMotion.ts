import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";

/** How far past the top of the viewport counts toward the parallax shift. */
const COVER_PARALLAX_FACTOR = 0.12;
/** Hard cap on the cover shift so the motion stays a gentle nudge, never a slide. */
const COVER_SHIFT_MAX_PX = 24;
/** The blocks that start hidden and fade up on scroll-in. */
const REVEAL_TARGETS = ".pp-sec, .pp-spot, .pp-foot";

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
    const observeTargets = (scope: Element) => {
      if (scope.matches(REVEAL_TARGETS)) observer.observe(scope);
      scope
        .querySelectorAll(REVEAL_TARGETS)
        .forEach((section) => observer.observe(section));
    };
    observeTargets(root);

    // Sections that mount AFTER this effect must be watched too, or they sit
    // at opacity:0 forever. On the public page the tree is complete on first
    // render, but the editor's live preview keeps this same `.pp` mounted
    // while the owner edits: the first item added to an empty section
    // (a section with no items renders nothing) or a newly starred item's
    // Spotlight mounts a brand-new block, which used to stay invisible —
    // "my campaign doesn't show in the preview". `IntersectionObserver`
    // reports a newly observed node's state straight away, so one already in
    // view fades in at once, which also reads as feedback for the edit.
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) observeTargets(node);
        }),
      );
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

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
      mutationObserver.disconnect();
      if (scrollListener) window.removeEventListener("scroll", scrollListener);
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
      root.style.removeProperty("--pp-cover-shift");
    };
  }, [prefersReducedMotion]);

  return rootRef;
}
