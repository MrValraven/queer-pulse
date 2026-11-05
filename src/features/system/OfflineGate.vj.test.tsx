import { useContext } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AuthContext,
  type AuthContextValue,
} from "../../app/providers/authContext";
import type { AuthUser } from "../auth/api/auth.api";
import { probeSignedInSession } from "../../shared/api/queryPersistence/sessionProbe";
import { VJ_SCREEN_SESSION_REPROBE_MS } from "../vj/screen/useVjScreenProvisionalSession";
import {
  VJ_SCREEN_SESSION_KEY,
  VJ_SCREEN_SESSION_MAX_AGE_MS,
  readVjScreenSession,
  saveVjScreenSession,
} from "../vj/screen/vjScreenSession";
import { OfflineGate } from "./OfflineGate";

const testState = vi.hoisted(() => ({
  isOnline: true,
  auth: null as AuthContextValue | null,
  messagingProvisionalUser: null as AuthUser | null,
}));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("../../app/providers/authContext", async (importOriginal) => {
  const actualModule =
    await importOriginal<typeof import("../../app/providers/authContext")>();
  return {
    ...actualModule,
    useAuth: () => {
      if (testState.auth === null) throw new Error("test auth is not set");
      return testState.auth;
    },
  };
});

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useOnlineStatus: () => testState.isOnline,
}));

vi.mock(
  "../../shared/api/queryPersistence/useMessagingCachePersistence",
  () => ({
    useMessagingCachePersistence: () => ({
      isRestorePending: false,
      hasSavedMessages: testState.messagingProvisionalUser !== null,
      provisionalUser: testState.messagingProvisionalUser,
    }),
  }),
);

vi.mock("../../shared/api/queryPersistence/sessionProbe", () => ({
  probeSignedInSession: vi.fn(),
}));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("./OfflinePage", () => ({
  OfflinePage: () => <p data-testid="offline-page" />,
}));

const VJ_SCREEN_PATH = "/admin/vj/screen";

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "admin-1",
    email: "admin@example.org",
    status: "active",
    role: "admin",
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-02T00:00:00.000Z",
    suspendedUntil: null,
    suspension: null,
    staffRoles: [],
    earlyAccessFeatures: [],
    profile: { slug: "alex-rivera", firstName: "Alex", lastName: "Rivera" },
    ...overrides,
  };
}

function buildAuth(user: AuthUser | null): AuthContextValue {
  return {
    loggedIn: user !== null,
    checking: false,
    preparing: false,
    user,
    status: user?.status ?? null,
    role: user?.role ?? null,
    staffRoles: [],
    authError: user === null ? { kind: "network" } : null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    endPreparing: vi.fn(),
    refresh: vi.fn(() => Promise.resolve()),
    markOnboarded: vi.fn(),
  };
}

function RoutedContent() {
  const authValue = useContext(AuthContext);
  return (
    <p data-testid="routed-content">
      {`${String(authValue?.loggedIn)}:${authValue?.role ?? "none"}:${authValue?.user?.id ?? "none"}`}
    </p>
  );
}

function GateAt({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <OfflineGate>
        <RoutedContent />
      </OfflineGate>
    </MemoryRouter>
  );
}

function routedAuthText(): string | null {
  return screen.queryByTestId("routed-content")?.textContent ?? null;
}

