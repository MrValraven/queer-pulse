import { type ReactNode } from "react";

export type Tint = "coral" | "jade" | "plum";

export interface ChangemakerStory {
  slug: string;
  name: string;
  initials: string;
  cause: string;
  tint: Tint;
  tags: string[];
  /* card / listing */
  summary: string;
  /* shared with the featured card */
  impact: string[];
  /* story page */
  byline: string;
  readTime: string;
  date: string;
  heroNote: string; // placeholder caption for the hero image band
  lead: ReactNode; // one line: why they're highlighted
  body: ReactNode[]; // article paragraphs
  pullQuote: { text: string; cite: string };
}
