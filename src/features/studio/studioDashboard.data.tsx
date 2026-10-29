import type { ReactNode } from "react";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { StudioNumber } from "./StudioNumber";

export interface DashStat {
  labelKey: string;
  v: ReactNode;
  /** The trend line under the figure: a catalog key and its values. */
  trendKey: string;
  trendValues?: Record<string, string | number>;
  /** Trend tokens rendered as nodes, for euro figures in the active locale. */
  trendSlots?: Record<string, ReactNode>;
}

export interface DashCurator {
  av: string;
  tone: "coral" | "jade";
  whatKey: string;
  /** The track the line names: content, as written. */
  title: string;
  whoKey: string;
  /** Null reads "today". */
  whenIso: string | null;
}

export interface DashCity {
  /** A place name as written; null for the "other cities" row. */
  name: string | null;
  otherCount?: number;
  pct: number;
}

export const STATS: DashStat[] = [
  {
    labelKey: "studio:demo.dashboard.stats.followers",
    v: <StudioNumber value={1204} />,
    trendKey: "studio:demo.dashboard.trend.followers",
    trendSlots: {
      delta: (
        <>
          + <StudioNumber value={86} />
        </>
      ),
    },
  },
  {
    labelKey: "studio:demo.dashboard.stats.saves",
    v: <StudioNumber value={312} />,
    trendKey: "studio:demo.dashboard.trend.saves",
    trendValues: { active: 4, total: 11 },
    trendSlots: {
      delta: (
        <>
          + <StudioNumber value={74} />
        </>
      ),
    },
  },
  {
    labelKey: "studio:dashboard.stats.streamingEarnings",
    v: <StudioEuroAmount value={1820} />,
    trendKey: "studio:demo.dashboard.trend.earnings",
    trendSlots: {
      delta: (
        <>
          + <StudioEuroAmount value={607} />
        </>
      ),
    },
  },
  {
    labelKey: "studio:dashboard.stats.tipsReceived",
    v: <StudioEuroAmount value={448} />,
    trendKey: "studio:demo.dashboard.trend.tips",
    trendValues: { tippers: 87, notes: 64, recent: 5 },
  },
];

/** The fixture's "today", the last day of the activity series. */
export const DASHBOARD_TODAY_ISO = "2026-06-10";

/** Saves plus playlist adds per day, oldest first, 30 days. Studio never
 *  counts plays, and a day under 5 shows as "Fewer than 5" (the floor that
 *  keeps small audiences unidentifiable), so the series holds one such day. */
export const DAILY_ACTIVITY: readonly number[] = [
  8, 12, 9, 14, 11, 3, 7, 15, 18, 13, 16, 22, 19, 4, 10, 17, 21, 24, 20, 26, 23,
  28, 25, 30, 27, 34, 31, 29, 33, 41,
];

/** The smallest count Studio shows as a number. */
export const STUDIO_COUNT_FLOOR = 5;

export const CURATORS: DashCurator[] = [
  {
    av: "SM",
    tone: "coral",
    whatKey: "studio:demo.dashboard.curator.what.wednesdaySet",
    title: "Carta para a santa",
    whoKey: "studio:demo.dashboard.curator.who.wednesdaySet",
    whenIso: null,
  },
  {
    av: "SM",
    tone: "coral",
    whatKey: "studio:demo.dashboard.curator.what.collection",
    title: "Mãe, três vezes",
    whoKey: "studio:demo.dashboard.curator.who.collection",
    whenIso: "2026-06-08",
  },
  {
    av: "DO",
    tone: "jade",
    whatKey: "studio:demo.dashboard.curator.what.mix",
    title: "O nome",
    whoKey: "studio:demo.dashboard.curator.who.mix",
    whenIso: "2026-06-05",
  },
  {
    av: "JR",
    tone: "coral",
    whatKey: "studio:demo.dashboard.curator.what.warmup",
    title: "Bairro quente",
    whoKey: "studio:demo.dashboard.curator.who.warmup",
    whenIso: "2026-06-01",
  },
];

export const CITIES: DashCity[] = [
  { name: "Lisbon, PT", pct: 62 },
  { name: "São Paulo, BR", pct: 14 },
  { name: "Porto, PT", pct: 8 },
  { name: "Berlin, DE", pct: 5 },
  { name: "Mexico City, MX", pct: 4 },
  { name: "Paris, FR", pct: 3 },
  { name: null, otherCount: 35, pct: 4 },
];

/** An activity range chip: its stable id and the number of days it covers.
 *  The label is `Intl` unit formatting ("7d" / "7 dias"). */
export interface ChartRange {
  id: string;
  days: number;
}

export const CHART_RANGES: ChartRange[] = [
  { id: "7d", days: 7 },
  { id: "14d", days: 14 },
  { id: "30d", days: 30 },
];

export const DEFAULT_CHART_RANGE_ID = "14d";
export const DEFAULT_CHART_RANGE_DAYS = 14;
