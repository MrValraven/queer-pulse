import { routes } from "../../app/routeMap";

/**
 * Studio pages that stay demo-only (spec v1 section 2, v2 section 8). A
 * granted member who opens one in a live build lands on Studio home: money,
 * live sets, governance (council, triage, flag review), Studio's own
 * settings and notifications, and the co-op's information pages. Studio v2
 * opened the library, the playlist page, the dashboard, open calls and the
 * solidarity page.
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
