import type { SkinBlockControl } from "./skinBlockFields.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";

/**
 * The control to actually show: `control.helperKey` for a `moveTargets` list
 * is fitted to the subprofile's KIND once, ahead of any loaded persona, so it
 * can still name a section this persona's own sections lack ("Move this into
 * Credentials") even though `SkinMoveToSectionAction` already hides its
 * button for that same reason. `SkinChapterControl` passes the result to
 * both the rendered control and `SkinRetiredField`, so the helper and the
 * button agree.
 */
export function useShownRetiredControl(
  control: SkinBlockControl,
): SkinBlockControl {
  const { subprofile } = useSubprofileEditorContext();
  const hasMissingMoveTarget =
    Boolean(control.moveToSection) &&
    !subprofile.sections.some(
      (section) => section.section === control.moveToSection,
    );
  return hasMissingMoveTarget ? { ...control, helperKey: undefined } : control;
}
