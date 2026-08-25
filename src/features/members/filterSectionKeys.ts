/** The collapsible filter groups on the members directory. Order here is the
 *  render order in the sidebar. */
export type SectionKey =
  | "openTo"
  | "hoods"
  | "fields"
  | "professions"
  | "identities"
  | "age"
  | "languages";

export const FILTER_SECTION_KEYS: SectionKey[] = [
  "openTo",
  "hoods",
  "fields",
  "professions",
  "identities",
  "age",
  "languages",
];

/** Default view state: every section starts collapsed (a compact "menu"). */
export const ALL_SECTIONS_COLLAPSED: Record<SectionKey, boolean> = {
  openTo: false,
  hoods: false,
  fields: false,
  professions: false,
  identities: false,
  age: false,
  languages: false,
};

/** Guard for the persisted open-map: an object with a boolean for every key.
 *  A stored value missing/extending keys (e.g. after this list changes) is
 *  rejected so state falls back to the all-collapsed default. */
export function isSectionOpenMap(
  value: unknown,
): value is Record<SectionKey, boolean> {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return FILTER_SECTION_KEYS.every((key) => typeof record[key] === "boolean");
}
