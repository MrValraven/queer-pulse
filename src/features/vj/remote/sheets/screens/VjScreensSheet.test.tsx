import type { ReactElement } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { ReducedMotionContext } from "../../../../../app/providers/motionPrefs";
import type {
  VjClipDTO,
  VjRenderer,
  VjScreenHealth,
  VjScreenStatus,
  VjStageState,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import { awaitCatalogUnderFakeTimers } from "../../../../../test/awaitCatalogUnderFakeTimers";
import type {
  VjCommandOutcome,
  VjIdentifyOutcome,
  VjRenderModeOutcome,
} from "../../../live/vjStageCommands";
import type { VjRun } from "../../useVjCommandRunner";
import { VJ_RENDER_MODE_SETTLE_MAX_MS } from "./vjRenderMode";
import { VjScreensSheet } from "./VjScreensSheet";

type VjAnyOutcome = VjCommandOutcome | VjIdentifyOutcome | VjRenderModeOutcome;

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 7,
  isNoop: false,
  applyAt: null,
};
const IDENTIFY_OUTCOME: VjIdentifyOutcome = { ok: true, identifiedCount: 1 };
const RENDER_MODE_OUTCOME: VjRenderModeOutcome = { ok: true, reachedCount: 2 };

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
    setlistItemCount: 0,
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

/** A health report drawn with `renderer`. */
function healthWith(
  renderer: VjRenderer,
  isEffectLoadHigh = false,
): VjScreenHealth {
  return {
    renderer,
    fps: 60,
    droppedFrames: 0,
    cacheBytes: 0,
    isEffectLoadHigh,
  };
}

/** Screens 1 and 2, both connected, both drawing with `renderer`. */
function screensDrawingWith(renderer: VjRenderer): VjScreenStatus[] {
  return [
    createScreen(SCREEN_ONE_ID, 1, { health: healthWith(renderer) }),
    createScreen(SCREEN_TWO_ID, 2, { health: healthWith(renderer) }),
  ];
}

function outcomeFor(
  name: string,
  renderModeOutcome: VjRenderModeOutcome,
): VjAnyOutcome {
  if (name === "identifyScreen") return IDENTIFY_OUTCOME;
  if (name === "setRenderMode") return renderModeOutcome;
  return OK_OUTCOME;
}

/** A fake runner: identify and setRenderMode answer a count, every other command a revision. */
function createRun(
  renderModeOutcome: VjRenderModeOutcome = RENDER_MODE_OUTCOME,
): VjRun & Mock<(name: string) => Promise<VjAnyOutcome>> {
  return vi.fn((name: string) =>
    Promise.resolve(outcomeFor(name, renderModeOutcome)),
  ) as unknown as VjRun & Mock<(name: string) => Promise<VjAnyOutcome>>;
}

interface VjSheetTreeOptions {
  screens?: VjScreenStatus[];
  overrides?: VjStageState["screenOverrides"];
  /** The app's reduce motion flag; off by default. */
  isReducedMotion?: boolean;
}

