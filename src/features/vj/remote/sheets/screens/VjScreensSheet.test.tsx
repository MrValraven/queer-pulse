import type { ReactElement } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type {
  VjClipDTO,
  VjScreenStatus,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import type {
  VjCommandOutcome,
  VjIdentifyOutcome,
} from "../../../live/vjStageCommands";
import type { VjRun } from "../../useVjCommandRunner";
import { VjScreensSheet } from "./VjScreensSheet";

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 7,
  isNoop: false,
  applyAt: null,
};
const IDENTIFY_OUTCOME: VjIdentifyOutcome = { ok: true, identifiedCount: 1 };

const PACK_ID = "a0000000-0000-4000-8000-000000000001";
const CLIP_ID = "c0000000-0000-4000-8000-000000000001";
const SCREEN_ONE_ID = "d0000000-0000-4000-8000-000000000001";
const SCREEN_TWO_ID = "d0000000-0000-4000-8000-000000000002";

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

function createScreen(
  screenId: string,
  number: number,
  overrides: Partial<VjScreenStatus> = {},
): VjScreenStatus {
  return {
    screenId,
    number,
    isConnected: true,
    isLead: number === 1,
    isFullscreen: true,
    connectedAt: 1_000,
    lastSeenAt: 2_000,
    preload: { packId: PACK_ID, clips: [] },
    health: null,
    nextClipId: null,
    mic: null,
    ...overrides,
  };
}

/** A fake runner: identify answers a count, every other command a revision. */
function createRun(): VjRun &
  Mock<(name: string) => Promise<VjCommandOutcome | VjIdentifyOutcome>> {
  return vi.fn((name: string) =>
    Promise.resolve(name === "identifyScreen" ? IDENTIFY_OUTCOME : OK_OUTCOME),
  ) as unknown as VjRun &
    Mock<(name: string) => Promise<VjCommandOutcome | VjIdentifyOutcome>>;
}

function renderSheet(
  run: VjRun,
  options: {
    screens?: VjScreenStatus[];
    overrides?: VjStageState["screenOverrides"];
  } = {},
) {
  const ui: ReactElement = (
    <VjScreensSheet
      screens={
        options.screens ?? [
          createScreen(SCREEN_TWO_ID, 2),
          createScreen(SCREEN_ONE_ID, 1),
        ]
      }
      overrides={options.overrides ?? {}}
      packClips={[createClip(CLIP_ID, "Disco ball")]}
      run={run}
      isBlocked={false}
      onClose={() => {}}
    />
  );
  return render(
    <TestProviders>
      <LazyMotion features={domMax}>{ui}</LazyMotion>
    </TestProviders>,
  );
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

function rowOf(screenId: string): HTMLElement {
  const row = document.querySelector<HTMLElement>(
    `[data-vj-screen-row="${screenId}"]`,
  );
  if (row === null) throw new Error(`no row for ${screenId}`);
  return row;
}

describe("VjScreensSheet", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists screens in number order", () => {
    renderSheet(createRun());
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(["Screen 1", "Screen 2"]);
  });

  it("Show number sends identifyScreen with the screen id", async () => {
    const run = createRun();
    renderSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show number on screen 2" }),
    );
    expect(run).toHaveBeenCalledWith("identifyScreen", SCREEN_TWO_ID);
  });

  it("Show every screen's number sends null", async () => {
    const run = createRun();
    renderSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show every screen's number" }),
    );
    expect(run).toHaveBeenCalledWith("identifyScreen", null);
  });

  it("picking a clip sends an override with one source", async () => {
    const run = createRun();
    renderSheet(run);
    fireEvent.click(
      within(rowOf(SCREEN_ONE_ID)).getByRole("button", {
        name: "What this screen shows Screen 1",
      }),
    );
    await clickAndSettle(
      screen.getByRole("option", { name: "Clip: Disco ball" }),
    );
    expect(run).toHaveBeenCalledWith("setScreenOverride", SCREEN_ONE_ID, {
      clipId: CLIP_ID,
      generatorId: null,
      generatorVariant: null,
    });
  });

  it("Follow the main look sends null", async () => {
    const run = createRun();
    renderSheet(run, {
      overrides: {
        [SCREEN_ONE_ID]: {
          clipId: null,
          generatorId: "prideFlagWave",
          generatorVariant: "rainbow",
        },
      },
    });
    fireEvent.click(
      within(rowOf(SCREEN_ONE_ID)).getByRole("button", {
        name: "What this screen shows Screen 1",
      }),
    );
    await clickAndSettle(
      screen.getByRole("option", { name: "Follow the main look" }),
    );
    expect(run).toHaveBeenCalledWith("setScreenOverride", SCREEN_ONE_ID, null);
  });

  it("says no screen is open", async () => {
    const run = createRun();
    renderSheet(run, { screens: [] });
    expect(
      screen.getByText(
        "No screen open. Open the screen on the projector laptop",
      ),
    ).toBeInTheDocument();
    const identifyAll = screen.getByRole("button", {
      name: "Show every screen's number",
    });
    expect(identifyAll).toHaveAttribute("aria-disabled", "true");
    await clickAndSettle(identifyAll);
    expect(run).not.toHaveBeenCalled();
  });
});
