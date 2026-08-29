import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RouteFallback } from "../shared/components/feedback/RouteFallback";
import { AuthLoader } from "../shared/components/feedback/AuthLoader";
import { ErrorBoundary } from "../shared/components/feedback/ErrorBoundary";
import { lazyNamed } from "./routeHelpers";
import { routes } from "./routeMap";
import { LEGACY_REDIRECTS } from "./routes.redirects.data";
import {
  useAuthGateRedirect,
  isGatedPath,
  isGuestOnlyPath,
  isComingSoonPath,
} from "./authGate";
import { useAuth } from "./providers/authContext";
import { useDemoMode } from "./providers/DemoModeProvider";

// Per-feature route groups. Each feature owns its own <Route> registrations in
// `src/features/<feature>/routes.tsx`; this file is the thin composition root
// that assembles them under one <Routes> tree. Ordering across groups is
// behaviour-neutral: react-router v7 matches by path specificity (rank), not
// declaration order, and there are no equal-rank path collisions across groups.
import { memberRoutes } from "../features/members/routes";
import { subprofileRoutes } from "../features/subprofiles/routes";
import { cardRoutes } from "../features/cards/routes";
import { connectRoutes } from "../features/connect/routes";
import { communityRoutes } from "../features/community/routes";
import { feedRoutes } from "../features/feed/routes";
import { messagesRoutes } from "../features/messages/routes";
import { notificationsRoutes } from "../features/notifications/routes";
import { communitiesRoutes } from "../features/communities/routes";
import { gatheringRoutes } from "../features/gatherings/routes";
import { myEventsRoutes } from "../features/myevents/routes";
import { magazineRoutes } from "../features/magazine/routes";
import { topicRoutes } from "../features/topics/routes";
import { cultureRoutes } from "../features/culture/routes";
import { marketingRoutes } from "../features/marketing/routes";
import { resourceRoutes } from "../features/resources/routes";
import { safetyRoutes } from "../features/safety/routes";
import { authRoutes } from "../features/auth/routes";
import { onboardingRoutes } from "../features/onboarding/routes";
import { economyRoutes } from "../features/economy/routes";
import { cinemaRoutes } from "../features/cinema/routes";
import { studioRoutes } from "../features/studio/routes";
import { forumRoutes } from "../features/forum/routes";
import { settingsRoutes } from "../features/settings/routes";
import { governanceRoutes } from "../features/governance/routes";
import { systemRoutes } from "../features/system/routes";
import { adminRoutes } from "../features/admin/routes";
import { simulationRoutes } from "../features/simulations/routes";

const HomePage = lazyNamed(
  () => import("../features/homepage/HomePage"),
  "HomePage",
  routes.homepage,
);
const NotFoundPage = lazyNamed(
  () => import("../pages/NotFoundPage"),
  "NotFoundPage",
);

/**
 * The Member Platform surface is now built. Remaining known links resolve to a
 * styled placeholder, and unknown paths fall through to it too, so no link 404s.
 */
export function AppRoutes() {
  // Walled-garden gate: bounce logged-out visitors off member-only routes to
  // sign-in (with a ?next= back-link). Public/marketing pages fall through.
  const { checking } = useAuth();
  const gateRedirect = useAuthGateRedirect();
  const { pathname } = useLocation();
  const { demoMode } = useDemoMode();
  // The Work & Economy surface isn't launched yet — bounce its routes to the
  // roadmap, where a "Coming soon" card lists what's landing. Decided before the
  // auth checks because it doesn't depend on a session (the roadmap is public),
  // and inert in local dev (isComingSoonPath is false there) so the area stays
  // reachable while it's being built.
  if (isComingSoonPath(pathname)) {
    return <Navigate to={routes.roadmap} replace />;
  }
  // While the live session is still being determined, hold gated routes on the
  // branded loader — showing the page (or bouncing to sign-in) prematurely would
  // flash. Guest-only auth screens are held too, so a signed-in member reloading
  // one doesn't flash the sign-in form before the redirect. Public/marketing
  // pages render immediately.
  if (checking && (isGatedPath(pathname) || isGuestOnlyPath(pathname))) {
    return <AuthLoader />;
  }
  if (gateRedirect) return <Navigate to={gateRedirect} replace />;

  return (
    // Route-level boundary: a single broken page shows the branded fallback
    // without losing the app frame, and navigating away auto-resets it.
    <ErrorBoundary level="route" resetKey={pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={routes.homepage} element={<HomePage />} />

          {feedRoutes()}
          {memberRoutes()}
          {subprofileRoutes()}
          {cardRoutes()}
          {connectRoutes()}
          {myEventsRoutes()}
          {communityRoutes()}
          {messagesRoutes()}
          {notificationsRoutes()}
          {communitiesRoutes()}
          {gatheringRoutes(demoMode)}
          {magazineRoutes()}
          {topicRoutes()}
          {cultureRoutes(demoMode)}
          {marketingRoutes()}
          {governanceRoutes()}
          {resourceRoutes()}
          {safetyRoutes()}
          {authRoutes()}
          {onboardingRoutes()}
          {economyRoutes()}
          {cinemaRoutes(demoMode)}
          {studioRoutes(demoMode)}
          {forumRoutes()}
          {settingsRoutes()}
          {systemRoutes()}
          {adminRoutes()}
          {simulationRoutes()}

          {/* Legacy paths → new homes (keeps old links & design hrefs working) */}
          {LEGACY_REDIRECTS.map(([from, to]) => (
            <Route
              key={from}
              path={from}
              element={<Navigate to={to} replace />}
            />
          ))}

          {/* Legacy aliases → canonical pages */}
          <Route
            path={routes.businessDirectory}
            element={<Navigate to={routes.directory} replace />}
          />
          <Route
            path={routes.spacesMap}
            element={<Navigate to={routes.map} replace />}
          />

          {/* Genuinely unknown paths → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
