// "All" is a generic filter chip shown on every album — chrome, keyed. The
// other four name this specific album's own categories (set by the host for
// this event) — content, left in English, matching the photo-caption
// precedent for this file.
export const ALL_CHIP_KEY = "gatherings:photos.chipAll";
export const CHIPS = ["The space", "The clinic", "The crowd", "After hours"];

/** This album's counts — real numbers, formatted/pluralized at render. */
export const PHOTOS_TOTAL_COUNT = 28;
export const PHOTOS_CONSENTED_COUNT = 14;
export const PHOTOS_EXTRA_ATTENDEE_COUNT = 3;
export const PHOTOS_EVENT_DATE = new Date(2026, 5, 12);
export const PHOTOS_NEXT_EVENT_DATE = new Date(2026, 6, 10);

/**
 * This specific album's own content — event/venue/host/photographer names and
 * the descriptive dek. In live mode these come off the album record itself,
 * so (per the photo-caption precedent for this file) they stay in English.
 * They're held here as named constants — not inline JSX literals — purely so
 * the component reads them as expressions rather than bare JSX text.
 */
export const PHOTOS_EVENT_TITLE = "Open clinic night";
export const PHOTOS_VENUE = "Café Beirão";
export const PHOTOS_HOST_MEMBER = "Anika Kovač";
export const PHOTOS_HOST_ORG = "Trans Hub";
export const PHOTOS_PHOTOGRAPHER = "André Bento";
export const PHOTOS_DEK =
  "A photo album from the back room of Café Beirão. Photos by André Bento and three attending members who opted to share.";
export const PHOTOS_DEK_EMPHASIS =
  "Faces are blurred by default unless the person opted in by name";
export const PHOTOS_DEK_SUFFIX =
  "— that's our standard policy on gathering photography.";

export type Tint = "tintA" | "tintB" | "tintC" | "tintD";
export type Span = "" | "wide" | "tall";

export interface Pic {
  label: string;
  tint: Tint;
  span?: Span;
  tag?: string;
  tagAccent?: boolean;
}

export const PICS: Pic[] = [
  {
    label: "01 · Sandra at the counter, 18:45",
    tint: "tintA",
    span: "wide",
    tag: "Opening",
  },
  { label: "02 · The back-room sign", tint: "tintB" },
  {
    label: "03 · Anika briefing the volunteers",
    tint: "tintC",
    span: "tall",
    tag: "With consent",
    tagAccent: true,
  },
  {
    label: "04 · Dr. Pereira's table",
    tint: "tintD",
    tag: "With consent",
    tagAccent: true,
  },
  { label: "05 · Pharmacist station", tint: "tintB" },
  { label: "06 · The waiting bench", tint: "tintA" },
  { label: "07 · The kettle", tint: "tintC" },
  {
    label: "08 · The line, 19:30",
    tint: "tintD",
    span: "wide",
    tag: "Crowd · blurred",
  },
  { label: "09 · A side conversation", tint: "tintB" },
  { label: "10 · The pastéis", tint: "tintA" },
  {
    label: "11 · Anika, post-event",
    tint: "tintC",
    span: "tall",
    tag: "With consent",
    tagAccent: true,
  },
  { label: "12 · The first 'thank you'", tint: "tintD" },
  { label: "13 · Wall of post-its (group)", tint: "tintB" },
  { label: "14 · The clean-up team", tint: "tintA" },
  { label: "15 · Rui closing up", tint: "tintC" },
  { label: "16 · The room at 22:00", tint: "tintB", span: "wide" },
  { label: "17 · Last drink at the bar", tint: "tintD" },
  { label: "18 · The back door, open", tint: "tintA" },
];

/** `count` is a real number — the "photo(s)" phrase is chrome, pluralized at
 *  render via `t("gatherings:photos.photosLabel", { count })`. */
export const CONTRIBUTORS = [
  {
    initials: "AB",
    bg: "rgba(var(--accent-rgb),.14)",
    color: "var(--accent-ink)",
    name: "André Bento",
    count: 18,
  },
  {
    initials: "SC",
    bg: "rgba(var(--jade-rgb),.16)",
    color: "var(--jade)",
    name: "Sofia Castaño",
    count: 6,
  },
  {
    initials: "TM",
    bg: "rgba(45,27,61,.10)",
    color: "var(--plum)",
    name: "Tomás Mendes",
    count: 3,
  },
  {
    initials: "FL",
    bg: "rgba(var(--accent-rgb),.14)",
    color: "var(--accent-ink)",
    name: "Filipa Lopes",
    count: 1,
  },
];
