import type { ReactElement } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import {
  createVjStageState,
  type VjClipDTO,
  type VjShuffle,
  type VjTempo,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VjShuffleSettingsSheet, type VjRun } from "./VjShuffleSettingsSheet";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 5,
  isNoop: false,
  applyAt: null,
};

const DEFAULT_STATE = createVjStageState("show-shuffle", 0);
const DEFAULT_SHUFFLE: VjShuffle = DEFAULT_STATE.shuffle;
const DEFAULT_TEMPO: VjTempo = DEFAULT_STATE.tempo;
const PACK_ID = "a0000000-0000-4000-8000-000000000001";
const CLIP_IDS = [
  "c0000000-0000-4000-8000-000000000001",
  "c0000000-0000-4000-8000-000000000002",
  "c0000000-0000-4000-8000-000000000003",
  "c0000000-0000-4000-8000-000000000004",
] as const;

function createClip(
  clipId: string,
  title: string,
  isFavorite = false,
): VjClipDTO {
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
    isFavorite,
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

/** A fake runner: a mock to assert on, typed as the runner's generic `run`. */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome)) as unknown as VjRun &
    Mock<() => Promise<VjCommandOutcome>>;
}

async function renderSheet(
  run: VjRun,
  overrides: {
    shuffle?: Partial<VjShuffle>;
    tempo?: Partial<VjTempo>;
    packClips?: VjClipDTO[];
    activePackId?: string | null;
    leadNextClipId?: string | null;
  } = {},
) {
  const ui: ReactElement = (
    <VjShuffleSettingsSheet
      shuffle={{ ...DEFAULT_SHUFFLE, ...overrides.shuffle }}
      tempo={{ ...DEFAULT_TEMPO, ...overrides.tempo }}
      packClips={overrides.packClips ?? PACK_CLIPS}
      activePackId={
        overrides.activePackId === undefined ? PACK_ID : overrides.activePackId
      }
      leadNextClipId={overrides.leadNextClipId ?? null}
      run={run}
      isBlocked={false}
      onClose={() => {}}
    />
  );
  const renderedView = render(
    <TestProviders>
      <LazyMotion features={domMax}>{ui}</LazyMotion>
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

describe("VjShuffleSettingsSheet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Start shuffle sends isOn", async () => {
    const run = createRun();
    await renderSheet(run);
    await clickAndSettle(screen.getByRole("button", { name: "Start shuffle" }));
    expect(run).toHaveBeenCalledWith(
      "setShuffle",
      expect.objectContaining({ isOn: true }),
    );
  });

  it("beat chips read seconds at the stage tempo", async () => {
    const run = createRun();
    await renderSheet(run, {
      shuffle: { intervalKind: "beats", intervalValue: 8 },
      tempo: { bpm: 120 },
    });
    expect(screen.getByText("8 beats at 120 BPM is 4 s")).toBeInTheDocument();
    expect(
      screen.getByText("Beats follow the tempo in the dock, now 120 BPM"),
    ).toBeInTheDocument();
    await clickAndSettle(screen.getByRole("button", { name: "16 beats" }));
    expect(run).toHaveBeenCalledWith("setShuffle", {
      intervalKind: "beats",
      intervalValue: 16,
    });
    expect(screen.getByText("16 beats at 120 BPM is 8 s")).toBeInTheDocument();
  });

  it("favorites source is aria-disabled with no favorites and says why", async () => {
    const run = createRun();
    await renderSheet(run);
    const favoritesChip = screen.getByRole("button", {
      name: "Favorites in this pack",
    });
    expect(favoritesChip).toHaveAttribute("aria-disabled", "true");
    expect(favoritesChip).toHaveAccessibleDescription(
      "No favorites in this pack yet. Star some clips first",
    );
    await clickAndSettle(favoritesChip);
    expect(run).not.toHaveBeenCalled();
  });

  it("a pack with favorites sends the favorites source", async () => {
    const run = createRun();
    await renderSheet(run, {
      packClips: [...PACK_CLIPS, createClip(CLIP_IDS[3], "Starred", true)],
    });
    const favoritesChip = screen.getByRole("button", {
      name: "Favorites in this pack",
    });
    expect(favoritesChip).toHaveAttribute("aria-disabled", "false");
    await clickAndSettle(favoritesChip);
    expect(run).toHaveBeenCalledWith("setShuffle", { source: "favorites" });
  });

  it("leaving a clip out sends the whole excludedClipIds list", async () => {
    const run = createRun();
    await renderSheet(run, { shuffle: { excludedClipIds: [CLIP_IDS[0]] } });
    fireEvent.click(screen.getByRole("button", { name: /Leave out/ }));
    const neonRain = await screen.findByRole("button", {
      name: "Leave Neon rain out of shuffle",
    });
    expect(neonRain).toHaveAttribute("aria-pressed", "false");
    await clickAndSettle(neonRain);
    expect(run).toHaveBeenCalledWith("setShuffle", {
      excludedClipIds: [CLIP_IDS[0], CLIP_IDS[1]],
    });
    expect(neonRain).toHaveAttribute("aria-pressed", "true");
  });

  it("leaving clips out with no active pack names the reason and sends nothing", async () => {
    const run = createRun();
    await renderSheet(run, { activePackId: null });
    fireEvent.click(screen.getByRole("button", { name: /Leave out/ }));
    const discoBall = await screen.findByRole("button", {
      name: "Leave Disco ball out of shuffle",
    });
    expect(discoBall).toHaveAttribute("aria-disabled", "true");
    expect(discoBall).toHaveAccessibleDescription(
      "Pick a pack first. Shuffle plays the clips of the active pack",
    );
    await clickAndSettle(discoBall);
    expect(run).not.toHaveBeenCalled();
  });

  it("Skip sends the lead's next clip", async () => {
    const run = createRun();
    await renderSheet(run, {
      shuffle: { isOn: true },
      leadNextClipId: CLIP_IDS[2],
    });
    expect(screen.getByText("Shuffle: Glitter tunnel")).toBeInTheDocument();
    await clickAndSettle(
      screen.getByRole("button", { name: "Skip to next clip" }),
    );
    expect(run).toHaveBeenCalledWith("goClip", CLIP_IDS[2]);
  });

  it("Skip is hidden while the lead has no next clip", async () => {
    await renderSheet(createRun(), {
      shuffle: { isOn: true },
      leadNextClipId: null,
    });
    expect(
      screen.queryByRole("button", { name: "Skip to next clip" }),
    ).not.toBeInTheDocument();
  });

  it("a refusal names its reason", async () => {
    const run = createRun({
      ok: false,
      code: "vj_no_active_pack",
      errorKey: "vj:error.socket.noActivePack",
    });
    await renderSheet(run);
    await clickAndSettle(screen.getByRole("button", { name: "Start shuffle" }));
    expect(
      await within(screen.getByRole("dialog")).findByRole("alert"),
    ).toHaveTextContent(
      "Pick a pack first. Shuffle plays the clips of the active pack",
    );
  });
});
