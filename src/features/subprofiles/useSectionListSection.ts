import { useContext } from "react";
import type { SubprofileSectionView } from "./api/subprofiles.adapters";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { SubprofileEditorContext } from "./subprofileEditorContext";

/**
 * The loaded persona's section behind a `sectionList` control, or undefined
 * when the control is another kind, the persona lacks the section, or no
 * editor context is mounted. `SectionListControl` renders nothing without
 * it, and its slot then leaves out the "(empty)" mark.
 */
export function useSectionListSection(
  control: SkinBlockControl,
): SubprofileSectionView | undefined {
  const context = useContext(SubprofileEditorContext);
  if (control.kind !== "sectionList" || !context) return undefined;
  return context.subprofile.sections.find(
    (candidate) => candidate.section === control.section,
  );
}
