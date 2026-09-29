// src/features/messages/useStickerPackScrollSpy.ts
import { useEffect, useRef, useState, type RefObject } from "react";
import type { StickerPackResponse } from "../../shared/contracts/contracts";

/** How long a rail tap's own smooth scroll gets to settle before the
 *  scroll-spy observer is trusted again, for browsers with no `scrollend`
 *  event (Safari, as of this writing). Comfortably longer than the CSS
 *  `smooth` scroll the tap kicks off. Browsers that DO support `scrollend`
 *  need no timer at all: that event is guaranteed to fire once scrolling
 *  actually stops, so a timer alongside it could only ever cut a long
 *  smooth scroll short. */
const SCROLL_SETTLE_FALLBACK_MS = 600;

const supportsScrollEnd =
  typeof window !== "undefined" && "onscrollend" in window;

interface UseStickerPackScrollSpyResult {
  bodyRef: RefObject<HTMLDivElement | null>;
  activePackId: string | undefined;
  registerSection: (packId: string, node: HTMLDivElement | null) => void;
  scrollToPack: (packId: string) => void;
}

/**
 * Scroll-spy for `StickerPicker`'s own scroll area, split out to keep that
 * component under the repo's 200-line budget: tracks which pack section
 * currently occupies the scroll area's own top band (`IntersectionObserver`)
 * and exposes it as `activePackId`, the same sort-by-top approach
 * `RightsSideNav.tsx` uses for one topmost section out of several
 * simultaneously intersecting ones.
 *
 * The last-pack scroll-anchoring problem this hook USED to also solve here
 * (a rail tap scrolling the LAST pack to `block: "start"` couldn't reach the
 * top when that pack's own content was too short to fill the scroll area) is
 * now solved entirely in `StickerPicker.module.css`, by giving the last
 * section a `min-height` equal to the panel's own max-height: a purely CSS,
 * unconditionally definite fix, with no `.body` measurement of any kind.
 * An earlier version measured `.body`'s own rendered height here with a
 * `ResizeObserver` and published it as a custom property that CSS rule then
 * read back: still capable of looping in some layouts (a small catalogue
 * embedded in the Emoji tab's Stickers view never actually reached the
 * panel's cap, so each measurement nudged the next one a little further).
 * Removed for that reason; see that CSS file's own comments for the fix.
 *
 * `packs` and `hasRail` both come from `StickerPicker`'s own single
 * `packsWithStickers` list (the same one it hands `StickerPackRail`), so
 * this hook's own gate never drifts out of sync with what the rail renders.
 */
export function useStickerPackScrollSpy(
  packs: StickerPackResponse[] | undefined,
  hasRail: boolean,
): UseStickerPackScrollSpyResult {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLDivElement>());
  const [activePackId, setActivePackId] = useState<string | undefined>(
    undefined,
  );
  // While a rail tap's own smooth scroll is still in flight, the observer
  // would re-highlight every pack it passes through on the way, a visible
  // flicker. Suppressed until the scroll settles (`scrollend`, a timeout
  // fallback, or the user grabbing the scroll themselves).
  const isSuppressedRef = useRef(false);
  // The previous tap's own cleanup, so a second tap within the first tap's
  // settle window tears down the first tap's listeners/timer up front, ahead
  // of the first tap's own `scrollend` (or fallback timer), which can
  // otherwise fire mid-way through the second tap's scroll and end ITS
  // suppression early, letting the observer flicker through the packs the
  // second scroll still has left to pass.
  const endSuppressionRef = useRef<(() => void) | null>(null);

  function registerSection(packId: string, node: HTMLDivElement | null) {
    if (node) sectionRefs.current.set(packId, node);
    else sectionRefs.current.delete(packId);
  }

  function scrollToPack(packId: string) {
    // Tear down any still-armed suppression from a previous tap before
    // arming this one's own.
    endSuppressionRef.current?.();

    // Set at once, ahead of the observer below noticing the section has
    // scrolled in: a rail tap marks its own tile immediately.
    setActivePackId(packId);
    const body = bodyRef.current;
    const section = sectionRefs.current.get(packId);
    if (!body || !section) return;

    isSuppressedRef.current = true;
    let settleTimeout: ReturnType<typeof setTimeout> | undefined;
    const endSuppression = () => {
      isSuppressedRef.current = false;
      if (settleTimeout !== undefined) clearTimeout(settleTimeout);
      body.removeEventListener("scrollend", endSuppression);
      body.removeEventListener("wheel", endSuppression);
      body.removeEventListener("touchstart", endSuppression);
      endSuppressionRef.current = null;
    };
    endSuppressionRef.current = endSuppression;
    body.addEventListener("scrollend", endSuppression);
    body.addEventListener("wheel", endSuppression, { passive: true });
    body.addEventListener("touchstart", endSuppression, { passive: true });
    // Browsers with no `scrollend` support need a fallback timer to end the
    // suppression at all; browsers that DO support it get the real event
    // only, since a timer alongside it could only cut a long smooth scroll
    // short.
    if (!supportsScrollEnd) {
      settleTimeout = setTimeout(endSuppression, SCROLL_SETTLE_FALLBACK_MS);
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  // Tears down a still-armed tap's own listeners/timer on unmount, the same
  // cleanup `endSuppression` itself runs, so nothing leaks past this hook's
  // own lifetime.
  useEffect(() => {
    return () => endSuppressionRef.current?.();
  }, []);

  useEffect(() => {
    // `hasRail` is the single source of truth for "two or more packs with
    // stickers" (computed once in `StickerPicker` from the very list passed
    // here as `packs`): reusing it here keeps this observer's own gate
    // permanently in sync with the rail's own gate, with no second
    // `packs.length` check of its own that could drift out of step with it.
    if (!packs || !hasRail) return;
    const root = bodyRef.current;
    if (!root) return;

    const sectionToPackId = new Map<Element, string>();
    for (const pack of packs) {
      const section = sectionRefs.current.get(pack.id);
      if (section) sectionToPackId.set(section, pack.id);
    }
    if (sectionToPackId.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isSuppressedRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const topEntry = visible[0];
        if (!topEntry) return;
        const packId = sectionToPackId.get(topEntry.target);
        if (packId) setActivePackId(packId);
      },
      { root, rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    sectionToPackId.forEach((_packId, section) => observer.observe(section));
    return () => observer.disconnect();
  }, [packs, hasRail]);

  return { bodyRef, activePackId, registerSection, scrollToPack };
}
