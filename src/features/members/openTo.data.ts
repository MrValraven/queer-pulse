/**
 * The shared "open to" vocabulary — the single source for the profile chips, the
 * member-directory filter, and the connect form's reason select. Before this
 * existed the platform carried three parallel vocabularies: free-text
 * `Member.openTo`, the directory's `OPEN_POOL`, and connect's `REASONS`.
 *
 * Preset vs custom: members say 84 distinct things across 94 entries, and the
 * long tail ("A nurse or two for the testing nights") is the house voice — a
 * taxonomy that covered it would need ~84 ids. So presets carry the repeatable
 * categories (translatable, filterable) and customs carry everything else
 * verbatim (untranslated, not filterable), losing nothing.
 *
 * An id earns its place only when two or more distinct members say the same
 * thing with no qualifier. Do not add an id for a single member's phrasing.
 */
export type OpenToId =
  | "collaborating"
  | "mentoring"
  | "casualMeetups"
  | "commissions"
  | "clientWork"
  | "referrals"
  | "swaps"
  | "studioVisits"
  | "interviewees";

export interface OpenToPreset {
  id: OpenToId;
  /** Resolved via `t()`; the id is what's stored and compared. */
  labelKey: string;
}

/** One thing a member is open to: a shared preset, or their own words. */
export type OpenToEntry =
  { kind: "preset"; id: OpenToId } | { kind: "custom"; label: string };

/** Display order — the directory filter's checkbox rows and the profile chips. */
export const OPEN_TO_PRESETS: OpenToPreset[] = [
  { id: "collaborating", labelKey: "members:openTo.collaborating" },
  { id: "mentoring", labelKey: "members:openTo.mentoring" },
  { id: "casualMeetups", labelKey: "members:openTo.casualMeetups" },
  { id: "commissions", labelKey: "members:openTo.commissions" },
  { id: "clientWork", labelKey: "members:openTo.clientWork" },
  { id: "referrals", labelKey: "members:openTo.referrals" },
  { id: "swaps", labelKey: "members:openTo.swaps" },
  { id: "studioVisits", labelKey: "members:openTo.studioVisits" },
  { id: "interviewees", labelKey: "members:openTo.interviewees" },
];

const LABEL_KEY_BY_ID = new Map(
  OPEN_TO_PRESETS.map((preset) => [preset.id, preset.labelKey]),
);

/** Type guard — customs never participate in filtering. */
export function isPreset(
  entry: OpenToEntry,
): entry is { kind: "preset"; id: OpenToId } {
  return entry.kind === "preset";
}

/** Display text for a chip / select option. Presets translate; customs don't. */
export function openToLabel(
  entry: OpenToEntry,
  t: (key: string) => string,
): string {
  if (entry.kind === "custom") return entry.label;
  return t(LABEL_KEY_BY_ID.get(entry.id) ?? `members:openTo.${entry.id}`);
}

/** Just the preset ids an entry list carries — what the directory filters on. */
export function openToPresetIds(entries: OpenToEntry[]): OpenToId[] {
  return entries.filter(isPreset).map((entry) => entry.id);
}

/**
 * Encode an entry as the connect form's flat `<select>` value. Both the profile
 * chips (which set it) and the form (which offers it) must produce byte-identical
 * strings or a chip silently fails to preselect — so this lives here, once.
 * Generic REASONS ids stay unprefixed and are not produced by this function.
 */
export function reasonValue(entry: OpenToEntry): string {
  return entry.kind === "preset" ? `open:${entry.id}` : `custom:${entry.label}`;
}
