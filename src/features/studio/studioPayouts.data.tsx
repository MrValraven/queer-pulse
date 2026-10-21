import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { TFunction } from "../../shared/i18n/types";

/** Every figure below is a number; the page formats it in the active locale. */
export interface PayoutSummaryRow {
  labelKey: string;
  /** Whole euros. */
  v: number;
}

/**
 * One monthly payout. `monthKey`, `periodKey` and `noteKey` are
 * `studioShowcase` catalog keys (Pattern A). The tallies are data: the counts
 * drive plural keys through `payoutMetaParts` / `payoutSplitNote`. Studio
 * never counts plays, so a payout row carries none.
 */
export interface PayoutRow {
  d: string;
  monthKey: string;
  periodKey: string;
  /** Optional emphasised note after the title. */
  noteKey?: string;
  tips: number;
  albumBuys: number;
  directSubs: number;
  /** Present when the payout splits to collaborators. */
  collaborators?: number;
  /** Whole euros. */
  amt: number;
  status: string;
}

export interface PayoutBreakdownRow {
  /** Track number on the release. Absent on the aggregate "other tracks" row,
      which stands for several tracks and so has no single number. */
  n?: string;
  nm: ReactNode;
  /** Saves plus playlist adds this month. Under the floor of 5 the page
      shows "Fewer than 5" and never the exact figure. */
  saves: number;
  /** Euros, with cents. */
  total: number;
}

export const SUMMARY: PayoutSummaryRow[] = [
  { labelKey: "studio:payouts.summary.fromStreaming", v: 1712 },
  { labelKey: "studio:payouts.summary.fromTips", v: 312 },
  { labelKey: "studio:payouts.summary.fromAlbumBuys", v: 76 },
  { labelKey: "studio:payouts.summary.directSubs", v: 40 },
];

export const PAYOUTS: PayoutRow[] = [
  {
    d: "5",
    monthKey: "studioShowcase:payouts.month.jul",
    periodKey: "studioShowcase:payouts.period.july2026",
    noteKey: "studioShowcase:payouts.row.note.pending",
    tips: 87,
    albumBuys: 1,
    directSubs: 12,
    collaborators: 3,
    amt: 2140,
    status: "pending",
  },
  {
    d: "5",
    monthKey: "studioShowcase:payouts.month.jun",
    periodKey: "studioShowcase:payouts.period.june2026",
    tips: 64,
    albumBuys: 4,
    directSubs: 8,
    amt: 1213,
    status: "paid",
  },
  {
    d: "5",
    monthKey: "studioShowcase:payouts.month.may",
    periodKey: "studioShowcase:payouts.period.may2026",
    noteKey: "studioShowcase:payouts.row.note.firstMonthOfCds",
    tips: 42,
    albumBuys: 12,
    directSubs: 6,
    amt: 1084,
    status: "paid",
  },
  {
    d: "5",
    monthKey: "studioShowcase:payouts.month.apr",
    periodKey: "studioShowcase:payouts.period.april2026",
    tips: 18,
    albumBuys: 3,
    directSubs: 4,
    amt: 486,
    status: "paid",
  },
  {
    d: "5",
    monthKey: "studioShowcase:payouts.month.mar",
    periodKey: "studioShowcase:payouts.period.march2026",
    noteKey: "studioShowcase:payouts.row.note.firstOnStudio",
    tips: 6,
    albumBuys: 1,
    directSubs: 2,
    amt: 142,
    status: "paid",
  },
];

/** The tally phrases of a payout row, in display order. */
export function payoutMetaParts(payout: PayoutRow, t: TFunction): string[] {
  return [
    t("studioShowcase:payouts.meta.tips", { count: payout.tips }),
    t("studioShowcase:payouts.meta.albumBuys", { count: payout.albumBuys }),
    t("studioShowcase:payouts.meta.directSubs", { count: payout.directSubs }),
  ];
}

/** The collaborator-split phrase, or null when the payout has no splits. */
export function payoutSplitNote(
  payout: PayoutRow,
  t: TFunction,
): string | null {
  return payout.collaborators === undefined
    ? null
    : t("studioShowcase:payouts.meta.splits", {
        count: payout.collaborators,
      });
}

/** The whole tally line as plain text, for the CSV export. */
export function payoutCsvMeta(payout: PayoutRow, t: TFunction): string {
  const parts = payoutMetaParts(payout, t);
  const splitNote = payoutSplitNote(payout, t);
  return (splitNote === null ? parts : [...parts, splitNote]).join(" · ");
}

export const BREAKDOWN: PayoutBreakdownRow[] = [
  {
    n: "06",
    nm: (
      <>
        Carta para a <em>santa</em>
      </>
    ),
    saves: 640,
    total: 1291.6,
  },
  {
    n: "04",
    nm: (
      <>
        A <em>vizinha</em> que reza
      </>
    ),
    saves: 104,
    total: 207.2,
  },
  {
    n: "03",
    nm: (
      <>
        Mãe, três <em>vezes</em>
      </>
    ),
    saves: 72,
    total: 144,
  },
  {
    n: "01",
    nm: (
      <>
        Mãe, <em>vento</em>
      </>
    ),
    saves: 42,
    total: 84.2,
  },
  {
    n: "08",
    nm: (
      <>
        O <em>nome</em>
      </>
    ),
    saves: 3,
    total: 46,
  },
  {
    nm: (
      <Translation
        i18nKey="studioShowcase:payouts.breakdown.otherTracks"
        components={{ em: <em /> }}
      />
    ),
    saves: 21,
    total: 47,
  },
];
