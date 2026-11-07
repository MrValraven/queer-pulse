/**
 * The clips of the shown pack that a projector screen could not load, in
 * pack order, each with the reason the screens reported (null when no
 * screen named one).
 */
import type {
  VjClipDTO,
  VjPreloadFailure,
} from "../../../../shared/contracts/vj";
import type { VjClipReadiness } from "../../live/vjScreensSummary";

export interface VjFailedClip {
  clip: VjClipDTO;
  failure: VjPreloadFailure | null;
}

export function vjFailedClipsOf(
  clips: readonly VjClipDTO[],
  readinessOf: (clipId: string) => VjClipReadiness,
): VjFailedClip[] {
  const failedClips: VjFailedClip[] = [];
  for (const clip of clips) {
    const readiness = readinessOf(clip.id);
    if (readiness.state === "failed") {
      failedClips.push({ clip, failure: readiness.failure });
    }
  }
  return failedClips;
}

/** The `vj:` key of the line that names why a clip failed and what to do. */
export function vjFailureReasonKeyOf(failure: VjPreloadFailure | null): string {
  return failure === null
    ? "vj:remote.failures.unknownReason"
    : `vj:preload.failure.${failure}`;
}
