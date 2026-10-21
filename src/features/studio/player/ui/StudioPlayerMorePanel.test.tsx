import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioPlayerSurfaceValue } from "../studioPlayerSurface";
import { StudioPlayerMorePanel } from "./StudioPlayerMorePanel";
import {
  createStudioPlayerValue,
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
  surfaceHolder.current = createSurfaceValue();
});

async function openPanel() {
  fireEvent.click(
    await screen.findByRole("button", { name: "More player options" }),
  );
  return screen.findByRole("group", { name: "More player options" });
}

describe("StudioPlayerMorePanel", () => {
  it("sets crossfade and loudness", async () => {
    const { player } = renderWithPlayer(
      <StudioPlayerMorePanel placement="up" />,
    );
    await openPanel();
    const crossfade = screen.getByRole("slider", { name: "Crossfade length" });
    expect(crossfade).toHaveAttribute("aria-valuetext", "Off");
    expect(screen.getByText("Off")).toBeVisible();
    // The shared slider saves once it is let go.
    fireEvent.change(crossfade, { target: { value: "6" } });
    fireEvent.blur(crossfade);
    expect(player.setCrossfadeSeconds).toHaveBeenCalledWith(6);
    const loudness = screen.getByRole("switch", { name: "Even out loudness" });
    expect(loudness).toHaveAttribute("aria-checked", "true");
    fireEvent.click(loudness);
    expect(player.setLoudnessEven).toHaveBeenCalledWith(false);
  });

  it("shows a set crossfade length beside the slider", async () => {
    const player = createStudioPlayerValue({
      preferences: {
        volume: 1,
        isMuted: false,
        crossfadeSeconds: 6,
        isLoudnessEven: true,
      },
    });
    renderWithPlayer(<StudioPlayerMorePanel placement="up" />, { player });
    await openPanel();
    const crossfade = screen.getByRole("slider", { name: "Crossfade length" });
    expect(crossfade).toHaveValue("6");
    expect(crossfade).toHaveAttribute("aria-valuetext", "6 seconds");
    expect(screen.getByText("6 s")).toBeInTheDocument();
  });

  it("shows crossfade as unavailable in plain mode", async () => {
    const player = createStudioPlayerValue({ isPlainMode: true });
    renderWithPlayer(<StudioPlayerMorePanel placement="up" />, { player });
    await openPanel();
    const crossfade = screen.getByRole("slider", { name: "Crossfade length" });
    // At rest: the slider sits in an inert wrapper, and the hint says why.
    expect(crossfade.closest("[inert]")).not.toBeNull();
    expect(
      screen.getByText("Crossfade isn't available in this session"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("In this session it can only turn loud tracks down"),
    ).toBeInTheDocument();
    fireEvent.change(crossfade, { target: { value: "6" } });
    fireEvent.blur(crossfade);
    expect(player.setCrossfadeSeconds).not.toHaveBeenCalled();
  });

  it("opens the shortcuts sheet and closes itself", async () => {
    renderWithPlayer(<StudioPlayerMorePanel placement="up" />);
    await openPanel();
    fireEvent.click(screen.getByRole("button", { name: "Keyboard shortcuts" }));
    expect(surfaceHolder.current?.openShortcuts).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.queryByRole("group", { name: "More player options" }),
      ).toBeNull(),
    );
  });

  it("closes on Escape and returns focus to its trigger", async () => {
    renderWithPlayer(<StudioPlayerMorePanel placement="up" />);
    await openPanel();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    await waitFor(() => expect(screen.queryByRole("group")).toBeNull());
    expect(
      screen.getByRole("button", { name: "More player options" }),
    ).toHaveFocus();
  });

  it("keeps Escape inside the popover so an enclosing dialog stays open", async () => {
    const outerEscape = vi.fn();
    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") outerEscape();
    };
    document.addEventListener("keydown", onDocumentKeyDown);
    try {
      renderWithPlayer(<StudioPlayerMorePanel placement="up" />);
      await openPanel();
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
      await waitFor(() => expect(screen.queryByRole("group")).toBeNull());
      expect(outerEscape).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("keydown", onDocumentKeyDown);
    }
  });

  it("closes on Escape with focus on the page body and keeps it from the dialog", async () => {
    const outerEscape = vi.fn();
    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") outerEscape();
    };
    document.addEventListener("keydown", onDocumentKeyDown);
    try {
      renderWithPlayer(<StudioPlayerMorePanel placement="up" />);
      await openPanel();
      // A press on the panel's padding leaves focus on body; a key then
      // targets body.
      (document.activeElement as HTMLElement | null)?.blur();
      expect(document.body).toHaveFocus();
      fireEvent.keyDown(document.body, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("group")).toBeNull());
      expect(outerEscape).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "More player options" }),
      ).toHaveFocus();
    } finally {
      document.removeEventListener("keydown", onDocumentKeyDown);
    }
  });
});
