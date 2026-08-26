import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ParamRedirect } from "../../app/routes.redirects";
import { auth, lazyNamed } from "../../app/routeHelpers";

const SignInPage = lazyNamed(() => import("./SignInPage"), "SignInPage");
const InvitePage = lazyNamed(() => import("./InvitePage"), "InvitePage");
const RequestInvitePage = lazyNamed(
  () => import("./RequestInvitePage"),
  "RequestInvitePage",
);
// The applicant-facing "what happened to my request?" page. Public like the
// request form itself: whoever needs it has no account by definition.
const JoinRequestStatusPage = lazyNamed(
  () => import("./JoinRequestStatusPage"),
  "JoinRequestStatusPage",
);
const OnboardingPage = lazyNamed(
  () => import("./OnboardingPage"),
  "OnboardingPage",
);
// The recipient's personal invite landing lives in the system feature, but it
// belongs to the auth flow and shares its branded AuthLoader fallback.
const InviteLandingPage = lazyNamed(
  () => import("../system/InviteLandingPage"),
  "InviteLandingPage",
);

/** Auth & onboarding — each chunk loads behind the branded AuthLoader fallback. */
export function authRoutes() {
  return (
    <>
      <Route path={routes.signIn} element={auth(<SignInPage />)} />
      <Route path={routes.invite} element={auth(<InvitePage />)} />
      <Route
        path={`${routes.invite}/:code`}
        element={auth(<InviteLandingPage />)}
      />
      <Route
        path={routes.requestInvite}
        element={auth(<RequestInvitePage />)}
      />
      {/* `/auth/request-invite` is an exact path with no wildcard, so this
          nested route is reached on its own terms and order does not matter. */}
      <Route
        path={routes.joinRequestStatus}
        element={auth(<JoinRequestStatusPage />)}
      />
      <Route path={routes.onboarding} element={auth(<OnboardingPage />)} />
      {/* `/auth/welcome` is a legacy alias for the one-time onboarding wizard.
          It must not mount the wizard a second time: the one-time gate in
          authGate.ts matches only `routes.onboarding`, so an already-onboarded
          member hitting the alias would replay the whole flow (silently
          re-submitting profile fields). Redirect to the canonical path instead,
          so a single route — and a single gate — governs onboarding. Demo mode
          stays explorable because the gate only bounces in live mode. */}
      <Route
        path={routes.welcome}
        element={<Navigate to={routes.onboarding} replace />}
      />
      <Route
        path="/invite/:code"
        element={
          <ParamRedirect build={(p) => `/auth/invite/${p.code ?? ""}`} />
        }
      />
    </>
  );
}
