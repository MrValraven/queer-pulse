import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { VjClipDTO, VjMix } from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import type { VjRun } from "../../useVjCommandRunner";
import { VjMixSheet } from "./VjMixSheet";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 5,
  isNoop: false,
  applyAt: null,
};

const PACK_ID = "a0000000-0000-4000-8000-000000000001";
const CLIP_IDS = [
  "c0000000-0000-4000-8000-000000000001",
  "c0000000-0000-4000-8000-000000000002",
  "c0000000-0000-4000-8000-000000000003",
] as const;

function createClip(clipId: string, title: string): VjClipDTO {
  return {
    id: clipId,
    title,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1000,
    width: 1920,
    height: 1080,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: `/files/${clipId}.jpg`,
    mediaUrl: `/files/${clipId}.mp4`,
    packIds: [PACK_ID],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-06T10:00:00.000Z",
    updatedAt: "2026-11-06T10:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
  };
}

const PACK_CLIPS: VjClipDTO[] = [
  createClip(CLIP_IDS[0], "Disco ball"),
  createClip(CLIP_IDS[1], "Neon rain"),
  createClip(CLIP_IDS[2], "Glitter tunnel"),
];

const EMPTY_MIX: VjMix = { clipId: null, amount: 0, blendMode: "normal" };

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome)) as unknown as VjRun &
    Mock<() => Promise<VjCommandOutcome>>;
}

async function renderSheet(run: VjRun, mix: Partial<VjMix> = {}) {
  const renderedView = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjMixSheet
          mix={{ ...EMPTY_MIX, ...mix }}
          packClips={PACK_CLIPS}
          liveClipId={CLIP_IDS[0]}
          stateRevision={4}
          run={run}
          isBlocked={false}
          onClose={() => {}}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return renderedView;
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

describe("VjMixSheet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("picking a clip sends it as the mix clip", async () => {
    const run = createRun();
    await renderSheet(run);
    expect(
      screen.queryByRole("button", { name: "Use Disco ball as the mix clip" }),
    ).not.toBeInTheDocument();
    const neonRain = screen.getByRole("button", {
      name: "Use Neon rain as the mix clip",
    });
    expect(neonRain).toHaveAttribute("aria-pressed", "false");
    await clickAndSettle(neonRain);
    expect(run).toHaveBeenCalledWith("setMix", { clipId: CLIP_IDS[1] });
    expect(neonRain).toHaveAttribute("aria-pressed", "true");
  });

  it("blend chips send the mode", async () => {
    const run = createRun();
    await renderSheet(run, { clipId: CLIP_IDS[1] });
    const normal = screen.getByRole("button", { name: "Normal" });
    expect(normal).toHaveAttribute("aria-pressed", "true");
    const screenMode = screen.getByRole("button", { name: "Screen" });
    await clickAndSettle(screenMode);
    expect(run).toHaveBeenCalledWith("setMix", { blendMode: "screen" });
    expect(screenMode).toHaveAttribute("aria-pressed", "true");
  });

  it("Swap is aria-disabled without a mix clip", async () => {
    const run = createRun();
    await renderSheet(run);
    const swap = screen.getByRole("button", { name: "Swap mix and live" });
    expect(swap).toHaveAttribute("aria-disabled", "true");
    expect(swap).toHaveAccessibleDescription("Pick a clip to mix in");
    await clickAndSettle(swap);
    expect(run).not.toHaveBeenCalled();
  });

  it("Swap mix and live sends swapMix with a mix clip", async () => {
    const run = createRun();
    await renderSheet(run, { clipId: CLIP_IDS[1], amount: 0.5 });
    const swap = screen.getByRole("button", { name: "Swap mix and live" });
    expect(swap).toHaveAttribute("aria-disabled", "false");
    await clickAndSettle(swap);
    expect(run).toHaveBeenCalledWith("swapMix");
  });

  it("Clear the mix sends a null clip", async () => {
    const run = createRun();
    await renderSheet(run, { clipId: CLIP_IDS[2], amount: 0.7 });
    await clickAndSettle(screen.getByRole("button", { name: "Clear the mix" }));
    expect(run).toHaveBeenCalledWith("setMix", { clipId: null });
    expect(
      screen.getByRole("button", {
        name: "Use Glitter tunnel as the mix clip",
      }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("a refusal names its reason and rolls the pick back", async () => {
    const run = createRun({
      ok: false,
      code: "vj_clip_not_found",
      errorKey: "vj:error.socket.clipNotFound",
    });
    await renderSheet(run);
    const neonRain = screen.getByRole("button", {
      name: "Use Neon rain as the mix clip",
    });
    await clickAndSettle(neonRain);
    expect(
      within(screen.getByRole("dialog")).getByRole("alert"),
    ).toBeInTheDocument();
    expect(neonRain).toHaveAttribute("aria-pressed", "false");
  });
});
