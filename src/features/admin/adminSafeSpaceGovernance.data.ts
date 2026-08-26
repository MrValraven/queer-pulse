import type {
  AdminFlagState,
  AdminNominationScope,
  SafeSpaceFlagReason,
  SafeSpaceNominationStatus,
} from "../safety/api/safeSpaceGovernance.api";

/**
 * Static option sets for the safe-space governance consoles. Values are the
 * canonical codes the API filters on and are never translated; the label keys
 * resolve at render, so switching language cannot corrupt a stored filter.
 */

export const NOMINATION_SCOPE_OPTIONS: {
  value: AdminNominationScope;
  labelKey: string;
}[] = [
  { value: "open", labelKey: "safety:governance.scope.open" },
  { value: "decided", labelKey: "safety:governance.scope.decided" },
  { value: "all", labelKey: "safety:governance.scope.all" },
];

export const NOMINATION_STATUS_LABEL_KEY: Record<
  SafeSpaceNominationStatus,
  string
> = {
  pending: "safety:governance.status.pending",
  acknowledged: "safety:governance.status.acknowledged",
  in_review: "safety:governance.status.in_review",
  approved: "safety:governance.status.approved",
  rejected: "safety:governance.status.rejected",
};

export const FLAG_STATE_OPTIONS: {
  value: AdminFlagState;
  labelKey: string;
}[] = [
  { value: "open", labelKey: "safety:governance.flagState.open" },
  { value: "resolved", labelKey: "safety:governance.flagState.resolved" },
  { value: "all", labelKey: "safety:governance.flagState.all" },
];

export const FLAG_REASON_LABEL_KEY: Record<SafeSpaceFlagReason, string> = {
  not_safe: "safety:flag.reason.not_safe.label",
  discrimination: "safety:flag.reason.discrimination.label",
  staff_conduct: "safety:flag.reason.staff_conduct.label",
  accessibility: "safety:flag.reason.accessibility.label",
  closed_or_changed: "safety:flag.reason.closed_or_changed.label",
  other: "safety:flag.reason.other.label",
};

/** The trust tiers a decision can award, mirroring `listings.safe_space_tier`. */
export const SAFE_SPACE_TIERS = [1, 2, 3];
