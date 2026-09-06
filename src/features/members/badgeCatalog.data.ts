/**
 * Display strings for the server-authored badge catalogue.
 *
 * The backend's `recognition.catalog.ts` is content in code: it emits a
 * stable `key` per badge plus English `name` / `cat` / `lockedContext` /
 * `earnedContext`. Those English strings used to render straight onto a
 * translated page. The fix follows the precedent already set one file over in
 * `xpBreakdown.data.ts`: the wire carries the stable machine id, the frontend
 * owns the display text, and `t(...)` resolves it at render so the same
 * response reads correctly in either language.
 *
 * The alternative, a second translation layer inside the backend catalogue,
 * would put copy behind a deploy of the other repo and would still have to
 * pick a language at serialize time, before the request's locale is known.
 *
 * `key` here is the SAME id persisted in `recognition_awards.badge_key`, so
 * these ids are load-bearing on real member rows and must never be renamed.
 * The map is keyed on them and adding a badge means adding an entry here;
 * `badgeDisplayMetaFor` returns null for anything unmapped so the caller can
 * fall back to the server's own text rather than render nothing.
 */
export interface BadgeDisplayMeta {
  nameKey: string;
  /** "What it takes", shown while the badge is still locked. */
  lockedContextKey: string;
  /** Shown once earned, when the award carries no per-award context of its
   *  own (a real member-specific line like "Pride Brunch, Jun 2025" is free
   *  text written at award time and stays as it was written). */
  earnedContextKey: string;
  /** Time-limited badges only: the open/close window on the seasonal ticket. */
  seasonalWindow?: BadgeSeasonalWindowMeta;
}

/**
 * The "Open until 30 June 2026" line under a seasonal badge.
 *
 * The date is deliberately NOT part of the translated sentence. Baking one in
 * gives every language its own hand-written date format, which goes stale the
 * moment the window moves and reads wrong to anyone whose locale orders a date
 * differently. The sentence carries a `{date}` slot instead and the render site
 * formats `date` through `useFormat()`, the same `Intl` helper the rest of the
 * app uses, so PT reads "30 de junho de 2026" and EN "30 June 2026" from one
 * value.
 */
export interface BadgeSeasonalWindowMeta {
  /** i18n key for the line. Interpolates `{date}` whenever `date` is set. */
  labelKey: string;
  /** The day the line names, as `YYYY-MM-DD`. Left out when the line names no
   *  single day ("January only"). */
  date?: string;
  /** How to format `date`. Omitted means the locale's day + month + year. */
  dateOptions?: Intl.DateTimeFormatOptions;
}

/**
 * A seasonal window's `YYYY-MM-DD` read as a local Date at midday.
 *
 * A window boundary is a calendar day, so it must not be parsed as a UTC
 * instant: `new Date("2026-12-01")` is midnight UTC, which is 30 November for
 * every reader west of Greenwich, and the ticket would say the badge opens a
 * day early. Midday local is far enough from either boundary that no offset
 * moves the day.
 */
export function seasonalWindowDateOf(isoDay: string): Date {
  const [year, month, day] = isoDay.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12);
}