/** The sheet inside its providers; a rerender passes a fresh tree. */
function sheetTree(run: VjRun, options: VjSheetTreeOptions = {}): ReactElement {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={options.isReducedMotion === true}>
        <LazyMotion features={domMax}>
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
        </LazyMotion>
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

async function renderSheet(
  run: VjRun,
  options: VjSheetTreeOptions & {
    /** The suite faked setTimeout before rendering. */
    isUnderFakeTimers?: boolean;
  } = {},
) {
  const renderedView = render(sheetTree(run, options));
  if (options.isUnderFakeTimers === true) {
    await awaitCatalogUnderFakeTimers("vj");
  } else {
    await awaitCatalog("vj");
  }
  return renderedView;
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

function healthListOf(screenId: string): HTMLElement {
  const healthList = rowOf(screenId).querySelector<HTMLElement>(
    "[data-vj-screen-health]",
  );
  if (healthList === null) throw new Error(`no health list for ${screenId}`);
  return healthList;
}

/**
 * The sheet's own body. ToastProvider always mounts empty role="status" and
 * role="alert" regions, so every status and alert query runs inside it.
 */
function sheetBody(): HTMLElement {
  const body = document.querySelector<HTMLElement>("[data-vj-screens-sheet]");
  if (body === null) throw new Error("no Screens sheet body");
  return body;
}

function renderModeStatus(): HTMLElement {
  return within(sheetBody()).getByRole("status");
}

function renderModeSwitch(): HTMLElement {
  return screen.getByRole("switch", {
    name: "Simple renderer on every screen",
  });
}

describe("VjScreensSheet", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("lists screens in number order", async () => {
    await renderSheet(createRun());
    // The sheet's own title is an h3 too: leave out the heading that names the dialog.
    const titleId = screen.getByRole("dialog").getAttribute("aria-labelledby");
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .filter((heading) => heading.id !== titleId)
      .map((heading) => heading.textContent);
    expect(titles).toEqual(["Screen 1", "Screen 2"]);
  });

  it("Show number sends identifyScreen with the screen id", async () => {
    const run = createRun();
    await renderSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show number on screen 2" }),
    );
    expect(run).toHaveBeenCalledWith("identifyScreen", SCREEN_TWO_ID);
  });

  it("Show every screen's number sends null", async () => {
    const run = createRun();
    await renderSheet(run);
    await clickAndSettle(
      screen.getByRole("button", { name: "Show every screen's number" }),
    );
    expect(run).toHaveBeenCalledWith("identifyScreen", null);
  });

  it("picking a clip sends an override with one source", async () => {
    const run = createRun();
    await renderSheet(run);
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
    await renderSheet(run, {
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
    await renderSheet(run, { screens: [] });
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

describe("VjScreensSheet simple renderer switch", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("the switch sends setRenderMode simple while screens run the effects engine", async () => {
    const run = createRun();
    await renderSheet(run, { screens: screensDrawingWith("webgl2") });
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "false");
    await clickAndSettle(renderModeSwitch());
    expect(run).toHaveBeenCalledWith("setRenderMode", "simple");
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "true");
    expect(renderModeStatus()).toHaveTextContent(
      "Moving every screen to the simple renderer",
    );
  });

  it("the switch reads on and sends effects when every connected screen reports simple", async () => {
    const run = createRun();
    await renderSheet(run, { screens: screensDrawingWith("simple") });
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "true");
    await clickAndSettle(renderModeSwitch());
    expect(run).toHaveBeenCalledWith("setRenderMode", "effects");
  });

  it("holds the switch with no screen connected", async () => {
    const run = createRun();
    await renderSheet(run, { screens: [] });
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "true");
    await clickAndSettle(renderModeSwitch());
    expect(run).not.toHaveBeenCalled();
  });

  it("Switch to simple renderer on the load warning sends simple", async () => {
    const run = createRun();
    await renderSheet(run, {
      screens: [
        createScreen(SCREEN_ONE_ID, 1, { health: healthWith("webgl2", true) }),
        createScreen(SCREEN_TWO_ID, 2, { health: healthWith("webgl2") }),
      ],
    });
    expect(
      within(rowOf(SCREEN_TWO_ID)).queryByRole("button", {
        name: "Switch to simple renderer",
      }),
    ).not.toBeInTheDocument();
    await clickAndSettle(
      within(rowOf(SCREEN_ONE_ID)).getByRole("button", {
        name: "Switch to simple renderer",
      }),
    );
    expect(run).toHaveBeenCalledWith("setRenderMode", "simple");
  });

  it("moves focus to the switch when the load warning sends simple", async () => {
    const run = createRun();
    await renderSheet(run, {
      screens: [
        createScreen(SCREEN_ONE_ID, 1, { health: healthWith("webgl2", true) }),
      ],
    });
    const warningButton = within(rowOf(SCREEN_ONE_ID)).getByRole("button", {
      name: "Switch to simple renderer",
    });
    warningButton.focus();
    await clickAndSettle(warningButton);
    expect(run).toHaveBeenCalledWith("setRenderMode", "simple");
    expect(renderModeSwitch()).toHaveFocus();
  });

  it("names a refusal and drops the pending state", async () => {
    const run = createRun({
      ok: false,
      code: "vj_no_screens_connected",
      errorKey: "vj:error.socket.noScreensConnected",
    });
    await renderSheet(run, { screens: screensDrawingWith("webgl2") });
    await clickAndSettle(renderModeSwitch());
    expect(run).toHaveBeenCalledWith("setRenderMode", "simple");
    expect(within(sheetBody()).getByRole("alert")).toHaveTextContent(
      "No screens are connected right now",
    );
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "false");
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "false");
  });

  it("ends the pending state after VJ_RENDER_MODE_SETTLE_MAX_MS when a screen never reports", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const run = createRun({ ok: true, reachedCount: 1 });
    await renderSheet(run, {
      screens: [
        createScreen(SCREEN_ONE_ID, 1, { health: healthWith("webgl2") }),
      ],
      isUnderFakeTimers: true,
    });
    await clickAndSettle(renderModeSwitch());
    expect(run).toHaveBeenCalledWith("setRenderMode", "simple");
    act(() => {
      vi.advanceTimersByTime(VJ_RENDER_MODE_SETTLE_MAX_MS - 1);
    });
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "true");
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "true");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "false");
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("ends the pending state once every screen's health reports simple", async () => {
    const run = createRun();
    const { rerender } = await renderSheet(run, {
      screens: screensDrawingWith("webgl2"),
    });
    await clickAndSettle(renderModeSwitch());
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "true");
    expect(renderModeSwitch()).toHaveAttribute("data-pending", "true");
    expect(renderModeStatus()).toHaveTextContent(
      "Moving every screen to the simple renderer",
    );
    rerender(sheetTree(run, { screens: screensDrawingWith("simple") }));
    // The status line folds away through Collapse, whose exit never finishes
    // without a MotionProvider: the switch itself carries the end of pending.
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "false");
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "true");
    expect(renderModeSwitch()).toHaveAttribute("data-pending", "false");
  });

  it("holds the pending state until the ack when health already agrees", async () => {
    let resolveAck: (outcome: VjRenderModeOutcome) => void = () => {};
    const run = vi.fn((name: string) =>
      name === "setRenderMode"
        ? new Promise<VjAnyOutcome>((resolve) => {
            resolveAck = resolve;
          })
        : Promise.resolve(outcomeFor(name, RENDER_MODE_OUTCOME)),
    ) as unknown as VjRun;
    const { rerender } = await renderSheet(run, {
      screens: screensDrawingWith("webgl2"),
    });
    await clickAndSettle(renderModeSwitch());
    rerender(sheetTree(run, { screens: screensDrawingWith("simple") }));
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "true");
    await act(async () => {
      resolveAck(RENDER_MODE_OUTCOME);
      await Promise.resolve();
    });
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "false");
    expect(renderModeSwitch()).toHaveAttribute("aria-checked", "true");
  });
});

