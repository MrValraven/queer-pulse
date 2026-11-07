import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { TestProviders } from "../../../../test/TestProviders";
import { VjRemoteTile, type VjTileState } from "./VjRemoteTile";

const CLIP: VjClipDTO = {
  id: "clip-neon",
  title: "Neon rain",
  mediaKind: "video",
  mimeType: "video/mp4",
  byteSize: 1_000_000,
  width: 1280,
  height: 720,
  durationMs: 8000,
  fitMode: "fill",
  thumbnailUrl: "/files/neon-rain.jpg",
  mediaUrl: "/files/neon-rain.mp4",
  packIds: ["pack-1"],
  packCount: 1,
  createdBy: null,
  createdAt: "2026-11-01T20:00:00.000Z",
  updatedAt: "2026-11-01T20:00:00.000Z",
  isFavorite: false,
  defaultSpeed: 1,
  loopInMs: null,
  loopOutMs: null,
  loopMode: "loop",
  previewUrl: "/files/neon-rain-preview.mp4",
};

const READY_STATE: VjTileState = {
  isLive: false,
  isPending: false,
  isArmed: false,
  pendingQuantize: null,
  readiness: { state: "ready", progress: 1, failure: null },
};

function renderTile(
  overrides: Partial<ComponentProps<typeof VjRemoteTile>> = {},
) {
  const onTapClip = vi.fn<(clipId: string, index: number) => void>();
  const onToggleFavorite =
    vi.fn<(clipId: string, isFavorite: boolean) => void>();
  const view = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <p id="blocked-reason">The remote is offline</p>
        <VjRemoteTile
          clip={CLIP}
          index={4}
          state={READY_STATE}
          isCueMode={false}
          isBlocked={false}
          tabIndex={0}
          onTapClip={onTapClip}
          onToggleFavorite={onToggleFavorite}
          {...overrides}
        />
      </LazyMotion>
    </TestProviders>,
  );
  const tileRoot = view.container.querySelector<HTMLElement>("[data-vj-tile]");
  if (!tileRoot) throw new Error("tile root missing");
  return { ...view, tileRoot, onTapClip, onToggleFavorite };
}

function describedTextOf(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" | ");
}

describe("VjRemoteTile", () => {
  it("marks live, cued, pending and next bar", () => {
    const { tileRoot } = renderTile({
      isCueMode: true,
      state: {
        ...READY_STATE,
        isLive: true,
        isArmed: true,
        isPending: true,
        pendingQuantize: "bar",
      },
    });
    expect(tileRoot).toHaveAttribute("data-live", "true");
    expect(tileRoot).toHaveAttribute("data-armed", "true");
    expect(tileRoot).toHaveAttribute("data-pending", "true");
    const mainButton = screen.getByRole("button", { name: "Cue Neon rain" });
    expect(mainButton).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Cued")).toBeInTheDocument();
    expect(screen.getByText("Next bar")).toBeInTheDocument();
    expect(
      tileRoot.querySelector("[data-vj-pending-ring]"),
    ).toBeInTheDocument();
    expect(describedTextOf(mainButton)).toContain("Cued");
    expect(describedTextOf(mainButton)).toContain("Next bar");
  });

  it("shows the play label and no tags on a quiet tile", () => {
    const { tileRoot } = renderTile();
    expect(
      screen.getByRole("button", { name: "Show Neon rain on the screen" }),
    ).not.toHaveAttribute("aria-current");
    expect(tileRoot).toHaveAttribute("data-live", "false");
    expect(screen.queryByText("Next beat")).not.toBeInTheDocument();
    expect(screen.queryByText("Cued")).not.toBeInTheDocument();
  });

  it("a failed clip names its reason", () => {
    const { tileRoot } = renderTile({
      state: {
        ...READY_STATE,
        readiness: { state: "failed", progress: 0, failure: "decode_failed" },
      },
    });
    const mainButton = screen.getByRole("button", {
      name: "Show Neon rain on the screen",
    });
    expect(mainButton).toHaveAttribute("data-dimmed", "true");
    expect(
      tileRoot.querySelector("[data-vj-failure-badge]"),
    ).toBeInTheDocument();
    const description = describedTextOf(mainButton);
    expect(description).toContain("Couldn't load on the screen");
    expect(description).toContain("The screen's browser can't play this clip");
  });

  it("shows loading progress on the bottom edge", () => {
    const { tileRoot } = renderTile({
      state: {
        ...READY_STATE,
        readiness: { state: "loading", progress: 0.4, failure: null },
      },
    });
    expect(tileRoot.querySelector("[data-vj-progress-value]")).toHaveAttribute(
      "data-vj-progress-value",
      "0.4",
    );
    expect(
      describedTextOf(
        screen.getByRole("button", { name: "Show Neon rain on the screen" }),
      ),
    ).toContain("40%");
  });

  it("blocked tiles are aria-disabled and send nothing", () => {
    const { onTapClip } = renderTile({
      isBlocked: true,
      blockedReasonId: "blocked-reason",
    });
    const mainButton = screen.getByRole("button", {
      name: "Show Neon rain on the screen",
    });
    expect(mainButton).toHaveAttribute("aria-disabled", "true");
    expect(mainButton).not.toHaveAttribute("disabled");
    expect(describedTextOf(mainButton)).toContain("The remote is offline");
    fireEvent.click(mainButton);
    expect(onTapClip).not.toHaveBeenCalled();
  });

  it("a tap sends the clip with its index", () => {
    const { onTapClip } = renderTile();
    fireEvent.click(
      screen.getByRole("button", { name: "Show Neon rain on the screen" }),
    );
    expect(onTapClip).toHaveBeenCalledWith("clip-neon", 4);
  });

  it("the star is pressed with the accent fill on a favorite", () => {
    renderTile({ clip: { ...CLIP, isFavorite: true } });
    const star = screen.getByRole("button", {
      name: "Remove Neon rain from favorites",
    });
    expect(star).toHaveAttribute("aria-pressed", "true");
    expect(star.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });

  it("the star of a clip that is no favorite draws an outline only", () => {
    renderTile();
    const star = screen.getByRole("button", {
      name: "Add Neon rain to favorites",
    });
    expect(star).toHaveAttribute("aria-pressed", "false");
    expect(star.querySelector("svg")).toHaveAttribute("fill", "none");
  });
});
