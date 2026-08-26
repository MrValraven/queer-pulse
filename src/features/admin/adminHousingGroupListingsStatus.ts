import { FiCheck, FiCornerUpLeft, FiHelpCircle, FiSlash } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { ButtonVariant } from "../../shared/components/ui";
import type { GroupListingStatus } from "./api/adminHousingGroupListings.api";

/**
 * What each review decision looks like, and whether the poster is owed a
 * sentence.
 *
 * `question` and `declined` both require one because both are refusals of a
 * kind: one asks the poster to come back with something, the other tells them
 * the room is never going up. The backend rejects either without a reason, and
 * the reason is the entire message the member receives.
 */
export const DECISION_META: Record<
  GroupListingStatus,
  { labelKey: string; icon: IconType; isReasonRequired: boolean }
> = {
  live: {
    labelKey: "admin:groupListingQueue.decide.publish",
    icon: FiCheck,
    isReasonRequired: false,
  },
  question: {
    labelKey: "admin:groupListingQueue.decide.question",
    icon: FiHelpCircle,
    isReasonRequired: true,
  },
  declined: {
    labelKey: "admin:groupListingQueue.decide.decline",
    icon: FiSlash,
    isReasonRequired: true,
  },
  review: {
    labelKey: "admin:groupListingQueue.decide.reopen",
    icon: FiCornerUpLeft,
    isReasonRequired: false,
  },
};

export const DECISION_VARIANT: Record<GroupListingStatus, ButtonVariant> = {
  live: "jade",
  question: "ghost",
  declined: "danger",
  review: "ghost",
};

/**
 * Which decisions a listing in each state can move to.
 *
 * A `live` listing has none here on purpose: pulling a published room down is
 * the norm takedown (`hidden`), a different decision on a different control,
 * and collapsing the two would let a moderator refuse a listing the community
 * has already seen without anyone recording that it was ever up.
 */
const ALLOWED_DECISIONS: Record<GroupListingStatus, GroupListingStatus[]> = {
  review: ["live", "question", "declined"],
  question: ["live", "declined"],
  live: [],
  declined: ["live", "review"],
};

export function allowedDecisions(
  status: GroupListingStatus,
): GroupListingStatus[] {
  return ALLOWED_DECISIONS[status];
}
