import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const StudioPage = lazyNamed(() => import("./StudioPage"), "StudioPage");
const StudioAlbumPage = lazyNamed(
  () => import("./StudioAlbumPage"),
  "StudioAlbumPage",
);
const StudioArtistPage = lazyNamed(
  () => import("./StudioArtistPage"),
  "StudioArtistPage",
);
const StudioDashboardPage = lazyNamed(
  () => import("./StudioDashboardPage"),
  "StudioDashboardPage",
);
const StudioUploadPage = lazyNamed(
  () => import("./StudioUploadPage"),
  "StudioUploadPage",
);
const StudioPayoutsPage = lazyNamed(
  () => import("./StudioPayoutsPage"),
  "StudioPayoutsPage",
);
const StudioTrackPage = lazyNamed(
  () => import("./StudioTrackPage"),
  "StudioTrackPage",
);
const StudioLivePage = lazyNamed(
  () => import("./StudioLivePage"),
  "StudioLivePage",
);
const StudioCollectionPage = lazyNamed(
  () => import("./StudioCollectionPage"),
  "StudioCollectionPage",
);
const StudioSetPage = lazyNamed(
  () => import("./StudioSetPage"),
  "StudioSetPage",
);
const StudioSearchPage = lazyNamed(
  () => import("./StudioSearchPage"),
  "StudioSearchPage",
);
const StudioLibraryPage = lazyNamed(
  () => import("./StudioLibraryPage"),
  "StudioLibraryPage",
);
const StudioCheckoutPage = lazyNamed(
  () => import("./StudioCheckoutPage"),
  "StudioCheckoutPage",
);
const StudioSheetStorePage = lazyNamed(
  () => import("./StudioSheetStorePage"),
  "StudioSheetStorePage",
);
const StudioSolidarityFundPage = lazyNamed(
  () => import("./StudioSolidarityFundPage"),
  "StudioSolidarityFundPage",
);
const StudioOpenCallsPage = lazyNamed(
  () => import("./StudioOpenCallsPage"),
  "StudioOpenCallsPage",
);
const StudioSetSubmissionPage = lazyNamed(
  () => import("./StudioSetSubmissionPage"),
  "StudioSetSubmissionPage",
);
const StudioCouncilPage = lazyNamed(
  () => import("./StudioCouncilPage"),
  "StudioCouncilPage",
);
const StudioTriagePage = lazyNamed(
  () => import("./StudioTriagePage"),
  "StudioTriagePage",
);
const StudioFlagReviewPage = lazyNamed(
  () => import("./StudioFlagReviewPage"),
  "StudioFlagReviewPage",
);
const StudioOffAirPage = lazyNamed(
  () => import("./StudioOffAirPage"),
  "StudioOffAirPage",
);
const Studio404Page = lazyNamed(
  () => import("./Studio404Page"),
  "Studio404Page",
);
const Studio500Page = lazyNamed(
  () => import("./Studio500Page"),
  "Studio500Page",
);
const StudioSignInPage = lazyNamed(
  () => import("./StudioSignInPage"),
  "StudioSignInPage",
);
const StudioSettingsPage = lazyNamed(
  () => import("./StudioSettingsPage"),
  "StudioSettingsPage",
);
const StudioAboutPage = lazyNamed(
  () => import("./StudioAboutPage"),
  "StudioAboutPage",
);
const StudioAccessibilityPage = lazyNamed(
  () => import("./StudioAccessibilityPage"),
  "StudioAccessibilityPage",
);
const StudioTermsPage = lazyNamed(
  () => import("./StudioTermsPage"),
  "StudioTermsPage",
);
const StudioHelpPage = lazyNamed(
  () => import("./StudioHelpPage"),
  "StudioHelpPage",
);
const StudioPressPage = lazyNamed(
  () => import("./StudioPressPage"),
  "StudioPressPage",
);
const StudioEndCardPage = lazyNamed(
  () => import("./StudioEndCardPage"),
  "StudioEndCardPage",
);
const StudioNotificationsPage = lazyNamed(
  () => import("./StudioNotificationsPage"),
  "StudioNotificationsPage",
);
const StudioReceiptPage = lazyNamed(
  () => import("./StudioReceiptPage"),
  "StudioReceiptPage",
);
const StudioRightsPage = lazyNamed(
  () => import("./StudioRightsPage"),
  "StudioRightsPage",
);
const StudioProgramPage = lazyNamed(
  () => import("./StudioProgramPage"),
  "StudioProgramPage",
);
const StudioBroadcastPage = lazyNamed(
  () => import("./StudioBroadcastPage"),
  "StudioBroadcastPage",
);
const StudioWelcomePage = lazyNamed(
  () => import("./StudioWelcomePage"),
  "StudioWelcomePage",
);
const StudioWithdrawnPage = lazyNamed(
  () => import("./StudioWithdrawnPage"),
  "StudioWithdrawnPage",
);
const StudioComingSoonPage = lazyNamed(
  () => import("./StudioComingSoonPage"),
  "StudioComingSoonPage",
);

