import type { StudioReleaseView } from "./studio.adapters";
import { demoRecordDispute } from "./studioDemoFlagReview";

let demoSequence = 0;

/** The demo answers a dispute the way the server does: the whole owner
 *  release back, its dispute open with no reply yet, and no other dispute
 *  possible until our team decides. The dispute joins the demo's staff
 *  Disputes queue too, so flag review can decide it. */
export function demoFileDispute(
  release: StudioReleaseView,
  note: string,
): StudioReleaseView {
  demoSequence += 1;
  const filed: StudioReleaseView = {
    ...release,
    dispute: {
      id: `demo-dispute-${Date.now()}-${demoSequence}`,
      status: "open",
      note,
      staffReply: null,
      createdAt: new Date().toISOString(),
      decidedAt: null,
    },
    canDispute: false,
  };
  demoRecordDispute(filed, note);
  return filed;
}