describe("OfflineGate on the VJ screen", () => {
  beforeEach(() => {
    localStorage.clear();
    testState.isOnline = true;
    testState.auth = buildAuth(null);
    testState.messagingProvisionalUser = null;
    vi.mocked(probeSignedInSession).mockReset();
    vi.mocked(probeSignedInSession).mockResolvedValue("unreachable");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("boots the VJ screen offline as the saved admin", () => {
    saveVjScreenSession(buildUser());
    testState.isOnline = false;

    render(<GateAt path={VJ_SCREEN_PATH} />);

    expect(routedAuthText()).toBe("true:admin:admin-1");
    expect(screen.queryByTestId("offline-page")).not.toBeInTheDocument();
  });

  it("shows the offline page on the VJ screen when no admin was saved", () => {
    testState.isOnline = false;

    render(<GateAt path={VJ_SCREEN_PATH} />);

    expect(screen.getByTestId("offline-page")).toBeInTheDocument();
    expect(routedAuthText()).toBeNull();
  });

  it("keeps the offline banner off the VJ screen", () => {
    vi.useFakeTimers();
    testState.auth = buildAuth(buildUser());
    const view = render(<GateAt path={VJ_SCREEN_PATH} />);

    testState.isOnline = false;
    view.rerender(<GateAt path={VJ_SCREEN_PATH} />);
    act(() => {
      vi.advanceTimersByTime(2_500);
    });

    expect(
      screen.queryByText("system:offline.sessionBanner"),
    ).not.toBeInTheDocument();
    expect(routedAuthText()).toBe("true:admin:admin-1");
  });

  it("keeps the provisional admin off every other route", () => {
    saveVjScreenSession(buildUser());
    testState.isOnline = false;

    render(<GateAt path="/admin" />);

    expect(screen.getByTestId("offline-page")).toBeInTheDocument();
    expect(routedAuthText()).toBeNull();
    expect(readVjScreenSession()).not.toBeNull();
  });

  it("adopts the session when the probe confirms it", async () => {
    saveVjScreenSession(buildUser());
    vi.mocked(probeSignedInSession).mockResolvedValue("confirmed");
    testState.isOnline = false;
    const signedOutAuth = testState.auth;
    const view = render(<GateAt path={VJ_SCREEN_PATH} />);
    expect(probeSignedInSession).not.toHaveBeenCalled();

    testState.isOnline = true;
    view.rerender(<GateAt path={VJ_SCREEN_PATH} />);

    await waitFor(() => {
      expect(signedOutAuth?.refresh).toHaveBeenCalledTimes(1);
    });
    expect(probeSignedInSession).toHaveBeenCalledTimes(1);
    expect(routedAuthText()).toBe("true:admin:admin-1");
    expect(readVjScreenSession()).not.toBeNull();
  });

  it("drops the provisional admin when the server says signed out", async () => {
    saveVjScreenSession(buildUser());
    vi.mocked(probeSignedInSession).mockResolvedValue("signedOut");
    testState.isOnline = false;
    const view = render(<GateAt path={VJ_SCREEN_PATH} />);
    expect(routedAuthText()).toBe("true:admin:admin-1");

    testState.isOnline = true;
    view.rerender(<GateAt path={VJ_SCREEN_PATH} />);

    await waitFor(() => {
      expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();
    });
    await waitFor(() => {
      expect(routedAuthText()).toBe("false:none:none");
    });
    expect(testState.auth?.refresh).not.toHaveBeenCalled();
  });

  it("saves the confirmed admin on the VJ screen and forgets them on sign out", () => {
    testState.auth = buildAuth(buildUser());
    const view = render(<GateAt path={VJ_SCREEN_PATH} />);

    expect(readVjScreenSession()?.userId).toBe("admin-1");

    testState.auth = buildAuth(null);
    view.rerender(<GateAt path={VJ_SCREEN_PATH} />);

    expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();
  });

  it("leaves the messages stand-in as it was", () => {
    vi.useFakeTimers();
    saveVjScreenSession(buildUser());
    testState.messagingProvisionalUser = buildUser({
      id: "member-1",
      role: "member",
    });
    testState.isOnline = false;

    render(<GateAt path="/messages" />);
    act(() => {
      vi.advanceTimersByTime(2_500);
    });

    expect(routedAuthText()).toBe("true:member:member-1");
    expect(
      screen.getByText("system:offline.savedMessagesBanner"),
    ).toBeInTheDocument();
    expect(probeSignedInSession).not.toHaveBeenCalled();
    expect(readVjScreenSession()?.userId).toBe("admin-1");
  });
});

describe("OfflineGate on the VJ screen when the server is out of reach", () => {
  beforeEach(() => {
    localStorage.clear();
    testState.isOnline = true;
    testState.auth = buildAuth(null);
    testState.messagingProvisionalUser = null;
    vi.mocked(probeSignedInSession).mockReset();
    vi.mocked(probeSignedInSession).mockResolvedValue("unreachable");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stands in as the saved admin when /auth/me failed on the network while online", async () => {
    saveVjScreenSession(buildUser());

    render(<GateAt path={VJ_SCREEN_PATH} />);

    expect(routedAuthText()).toBe("true:admin:admin-1");
    expect(screen.queryByTestId("offline-page")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(probeSignedInSession).toHaveBeenCalledTimes(1);
    });
    expect(routedAuthText()).toBe("true:admin:admin-1");
  });

  it("does not stand in after a server error, while checking or after a plain sign out", () => {
    saveVjScreenSession(buildUser());
    const signedOutAuths: AuthContextValue[] = [
      { ...buildAuth(null), authError: { kind: "server", status: 503 } },
      { ...buildAuth(null), checking: true, authError: null },
      { ...buildAuth(null), authError: null },
    ];
    for (const signedOutAuth of signedOutAuths) {
      testState.auth = signedOutAuth;
      const view = render(<GateAt path={VJ_SCREEN_PATH} />);
      expect(routedAuthText()).toBe("false:none:none");
      view.unmount();
    }
    expect(probeSignedInSession).not.toHaveBeenCalled();
  });

  it("does not stand in with a saved admin older than 7 days", () => {
    saveVjScreenSession(
      buildUser(),
      Date.now() - VJ_SCREEN_SESSION_MAX_AGE_MS - 1_000,
    );

    render(<GateAt path={VJ_SCREEN_PATH} />);

    expect(routedAuthText()).toBe("false:none:none");
    expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();
  });

  it("keeps the network stand-in off every other route", () => {
    saveVjScreenSession(buildUser());

    render(<GateAt path="/admin" />);

    expect(routedAuthText()).toBe("false:none:none");
    expect(probeSignedInSession).not.toHaveBeenCalled();
    expect(readVjScreenSession()).not.toBeNull();
  });

  it("asks again while unreachable and drops the stand-in on signed out", async () => {
    saveVjScreenSession(buildUser());
    vi.useFakeTimers();
    vi.mocked(probeSignedInSession)
      .mockResolvedValueOnce("unreachable")
      .mockResolvedValueOnce("signedOut");

    render(<GateAt path={VJ_SCREEN_PATH} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(probeSignedInSession).toHaveBeenCalledTimes(1);
    expect(routedAuthText()).toBe("true:admin:admin-1");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VJ_SCREEN_SESSION_REPROBE_MS);
    });

    expect(probeSignedInSession).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();
    expect(routedAuthText()).toBe("false:none:none");
  });

  it("never stands in once a confirmed user was seen on this mount", () => {
    testState.auth = buildAuth(buildUser());
    const view = render(<GateAt path={VJ_SCREEN_PATH} />);
    expect(routedAuthText()).toBe("true:admin:admin-1");

    // The same admin record is still saved when the session then fails on the network.
    saveVjScreenSession(buildUser());
    testState.auth = buildAuth(null);
    view.rerender(<GateAt path={VJ_SCREEN_PATH} />);

    expect(routedAuthText()).toBe("false:none:none");
  });
});
