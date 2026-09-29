import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StickerPicker } from "./StickerPicker";

/** Demo mode is forced on in tests, so the picker reads the demo catalogue
 *  (Uno reverse, Blip, and Tea) with no network. */
async function renderPicker() {
  const onPick = vi.fn();
  const user = userEvent.setup();
  render(<StickerPicker onPick={onPick} />, { wrapper: TestProviders });
  const searchField = await screen.findByRole("searchbox");
  return { onPick, user, searchField };
}

describe("StickerPicker search", () => {
  it("filters every pack down to the stickers whose name or keywords match", async () => {
    const { user, searchField } = await renderPicker();
    expect(
      screen.getByRole("button", { name: "Blip says hi" }),
    ).toBeInTheDocument();

    await user.type(searchField, "hug");

    expect(
      screen.getByRole("button", { name: "Blip hug" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Blip says hi" }),
    ).not.toBeInTheDocument();
    // The rail has no sections to jump between during a search.
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("matches regardless of case", async () => {
    const { user, searchField } = await renderPicker();

    await user.type(searchField, "RAINBOW");

    expect(
      screen.getByRole("button", { name: "Rainbow reverse" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state and announces it when nothing matches", async () => {
    const { user, searchField } = await renderPicker();

    await user.type(searchField, "zzzz-no-sticker");

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).queryAllByRole("button", { name: /reverse|blip/i }),
    ).toHaveLength(0);
    const politeStatus = within(dialog).getByRole("status");
    expect(politeStatus).toHaveAttribute("aria-live", "polite");
    // The announcement never echoes the query, so it holds still while the
    // member keeps typing.
    await waitFor(() =>
      expect(politeStatus.textContent).toBe("No stickers found"),
    );
  });

  it("announces the result count politely", async () => {
    const { user, searchField } = await renderPicker();
    const politeStatus = within(screen.getByRole("dialog")).getByRole("status");
    expect(politeStatus.textContent).toBe("");

    await user.type(searchField, "hug");

    // Still quiet right after the keystroke; the count lands once typing
    // settles.
    expect(politeStatus.textContent).toBe("");
    await waitFor(() =>
      expect(politeStatus.textContent).toBe("1 sticker found"),
    );
  });

  it("clears the search, restores the packs and keeps focus in the field", async () => {
    const { user, searchField } = await renderPicker();
    await user.type(searchField, "hug");

    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(searchField).toHaveValue("");
    expect(searchField).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Blip says hi" }),
    ).toBeInTheDocument();
  });

  it("offers a way back from an empty search that refocuses the field", async () => {
    const { user, searchField } = await renderPicker();
    await user.type(searchField, "zzzz-no-sticker");

    // The field's own clear control comes first in the DOM; the empty
    // state's "Clear search" button is the second one.
    const clearButtons = screen.getAllByRole("button", {
      name: "Clear search",
    });
    expect(clearButtons).toHaveLength(2);
    const emptyStateClear = clearButtons[1];
    if (!emptyStateClear) throw new Error("empty state clear button missing");
    await user.click(emptyStateClear);

    expect(searchField).toHaveValue("");
    expect(searchField).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Blip says hi" }),
    ).toBeInTheDocument();
  });

  it("sends the picked search result", async () => {
    const { onPick, user, searchField } = await renderPicker();
    await user.type(searchField, "hug");

    await user.click(screen.getByRole("button", { name: "Blip hug" }));

    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "demo-sticker-blip-hug" }),
    );
  });
});
