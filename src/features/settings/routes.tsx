import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const SettingsPage = lazyNamed(() => import("./SettingsPage"), "SettingsPage");
const EditProfilePage = lazyNamed(
  () => import("./EditProfilePage"),
  "EditProfilePage",
);
// ID-15: `/account/security` is the member's own security hub. The
// responsible-disclosure policy that used to hold this path now lives at
// `routes.policiesSecurity` (src/features/marketing/SecurityPolicyPage.tsx).
const AccountSecurityPage = lazyNamed(
  () => import("./AccountSecurityPage"),
  "AccountSecurityPage",
);
const SessionsPage = lazyNamed(() => import("./SessionsPage"), "SessionsPage");
const PushDevicesPage = lazyNamed(
  () => import("./PushDevicesPage"),
  "PushDevicesPage",
);
const DataExportPage = lazyNamed(
  () => import("./DataExportPage"),
  "DataExportPage",
);
const DeleteAccountPage = lazyNamed(
  () => import("./DeleteAccountPage"),
  "DeleteAccountPage",
);

/** Account settings & the account-hub landing redirect. */
export function settingsRoutes() {
  return (
    <>
      <Route path={routes.settings} element={<SettingsPage />} />
      <Route
        path={routes.account}
        element={<Navigate to={routes.accountProfile} replace />}
      />
      <Route path={routes.editProfile} element={<EditProfilePage />} />
      <Route path={routes.security} element={<AccountSecurityPage />} />
      <Route path={routes.sessions} element={<SessionsPage />} />
      <Route path={routes.pushDevices} element={<PushDevicesPage />} />
      <Route path={routes.dataExport} element={<DataExportPage />} />
      <Route path={routes.deleteAccount} element={<DeleteAccountPage />} />
    </>
  );
}