/** The music studio (creator platform): catalogue, upload/payouts, live sets,
 *  moderation council/triage, the public shopfront, and its own state screens.
 *
 *  Studio is a demo-only showcase — it has no backend and every page renders
 *  fabricated `*.data.ts` content (payouts, tips, broadcast/fund figures). So
 *  in LIVE mode (`demoMode === false`) the entire `/studio/*` surface resolves
 *  to a single honest coming-soon page instead of presenting invented numbers
 *  as real. See `docs/superpowers/specs/2026-07-30-studio-live-mode-gate-design.md`. */
export function studioRoutes(demoMode: boolean) {
  if (!demoMode) {
    return <Route path="/studio/*" element={<StudioComingSoonPage />} />;
  }
  return (
    <>
      <Route path={routes.studio} element={<StudioPage />} />
      <Route path={routes.studioAlbum} element={<StudioAlbumPage />} />
      <Route path="/studio/artist" element={<StudioArtistPage />} />
      <Route path="/studio/dashboard" element={<StudioDashboardPage />} />
      <Route path={routes.studioUpload} element={<StudioUploadPage />} />
      <Route path={routes.studioPayouts} element={<StudioPayoutsPage />} />
      <Route path={routes.studioTrack} element={<StudioTrackPage />} />
      <Route path={routes.studioLive} element={<StudioLivePage />} />
      <Route
        path={routes.studioCollection}
        element={<StudioCollectionPage />}
      />
      <Route path={routes.studioSet} element={<StudioSetPage />} />
      <Route path={routes.studioSearch} element={<StudioSearchPage />} />
      <Route path={routes.studioLibrary} element={<StudioLibraryPage />} />
      <Route path={routes.studioCheckout} element={<StudioCheckoutPage />} />
      <Route path="/studio/sheet-store" element={<StudioSheetStorePage />} />
      <Route
        path="/studio/solidarity-fund"
        element={<StudioSolidarityFundPage />}
      />
      <Route path={routes.studioCalls} element={<StudioOpenCallsPage />} />
      <Route
        path={routes.studioSetSubmission}
        element={<StudioSetSubmissionPage />}
      />
      <Route path={routes.studioCouncil} element={<StudioCouncilPage />} />
      <Route path={routes.studioTriage} element={<StudioTriagePage />} />
      <Route
        path={routes.studioFlagReview}
        element={<StudioFlagReviewPage />}
      />
      <Route path="/studio/off-air" element={<StudioOffAirPage />} />
      <Route path="/studio/404" element={<Studio404Page />} />
      <Route path="/studio/500" element={<Studio500Page />} />
      <Route path="/studio/sign-in" element={<StudioSignInPage />} />
      <Route path="/studio/settings" element={<StudioSettingsPage />} />
      <Route path={routes.studioAbout} element={<StudioAboutPage />} />
      <Route
        path={routes.studioAccessibility}
        element={<StudioAccessibilityPage />}
      />
      <Route path={routes.studioTerms} element={<StudioTermsPage />} />
      <Route path={routes.studioHelp} element={<StudioHelpPage />} />
      <Route path={routes.studioPress} element={<StudioPressPage />} />
      <Route path={routes.studioEndCard} element={<StudioEndCardPage />} />
      <Route
        path={routes.studioNotifications}
        element={<StudioNotificationsPage />}
      />
      <Route path={routes.studioReceipt} element={<StudioReceiptPage />} />
      <Route path={routes.studioRights} element={<StudioRightsPage />} />
      <Route path={routes.studioProgram} element={<StudioProgramPage />} />
      <Route path={routes.studioBroadcast} element={<StudioBroadcastPage />} />
      <Route path={routes.studioWelcome} element={<StudioWelcomePage />} />
      <Route path={routes.studioWithdrawn} element={<StudioWithdrawnPage />} />
    </>
  );
}