describe("VjScreensSheet switch states, held reason and focus", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("marks pending apart from held, so only the track dims", async () => {
    const run = createRun();
    await renderSheet(run, { screens: screensDrawingWith("webgl2") });
    expect(renderModeSwitch()).toHaveAttribute("data-pending", "false");
    await clickAndSettle(renderModeSwitch());
    expect(renderModeSwitch()).toHaveAttribute("aria-disabled", "true");
    expect(renderModeSwitch()).toHaveAttribute("data-pending", "true");
  });

  it("names why the switch is held when every listed screen has left", async () => {
    const run = createRun();
    await renderSheet(run, {
      screens: [
        createScreen(SCREEN_ONE_ID, 1, {
          isConnected: false,
          health: healthWith("webgl2"),
        }),
      ],
    });
    const reason = within(sheetBody()).getByText(
      "No screens are connected right now",
    );
    const switchElement = renderModeSwitch();
    expect(switchElement).toHaveAttribute("aria-disabled", "true");
    expect(switchElement).toHaveAttribute("data-pending", "false");
    expect(
      switchElement.getAttribute("aria-describedby")?.split(" "),
    ).toContain(reason.id);
    expect(
      screen.getByRole("button", { name: "Show every screen's number" }),
    ).toHaveAttribute("aria-describedby", reason.id);
    await clickAndSettle(switchElement);
    expect(run).not.toHaveBeenCalled();
  });

  it("leaves out the no screens connected line while a screen is connected", async () => {
    await renderSheet(createRun(), { screens: screensDrawingWith("webgl2") });
    expect(
      within(sheetBody()).queryByText("No screens are connected right now"),
    ).not.toBeInTheDocument();
    expect(
      renderModeSwitch().getAttribute("aria-describedby")?.split(" "),
    ).toHaveLength(1);
  });

  it("focuses the switch without a jump and glides it into view", async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    await renderSheet(createRun(), {
      screens: [
        createScreen(SCREEN_ONE_ID, 1, { health: healthWith("webgl2", true) }),
      ],
    });
    await clickAndSettle(
      within(rowOf(SCREEN_ONE_ID)).getByRole("button", {
        name: "Switch to simple renderer",
      }),
    );
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollSpy).toHaveBeenCalledWith({
      block: "nearest",
      behavior: "smooth",
    });
    expect(scrollSpy.mock.contexts).toContain(renderModeSwitch());
    expect(renderModeSwitch()).toHaveFocus();
  });

  it("brings the switch into view at once under reduce motion", async () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    await renderSheet(createRun(), {
      screens: [
        createScreen(SCREEN_ONE_ID, 1, { health: healthWith("webgl2", true) }),
      ],
      isReducedMotion: true,
    });
    await clickAndSettle(
      within(rowOf(SCREEN_ONE_ID)).getByRole("button", {
        name: "Switch to simple renderer",
      }),
    );
    expect(scrollSpy).toHaveBeenCalledWith({
      block: "nearest",
      behavior: "auto",
    });
  });

  it("names the new renderer on the same health line", async () => {
    const run = createRun();
    const { rerender } = await renderSheet(run, {
      screens: [createScreen(SCREEN_ONE_ID, 1, { health: healthWith("dom") })],
    });
    const healthList = within(healthListOf(SCREEN_ONE_ID)).getAllByRole(
      "listitem",
    );
    const rendererItem = healthList[0];
    rerender(
      sheetTree(run, {
        screens: [
          createScreen(SCREEN_ONE_ID, 1, { health: healthWith("simple") }),
        ],
      }),
    );
    const nextHealthList = within(healthListOf(SCREEN_ONE_ID)).getAllByRole(
      "listitem",
    );
    expect(nextHealthList).toHaveLength(healthList.length);
    expect(nextHealthList[0]).toBe(rendererItem);
    expect(rendererItem).toHaveTextContent("Simple renderer, fades only");
  });
});
