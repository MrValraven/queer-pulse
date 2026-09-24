/**
 * The three frames on the coming-soon film strip. Keys only: every word lives
 * in the cinema catalog, and none of it promises a price, a split or a plan,
 * because Cinema has not launched. Each frame's projected plate (its tint and
 * composition) is drawn in CSS by list position.
 */
export interface CinemaComingSoonFrame {
  id: string;
  titleKey: string;
  bodyKey: string;
}

export const CINEMA_COMING_SOON_FRAMES: CinemaComingSoonFrame[] = [
  {
    id: "seasons",
    titleKey: "cinema:comingSoon.preview.seasons.title",
    bodyKey: "cinema:comingSoon.preview.seasons.body",
  },
  {
    id: "local",
    titleKey: "cinema:comingSoon.preview.local.title",
    bodyKey: "cinema:comingSoon.preview.local.body",
  },
  {
    id: "open",
    titleKey: "cinema:comingSoon.preview.open.title",
    bodyKey: "cinema:comingSoon.preview.open.body",
  },
];

export const CINEMA_COMING_SOON_PARAGRAPH_KEYS = [
  "cinema:comingSoon.why.p1",
  "cinema:comingSoon.why.p2",
  "cinema:comingSoon.why.p3",
];
