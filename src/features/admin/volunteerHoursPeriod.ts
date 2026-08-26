/**
 * The periods the volunteer-hours report can be read over.
 *
 * Presets rather than a pair of date pickers, deliberately. The backend's `to`
 * bound is exclusive, and the one question this page answers ("how many hours
 * did QueerPulse contribute") is always asked about a trailing window or about
 * all time. Presets mean the boundary never has to be reasoned about on
 * screen, and a preset cannot express a backwards or absurd window at all.
 *
 * Values are canonical and untranslated because they are state; only the
 * labels are resolved at render.
 */
export const VOLUNTEER_HOURS_PERIODS = [
  "days30",
  "days90",
  "months12",
  "all",
] as const;

export type VolunteerHoursPeriod = (typeof VOLUNTEER_HOURS_PERIODS)[number];

const DAY_MS = 86_400_000;

const PERIOD_DAYS: Record<Exclude<VolunteerHoursPeriod, "all">, number> = {
  days30: 30,
  days90: 90,
  months12: 365,
};

/**
 * The `from` bound a period asks for, or undefined for all time.
 *
 * `to` is deliberately never sent: leaving it unbounded means "up to right
 * now", which is what a trailing window means, and it keeps the request stable
 * as the page sits open.
 */
export function periodFrom(period: VolunteerHoursPeriod): string | undefined {
  if (period === "all") return undefined;
  return new Date(Date.now() - PERIOD_DAYS[period] * DAY_MS).toISOString();
}
