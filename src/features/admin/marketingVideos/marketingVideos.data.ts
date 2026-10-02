/**
 * The marketing films the admin can preview and render. Each one is a
 * standalone HTML composition in public/marketing-videos/ (<id>.html, its
 * <id>.scene.js and <id>.score.js); the film itself is the source of truth for
 * its timing and look, this registry only says what the dashboard shows.
 *
 * Static on purpose, in demo and live mode alike: the films ship with the
 * site, there is no API behind them. To add one, drop its three files next to
 * the others (see scripts/launch-video/README.md) and add an entry here.
 */
export type MarketingVideoId = "cinematic" | "upbeat" | "pro";

export interface MarketingVideo {
  id: MarketingVideoId;
  /** Length in seconds; must match the film's window.DURATION. */
  durationSeconds: number;
  /** The card's still: a frame that sums the film up, so the cards differ. */
  posterSeconds: number;
  /** Rendered with motion blur (window.SHUTTER > 1), so it records slower. */
  hasMotionBlur: boolean;
}

export const MARKETING_VIDEOS: readonly MarketingVideo[] = [
  {
    id: "cinematic",
    durationSeconds: 64.8,
    posterSeconds: 52,
    hasMotionBlur: false,
  },
  {
    id: "upbeat",
    durationSeconds: 48,
    posterSeconds: 2.8,
    hasMotionBlur: false,
  },
  { id: "pro", durationSeconds: 48, posterSeconds: 13.3, hasMotionBlur: true },
];

const FILMS_PATH = "/marketing-videos";

export const filmUrl = (id: MarketingVideoId, seconds?: number) =>
  `${FILMS_PATH}/${id}.html${seconds === undefined ? "" : `?t=${seconds}`}`;

export const scoreUrl = (id: MarketingVideoId) =>
  `${FILMS_PATH}/${id}.score.js`;

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
