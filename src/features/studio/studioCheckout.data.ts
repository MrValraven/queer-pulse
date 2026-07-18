export const PLAN_PRICE = 7;

export const PLAN_LINES: { labelKey: string; valueKey: string }[] = [
  {
    labelKey: "studio:checkout.lines.unlimitedListening",
    valueKey: "studio:checkout.lines.included",
  },
  {
    labelKey: "studio:checkout.lines.losslessAudio",
    valueKey: "studio:checkout.lines.included",
  },
  {
    labelKey: "studio:checkout.lines.liveRooms",
    valueKey: "studio:checkout.lines.included",
  },
  {
    labelKey: "studio:checkout.lines.artistShare",
    valueKey: "",
  },
  {
    labelKey: "studio:checkout.lines.platformShare",
    valueKey: "",
  },
];

/**
 * The artist's share of a sustain subscription. This is the co-op deed's 80%
 * floor (`terms.deed.body`), which cannot be lowered without a two-thirds
 * supermajority of the membership — not a figure to tune here.
 */
export const PLAN_ARTIST_SHARE_PERCENT = 80;

/** Derived, never hand-set: the two shares are complements, and holding them as
 *  independent constants is exactly how they drifted to 70/30. */
export const PLAN_PLATFORM_SHARE_PERCENT = 100 - PLAN_ARTIST_SHARE_PERCENT;

export const REASSURE_KEYS = [
  "studio:checkout.reassure.cancel",
  "studio:checkout.reassure.share",
  "studio:checkout.reassure.noAds",
];
