import type { StudioPlayerValue } from "./studioPlayerContext";

/** Seeks the current track and plays on from there: a paused track
 *  resumes, a playing one keeps playing. "Play from this line" and a
 *  lyric card on the current track both start here. */
export function studioSeekAndResume(
  player: Pick<StudioPlayerValue, "seek" | "togglePlay" | "status">,
  seconds: number,
): void {
  player.seek(seconds);
  if (player.status === "paused") player.togglePlay();
}
