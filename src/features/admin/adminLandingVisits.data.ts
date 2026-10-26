import type {
  AdminLandingVisitsDTO,
  LandingVisitsDay,
  LandingVisitsRangeDays,
  LandingVisitsSource,
} from "./api/adminLandingVisits.api";

/**
 * Demo fixture for the landing visits card. Deterministic: the same index
 * always gets the same count, so the chart never jitters between renders. The
 * days end on today's UTC date, which is the only moving part.
 *
 * The story it tells: a quiet baseline of roughly 10 to 40 visits a day,
 * busier at weekends, and one clear spike nine days ago that tails off over
 * the next few days, the shape an Instagram post leaves behind.
 */

const MILLISECONDS_PER_DAY = 86_400_000;

/** Extra visits on the days around the spike, keyed by days before today. */
const SPIKE_BY_DAYS_AGO: Record<number, number> = {
  9: 214,
  8: 96,
  7: 47,
  6: 21,
};

/** Each source's share of the visits outside the spike, plus how much of the
 *  spike it took. `direct` is filled in last with whatever rounding left. */
const SOURCE_WEIGHTS: readonly {
  source: string;
  baseShare: number;
  spikeShare: number;
}[] = [
  { source: "instagram", baseShare: 0.31, spikeShare: 0.82 },
  { source: "google.com", baseShare: 0.2, spikeShare: 0.03 },
  { source: "t.co", baseShare: 0.08, spikeShare: 0.04 },
  { source: "jornal-arco.pt", baseShare: 0.06, spikeShare: 0.01 },
  { source: "linktr.ee", baseShare: 0.05, spikeShare: 0.05 },
  { source: "reddit.com", baseShare: 0.03, spikeShare: 0 },
  { source: "duckduckgo.com", baseShare: 0.02, spikeShare: 0 },
  { source: "bing.com", baseShare: 0.01, spikeShare: 0 },
];

/** A baseline count between 10 and 40 for a given day, with a weekend lift. */
function baselineVisits(dayIndex: number, weekday: number): number {
  const wobble = (dayIndex * 37 + 11) % 19;
  const isWeekend = weekday === 0 || weekday === 6;
  return 12 + wobble + (isWeekend ? 9 : 0);
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDays(rangeDays: LandingVisitsRangeDays): {
  days: LandingVisitsDay[];
  spikeTotal: number;
} {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const days: LandingVisitsDay[] = [];
  let spikeTotal = 0;
  for (let daysAgo = rangeDays - 1; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(
      todayStart.getTime() - daysAgo * MILLISECONDS_PER_DAY,
    );
    const spike = SPIKE_BY_DAYS_AGO[daysAgo] ?? 0;
    spikeTotal += spike;
    days.push({
      day: toIsoDay(date),
      visits: baselineVisits(daysAgo, date.getUTCDay()) + spike,
    });
  }
  return { days, spikeTotal };
}

function buildSources(
  total: number,
  spikeTotal: number,
): LandingVisitsSource[] {
  const baseTotal = total - spikeTotal;
  const sources = SOURCE_WEIGHTS.map(({ source, baseShare, spikeShare }) => ({
    source,
    visits: Math.round(baseTotal * baseShare + spikeTotal * spikeShare),
  }));
  const counted = sources.reduce((sum, entry) => sum + entry.visits, 0);
  sources.push({ source: "direct", visits: Math.max(total - counted, 0) });
  return sources.sort((first, second) => second.visits - first.visits);
}

/** The demo answer for one range, shaped exactly like the live DTO. */
export function demoLandingVisits(
  rangeDays: LandingVisitsRangeDays,
): AdminLandingVisitsDTO {
  const { days, spikeTotal } = buildDays(rangeDays);
  const total = days.reduce((sum, entry) => sum + entry.visits, 0);
  return {
    rangeDays,
    total,
    days,
    topSources: buildSources(total, spikeTotal),
  };
}