export const BADGE_DISPLAY_META: Record<string, BadgeDisplayMeta> = {
  "local-scout": {
    nameKey: "members:badges.catalog.localScout.name",
    lockedContextKey: "members:badges.catalog.localScout.locked",
    earnedContextKey: "members:badges.catalog.localScout.earned",
  },
  "well-read": {
    nameKey: "members:badges.catalog.wellRead.name",
    lockedContextKey: "members:badges.catalog.wellRead.locked",
    earnedContextKey: "members:badges.catalog.wellRead.earned",
  },
  "first-gathering": {
    nameKey: "members:badges.catalog.firstGathering.name",
    lockedContextKey: "members:badges.catalog.firstGathering.locked",
    earnedContextKey: "members:badges.catalog.firstGathering.earned",
  },
  "three-company": {
    nameKey: "members:badges.catalog.threeCompany.name",
    lockedContextKey: "members:badges.catalog.threeCompany.locked",
    earnedContextKey: "members:badges.catalog.threeCompany.earned",
  },
  "regular-attendee": {
    nameKey: "members:badges.catalog.regularAttendee.name",
    lockedContextKey: "members:badges.catalog.regularAttendee.locked",
    earnedContextKey: "members:badges.catalog.regularAttendee.earned",
  },
  decade: {
    nameKey: "members:badges.catalog.decade.name",
    lockedContextKey: "members:badges.catalog.decade.locked",
    earnedContextKey: "members:badges.catalog.decade.earned",
  },
  connector: {
    nameKey: "members:badges.catalog.connector.name",
    lockedContextKey: "members:badges.catalog.connector.locked",
    earnedContextKey: "members:badges.catalog.connector.earned",
  },
  vouch: {
    nameKey: "members:badges.catalog.vouch.name",
    lockedContextKey: "members:badges.catalog.vouch.locked",
    earnedContextKey: "members:badges.catalog.vouch.earned",
  },
  "thread-starter": {
    nameKey: "members:badges.catalog.threadStarter.name",
    lockedContextKey: "members:badges.catalog.threadStarter.locked",
    earnedContextKey: "members:badges.catalog.threadStarter.earned",
  },
  networker: {
    nameKey: "members:badges.catalog.networker.name",
    lockedContextKey: "members:badges.catalog.networker.locked",
    earnedContextKey: "members:badges.catalog.networker.earned",
  },
  contributor: {
    nameKey: "members:badges.catalog.contributor.name",
    lockedContextKey: "members:badges.catalog.contributor.locked",
    earnedContextKey: "members:badges.catalog.contributor.earned",
  },
  "two-homes": {
    nameKey: "members:badges.catalog.twoHomes.name",
    lockedContextKey: "members:badges.catalog.twoHomes.locked",
    earnedContextKey: "members:badges.catalog.twoHomes.earned",
  },
  "founding-member": {
    nameKey: "members:badges.catalog.foundingMember.name",
    lockedContextKey: "members:badges.catalog.foundingMember.locked",
    earnedContextKey: "members:badges.catalog.foundingMember.earned",
  },
  sustainer: {
    nameKey: "members:badges.catalog.sustainer.name",
    lockedContextKey: "members:badges.catalog.sustainer.locked",
    earnedContextKey: "members:badges.catalog.sustainer.earned",
  },
  "work-ready": {
    nameKey: "members:badges.catalog.workReady.name",
    lockedContextKey: "members:badges.catalog.workReady.locked",
    earnedContextKey: "members:badges.catalog.workReady.earned",
  },
  "event-host": {
    nameKey: "members:badges.catalog.eventHost.name",
    lockedContextKey: "members:badges.catalog.eventHost.locked",
    earnedContextKey: "members:badges.catalog.eventHost.earned",
  },
  "serial-host": {
    nameKey: "members:badges.catalog.serialHost.name",
    lockedContextKey: "members:badges.catalog.serialHost.locked",
    earnedContextKey: "members:badges.catalog.serialHost.earned",
  },
  "first-steps": {
    nameKey: "members:badges.catalog.firstSteps.name",
    lockedContextKey: "members:badges.catalog.firstSteps.locked",
    earnedContextKey: "members:badges.catalog.firstSteps.earned",
  },
  "pride-2026": {
    nameKey: "members:badges.catalog.pride2026.name",
    lockedContextKey: "members:badges.catalog.pride2026.locked",
    earnedContextKey: "members:badges.catalog.pride2026.earned",
    seasonalWindow: {
      labelKey: "members:badges.catalog.pride2026.window",
      date: "2026-06-30",
    },
  },
  "first-table-2026": {
    nameKey: "members:badges.catalog.firstTable2026.name",
    lockedContextKey: "members:badges.catalog.firstTable2026.locked",
    earnedContextKey: "members:badges.catalog.firstTable2026.earned",
    // "January only" names a month, no single day, so there is no date to
    // interpolate and the month word lives in the sentence.
    seasonalWindow: {
      labelKey: "members:badges.catalog.firstTable2026.window",
    },
  },
  "winter-warmth-2026": {
    nameKey: "members:badges.catalog.winterWarmth2026.name",
    lockedContextKey: "members:badges.catalog.winterWarmth2026.locked",
    earnedContextKey: "members:badges.catalog.winterWarmth2026.earned",
    // "Opens 1 December": the year is not spoken, so the day and month are
    // formatted without it.
    seasonalWindow: {
      labelKey: "members:badges.catalog.winterWarmth2026.window",
      date: "2026-12-01",
      dateOptions: { day: "numeric", month: "long" },
    },
  },
};

/** Display text for a badge id, or null when this map has not caught up with
 *  the backend catalogue yet — the caller then renders the server's own
 *  string, which is readable English rather than a machine id. */
export function badgeDisplayMetaFor(badgeKey: string): BadgeDisplayMeta | null {
  return BADGE_DISPLAY_META[badgeKey] ?? null;
}

/**
 * The seven category names the badge catalogue groups by. These arrive as
 * display words rather than slugs (`cat: 'Attendance'`), so the map is keyed
 * on the exact backend spelling; they double as the filter chips' labels and
 * as the accessible name of each mute switch, which is why an untranslated
 * one is worse than it looks.
 */
export const BADGE_CATEGORY_LABEL_KEY: Record<string, string> = {
  Attendance: "members:badges.category.attendance",
  Community: "members:badges.category.community",
  Culture: "members:badges.category.culture",
  Exploration: "members:badges.category.exploration",
  Hosting: "members:badges.category.hosting",
  Milestones: "members:badges.category.milestones",
  Platform: "members:badges.category.platform",
};

/** i18n key for a category label, or null for a category this map does not
 *  know, so the caller falls back to the server's own word. */
export function badgeCategoryLabelKeyFor(category: string): string | null {
  return BADGE_CATEGORY_LABEL_KEY[category] ?? null;
}
