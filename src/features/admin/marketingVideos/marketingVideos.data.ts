/**
 * The marketing films the admin can preview and render. Each one is a
 * standalone HTML composition in public/marketing-videos/ (<id>.html, its
 * <id>.scene.js and <id>.score.js); the film itself is the source of truth for
 * its timing and look, this registry only says what the dashboard shows.
 * Each film also ships its score pre-rendered, <id>.score.<hash>.m4a, which
 * the preview plays at once; `pnpm film-scores` writes it after any edit to
 * the film's score.js or scene.js (see render/previewScore.ts).
 *
 * Static on purpose, in demo and live mode alike: the films ship with the
 * site, there is no API behind them. To add one, drop its three files next to
 * the others (see scripts/launch-video/README.md), add an entry here and to
 * ALL_VIDEOS in scripts/launch-video/render.mjs, and run `pnpm film-scores`.
 */
export type MarketingVideoId = "cinematic" | "upbeat" | "pro" | "vouch";

/**
 * The shapes a film can render in. `landscape` is every film's 16:9 cut;
 * `portrait` is a 4:5 Instagram feed post, which a film offers when its
 * page answers `?format=portrait` (it then reports window.FORMAT).
 */
export type FilmFormatId = "landscape" | "portrait";

export interface FilmSize {
  width: number;
  height: number;
}

export const FILM_FORMATS: Readonly<Record<FilmFormatId, FilmSize>> = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1350 },
};

export interface MarketingVideo {
  id: MarketingVideoId;
  /** Length in seconds; must match the film's window.DURATION. */
  durationSeconds: number;
  /** The card's still: a frame that sums the film up, so the cards differ. */
  posterSeconds: number;
  /** Rendered with motion blur (window.SHUTTER > 1), so it records slower. */
  hasMotionBlur: boolean;
  /** The shapes it renders in; the first is the default. */
  formats: readonly FilmFormatId[];
}

export const MARKETING_VIDEOS: readonly MarketingVideo[] = [
  {
    id: "cinematic",
    durationSeconds: 64.8,
    posterSeconds: 52,
    hasMotionBlur: false,
    formats: ["landscape"],
  },
  {
    id: "upbeat",
    durationSeconds: 48,
    posterSeconds: 2.8,
    hasMotionBlur: false,
    formats: ["landscape"],
  },
  {
    id: "pro",
    durationSeconds: 62,
    posterSeconds: 13.3,
    hasMotionBlur: true,
    formats: ["landscape", "portrait"],
  },
  {
    id: "vouch",
    durationSeconds: 56,
    posterSeconds: 15,
    hasMotionBlur: true,
    formats: ["landscape"],
  },
];

const FILMS_PATH = "/marketing-videos";

/**
 * The film's page. `seconds` opens it paused on that frame; `format` picks its
 * shape. Landscape is the page's own default, so it adds no parameter and the
 * plain URL stays the 16:9 film.
 */
export function filmUrl(
  id: MarketingVideoId,
  {
    seconds,
    format = "landscape",
  }: { seconds?: number; format?: FilmFormatId } = {},
): string {
  const params = new URLSearchParams();
  if (format !== "landscape") params.set("format", format);
  if (seconds !== undefined) params.set("t", String(seconds));
  const query = params.toString();
  return `${FILMS_PATH}/${id}.html${query ? `?${query}` : ""}`;
}

/** The rendered file's name: queerpulse-pro.mp4, queerpulse-pro-portrait.mp4. */
export function filmFileName(
  id: MarketingVideoId,
  format: FilmFormatId,
  extension: string,
): string {
  const formatSuffix = format === "landscape" ? "" : `-${format}`;
  return `queerpulse-${id}${formatSuffix}.${extension}`;
}

export const scoreUrl = (id: MarketingVideoId) =>
  `${FILMS_PATH}/${id}.score.js`;

export const sceneUrl = (id: MarketingVideoId) =>
  `${FILMS_PATH}/${id}.scene.js`;

/** The score pre-rendered for the preview; `hash` is its content hash. */
export const preRenderedScoreUrl = (id: MarketingVideoId, hash: string) =>
  `${FILMS_PATH}/${id}.score.${hash}.m4a`;

/** Sub-frames a motion-blurred film averages per frame (its window.SHUTTER). */
const MOTION_BLUR_SUB_FRAMES = 4;
/** Capture steps a typical laptop records per second (two to three paints each). */
const STEPS_PER_SECOND = 25;
/** Composing the score and finishing the file. */
const OVERHEAD_SECONDS = 20;

/** Rough minutes a render takes on a typical laptop, rounded up. */
export function estimatedRenderMinutes(video: MarketingVideo): number {
  const steps =
    video.durationSeconds *
    30 *
    (video.hasMotionBlur ? MOTION_BLUR_SUB_FRAMES : 1);
  return Math.ceil((steps / STEPS_PER_SECOND + OVERHEAD_SECONDS) / 60);
}
