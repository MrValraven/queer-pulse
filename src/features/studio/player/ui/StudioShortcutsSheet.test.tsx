import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STUDIO_PLAYER_SHORTCUTS } from "../studioShortcuts.data";
import type { StudioPlayerSurfaceValue } from "../studioPlayerSurface";
import { StudioShortcutsSheetHost } from "./StudioShortcutsSheet";
import {
  createSurfaceValue,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("../studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));

beforeEach(() => {
  surfaceHolder.current = createSurfaceValue({ isShortcutsOpen: true });
});

describe("StudioShortcutsSheetHost", () => {
  it("lists every player shortcut with readable keys", async () => {
    renderWithPlayer(<StudioShortcutsSheetHost />);
    const dialog = await screen.findByRole("dialog", {
      name: "Keyboard shortcuts",
    });
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(
      STUDIO_PLAYER_SHORTCUTS.length,
    );
    expect(within(dialog).getByText("Play or pause")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Space").length).toBeGreaterThan(0);
    expect(within(dialog).queryByText(/^studio:/)).toBeNull();
    expect(within(dialog).getByText("?")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Left arrow").length).toBeGreaterThan(0);
  });

  it("names arrow keys for screen readers in a combined chord", async () => {
    renderWithPlayer(<StudioShortcutsSheetHost />);
    const dialog = await screen.findByRole("dialog", {
      name: "Keyboard shortcuts",
    });
    const previousRow = within(dialog)
      .getByText("Previous track")
      .closest("li") as HTMLElement;
    expect(within(previousRow).getByText("Shift")).toBeInTheDocument();
    expect(within(previousRow).getByText("Left arrow")).toBeInTheDocument();
  });

  it("closes from its button", async () => {
    renderWithPlayer(<StudioShortcutsSheetHost />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Close shortcuts" }),
    );
    await waitFor(() =>
      expect(surfaceHolder.current?.closeShortcuts).toHaveBeenCalled(),
    );
  });
});
