import {
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  PROFESSIONS_BY_FIELD,
  type FilterOption,
} from "./memberDirectoryFilter.data";
import {
  fieldLabelKey,
  JOB_FIELD_GROUPS,
  jobFieldGroupLabelKey,
  professionLabelKey,
  type JobFieldGroupId,
} from "./workTaxonomy.data";

export interface WorkFieldSelection {
  discipline: string[];
  profession: string[];
}

/** Resolves a catalog `labelKey` to the label the member actually sees. The
 *  picker passes `t`; tests pass a plain lookup, so matching stays testable
 *  without React or the i18n provider. */
export type LabelResolver = (labelKey: string) => string;

/** One field's matching professions, as the picker renders them while
 *  searching: a field sub-heading with its own chip row beneath. */
export interface ProfessionGroup {
  fieldId: string;
  labelKey: string;
  professions: FilterOption[];
}

/**
 * Fold a string for search: decompose accents, drop the combining marks,
 * lowercase and trim. Applied to both the query and each resolved label, so
 * "medica" finds "Médica" and "ENFERMEIRA" finds "Enfermeira" in PT as well
 * as EN.
 */
export function foldForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Whether a role's label holds the query anywhere: "rist" finds Barista. */
function labelMatches(
  labelKey: string,
  foldedQuery: string,
  resolveLabel: LabelResolver,
): boolean {
  return foldForSearch(resolveLabel(labelKey)).includes(foldedQuery);
}

/** A letter or digit in any script, the inside of a word. */
const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * Whether a field's label holds the query at the start of one of its words,
 * after folding both: "an" finds "Animal care" and passes over "Finance",
 * "saude" finds "Saúde". A field match brings every role in that field, so a
 * two-letter query matching inside a word would list more roles than anyone
 * could scan.
 */
function fieldLabelMatches(
  labelKey: string,
  foldedQuery: string,
  resolveLabel: LabelResolver,
): boolean {
  const foldedLabel = foldForSearch(resolveLabel(labelKey));
  for (
    let matchIndex = foldedLabel.indexOf(foldedQuery);
    matchIndex !== -1;
    matchIndex = foldedLabel.indexOf(foldedQuery, matchIndex + 1)
  ) {
    const previousCharacter = foldedLabel[matchIndex - 1] ?? "";
    if (!WORD_CHARACTER.test(previousCharacter)) return true;
  }
  return false;
}

/**
 * The fields to show as chips while searching, in `DISCIPLINES` order: only
 * the fields whose own label matches at the start of a word
 * (`fieldLabelMatches`). A role match shows under its field in
 * `matchingProfessionGroups` already, so "manager" lists its roles straight
 * away and leaves every field holding a manager out of the chips.
 * Whether a field shows depends on the query alone, so picking or dropping a
 * field mid-search leaves its chip (and keyboard focus) where it was.
 */
export function matchingFields(
  query: string,
  resolveLabel: LabelResolver,
): FilterOption[] {
  const foldedQuery = foldForSearch(query);
  return DISCIPLINES.filter((field) =>
    fieldLabelMatches(field.labelKey, foldedQuery, resolveLabel),
  );
}

/**
 * The professions a search reveals, across all fields whatever the member has
 * selected, grouped under their parent field. A field whose own label matches
 * at the start of a word brings its whole profession list ("saude" shows
 * every Healthcare role, which is how a member discovers what exists there);
 * any other field brings only the professions whose label holds the query
 * anywhere. Fields keep `DISCIPLINES` order and a
 * field left with no profession is dropped, so each result chip always sits
 * under the field it belongs to.
 */
export function matchingProfessionGroups(
  query: string,
  resolveLabel: LabelResolver,
): ProfessionGroup[] {
  const foldedQuery = foldForSearch(query);
  return DISCIPLINES.map((field) => {
    const fieldProfessions = PROFESSIONS_BY_FIELD[field.id] ?? [];
    const isWholeFieldMatch = fieldLabelMatches(
      field.labelKey,
      foldedQuery,
      resolveLabel,
    );
    return {
      fieldId: field.id,
      labelKey: field.labelKey,
      professions: isWholeFieldMatch
        ? fieldProfessions
        : fieldProfessions.filter((profession) =>
            labelMatches(profession.labelKey, foldedQuery, resolveLabel),
          ),
    };
  }).filter((group) => group.professions.length > 0);
}

/**
 * Toggle a field of work, keeping `profession ⊆ discipline` coherent: dropping
 * a field also drops every profession scoped to it, so a member can never keep
 * "Nurse" after removing Healthcare. Mirrors the directory filter's
 * `reconcileProfessions` invariant (see `FilterProfessions.tsx`).
 */
export function toggleWorkField(
  selection: WorkFieldSelection,
  fieldId: string,
): WorkFieldSelection {
  const isSelected = selection.discipline.includes(fieldId);
  return {
    discipline: isSelected
      ? selection.discipline.filter((id) => id !== fieldId)
      : [...selection.discipline, fieldId],
    profession: isSelected
      ? selection.profession.filter((id) => FIELD_BY_PROFESSION[id] !== fieldId)
      : selection.profession,
  };
}

/**
 * Toggle a profession. Picking one auto-adds its parent field, so the member
 * selects one chip where both apply: the same invariant from the other side.
 * This is also what makes a pick from the search results coherent.
 */
