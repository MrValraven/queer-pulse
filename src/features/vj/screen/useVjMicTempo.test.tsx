import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjEnvelopeSample } from "../engine/tempo/vjOnsetDetector";
import {
  startVjMicInput,
  type VjMicInputHandlers,
  type VjMicStartResult,
} from "../engine/tempo/vjMicInput";
import { vjClickTrainEnvelope } from "../engine/tempo/vjTempoTestSignals";
import type { VjClockReader } from "../engine/vjEngineLook";
import { VJ_SCREEN_MIC_STORAGE_KEY } from "../vj.constants";
import { useVjMicTempo } from "./useVjMicTempo";

vi.mock("../engine/tempo/vjMicInput", () => ({
  startVjMicInput: vi.fn(),
}));

const startMock = vi.mocked(startVjMicInput);

/** 256-sample hops at 48 kHz, the rate the worklet posts at. */
const HOP_RATE_HZ = 48_000 / 256;
const SERVER_EPOCH_MS = Date.parse("2026-11-06T22:00:00.000Z");

interface FakeMic {
  handlers: VjMicInputHandlers | null;
  audioContext: { currentTime: number };
  stop: ReturnType<typeof vi.fn>;
}

let fakeMic: FakeMic;

/** The synced clock runs with the audio clock, so a beat at audio second
 *  `s` sits at server ms `SERVER_EPOCH_MS + s * 1000`. */
const clock: VjClockReader = {
  serverNow: () => SERVER_EPOCH_MS + fakeMic.audioContext.currentTime * 1000,
  toLocalTime: (serverMs) => serverMs,
};

function grantFakeMic(): void {
  startMock.mockImplementation((handlers) => {
    fakeMic.handlers = handlers;
    const result: VjMicStartResult = {
      ok: true,
      session: {
        audioContext: fakeMic.audioContext as unknown as AudioContext,
        stop: fakeMic.stop,
      },
    };
    return Promise.resolve(result);
  });
}

/** Feeds samples in worklet batches of 4, moving the audio clock along. */
function feed(samples: readonly VjEnvelopeSample[]): void {
  act(() => {
    for (let index = 0; index < samples.length; index += 4) {
      const batch = samples.slice(index, index + 4);
      fakeMic.audioContext.currentTime = batch.at(-1)?.timeSec ?? 0;
      fakeMic.handlers?.onEnvelope(batch);
    }
  });
}

async function renderListening() {
  const view = renderHook(() => useVjMicTempo({ clock }));
  await act(async () => {
    view.result.current.start();
    await Promise.resolve();
  });
  return view;
}

function stubPermission(state: PermissionState): void {
  Object.defineProperty(navigator, "permissions", {
    configurable: true,
    value: { query: vi.fn(() => Promise.resolve({ state })) },
  });
}

beforeEach(() => {
  fakeMic = { handlers: null, audioContext: { currentTime: 0 }, stop: vi.fn() };
  startMock.mockReset();
  grantFakeMic();
  window.localStorage.clear();
});

afterEach(() => {
  Reflect.deleteProperty(navigator, "permissions");
});

