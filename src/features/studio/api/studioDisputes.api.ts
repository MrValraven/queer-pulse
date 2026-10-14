import { apiPost } from "../../../shared/api/client";
import type { CreateStudioDisputeBody, StudioReleaseDTO } from "./studio.types";

/** POST /studio/releases/:id/disputes: an owner's note to our team about a
 *  takedown. 201 with the whole owner release (dispute open, canDispute
 *  false). Refusals carry `studio_release_not_taken_down`,
 *  `studio_dispute_already_open` or `studio_dispute_limit_reached`; 429 past
 *  5 filings in 5 minutes. */
export const createStudioReleaseDispute = (
  releaseId: string,
  body: CreateStudioDisputeBody,
) =>
  apiPost<StudioReleaseDTO>(
    `/studio/releases/${encodeURIComponent(releaseId)}/disputes`,
    body,
  );
