import { describe, expect, it } from "vitest";
import { detectRenderSupport } from "./captureApis";

const chromeLike = (): Record<string, unknown> => ({
  navigator: { mediaDevices: { getDisplayMedia: () => undefined } },
  CropTarget: { fromElement: () => Promise.resolve({}) },
  MediaStreamTrackProcessor: function TrackProcessor() {},
  VideoEncoder: function VideoEncoder() {},
  AudioEncoder: function AudioEncoder() {},
});

const without = (key: string) =>
  Object.fromEntries(
    Object.entries(chromeLike()).filter(([name]) => name !== key),
  );

describe("detectRenderSupport", () => {
  it("accepts a Chromium-like browser", () => {
    expect(detectRenderSupport(chromeLike())).toEqual({ isSupported: true });
  });

  it("names screen capture first when it is missing (phones)", () => {
    const scope = { ...chromeLike(), navigator: { mediaDevices: {} } };
    expect(detectRenderSupport(scope)).toEqual({
      isSupported: false,
      missing: "screen-capture",
    });
  });

  it("needs a way to limit capture to the film", () => {
    expect(detectRenderSupport(without("CropTarget"))).toEqual({
      isSupported: false,
      missing: "element-capture",
    });
  });

  it("needs a frame reader (Firefox and Safari have none)", () => {
    expect(detectRenderSupport(without("MediaStreamTrackProcessor"))).toEqual({
      isSupported: false,
      missing: "frame-reader",
    });
  });

  it("needs WebCodecs encoders", () => {
    expect(detectRenderSupport(without("AudioEncoder"))).toEqual({
      isSupported: false,
      missing: "encoder",
    });
  });
});
