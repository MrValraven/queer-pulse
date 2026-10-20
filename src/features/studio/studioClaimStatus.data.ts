import type { IconType } from "react-icons";
import {
  FiCheckCircle,
  FiClock,
  FiCloudOff,
  FiCornerUpLeft,
  FiMessageSquare,
  FiPauseCircle,
  FiShield,
  FiXCircle,
} from "react-icons/fi";
import {
  STUDIO_CLAIM_LIVE_STATUSES,
  STUDIO_CLAIM_STATUSES,
  type StudioClaimStatus,
} from "./api/studioSafety.types";

/** Who reads the chip: the member who filed the claim, the artist whose
 *  track it is about, or our team. Each one gets wording for their side. */
export type StudioClaimViewpoint = "claimant" | "owner" | "staff";

type ClaimStatusLook = { icon: IconType; labelKey: string };
export type ClaimStatusChip = ClaimStatusLook & { isOpen: boolean };

const CLAIMANT_LOOK: Record<StudioClaimStatus, ClaimStatusLook> = {
  submitted: { icon: FiClock, labelKey: "studio:claims.mine.status.submitted" },
  accepted: {
    icon: FiPauseCircle,
    labelKey: "studio:claims.mine.status.accepted",
  },
  declined: { icon: FiXCircle, labelKey: "studio:claims.mine.status.declined" },
  countered: {
    icon: FiMessageSquare,
    labelKey: "studio:claims.mine.status.countered",
  },
  upheld: { icon: FiShield, labelKey: "studio:claims.mine.status.upheld" },
  // A rejected claim went against the member who filed it, so no tick.
  rejected: { icon: FiXCircle, labelKey: "studio:claims.mine.status.rejected" },
  withdrawn: {
    icon: FiCornerUpLeft,
    labelKey: "studio:claims.mine.status.withdrawn",
  },
};

// The artist only ever sees the four statuses after our team accepts a
// claim; the other three keep the claimant's look so the record stays full.
const OWNER_LOOK: Record<StudioClaimStatus, ClaimStatusLook> = {
  ...CLAIMANT_LOOK,
  accepted: {
    icon: FiCloudOff,
    labelKey: "studio:claims.ownerStatus.accepted",
  },
  countered: {
    icon: FiMessageSquare,
    labelKey: "studio:claims.ownerStatus.countered",
  },
  upheld: { icon: FiShield, labelKey: "studio:claims.ownerStatus.upheld" },
  rejected: {
    icon: FiCheckCircle,
    labelKey: "studio:claims.ownerStatus.rejected",
  },
};

const STAFF_LOOK: Record<StudioClaimStatus, ClaimStatusLook> = {
  submitted: { icon: FiClock, labelKey: "studio:claims.staffStatus.submitted" },
  accepted: {
    icon: FiPauseCircle,
    labelKey: "studio:claims.staffStatus.accepted",
  },
  declined: {
    icon: FiXCircle,
    labelKey: "studio:claims.staffStatus.declined",
  },
  countered: {
    icon: FiMessageSquare,
    labelKey: "studio:claims.staffStatus.countered",
  },
  upheld: { icon: FiShield, labelKey: "studio:claims.staffStatus.upheld" },
  rejected: {
    icon: FiXCircle,
    labelKey: "studio:claims.staffStatus.rejected",
  },
  withdrawn: {
    icon: FiCornerUpLeft,
    labelKey: "studio:claims.staffStatus.withdrawn",
  },
};

const LOOK_BY_VIEWPOINT: Record<
  StudioClaimViewpoint,
  Record<StudioClaimStatus, ClaimStatusLook>
> = { claimant: CLAIMANT_LOOK, owner: OWNER_LOOK, staff: STAFF_LOOK };

/** The chip for one claim status as one side reads it. `isOpen` marks the
 *  live statuses, the same on every side. */
export function claimStatusChipFor(
  status: StudioClaimStatus,
  viewpoint: StudioClaimViewpoint,
): ClaimStatusChip {
  return {
    ...LOOK_BY_VIEWPOINT[viewpoint][status],
    isOpen: STUDIO_CLAIM_LIVE_STATUSES.includes(status),
  };
}

/** The catalog key of a status label as one side reads it, for a card
 *  that shows the label without the chip. */
export function claimStatusLabelKeyFor(
  status: StudioClaimStatus,
  viewpoint: StudioClaimViewpoint,
): string {
  return LOOK_BY_VIEWPOINT[viewpoint][status].labelKey;
}

/** The claimant's chips, kept for callers that read the map directly. New
 *  callers use `claimStatusChipFor` with their viewpoint. */
export const CLAIM_STATUS_CHIP = Object.fromEntries(
  STUDIO_CLAIM_STATUSES.map((status) => [
    status,
    claimStatusChipFor(status, "claimant"),
  ]),
) as Record<StudioClaimStatus, ClaimStatusChip>;
