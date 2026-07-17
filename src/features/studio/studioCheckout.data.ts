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

/** Fixed split shown in the sustain-plan summary — flagged for review, see
 * i18n sweep report: this 70/30 figure disagrees with the 80/20 split stated
 * everywhere else in Studio (About, Help, Dashboard). Not changed here — the
 * sweep only translates copy, it doesn't reconcile product figures. */
export const PLAN_ARTIST_SHARE_PERCENT = 70;
export const PLAN_PLATFORM_SHARE_PERCENT = 30;

export const REASSURE_KEYS = [
  "studio:checkout.reassure.cancel",
  "studio:checkout.reassure.share",
  "studio:checkout.reassure.noAds",
];
