import type { Cause, Commit } from "./api/volunteering.api";

/** Cause options for the create form — value is the lowercase API cause. */
export const CAUSE_OPTIONS: { value: Cause; label: string }[] = [
  { value: "rights", label: "LGBTQ+ Rights" },
  { value: "health", label: "Health & Wellbeing" },
  { value: "youth", label: "Youth" },
  { value: "housing", label: "Housing" },
  { value: "arts", label: "Arts & Culture" },
];

/** Commitment level options with a short honesty line under each. */
export const COMMIT_OPTIONS: { value: Commit; label: string; hint: string }[] =
  [
    {
      value: "low",
      label: "Low commitment",
      hint: "A couple of flexible hours a week, no fixed term.",
    },
    {
      value: "medium",
      label: "Medium commitment",
      hint: "A regular shift and a minimum term — consistency matters.",
    },
  ];

/** Tips shown in the sidebar while filling out the form. */
export const POST_TIPS: { title: string; body: string }[] = [
  {
    title: "Be honest about the ask",
    body: "Volunteers stay when the commitment matches what you promised. Spell out the hours, the term, and any training up front.",
  },
  {
    title: "Say who it's good for",
    body: "The best roles name the person they need — their temperament, not just their CV. It helps the right people self-select in.",
  },
  {
    title: "What happens after you post",
    body: "Your role appears on the volunteer board immediately. Interested members sign up from the detail page, and you'll see the roster there.",
  },
];
