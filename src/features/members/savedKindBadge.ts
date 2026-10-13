import type { SavedKind } from "../../app/providers/useSaved";

const STUDIO_PREFIX = "studio_";

/** The three-letter badge a saved row shows. Studio kinds share a prefix,
 *  so it is dropped first: a release reads REL, a playlist PLA. */
export function savedKindBadge(kind: SavedKind): string {
  const name = kind.startsWith(STUDIO_PREFIX)
    ? kind.slice(STUDIO_PREFIX.length)
    : kind;
  return name.slice(0, 3).toUpperCase();
}