export function toggleWorkProfession(
  selection: WorkFieldSelection,
  professionId: string,
): WorkFieldSelection {
  const isSelected = selection.profession.includes(professionId);
  const parentField = FIELD_BY_PROFESSION[professionId];
  return {
    discipline:
      !isSelected && parentField && !selection.discipline.includes(parentField)
        ? [...selection.discipline, parentField]
        : selection.discipline,
    profession: isSelected
      ? selection.profession.filter((id) => id !== professionId)
      : [...selection.profession, professionId],
  };
}

export type PickerFieldGroupId = JobFieldGroupId | "lifeStage";

/** One row of the picker's "browse by field" list: a heading over a handful
 *  of related fields. */
export interface PickerFieldGroup {
  id: PickerFieldGroupId;
  labelKey: string;
  fieldIds: readonly string[];
}

/** A job group's fields plus the profile-only and unlisted fields the picker
 *  files beside them: running your own business sits with Business, games
 *  and adult work with Creative & media (adult work right after
 *  performance, its nearest neighbour). */
function withPickerOnlyFields(
  groupId: JobFieldGroupId,
  fieldIds: readonly string[],
): readonly string[] {
  if (groupId === "business") return [...fieldIds, "ownBusiness"];
  if (groupId === "creativeMedia")
    return [
      ...fieldIds.flatMap((fieldId) =>
        fieldId === "performance" ? [fieldId, "adultWork"] : [fieldId],
      ),
      "games",
    ];
  return fieldIds;
}

/**
 * The picker's browse list, in display order: the job board's field groups
 * (`JOB_FIELD_GROUPS`, so both surfaces read the same way), with the four
 * fields jobs leave out placed among them, and life stage as a group of its
 * own at the end. Every field in `DISCIPLINES` sits in exactly one group.
 */
export const PICKER_FIELD_GROUPS: readonly PickerFieldGroup[] = [
  ...JOB_FIELD_GROUPS.map((group) => ({
    id: group.id,
    labelKey: jobFieldGroupLabelKey(group.id),
    fieldIds: withPickerOnlyFields(group.id, group.fieldIds),
  })),
  {
    id: "lifeStage",
    labelKey: "members:workPicker.group.lifeStage",
    fieldIds: ["lifeStage"],
  },
];

const PICKER_GROUP_BY_FIELD: ReadonlyMap<string, PickerFieldGroup> = new Map(
  PICKER_FIELD_GROUPS.flatMap((group) =>
    group.fieldIds.map((fieldId) => [fieldId, group] as const),
  ),
);

/** The browse group holding a field, or undefined for an unknown id. */
export function pickerFieldGroupOf(
  fieldId: string,
): PickerFieldGroup | undefined {
  return PICKER_GROUP_BY_FIELD.get(fieldId);
}

/** One chip in the picker's "Your picks" row: a picked role, or a picked
 *  field that has no picked role yet. */
export interface WorkPick {
  kind: "field" | "profession";
  id: string;
  /** The field the chip belongs to: its own id for a field chip, the parent
   *  field for a role. */
  fieldId: string;
  labelKey: string;
}

/**
 * The member's picks as one row of chips. Each field shows as its picked
 * roles, or as itself while it has none, so a field never repeats beside its
 * own roles. Picks follow the order the fields were picked in, each field's
 * roles in the order they were picked, so a role picked into a field that
 * showed as a lone chip takes that chip's place.
 */
export function workPicks({
  discipline,
  profession,
}: WorkFieldSelection): WorkPick[] {
  const parentFieldIds = profession.flatMap((professionId) => {
    const parentField = FIELD_BY_PROFESSION[professionId];
    return parentField ? [parentField] : [];
  });
  const fieldOrder = [...new Set([...discipline, ...parentFieldIds])];
  return fieldOrder.flatMap((fieldId): WorkPick[] => {
    const fieldProfessions = profession.filter(
      (professionId) => FIELD_BY_PROFESSION[professionId] === fieldId,
    );
    if (fieldProfessions.length === 0)
      return [
        {
          kind: "field",
          id: fieldId,
          fieldId,
          labelKey: fieldLabelKey(fieldId),
        },
      ];
    return fieldProfessions.map((professionId) => ({
      kind: "profession",
      id: professionId,
      fieldId,
      labelKey: professionLabelKey(professionId),
    }));
  });
}

/**
 * Remove one chip of the picks row. A field chip drops that field. A role
 * chip drops that role, and drops its field as well once no other picked
 * role sits under it, so removing a role never leaves its field behind as a
 * new chip in the role's place.
 */
export function removeWorkPick(
  selection: WorkFieldSelection,
  pick: WorkPick,
): WorkFieldSelection {
  if (pick.kind === "field") return toggleWorkField(selection, pick.id);
  if (!selection.profession.includes(pick.id)) return selection;
  const withoutProfession = toggleWorkProfession(selection, pick.id);
  const hasOtherProfessionInField = withoutProfession.profession.some(
    (professionId) => FIELD_BY_PROFESSION[professionId] === pick.fieldId,
  );
  return hasOtherProfessionInField ||
    !withoutProfession.discipline.includes(pick.fieldId)
    ? withoutProfession
    : toggleWorkField(withoutProfession, pick.fieldId);
}

/** How many of the picks row's chips sit in each browse group, for the
 *  quiet count on a group's row. Groups with no picks are absent. */
export function pickCountsByGroup(
  picks: readonly WorkPick[],
): ReadonlyMap<PickerFieldGroupId, number> {
  const counts = new Map<PickerFieldGroupId, number>();
  for (const pick of picks) {
    const group = pickerFieldGroupOf(pick.fieldId);
    if (group) counts.set(group.id, (counts.get(group.id) ?? 0) + 1);
  }
  return counts;
}
