import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../features/auth/api/auth.api";
import { AuthContext, type AuthContextValue } from "./providers/authContext";
import { routes } from "./routeMap";
import { AppRoutes } from "./routes";

/**
 * The Pulse Live staff gate in `AppRoutes`: staff without Pulse Live access go
 * from the quiz templates pages to their landing page (admins to the admin
 * home, moderators to the queues console), and a grant holder or demo renders
 * the page. The real `useAuthGateRedirect`, `useIsQuizshowVisible` and
 * `useHasEarlyAccess` run; only the session (a real `AuthContext.Provider`),
 * demo mode, the Studio access read, the session loader and the admin route
 * group are stubbed, so no lazy page or provider stack is needed.
 * `import.meta.env.DEV` is stubbed off to act as a built live artifact
 * (precedent: `routes.quizshowGate.test.tsx`).
 */
let demoMode = false;

vi.mock("./providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));

vi.mock("../features/studio/api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "denied",
    hasAccess: false,
    isPending: false,
    uploadablePersonas: [],
  }),
}));

vi.mock("../shared/components/feedback/PageLoader", () => ({
  PageLoader: () => <div data-testid="session-loader" />,
}));

vi.mock("../features/admin/routes", async () => {
  const { Route } = await import("react-router-dom");
  const { routes: routeMap } = await import("./routeMap");
  return {
    adminRoutes: () => (
      <>
        <Route
          path={routeMap.admin}
          element={<div data-testid="admin-home-page" />}
        />
        <Route
          path={routeMap.adminQueues}
          element={<div data-testid="admin-queues-page" />}
        />
        <Route
          path={routeMap.adminQuizshowTemplates}
          element={<div data-testid="quiz-templates-page" />}
        />
        <Route
          path={routeMap.adminQuizshowTemplate}
          element={<div data-testid="quiz-templates-page" />}
        />
      </>
    ),
  };
});

const TEMPLATE_PATH = `${routes.adminQuizshowTemplates}/t-1`;

function staffWith(
  role: AuthUser["role"],
  earlyAccessFeatures: string[],
): AuthUser {
  return {
    id: "staff-1",
    email: "staff@queerpulse.test",
    status: "active",
    role,
    staffRoles: [],
    earlyAccessFeatures,
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-01T00:00:00.000Z",
    suspendedUntil: null,
    suspension: null,
    profile: { slug: "staff-one", firstName: "Staff", lastName: "One" },
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
  return (
    <output data-testid="location">{`${location.pathname}${location.search}`}</output>
  );
}

function renderAt(path: string, auth: AuthContextValue) {
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

function landedAt(): string | null {
  return screen.getByTestId("location").textContent;
}

describe("AppRoutes: Pulse Live quiz templates gate", () => {
  beforeEach(() => {
    demoMode = false;
    vi.stubEnv("DEV", false);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("sends a moderator without Pulse Live access from the templates page to the queues console", async () => {
    renderAt(TEMPLATE_PATH, authValue(staffWith("moderator", [])));
    expect(await screen.findByTestId("admin-queues-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.adminQueues);
  });

  it("sends an admin without Pulse Live access from the templates list to the admin home", async () => {
    renderAt(routes.adminQuizshowTemplates, authValue(staffWith("admin", [])));
    expect(await screen.findByTestId("admin-home-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.admin);
  });

  it("renders the templates page for a moderator holding the grant", async () => {
    renderAt(TEMPLATE_PATH, authValue(staffWith("moderator", ["quizshow"])));
    expect(
      await screen.findByTestId("quiz-templates-page"),
    ).toBeInTheDocument();
    expect(landedAt()).toBe(TEMPLATE_PATH);
  });

  it("renders the templates page in demo", async () => {
    demoMode = true;
    renderAt(
      routes.adminQuizshowTemplates,
      authValue(staffWith("moderator", [])),
    );
    expect(
      await screen.findByTestId("quiz-templates-page"),
    ).toBeInTheDocument();
    expect(landedAt()).toBe(routes.adminQuizshowTemplates);
  });
});
