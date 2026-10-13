import type { ReactNode } from "react";
import type { Formatters } from "../../shared/i18n/format";
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
 * `studioShowcase` catalog keys (Pattern A). The tallies are data: `plays`
 * formats as a locale number, the other counts drive plural keys through
 * `payoutMetaParts` / `payoutSplitNote`.
 */
export interface PayoutRow {
  d: string;
  monthKey: string;
  periodKey: string;
  /** Optional emphasised note after the title. */
  noteKey?: string;
  plays: number;
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
  /** Play count; the "plays" phrase comes from the catalog. */
  plays: number;
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
    plays: 36400,
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
    plays: 24260,
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
    plays: 18420,
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
    plays: 8140,
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
    plays: 2140,
    tips: 6,
    albumBuys: 1,
    directSubs: 2,
    amt: 142,
    status: "paid",
  },
];

/** The tally phrases of a payout row, in display order. */
export function payoutMetaParts(
  payout: PayoutRow,
  t: TFunction,
  fmt: Formatters,
): string[] {
  return [
    t("studioShowcase:payouts.plays", { plays: fmt.number(payout.plays) }),
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
export function payoutCsvMeta(
  payout: PayoutRow,
  t: TFunction,
  fmt: Formatters,
): string {
  const parts = payoutMetaParts(payout, t, fmt);
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
    plays: 25832,
    total: 1291.6,
  },
  {
    n: "04",
    nm: (
      <>
        A <em>vizinha</em> que reza
      </>
    ),
    plays: 4144,
    total: 207.2,
  },
  {
    n: "03",
    nm: (
      <>
        Mãe, três <em>vezes</em>
      </>
    ),
    plays: 2880,
    total: 144,
  },
  {
    n: "01",
    nm: (
      <>
        Mãe, <em>vento</em>
      </>
    ),
    plays: 1684,
    total: 84.2,
  },
  {
    n: "08",
    nm: (
      <>
        O <em>nome</em>
      </>
    ),
    plays: 920,
    total: 46,
  },
  {
    nm: (
      <Translation
        i18nKey="studioShowcase:payouts.breakdown.otherTracks"
        components={{ em: <em /> }}
      />
    ),
    plays: 940,
    total: 47,
  },
];
