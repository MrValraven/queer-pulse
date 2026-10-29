import type { ImageSlotTint } from "../../../shared/components/ui";
import { tintForId, toArtistRefView } from "./studio.adapters";
import type { StudioArtistRefView } from "./studio.adapters";
import type {
  StudioLandingPreviewOwnerItemDTO,
  StudioLandingPreviewOwnerListDTO,
} from "./studioLanding.types";

export type StudioLandingPreviewStatus =
  "pending" | "approved" | "declined" | "withdrawn";
export type StudioLandingPreviewRelation = "main" | "credited";

export interface StudioLandingPreviewOwnerView {
  id: string;
  status: StudioLandingPreviewStatus;
  relation: StudioLandingPreviewRelation;
  trackTitle: string;
  releaseTitle: string;
  coverUrl: string | null;
  coverTint: ImageSlotTint;
  mainArtist: StudioArtistRefView;
  requestedAt: Date;
  decidedAt: Date | null;
  isEligible: boolean;
  canApprove: boolean;
  canDecline: boolean;
  canWithdraw: boolean;
}

const STATUSES: readonly StudioLandingPreviewStatus[] = [
  "pending",
  "approved",
  "declined",
  "withdrawn",
];
const RELATIONS: readonly StudioLandingPreviewRelation[] = ["main", "credited"];

function statusOf(value: string): StudioLandingPreviewStatus | null {
  return STATUSES.find((status) => status === value) ?? null;
}

function relationOf(value: string): StudioLandingPreviewRelation | null {
  return RELATIONS.find((relation) => relation === value) ?? null;
}

/** One owner row. The server's flags pass through untouched: this client never
 *  works out what a persona may do. Null for a status or relation this client
 *  does not know (the row is left out). */
export function toLandingPreviewOwnerView(
  dto: StudioLandingPreviewOwnerItemDTO,
): StudioLandingPreviewOwnerView | null {
  const status = statusOf(dto.status);
  const relation = relationOf(dto.relation);
  if (!status || !relation) return null;
  return {
    id: dto.id,
    status,
    relation,
    trackTitle: dto.track.title,
    releaseTitle: dto.release.title,
    coverUrl: dto.release.coverUrl,
    coverTint: tintForId(dto.release.id),
    mainArtist: toArtistRefView(dto.mainArtist),
    requestedAt: new Date(dto.requestedAt),
    decidedAt: dto.decidedAt === null ? null : new Date(dto.decidedAt),
    isEligible: dto.isEligible,
    canApprove: dto.canApprove,
    canDecline: dto.canDecline,
    canWithdraw: dto.canWithdraw,
  };
}

export function toLandingPreviewOwnerViews(
  dto: StudioLandingPreviewOwnerListDTO,
): StudioLandingPreviewOwnerView[] {
  return dto.items.flatMap((item) => {
    const view = toLandingPreviewOwnerView(item);
    return view ? [view] : [];
  });
}
