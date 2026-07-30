import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { DisplayModeContext } from "../../../app/providers/displayModeContext";
import { NavDrawerProvider } from "../../../app/providers/NavDrawerProvider";
import { BottomTabBar } from "./BottomTabBar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { TestProviders } from "../../../test/TestProviders";

/** The bar only renders when installed AND under the mobile breakpoint. */
function stubInstalledMobile() {
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

// TestProviders already renders a MemoryRouter and takes the starting route as
// `initialEntries`. Nesting a second <MemoryRouter> inside it makes React Router
// v7 throw "You cannot render a <Router> inside another <Router>".
function renderBar(initialPath = "/") {
  stubInstalledMobile();
  return render(
    <TestProviders initialEntries={[initialPath]}>
      <DisplayModeContext.Provider
        value={{ displayMode: "standalone", isInstalled: true }}
      >
        <NavDrawerProvider>
          <BottomTabBar />
          <MobileNavDrawer />
        </NavDrawerProvider>
      </DisplayModeContext.Provider>
    </TestProviders>,
  );
}

describe("BottomTabBar visibility", () => {
  it("renders nothing when not installed", () => {
    stubInstalledMobile();
    render(
      <TestProviders>
        <DisplayModeContext.Provider
          value={{ displayMode: "browser", isInstalled: false }}
        >
          <NavDrawerProvider>
            <BottomTabBar />
          </NavDrawerProvider>
        </DisplayModeContext.Provider>
      </TestProviders>,
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders the tab slots when installed on mobile", () => {
    renderBar();
    const bar = screen.getByRole("navigation");
    // TestProviders mounts a logged-in demo session, so the bar renders the four
    // MEMBER_TABS (feed / events / messages / members) plus the More button.
    // There is never a sign-in tab — the installed-mode app bar owns sign-in.
    expect(bar.querySelectorAll("a")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /more/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /sign in/i }),
    ).not.toBeInTheDocument();
  });
});

describe("BottomTabBar active state", () => {
  it("marks exactly one link as the current page", () => {
    renderBar("/events");
    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
  });

  it("keeps the parent tab current on a nested route", () => {
    renderBar("/events/some-gathering");
    const current = screen
      .getAllByRole("link")
      .find((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveTextContent(/events/i);
  });

  it("marks no link current on an unrelated route", () => {
    renderBar("/about/press");
    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(0);
  });
});

describe("BottomTabBar More tab", () => {
  it("opens the drawer and reflects it in aria-expanded", async () => {
    const user = userEvent.setup();
    renderBar();
    const more = screen.getByRole("button", { name: /more/i });
    expect(more).toHaveAttribute("aria-expanded", "false");

    await user.click(more);

    expect(more).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("BottomTabBar accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = renderBar("/events");
    expect(await axe(container)).toHaveNoViolations();
  });
});
