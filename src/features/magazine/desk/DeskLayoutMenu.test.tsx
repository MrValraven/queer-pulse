import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { DeskLayoutMenu, type DeskLayoutMenuProps } from "./DeskLayoutMenu";

// Reads the exact English copy for `desk.workbar.layoutTrigger`, so
// the trigger-name assertions pass once that key is in the catalogs.

async function renderMenu(overrides: Partial<DeskLayoutMenuProps> = {}) {
  const props: DeskLayoutMenuProps = {
    layout: "list",
    onLayout: vi.fn(),
    isCalendarAvailable: false,
    ...overrides,
  };
  render(
    <TestProviders>
      <DeskLayoutMenu {...props} />
    </TestProviders>,
  );
  await awaitCatalog("magazine");
  return props;
}

describe("DeskLayoutMenu", () => {
  it("names the current layout in the trigger's accessible name", async () => {
    await renderMenu({ layout: "board" });
    expect(screen.getByRole("button", { name: "Layout: Board" })).toBeVisible();
  });

  it("checks the current layout and switches on select", async () => {
    const user = userEvent.setup();
    const onLayout = vi.fn();
    await renderMenu({ layout: "list", onLayout });

    await user.click(screen.getByRole("button", { name: "Layout: Pipeline" }));
    expect(
      screen.getByRole("menuitemradio", { name: "Pipeline" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("menuitemradio", { name: "Board" }),
    ).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByRole("menuitemradio", { name: "Board" }));
    expect(onLayout).toHaveBeenCalledWith("board");
  });

  it("hides Calendar until it is available", async () => {
    const user = userEvent.setup();
    await renderMenu({ isCalendarAvailable: false });
    await user.click(screen.getByRole("button", { name: /^Layout:/ }));
    expect(
      screen.queryByRole("menuitemradio", { name: "Calendar" }),
    ).toBeNull();
  });

  it("offers Calendar once it is available", async () => {
    const user = userEvent.setup();
    await renderMenu({ isCalendarAvailable: true, layout: "calendar" });
    await user.click(screen.getByRole("button", { name: "Layout: Calendar" }));
    expect(
      screen.getByRole("menuitemradio", { name: "Calendar" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
