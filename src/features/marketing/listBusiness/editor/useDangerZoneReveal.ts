import { useCallback, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation } from "react-router-dom";
import { jumpToEditorSection } from "./jumpToEditorSection";
import {
  isSectionShownForListing,
  LISTING_EDITOR_SECTION_BY_KEY,
  LISTING_EDITOR_SECTIONS,
  LISTING_EDITOR_SECTION_IDS,
} from "./listingEditor.data";

const DANGER_ZONE_SECTION_ID = LISTING_EDITOR_SECTION_BY_KEY.dangerZone.id;

const SECTION_IDS_WITHOUT_DANGER_ZONE = LISTING_EDITOR_SECTION_IDS.filter(
  (sectionId) => sectionId !== DANGER_ZONE_SECTION_ID,
);

/** The section ids an online-only listing renders. Today that is every
 *  section (it answers its own accessibility questions); the list stays so a
 *  section hidden by kind in `listingEditor.data` drops out of the spy too. */
const ONLINE_SECTION_IDS = LISTING_EDITOR_SECTIONS.filter((section) =>
  isSectionShownForListing(section.key, true),
).map((section) => section.id);

const ONLINE_SECTION_IDS_WITHOUT_DANGER_ZONE = ONLINE_SECTION_IDS.filter(
  (sectionId) => sectionId !== DANGER_ZONE_SECTION_ID,
);

/**
 * Keeps the Danger zone off the page until its jump-nav entry is pressed, so
 * the delete button never sits at the end of the form waiting to be scrolled
 * into by accident. Pressing any other entry folds it away again.
 *
 * A link that names the section (`#lb-editor-danger-zone`) opens the editor
 * with it already out, so `useEditorHashLanding` finds it on the first render.
 *
 * The open state is flushed before the jump, because the section has to be in
 * the DOM for `scrollIntoView` to reach it, and folding it first keeps the
 * scroll target measured against the page that will actually stay. The
 * returned section ids feed the scroll-spy, which only observes elements that
 * exist when it registers, so it re-registers each time the section appears.
 *
 * The same goes for any section an online-only listing does not render
 * (`isSectionShownForListing`; none today): `isOnline` picks a list without
 * it, so switching the toggle hands the spy a new list and the section is
 * observed again once it is back on the page. All four lists are
 * module-level, so the spy only re-registers when one of the two answers
 * actually changes.
 */
export function useDangerZoneReveal(
  prefersReducedMotion: boolean,
  isOnline = false,
) {
  const { hash } = useLocation();
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(
    () => hash === `#${DANGER_ZONE_SECTION_ID}`,
  );

  const spySectionIds = useMemo(() => {
    if (isOnline) {
      return isDangerZoneOpen
        ? ONLINE_SECTION_IDS
        : ONLINE_SECTION_IDS_WITHOUT_DANGER_ZONE;
    }
    return isDangerZoneOpen
      ? LISTING_EDITOR_SECTION_IDS
      : SECTION_IDS_WITHOUT_DANGER_ZONE;
  }, [isDangerZoneOpen, isOnline]);

  const jumpToSection = useCallback(
    (sectionId: string) => {
      flushSync(() =>
        setIsDangerZoneOpen(sectionId === DANGER_ZONE_SECTION_ID),
      );
      jumpToEditorSection(sectionId, prefersReducedMotion);
    },
    [prefersReducedMotion],
  );

  return { isDangerZoneOpen, spySectionIds, jumpToSection };
}
