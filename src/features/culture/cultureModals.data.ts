/** Static field options + copy for the Culture modal flows.
 *
 * i18n Pattern A — each option array below keeps its stable English id as the
 * canonical value (never translated: it's a `Set<string>` selection stored
 * in `useChipSet()`, never persisted or submitted anywhere the fields aren't
 * simulated), with a parallel `*_LABEL_KEY` map resolving the display text.
 */

export const PICK_KINDS = ["Book", "Film", "Music"] as const;
export const PICK_KIND_OPTION_LABEL_KEY: Record<
  (typeof PICK_KINDS)[number],
  string
> = {
  Book: "culture:club.kind.book",
  Film: "culture:club.kind.film",
  Music: "culture:club.kind.music",
};

/** Areas a member can offer when posting a creative-commission project. */
export const PROJECT_LOOKING_FOR = [
  "Writer",
  "Editor",
  "Photographer",
  "Illustrator",
  "Designer",
  "Musician",
  "Translator",
  "Sensitivity reader",
  "Studio space",
] as const;
export const PROJECT_LOOKING_FOR_LABEL_KEY: Record<
  (typeof PROJECT_LOOKING_FOR)[number],
  string
> = {
  Writer: "culture:options.lookingFor.writer",
  Editor: "culture:options.lookingFor.editor",
  Photographer: "culture:options.lookingFor.photographer",
  Illustrator: "culture:options.lookingFor.illustrator",
  Designer: "culture:options.lookingFor.designer",
  Musician: "culture:options.lookingFor.musician",
  Translator: "culture:options.lookingFor.translator",
  "Sensitivity reader": "culture:options.lookingFor.sensitivityReader",
  "Studio space": "culture:options.lookingFor.studioSpace",
};

/** Mediums for the art-showcase submission. */
export const SHOWCASE_MEDIUMS = [
  "Photography",
  "Painting",
  "Illustration",
  "Mixed media",
  "Ceramics",
  "Digital",
  "Performance",
  "Installation",
] as const;
export const SHOWCASE_MEDIUM_LABEL_KEY: Record<
  (typeof SHOWCASE_MEDIUMS)[number],
  string
> = {
  Photography: "culture:options.medium.photography",
  Painting: "culture:options.medium.painting",
  Illustration: "culture:options.medium.illustration",
  "Mixed media": "culture:options.medium.mixedMedia",
  Ceramics: "culture:options.medium.ceramics",
  Digital: "culture:options.medium.digital",
  Performance: "culture:options.medium.performance",
  Installation: "culture:options.medium.installation",
};

/** Vibes a member can tag a radio playlist with. */
export const PLAYLIST_VIBES = [
  "Late night",
  "Tender",
  "Joyful",
  "Political",
  "Ambient",
  "Dancefloor",
  "Healing",
  "Nostalgic",
] as const;
export const PLAYLIST_VIBE_LABEL_KEY: Record<
  (typeof PLAYLIST_VIBES)[number],
  string
> = {
  "Late night": "culture:options.vibe.lateNight",
  Tender: "culture:options.vibe.tender",
  Joyful: "culture:options.vibe.joyful",
  Political: "culture:options.vibe.political",
  Ambient: "culture:options.vibe.ambient",
  Dancefloor: "culture:options.vibe.dancefloor",
  Healing: "culture:options.vibe.healing",
  Nostalgic: "culture:options.vibe.nostalgic",
};

/**
 * A date a few weeks out, used in success copy ("we'll email you by …").
 * Computed once at module load so the prototype always shows a future date.
 * Returns a `Date` (not a hand-formatted string) — the caller formats it with
 * `useFormat().date()` so pt-PT gets its own date phrasing.
 */
export function replyByDate(weeks = 2): Date {
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d;
}
