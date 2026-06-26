export const CHIPS = ["All", "The space", "The clinic", "The crowd", "After hours"];

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
  { label: "01 · Sandra at the counter, 18:45", tint: "tintA", span: "wide", tag: "Opening" },
  { label: "02 · The back-room sign", tint: "tintB" },
  { label: "03 · Anika briefing the volunteers", tint: "tintC", span: "tall", tag: "With consent", tagAccent: true },
  { label: "04 · Dr. Pereira's table", tint: "tintD", tag: "With consent", tagAccent: true },
  { label: "05 · Pharmacist station", tint: "tintB" },
  { label: "06 · The waiting bench", tint: "tintA" },
  { label: "07 · The kettle", tint: "tintC" },
  { label: "08 · The line, 19:30", tint: "tintD", span: "wide", tag: "Crowd · blurred" },
  { label: "09 · A side conversation", tint: "tintB" },
  { label: "10 · The pastéis", tint: "tintA" },
  { label: "11 · Anika, post-event", tint: "tintC", span: "tall", tag: "With consent", tagAccent: true },
  { label: "12 · The first 'thank you'", tint: "tintD" },
  { label: "13 · Wall of post-its (group)", tint: "tintB" },
  { label: "14 · The clean-up team", tint: "tintA" },
  { label: "15 · Rui closing up", tint: "tintC" },
  { label: "16 · The room at 22:00", tint: "tintB", span: "wide" },
  { label: "17 · Last drink at the bar", tint: "tintD" },
  { label: "18 · The back door, open", tint: "tintA" },
];

export const CONTRIBUTORS = [
  { initials: "AB", bg: "rgba(var(--accent-rgb),.14)", color: "var(--accent-ink)", name: "André Bento", count: "18 photos" },
  { initials: "SC", bg: "rgba(var(--jade-rgb),.16)", color: "var(--jade)", name: "Sofia Castaño", count: "6 photos" },
  { initials: "TM", bg: "rgba(45,27,61,.10)", color: "var(--plum)", name: "Tomás Mendes", count: "3 photos" },
  { initials: "FL", bg: "rgba(var(--accent-rgb),.14)", color: "var(--accent-ink)", name: "Filipa Lopes", count: "1 photo" },
];
