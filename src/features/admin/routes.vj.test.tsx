import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../auth/api/auth.api";
import {
  AuthContext,
  type AuthContextValue,
} from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { AppRoutes } from "../../app/routes";

/**
 * The VJ screen and remote routes in the real `adminRoutes()` group, behind
 * the real `/admin/*` gate in `useAuthGateRedirect`. Only the two pages, the
 * session (a real `AuthContext.Provider`), demo mode, the Studio access read
 * and the session loader are stubbed, so no page or provider stack is needed
 * (precedent: `app/routes.quizshowTemplatesGate.test.tsx`).
 */
let demoMode = false;

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));

vi.mock("../studio/api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "denied",
    hasAccess: false,
    isPending: false,
    uploadablePersonas: [],
  }),
}));

vi.mock("../../shared/components/feedback/PageLoader", () => ({
  PageLoader: () => <div data-testid="session-loader" />,
}));

vi.mock("../feed/routes", async () => {
  const { Route } = await import("react-router-dom");
  const { routes: routeMap } = await import("../../app/routeMap");
  return {
    feedRoutes: () => (
      <Route path={routeMap.feed} element={<div data-testid="feed-page" />} />
    ),
  };
});

vi.mock("../vj/screen/VjScreenPage", () => ({
  VjScreenPage: () => <main data-testid="vj-screen-page" />,
}));

vi.mock("../vj/remote/AdminVjRemotePage", () => ({
  AdminVjRemotePage: () => <main data-testid="vj-remote-page" />,
}));

function userWith(role: AuthUser["role"]): AuthUser {
  return {
    id: "user-1",
    email: "user@queerpulse.test",
    status: "active",
    role,
    staffRoles: [],
    earlyAccessFeatures: [],
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-01T00:00:00.000Z",
    suspendedUntil: null,
    suspension: null,
    profile: { slug: "user-one", firstName: "User", lastName: "One" },
  };
}

function authValue(user: AuthUser): AuthContextValue {
  return {
    loggedIn: true,
    checking: false,
    preparing: false,
    user,
    status: user.status,
    role: user.role,
    staffRoles: [],
    authError: null,
    signIn: () => {},
    signOut: () => {},
    endPreparing: () => {},
    refresh: () => Promise.resolve(),
    markOnboarded: () => {},
  };
}

/** Where the router ended up, so a redirect is asserted by its landing URL. */
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderAt(path: string, auth: AuthContextValue) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("AppRoutes: VJ screen and remote", () => {
  beforeEach(() => {
    demoMode = false;
    vi.stubEnv("DEV", false);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    [routes.adminVjScreen, "vj-screen-page"],
    [routes.adminVjRemote, "vj-remote-page"],
  ])(
    "mounts the VJ screen and remote for an admin: %s",
    async (path, testId) => {
      renderAt(path, authValue(userWith("admin")));
      expect(await screen.findByRole("main")).toBe(screen.getByTestId(testId));
      expect(screen.getByTestId("location")).toHaveTextContent(path);
    },
  );

  it.each([routes.adminVjScreen, routes.adminVjRemote])(
    "sends a member away from both: %s",
    async (path) => {
      renderAt(path, authValue(userWith("member")));
      expect(await screen.findByTestId("feed-page")).toBeInTheDocument();
      expect(screen.getByTestId("location")).toHaveTextContent(
        new RegExp(`^${routes.feed}$`),
      );
      expect(screen.queryByRole("main")).not.toBeInTheDocument();
    },
  );
});
