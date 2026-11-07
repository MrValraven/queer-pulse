import { fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import { VJ_SHORTCUT_ROWS } from "../../input/vjKeymap";
import { VjShortcutsSheet } from "./VjShortcutsSheet";

async function renderShortcutsSheet(onClose: () => void = vi.fn()) {
  const renderedView = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjShortcutsSheet onClose={onClose} />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return renderedView;
}

/** The key caps of the row whose label reads `label`, in order. */
function keyCapsOf(label: string): string[] {
  const row = screen.getByText(label).closest("li");
  if (row === null) throw new Error(`No shortcut row for ${label}`);
  return Array.from(row.querySelectorAll("kbd")).map(
    (keyCap) => keyCap.textContent ?? "",
  );
}

describe("VjShortcutsSheet", () => {
  it("the shortcuts sheet lists every row with its keys", async () => {
    await renderShortcutsSheet();
    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(
      VJ_SHORTCUT_ROWS.length,
    );
    expect(keyCapsOf("Show clips 1 to 9")).toEqual(["1", "9"]);
    expect(keyCapsOf("Show clips 10 to 18")).toEqual(["A", "L"]);
    expect(keyCapsOf("Go in cue mode")).toEqual(["Space"]);
    expect(keyCapsOf("Blackout")).toEqual(["B"]);
    expect(keyCapsOf("Reset look")).toEqual(["R"]);
    expect(keyCapsOf("Tap tempo")).toEqual(["T"]);
    expect(keyCapsOf("Change quantize")).toEqual(["Q"]);
    expect(keyCapsOf("Move between clips")).toEqual(["Arrow keys"]);
    expect(keyCapsOf("Hold a dock pad while the keys are down")).toEqual([
      "Shift",
      "Z",
      ".",
    ]);
    expect(keyCapsOf("Show this list")).toEqual(["Shift", "/"]);
  });

  it("prints no raw i18n key on a chip", async () => {
    await renderShortcutsSheet();
    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    for (const keyCap of Array.from(dialog.querySelectorAll("kbd"))) {
      expect(keyCap.textContent).not.toMatch(/^vj:/);
    }
  });

  it("the footer button closes the sheet", async () => {
    const onClose = vi.fn();
    await renderShortcutsSheet(onClose);
    fireEvent.click(screen.getByRole("button", { name: "Close shortcuts" }));
    expect(onClose).toHaveBeenCalled();
  });
});
