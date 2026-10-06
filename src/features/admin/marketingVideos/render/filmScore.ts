import { composeScore, filmIn, iframeLoaded } from "./filmWindow";

/** Composed scores for this session, keyed by score URL. */
const scores = new Map<string, Promise<AudioBuffer>>();

/**
 * Loads the film into a hidden frame of its own, composes its score there,
 * and removes the frame once the score has settled. Chrome blocks the whole
 * page when a frame is removed while its OfflineAudioContext is still
 * rendering, so the score is composed in a frame no modal can unmount. The
 * frame stays laid out offscreen so the film's fonts and images load as
 * they do on screen.
 */
async function composeInHiddenFrame(
  filmSrc: string,
  scoreSrc: string,
): Promise<AudioBuffer> {
  const iframe = document.createElement("iframe");
  iframe.src = filmSrc;
  iframe.tabIndex = -1;
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none";
  // Listen before appending, so the load event cannot be missed.
  const loaded = iframeLoaded(iframe);
  document.body.appendChild(iframe);
  try {
    await loaded;
    return await composeScore(await filmIn(iframe), scoreSrc);
  } finally {
    iframe.remove();
  }
}

/**
 * The film's score as an AudioBuffer, composed once and kept for the
 * session, so reopening a preview or rendering after a preview has the
 * sound at once. A failed score is forgotten so the next request retries.
 */
export function filmScore(
  filmSrc: string,
  scoreSrc: string,
): Promise<AudioBuffer> {
  const cached = scores.get(scoreSrc);
  if (cached) return cached;
  const score = composeInHiddenFrame(filmSrc, scoreSrc);
  scores.set(scoreSrc, score);
  score.catch(() => {
    if (scores.get(scoreSrc) === score) scores.delete(scoreSrc);
  });
  return score;
}
