import type { StudioLandingPreviewAction } from "./api/studioLandingPreviews.api";

/** Catalog keys the preview approvals card speaks with. */
export type ConfirmedAction = Exclude<StudioLandingPreviewAction, "decline">;

export const DONE_KEY = {
  approve: "studio:landingPreviews.approved",
  decline: "studio:landingPreviews.declined",
  withdraw: "studio:landingPreviews.withdrawn",
} as const satisfies Record<StudioLandingPreviewAction, string>;

export const FAILED_KEY = {
  approve: "studio:landingPreviews.approveFailed",
  decline: "studio:landingPreviews.declineFailed",
  withdraw: "studio:landingPreviews.withdrawFailed",
} as const satisfies Record<StudioLandingPreviewAction, string>;

export const CONFIRM_KEYS = {
  approve: {
    title: "studio:landingPreviews.approveConfirm.title",
    body: "studio:landingPreviews.approveConfirm.body",
    confirm: "studio:landingPreviews.approveCta",
  },
  withdraw: {
    title: "studio:landingPreviews.withdrawConfirm.title",
    body: "studio:landingPreviews.withdrawConfirm.body",
    confirm: "studio:landingPreviews.withdrawCta",
  },
} as const satisfies Record<
  ConfirmedAction,
  { title: string; body: string; confirm: string }
>;
