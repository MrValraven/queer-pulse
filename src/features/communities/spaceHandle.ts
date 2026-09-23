/** The backend DTO caps a space's handle at this many characters. */
export const MAX_SPACE_HANDLE_LENGTH = 100;

/**
 * Cleans a web address as it is typed. `slugify` strips a trailing hyphen,
 * so running it per keystroke swallowed the space between two words; this
 * keeps the hyphen until the next letter lands, and `toFinalHandle` runs
 * once on submit to tidy the ends.
 */
export function toHandleDraft(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, MAX_SPACE_HANDLE_LENGTH);
}

/**
 * The address as it is sent: the typed draft with its trailing hyphens
 * dropped. It keeps the full MAX_SPACE_HANDLE_LENGTH the backend accepts,
 * where the wizard's `slugify` would cut it at 48 characters. An address
 * made only of hyphens finalizes to an empty string.
 */
export function toFinalHandle(value: string): string {
  return toHandleDraft(value).replace(/-+$/, "");
}

/** The address a name suggests, used to fill the field until it is edited. */
export function handleFromName(name: string): string {
  return toFinalHandle(name);
}
