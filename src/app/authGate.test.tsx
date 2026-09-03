import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MemberRole } from "../features/auth/api/auth.api";
import { requiredCapability, useAuthGateRedirect } from "./authGate";

/**
 * `useAuthGateRedirect` reads `useAuth()` and `useDemoMode()` directly, so the
 * harness mocks both modules (precedent: `GenesisPage.test.tsx`,
 * `MemberFilterCards.staffBadge.test.tsx`) and drives the current pathname
 * through `MemoryRouter`, since the hook resolves it via `useLocation()`.
 */
let role: MemberRole | null = "member";
let staffRoles: string[] = [];
let demoMode = false;
let loggedIn = true;

vi.mock("./providers/authContext", () => ({
  useAuth: () => ({
    loggedIn,
    checking: false,
    role,
    status: "active",
    user: { onboardedAt: "2026-01-01T00:00:00.000Z" },
    staffRoles,
  }),
}));

vi.mock("./providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));

function wrapperAt(pathname: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
  );
}

describe("requiredCapability", () => {
  it("demands magazine_editor on the editorial dashboard and its sub-routes", () => {
    expect(requiredCapability("/magazine/editor")).toBe("magazine_editor");
    expect(requiredCapability("/magazine/editor/decks/1")).toBe(
      "magazine_editor",
    );
  });

  it("demands nothing elsewhere", () => {
    expect(requiredCapability("/magazine")).toBeNull();
    expect(requiredCapability("/mod/queue")).toBeNull();
  });
});

describe("useAuthGateRedirect: public support pages", () => {
  beforeEach(() => {
    loggedIn = false;
    role = null;
    staffRoles = [];
    demoMode = false;
  });

  it("lets a logged-out visitor reach the coming-out guide", () => {
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/coming-out"),
    });
    expect(result.current).toBeNull();
  });

  it("still bounces a logged-out visitor off a gated member surface", () => {
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/feed"),
    });
    expect(result.current).toBe("/auth/sign-in?next=%2Ffeed");
  });
});

describe("useAuthGateRedirect: installed-app launch", () => {
  beforeEach(() => {
    role = "member";
    staffRoles = [];
    demoMode = false;
  });

  it("sends a signed-in member from the manifest start_url to their feed", () => {
    loggedIn = true;
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/?mode=standalone"),
    });
    expect(result.current).toBe("/feed");
  });

  it("leaves a signed-in member alone on a plain visit to the homepage", () => {
    loggedIn = true;
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/"),
    });
    expect(result.current).toBeNull();
  });

  it("keeps a signed-out launch on the homepage", () => {
    loggedIn = false;
    role = null;
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/?mode=standalone"),
    });
    expect(result.current).toBeNull();
  });
});

describe("useAuthGateRedirect: /magazine/editor capability gate", () => {
  beforeEach(() => {
    loggedIn = true;
    role = "member";
    staffRoles = [];
    demoMode = false;
  });

  it("redirects a member without the magazine_editor grant away", () => {
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/magazine/editor"),
    });
    expect(result.current).toBe("/");
  });

  it("admits a member who holds the magazine_editor grant", () => {
    staffRoles = ["magazine_editor"];
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/magazine/editor"),
    });
    expect(result.current).toBeNull();
  });

  it("admits an admin regardless of staffRoles (superset)", () => {
    role = "admin";
    staffRoles = [];
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/magazine/editor"),
    });
    expect(result.current).toBeNull();
  });

  it("redirects a moderator without the grant (tier alone no longer suffices)", () => {
    role = "moderator";
    staffRoles = [];
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/magazine/editor"),
    });
    expect(result.current).toBe("/");
  });
});
