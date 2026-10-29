/**
 * The marketing images the admin can view and download: printable event
 * flyers, Instagram stories and event banners. Each one ships as static
 * files in public/marketing-flyers/ and always has <id>-preview.jpg, the
 * small still the card shows. A print flyer (format "a5") adds <id>-a5.pdf
 * and <id>-a4.pdf for print, <id>-a5-print.pdf for print shops (3 mm bleed
 * and crop marks) and <id>.png at full size (2480x3520). A story (format
 * "story") adds <id>.png in English and <id>-pt.png in Portuguese, both
 * 1080x1920. An event banner (format "banner") adds <id>.png in English and
 * <id>-pt.png in Portuguese, both 2400x1200. The files are the source of
 * truth for the design; this registry only says what the dashboard lists:
 * MARKETING_FLYERS for the flyers and stories, MARKETING_EVENT_BANNERS for
 * the event banners.
 *
 * Static on purpose, in demo and live mode alike: the images ship with the
 * site, there is no API behind them. To add one, add its source and render
 * it with scripts/launch-flyer/render.mjs, which writes into
 * public/marketing-flyers/ (`pnpm flyers` renders them all,
 * `node scripts/launch-flyer/render.mjs studio-open-call` just the story,
 * `node scripts/launch-flyer/render.mjs queer-history-quiz-night` just the
 * banner), then add an entry here plus its
 * `admin:marketingVideos.flyers.<id>.title` and `.summary` i18n keys.
 */
export type MarketingFlyerId =
  "studio-open-call" | "first-event" | "queer-history-quiz-night";

/**
 * The shape of the piece: an A5 print flyer, a 9:16 Instagram story or a
 * banner (a 2:1 event cover for the events page).
 */
export type FlyerFormat = "a5" | "story" | "banner";

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

/** Newest first. */
export const MARKETING_EVENT_BANNERS: readonly MarketingFlyer[] = [
  { id: "queer-history-quiz-night", format: "banner", files: ["png", "pngPt"] },
];

const FLYERS_PATH = "/marketing-flyers";

const PREVIEW_SIZES: Readonly<
  Record<FlyerFormat, { width: number; height: number }>
> = {
  a5: { width: 620, height: 880 },
  story: { width: 540, height: 960 },
  banner: { width: 1200, height: 600 },
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
 * The i18n key for a file's download button. A story and a banner come in
 * two languages, so their English PNG says so beside the Portuguese one.
 */
export function flyerDownloadLabelKey(
  format: FlyerFormat,
  file: FlyerFileId,
): string {
  const key = `admin:marketingVideos.flyerCard.download.${file}`;
  const isBilingual = format === "story" || format === "banner";
  return isBilingual && file === "png" ? `${key}.${format}` : key;
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
