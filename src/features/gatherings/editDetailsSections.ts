import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiCheckSquare,
  FiFileText,
  FiHeart,
  FiUsers,
} from "react-icons/fi";
import type { GatheringDetailsDraft } from "./editDetailsDraft";

/**
 * The five parts of the edit-details modal, in the order the form shows them.
 * The rail, the phone strip, the scroll spy, the "Edited" dots, the section
 * reset and the footer's change count all read this one list, so a section
 * named here is a section everywhere.
 */
export const EDIT_SECTION_KEYS = [
  "gathering",
  "whenWhere",
  "audience",
  "care",
  "rsvp",
] as const;

export type EditSectionKey = (typeof EDIT_SECTION_KEYS)[number];

type DraftField = keyof GatheringDetailsDraft;

/**
 * The draft fields each section owns. A field belongs to the section that
 * shows it, so "Undo section changes" puts back exactly what the host can see
 * under that heading, and the "Edited" dot lights on the section they changed.
 */
export const EDIT_SECTION_FIELDS = {
  gathering: [
    "title",
    "gatheringFamily",
    "format",
    "otherText",
    "formatDetails",
    "description",
    "coverImageUrl",
  ],
  whenWhere: ["startAt", "endAt", "location", "costKind", "cost"],
  audience: ["communitySlug", "visibility", "capacity"],
  care: ["themes", "contentNotes", "houseRules"],
  rsvp: ["rsvpCutoff", "rsvpQuestions", "customRsvpQuestion"],
} as const satisfies Record<EditSectionKey, readonly DraftField[]>;

type FieldsOfSection<Key extends EditSectionKey> =
  (typeof EDIT_SECTION_FIELDS)[Key][number];

/** Draft fields no section lists. */
type UnplacedDraftField = Exclude<DraftField, FieldsOfSection<EditSectionKey>>;

/** Draft fields listed by more than one section. */
type DoublyPlacedDraftField = {
  [Key in EditSectionKey]: Extract<
    FieldsOfSection<Key>,
    FieldsOfSection<Exclude<EditSectionKey, Key>>
  >;
}[EditSectionKey];

type MustBeEmpty<Fields extends never> = Fields;

/**
 * A build-time check that every field of `GatheringDetailsDraft` belongs to
 * exactly one section. A new draft field breaks the typecheck here until it is
 * placed, so it can never be edited without lighting a section's "Edited"
 * dot, or slip past "Undo section changes". Exported only so the check is
 * not flagged as unused.
 */
export type EditSectionFieldsArePlaced = [
  MustBeEmpty<UnplacedDraftField>,
  MustBeEmpty<DoublyPlacedDraftField>,
];

export interface EditSectionConfig {
  key: EditSectionKey;
  titleKey: string;
  hintKey: string;
  icon: IconType;
  fields: readonly DraftField[];
}

const SECTION_ICONS: Record<EditSectionKey, IconType> = {
  gathering: FiFileText,
  whenWhere: FiCalendar,
  audience: FiUsers,
  care: FiHeart,
  rsvp: FiCheckSquare,
};

export function editSectionConfig(key: EditSectionKey): EditSectionConfig {
  return {
    key,
    titleKey: `gatherings:manage.editModal.section.${key}`,
    hintKey: `gatherings:manage.editModal.sectionHint.${key}`,
    icon: SECTION_ICONS[key],
    fields: EDIT_SECTION_FIELDS[key],
  };
}

export const EDIT_SECTIONS: readonly EditSectionConfig[] =
  EDIT_SECTION_KEYS.map(editSectionConfig);
