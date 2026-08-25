import { FIELD_BY_PROFESSION } from "./memberDirectoryFilter.data";

export interface WorkFieldSelection {
  discipline: string[];
  profession: string[];
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
 * Toggle a profession. Picking one auto-adds its parent field rather than
 * asking the member to select both — the same invariant from the other side.
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
