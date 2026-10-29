import { apiGet, apiPost } from "../../../shared/api/client";
import type {
  StudioLandingPreviewOwnerItemDTO,
  StudioLandingPreviewOwnerListDTO,
} from "./studioLanding.types";

// The artist dashboard's preview approvals (QUEERPULSE-STUDIO-LANDING-V2-CONTRACT-2026-10-28.md,
// section 10): which tracks our team asked to play on the public Studio page,
// and the owner's answer to each.

export type StudioLandingPreviewAction = "approve" | "decline" | "withdraw";

const segment = (id: string) => encodeURIComponent(id);

/** GET /studio/artists/:subprofileId/landing-previews, pending first. A
 *  persona outside the artist kinds answers `{ items: [] }`. */
export const getStudioLandingPreviews = (subprofileId: string) =>
  apiGet<StudioLandingPreviewOwnerListDTO>(
    `/studio/artists/${segment(subprofileId)}/landing-previews`,
  );

/** POST .../landing-previews/:previewId/approve|decline|withdraw. No body; the
 *  answer is the row with its new status. */
export const actOnStudioLandingPreview = (
  subprofileId: string,
  previewId: string,
  action: StudioLandingPreviewAction,
) =>
  apiPost<StudioLandingPreviewOwnerItemDTO>(
    `/studio/artists/${segment(subprofileId)}/landing-previews/${segment(previewId)}/${action}`,
  );
