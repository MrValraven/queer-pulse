import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MemberRole } from "../features/auth/api/auth.api";
import {
  isGatedPath,
  requiredCapability,
  useAuthGateRedirect,
} from "./authGate";

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
// `accountStatus` and `suspendedUntil` drive the account-state branches
// (deactivated, suspended, permanently banned). A permanent ban is
// `status === "suspended"` with `suspendedUntil` absent, which is why the two
// have to move independently.
let accountStatus = "active";
let suspendedUntil: string | null = null;

vi.mock("./providers/authContext", () => ({
  useAuth: () => ({
    loggedIn,
    checking: false,
    role,
    status: accountStatus,
    user: { onboardedAt: "2026-01-01T00:00:00.000Z", suspendedUntil },
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

  it("demands magazine_writer on the writer workspace", () => {
    expect(requiredCapability("/magazine/writer")).toBe("magazine_writer");
    expect(requiredCapability("/magazine/writer/pieces/1")).toBe(
      "magazine_writer",
    );
  });

  // PRD-125. The member's own pitch tracker reads
  // `GET /magazine/submissions/mine`, guarded by `ActiveMemberGuard` alone, and
  // every member's account menu links to it. It used to sit behind
  // `magazine_writer`, which bounced plain members onto the visitor homepage.
  it("demands no capability on the member's own pitch tracker", () => {
    expect(requiredCapability("/magazine/pitches")).toBeNull();
    // Still closed to logged-out visitors, though: dropping the capability
    // opened it to every MEMBER, never to the public.
    expect(isGatedPath("/magazine/pitches")).toBe(true);
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

/**
 * PRD-125. `/magazine/pitches` is the member's own submission tracker: the
 * account menu links every member to it and the endpoint it reads
 * (`GET /magazine/submissions/mine`) is `ActiveMemberGuard`ed. The gate has to
 * admit a plain member and still turn a logged-out visitor away.
 */
describe("useAuthGateRedirect: the member's own pitch tracker", () => {
  beforeEach(() => {
    loggedIn = true;
    role = "member";
    staffRoles = [];
    demoMode = false;
  });

  it("admits a plain member who holds no staff grant at all", () => {
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/magazine/pitches"),
    });
    expect(result.current).toBeNull();
  });

  it("still sends a logged-out visitor to sign-in", () => {
    loggedIn = false;
    role = null;
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/magazine/pitches"),
    });
    expect(result.current).toBe("/auth/sign-in?next=%2Fmagazine%2Fpitches");
  });
});

/**
 * PRD-300. A permanently banned member is `status === "suspended"` with no
 * `suspendedUntil`, so they land on `/system/account-banned`, whose own
 * "Request full data erasure" button targets `/account/data-export`. Before
 * this exemption that button was a loop: every gated `/account/*` path bounced
 * straight back to the page the member had just pressed the button on.
 *
 * The server has always allowed it. `AccountController` carries no
 * `ActiveMemberGuard` precisely so account lifecycle actions stay reachable, so
 * the gap was the client gate forbidding what the API permits. These tests pin
 * the exemption open, and pin shut the much larger surface around it.
 */
describe("useAuthGateRedirect: leaving and exporting under an account sanction", () => {
  beforeEach(() => {
    loggedIn = true;
    role = "member";
    staffRoles = [];
    demoMode = false;
  });

  afterEach(() => {
    accountStatus = "active";
    suspendedUntil = null;
    demoMode = false;
  });

  describe("a permanently banned member", () => {
    beforeEach(() => {
      accountStatus = "suspended";
      suspendedUntil = null;
    });

    it("reaches the data export the banned page sends them to", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/account/data-export"),
      });
      expect(result.current).toBeNull();
    });

    it("reaches delete-account", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/account/delete-account"),
      });
      expect(result.current).toBeNull();
    });

    it("keeps the appeal reachable", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/safety/appeal"),
      });
      expect(result.current).toBeNull();
    });

    // The exemption is two paths wide. Everything else under the same gated
    // prefix still bounces, or this stops being an exemption and becomes a hole.
    it("still bounces the rest of the account hub to the banned page", () => {
      for (const gatedPath of [
        "/account",
        "/account/settings",
        "/account/sessions",
        "/feed",
      ]) {
        const { result } = renderHook(() => useAuthGateRedirect(), {
          wrapper: wrapperAt(gatedPath),
        });
        expect(result.current).toBe("/system/account-banned");
      }
    });

    it("still reads public pages", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/privacy"),
      });
      expect(result.current).toBeNull();
    });
  });

  describe("a temporarily suspended member", () => {
    beforeEach(() => {
      accountStatus = "suspended";
      suspendedUntil = "2099-01-01T00:00:00.000Z";
    });

    it("reaches the export and delete pages", () => {
      for (const exemptPath of [
        "/account/data-export",
        "/account/delete-account",
      ]) {
        const { result } = renderHook(() => useAuthGateRedirect(), {
          wrapper: wrapperAt(exemptPath),
        });
        expect(result.current).toBeNull();
      }
    });

    it("bounces the rest of the member surface to the suspended page", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/feed"),
      });
      expect(result.current).toBe("/system/account-suspended");
    });
  });

  describe("a deactivated member inside the erasure grace window", () => {
    beforeEach(() => {
      accountStatus = "deactivated";
    });

    // This is the last window in which an export is worth anything: the data is
    // about to be deleted permanently.
    it("reaches the data export", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/account/data-export"),
      });
      expect(result.current).toBeNull();
    });

    it("still funnels everything else to delete-account", () => {
      const { result } = renderHook(() => useAuthGateRedirect(), {
        wrapper: wrapperAt("/account/sessions"),
      });
      expect(result.current).toBe("/account/delete-account");
    });
  });

  // Demo mode carries no real account status, so none of these branches may
  // fire there: the demo tour has to stay walkable.
  it("never fires in demo mode", () => {
    demoMode = true;
    accountStatus = "suspended";
    const { result } = renderHook(() => useAuthGateRedirect(), {
      wrapper: wrapperAt("/feed"),
    });
    expect(result.current).toBeNull();
  });
});
