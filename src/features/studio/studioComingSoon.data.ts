/**
 * The three tracks on the coming-soon record's Side A. Keys only: every word
 * lives in the studio catalog, and none of it promises a price, a split or a
 * plan, because Studio has not launched. Each track's sleeve art (its tint and
 * waveform) is drawn in CSS by list position.
 */
export interface StudioComingSoonTrack {
  id: string;
  titleKey: string;
  bodyKey: string;
}

export const STUDIO_COMING_SOON_TRACKS: StudioComingSoonTrack[] = [
  {
    id: "artists",
    titleKey: "studio:comingSoon.preview.artists.title",
    bodyKey: "studio:comingSoon.preview.artists.body",
  },
  {
    id: "live",
    titleKey: "studio:comingSoon.preview.live.title",
    bodyKey: "studio:comingSoon.preview.live.body",
  },
  {
    id: "together",
    titleKey: "studio:comingSoon.preview.together.title",
    bodyKey: "studio:comingSoon.preview.together.body",
  },
];

export const STUDIO_COMING_SOON_PARAGRAPH_KEYS = [
  "studio:comingSoon.why.p1",
  "studio:comingSoon.why.p2",
  "studio:comingSoon.why.p3",
];
