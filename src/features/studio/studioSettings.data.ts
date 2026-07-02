export interface RadioOpt {
  key: string;
  label: string;
  badge?: string;
  sub: string;
}

export const STREAM_QUALITY_OPTS: RadioOpt[] = [
  {
    key: "flac",
    label: "FLAC · 24/48",
    badge: "lossless",
    sub: "The master, untouched. ~25 MB / track.",
  },
  {
    key: "aac",
    label: "AAC · 256kbps",
    sub: "Transparent for most ears. ~7 MB / track.",
  },
];

export const TIP_PRIVACY_OPTS: RadioOpt[] = [
  {
    key: "private",
    label: "Private",
    badge: "default",
    sub: "Just you and the artist. Never shown on their page or your public receipt.",
  },
  {
    key: "semi",
    label: "Semi-public",
    sub: "Visible to other sustainers of that artist, attributed to your handle.",
  },
  {
    key: "public",
    label: "Public",
    sub: "Anyone can read it on the artist's page. You can still hide any single note later.",
  },
];

export const DOWNLOAD_QUALITY_OPTS = ["AAC", "FLAC"];
export const CAPTION_SIZE_OPTS = ["S", "M", "L", "XL"];
export const TIP_AMOUNTS = ["€1", "€2", "€5", "€10"];
