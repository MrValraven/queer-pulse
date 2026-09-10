import { useEffect, useMemo, useRef, useState } from "react";

export interface LandingSection {
  /** The DOM id the section component already carries, e.g. `#housing`. */
  id: string;
  /** Catalog key for the visible label. Resolve with `t()`. */
  labelKey: string;
}

/**
 * The landing sections `LandingNav` can link to, in the order `HomePage`
 * renders them.
 *
 * `id` is the id already written on each section in
 * `features/homepage/sections/*` (`<section id="housing">`), so the anchor and
 * its destination stay tied together by that one id instead of by a second,
 * hand-kept list of hrefs. This is a CURATED subset of the landing's sections:
 * the row has to fit inside the nav pill, so the sections that carry the pitch
 * are in and `#discovery` and `#changemakers` stay out.
 *
 * `#why` (PainPoints, "Why we built this") is in even though its label is the
 * longest in the row: for the visitor this nav is FOR, a signed-out reader in
 * live mode, it is the closing argument before the invite, and four of the
 * seven links below never render for them (see `useLandingSections`), so the
 * row it actually joins is short. The crowded seven-link row only exists in
 * demo mode, where the flex row's `overflow: hidden` already handles it.
 */
export const LANDING_SECTIONS: LandingSection[] = [
  { id: "about", labelKey: "nav:landing.about" },
  { id: "communities", labelKey: "nav:landing.communities" },
  { id: "gather", labelKey: "nav:landing.gatherings" },
  { id: "housing", labelKey: "nav:landing.housing" },
  { id: "personas", labelKey: "nav:landing.personas" },
  { id: "why", labelKey: "nav:landing.why" },
  { id: "stories", labelKey: "nav:landing.stories" },
];

/** The ids from LANDING_SECTIONS currently in the document, as a stable key. */
function readPresentKey(): string {
  if (typeof document === "undefined") return "";
  return LANDING_SECTIONS.filter((section) =>
    document.getElementById(section.id),
  )
    .map((section) => section.id)
    .join(",");
}

/**
 * The subset of `LANDING_SECTIONS` actually on the page right now.
 *
 * Half the landing is conditional. In live mode `LiveGatherings`,
 * `LiveStories`, `LiveCommunities` and `LiveChangeMakers` render nothing for a
 * signed-out visitor or while nothing has been curated (see `HomePage`'s header
 * comment), so a hardcoded link row would offer anchors that lead nowhere. The
 * nav therefore reads the DOM, and a `MutationObserver` re-reads it as those
 * queries resolve and their sections mount, so a link appears only once its
 * section exists.
 *
 * State is held as a joined id string rather than an array so an observer
 * callback that finds no change sets identical state and stops there, instead
 * of handing back a fresh array on every DOM mutation.
 */
export function useLandingSections(): LandingSection[] {
  const [presentKey, setPresentKey] = useState<string>(readPresentKey);

  useEffect(() => {
    const recompute = () =>
      setPresentKey((current) => {
        const next = readPresentKey();
        return next === current ? current : next;
      });
    // AppChrome renders above <main> in the tree, but effects run after the
    // whole commit reaches the DOM, so the shell's <main> is already there.
    // Body is the fallback for the frames that render their own main.
    const target =
      document.querySelector("main[data-page-main]") ?? document.body;
    recompute();
    const observer = new MutationObserver(recompute);
    observer.observe(target, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return useMemo(() => {
    const present = new Set(presentKey ? presentKey.split(",") : []);
    return LANDING_SECTIONS.filter((section) => present.has(section.id));
  }, [presentKey]);
}

/**
 * Which of `sections` the reader is currently looking at, for the nav's active
 * marker; `null` while the hero is still on screen.
 *
 * The top rootMargin inset is what stops a section counting as "active" while
 * it is still hidden behind the fixed nav pill; the bottom inset keeps the
 * NEXT section from claiming the marker the instant its first pixel appears.
 * Ties are broken by document order, so the topmost visible section wins.
 */
export function useActiveLandingSection(
  sections: LandingSection[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleIds = useRef<Set<string>>(new Set());
  const sectionKey = sections.map((section) => section.id).join(",");

  useEffect(() => {
    const ids = sectionKey ? sectionKey.split(",") : [];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;
    const visible = visibleIds.current;
    visible.clear();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActiveId(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    for (const element of elements) observer.observe(element);
    return () => {
      observer.disconnect();
      visible.clear();
    };
  }, [sectionKey]);

  // Derived rather than cleared inside the effect: when a section leaves the
  // page its observer is disconnected without a final callback, so the id it
  // last reported would otherwise stay marked active on a link that is gone.
  return sections.some((section) => section.id === activeId) ? activeId : null;
}
