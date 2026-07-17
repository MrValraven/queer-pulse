export interface RadioOpt {
  key: string;
  labelKey: string;
  badgeKey?: string;
  subKey: string;
}

export const STREAM_QUALITY_OPTS: RadioOpt[] = [
  {
    key: "flac",
    labelKey: "studio:settings.audio.streamQuality.flac.label",
    badgeKey: "studio:settings.audio.streamQuality.flac.badge",
    subKey: "studio:settings.audio.streamQuality.flac.sub",
  },
  {
    key: "aac",
    labelKey: "studio:settings.audio.streamQuality.aac.label",
    subKey: "studio:settings.audio.streamQuality.aac.sub",
  },
];

export const TIP_PRIVACY_OPTS: RadioOpt[] = [
  {
    key: "private",
    labelKey: "studio:settings.privacy.tipNotes.private.label",
    badgeKey: "studio:settings.privacy.tipNotes.private.badge",
    subKey: "studio:settings.privacy.tipNotes.private.sub",
  },
  {
    key: "semi",
    labelKey: "studio:settings.privacy.tipNotes.semi.label",
    subKey: "studio:settings.privacy.tipNotes.semi.sub",
  },
  {
    key: "public",
    labelKey: "studio:settings.privacy.tipNotes.public.label",
    subKey: "studio:settings.privacy.tipNotes.public.sub",
  },
];

// Audio codec names and size abbreviations — not translatable copy (§1: same
// in every language, like "MP3" or "XL").
export const DOWNLOAD_QUALITY_OPTS = ["AAC", "FLAC"];
export const CAPTION_SIZE_OPTS = ["S", "M", "L", "XL"];

// Preset tip amounts, in euros; rendered via fmt.currency() so pt-PT gets
// "2 €" (suffix, comma) instead of a hand-rolled "€2".
export const TIP_AMOUNTS = [1, 2, 5, 10];
