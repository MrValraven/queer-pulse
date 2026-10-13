import type { ReactNode } from "react";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { StudioNumber } from "./StudioNumber";

export interface DashStat {
  labelKey: string;
  /** A date the label names (the next payout), formatted where it renders. */
  labelDateIso?: string;
  v: ReactNode;
  /** The trend line under the figure: a catalog key and its values. */
  trendKey: string;
  trendValues?: Record<string, string | number>;
  /** Trend tokens rendered as nodes, for euro figures in the active locale. */
  trendSlots?: Record<string, ReactNode>;
  payout?: boolean;
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
    labelKey: "studio:dashboard.stats.playsThisMonth",
    v: <StudioNumber value={36400} shouldEmphasizeLastGroup />,
    trendKey: "studio:demo.dashboard.trend.plays",
    trendValues: { active: 4, total: 11 },
    trendSlots: {
      delta: (
        <>
          + <StudioNumber value={12140} />
        </>
      ),
    },
  },
  {
    labelKey: "studio:dashboard.stats.streamingEarnings",
    v: (
      <em>
        <StudioEuroAmount value={1820} />
      </em>
    ),
    trendKey: "studio:demo.dashboard.trend.earnings",
    trendSlots: {
      delta: (
        <>
          + <StudioEuroAmount value={607} />
        </>
      ),
      rate: <StudioEuroAmount value={0.05} />,
    },
  },
  {
    labelKey: "studio:dashboard.stats.tipsReceived",
    v: (
      <em>
        <StudioEuroAmount value={448} />
      </em>
    ),
    trendKey: "studio:demo.dashboard.trend.tips",
    trendValues: { tippers: 87, notes: 64, recent: 5 },
  },
  {
    labelKey: "studio:dashboard.stats.nextPayout",
    labelDateIso: "2026-07-05",
    v: (
      <em>
        <StudioEuroAmount value={2140} />
      </em>
    ),
    trendKey: "studio:demo.dashboard.trend.payout",
    payout: true,
  },
];

export const BARS = [32, 42, 38, 55, 48, 62, 58, 68, 72, 65, 78, 60, 54, 96];

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

/** A daily-plays range chip: its stable id and the span it covers. The
 *  label is `Intl` unit formatting ("7d" / "7 dias", "1y" / "1 ano"). */
export interface ChartRange {
  id: string;
  amount: number;
  unit: "day" | "year";
}

export const CHART_RANGES: ChartRange[] = [
  { id: "7d", amount: 7, unit: "day" },
  { id: "14d", amount: 14, unit: "day" },
  { id: "30d", amount: 30, unit: "day" },
  { id: "1y", amount: 1, unit: "year" },
];

export const SELECTED_CHART_RANGE_ID = "14d";
