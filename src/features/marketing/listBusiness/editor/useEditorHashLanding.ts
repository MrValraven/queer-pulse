import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { ListingEditorSectionDefinition } from "./listingEditor.data";
import { jumpToEditorSection } from "./jumpToEditorSection";

/**
 * Lands on the section a link named: `/local/directory/list/<ref>/edit#lb-editor-trading`
 * opens the editor with the trading and visibility controls in view and
 * focused, the same as pressing that section in the jump nav.
 *
 * `ScrollManager` already honours a hash, but only at the moment the route
 * changes, and the editor mounts later, once its listing has loaded. So the
 * editor does its own landing once, after its first render. Once only: the
 * effect re-runs whenever the section list changes (switching the pricing to
 * a menu retitles one), and editing a field must leave the reader where they
 * are.
 *
 * Only an id from `sections` (the list this member's role renders) counts, so
 * a hash naming a block this member never sees lands nowhere.
 */
export function useEditorHashLanding(
  sections: ListingEditorSectionDefinition[],
  prefersReducedMotion: boolean,
): void {
  const { hash } = useLocation();
  const hasLandedRef = useRef(false);

  useEffect(() => {
    if (hasLandedRef.current) return;
    hasLandedRef.current = true;
    const sectionId = hash.slice(1);
    if (!sections.some((section) => section.id === sectionId)) return;
    jumpToEditorSection(sectionId, prefersReducedMotion);
  }, [hash, sections, prefersReducedMotion]);
}
