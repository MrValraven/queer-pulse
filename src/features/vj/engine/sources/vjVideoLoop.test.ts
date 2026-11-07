import { describe, expect, it } from "vitest";
import {
  VJ_LOOP_SEEK_LEAD_SEC,
  vjLoopWindowOf,
  vjVideoLoopAction,
} from "./vjVideoLoop";

describe("vjVideoLoop", () => {
  it("answers null for a whole-clip loop", () => {
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: null,
        loopOutMs: null,
        loopMode: "loop",
      }),
    ).toBeNull();
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: 0,
        loopOutMs: 8000,
        loopMode: "loop",
      }),
    ).toBeNull();
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: null,
        loopOutMs: null,
        loopMode: "pingPong",
      }),
    ).toEqual({ inSec: 0, outSec: 8, mode: "pingPong" });
  });

  it("seeks back to loop in just before loop out", () => {
    const window = vjLoopWindowOf({
      durationMs: 8000,
      loopInMs: 1000,
      loopOutMs: 3000,
      loopMode: "loop",
    });
    expect(window).toEqual({ inSec: 1, outSec: 3, mode: "loop" });
    if (window === null) return;
    expect(vjVideoLoopAction(window, 2)).toEqual({ kind: "none" });
    expect(vjVideoLoopAction(window, 3 - VJ_LOOP_SEEK_LEAD_SEC)).toEqual({
      kind: "seekToIn",
    });
    expect(vjVideoLoopAction(window, 3.5)).toEqual({ kind: "seekToIn" });
    expect(vjVideoLoopAction(window, 0)).toEqual({ kind: "seekToIn" });
    // In alone loops from there to the end; out alone loops from 0.
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: 2000,
        loopOutMs: null,
        loopMode: "loop",
      }),
    ).toEqual({ inSec: 2, outSec: 8, mode: "loop" });
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: null,
        loopOutMs: 4000,
        loopMode: "loop",
      }),
    ).toEqual({ inSec: 0, outSec: 4, mode: "loop" });
  });

  it("turns backward at loop out in ping-pong", () => {
    const window = vjLoopWindowOf({
      durationMs: 8000,
      loopInMs: 1000,
      loopOutMs: 3000,
      loopMode: "pingPong",
    });
    expect(window).toEqual({ inSec: 1, outSec: 3, mode: "pingPong" });
    if (window === null) return;
    expect(vjVideoLoopAction(window, 1.5)).toEqual({ kind: "none" });
    expect(vjVideoLoopAction(window, 2.96)).toEqual({ kind: "turnBackward" });
  });

  it("falls back to the whole clip for a span under the loop minimum", () => {
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: 1000,
        loopOutMs: 1200,
        loopMode: "loop",
      }),
    ).toBeNull();
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: 1000,
        loopOutMs: 1200,
        loopMode: "pingPong",
      }),
    ).toEqual({ inSec: 0, outSec: 8, mode: "pingPong" });
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: 3000,
        loopOutMs: 1000,
        loopMode: "loop",
      }),
    ).toBeNull();
    expect(
      vjLoopWindowOf({
        durationMs: 8000,
        loopInMs: 1000,
        loopOutMs: 1250,
        loopMode: "loop",
      }),
    ).toEqual({ inSec: 1, outSec: 1.25, mode: "loop" });
  });
});
