import { GUIDE_LIMITS } from "./guideWorkspace.data";

/** Lowercase ASCII words joined by single hyphens, at most `maxLength` long. */
export function toKebabSlug(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/** `base`, or `base-2`, `base-3`... when taken. An empty base becomes `section`. */
export function uniqueAnchor(
  base: string,
  takenAnchors: ReadonlySet<string>,
): string {
  const root = base || "section";
  if (!takenAnchors.has(root)) return root;
  let suffix = 2;
  while (takenAnchors.has(`${root}-${suffix}`)) suffix += 1;
  return `${root}-${suffix}`;
}

/** The anchor a section with `heading` should carry, unique among the others.
 *  Leaves room under the 80-character limit for a numeric suffix. */
export function anchorForHeading(
  heading: string,
  otherAnchors: ReadonlySet<string>,
): string {
  return uniqueAnchor(
    toKebabSlug(heading, GUIDE_LIMITS.anchor - 4),
    otherAnchors,
  );
}

export function guideSlugFromTitle(title: string): string {
  return toKebabSlug(title, GUIDE_LIMITS.slug);
}
