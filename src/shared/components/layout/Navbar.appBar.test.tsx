import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../../../features/marketing/cookies.data";
import { DisplayModeContext } from "../../../app/providers/displayModeContext";
import { NavDrawerProvider } from "../../../app/providers/NavDrawerProvider";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { TestProviders } from "../../../test/TestProviders";
import { Navbar } from "./Navbar";

/**
 * `Navbar`'s `isAppBar` branch (hamburger removed in favor of the
 * notifications bell / sign-in link, `.appBar` styling applied) fires on any
 * mobile view — `(max-width: 860px)` — regardless of `DisplayModeContext`'s
 * `isInstalled`. The bottom tab bar's "More" tab owns the drawer now, so the
 * hamburger is gone whether the app is installed or just open in a mobile
 * browser tab. Mirrors the stub in BottomTabBar.test.tsx.
 */
function stubMobileMediaQuery() {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("max-width: 860px"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

// TestProviders already renders a MemoryRouter internally; nesting a second
// Router (or forgetting this and reaching for one) makes React Router v7 throw
// "You cannot render a <Router> inside another <Router>".
function renderNavbar(displayMode: "standalone" | "browser") {
  stubMobileMediaQuery();
  return render(
    <TestProviders>
      <DisplayModeContext.Provider
        value={{
          displayMode,
          isInstalled: displayMode === "standalone",
        }}
      >
        <NavDrawerProvider>
          <Navbar />
        </NavDrawerProvider>
      </DisplayModeContext.Provider>
    </TestProviders>,
  );
}

describe("Navbar app-bar branch", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("hides the hamburger and shows the notifications bell when installed on mobile, logged in", () => {
    // AuthProvider's demo session defaults to logged-in unless localStorage
    // says otherwise (see AuthProvider.tsx getInitialLoggedIn).
    renderNavbar("standalone");

    expect(
      screen.queryByRole("button", { name: /open menu/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("also hides the hamburger and shows the notifications bell in an ordinary mobile browser tab (not just installed)", () => {
    // The bottom tab bar's "More" tab opens the drawer on any mobile view now,
    // so the browser-tab case must match the installed case exactly — no
    // hamburger, same bell.
    renderNavbar("browser");

    expect(
      screen.queryByRole("button", { name: /open menu/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("shows the sign-in link instead of the bell when installed on mobile, logged out", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderNavbar("standalone");

    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /notifications/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open menu/i }),
    ).not.toBeInTheDocument();
  });

  it("applies the appBar class to the nav when installed on mobile", () => {
    renderNavbar("standalone");

    // vitest.config.ts sets `css: false`, so CSS Module imports resolve
    // through a proxy that returns `_<property>_<hash>` for every class
    // (Vitest's CSSEnablerPlugin, "stable" strategy) rather than undefined —
    // a readable string, just not the bare `appBar` literal. Assert on the
    // property name as a substring instead of an exact match.
    expect(screen.getByRole("navigation").className).toContain("appBar");
  });

  it("applies the appBar class to the nav in an ordinary mobile browser tab too", () => {
    renderNavbar("browser");

    expect(screen.getByRole("navigation").className).toContain("appBar");
  });
});

/**
 * `Navbar` gates `<MobileNavDrawer />` on `isMobile`, but the open state lives
 * in NavDrawerProvider, which outlives that gate. Without an explicit close,
 * resizing past 860px unmounts the drawer while `drawerOpen` stays true — so
 * resizing back down reopens a drawer nobody asked for.
 */
function stubResizableMediaQuery() {
  let mobileMatches = true;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query.includes("max-width: 860px") ? mobileMatches : false;
    },
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_event: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => false,
  }));
  return {
    setMobile(next: boolean) {
      mobileMatches = next;
      act(() => {
        listeners.forEach((listener) => listener());
      });
    },
  };
}

// Navbar no longer renders its own drawer trigger on mobile — the bottom tab
// bar's "More" tab owns that job now (a later task). This stand-in trigger
// opens the same NavDrawerProvider Navbar reads from, so the resize-guard
// effect can still be exercised against a real open drawer.
function DrawerTrigger() {
  const { openSheet } = useNavDrawer();
  return (
    <button type="button" onClick={() => openSheet("browse")}>
      open drawer
    </button>
  );
}

describe("Navbar mobile-drawer gate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("closes the drawer when the viewport grows past the mobile breakpoint", async () => {
    // The provider pops its own history entry on close; stub it so jsdom does
    // not actually traverse session history mid-test.
    vi.spyOn(window.history, "back").mockImplementation(() => {});
    const mediaQuery = stubResizableMediaQuery();
    const user = userEvent.setup();
    render(
      <TestProviders>
        <DisplayModeContext.Provider
          value={{ displayMode: "browser", isInstalled: false }}
        >
          <NavDrawerProvider>
            <DrawerTrigger />
            <Navbar />
          </NavDrawerProvider>
        </DisplayModeContext.Provider>
      </TestProviders>,
    );

    await user.click(screen.getByRole("button", { name: "open drawer" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    mediaQuery.setMobile(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Back under the breakpoint: the drawer must NOT come back already open.
    mediaQuery.setMobile(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
