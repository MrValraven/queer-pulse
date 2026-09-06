/**
 * Turn a glossary term into a slug the backend will accept.
 *
 * `CreateGlossaryTermDto` enforces `^[a-z0-9]+(?:-[a-z0-9]+)*$`, and glossary
 * terms carry accents ("Aro/ace", "Português · na comunidade"), so the
 * diacritics are folded rather than replaced by hyphens: the repo's other
 * `slugify` helpers turn "Português" into "portugu-s", which the DTO rejects.
 */
export function slugifyGlossaryTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
