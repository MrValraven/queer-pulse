import { useEffect, useState } from "react";

/**
 * Which editor section is currently under the reader's eye, so the jump nav
 * can mark it. Observes the section elements and takes the topmost one inside
 * a band around the middle of the viewport, which is what "the section I am
 * looking at" means while scrolling a long form.
 *
 * Pass a module-level constant array: the observer re-registers whenever the
 * identity of `sectionIds` changes.
 */
export function useActiveEditorSection(sectionIds: string[]): string {
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    // jsdom (and very old browsers) have no observer: the nav still jumps,
    // it just never highlights.
    if (typeof IntersectionObserver === "undefined") return;
    const elements = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topmostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top,
          )[0];
        if (topmostVisible) setActiveSectionId(topmostVisible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSectionId;
}
