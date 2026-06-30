import type { ReactNode } from "react";

export interface Entry {
  kicker: string;
  title: ReactNode;
  dek: string;
  byline: ReactNode;
  page: string;
  /** Valid id from magazine articles data; the entry links to /article?id=… */
  articleId: string;
}

export const ISSUE_COVER_IMG =
  "https://images.unsplash.com/photo-1775633954065-887d3f2025bd?q=80&w=600&auto=format&fit=crop";

export const PRINT_EDITION_IMG =
  "https://images.unsplash.com/photo-1759926967575-e3254dc7d531?q=80&w=600&auto=format&fit=crop";

export const TOC: { heading: string; entries: Entry[] }[] = [
  {
    heading: "Cover story",
    entries: [
      {
        kicker: "Cover · 14 min read",
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
    heading: "Features",
    entries: [
      {
        kicker: "Reportage · 11 min",
        title: (
          <>
            Inside the back room of <em>Café Beirão.</em>
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
        kicker: "Interview · 9 min",
        title: (
          <>
            Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
          </>
        ),
        dek: "The Anjos GP who treats trans patients as adults — and changed the protocol for an entire clinic.",
        byline: (
          <>
            Interview by <b>Sara Pinheiro</b>
          </>
        ),
        page: "28",
        articleId: "kiko-neves",
      },
      {
        kicker: "Essay · 7 min",
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
        kicker: "Long read · 22 min",
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
    heading: "Profiles",
    entries: [
      {
        kicker: "Profile · 6 min",
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
        kicker: "Profile · 7 min",
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
