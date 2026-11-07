import type { ComponentProps } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalog } from "../../../../test/awaitCatalog";
import {
  VjMidiLearnProvider,
  useVjMidiLearn,
  type VjMidiLearnValue,
} from "../midi/VjMidiLearnContext";
import { VjRemoteTile, type VjTileState } from "./VjRemoteTile";

/** Hands the test the current MIDI learn value on every render. */
function LearnProbe(props: { onValue: (value: VjMidiLearnValue) => void }) {
  props.onValue(useVjMidiLearn());
  return null;
}

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

async function renderTile(
  overrides: Partial<ComponentProps<typeof VjRemoteTile>> = {},
) {
  const onTapClip = vi.fn<(clipId: string, index: number) => void>();
  const onToggleFavorite =
    vi.fn<(clipId: string, isFavorite: boolean) => void>();
  const onShowFailure = vi.fn<(clipId: string) => void>();
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
          onShowFailure={onShowFailure}
          {...overrides}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  const tileRoot = view.container.querySelector<HTMLElement>("[data-vj-tile]");
  if (!tileRoot) throw new Error("tile root missing");
  return { ...view, tileRoot, onTapClip, onToggleFavorite, onShowFailure };
}

function describedTextOf(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" | ");
}

describe("VjRemoteTile", () => {
  it("marks live, cued, pending and next bar", async () => {
    const { tileRoot } = await renderTile({
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

  it("shows the play label and no tags on a quiet tile", async () => {
    const { tileRoot } = await renderTile();
    expect(
      screen.getByRole("button", { name: "Show Neon rain on the screen" }),
    ).not.toHaveAttribute("aria-current");
    expect(tileRoot).toHaveAttribute("data-live", "false");
    expect(screen.queryByText("Next beat")).not.toBeInTheDocument();
    expect(screen.queryByText("Cued")).not.toBeInTheDocument();
  });
});

describe("VjRemoteTile failure badge", () => {
  it("a failed clip names its reason", async () => {
    const { tileRoot } = await renderTile({
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
    expect(description).toContain(
      "The screen's browser can't play this file. Upload it again in the VJ library as MP4 (H.264)",
    );
  });

  it("the failure badge is its own button that opens the reason sheet", async () => {
    const { tileRoot, onTapClip, onShowFailure } = await renderTile({
      tabIndex: -1,
      state: {
        ...READY_STATE,
        readiness: { state: "failed", progress: 0, failure: "network" },
      },
    });
    const badge = screen.getByRole("button", {
      name: "See why Neon rain couldn't load",
    });
    expect(badge).toHaveAttribute("data-vj-failure-badge");
    expect(badge).toHaveAttribute("aria-haspopup", "dialog");
    expect(badge).toHaveAttribute("tabindex", "-1");
    expect(badge.querySelector("svg")).toHaveAttribute("fill", "none");
    const mainButton = screen.getByRole("button", {
      name: "Show Neon rain on the screen",
    });
    expect(mainButton.contains(badge)).toBe(false);
    expect(tileRoot.contains(badge)).toBe(true);
    fireEvent.click(badge);
    expect(onShowFailure).toHaveBeenCalledWith("clip-neon");
    expect(onTapClip).not.toHaveBeenCalled();
  });

  it("a failure with no reason still shows the badge", async () => {
    await renderTile({
      state: {
        ...READY_STATE,
        readiness: { state: "failed", progress: 0, failure: null },
      },
    });
    expect(
      screen.getByRole("button", {
        name: "See why Neon rain couldn't load",
      }),
    ).toBeInTheDocument();
  });

  it("during MIDI learn the badge lets a tap through to pick the slot", async () => {
    const onTapClip = vi.fn<(clipId: string, index: number) => void>();
    const onShowFailure = vi.fn<(clipId: string) => void>();
    const latestLearn: { current: VjMidiLearnValue | null } = {
      current: null,
    };
    render(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjMidiLearnProvider onMapped={() => {}}>
            <LearnProbe
              onValue={(value) => {
                latestLearn.current = value;
              }}
            />
            <VjRemoteTile
              clip={CLIP}
              index={4}
              state={{
                ...READY_STATE,
                readiness: { state: "failed", progress: 0, failure: "network" },
              }}
              isCueMode={false}
              isBlocked={false}
              tabIndex={0}
              onTapClip={onTapClip}
              onToggleFavorite={() => {}}
              onShowFailure={onShowFailure}
            />
          </VjMidiLearnProvider>
        </LazyMotion>
      </TestProviders>,
    );
    await awaitCatalog("vj");
    const learn = () => {
      if (!latestLearn.current) throw new Error("learn value missing");
      return latestLearn.current;
    };
    const badge = screen.getByRole("button", {
      name: "See why Neon rain couldn't load",
    });
    expect(badge).not.toHaveAttribute("data-vj-learn-passthrough");
    act(() => learn().start());
    expect(badge).toHaveAttribute("data-vj-learn-passthrough", "");
    // jsdom ignores pointer-events, so the tap lands where the CSS sends it.
    fireEvent.click(
      screen.getByRole("button", { name: "Show Neon rain on the screen" }),
    );
    expect(learn().state).toEqual({
      kind: "waitControl",
      target: { kind: "clipSlot", index: 4 },
    });
    expect(onTapClip).not.toHaveBeenCalled();
    expect(onShowFailure).not.toHaveBeenCalled();
    act(() => learn().cancel());
    expect(badge).not.toHaveAttribute("data-vj-learn-passthrough");
  });

  it("a ready tile has no failure badge", async () => {
    const { tileRoot } = await renderTile();
    expect(tileRoot.querySelector("[data-vj-failure-badge]")).toBeNull();
  });
});

describe("VjRemoteTile progress, blocking and the star", () => {
  it("shows loading progress on the bottom edge", async () => {
    const { tileRoot } = await renderTile({
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

  it("blocked tiles are aria-disabled and send nothing", async () => {
    const { onTapClip } = await renderTile({
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

  it("a tap sends the clip with its index", async () => {
    const { onTapClip } = await renderTile();
    fireEvent.click(
      screen.getByRole("button", { name: "Show Neon rain on the screen" }),
    );
    expect(onTapClip).toHaveBeenCalledWith("clip-neon", 4);
  });

  it("the star is pressed with the accent fill on a favorite", async () => {
    await renderTile({ clip: { ...CLIP, isFavorite: true } });
    const star = screen.getByRole("button", {
      name: "Remove Neon rain from favorites",
    });
    expect(star).toHaveAttribute("aria-pressed", "true");
    expect(star.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });

  it("the star of a clip that is no favorite draws an outline only", async () => {
    await renderTile();
    const star = screen.getByRole("button", {
      name: "Add Neon rain to favorites",
    });
    expect(star).toHaveAttribute("aria-pressed", "false");
    expect(star.querySelector("svg")).toHaveAttribute("fill", "none");
  });
});
