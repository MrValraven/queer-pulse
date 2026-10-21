/** One editable credit. `id` keys the row on screen; the save strips it. */
export interface CreditRow {
  id: string;
  name: string;
  role: string;
}

/** The field a half-filled credit is missing, or null when the row is
 *  complete or empty (an empty row is dropped on save, a half-filled one
 *  blocks it so no attribution is lost). */
export function missingCreditFieldOf(
  credit: CreditRow,
): "name" | "role" | null {
  const hasName = credit.name.trim() !== "";
  const hasRole = credit.role.trim() !== "";
  if (hasName && !hasRole) return "role";
  if (hasRole && !hasName) return "name";
  return null;
}
