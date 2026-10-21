import { routes } from "../../app/routeMap";

/**
 * Studio pages that stay demo-only (spec v1 section 2, v2 section 8, open
 * pages section 8). A granted member who opens one in a live build lands on
 * Studio home: money, live sets, governance (council, triage), Studio's own
 * notifications and the co-op's press, end-card, receipt, programme and
 * broadcast pages. The open pages opened Help, About, Terms,
 * Accessibility, Rights, Withdrawn, Settings and Flag review. Studio v3 opened the press kit.
 * The welcome is a sheet on Studio home in both modes now (StudioFirstRun),
 * and /studio/welcome opens it.
 */
export const STUDIO_DEFERRED_PATHS: readonly string[] = [
  routes.studioPayouts,
  routes.studioLive,
  routes.studioSet,
  routes.studioCheckout,
  routes.studioSheetStore,
  routes.studioSetSubmission,
  routes.studioCouncil,
  routes.studioTriage,
  "/studio/off-air",
  "/studio/sign-in",
  routes.studioEndCard,
  routes.studioNotifications,
  routes.studioReceipt,
  routes.studioProgram,
  routes.studioBroadcast,
];
