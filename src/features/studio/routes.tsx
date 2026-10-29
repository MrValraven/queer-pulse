import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { StudioErrorBoundary } from "./StudioErrorBoundary";
import { STUDIO_DEFERRED_PATHS } from "./studioGate.data";
import { StudioFirstRunRedirect } from "./StudioFirstRunRedirect";
import { StudioGateSkeleton } from "./StudioGateSkeleton";
import { STUDIO_PREVIEW_ROUTE, studioPaymentsPath } from "./studioPaths";
import { StudioUngrantedPage } from "./StudioUngrantedPage";

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
const StudioBrowsePage = lazyNamed(
  () => import("./StudioBrowsePage"),
  "StudioBrowsePage",
);
const StudioScenePage = lazyNamed(
  () => import("./StudioScenePage"),
  "StudioScenePage",
);
const StudioCreditsPage = lazyNamed(
  () => import("./StudioCreditsPage"),
  "StudioCreditsPage",
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
const StudioLikedPage = lazyNamed(
  () => import("./StudioLikedPage"),
  "StudioLikedPage",
);
const StudioListeningPage = lazyNamed(
  () => import("./StudioListeningPage"),
  "StudioListeningPage",
);
const StudioMePage = lazyNamed(() => import("./StudioMePage"), "StudioMePage");
const StudioPaymentsPage = lazyNamed(
  () => import("./StudioPaymentsPage"),
  "StudioPaymentsPage",
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
// Studio safety: the claim form and the claimant's claims.
const StudioClaimNewPage = lazyNamed(
  () => import("./StudioClaimNewPage"),
  "StudioClaimNewPage",
);
const StudioMyClaimsPage = lazyNamed(
  () => import("./StudioMyClaimsPage"),
  "StudioMyClaimsPage",
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
const StudioPressEditPage = lazyNamed(
  () => import("./StudioPressEditPage"),
  "StudioPressEditPage",
);
const StudioOneSheetPage = lazyNamed(
  () => import("./StudioOneSheetPage"),
  "StudioOneSheetPage",
);
const StudioPreviewPage = lazyNamed(
  () => import("./StudioPreviewPage"),
  "StudioPreviewPage",
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
const StudioWithdrawnPage = lazyNamed(
  () => import("./StudioWithdrawnPage"),
  "StudioWithdrawnPage",
);

interface StudioRouteOptions {
  demoMode: boolean;
  hasStudioAccess: boolean;
  isStudioAccessPending: boolean;
}

/** Every demo route, unchanged from the showcase. */
function demoStudioRoutes() {
  return (
    <Route element={<StudioErrorBoundary />}>
      <Route path={routes.studio} element={<StudioPage />} />
      <Route path={routes.studioAlbum} element={<StudioAlbumPage />} />
      <Route path={routes.studioArtist} element={<StudioArtistPage />} />
      <Route path={routes.studioDashboard} element={<StudioDashboardPage />} />
      <Route path={routes.studioUpload} element={<StudioUploadPage />} />
      {/* The retired payouts page: old links land on Payments. */}
      <Route
        path={routes.studioPayouts}
        element={<Navigate to={studioPaymentsPath()} replace />}
      />
      <Route path={routes.studioTrack} element={<StudioTrackPage />} />
      <Route path={routes.studioLive} element={<StudioLivePage />} />
      <Route
        path={routes.studioCollection}
        element={<StudioCollectionPage />}
      />
      <Route path={routes.studioSet} element={<StudioSetPage />} />
      <Route path={routes.studioSearch} element={<StudioSearchPage />} />
      <Route path={routes.studioBrowse} element={<StudioBrowsePage />} />
      <Route path={routes.studioScene} element={<StudioScenePage />} />
      <Route path={routes.studioCredits} element={<StudioCreditsPage />} />
      <Route path={routes.studioLibrary} element={<StudioLibraryPage />} />
      <Route path={routes.studioLiked} element={<StudioLikedPage />} />
      <Route path={routes.studioListening} element={<StudioListeningPage />} />
      <Route path={routes.studioMe} element={<StudioMePage />} />
      <Route path={routes.studioPayments} element={<StudioPaymentsPage />} />
      <Route path={routes.studioCheckout} element={<StudioCheckoutPage />} />
      <Route path="/studio/sheet-store" element={<StudioSheetStorePage />} />
      <Route
        path={routes.studioSolidarityFund}
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
      <Route path={routes.studioSettings} element={<StudioSettingsPage />} />
      <Route path={routes.studioClaimNew} element={<StudioClaimNewPage />} />
      <Route path={routes.studioClaims} element={<StudioMyClaimsPage />} />
      <Route path={routes.studioAbout} element={<StudioAboutPage />} />
      <Route
        path={routes.studioAccessibility}
        element={<StudioAccessibilityPage />}
      />
      <Route path={routes.studioTerms} element={<StudioTermsPage />} />
      <Route path={routes.studioHelp} element={<StudioHelpPage />} />
      <Route path={routes.studioPress} element={<StudioPressPage />} />
      <Route path={routes.studioPressEdit} element={<StudioPressEditPage />} />
      <Route path={routes.studioPressPrint} element={<StudioOneSheetPage />} />
      <Route path={STUDIO_PREVIEW_ROUTE} element={<StudioPreviewPage />} />
      <Route path={routes.studioEndCard} element={<StudioEndCardPage />} />
      <Route
        path={routes.studioNotifications}
        element={<StudioNotificationsPage />}
      />
      <Route path={routes.studioReceipt} element={<StudioReceiptPage />} />
      <Route path={routes.studioRights} element={<StudioRightsPage />} />
      <Route path={routes.studioProgram} element={<StudioProgramPage />} />
      <Route path={routes.studioBroadcast} element={<StudioBroadcastPage />} />
      <Route path={routes.studioWelcome} element={<StudioFirstRunRedirect />} />
      <Route path={routes.studioWithdrawn} element={<StudioWithdrawnPage />} />
      <Route path="/studio/*" element={<Studio404Page />} />
    </Route>
  );
}

/** Studio for a granted member: listen, search, browse by genre and mood,
 *  scenes, upload with persona credits, the credits inbox, playlists and
 *  the library, Your listening, Your numbers, open calls, the solidarity page, Help, About,
 *  Terms, Accessibility, Rights, the withdrawn view, Settings and (for
 *  staff) Flag review. Studio v3 adds the press kit, its editor and
 *  one-sheet, and private preview links. Deferred pages bounce to Studio
 *  home; anything else under /studio is the Studio 404. */
function grantedStudioRoutes() {
  return (
    <Route element={<StudioErrorBoundary />}>
      <Route path={routes.studio} element={<StudioPage />} />
      <Route path={routes.studioAlbum} element={<StudioAlbumPage />} />
      <Route path={routes.studioArtist} element={<StudioArtistPage />} />
      <Route path={routes.studioTrack} element={<StudioTrackPage />} />
      <Route path={routes.studioSearch} element={<StudioSearchPage />} />
      <Route path={routes.studioUpload} element={<StudioUploadPage />} />
      <Route path={routes.studioBrowse} element={<StudioBrowsePage />} />
      <Route path={routes.studioScene} element={<StudioScenePage />} />
      <Route path={routes.studioCredits} element={<StudioCreditsPage />} />
      <Route
        path={routes.studioCollection}
        element={<StudioCollectionPage />}
      />
      <Route path={routes.studioLibrary} element={<StudioLibraryPage />} />
      <Route path={routes.studioLiked} element={<StudioLikedPage />} />
      <Route path={routes.studioListening} element={<StudioListeningPage />} />
      <Route path={routes.studioMe} element={<StudioMePage />} />
      <Route path={routes.studioPayments} element={<StudioPaymentsPage />} />
      {/* The retired payouts page: old links land on Payments. */}
      <Route
        path={routes.studioPayouts}
        element={<Navigate to={studioPaymentsPath()} replace />}
      />
      <Route path={routes.studioDashboard} element={<StudioDashboardPage />} />
      <Route path={routes.studioCalls} element={<StudioOpenCallsPage />} />
      <Route
        path={routes.studioSolidarityFund}
        element={<StudioSolidarityFundPage />}
      />
      <Route path={routes.studioPress} element={<StudioPressPage />} />
      <Route path={routes.studioPressEdit} element={<StudioPressEditPage />} />
      <Route path={routes.studioPressPrint} element={<StudioOneSheetPage />} />
      <Route path={STUDIO_PREVIEW_ROUTE} element={<StudioPreviewPage />} />
      <Route path={routes.studioHelp} element={<StudioHelpPage />} />
      <Route path={routes.studioAbout} element={<StudioAboutPage />} />
      <Route path={routes.studioTerms} element={<StudioTermsPage />} />
      <Route
        path={routes.studioAccessibility}
        element={<StudioAccessibilityPage />}
      />
      <Route path={routes.studioRights} element={<StudioRightsPage />} />
      <Route path={routes.studioWithdrawn} element={<StudioWithdrawnPage />} />
      <Route path={routes.studioSettings} element={<StudioSettingsPage />} />
      <Route path={routes.studioClaimNew} element={<StudioClaimNewPage />} />
      <Route path={routes.studioClaims} element={<StudioMyClaimsPage />} />
      <Route
        path={routes.studioFlagReview}
        element={<StudioFlagReviewPage />}
      />
      <Route path={routes.studioWelcome} element={<StudioFirstRunRedirect />} />
      <Route path="/studio/404" element={<Studio404Page />} />
      <Route path="/studio/500" element={<Studio500Page />} />
      {STUDIO_DEFERRED_PATHS.map((path) => (
        <Route
          key={path}
          path={path}
          element={<Navigate to={routes.studio} replace />}
        />
      ))}
      <Route path="/studio/*" element={<Studio404Page />} />
    </Route>
  );
}

/**
 * The music studio. Demo renders the full showcase. Live mode shows Studio v1
 * to members with a Studio access grant (GET /studio/me) and the coming-soon
 * teaser to everyone else, as before; a failed read shows the access error
 * instead (StudioUngrantedPage). While the grant is still being read the
 * whole subtree holds on the Studio skeleton, so the teaser never flashes.
 * Every branch sits under StudioErrorBoundary, so a crash keeps the Studio
 * frame.
 * See QUEERPULSE-STUDIO-V1-DESIGN-2026-10-08.md section 6.
 */
export function studioRoutes({
  demoMode,
  hasStudioAccess,
  isStudioAccessPending,
}: StudioRouteOptions) {
  if (demoMode) return demoStudioRoutes();
  if (isStudioAccessPending) {
    return <Route path="/studio/*" element={<StudioGateSkeleton />} />;
  }
  if (!hasStudioAccess) {
    // A claimant who lost the grant can still follow their claims.
    return (
      <Route element={<StudioErrorBoundary />}>
        <Route path={routes.studioClaims} element={<StudioMyClaimsPage />} />
        <Route path="/studio/*" element={<StudioUngrantedPage />} />
      </Route>
    );
  }
  return grantedStudioRoutes();
}
