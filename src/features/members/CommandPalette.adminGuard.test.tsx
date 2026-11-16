import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CommandPalette } from "./CommandPalette";
import { OPEN_SEARCH_EVENT } from "./commandPaletteEvents";

/** The guard reads the browser's own location, which MemoryRouter leaves
 *  alone, so each test moves `window.location` itself. */
function visit(pathname: string) {
  window.history.pushState({}, "", pathname);
}

function renderMemberPalette(pathname: string) {
  visit(pathname);
  render(
    <TestProviders initialEntries={[pathname]}>
      <CommandPalette />
    </TestProviders>,
  );
}

describe("member CommandPalette under /admin", () => {
  afterEach(() => {
    visit("/");
  });

  it("does not open on Cmd+K under /admin", async () => {
    const user = userEvent.setup();
    renderMemberPalette("/admin/members");

    await user.keyboard("{Meta>}k{/Meta}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on Cmd+K elsewhere", async () => {
    const user = userEvent.setup();
    renderMemberPalette("/feed");

    await user.keyboard("{Meta>}k{/Meta}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("still opens from the open-search event under /admin", async () => {
    renderMemberPalette("/admin/members");

    act(() => {
      window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
