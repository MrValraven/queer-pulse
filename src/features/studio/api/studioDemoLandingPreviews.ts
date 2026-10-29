import { ApiError } from "../../../shared/api/client";
import { ALBUM_COVER } from "../studioAlbum.data";
import {
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
} from "./studioDemoMe.data";
import type { StudioErrorCode } from "./studio.types";
import type {
  StudioLandingPreviewOwnerItemDTO,
  StudioLandingPreviewOwnerListDTO,
} from "./studioLanding.types";
import type { StudioLandingPreviewAction } from "./studioLandingPreviews.api";

// Demo mirror of the owner preview approvals (contract section 10, delta 11).
// Mariana Sol, the demo member's music persona, holds one pending request and
// one approved preview; Late Bloomers (a podcaster) lists nothing, so the
// card hides there.

export const DEMO_PENDING_ID = "demo-landing-preview-pending";
export const DEMO_APPROVED_ID = "demo-landing-preview-approved";

const DEMO_REQUESTED_AT = "2026-10-26T09:30:00.000Z";
const DEMO_DECIDED_AT = "2026-10-20T16:10:00.000Z";

function seedItems(): StudioLandingPreviewOwnerItemDTO[] {
  const release = {
    id: DEMO_DEFAULT_RELEASE_ID,
    title: "Cidade dos santos",
    coverUrl: ALBUM_COVER,
  };
  const base = {
    relation: "main",
    release,
    mainArtist: DEMO_ARTIST_MARIANA,
    isEligible: true,
  };
  return [
    {
      ...base,
      id: DEMO_PENDING_ID,
      status: "pending",
      track: {
        id: "demo-landing-track-planicie",
        title: "Planície",
        durationSeconds: 238,
      },
      requestedAt: DEMO_REQUESTED_AT,
      decidedAt: null,
      canApprove: true,
      canDecline: true,
      canWithdraw: false,
    },
    {
      ...base,
      id: DEMO_APPROVED_ID,
      status: "approved",
      track: {
        id: "demo-landing-track-vela-acesa",
        title: "Vela acesa",
        durationSeconds: 217,
      },
      requestedAt: "2026-10-18T11:00:00.000Z",
      decidedAt: DEMO_DECIDED_AT,
      canApprove: false,
      canDecline: false,
      canWithdraw: true,
    },
  ];
}

let store: Record<string, StudioLandingPreviewOwnerItemDTO[]> = {
  [DEMO_ARTIST_MARIANA.id]: seedItems(),
};

export function resetDemoStudioLandingPreviewsForTests(): void {
  store = { [DEMO_ARTIST_MARIANA.id]: seedItems() };
}

/** An `ApiError` shaped as the server's refusal, so the card reads it through
 *  the same path as a live one. */
function refusal(status: 403 | 404 | 409, code: StudioErrorCode): ApiError {
  const message = status === 404 ? "Not Found" : "Conflict";
  return new ApiError(status, message, { statusCode: status, code, message });
}

/** Pending first (oldest request first), then approved (newest first). */
function listOf(subprofileId: string): StudioLandingPreviewOwnerItemDTO[] {
  const rows = store[subprofileId] ?? [];
  const pending = rows
    .filter((row) => row.status === "pending")
    .sort((left, right) => left.requestedAt.localeCompare(right.requestedAt));
  const approved = rows
    .filter((row) => row.status === "approved")
    .sort((left, right) =>
      (right.decidedAt ?? "").localeCompare(left.decidedAt ?? ""),
    );
  return [...pending, ...approved];
}

/** GET /studio/artists/:id/landing-previews in the demo. */
export function demoStudioLandingPreviews(
  subprofileId: string,
): StudioLandingPreviewOwnerListDTO {
  return { items: listOf(subprofileId).map((row) => ({ ...row })) };
}

const STATUS_AFTER: Record<
  StudioLandingPreviewAction,
  StudioLandingPreviewOwnerItemDTO["status"]
> = { approve: "approved", decline: "declined", withdraw: "withdrawn" };

/** POST .../:previewId/approve|decline|withdraw in the demo. */
export function demoActOnStudioLandingPreview(
  subprofileId: string,
  previewId: string,
  action: StudioLandingPreviewAction,
): StudioLandingPreviewOwnerItemDTO {
  // A row answered earlier stays linked to the persona and reads as a 409; the
  // 404 belongs to a row the persona cannot see.
  const row = (store[subprofileId] ?? []).find(
    (entry) => entry.id === previewId,
  );
  if (!row) throw refusal(404, "studio_landing_preview_not_found");
  if (action === "withdraw") {
    if (row.status !== "approved") {
      throw refusal(409, "studio_landing_preview_not_approved");
    }
  } else {
    if (row.relation !== "main") {
      throw refusal(403, "studio_landing_preview_main_persona_only");
    }
    if (row.status !== "pending") {
      throw refusal(409, "studio_landing_preview_not_pending");
    }
  }
  const answered: StudioLandingPreviewOwnerItemDTO = {
    ...row,
    status: STATUS_AFTER[action],
    decidedAt: new Date().toISOString(),
    canApprove: false,
    canDecline: false,
    canWithdraw: action === "approve",
  };
  store[subprofileId] = (store[subprofileId] ?? []).map((entry) =>
    entry.id === previewId ? answered : entry,
  );
  return { ...answered };
}
