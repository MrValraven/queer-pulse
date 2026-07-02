import type { ReactNode } from "react";
import { memberName } from "../members/data/members";

export const AUTHOR_SLUG = "sara-pinheiro";

export const BEATS = [
  "Health & access",
  "Migration & visas",
  "Public services",
  "Long reads",
  "Interviews",
  "Reported essays",
];

export interface AuthorArticle {
  id: string;
  kicker: ReactNode;
  title: ReactNode;
  dek: string;
  meta: string;
}

export const ARTICLES: AuthorArticle[] = [
  {
    id: "visibility-politics",
    kicker: "Long read · 14 min",
    title: (
      <>
        What the SNS gets right (and where it <em>still leaves you waiting</em>
        ).
      </>
    ),
    dek: "Six months reporting inside three regional health centres in Lisbon and the Algarve.",
    meta: "Issue 07 · Apr 2026",
  },
  {
    id: "kiko-neves",
    kicker: "Interview",
    title: (
      <>
        Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
      </>
    ),
    dek: "The Anjos GP who treats trans patients as adults — and changed the protocol for an entire clinic.",
    meta: "Issue 06 · Feb 2026",
  },
  {
    id: "i-arrived",
    kicker: "Reported essay",
    title: (
      <>
        The visa queue is <em>a kind of closet.</em>
      </>
    ),
    dek: "Three queer migrants on what it means to wait for a residency permit while not being out to your case officer.",
    meta: "Issue 05 · Dec 2025",
  },
  {
    id: "politics-of-staying",
    kicker: "Opinion",
    title: (
      <>
        Stop calling it "access." <em>Call it care.</em>
      </>
    ),
    dek: "A small change in language that changes how clinics get funded — and who gets seen.",
    meta: "Issue 04 · Oct 2025",
  },
  {
    id: "last-bar",
    kicker: "Reporting",
    title: (
      <>
        Inside the back room of <em>Café Beirão.</em>
      </>
    ),
    dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.",
    meta: "Issue 03 · Aug 2025",
  },
  {
    id: "mouraria-family",
    kicker: `Interview · with ${memberName("sofia")}`,
    title: (
      <>
        Mariza Câmara, <em>district health director.</em>
      </>
    ),
    dek: "An hour-long conversation about queer health policy in Lisbon's Câmara Municipal.",
    meta: "Issue 02 · Jun 2025",
  },
];

export interface ReadingItem {
  title: ReactNode;
  tag: string;
}

export const READING: ReadingItem[] = [
  {
    title: (
      <>
        The Right to Maim <em>· Jasbir K. Puar</em>
      </>
    ),
    tag: "book",
  },
  { title: "How a queer GP rebuilt her practice", tag: "FT Magazine, 2024" },
  {
    title: (
      <>
        Lisboa pulse — visual notes <em>· Editora Anjos</em>
      </>
    ),
    tag: "zine",
  },
  { title: "The SNS, in numbers", tag: "2025 annual report" },
  {
    title: (
      <>
        On waiting <em>· Maria Tumarkin</em>
      </>
    ),
    tag: "essay",
  },
];
