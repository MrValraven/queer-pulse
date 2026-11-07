import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  VjScreenClipStatus,
  VjScreenHealth,
  VjScreenMicReport,
  VjScreenStatusPayload,
} from "../../../shared/contracts/vj";
import { VJ_SCREEN_STATUS_REPORT_INTERVAL_MS } from "../vj.constants";
import {
  useVjScreenStatusReport,
  VJ_STATUS_REPORT_INTERVAL_MS,
  type VjScreenStatusReportInput,
} from "./useVjScreenStatusReport";

const PACK_WARM = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CLIP_GRID = "11111111-1111-4111-8111-111111111111";
const CLIP_HAZE = "22222222-2222-4222-8222-222222222222";
const START_MS = Date.parse("2026-11-06T22:00:00.000Z");

const HEALTH: VjScreenHealth = {
  renderer: "webgl2",
  fps: 59.9,
  droppedFrames: 1,
  cacheBytes: 4_096,
  isEffectLoadHigh: false,
};

function statusesWithProgress(progress: number): VjScreenClipStatus[] {
  return [
    { clipId: CLIP_GRID, state: "ready", progress: 1, failure: null },
    { clipId: CLIP_HAZE, state: "loading", progress, failure: null },
  ];
}

function micAt(level: number): VjScreenMicReport {
  return { level, bpm: 124, confidence: 0.8, beatAt: Date.now() - 100 };
}

interface Harness {
  sent: VjScreenStatusPayload[];
  sentAt: number[];
  propsOf: (
    patch: Partial<Omit<VjScreenStatusReportInput, "stage">> & {
      isConnected?: boolean;
      isLead?: boolean;
    },
  ) => VjScreenStatusReportInput;
}

function createHarness(): Harness {
  const sent: VjScreenStatusPayload[] = [];
  const sentAt: number[] = [];
  const sendStatus = (status: VjScreenStatusPayload) => {
    sent.push(status);
    sentAt.push(Date.now());
  };
  const serverNow = () => Date.now();
  const statuses = statusesWithProgress(0.2);
  return {
    sent,
    sentAt,
    propsOf: ({ isConnected = true, isLead = true, ...patch }) => ({
      stage: { sendStatus, isConnected, isLead, serverNow },
      isFullscreen: false,
      packId: PACK_WARM,
      statuses,
      health: null,
      nextClipId: null,
      mic: null,
      ...patch,
    }),
  };
}

function renderReport(initialProps: VjScreenStatusReportInput) {
  return renderHook(
    (props: VjScreenStatusReportInput) => useVjScreenStatusReport(props),
    { initialProps },
  );
}

