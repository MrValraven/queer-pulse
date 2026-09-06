import type { ReactNode } from "react";
import type { CropRect } from "../../shared/components/ui/cropGeometry";

export type Tint = "a" | "b" | "c" | "d";

export interface Issue {
  number: string;
  numberLabel: string;
  current?: boolean;
  title: ReactNode;
  date: string;
  tint: Tint;
  /** Caption for the cover slot, and the label a tile shows when there is no
   *  cover art to show. */
  cover: string;
  /** PRD-104 — the desk's uploaded cover art. Absent on the demo mock (the
   *  prototype never shipped cover files), where the tinted caption tile below
   *  stays exactly as it was. */
  coverUrl?: string | null;
  /** PRD-104 — the saved reframe for `coverUrl`, applied as a FOCAL POINT. */
  coverCrop?: CropRect;
  dek: string;
  meta: { season: string; detail: string };
}

/**
 * Content: this is the same shape `useIssues()` returns in live mode (see
 * `issuesList = demoMode ? ISSUES : (liveIssues ?? [])` in `IssuesPage`) — every
 * field here is the issue's own editorial record, so none of it is translated.
 */
export const ISSUES: Issue[] = [
  {
    number: "09",
    numberLabel: "Issue 09 · Current",
    current: true,
    title: (
      <>
        On <em>health.</em>
      </>
    ),
    date: "Spring · Jun 2026",
    tint: "a",
    cover: "Issue 09 · On Health",
    dek: "Twelve pieces about how we keep our bodies, our minds, and each other.",
    meta: { season: "Spring 2026", detail: "84pp · 12 pieces" },
  },
  {
    number: "08",
    numberLabel: "Issue 08",
    title: (
      <>
        On <em>work.</em>
      </>
    ),
    date: "Winter · Mar 2026",
    tint: "b",
    cover: "Issue 08 · On Work",
    dek: "Studios, side hustles, four-day weeks, and the queer history of the trade union.",
    meta: { season: "Winter 2026", detail: "72pp · 10 pieces" },
  },
  {
    number: "07",
    numberLabel: "Issue 07",
    title: (
      <>
        On <em>inheritance.</em>
      </>
    ),
    date: "Autumn · Dec 2025",
    tint: "c",
    cover: "Issue 07 · On Inheritance",
    dek: "Chosen family, archives, recipes, and the houses we leave each other.",
    meta: { season: "Autumn 2025", detail: "68pp · 11 pieces" },
  },
  {
    number: "06",
    numberLabel: "Issue 06",
    title: (
      <>
        On <em>the city.</em>
      </>
    ),
    date: "Summer · Sep 2025",
    tint: "d",
    cover: "Issue 06 · On The City",
    dek: "A love letter and an audit. Streets, rents, ghosts, neighbours.",
    meta: { season: "Summer 2025", detail: "80pp · 14 pieces" },
  },
  {
    number: "05",
    numberLabel: "Issue 05",
    title: (
      <>
        On <em>migration.</em>
      </>
    ),
    date: "Spring · Jun 2025",
    tint: "a",
    cover: "Issue 05 · On Migration",
    dek: "Three queer migrants, one civil servant, and what we expect of arrival.",
    meta: { season: "Spring 2025", detail: "76pp · 12 pieces" },
  },
  {
    number: "04",
    numberLabel: "Issue 04",
    title: (
      <>
        On <em>the body.</em>
      </>
    ),
    date: "Winter · Mar 2025",
    tint: "c",
    cover: "Issue 04 · On The Body",
    dek: "Hormones, hairlines, dance floors, sleep. The everyday physical.",
    meta: { season: "Winter 2025", detail: "64pp · 10 pieces" },
  },
  {
    number: "03",
    numberLabel: "Issue 03",
    title: (
      <>
        On <em>belonging.</em>
      </>
    ),
    date: "Autumn · Dec 2024",
    tint: "b",
    cover: "Issue 03 · On Belonging",
    dek: "What rooms feel like home, and which ones never will.",
    meta: { season: "Autumn 2024", detail: "60pp · 9 pieces" },
  },
  {
    number: "02",
    numberLabel: "Issue 02",
    title: (
      <>
        On <em>time.</em>
      </>
    ),
    date: "Summer · Sep 2024",
    tint: "d",
    cover: "Issue 02 · On Time",
    dek: "Lateness, queer time, deadlines, lifespans.",
    meta: { season: "Summer 2024", detail: "56pp · 8 pieces" },
  },
  {
    number: "01",
    numberLabel: "Issue 01 · Inaugural",
    title: (
      <>
        On <em>beginning.</em>
      </>
    ),
    date: "Spring · Jun 2024",
    tint: "a",
    cover: "Issue 01 · On Beginning",
    dek: "The inaugural issue. A manifesto, three coming-out stories, and a guide to riso printing in Lisbon.",
    meta: { season: "Spring 2024", detail: "48pp · 7 pieces" },
  },
];
