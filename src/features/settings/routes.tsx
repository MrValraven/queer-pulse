import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const SettingsPage = lazyNamed(() => import("./SettingsPage"), "SettingsPage");
const EditProfilePage = lazyNamed(() => import("./EditProfilePage"), "EditProfilePage");
const SecurityPage = lazyNamed(() => import("./SecurityPage"), "SecurityPage");
const SessionsPage = lazyNamed(() => import("./SessionsPage"), "SessionsPage");
const DataExportPage = lazyNamed(() => import("./DataExportPage"), "DataExportPage");
const DeleteAccountPage = lazyNamed(() => import("./DeleteAccountPage"), "DeleteAccountPage");

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
      <Route path={routes.security} element={<SecurityPage />} />
      <Route path={routes.sessions} element={<SessionsPage />} />
      <Route path={routes.dataExport} element={<DataExportPage />} />
      <Route path={routes.deleteAccount} element={<DeleteAccountPage />} />
    </>
  );
}
