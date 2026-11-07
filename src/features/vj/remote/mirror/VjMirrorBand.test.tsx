import type { ReactNode } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjClipDTO,
  type VjEventCardDTO,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalog } from "../../../../test/awaitCatalog";
import type { VjMirrorFrames } from "../hooks/useVjMirrorFrames";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import { VjMirrorBand, type VjMirrorBandProps } from "./VjMirrorBand";

const { effectsFrameSpy, overlayLayerSpy } = vi.hoisted(() => ({
  effectsFrameSpy: vi.fn(),
  overlayLayerSpy: vi.fn(),
}));

vi.mock("../../screen/VjEffectsFrame", () => ({
  VjEffectsFrame: (props: { children: ReactNode }) => {
    effectsFrameSpy(props);
    return <div data-testid="vj-effects-frame">{props.children}</div>;
  },
}));

vi.mock("../../screen/overlay/VjOverlayLayer", () => ({
  VjOverlayLayer: (props: Record<string, unknown>) => {
    overlayLayerSpy(props);
    return <div data-testid="vj-overlay-layer" />;
  },
}));

const SERVER_NOW = 50_000;
const CLOCK: VjRemoteClock = {
  serverNow: () => SERVER_NOW,
  toLocalTime: (serverMs) => serverMs,
  isSynced: true,
};

const BASE_STATE = createVjStageState("epoch-test", 0);

function clipNamed(id: string, title: string): VjClipDTO {
  return {
    id,
    title,
    thumbnailUrl: `https://files.example/${id}.jpg`,
    width: 1920,
    height: 1080,
    fitMode: "fill",
  } as VjClipDTO;
}

const SUNSET = clipNamed("clip-sunset", "Sunset loop");
const NEON = clipNamed("clip-neon", "Neon rain");

const EVENT_CARD: VjEventCardDTO = {
  eventId: "event-1",
  title: "Sapphic Saturday",
  startAt: "2026-11-07T21:30:00.000Z",
  endAt: null,
  timezone: "Europe/Lisbon",
  area: "Intendente",
  isOnline: false,
  publicUrl: "https://queerpulse.example/events/sapphic-saturday",
};

function stateWith(changes: Partial<VjStageState>): VjStageState {
  return { ...BASE_STATE, liveClipId: SUNSET.id, ...changes };
}

function framesShowing(
  shownState: VjStageState,
  pendingState: VjStageState | null = null,
): VjMirrorFrames {
  return {
    shownState,
    pendingState,
    nextApplyAt: pendingState === null ? null : SERVER_NOW + 1500,
    frameReceivedAt: pendingState === null ? null : SERVER_NOW - 500,
  };
}

function bandProps(
  overrides: Partial<VjMirrorBandProps> = {},
): VjMirrorBandProps {
  return {
    frames: framesShowing(stateWith({})),
    clock: CLOCK,
    liveClip: SUNSET,
    mixClip: null,
    eventCardData: null,
    nextUp: { kind: "none" },
    nextUpTitle: null,
    pendingQuantize: "off",
    ring: { kind: "none" },
    isExpanded: false,
    onToggleExpanded: vi.fn(),
    canSkip: false,
    onSkip: vi.fn(),
    isBlocked: false,
    ...overrides,
  };
}

function wrap(props: VjMirrorBandProps): ReactNode {
  return (
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjMirrorBand {...props} />
      </LazyMotion>
    </TestProviders>
  );
}

async function renderBand(overrides: Partial<VjMirrorBandProps> = {}) {
  const props = bandProps(overrides);
  const view = render(wrap(props));
  await awaitCatalog("vj");
  return {
    props,
    rerenderBand: (next: Partial<VjMirrorBandProps>) =>
      view.rerender(wrap({ ...props, ...next })),
  };
}

function lastPropsOf(spy: typeof effectsFrameSpy): Record<string, unknown> {
  return spy.mock.lastCall?.[0] as Record<string, unknown>;
}

function shownClipId(): string | null {
  const image = document.querySelector("[data-vj-mirror-clip]");
  return image?.getAttribute("data-vj-mirror-clip") ?? null;
}

