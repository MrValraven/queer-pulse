import { useEffect, useState } from "react";

/**
 * Scroll-spy for a fixed list of section ids: returns whichever one is
 * currently closest to the top of the viewport among those intersecting, so
 * a section-jump nav (see `ProfileSectionNav`) can highlight the section the
 * reader is actually looking at. Mirrors the v2 design's `#snav` `.on` state.
 *
 * Elements that don't exist in the DOM yet (e.g. a section still behind an
 * async data fetch, like the subprofiles "Also working as" block) are picked
 * up as soon as they mount, via a `MutationObserver` — not just skipped once
 * at effect-setup time, since `sectionIds` for an always-shown section never
 * changes to re-trigger that setup.
 *
 * The `MutationObserver` keeps watching for the effect's whole lifetime
 * rather than disconnecting once every id has been found: right after an SPA
 * navigation, the routed page can remount a couple of times in quick
 * succession (React's dev-mode double-invoke, the `AnimatePresence`-based
 * route transition swapping the outgoing/incoming page) — if that happens
 * AFTER the one-shot bootstrap already found every section, the
 * `IntersectionObserver` is left watching the earlier, now-detached DOM
 * nodes forever and the highlight freezes until a full reload gives it a
 * single stable mount to attach to. Comparing element IDENTITY (not just "do
 * we already know this id") lets it re-observe a section whose node got
 * swapped out from under it.
 */
export function useSectionScrollSpy(
  sectionIds: readonly string[],
): string | null {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // Stable key so the effect only re-subscribes when the actual set of ids
  // changes, not on every render (the caller typically derives a fresh array
  // each render from profile data).
  const sectionIdsKey = sectionIds.join("|");

  useEffect(() => {
    const ids = sectionIdsKey.split("|").filter(Boolean);
    if (ids.length === 0) return;

    // A callback's `entries` only lists targets whose intersection state
    // just FLIPPED, not every target currently intersecting — so this tracks
    // the accumulated state ourselves. Without it, a section that's been
    // intersecting for a while (and is still clearly the one on screen) can
    // lose the active highlight the instant some OTHER section's edge merely
    // grazes into the reading band: that section is the only one in the
    // batch, so a topmost-of-`entries` reduce would wrongly crown it.
    const intersectingRects = new Map<string, DOMRectReadOnly>();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingRects.set(entry.target.id, entry.boundingClientRect);
          } else {
            intersectingRects.delete(entry.target.id);
          }
        }
        if (intersectingRects.size === 0) return;
        const [topmostId] = [...intersectingRects].reduce((closest, entry) =>
          entry[1].top < closest[1].top ? entry : closest,
        );
        setActiveSectionId(topmostId);
      },
      // Treats a section as "active" once it's crossed 15% down from the top
      // and hasn't yet crossed 70% up from the bottom — a comfortable reading
      // band rather than the literal top pixel.
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    const observedElements = new Map<string, Element>();

    function syncObservedSections() {
      for (const id of ids) {
        const sectionElement = document.getElementById(id);
        if (!sectionElement || observedElements.get(id) === sectionElement) {
          continue;
        }
        const previousElement = observedElements.get(id);
        if (previousElement) intersectionObserver.unobserve(previousElement);
        observedElements.set(id, sectionElement);
        intersectionObserver.observe(sectionElement);
      }
    }

    const mutationObserver = new MutationObserver(syncObservedSections);
    syncObservedSections();
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [sectionIdsKey]);

  return activeSectionId;
}
