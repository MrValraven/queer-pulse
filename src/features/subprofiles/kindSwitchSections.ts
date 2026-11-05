import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";
import { KIND_SECTIONS } from "./subprofile-kinds";

export interface KindSwitchSectionChanges {
  /** Sections the persona stops showing. Follows the old kind's order. */
  hidden: SubprofileSection[];
  /** Sections the new kind adds. Follows the new kind's order. */
  appearing: SubprofileSection[];
  /** Sections both kinds show. Follows the new kind's order. */
  staying: SubprofileSection[];
}

/**
 * How the content sections change when a persona switches kind. Compares
 * `KIND_SECTIONS` only, so the universal `gallery` and `links` sections never
 * appear in any list.
 */
export const sectionChangesForKindSwitch = (
  fromKind: SubprofileKind,
  toKind: SubprofileKind,
): KindSwitchSectionChanges => {
  const fromSections = KIND_SECTIONS[fromKind];
  const toSections = KIND_SECTIONS[toKind];
  return {
    hidden: fromSections.filter((section) => !toSections.includes(section)),
    appearing: toSections.filter((section) => !fromSections.includes(section)),
    staying: toSections.filter((section) => fromSections.includes(section)),
  };
};