describe("VjMirrorBand", () => {
  afterEach(() => {
    effectsFrameSpy.mockClear();
    overlayLayerSpy.mockClear();
  });

  it("draws the shown effects through VjEffectsFrame with the strobe off", async () => {
    const shownState = stateWith({
      effects: {
        ...BASE_STATE.effects,
        settings: { vhs: { isOn: true, amount: 1, variant: null } },
        isStrobing: true,
        strobeStartedAt: SERVER_NOW,
      },
    });
    await renderBand({ frames: framesShowing(shownState) });
    const frameProps = lastPropsOf(effectsFrameSpy);
    expect(frameProps.effects).toEqual({
      settings: shownState.effects.settings,
      isStrobing: false,
    });
    expect(frameProps.tempo).toBe(shownState.tempo);
    const clockReader = frameProps.clock as { serverNow: () => number };
    expect(clockReader.serverNow()).toBe(SERVER_NOW);
    expect(document.querySelector("[data-vj-mirror-undrawn]")).toHaveAttribute(
      "data-vj-mirror-undrawn",
      "1",
    );
  });

  it("draws the overlay text, countdown and logo through VjOverlayLayer at mirror size", async () => {
    const shownState = stateWith({
      overlay: { ...BASE_STATE.overlay, text: "Doors at 11", isVisible: true },
      countdown: { isVisible: true, targetAt: SERVER_NOW + 60_000, label: "" },
      logo: { isVisible: true, corner: "topLeft" },
      eventCard: { isVisible: true, kind: "qr" },
    });
    await renderBand({
      frames: framesShowing(shownState),
      eventCardData: EVENT_CARD,
    });
    const overlayProps = lastPropsOf(overlayLayerSpy);
    expect(overlayProps.size).toBe("mirror");
    expect(overlayProps.overlay).toBe(shownState.overlay);
    expect(overlayProps.countdown).toBe(shownState.countdown);
    expect(overlayProps.logo).toBe(shownState.logo);
    expect(overlayProps.eventCard).toBe(shownState.eventCard);
    expect(overlayProps.eventCardData).toBe(EVENT_CARD);
  });

  it("shows the live clip and the next shuffle clip", async () => {
    await renderBand({
      nextUp: { kind: "shuffle", clipId: NEON.id },
      nextUpTitle: NEON.title,
    });
    expect(screen.getByText("Sunset loop")).toBeInTheDocument();
    // The next line fades from the blank pre-catalog copy to its text.
    expect(await screen.findByText("Shuffle: Neon rain")).toBeInTheDocument();
    expect(shownClipId()).toBe(SUNSET.id);
  });

  it("keeps the shown clip live while a quantized change waits and says On the next bar", async () => {
    const shownState = stateWith({});
    const pendingState = stateWith({ liveClipId: NEON.id });
    await renderBand({
      frames: framesShowing(shownState, pendingState),
      pendingQuantize: "bar",
      ring: { kind: "applyAt", progress: 0.25, msLeft: 1500 },
    });
    expect(shownClipId()).toBe(SUNSET.id);
    expect(screen.getByText("Sunset loop")).toBeInTheDocument();
    expect(screen.getByText("On the next bar")).toBeInTheDocument();
    const band = document.querySelector("[data-vj-mirror-band]") as HTMLElement;
    expect(within(band).getByRole("status")).toHaveTextContent(
      "Changes in 2 s",
    );
  });

  it("names the waiting clip on the Next line while a quantized change waits", async () => {
    const pendingState = stateWith({ liveClipId: NEON.id });
    await renderBand({
      frames: framesShowing(stateWith({}), pendingState),
      pendingClip: NEON,
      pendingQuantize: "bar",
      nextUp: { kind: "none" },
    });
    const nextLine = document.querySelector(
      "[data-vj-mirror-next]",
    ) as HTMLElement;
    expect(nextLine).toHaveAttribute("data-vj-mirror-next", "pending");
    expect(within(nextLine).getByText("On the next bar")).toBeInTheDocument();
    expect(within(nextLine).getByText("Neon rain")).toBeInTheDocument();
    expect(screen.queryByText("Nothing cued")).not.toBeInTheDocument();
  });

  it("keeps the next-up copy for an unquantized change", async () => {
    await renderBand({
      frames: framesShowing(stateWith({}), stateWith({ liveClipId: NEON.id })),
      pendingClip: NEON,
      pendingQuantize: "off",
    });
    expect(await screen.findByText("Nothing cued")).toBeInTheDocument();
  });

  it("switches when the pending state lands", async () => {
    const pendingState = stateWith({ liveClipId: NEON.id });
    const { rerenderBand } = await renderBand({
      frames: framesShowing(stateWith({}), pendingState),
      pendingQuantize: "beat",
    });
    expect(screen.getByText("On the next beat")).toBeInTheDocument();
    rerenderBand({ frames: framesShowing(pendingState), liveClip: NEON });
    await waitFor(() => expect(shownClipId()).toBe(NEON.id));
    await waitFor(() =>
      expect(screen.queryByText("On the next beat")).not.toBeInTheDocument(),
    );
    expect(await screen.findByText("Neon rain")).toBeInTheDocument();
  });

  it("expands and collapses on tap", async () => {
    const { props, rerenderBand } = await renderBand();
    const growButton = screen.getByRole("button", {
      name: "Make the preview bigger",
    });
    expect(growButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(growButton);
    expect(props.onToggleExpanded).toHaveBeenCalledTimes(1);
    rerenderBand({ isExpanded: true });
    const shrinkButton = screen.getByRole("button", {
      name: "Make the preview smaller",
    });
    expect(shrinkButton).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector("[data-vj-mini-mirror]")).toHaveAttribute(
      "data-expanded",
      "true",
    );
    fireEvent.click(shrinkButton);
    expect(props.onToggleExpanded).toHaveBeenCalledTimes(2);
  });

  it("shows Skip only with a lead's next clip", async () => {
    const { props, rerenderBand } = await renderBand({ canSkip: false });
    expect(
      screen.queryByRole("button", { name: "Skip to next clip" }),
    ).not.toBeInTheDocument();
    rerenderBand({ canSkip: true });
    const skipButton = screen.getByRole("button", {
      name: "Skip to next clip",
    });
    fireEvent.click(skipButton);
    expect(props.onSkip).toHaveBeenCalledTimes(1);
    rerenderBand({ canSkip: true, isBlocked: true });
    const blockedSkip = screen.getByRole("button", {
      name: "Skip to next clip",
    });
    expect(blockedSkip).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(blockedSkip);
    expect(props.onSkip).toHaveBeenCalledTimes(1);
  });

  it("draws blackout as a still layer", async () => {
    await renderBand({
      frames: framesShowing(
        stateWith({ effects: { ...BASE_STATE.effects, isBlackout: true } }),
      ),
    });
    const blackout = document.querySelector("[data-vj-mirror-blackout]");
    expect(blackout).toBeInTheDocument();
    const frame = screen.getByTestId("vj-effects-frame");
    expect(frame.contains(blackout)).toBe(false);
    expect(lastPropsOf(effectsFrameSpy).effects).toMatchObject({
      isStrobing: false,
    });
  });

  it("renders no flashing strobe layer", async () => {
    await renderBand({
      frames: framesShowing(
        stateWith({
          effects: {
            ...BASE_STATE.effects,
            isStrobing: true,
            strobeStartedAt: SERVER_NOW - 2000,
          },
        }),
      ),
    });
    expect(document.querySelector("[data-vj-strobe]")).not.toBeInTheDocument();
    expect(document.querySelector("[data-vj-flash]")).not.toBeInTheDocument();
    const chip = document.querySelector("[data-vj-strobe-chip]") as HTMLElement;
    expect(within(chip).getByText("Strobe")).toBeInTheDocument();
    expect(within(chip).getByText("8 s left")).toBeInTheDocument();
    expect(lastPropsOf(effectsFrameSpy).effects).toMatchObject({
      isStrobing: false,
    });
  });
});
