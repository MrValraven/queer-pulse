import { createContext } from "react";
import type { ResourceResponseDTO } from "./api/resources.api";

/**
 * Guides whose hardcoded page reads its managed sections one at a time, by
 * anchor, and keeps its own catalog copy for every section an editor has not
 * written (RES-F5), mapped to the anchors that page reads. Sections on one of
 * these override that part of the page, so the whole page stays and only the
 * matching parts change. A section at any other anchor reaches no reader.
 *
 * The sexual-health anchors are its `TabId` values in `sexualHealth.data.ts`,
 * listed here as plain strings so this module stays free of the page's icons.
 */
export const SECTION_COMPOSED_GUIDE_ANCHORS: Readonly<
  Record<string, readonly string[]>
> = {
  "sexual-health": ["testing", "prep", "hiv", "guides"],
};

/** The slugs in `SECTION_COMPOSED_GUIDE_ANCHORS`. */
export const SECTION_COMPOSED_GUIDE_SLUGS: ReadonlySet<string> = new Set(
  Object.keys(SECTION_COMPOSED_GUIDE_ANCHORS),
);

/** The anchors a section-composed guide's page reads, or null for any other
 *  guide (whose sections take the whole page over). */
export function sectionComposedAnchors(slug: string): readonly string[] | null {
  return SECTION_COMPOSED_GUIDE_ANCHORS[slug] ?? null;
}

/** The fields `useManagedGuideSection` reads from a guide row. */
export type ManagedGuideRow = Pick<
  ResourceResponseDTO,
  "slug" | "sections" | "sectionsPt"
>;

/**
 * A guide row handed straight to a section-composed page, read by
 * `useManagedGuideSection` ahead of the public lookup. The admin preview
 * provides the admin row, so an editor sees the sections an unpublished or
 * unreviewed guide will show, which the public endpoint does not serve yet.
 */
export const ManagedGuideRowContext = createContext<ManagedGuideRow | null>(
  null,
);
