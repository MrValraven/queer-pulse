import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const ServerErrorPage = lazyNamed(
  () => import("./ServerErrorPage"),
  "ServerErrorPage",
);
const MaintenancePage = lazyNamed(
  () => import("./MaintenancePage"),
  "MaintenancePage",
);
const OfflinePage = lazyNamed(() => import("./OfflinePage"), "OfflinePage");
const GeoRestrictedPage = lazyNamed(
  () => import("./GeoRestrictedPage"),
  "GeoRestrictedPage",
);
const PwaPromptPage = lazyNamed(
  () => import("./PwaPromptPage"),
  "PwaPromptPage",
);
const AccountBannedPage = lazyNamed(
  () => import("./AccountBannedPage"),
  "AccountBannedPage",
);
const AccountLockedPage = lazyNamed(
  () => import("./AccountLockedPage"),
  "AccountLockedPage",
);
const AccountSuspendedPage = lazyNamed(
  () => import("./AccountSuspendedPage"),
  "AccountSuspendedPage",
);
const InviteExpiredPage = lazyNamed(
  () => import("./InviteExpiredPage"),
  "InviteExpiredPage",
);
const VerificationNeededPage = lazyNamed(
  () => import("./VerificationNeededPage"),
  "VerificationNeededPage",
);
const StatusPage = lazyNamed(() => import("./StatusPage"), "StatusPage");
const GenesisPage = lazyNamed(() => import("./GenesisPage"), "GenesisPage");
const NewsletterUnsubscribePage = lazyNamed(
  () => import("./NewsletterUnsubscribePage"),
  "NewsletterUnsubscribePage",
);

/** System, error & account-state screens, plus the one-time founder bootstrap. */
export function systemRoutes() {
  return (
    <>
      <Route path={routes.serverError} element={<ServerErrorPage />} />
      <Route path={routes.maintenance} element={<MaintenancePage />} />
      <Route path={routes.offline} element={<OfflinePage />} />
      <Route path={routes.geoRestricted} element={<GeoRestrictedPage />} />
      <Route path={routes.pwaPrompt} element={<PwaPromptPage />} />
      <Route path={routes.accountBanned} element={<AccountBannedPage />} />
      <Route path={routes.accountLocked} element={<AccountLockedPage />} />
      <Route
        path={routes.accountSuspended}
        element={<AccountSuspendedPage />}
      />
      <Route
        path={routes.inviteExpired}
        element={<InviteExpiredPage preview />}
      />
      <Route
        path={routes.verificationNeeded}
        element={<VerificationNeededPage />}
      />
      <Route path={routes.status} element={<StatusPage />} />
      <Route path={routes.genesis} element={<GenesisPage />} />
      <Route
        path={routes.newsletterUnsubscribe}
        element={<NewsletterUnsubscribePage />}
      />
    </>
  );
}
