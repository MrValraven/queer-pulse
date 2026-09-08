import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { policySectionElementId } from "./adminGovernancePolicySection.utils";
import {
  POLICY_SECTION_IDS,
  type PolicySectionId,
} from "./adminGovernancePolicyDraft";

/**
 * Which section the editor is looking at, and how to jump to another one.
 *
 * The rail, the section cards and the live preview all highlight the same
 * section, and all three read it from here, so scrolling the editor moves the
 * preview's highlight and clicking the rail moves both. An
 * `IntersectionObserver` with a thin band near the top of the viewport does the
 * watching: a scroll listener would run this comparison on every frame of every
 * scroll, for a highlight that changes five times a page.
 */
export function useActivePolicySection() {
  const [activeSectionId, setActiveSectionId] =
    useState<PolicySectionId>("health");
  const visibleSectionIdsRef = useRef<Set<PolicySectionId>>(new Set());
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const visibleSectionIds = visibleSectionIdsRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = entry.target.getAttribute(
            "data-policy-section",
          ) as PolicySectionId | null;
          if (!sectionId) continue;
          if (entry.isIntersecting) visibleSectionIds.add(sectionId);
          else visibleSectionIds.delete(sectionId);
        }
        // First in page order wins, so scrolling down hands the highlight over
        // only once the section above has left the band.
        const nextSectionId = POLICY_SECTION_IDS.find((sectionId) =>
          visibleSectionIds.has(sectionId),
        );
        if (nextSectionId) setActiveSectionId(nextSectionId);
      },
      // A band just under the sticky page header. Sections outside it are not
      // "what you are looking at", however much of them is on screen.
      { rootMargin: "-104px 0px -62% 0px", threshold: 0 },
    );

    for (const sectionId of POLICY_SECTION_IDS) {
      const element = document.getElementById(
        policySectionElementId(sectionId),
      );
      if (element) observer.observe(element);
    }
    return () => {
      observer.disconnect();
      visibleSectionIds.clear();
    };
  }, []);

  const jumpToSection = useCallback(
    (sectionId: PolicySectionId) => {
      setActiveSectionId(sectionId);
      document
        .getElementById(policySectionElementId(sectionId))
        ?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
    },
    [prefersReducedMotion],
  );

  return { activeSectionId, jumpToSection };
}
