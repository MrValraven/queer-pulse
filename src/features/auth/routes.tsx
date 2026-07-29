import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ParamRedirect } from "../../app/routes.redirects";
import { auth, lazyNamed } from "../../app/routeHelpers";

const SignInPage = lazyNamed(() => import("./SignInPage"), "SignInPage");
const CreateAccountPage = lazyNamed(() => import("./CreateAccountPage"), "CreateAccountPage");
const InvitePage = lazyNamed(() => import("./InvitePage"), "InvitePage");
const RequestInvitePage = lazyNamed(() => import("./RequestInvitePage"), "RequestInvitePage");
const OnboardingPage = lazyNamed(() => import("./OnboardingPage"), "OnboardingPage");
const WelcomeTourPage = lazyNamed(() => import("./WelcomeTourPage"), "WelcomeTourPage");
// The recipient's personal invite landing lives in the system feature, but it
// belongs to the auth flow and shares its branded AuthLoader fallback.
const InviteLandingPage = lazyNamed(() => import("../system/InviteLandingPage"), "InviteLandingPage");

/** Auth & onboarding — each chunk loads behind the branded AuthLoader fallback. */
export function authRoutes() {
  return (
    <>
      <Route path={routes.signIn} element={auth(<SignInPage />)} />
      <Route
        path={routes.createAccount}
        element={auth(<CreateAccountPage />)}
      />
      <Route path={routes.invite} element={auth(<InvitePage />)} />
      <Route
        path={`${routes.invite}/:code`}
        element={auth(<InviteLandingPage />)}
      />
      <Route
        path={routes.requestInvite}
        element={auth(<RequestInvitePage />)}
      />
      <Route path="/auth/onboarding" element={auth(<OnboardingPage />)} />
      <Route path={routes.welcome} element={auth(<OnboardingPage />)} />
      <Route path={routes.welcomeTour} element={auth(<WelcomeTourPage />)} />
      <Route
        path="/invite/:code"
        element={
          <ParamRedirect build={(p) => `/auth/invite/${p.code ?? ""}`} />
        }
      />
    </>
  );
}
