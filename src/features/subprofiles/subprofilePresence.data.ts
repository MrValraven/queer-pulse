import type { CSSProperties } from "react";
import type { AccentKey, AvailabilityKey } from "./api/subprofiles.api";

/** accent key → CSS custom-property values applied inline on the persona hero.
 *  `tint` is the accent color; `on` is a readable foreground for text on `tint`.
 *
 *  Every `tint` here is a fixed brand colour that does NOT flip between themes,
 *  so its foreground must not flip either. `--cream` and `--ink` both DO flip,
 *  which is why the family pill on the personas directory went unreadable in
 *  dark mode: cream on the plum pill resolved to near-black on near-black.
 *  `--cream-rgb` and `--ink-surface` are the non-flipping counterparts the
 *  token file publishes for exactly this, and carry the identical light-mode
 *  values, so this is a no-op in light and a fix in dark. */
export const ACCENT_TOKENS: Record<AccentKey, { tint: string; on: string }> = {
  plum: { tint: "var(--plum)", on: "rgb(var(--cream-rgb))" },
  coral: { tint: "var(--accent)", on: "rgb(var(--cream-rgb))" },
  jade: { tint: "var(--jade)", on: "var(--ink-surface)" },
  amber: { tint: "var(--amber)", on: "var(--ink-surface)" },
  violet: { tint: "var(--violet)", on: "rgb(var(--cream-rgb))" },
};

/** Inline style setting BOTH accent custom properties (`--accent-tint` +
 *  `--accent-on`) for an accent key — the one typed place these are splat,
 *  replacing per-site `["--accent-tint" as string]` casts. Use on elements whose
 *  subtree reads the accent foreground too (cards, rows, pills with text-on-tint). */
export function accentStyle(accent: AccentKey): CSSProperties {
  const { tint, on } = ACCENT_TOKENS[accent];
  return { "--accent-tint": tint, "--accent-on": on } as CSSProperties;
}

/** Inline style setting ONLY `--accent-tint` (no `--accent-on`) — for elements
 *  that historically set the tint alone (social row, featured strip, availability
 *  pill, dashboard side card). Kept distinct from {@link accentStyle} so the
 *  refactor never introduces an `--accent-on` those subtrees never had. */
export function accentTintStyle(accent: AccentKey): CSSProperties {
  return { "--accent-tint": ACCENT_TOKENS[accent].tint } as CSSProperties;
}

/** Inline style setting the skin tint/foreground pair (`--sk-tint` + `--sk-on`)
 *  from an accent key — the persona page/preview shells apply this at the skin
 *  root so every skin block inherits the accent. */
export function skinVars(accent: AccentKey): CSSProperties {
  const { tint, on } = ACCENT_TOKENS[accent];
  return { "--sk-tint": tint, "--sk-on": on } as CSSProperties;
}

export const ACCENT_OPTIONS: AccentKey[] = [
  "plum",
  "coral",
  "jade",
  "amber",
  "violet",
];

/** Fallback accent when a persona has none set. */
export const DEFAULT_ACCENT: AccentKey = "plum";

export const AVAILABILITY_OPTIONS: {
  value: AvailabilityKey;
  labelKey: string;
}[] = [
  {
    value: "open_to_collabs",
    labelKey: "subprofiles:availability.openToCollabs",
  },
  { value: "booking", labelKey: "subprofiles:availability.booking" },
  { value: "not_available", labelKey: "subprofiles:availability.notAvailable" },
];

/** `.pill` colour modifier per availability state, for the dashboard
 *  `SideCard`'s compact avail pill (a `.pill`-shaped alternative to
 *  `SubprofileAvailability`'s dot+label, sized for the card's tight footer
 *  row). Open reads positive (jade), booking reads as an active call-to-action
 *  (coral), and not-available stays neutral (muted) — never colour-only, the
 *  pill always carries its `AVAILABILITY_OPTIONS` label text too. */
export const AVAILABILITY_PILL_TONE: Record<
  AvailabilityKey,
  "jade" | "coral" | "muted"
> = {
  open_to_collabs: "jade",
  booking: "coral",
  not_available: "muted",
};