describe("useVjMicTempo", () => {
  it("reports the level while listening and null while off", async () => {
    const view = renderHook(() => useVjMicTempo({ clock }));
    expect(view.result.current.report).toBeNull();
    expect(view.result.current.levelRef.current).toBeNull();
    await act(async () => {
      view.result.current.start();
      await Promise.resolve();
    });
    expect(view.result.current.status).toBe("listening");
    expect(view.result.current.report).toEqual({
      level: 0,
      bpm: null,
      confidence: 0,
      beatAt: null,
    });
    const loud = Array.from({ length: 40 }, (_, index) => ({
      timeSec: (index + 0.5) / HOP_RATE_HZ,
      rms: 0.5,
      lowEnergy: 0.1,
    }));
    feed(loud);
    expect(view.result.current.levelRef.current).toBeGreaterThan(0.5);
    expect(view.result.current.level).toBeGreaterThan(0.5);
    act(() => view.result.current.stop());
    expect(view.result.current.status).toBe("off");
    expect(view.result.current.report).toBeNull();
    expect(view.result.current.levelRef.current).toBeNull();
    expect(fakeMic.stop).toHaveBeenCalledTimes(1);
  });

  it("keeps bpm null until the estimate is confident and stable", async () => {
    const view = await renderListening();
    const { samples } = vjClickTrainEnvelope({
      bpm: 124,
      durationSec: 16,
      rateHz: HOP_RATE_HZ,
      seed: 7,
    });
    const sevenSeconds = samples.filter((sample) => sample.timeSec < 7);
    feed(sevenSeconds);
    expect(view.result.current.report?.bpm).toBeNull();
    expect(view.result.current.report?.beatAt).toBeNull();
    feed(samples.slice(sevenSeconds.length));
    const report = view.result.current.report;
    expect(report?.bpm).not.toBeNull();
    expect(Math.abs((report?.bpm ?? 0) - 124)).toBeLessThanOrEqual(1);
    expect(report?.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("converts the beat to server time through the clock", async () => {
    const view = await renderListening();
    const { samples, clickTimesSec } = vjClickTrainEnvelope({
      bpm: 124,
      durationSec: 16,
      rateHz: HOP_RATE_HZ,
      seed: 11,
    });
    feed(samples);
    const beatAt = view.result.current.report?.beatAt;
    expect(beatAt).not.toBeNull();
    const distances = clickTimesSec.map((clickSec) =>
      Math.abs((beatAt ?? 0) - (SERVER_EPOCH_MS + clickSec * 1000)),
    );
    expect(Math.min(...distances)).toBeLessThan(25);
  });

  it("remembers the opt-in on this device", async () => {
    const view = await renderListening();
    expect(window.localStorage.getItem(VJ_SCREEN_MIC_STORAGE_KEY)).toBe("true");
    act(() => view.result.current.stop());
    expect(window.localStorage.getItem(VJ_SCREEN_MIC_STORAGE_KEY)).toBe(
      "false",
    );
  });

  it("starts with no prompt when permission is granted and the opt-in is on", async () => {
    window.localStorage.setItem(VJ_SCREEN_MIC_STORAGE_KEY, "true");
    stubPermission("granted");
    const view = renderHook(() => useVjMicTempo({ clock }));
    await waitFor(() => expect(view.result.current.status).toBe("listening"));
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it("waits for the button while permission would still prompt", async () => {
    window.localStorage.setItem(VJ_SCREEN_MIC_STORAGE_KEY, "true");
    stubPermission("prompt");
    const view = renderHook(() => useVjMicTempo({ clock }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(startMock).not.toHaveBeenCalled();
    expect(view.result.current.status).toBe("off");
  });

  it("reads a bad stored value as off", async () => {
    window.localStorage.setItem(VJ_SCREEN_MIC_STORAGE_KEY, "yes");
    stubPermission("granted");
    renderHook(() => useVjMicTempo({ clock }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(startMock).not.toHaveBeenCalled();
  });

  it("names the failure reason", async () => {
    startMock.mockImplementation(() =>
      Promise.resolve({ ok: false, reason: "denied" }),
    );
    const view = await renderListening();
    expect(view.result.current.status).toBe("failed");
    expect(view.result.current.failure).toBe("denied");
    expect(view.result.current.report).toBeNull();
  });

  it("names the interruption when the mic stops on its own", async () => {
    const view = await renderListening();
    act(() => fakeMic.handlers?.onInterrupted());
    expect(view.result.current.status).toBe("failed");
    expect(view.result.current.failure).toBe("interrupted");
    expect(view.result.current.levelRef.current).toBeNull();
    expect(fakeMic.stop).toHaveBeenCalledTimes(1);
  });

  it("stops the session on unmount", async () => {
    const view = await renderListening();
    view.unmount();
    expect(fakeMic.stop).toHaveBeenCalledTimes(1);
  });
});
