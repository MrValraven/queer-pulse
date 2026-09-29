import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { DeskView } from "../api/deskViews.api";
import { DeskViewsMenu, type DeskViewsMenuProps } from "./DeskViewsMenu";

// Reads the exact English copy from the catalog, so this passes once the
// relevant keys are added.

const VIEWS: DeskView[] = [
  {
    id: "view-close",
    name: "Close week",
    query: { track: "issue", focus: ["late", "ready"] },
    position: 0,
  },
  {
    id: "view-mine",
    name: "My queue",
    query: { focus: ["mine"] },
    position: 1,
  },
];

function renderMenu(overrides: Partial<DeskViewsMenuProps> = {}) {
  const props: DeskViewsMenuProps = {
    views: VIEWS,
    isLoading: false,
    currentQuery: { track: "issue" },
    onApply: vi.fn(),
    onCreate: vi.fn().mockResolvedValue(undefined),
    onRename: vi.fn().mockResolvedValue(undefined),
    onRemove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  render(
    <TestProviders>
      <DeskViewsMenu {...props} />
    </TestProviders>,
  );
  return props;
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^Views/ }));
  return user;
}

describe("DeskViewsMenu: the list", () => {
  it("offers the save action when there are no views yet", async () => {
    renderMenu({ views: [] });
    await openMenu();
    expect(
      screen.getByRole("menuitem", { name: "No saved views yet" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("menuitem", { name: "Save current view…" }),
    ).toBeEnabled();
    expect(
      screen.queryByRole("menuitem", { name: "Manage views…" }),
    ).not.toBeInTheDocument();
  });

  it("ticks and names the view on screen, and applies a pick", async () => {
    const props = renderMenu({
      currentQuery: { track: "issue", focus: ["ready", "late"] },
    });
    expect(
      screen.getByRole("button", { name: /Views\s*Close week/ }),
    ).toBeInTheDocument();
    const user = await openMenu();
    expect(
      screen.getByRole("menuitemradio", { name: "Close week" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "My queue" }),
    ).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByRole("menuitemradio", { name: "My queue" }));
    expect(props.onApply).toHaveBeenCalledWith(VIEWS[1]);
  });

  it("rests the save action once the list is full", async () => {
    const fullList = Array.from({ length: 20 }, (_entry, position) => ({
      id: `view-${position}`,
      name: `View ${position}`,
      query: {},
      position,
    }));
    renderMenu({ views: fullList });
    await openMenu();
    expect(
      screen.getByRole("menuitem", { name: "Save current view…" }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});

describe("DeskViewsMenu: saving", () => {
  it("saves the current query under the typed name", async () => {
    const props = renderMenu();
    const user = await openMenu();
    await user.click(
      screen.getByRole("menuitem", { name: "Save current view…" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Save this view" });
    await user.type(within(dialog).getByLabelText(/Name/), "  Desk triage ");
    await user.click(within(dialog).getByRole("button", { name: "Save view" }));

    expect(props.onCreate).toHaveBeenCalledWith("Desk triage", {
      track: "issue",
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("refuses a name already in use before sending", async () => {
    const props = renderMenu();
    const user = await openMenu();
    await user.click(
      screen.getByRole("menuitem", { name: "Save current view…" }),
    );
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/Name/), "My queue{Enter}");

    expect(props.onCreate).not.toHaveBeenCalled();
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "You already have a saved view with this name.",
    );
  });

  it("explains a 409 from the server beside the field", async () => {
    renderMenu({
      onCreate: vi
        .fn()
        .mockRejectedValue(
          new ApiError(409, "You already have a saved view with this name."),
        ),
    });
    const user = await openMenu();
    await user.click(
      screen.getByRole("menuitem", { name: "Save current view…" }),
    );
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/Name/), "Fresh{Enter}");

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "You already have a saved view with this name.",
    );
    expect(dialog).toBeInTheDocument();
  });
});

describe("DeskViewsMenu: managing", () => {
  it("renames a view in place", async () => {
    const props = renderMenu();
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Manage views…" }));
    const dialog = screen.getByRole("dialog", { name: "Your saved views" });
    await user.click(
      within(dialog).getByRole("button", { name: "Rename My queue" }),
    );
    const field = within(dialog).getByLabelText("New name for My queue");
    await user.clear(field);
    await user.type(field, "Mine first{Enter}");

    expect(props.onRename).toHaveBeenCalledWith("view-mine", "Mine first");
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Rename My queue" }),
      ).toHaveFocus(),
    );
  });

  it("deletes a view after the confirmation", async () => {
    const props = renderMenu();
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Manage views…" }));
    await user.click(screen.getByRole("button", { name: "Delete Close week" }));
    expect(props.onRemove).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Delete view" }));

    expect(props.onRemove).toHaveBeenCalledWith("view-close");
  });
});
