/**
 * The printable event flyers the admin can view and download. Each one ships
 * as static files in public/marketing-flyers/: <id>-a5.pdf and <id>-a4.pdf
 * for print, <id>-a5-print.pdf for print shops (3 mm bleed and crop marks),
 * <id>.png at full size (2480x3520) and <id>-preview.jpg, the
 * small still the card shows. The files are the source of truth for the
 * design; this registry only says what the dashboard lists.
 *
 * Static on purpose, in demo and live mode alike: the flyers ship with the
 * site, there is no API behind them. To add one, add its source and render it
 * with `pnpm flyers` (scripts/launch-flyer/render.mjs writes into
 * public/marketing-flyers/), then add an entry here plus its
 * `admin:marketingVideos.flyers.<id>.title` and `.summary` i18n keys.
 */
export type MarketingFlyerId = "first-event";

/** The downloadable files a flyer can offer, one button each. */
export type FlyerFileId = "pdfA5" | "pdfA5Print" | "pdfA4" | "png";

export interface MarketingFlyer {
  id: MarketingFlyerId;
  /** The files it offers, in the order the card shows their buttons. */
  files: readonly FlyerFileId[];
}

export const MARKETING_FLYERS: readonly MarketingFlyer[] = [
  { id: "first-event", files: ["pdfA5", "pdfA5Print", "pdfA4", "png"] },
];

const FLYERS_PATH = "/marketing-flyers";

/** The preview still's intrinsic size, so the card reserves its box. */
export const FLYER_PREVIEW_SIZE = { width: 620, height: 880 } as const;

const FILE_SUFFIXES: Readonly<Record<FlyerFileId, string>> = {
  pdfA5: "-a5.pdf",
  pdfA5Print: "-a5-print.pdf",
  pdfA4: "-a4.pdf",
  png: ".png",
};

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
