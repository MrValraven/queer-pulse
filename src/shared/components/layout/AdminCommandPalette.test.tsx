import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { useAdminCommandPalette } from "./useAdminCommandPalette";

/** Surfaces the router's current path so a navigation is assertable. */
function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

/** The palette wired as AdminShell wires it: the hook owns the shortcut and
 *  the open state, and a field elsewhere on the page holds focus first. */
function PaletteHarness() {
  const palette = useAdminCommandPalette();
  return (
    <>
      <label>
        Filter rows
        <input type="text" />
      </label>
      <AdminCommandPalette isOpen={palette.isOpen} onClose={palette.close} />
      <Where />
    </>
  );
}

function renderPalette() {
  return render(
    <TestProviders initialEntries={["/admin"]}>
      <MotionProvider>
        <PaletteHarness />
      </MotionProvider>
    </TestProviders>,
  );
}

/** Opens the palette from the page field, the way an admin mid-task would. */
async function openFromField(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("textbox", { name: "Filter rows" }));
  await user.keyboard("{Meta>}k{/Meta}");
  return screen.findByRole("dialog", { name: "Jump to a page" });
}

function paletteField(dialog: HTMLElement) {
  return within(dialog).getByRole("combobox", { name: "Search admin pages" });
}

describe("AdminCommandPalette", () => {
  it("filters destinations as the query changes", async () => {
    const user = userEvent.setup();
    renderPalette();
    const dialog = await openFromField(user);

    // An empty query lists every destination, grouped by section.
    expect(
      within(dialog).getByRole("option", { name: /^Moderation\s*[0-9]*$/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("group", { name: "Trust & safety" }),
    ).toBeInTheDocument();

    await user.type(paletteField(dialog), "housing co");

    expect(
      within(dialog).getByRole("option", { name: /^Housing co-ops\s*[0-9]*$/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("option", { name: /^Moderation\s*[0-9]*$/ }),
    ).not.toBeInTheDocument();
  });

  it("Enter navigates to the active option and closes", async () => {
    const user = userEvent.setup();
    renderPalette();
    const dialog = await openFromField(user);

    await user.type(paletteField(dialog), "leads");
    expect(
      within(dialog).getByRole("option", {
        name: /^Leads\s*[0-9]*$/,
        selected: true,
      }),
    ).toBeInTheDocument();
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("where")).toHaveTextContent(routes.adminLeads);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("Escape closes and restores focus", async () => {
    const user = userEvent.setup();
    renderPalette();
    const dialog = await openFromField(user);
    expect(paletteField(dialog)).toHaveFocus();

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("textbox", { name: "Filter rows" })).toHaveFocus();
  });

  it("shows the empty message naming the query", async () => {
    const user = userEvent.setup();
    renderPalette();
    const dialog = await openFromField(user);

    await user.type(paletteField(dialog), "zzqx");

    expect(
      within(dialog).getByText("No admin page matches zzqx"),
    ).toBeInTheDocument();
    expect(within(dialog).queryAllByRole("option")).toHaveLength(0);
  });
});
