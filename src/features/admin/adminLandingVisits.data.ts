import type { LandingVisitPage } from "../homepage/api/landingVisitBeacon";
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
 *
 * The Studio page gets its own smaller series, about a third of the
 * homepage's, seeded differently with its spike on another day, so switching
 * the page visibly changes the chart.
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

/** The Studio page's extra visits, a smaller bump on a different day. */
const STUDIO_SPIKE_BY_DAYS_AGO: Record<number, number> = {
  4: 58,
  3: 27,
  2: 11,
};

/** How the Studio page's visits split by source: more searches and links,
 *  fewer social posts than the homepage. */
const STUDIO_SOURCE_WEIGHTS: readonly {
  source: string;
  baseShare: number;
  spikeShare: number;
}[] = [
  { source: "google.com", baseShare: 0.28, spikeShare: 0.1 },
  { source: "instagram", baseShare: 0.22, spikeShare: 0.6 },
  { source: "linktr.ee", baseShare: 0.1, spikeShare: 0.12 },
  { source: "bandcamp.com", baseShare: 0.07, spikeShare: 0.08 },
  { source: "t.co", baseShare: 0.05, spikeShare: 0.04 },
  { source: "duckduckgo.com", baseShare: 0.03, spikeShare: 0 },
  { source: "reddit.com", baseShare: 0.02, spikeShare: 0 },
];

/** A baseline count between 10 and 40 for a given day, with a weekend lift.
 *  The Studio page takes about a third of it, on a different wobble. */
function baselineVisits(
  dayIndex: number,
  weekday: number,
  page: LandingVisitPage,
): number {
  const isWeekend = weekday === 0 || weekday === 6;
  if (page === "studio") {
    const studioWobble = (dayIndex * 53 + 7) % 7;
    return 3 + studioWobble + (isWeekend ? 3 : 0);
  }
  const wobble = (dayIndex * 37 + 11) % 19;
  return 12 + wobble + (isWeekend ? 9 : 0);
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDays(
  rangeDays: LandingVisitsRangeDays,
  page: LandingVisitPage,
): {
  days: LandingVisitsDay[];
  spikeTotal: number;
} {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const spikeByDaysAgo =
    page === "studio" ? STUDIO_SPIKE_BY_DAYS_AGO : SPIKE_BY_DAYS_AGO;
  const days: LandingVisitsDay[] = [];
  let spikeTotal = 0;
  for (let daysAgo = rangeDays - 1; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(
      todayStart.getTime() - daysAgo * MILLISECONDS_PER_DAY,
    );
    const spike = spikeByDaysAgo[daysAgo] ?? 0;
    spikeTotal += spike;
    days.push({
      day: toIsoDay(date),
      visits: baselineVisits(daysAgo, date.getUTCDay(), page) + spike,
    });
  }
  return { days, spikeTotal };
}

function buildSources(
  total: number,
  spikeTotal: number,
  page: LandingVisitPage,
): LandingVisitsSource[] {
  const baseTotal = total - spikeTotal;
  const weights = page === "studio" ? STUDIO_SOURCE_WEIGHTS : SOURCE_WEIGHTS;
  const sources = weights.map(({ source, baseShare, spikeShare }) => ({
    source,
    visits: Math.round(baseTotal * baseShare + spikeTotal * spikeShare),
  }));
  const counted = sources.reduce((sum, entry) => sum + entry.visits, 0);
  sources.push({ source: "direct", visits: Math.max(total - counted, 0) });
  return sources.sort((first, second) => second.visits - first.visits);
}

/** The demo answer for one range and page, shaped exactly like the live DTO. */
export function demoLandingVisits(
  rangeDays: LandingVisitsRangeDays,
  page: LandingVisitPage = "home",
): AdminLandingVisitsDTO {
  const { days, spikeTotal } = buildDays(rangeDays, page);
  const total = days.reduce((sum, entry) => sum + entry.visits, 0);
  return {
    rangeDays,
    page,
    total,
    days,
    topSources: buildSources(total, spikeTotal, page),
  };
}
