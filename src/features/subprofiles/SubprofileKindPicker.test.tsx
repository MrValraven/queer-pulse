import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import type { SubprofileKind } from "./api/subprofiles.api";
import { SubprofileKindPicker } from "./SubprofileKindPicker";

function renderPicker(currentKind: SubprofileKind, onClose?: () => void) {
  const onPickKind = vi.fn();
  render(
    <I18nProvider>
      <SubprofileKindPicker
        currentKind={currentKind}
        pendingKind={null}
        onPickKind={onPickKind}
        onClose={onClose}
      />
    </I18nProvider>,
  );
  return onPickKind;
}

describe("SubprofileKindPicker", () => {
  it("offers the other types of the same group to a musician", async () => {
    renderPicker("musician");
    expect(await screen.findByRole("button", { name: "DJ" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Drag performer" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Musician" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ceramicist" })).toBeNull();
  });

  it("reports the picked type", async () => {
    const user = userEvent.setup();
    const onPickKind = renderPicker("musician");
    await user.click(await screen.findByRole("button", { name: "DJ" }));
    expect(onPickKind).toHaveBeenCalledWith("dj");
  });

  it("gives an Other persona the full picker without the Other type", async () => {
    renderPicker("generic");
    expect(
      await screen.findByRole("searchbox", { name: "Search crafts" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ceramicist" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "DJ" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Other" })).toBeNull();
  });

  it("keeps the Other picker inside a scroll area of its own", async () => {
    renderPicker("generic");
    const searchField = await screen.findByRole("searchbox", {
      name: "Search crafts",
    });
    const scrollArea = screen.getByTestId("kind-picker-scroll");
    expect(scrollArea.contains(searchField)).toBe(true);
    expect(scrollArea.className).toMatch(/scrollArea/);
  });

  it("closes the Other picker from the button at the bottom", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderPicker("generic", onClose);
    await screen.findByRole("searchbox", { name: "Search crafts" });
    await user.click(screen.getByRole("button", { name: "Close type list" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows no close button without an onClose", async () => {
    renderPicker("generic");
    await screen.findByRole("searchbox", { name: "Search crafts" });
    expect(
      screen.queryByRole("button", { name: "Close type list" }),
    ).toBeNull();
  });
});
