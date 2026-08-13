/**
 * Canonical pronoun preset chips — the union of the two legacy lists
 * (settings `PRONOUN_CHIPS` + members `PRONOUN_OPTIONS`). These strings are the
 * literal STORED value of a member's pronouns (comma-joined on the record and
 * read on the profile display, outside this module), so they MUST stay in
 * English: translating a preset would silently desync the stored value from its
 * own display. Only ever append — never rename an existing entry.
 */
export const PRONOUN_PRESETS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "ze/zir",
  "any/all",
] as const;

/** Split a stored comma-joined pronoun string into its individual sets. */
export function parsePronouns(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Join a pronoun-set list back into the stored comma-joined string. */
export function serializePronouns(list: string[]): string {
  return list.join(", ");
}
