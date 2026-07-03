import type { IconType } from "react-icons";
import { FiDollarSign, FiGlobe, FiTarget } from "react-icons/fi";

/** Pitch-intro hero (the screenshot). */
export const LOOKING_FOR: { icon: IconType; title: string; body: string }[] = [
  {
    icon: FiTarget,
    title: "The specific over the general",
    body: "One supper club, one street, one afternoon. We trust the small story to carry the big one.",
  },
  {
    icon: FiGlobe,
    title: "Lisbon and beyond",
    body: "Rooted here, but we publish diaspora and visitor voices too. Place matters; borders less so.",
  },
  {
    icon: FiDollarSign,
    title: "We pay, always",
    body: 'Every published piece is paid fairly — rates shared upfront, no "exposure" ever.',
  },
];

export const STEPS = [
  "A reply within two weeks — yes, no, or let's talk.",
  "If it's a yes, an editor is assigned and you agree a rate and deadline.",
  "You keep the copyright. We license it, we don't own it.",
];

/** The issue currently open for submissions. */
export const ISSUE = {
  badge: "Issue 26",
  name: "July 2026 issue · Open for submissions",
  deadline: "Submission deadline: 20 June 2026",
};

/** Magazine sections the piece can be filed under. */
export const SECTIONS = [
  "Long read",
  "Personal essay",
  "Interview",
  "Opinion",
  "Community report",
  "Short fiction",
  "Photography",
];

/** Editorial guidelines shown in the sidebar; `term` renders bold. */
export const GUIDELINES: { term: string; detail: string }[] = [
  {
    term: "800–2,500 words",
    detail: "for most sections. Long reads up to 4,000.",
  },
  {
    term: "Write from experience.",
    detail: "First-person or closely reported. Not punditry.",
  },
  {
    term: "No promotional content.",
    detail: "The magazine doesn't carry advertising or sponsored pieces.",
  },
  { term: "Portuguese or English", detail: "— we publish both." },
  {
    term: "Deadlines are firm.",
    detail: "Late submissions go to the following issue.",
  },
];

/** "After you submit" reassurance, with a bold middle segment. */
export const AFTER_SUBMIT: { pre: string; strong: string; post: string }[] = [
  {
    pre: "Our editors respond within ",
    strong: "5 working days",
    post: " with acceptance, a request for edits, or a pass with notes.",
  },
  {
    pre: "Accepted pieces go through one round of editing. ",
    strong: "You approve the final version",
    post: " before it publishes.",
  },
  {
    pre: "You retain copyright. ",
    strong: "QueerPulse has a non-exclusive licence",
    post: " to publish in the magazine and archive.",
  },
];

/** Example draft the editor opens with (mirrors the design prototype). */
export const INITIAL_DRAFT = {
  section: "Personal essay",
  byline: "Sofia Ferreira",
  bylineNote: "",
  tags: "",
  headline: "The city keeps changing around us",
  deck: "",
  body: `The apartment I grew up thinking I could afford no longer exists in the neighbourhood I grew up in. This isn't a complaint — it's a map coordinate. Where you can live shapes who you can be around, and who you can be around shapes everything else.

I have been tracking this for three years: not with data, but with the particular cartography of knowing who has left. The restaurant where Catarina worked. The street where six of my friends used to live within walking distance of each other. The squat that became a hotel.

What I want to write about is the gap between leaving and being displaced. They feel different from the inside. Leaving has agency in it, even when it's coerced. Being displaced is something that happens to the body before the mind has processed it.`,
};

/** The editable fields of a story draft. */
export type DraftForm = typeof INITIAL_DRAFT;
