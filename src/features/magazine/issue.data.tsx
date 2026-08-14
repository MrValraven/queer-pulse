import type { ReactNode } from "react";

export interface Entry {
  /** Content: the TOC entry's own genre/category label — arrives from the
   *  API alongside the article in live mode (mirrors `articles.tsx`'s
   *  `kicker` field), so it stays as a plain English string. */
  category: string;
  /** Content-adjacent read-time datum; composed with chrome via
   *  `magazine:format.min` in the component so PT gets its own phrasing. */
  minutes: number;
  title: ReactNode;
  dek: string;
  byline: ReactNode;
  page: string;
  /** Valid id from magazine articles data; the entry links to /article?id=… */
  articleId: string;
}

export const ISSUE_COVER_IMG =
  "https://images.unsplash.com/photo-1775633954065-887d3f2025bd?q=80&w=600&auto=format&fit=crop";

/**
 * Demo-mode cover values for the always-issue-09 page. These are the
 * fabricated editorial fields the prototype ships (title/dek/season/stats/
 * publish date); live mode overlays the real title/dek/date from
 * GET /magazine/issues/:number and never renders the fabricated season line,
 * stat counts or editor's letter. Kept here (not as component default props)
 * so a missing/failed live fetch can never silently fall back to this mock.
 */
export const DEMO_ISSUE_COVER = {
  number: "09",
  season: "Spring · 2026",
  title: (
    <>
      On <em>health.</em>
    </>
  ),
  dek: (
    <>
      Twelve pieces about how we keep our bodies, our minds, and each other.
      Reported, debated, illustrated. <em>Sometimes funny.</em>
    </>
  ),
  publishedLabel: "6 Jun 2026",
  featureCount: 12,
  pageCount: 84,
  contributorCount: 8,
} as const;

export const PRINT_EDITION_IMG =
  "https://images.unsplash.com/photo-1759926967575-e3254dc7d531?q=80&w=600&auto=format&fit=crop";

/**
 * i18n Pattern A — TOC section headings are a small closed taxonomy the
 * platform itself defines (mirrors `NAV_ITEMS`), so they're translated via
 * keys; `entries` content (title/dek/byline/category) is the issue's own
 * editorial material and stays in English.
 */
export const TOC: { headingKey: string; entries: Entry[] }[] = [
  {
    headingKey: "magazine:contents.heading.coverStory",
    entries: [
      {
        category: "Cover",
        minutes: 14,
        title: (
          <>
            Five things I learned{" "}
            <em>navigating Lisbon's trans health system.</em>
          </>
        ),
        dek: "From the SNS to private clinics, what nobody tells you about waiting lists, referrals, and how to actually get a hormone prescription without losing a year of your life.",
        byline: (
          <>
            By <b>Sara Pinheiro</b> · illustrated by André Bento
          </>
        ),
        page: "04",
        articleId: "city-changed",
      },
    ],
  },
  {
    headingKey: "magazine:contents.heading.features",
    entries: [
      {
        category: "Reportage",
        minutes: 11,
        title: (
          <>
            Inside the back room of <em>a neighbourhood café.</em>
          </>
        ),
        dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.",
        byline: (
          <>
            By <b>Jonas Ferreira</b>
          </>
        ),
        page: "18",
        articleId: "last-bar",
      },
      {
        category: "Interview",
        minutes: 9,
        title: (
          <>
            Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
          </>
        ),
        dek: "The Anjos GP who treats trans patients as adults, and changed the protocol for an entire clinic.",
        byline: (
          <>
            Interview by <b>Sara Pinheiro</b>
          </>
        ),
        page: "28",
        articleId: "kiko-neves",
      },
      {
        category: "Essay",
        minutes: 7,
        title: (
          <>
            The waiting room is <em>also part of the treatment.</em>
          </>
        ),
        dek: "On chairs, lighting, music, and what design does to a body waiting to be seen.",
        byline: (
          <>
            By <b>Luísa Gomes</b> · photographs by André Bento
          </>
        ),
        page: "36",
        articleId: "i-arrived",
      },
      {
        category: "Long read",
        minutes: 22,
        title: (
          <>
            A history of the lifeline, <em>1995–2025.</em>
          </>
        ),
        dek: "Three decades of ILGA Portugal's helpline, told through the calls operators remember and the ones they can't.",
        byline: (
          <>
            By <b>Catarina Vaz</b>
          </>
        ),
        page: "44",
        articleId: "visibility-politics",
      },
    ],
  },
  {
    headingKey: "magazine:contents.heading.profiles",
    entries: [
      {
        category: "Profile",
        minutes: 6,
        title: (
          <>
            The pharmacist who fills <em>every prescription.</em>
          </>
        ),
        dek: "Rui from Farmácia do Carmo doesn't ask follow-up questions. He has reasons.",
        byline: (
          <>
            By <b>Tomás Mendes</b>
          </>
        ),
        page: "58",
        articleId: "mouraria-family",
      },
      {
        category: "Profile",
        minutes: 7,
        title: "Twenty years in a hospital corridor.",
        dek: "A nurse on what's changed, what hasn't, and what she still does anyway.",
        byline: (
          <>
            By <b>Anika Kovač</b>
          </>
        ),
        page: "64",
        articleId: "politics-of-staying",
      },
    ],
  },
];

export const CONTRIBUTORS = [
  { initials: "SP", name: "Sara Pinheiro", role: "Health & access" },
  { initials: "JF", name: "Jonas Ferreira", role: "Reportage" },
  { initials: "LG", name: "Luísa Gomes", role: "Essays" },
  { initials: "CV", name: "Catarina Vaz", role: "Long reads" },
  { initials: "TM", name: "Tomás Mendes", role: "Profiles" },
  { initials: "AK", name: "Anika Kovač", role: "Profiles" },
  { initials: "AB", name: "André Bento", role: "Illustration" },
  { initials: "MR", name: "Marta Reis", role: "Editor in chief" },
];
