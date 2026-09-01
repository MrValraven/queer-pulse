import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { COMMISSION_INTEREST_PATH } from "./commissionInterest.paths";

const CulturePage = lazyNamed(() => import("./CulturePage"), "CulturePage");
const CultureComingSoon = lazyNamed(
  () => import("./CultureComingSoon"),
  "CultureComingSoon",
);
const CommissionInterestPage = lazyNamed(
  () => import("./CommissionInterestPage"),
  "CommissionInterestPage",
  COMMISSION_INTEREST_PATH,
);

/** The culture landing page (club picks, commission board, showcase, radio),
 *  plus the one Culture surface that is live in both modes.
 *
 *  THE LANDING PAGE IS STILL NOT LAUNCHED. Every tab's listing is curated
 *  editorial content that only exists in the demo mocks, and the `content`
 *  module behind it is read-only with no admin CRUD, so in live mode the page
 *  is four empty boxes with its contribute buttons hidden and nothing can ever
 *  be published into it. So when `demoMode` is off `routes.culture` resolves to
 *  an honest not-launched page, the same treatment `studioRoutes` gives Studio,
 *  and the meganav entry is dropped (`DEMO_ONLY_NAV_PATTERNS` in
 *  `app/authGate.ts`). Demo mode keeps the full mock experience. CON-14.
 *
 *  THE COMMISSION-INTEREST FORM IS THE EXCEPTION, and it is registered outside
 *  that split on purpose. It is the only part of Culture with a real pipeline at
 *  both ends: `POST /commissions/interest` writes a member's submission, and
 *  `/admin/commission-interests` is a staffed queue somebody reads. Gating it
 *  with the empty tabs left a live write endpoint with no caller and an admin
 *  console staffed for a form no member could reach, so the gate is now drawn
 *  around the tabs that have no content pipeline and this page steps outside it.
 *  `CultureComingSoon` links to it, and `authGate`'s GATED_PATTERNS closes it to
 *  logged-out visitors because the endpoint is `ActiveMemberGuard`ed. PRD-46. */
export function cultureRoutes(demoMode: boolean) {
  return (
    <>
      <Route
        path={routes.culture}
        element={demoMode ? <CulturePage /> : <CultureComingSoon />}
      />
      <Route
        path={COMMISSION_INTEREST_PATH}
        element={<CommissionInterestPage />}
      />
    </>
  );
}
