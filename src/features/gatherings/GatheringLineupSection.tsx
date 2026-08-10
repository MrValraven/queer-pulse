import { GatheringLineupEditor } from "./GatheringLineupEditor";
import { GatheringPerformerNudge } from "./GatheringPerformerNudge";
import type { GatheringDetail } from "./data";

/**
 * Composes the two Moment-5 pieces onto the gathering detail page in one
 * mount point: the post-gathering persona nudge (any viewer on the bill,
 * self-gates on ended/kind/dismissal) and the host/co-host-only lineup
 * editor. Kept as its own tiny component so `GatheringPage` only grows by an
 * import + one render call, staying under the 200-line cap.
 */
export function GatheringLineupSection({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  return (
    <>
      <GatheringPerformerNudge gathering={gathering} />
      {gathering.viewerIsOrganizer && (
        <GatheringLineupEditor slug={gathering.slug} />
      )}
    </>
  );
}
