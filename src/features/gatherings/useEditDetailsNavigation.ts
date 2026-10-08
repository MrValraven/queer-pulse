import { useRef } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  editFieldDomId,
  editSectionHeadingId,
  type EditSaveProblem,
} from "./editDetailsChanges";
import type { EditSectionKey } from "./editDetailsSections";
import { useEditSectionSpy } from "./useEditSectionSpy";

/** The controls a host can type into or press, as `FieldEditorShell` reads
 *  them. A date segment is a `div role="spinbutton"` with `tabIndex={0}`. */
const FOCUSABLE_CONTROL_SELECTOR =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex="0"]';

/**
 * Moving around the edit-details modal: the rail's jump to a section and the
 * footer's "Show the field", both on top of the scroll spy.
 *
 * Every jump scrolls first and then focuses with `preventScroll`, so the
 * focus never fights the scroll. Smooth by default, instant under reduced
 * motion (the OS setting or the in-app toggle).
 */
export function useEditDetailsNavigation(editorId: string) {
  const { reducedMotion } = useMotionPrefs();
  const columnRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const { activeKey, registerSection, holdActiveKey } = useEditSectionSpy(
    columnRef,
    bottomSentinelRef,
  );
  const scrollBehavior: ScrollBehavior = reducedMotion ? "instant" : "smooth";

  const sectionHeading = (key: EditSectionKey) =>
    document.getElementById(editSectionHeadingId(editorId, key));

  const goToSection = (key: EditSectionKey) => {
    const heading = sectionHeading(key);
    const section = heading?.closest<HTMLElement>('[role="group"]') ?? heading;
    section?.scrollIntoView({ block: "start", behavior: scrollBehavior });
    holdActiveKey(key);
    heading?.focus({ preventScroll: true });
  };

  // The field's own control when it carries an id (the id sits on the
  // field's wrapper, or on the control itself, as the capacity input's
  // does), else the section's first control marked invalid, else the
  // section's heading.
  const showField = (problem: EditSaveProblem | null) => {
    if (problem === null || problem.sectionKey === null) return;
    const heading = sectionHeading(problem.sectionKey);
    const section = heading?.closest<HTMLElement>('[role="group"]');
    const fieldWrapper = document.getElementById(
      editFieldDomId(editorId, problem.field),
    );
    const fieldControl = fieldWrapper?.matches(FOCUSABLE_CONTROL_SELECTOR)
      ? fieldWrapper
      : fieldWrapper?.querySelector<HTMLElement>(FOCUSABLE_CONTROL_SELECTOR);
    const target =
      fieldControl ??
      section?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      heading;
    if (!target) return;
    (fieldWrapper ?? target).scrollIntoView({
      block: "center",
      behavior: scrollBehavior,
    });
    holdActiveKey(problem.sectionKey);
    target.focus({ preventScroll: true });
  };

  return {
    columnRef,
    bottomSentinelRef,
    activeKey,
    registerSection,
    goToSection,
    showField,
  };
}
