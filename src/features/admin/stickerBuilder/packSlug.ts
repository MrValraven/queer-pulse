/** The pack slug shape the backend's create DTO accepts: lowercase letters and
 *  digits in runs joined by single hyphens. */
export const PACK_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const PACK_SLUG_MIN_LENGTH = 2;
const PACK_SLUG_MAX_LENGTH = 64;

/**
 * Suggests a slug from a pack name as the admin types it: lowercase, accents
 * folded to their base letter ("Orgulho à Noite" becomes "orgulho-a-noite"),
 * every other run of non-alphanumerics collapsed into one hyphen, and trimmed
 * to the backend's 64-character limit without a dangling hyphen.
 */
export function slugifyPackName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PACK_SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

/** Whether a slug would pass the backend's create DTO. */
export function isValidPackSlug(slug: string): boolean {
  return (
    slug.length >= PACK_SLUG_MIN_LENGTH &&
    slug.length <= PACK_SLUG_MAX_LENGTH &&
    PACK_SLUG_PATTERN.test(slug)
  );
}
