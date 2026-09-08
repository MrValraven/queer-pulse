import type {
  AdminNavBadge,
  AdminNavItem,
  AdminNavSection,
} from "./adminNav.data";

/** Live pending count per queue, resolved once in AdminSidebar and passed down. */
export type AdminNavBadgeCounts = Record<AdminNavBadge, number>;

/** The live count a single item shows, or 0 when it feeds no queue. Shared by
 *  the sections and by the search results, which render the same links. */
export function pendingCount(
  item: AdminNavItem,
  counts: AdminNavBadgeCounts,
): number {
  return item.badge ? counts[item.badge] : 0;
}

/**
 * Fold a label or a query down to what a match should compare: lower case, no
 * diacritics, no surrounding space. PT labels carry accents the admin typing in
 * a hurry will not (`Definições` has to be findable as "definicoes"), so the
 * marks come off both sides rather than only the query's.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Matches for one section, in rail order. */
export interface AdminNavSearchGroup {
  /** Stable key: the section id, or `overview` for the loose top link. */
  id: string;
  /** Heading shown above the matches. Null for Overview, which has no section
   *  and would otherwise be filed under a heading repeating its own name. */
  label: string | null;
  items: AdminNavItem[];
}

/**
 * The rail's destinations narrowed to a query.
 *
 * Matching runs over the TRANSLATED label plus its section heading, so "trust"
 * returns everything filed under Trust & safety and "housing trust" returns
 * only the housing entry inside it. Every token has to land somewhere in that
 * pair, which makes a multi-word query narrow rather than widen.
 *
 * `sections` must already be the viewer's own rail (`visibleAdminNavSections`):
 * search reorders what a tier can reach, it never adds to it.
 */
export function searchAdminNav({
  sections,
  overview,
  query,
  translate,
}: {
  sections: readonly AdminNavSection[];
  /** The loose Overview link, when this viewer is offered it at all. */
  overview?: AdminNavItem;
  query: string;
  translate: (key: string) => string;
}): AdminNavSearchGroup[] {
  const tokens = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const isMatch = (haystack: string) =>
    tokens.every((token) => haystack.includes(token));

  const groups: AdminNavSearchGroup[] = [];

  if (overview && isMatch(normalizeSearchText(translate(overview.labelKey)))) {
    groups.push({ id: "overview", label: null, items: [overview] });
  }

  for (const section of sections) {
    const sectionLabel = translate(section.labelKey);
    const normalizedSection = normalizeSearchText(sectionLabel);
    const items = section.items.filter((item) =>
      isMatch(
        `${normalizeSearchText(translate(item.labelKey))} ${normalizedSection}`,
      ),
    );
    if (items.length > 0) {
      groups.push({ id: section.id, label: sectionLabel, items });
    }
  }

  return groups;
}

/** The destination Enter opens: the first match in rail order, if there is one. */
export function firstAdminNavMatch(
  groups: readonly AdminNavSearchGroup[],
): AdminNavItem | undefined {
  return groups[0]?.items[0];
}

/** How many destinations a result set holds, for the count read to screen readers. */
export function countAdminNavMatches(
  groups: readonly AdminNavSearchGroup[],
): number {
  return groups.reduce((total, group) => total + group.items.length, 0);
}
