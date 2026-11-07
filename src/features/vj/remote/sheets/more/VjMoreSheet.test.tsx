import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import { VjMoreSheet, type VjMoreSheetProps } from "./VjMoreSheet";

async function renderMoreSheet(overrides: Partial<VjMoreSheetProps> = {}) {
  const props: VjMoreSheetProps = {
    isCueMode: false,
    isClearBlocked: false,
    onOpen: vi.fn(),
    onSetCueMode: vi.fn(),
    onClearScreen: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjMoreSheet {...props} />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return { ...view, props };
}

const SHEET_BUTTONS = [
  { name: "Text on screen", sheet: "text" },
  { name: "Shuffle", sheet: "shuffle" },
  { name: "Mix", sheet: "mix" },
  { name: "Scenes and set lists", sheet: "scenes" },
  { name: "Screens", sheet: "screens" },
  { name: "Event card", sheet: "eventCard" },
  { name: "MIDI controller", sheet: "midi" },
  { name: "All effects", sheet: "effects" },
  { name: "Keyboard shortcuts", sheet: "shortcuts" },
] as const;

describe("VjMoreSheet", () => {
  it("each row opens its sheet", async () => {
    const onOpen = vi.fn();
    await renderMoreSheet({ onOpen });
    expect(
      screen.getByRole("dialog", { name: "More controls" }),
    ).toBeInTheDocument();
    for (const { name, sheet } of SHEET_BUTTONS) {
      fireEvent.click(screen.getByRole("button", { name }));
      expect(onOpen).toHaveBeenLastCalledWith(sheet);
    }
    expect(onOpen).toHaveBeenCalledTimes(SHEET_BUTTONS.length);
  });

  it("the cue mode row flips its label", async () => {
    const onSetCueMode = vi.fn();
    const { rerender, props } = await renderMoreSheet({ onSetCueMode });
    fireEvent.click(screen.getByRole("button", { name: "Turn on cue mode" }));
    expect(onSetCueMode).toHaveBeenLastCalledWith(true);

    rerender(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjMoreSheet {...props} isCueMode />
        </LazyMotion>
      </TestProviders>,
    );
    expect(
      screen.queryByRole("button", { name: "Turn on cue mode" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Turn off cue mode" }));
    expect(onSetCueMode).toHaveBeenLastCalledWith(false);
  });

  it("Clear the screen calls onClearScreen", async () => {
    const onClearScreen = vi.fn();
    await renderMoreSheet({ onClearScreen });
    fireEvent.click(screen.getByRole("button", { name: "Clear the screen" }));
    expect(onClearScreen).toHaveBeenCalledTimes(1);
  });

  it("a blocked Clear the screen stays focusable and sends nothing", async () => {
    const onClearScreen = vi.fn();
    await renderMoreSheet({ onClearScreen, isClearBlocked: true });
    const clearButton = screen.getByRole("button", {
      name: "Clear the screen",
    });
    expect(clearButton).toHaveAttribute("aria-disabled", "true");
    expect(clearButton).not.toBeDisabled();
    fireEvent.click(clearButton);
    expect(onClearScreen).not.toHaveBeenCalled();
  });

  it("the footer button closes the sheet", async () => {
    const onClose = vi.fn();
    await renderMoreSheet({ onClose });
    fireEvent.click(
      screen.getByRole("button", { name: "Close more controls" }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("marks only the keyboard shortcuts row as keyboard-only", async () => {
    await renderMoreSheet();
    const shortcutsRow = screen
      .getByRole("button", { name: "Keyboard shortcuts" })
      .closest("li");
    expect(shortcutsRow).toHaveAttribute("data-vj-keyboard-only", "");
    const textRow = screen
      .getByRole("button", { name: "Text on screen" })
      .closest("li");
    expect(textRow).not.toHaveAttribute("data-vj-keyboard-only");
  });

  it("hides the keyboard-only row under a coarse pointer", () => {
    const moreCss = readFileSync(
      "src/features/vj/remote/sheets/more/VjMoreSheet.module.css",
      "utf8",
    );
    expect(moreCss).toMatch(
      /@media \(pointer: coarse\)\s*\{\s*\.list > \[data-vj-keyboard-only\]\s*\{\s*display: none;/,
    );
  });
});
