import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../features/auth/api/auth.api";
import { AuthContext, type AuthContextValue } from "./providers/authContext";
import { routes } from "./routeMap";
import { AppRoutes } from "./routes";

/**
 * The per-viewer Pulse Live gate in `AppRoutes`: signed out goes to sign-in
 * with `?next=` kept, signed in without the early-access grant goes to the
 * roadmap, and a grant holder, demo and `pnpm dev` render the page. The real
 * `useAuthGateRedirect`, `useIsQuizshowVisible` and `useHasEarlyAccess` run;
 * only the session (a real `AuthContext.Provider`), demo mode, the Studio
 * access read, the session loader and the three destination route groups are
 * stubbed, so no lazy page or provider stack is needed. `import.meta.env.DEV` is stubbed off to
 * act as a built live artifact (precedent: `authGate.test.tsx`).
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

vi.mock("../features/quizshow/routes", async () => {
  const { Route } = await import("react-router-dom");
  const { QUIZSHOW_PLAY_CODE_ROUTE, QUIZSHOW_SCREEN_ROUTE } =
    await import("../features/quizshow/quizshowPaths");
  return {
    quizshowRoutes: () => (
      <>
        <Route
          path={QUIZSHOW_SCREEN_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={QUIZSHOW_PLAY_CODE_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
      </>
    ),
  };
});

vi.mock("../features/auth/routes", async () => {
  const { Route } = await import("react-router-dom");
  const { routes: routeMap } = await import("./routeMap");
  return {
    authRoutes: () => (
      <Route
        path={routeMap.signIn}
        element={<div data-testid="sign-in-page" />}
      />
    ),
  };
});

vi.mock("../features/marketing/routes", async () => {
  const { Route } = await import("react-router-dom");
  const { routes: routeMap } = await import("./routeMap");
  return {
    marketingRoutes: () => (
      <Route
        path={routeMap.roadmap}
        element={<div data-testid="roadmap-page" />}
      />
    ),
  };
});

const PLAYER_PATH = "/play/QZ7KP4";
const SCREEN_PATH = "/gatherings/pride-brunch-jun-abcde/quizshow/screen";

function memberWith(earlyAccessFeatures: string[]): AuthUser {
  return {
    id: "member-1",
    email: "member@queerpulse.test",
    status: "active",
    role: "member",
    staffRoles: [],
    earlyAccessFeatures,
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-01T00:00:00.000Z",
    suspendedUntil: null,
    suspension: null,
    profile: { slug: "member-one", firstName: "Member", lastName: "One" },
  };
}

function authValue(
  user: AuthUser | null,
  options: { isChecking?: boolean } = {},
): AuthContextValue {
  return {
    loggedIn: user !== null,
    checking: options.isChecking ?? false,
    preparing: false,
    user,
    status: user?.status ?? null,
    role: user?.role ?? null,
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

describe("AppRoutes: Pulse Live early-access gate", () => {
  beforeEach(() => {
    demoMode = false;
    vi.stubEnv("DEV", false);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("sends a signed-out visitor to sign-in with the player link kept", async () => {
    renderAt(PLAYER_PATH, authValue(null));
    expect(await screen.findByTestId("sign-in-page")).toBeInTheDocument();
    expect(landedAt()).toBe(
      `${routes.signIn}?next=${encodeURIComponent(PLAYER_PATH)}`,
    );
  });

  it("sends a signed-in member without the grant to the roadmap", async () => {
    renderAt(PLAYER_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("roadmap-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.roadmap);
  });

  it("sends a host without the grant away from the presenter screen", async () => {
    renderAt(SCREEN_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("roadmap-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.roadmap);
  });

  it("renders Pulse Live for a member holding the grant", async () => {
    renderAt(PLAYER_PATH, authValue(memberWith(["quizshow"])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAYER_PATH);
  });

  it("renders the presenter screen for a host holding the grant", async () => {
    renderAt(SCREEN_PATH, authValue(memberWith(["quizshow"])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(SCREEN_PATH);
  });

  it("holds on the loader while the session is still being checked", () => {
    renderAt(PLAYER_PATH, authValue(null, { isChecking: true }));
    expect(screen.getByTestId("session-loader")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAYER_PATH);
  });

  it("renders Pulse Live in demo mode without a grant", async () => {
    demoMode = true;
    renderAt(PLAYER_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAYER_PATH);
  });

  it("renders Pulse Live under pnpm dev without a grant", async () => {
    vi.stubEnv("DEV", true);
    renderAt(PLAYER_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAYER_PATH);
  });
});
