/**
 * The three frames on the coming-soon film strip. Keys only: every word lives
 * in the cinema catalog, and none of it promises a price, a split or a plan,
 * because Cinema has not launched. `plate` picks the film artefact drawn on
 * each still (see CinemaComingSoonPlate).
 */
export interface CinemaComingSoonFrame {
  id: string;
  titleKey: string;
  bodyKey: string;
  plate: "titleCard" | "slate" | "subtitled";
}

export const CINEMA_COMING_SOON_FRAMES: CinemaComingSoonFrame[] = [
  {
    id: "seasons",
    titleKey: "cinema:comingSoon.preview.seasons.title",
    bodyKey: "cinema:comingSoon.preview.seasons.body",
    plate: "titleCard",
  },
  {
    id: "local",
    titleKey: "cinema:comingSoon.preview.local.title",
    bodyKey: "cinema:comingSoon.preview.local.body",
    plate: "slate",
  },
  {
    id: "open",
    titleKey: "cinema:comingSoon.preview.open.title",
    bodyKey: "cinema:comingSoon.preview.open.body",
    plate: "subtitled",
  },
];

export const CINEMA_COMING_SOON_PARAGRAPH_KEYS = [
  "cinema:comingSoon.why.p1",
  "cinema:comingSoon.why.p2",
  "cinema:comingSoon.why.p3",
];
