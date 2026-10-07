import {
  filmUrl,
  preRenderedScoreUrl,
  sceneUrl,
  scoreUrl,
  type MarketingVideoId,
} from "../marketingVideos.data";
import { filmScore } from "./filmScore";
import { decodeScore } from "./filmWindow";

/** Preview scores for this session, keyed by film. */
const previewScores = new Map<MarketingVideoId, Promise<AudioBuffer>>();

/** No pre-rendered score matches the film's current score and scene. */
class MissingScoreFileError extends Error {
  override name = "MissingScoreFileError";
}

async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}.`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * The content hash in a pre-rendered score's file name: the first 12 hex
 * characters of SHA-256 over the exact bytes of <id>.score.js followed by the
 * exact bytes of <id>.scene.js. The score reads window.CUES, which the scene
 * defines, so editing either file changes the hash. scripts/launch-video/
 * render.mjs (scoreHash) computes the same recipe when it writes the file;
 * keep the two identical.
 */
async function scoreHash(id: MarketingVideoId): Promise<string> {
  const [scoreBytes, sceneBytes] = await Promise.all([
    fetchBytes(scoreUrl(id)),
    fetchBytes(sceneUrl(id)),
  ]);
  const combined = new Uint8Array(scoreBytes.length + sceneBytes.length);
  combined.set(scoreBytes);
  combined.set(sceneBytes, scoreBytes.length);
  const digest = await crypto.subtle.digest("SHA-256", combined);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  )
    .join("")
    .slice(0, 12);
}

/**
 * The pre-rendered score, decoded. The host answers a missing file with the
 * app's HTML and status 200, so only an audio response counts as found.
 */
async function loadPreRenderedScore(
  id: MarketingVideoId,
): Promise<AudioBuffer> {
  const url = preRenderedScoreUrl(id, await scoreHash(id));
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.startsWith("audio/")) {
    throw new MissingScoreFileError(`${url} is missing or stale.`);
  }
  return decodeScore(await response.arrayBuffer());
}

/**
 * The film's score for the preview: the pre-rendered file shipped next to
 * the film, which plays at once. When that file is missing, stale or cannot
 * be decoded (or this browser cannot hash it), the score is synthesised as
 * the render does, through filmScore. Kept for the session; a failed score is
 * forgotten so the next request retries. The pre-rendered buffer stays out of
 * filmScore's cache, so a render always synthesises its lossless master.
 */
export function previewScore(id: MarketingVideoId): Promise<AudioBuffer> {
  const cached = previewScores.get(id);
  if (cached) return cached;
  const score = loadPreRenderedScore(id).catch((error: unknown) => {
    if (import.meta.env.DEV && error instanceof MissingScoreFileError) {
      console.warn(
        `${error.message} Synthesising the ${id} score; run \`pnpm film-scores\` to refresh the pre-rendered scores.`,
      );
    }
    return filmScore(filmUrl(id), scoreUrl(id));
  });
  previewScores.set(id, score);
  score.catch(() => {
    if (previewScores.get(id) === score) previewScores.delete(id);
  });
  return score;
}
