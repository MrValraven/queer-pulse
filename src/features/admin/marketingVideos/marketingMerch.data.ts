/**
 * The merch print files the admin can view and download. Each piece ships as
 * static files in public/marketing-merch/: <id>-front.png, .pdf and .svg
 * (the left-chest wordmark), <id>-back.png, .pdf and .svg (the back
 * tagline; the SVGs have their letters as shapes, so they need no font),
 * <id>-mockup.png with front and back on a black tee (3240x1820)
 * and <id>-preview.jpg, the small still the card shows. The files are the
 * source of truth for the design; this registry only says what the dashboard
 * lists.
 *
 * Static on purpose, in demo and live mode alike: the merch ships with the
 * site, there is no API behind it. To add a piece, edit
 * scripts/launch-merch/tee.html (or add a source) and render it with
 * `pnpm merch` (scripts/launch-merch/render.mjs writes into
 * public/marketing-merch/), then add an entry here plus its
 * `admin:marketingVideos.merch.<id>.title` and `.summary` i18n keys.
 */
export type MarketingMerchId = "team-tee";

/** The downloadable files a piece can offer, one button each. */
export type MerchFileId =
  "frontPng" | "frontPdf" | "frontSvg" | "backPng" | "backPdf" | "backSvg";

export interface MarketingMerch {
  id: MarketingMerchId;
  /** The files it offers, in the order the card shows their buttons. */
  files: readonly MerchFileId[];
}

export const MARKETING_MERCH: readonly MarketingMerch[] = [
  {
    id: "team-tee",
    files: [
      "frontPng",
      "frontPdf",
      "frontSvg",
      "backPng",
      "backPdf",
      "backSvg",
    ],
  },
];

const MERCH_PATH = "/marketing-merch";

/** The preview still's intrinsic size, so the card reserves its box. */
export const MERCH_PREVIEW_SIZE = { width: 810, height: 455 } as const;

const FILE_SUFFIXES: Readonly<Record<MerchFileId, string>> = {
  frontPng: "-front.png",
  frontPdf: "-front.pdf",
  frontSvg: "-front.svg",
  backPng: "-back.png",
  backPdf: "-back.pdf",
  backSvg: "-back.svg",
};

/** Where a piece's file is served: /marketing-merch/team-tee-front.png. */
export function merchFileUrl(id: MarketingMerchId, file: MerchFileId): string {
  return `${MERCH_PATH}/${id}${FILE_SUFFIXES[file]}`;
}

/** The full-size mockup View opens: /marketing-merch/team-tee-mockup.png. */
export function merchMockupUrl(id: MarketingMerchId): string {
  return `${MERCH_PATH}/${id}-mockup.png`;
}

/** The small still the card shows: /marketing-merch/team-tee-preview.jpg. */
export function merchPreviewUrl(id: MarketingMerchId): string {
  return `${MERCH_PATH}/${id}-preview.jpg`;
}

/** The saved file's name: queerpulse-team-tee-front.png. */
export function merchDownloadName(
  id: MarketingMerchId,
  file: MerchFileId,
): string {
  return `queerpulse-${id}${FILE_SUFFIXES[file]}`;
}
