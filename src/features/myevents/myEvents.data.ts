import type { Pill } from "./myEvents.types";

/** Pill buckets, in display order. */
export const PILLS: Pill[] = [
  "upcoming",
  "going",
  "hosting",
  "waitlisted",
  "past",
  "saved",
];

/** Mock "now" — the prototype is anchored to Mon 29 Jun 2026, 16:30. */
export const TODAY = new Date(2026, 5, 29);
TODAY.setHours(0, 0, 0, 0);
export const NOW = new Date(2026, 5, 29, 16, 30);

/** Avatar tint inline-styles, keyed by tint name. */
export const TINT_STYLE: Record<string, { background: string; color: string }> =
  {
    coral: {
      background: "rgba(var(--accent-rgb),.18)",
      color: "var(--accent-ink)",
    },
    jade: { background: "rgba(var(--jade-rgb),.18)", color: "var(--jade)" },
    plum: { background: "rgba(var(--plum-rgb),.1)", color: "var(--plum)" },
  };

/**
 * Access / safety chip labels — i18n Pattern A. Chrome (a fixed taxonomy of
 * access flags), resolved by `EventCardExtras.tsx`'s `AccessRow` via `t()`.
 */
export const ACCESS_LABEL_KEYS: Record<string, string> = {
  sober: "myevents:access.label.sober",
  stepfree: "myevents:access.label.stepfree",
  quiet: "myevents:access.label.quiet",
  interpret: "myevents:access.label.interpret",
  bsl: "myevents:access.label.bsl",
  masks: "myevents:access.label.masks",
};