function advance(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

describe("useVjScreenStatusReport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends one report right after connecting with health and the next clip", () => {
    const harness = createHarness();
    const { rerender } = renderReport(
      harness.propsOf({ isConnected: false, health: HEALTH }),
    );
    expect(harness.sent).toHaveLength(0);

    rerender(harness.propsOf({ health: HEALTH, nextClipId: CLIP_HAZE }));

    expect(harness.sent).toHaveLength(1);
    expect(harness.sent[0]).toEqual({
      isFullscreen: false,
      preload: { packId: PACK_WARM, clips: statusesWithProgress(0.2) },
      nextClipId: CLIP_HAZE,
      mic: null,
      health: HEALTH,
    });
  });

  it("sends the next clip as null on a follower", () => {
    const harness = createHarness();
    renderReport(harness.propsOf({ isLead: false, nextClipId: CLIP_HAZE }));

    expect(harness.sent[0]?.nextClipId).toBeNull();
  });

  it("sends a preload change within 500 ms", () => {
    const harness = createHarness();
    const { rerender } = renderReport(harness.propsOf({}));
    expect(harness.sent).toHaveLength(1);

    advance(100);
    rerender(harness.propsOf({ statuses: statusesWithProgress(0.6) }));
    advance(VJ_STATUS_REPORT_INTERVAL_MS - 100);

    expect(harness.sent).toHaveLength(2);
    expect(harness.sent[1]?.preload.clips[1]?.progress).toBe(0.6);
    expect((harness.sentAt[1] ?? 0) - (harness.sentAt[0] ?? 0)).toBe(
      VJ_STATUS_REPORT_INTERVAL_MS,
    );
  });

  it("keeps two reports at least 500 ms apart while the preload moves", () => {
    const harness = createHarness();
    const { rerender } = renderReport(harness.propsOf({}));
    for (let stepIndex = 1; stepIndex <= 40; stepIndex += 1) {
      rerender(
        harness.propsOf({ statuses: statusesWithProgress(stepIndex / 100) }),
      );
      advance(50);
    }
    advance(VJ_STATUS_REPORT_INTERVAL_MS);

    expect(harness.sent.length).toBeGreaterThan(2);
    expect(harness.sent.length).toBeLessThanOrEqual(6);
    for (let sendIndex = 1; sendIndex < harness.sentAt.length; sendIndex += 1) {
      const gapMs =
        (harness.sentAt[sendIndex] ?? 0) - (harness.sentAt[sendIndex - 1] ?? 0);
      expect(gapMs).toBeGreaterThanOrEqual(VJ_STATUS_REPORT_INTERVAL_MS);
    }
    expect(harness.sent.at(-1)?.preload.clips[1]?.progress).toBe(0.4);
  });

  it("sends health every 2 s", () => {
    const harness = createHarness();
    const { rerender } = renderReport(harness.propsOf({ health: HEALTH }));
    expect(harness.sent).toHaveLength(1);

    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS - 1);
    expect(harness.sent).toHaveLength(1);

    const laterHealth: VjScreenHealth = { ...HEALTH, fps: 31.04 };
    rerender(harness.propsOf({ health: laterHealth }));
    advance(1);
    expect(harness.sent).toHaveLength(2);
    expect(harness.sent[1]?.health?.fps).toBe(31);

    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS * 2);
    expect(harness.sent).toHaveLength(4);
  });

  it("sends nothing on the 2 s cadence without health or mic", () => {
    const harness = createHarness();
    renderReport(harness.propsOf({}));

    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS * 3);

    expect(harness.sent).toHaveLength(1);
    expect(harness.sent[0]).not.toHaveProperty("health");
  });

  it("sends mic only while it is on", () => {
    const harness = createHarness();
    const { rerender } = renderReport(harness.propsOf({}));
    expect(harness.sent[0]?.mic).toBeNull();

    rerender(harness.propsOf({ mic: micAt(0.456) }));
    advance(VJ_STATUS_REPORT_INTERVAL_MS);
    expect(harness.sent).toHaveLength(2);
    expect(harness.sent[1]?.mic?.level).toBe(0.46);
    expect(harness.sent[1]?.mic?.bpm).toBe(124);
    expect(Number.isInteger(harness.sent[1]?.mic?.beatAt)).toBe(true);

    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS);
    expect(harness.sent).toHaveLength(3);
    expect(harness.sent[2]?.mic).not.toBeNull();

    rerender(harness.propsOf({ mic: null }));
    advance(VJ_STATUS_REPORT_INTERVAL_MS);
    expect(harness.sent).toHaveLength(4);
    expect(harness.sent[3]?.mic).toBeNull();

    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS * 3);
    expect(harness.sent).toHaveLength(4);
  });

  it("drops reports while disconnected", () => {
    const harness = createHarness();
    const { rerender } = renderReport(harness.propsOf({ health: HEALTH }));
    expect(harness.sent).toHaveLength(1);

    rerender(harness.propsOf({ isConnected: false, health: HEALTH }));
    rerender(
      harness.propsOf({
        isConnected: false,
        health: HEALTH,
        statuses: statusesWithProgress(0.9),
      }),
    );
    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS * 3);
    expect(harness.sent).toHaveLength(1);

    rerender(
      harness.propsOf({ health: HEALTH, statuses: statusesWithProgress(0.9) }),
    );
    expect(harness.sent).toHaveLength(2);
    expect(harness.sent[1]?.preload.clips[1]?.progress).toBe(0.9);
  });

  it("stops every timer on unmount", () => {
    const harness = createHarness();
    const { unmount } = renderReport(harness.propsOf({ health: HEALTH }));

    unmount();
    advance(VJ_SCREEN_STATUS_REPORT_INTERVAL_MS * 3);

    expect(harness.sent).toHaveLength(1);
  });
});
