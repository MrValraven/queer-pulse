import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavDrawerProvider } from "../../../app/providers/NavDrawerProvider";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { NAV_DRAWER_TRIGGER_ATTRIBUTE } from "./useNavDrawerFocus";
import { TestProviders } from "../../../test/TestProviders";

function OpenButton() {
  const { openDrawer } = useNavDrawer();
  return (
    <button type="button" onClick={openDrawer}>
      open drawer
    </button>
  );
}

function renderDrawer() {
  return render(
    <TestProviders>
      <NavDrawerProvider>
        <OpenButton />
        <MobileNavDrawer />
      </NavDrawerProvider>
    </TestProviders>,
  );
}

describe("MobileNavDrawer", () => {
  it("renders nothing while closed", () => {
    renderDrawer();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as a modal dialog and moves focus into the panel", async () => {
    const user = userEvent.setup();
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveFocus();
  });

  it("closes on Escape and restores focus to whatever opened it", async () => {
    const user = userEvent.setup();
    renderDrawer();
    const trigger = screen.getByRole("button", { name: "open drawer" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("traps Tab inside the panel", async () => {
    const user = userEvent.setup();
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));

    const dialog = screen.getByRole("dialog");
    // Tab repeatedly; focus must never escape to the trigger outside the panel.
    for (let tabPress = 0; tabPress < 30; tabPress += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });
});

/**
 * The Back gesture is the only dismissal an installed-PWA user reaches for, and
 * the drawer is the sole route to every mega-menu there — so Back must close it
 * rather than navigate underneath an unchanged full-screen overlay.
 *
 * NavDrawerProvider implements that by pushing one history entry when the
 * drawer opens (carrying the current URL, so nothing visibly navigates) and
 * popping it again on any non-Back dismissal. These tests pin both halves:
 * the entry appears exactly once, and it is never left behind as a dead press.
 */
describe("MobileNavDrawer Back-gesture handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Stand in for the browser's Back: the History API's own popstate event. */
  function pressBack() {
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  }

  it("never touches history while the drawer stays closed", () => {
    const pushState = vi.spyOn(window.history, "pushState");
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    renderDrawer();

    expect(pushState).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
  });

  it("pushes exactly one history entry when the drawer opens", async () => {
    const user = userEvent.setup();
    const pushState = vi.spyOn(window.history, "pushState");
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));

    expect(pushState).toHaveBeenCalledTimes(1);
    // Same URL — the entry exists only to give Back something to eat, so the
    // router's own idea of the location must not move.
    expect(pushState.mock.calls[0]?.[2]).toBeUndefined();
  });

  it("closes the drawer on Back instead of navigating", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    pressBack();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The gesture consumed the entry itself; popping again would eat a real
    // history entry and navigate the user off the page.
    expect(back).not.toHaveBeenCalled();
  });

  it("pops its own entry when closed by Escape, leaving no junk behind", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));
    await user.keyboard("{Escape}");

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("does not pop when a drawer link navigates away", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));
    // The drawer's links navigate with `replace`, which overwrites the pushed
    // entry — popping on top of that would undo the navigation itself.
    await user.click(screen.getByRole("link", { name: /search/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(back).not.toHaveBeenCalled();
  });

  it("stops listening for Back once the drawer is closed", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    renderDrawer();
    await user.click(screen.getByRole("button", { name: "open drawer" }));
    await user.keyboard("{Escape}");
    back.mockClear();

    // A later, unrelated Back must not be swallowed or re-enter the provider.
    pressBack();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(back).not.toHaveBeenCalled();
  });
});

/**
 * A trigger that can be unmounted while the drawer is still open — exactly what
 * happens when `isInstalled` flips true mid-session (an install completes, or a
 * desktop PWA is resized): Navbar drops the hamburger while the drawer stays
 * up, leaving the captured trigger detached from the document.
 */
function DisappearingTrigger({ children }: { children?: React.ReactNode }) {
  const { openDrawer } = useNavDrawer();
  const [triggerMounted, setTriggerMounted] = useState(true);
  return (
    <>
      {triggerMounted && (
        <button type="button" onClick={openDrawer}>
          open drawer
        </button>
      )}
      <button type="button" onClick={() => setTriggerMounted(false)}>
        unmount trigger
      </button>
      {children}
    </>
  );
}

describe("MobileNavDrawer focus restoration when the trigger disappears", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function openThenDetachTrigger(extra?: React.ReactNode) {
    vi.spyOn(window.history, "back").mockImplementation(() => {});
    const user = userEvent.setup();
    render(
      <TestProviders>
        <NavDrawerProvider>
          <DisappearingTrigger>{extra}</DisappearingTrigger>
          <MobileNavDrawer />
        </NavDrawerProvider>
      </TestProviders>,
    );
    await user.click(screen.getByRole("button", { name: "open drawer" }));
    await user.click(screen.getByRole("button", { name: "unmount trigger" }));
    return user;
  }

  it("falls back to whichever drawer trigger is still mounted", async () => {
    const moreTab = (
      <button type="button" {...{ [NAV_DRAWER_TRIGGER_ATTRIBUTE]: "" }}>
        more
      </button>
    );
    const user = await openThenDetachTrigger(moreTab);

    await user.keyboard("{Escape}");

    // Not <body>: focusing a detached node is a silent no-op, which would
    // strand a screen-reader user at the top of the document.
    expect(screen.getByRole("button", { name: "more" })).toHaveFocus();
    expect(document.body).not.toHaveFocus();
  });

  it("falls back to the page's main landmark when no trigger is mounted", async () => {
    const pageMain = <main data-page-main>page content</main>;
    const user = await openThenDetachTrigger(pageMain);

    await user.keyboard("{Escape}");

    const main = screen.getByRole("main");
    expect(main).toHaveFocus();
    // Programmatically focusable only — it must not enter the tab order.
    expect(main).toHaveAttribute("tabindex", "-1");
  });
});
