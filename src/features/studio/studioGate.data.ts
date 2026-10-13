import { routes } from "../../app/routeMap";

/**
 * Studio pages that stay demo-only in v1 (spec section 2). A granted member
 * who opens one in a live build lands on Studio home. Money, live sets,
 * governance, the library, the dashboard, Studio's own settings and
 * notifications, and the co-op's information pages (they describe the
 * payout model, which v1 does not run).
 */
export const STUDIO_DEFERRED_PATHS: readonly string[] = [
  routes.studioDashboard,
  routes.studioPayouts,
  routes.studioLive,
  routes.studioCollection,
  routes.studioSet,
  routes.studioLibrary,
  routes.studioCheckout,
  routes.studioSheetStore,
  "/studio/solidarity-fund",
  routes.studioCalls,
  routes.studioSetSubmission,
  routes.studioCouncil,
  routes.studioTriage,
  routes.studioFlagReview,
  "/studio/off-air",
  "/studio/sign-in",
  routes.studioSettings,
  routes.studioAbout,
  routes.studioAccessibility,
  routes.studioTerms,
  routes.studioHelp,
  routes.studioPress,
  routes.studioEndCard,
  routes.studioNotifications,
  routes.studioReceipt,
  routes.studioRights,
  routes.studioProgram,
  routes.studioBroadcast,
  routes.studioWelcome,
  routes.studioWithdrawn,
];
