import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "../features/auth/api/auth.api";
import { AuthContext, type AuthContextValue } from "./providers/authContext";
import { routes } from "./routeMap";
import { AppRoutes } from "./routes";

/**
 * The per-viewer Pulse Live gate in `AppRoutes`: signed out goes to sign-in
 * with `?next=` kept (except on the two public pages), signed in without the early-access grant plays freely but
 * goes to the roadmap from hosting pages, and a grant holder, demo and `pnpm dev` render the page.
 * The join page `/play/:code` and the TV page `/play/tv` open signed out; `/play`,
 * My games and the helper remote go to sign-in. The real
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
  const { routes: routeMap } = await import("./routeMap");
  const {
    QUIZSHOW_EDIT_ROUTE,
    QUIZSHOW_GAME_ROUTE,
    QUIZSHOW_HELPER_PAIR_ROUTE,
    QUIZSHOW_HELPER_REMOTE_ROUTE,
    QUIZSHOW_PLAY_CODE_ROUTE,
    QUIZSHOW_SCREEN_ROUTE,
    QUIZSHOW_TV_ROUTE,
  } = await import("../features/quizshow/quizshowPaths");
  return {
    quizshowRoutes: () => (
      <>
        <Route
          path={QUIZSHOW_SCREEN_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={QUIZSHOW_EDIT_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={QUIZSHOW_GAME_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={QUIZSHOW_TV_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={QUIZSHOW_HELPER_PAIR_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={QUIZSHOW_HELPER_REMOTE_ROUTE}
          element={<div data-testid="pulse-live-page" />}
        />
        <Route
          path={routeMap.play}
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
const PLAY_PATH = "/play";
const JOIN_CODE_PATH = "/play/ABC234";
const TV_PATH = "/play/tv";
const HELPER_PAIR_PATH = "/play/remote";
const HELPER_REMOTE_PATH = "/play/remote/session-1";
const GAMES_PATH = "/play/games";
const GAME_PATH = "/play/games/game-1";
const SCREEN_PATH = "/gatherings/pride-brunch-jun-abcde/quizshow/screen";
const EDIT_PATH = "/gatherings/pride-brunch-jun-abcde/quizshow/edit";

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

describe("AppRoutes: Pulse Live hosting gate", () => {
  beforeEach(() => {
    demoMode = false;
    vi.stubEnv("DEV", false);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("renders the join page for a signed-out visitor without the sign-in gate", async () => {
    renderAt(JOIN_CODE_PATH, authValue(null));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(screen.queryByTestId("sign-in-page")).not.toBeInTheDocument();
    expect(landedAt()).toBe(JOIN_CODE_PATH);
  });

  it("renders the TV pairing page for a signed-out visitor without the sign-in gate", async () => {
    renderAt(TV_PATH, authValue(null));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(screen.queryByTestId("sign-in-page")).not.toBeInTheDocument();
    expect(landedAt()).toBe(TV_PATH);
  });

  it.each([
    ["/play", PLAY_PATH],
    ["/play/games", GAMES_PATH],
    ["/play/remote", HELPER_PAIR_PATH],
    ["/play/remote/:sessionId", HELPER_REMOTE_PATH],
  ])("sends a signed-out visitor from %s to sign-in", async (_label, path) => {
    renderAt(path, authValue(null));
    expect(await screen.findByTestId("sign-in-page")).toBeInTheDocument();
    expect(landedAt()).toBe(
      `${routes.signIn}?next=${encodeURIComponent(path)}`,
    );
  });

  it("lets a signed-in member without the grant reach the TV page, the helper pairing page and a helper remote", async () => {
    for (const path of [TV_PATH, HELPER_PAIR_PATH, HELPER_REMOTE_PATH]) {
      cleanup();
      renderAt(path, authValue(memberWith([])));
      expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
      expect(landedAt()).toBe(path);
    }
  });

  it("lets a signed-in member without the grant play at /play/:code", async () => {
    renderAt(PLAYER_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAYER_PATH);
  });

  it("lets a signed-in member without the grant reach /play", async () => {
    renderAt(PLAY_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAY_PATH);
  });

  it("sends a member without the grant from a game page to the roadmap", async () => {
    renderAt(GAME_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("roadmap-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.roadmap);
  });

  it("renders a game page for a member holding the grant", async () => {
    renderAt(GAME_PATH, authValue(memberWith(["quizshow"])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(GAME_PATH);
  });

  it("sends a host without the grant away from the presenter screen", async () => {
    renderAt(SCREEN_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("roadmap-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.roadmap);
  });

  it("sends a host without the grant away from the event's quiz editor", async () => {
    renderAt(EDIT_PATH, authValue(memberWith([])));
    expect(await screen.findByTestId("roadmap-page")).toBeInTheDocument();
    expect(landedAt()).toBe(routes.roadmap);
  });

  it("renders the event's quiz editor for a host holding the grant", async () => {
    renderAt(EDIT_PATH, authValue(memberWith(["quizshow"])));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(landedAt()).toBe(EDIT_PATH);
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

  it("holds a gated path on the loader while the session is still being checked", () => {
    renderAt(PLAY_PATH, authValue(null, { isChecking: true }));
    expect(screen.getByTestId("session-loader")).toBeInTheDocument();
    expect(landedAt()).toBe(PLAY_PATH);
  });

  it("renders the join page with no loader while the session is still being checked", async () => {
    renderAt(PLAYER_PATH, authValue(null, { isChecking: true }));
    expect(await screen.findByTestId("pulse-live-page")).toBeInTheDocument();
    expect(screen.queryByTestId("session-loader")).not.toBeInTheDocument();
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
