import type { RoadmapDeclineReason } from "../../api/roadmapAdmin.types";

export interface RoadmapDeclineReasonOption {
  key: RoadmapDeclineReason;
  /** i18n key for the radio-row label the admin picks from. */
  labelKey: string;
  /** i18n key for the suggested public wording — pre-fills the textarea when
   *  this reason is selected (the admin can still edit it before confirming). */
  wordingKey: string;
}

/**
 * The 5 reasons an idea can be declined, each pointing at the matching
 * `admin:roadmap.modals.decline.reason.<key>.{label,wording}` pair already
 * in the i18n catalog. Colocated as static data (not inline in
 * `DeclineModal.tsx`) so the reason list — order, copy keys — has one home.
 */
export const DECLINE_REASONS: RoadmapDeclineReasonOption[] = [
  {
    key: "scope",
    labelKey: "admin:roadmap.modals.decline.reason.scope.label",
    wordingKey: "admin:roadmap.modals.decline.reason.scope.wording",
  },
  {
    key: "unsafe",
    labelKey: "admin:roadmap.modals.decline.reason.unsafe.label",
    wordingKey: "admin:roadmap.modals.decline.reason.unsafe.wording",
  },
  {
    key: "capacity",
    labelKey: "admin:roadmap.modals.decline.reason.capacity.label",
    wordingKey: "admin:roadmap.modals.decline.reason.capacity.wording",
  },
  {
    key: "exists",
    labelKey: "admin:roadmap.modals.decline.reason.exists.label",
    wordingKey: "admin:roadmap.modals.decline.reason.exists.wording",
  },
  {
    key: "harm",
    labelKey: "admin:roadmap.modals.decline.reason.harm.label",
    wordingKey: "admin:roadmap.modals.decline.reason.harm.wording",
  },
];
