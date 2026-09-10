import type { ChangelogCategory, ChangelogEntry } from "./changelog.data";
import { CHANGELOG_RELEASE_NOTES } from "./changelogReleases.data";

/** Display order of the type groups inside a release. */
export const RELEASE_GROUP_ORDER: ChangelogCategory[] = [
  "feature",
  "improvement",
  "fix",
  "infrastructure",
];

export interface ChangelogReleaseGroup {
  category: ChangelogCategory;
  entries: ChangelogEntry[];
}

/** One shipping day, rendered as a collapsible release. */
export interface ChangelogRelease {
  /** Display date label, as written on the entries (e.g. "9 Sep 2026"). */
  date: string;
  /** ISO-style slug of the date, used for ids and catalog keys. */
  slug: string;
  /** Semantic version assigned by {@link buildReleases}. */
  version: string;
  /** Catalog key: `marketing:changelog.releases.<slug>.headline`. */
  headlineKey: string;
  /** Curated entries shown at the top of the release, in importance order. */
  highlights: ChangelogEntry[];
  /** Entries grouped by type, in {@link RELEASE_GROUP_ORDER}, empty groups dropped. */
  groups: ChangelogReleaseGroup[];
  /** Entry count per type, for the collapsed header. */
  counts: Record<ChangelogCategory, number>;
  /** Total entries in the release. */
  entryCount: number;
}

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/** "9 Sep 2026" → "2026-09-09". Falls back to a kebab of the label. */
export function releaseDateSlug(date: string): string {
  const match = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(date);
  if (!match) return date.toLowerCase().replace(/\s+/g, "-");
  const day = match[1] ?? "";
  const month = match[2] ?? "";
  const year = match[3] ?? "";
  return `${year}-${MONTHS[month] ?? month}-${day.padStart(2, "0")}`;
}

/**
 * Version rule: the first shipping day is v1.0.0. A day that ships at least
 * one feature bumps the minor and resets the patch; any other day bumps the
 * patch. Versions are assigned oldest-first so filtering never renumbers them.
 */
export function assignVersions(
  daysOldestFirst: { hasFeature: boolean }[],
): string[] {
  let minor = 0;
  let patch = 0;
  return daysOldestFirst.map((day, index) => {
    if (index === 0) return "v1.0.0";
    if (day.hasFeature) {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }
    return `v1.${minor}.${patch}`;
  });
}

export function groupEntriesByCategory(
  entries: ChangelogEntry[],
): ChangelogReleaseGroup[] {
  return RELEASE_GROUP_ORDER.map((category) => ({
    category,
    entries: entries.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0);
}

function countByCategory(
  entries: ChangelogEntry[],
): Record<ChangelogCategory, number> {
  const counts: Record<ChangelogCategory, number> = {
    feature: 0,
    improvement: 0,
    fix: 0,
    infrastructure: 0,
  };
  for (const entry of entries) counts[entry.category] += 1;
  return counts;
}

/**
 * Fold a newest-first entry list into releases (one per day), newest first,
 * with versions, headline keys, curated highlights and type groups attached.
 */
export function buildReleases(entries: ChangelogEntry[]): ChangelogRelease[] {
  const days: { date: string; entries: ChangelogEntry[] }[] = [];
  for (const entry of entries) {
    const currentDay = days[days.length - 1];
    if (currentDay && currentDay.date === entry.date) {
      currentDay.entries.push(entry);
    } else {
      days.push({ date: entry.date, entries: [entry] });
    }
  }
  const versionsOldestFirst = assignVersions(
    [...days].reverse().map((day) => ({
      hasFeature: day.entries.some((entry) => entry.category === "feature"),
    })),
  );
  return days.map((day, index) => {
    const slug = releaseDateSlug(day.date);
    const version = versionsOldestFirst[days.length - 1 - index] ?? "v1.0.0";
    const notes = CHANGELOG_RELEASE_NOTES[day.date];
    const byId = new Map(day.entries.map((entry) => [entry.id, entry]));
    const highlights = (notes?.highlights ?? [])
      .map((id) => byId.get(id))
      .filter((entry): entry is ChangelogEntry => Boolean(entry));
    return {
      date: day.date,
      slug,
      version,
      headlineKey: `marketing:changelog.releases.${slug}.headline`,
      highlights,
      groups: groupEntriesByCategory(day.entries),
      counts: countByCategory(day.entries),
      entryCount: day.entries.length,
    };
  });
}

/** Narrow a release to one category; `null` when nothing is left. */
export function filterRelease(
  release: ChangelogRelease,
  category: ChangelogCategory | "all",
): ChangelogRelease | null {
  if (category === "all") return release;
  const groups = release.groups.filter((group) => group.category === category);
  if (groups.length === 0) return null;
  return {
    ...release,
    groups,
    highlights: release.highlights.filter(
      (entry) => entry.category === category,
    ),
    counts: {
      feature: 0,
      improvement: 0,
      fix: 0,
      infrastructure: 0,
      [category]: release.counts[category],
    },
  };
}
