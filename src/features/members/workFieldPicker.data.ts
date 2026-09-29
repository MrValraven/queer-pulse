import {
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  PROFESSIONS_BY_FIELD,
  type FilterOption,
} from "./memberDirectoryFilter.data";

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

function labelMatches(
  labelKey: string,
  foldedQuery: string,
  resolveLabel: LabelResolver,
): boolean {
  return foldForSearch(resolveLabel(labelKey)).includes(foldedQuery);
}

/**
 * The fields to show as chips while searching, in `DISCIPLINES` order: every
 * field whose own label matches, every field holding a matching profession
 * (so "Nurse" surfaces Healthcare), plus each id in `keptFieldIds`. The picker
 * passes the member's current fields there so their picks stay on screen
 * whatever they type.
 */
export function matchingFields(
  query: string,
  resolveLabel: LabelResolver,
  keptFieldIds: readonly string[] = [],
): FilterOption[] {
  const foldedQuery = foldForSearch(query);
  return DISCIPLINES.filter(
    (field) =>
      keptFieldIds.includes(field.id) ||
      labelMatches(field.labelKey, foldedQuery, resolveLabel) ||
      (PROFESSIONS_BY_FIELD[field.id] ?? []).some((profession) =>
        labelMatches(profession.labelKey, foldedQuery, resolveLabel),
      ),
  );
}

/**
 * The professions a search reveals, across all fields whatever the member has
 * selected, grouped under their parent field. A field whose own label matches
 * brings its whole profession list ("saude" shows every Healthcare role, which
 * is how a member discovers what exists there); any other field brings only
 * the professions whose label matches. Fields keep `DISCIPLINES` order and a
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
    const isWholeFieldMatch = labelMatches(
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
