/**
 * The marketing images the admin can view and download: printable event
 * flyers and Instagram stories. Each one ships as static files in
 * public/marketing-flyers/ and always has <id>-preview.jpg, the small still
 * the card shows. A print flyer (format "a5") adds <id>-a5.pdf and
 * <id>-a4.pdf for print, <id>-a5-print.pdf for print shops (3 mm bleed and
 * crop marks) and <id>.png at full size (2480x3520). A story (format
 * "story") adds <id>.png in English and <id>-pt.png in Portuguese, both
 * 1080x1920. The files are the source of truth for the design; this
 * registry only says what the dashboard lists.
 *
 * Static on purpose, in demo and live mode alike: the images ship with the
 * site, there is no API behind them. To add one, add its source and render
 * it with scripts/launch-flyer/render.mjs, which writes into
 * public/marketing-flyers/ (`pnpm flyers` renders them all,
 * `node scripts/launch-flyer/render.mjs studio-open-call` just the story),
 * then add an entry here plus its `admin:marketingVideos.flyers.<id>.title`
 * and `.summary` i18n keys.
 */
export type MarketingFlyerId = "studio-open-call" | "first-event";

/** The shape of the piece: an A5 print flyer or a 9:16 Instagram story. */
export type FlyerFormat = "a5" | "story";

/** The downloadable files a flyer can offer, one button each. */
export type FlyerFileId = "pdfA5" | "pdfA5Print" | "pdfA4" | "png" | "pngPt";

export interface MarketingFlyer {
  id: MarketingFlyerId;
  format: FlyerFormat;
  /** The files it offers, in the order the card shows their buttons. */
  files: readonly FlyerFileId[];
}

/** Newest first. */
export const MARKETING_FLYERS: readonly MarketingFlyer[] = [
  { id: "studio-open-call", format: "story", files: ["png", "pngPt"] },
  {
    id: "first-event",
    format: "a5",
    files: ["pdfA5", "pdfA5Print", "pdfA4", "png"],
  },
];

const FLYERS_PATH = "/marketing-flyers";

const PREVIEW_SIZES: Readonly<
  Record<FlyerFormat, { width: number; height: number }>
> = {
  a5: { width: 620, height: 880 },
  story: { width: 540, height: 960 },
};

/** The preview still's intrinsic size, so the card reserves its box. */
export function flyerPreviewSize(format: FlyerFormat): {
  width: number;
  height: number;
} {
  return PREVIEW_SIZES[format];
}

const FILE_SUFFIXES: Readonly<Record<FlyerFileId, string>> = {
  pdfA5: "-a5.pdf",
  pdfA5Print: "-a5-print.pdf",
  pdfA4: "-a4.pdf",
  png: ".png",
  pngPt: "-pt.png",
};

/**
 * The i18n key for a file's download button. A story comes in two languages,
 * so its English PNG says so beside the Portuguese one.
 */
export function flyerDownloadLabelKey(
  format: FlyerFormat,
  file: FlyerFileId,
): string {
  const key = `admin:marketingVideos.flyerCard.download.${file}`;
  return format === "story" && file === "png" ? `${key}.story` : key;
}

/** Where a flyer's file is served: /marketing-flyers/first-event-a5.pdf. */
export function flyerFileUrl(id: MarketingFlyerId, file: FlyerFileId): string {
  return `${FLYERS_PATH}/${id}${FILE_SUFFIXES[file]}`;
}

/** The small still the card shows: /marketing-flyers/first-event-preview.jpg. */
export function flyerPreviewUrl(id: MarketingFlyerId): string {
  return `${FLYERS_PATH}/${id}-preview.jpg`;
}

/** The saved file's name: queerpulse-first-event-a5.pdf, queerpulse-first-event.png. */
export function flyerDownloadName(
  id: MarketingFlyerId,
  file: FlyerFileId,
): string {
  return `queerpulse-${id}${FILE_SUFFIXES[file]}`;
}
