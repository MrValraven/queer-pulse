import { describe, expect, it } from "vitest";
import {
  isVjPreviewSupported,
  pickVjPreviewRecorderType,
  vjPreviewHeaderCodeOf,
  vjPreviewSize,
  vjPreviewStartMs,
  type VjPreviewEnvironment,
} from "./vjPreviewFormat";

function environmentOf(
  supportedTypes: readonly string[] | null,
  overrides: Partial<VjPreviewEnvironment> = {},
): VjPreviewEnvironment {
  return {
    isTypeSupported:
      supportedTypes === null
        ? null
        : (mimeType: string) => supportedTypes.includes(mimeType),
    hasCanvasCapture: true,
    hasImageDecoder: true,
    ...overrides,
  };
}

function asciiBytes(text: string): number[] {
  return Array.from(text, (letter) => letter.charCodeAt(0));
}

describe("pickVjPreviewRecorderType", () => {
  it("picks VP9 WebM first", () => {
    const environment = environmentOf([
      "video/mp4",
      "video/webm;codecs=vp8",
      "video/webm;codecs=vp9",
    ]);
    expect(pickVjPreviewRecorderType(environment)).toEqual({
      mimeType: "video/webm;codecs=vp9",
      contentType: "video/webm",
    });
  });

  it("takes VP8 WebM when VP9 is missing", () => {
    const environment = environmentOf(["video/webm;codecs=vp8", "video/mp4"]);
    expect(pickVjPreviewRecorderType(environment)?.mimeType).toBe(
      "video/webm;codecs=vp8",
    );
  });

  it("falls back to MP4 when WebM is missing (Safari)", () => {
    const environment = environmentOf(["video/mp4"]);
    expect(pickVjPreviewRecorderType(environment)).toEqual({
      mimeType: "video/mp4",
      contentType: "video/mp4",
    });
  });

  it("reports no recorder without MediaRecorder or canvas capture", () => {
    expect(pickVjPreviewRecorderType(environmentOf(null))).toBeNull();
    expect(
      pickVjPreviewRecorderType(
        environmentOf(["video/webm;codecs=vp9"], { hasCanvasCapture: false }),
      ),
    ).toBeNull();
    expect(pickVjPreviewRecorderType(environmentOf([]))).toBeNull();
  });
});

describe("isVjPreviewSupported", () => {
  it("needs ImageDecoder for a GIF", () => {
    const environment = environmentOf(["video/webm;codecs=vp9"], {
      hasImageDecoder: false,
    });
    expect(isVjPreviewSupported("video", environment)).toBe(true);
    expect(isVjPreviewSupported("gif", environment)).toBe(false);
    expect(
      isVjPreviewSupported("gif", environmentOf(["video/webm;codecs=vp9"])),
    ).toBe(true);
  });

  it("supports neither kind without a recorder type", () => {
    expect(isVjPreviewSupported("video", environmentOf(null))).toBe(false);
    expect(isVjPreviewSupported("gif", environmentOf(null))).toBe(false);
  });
});

describe("vjPreviewSize", () => {
  it("scales the long edge to 240 and keeps both sides even", () => {
    expect(vjPreviewSize(1920, 1080)).toEqual({ width: 240, height: 136 });
    expect(vjPreviewSize(1080, 1920)).toEqual({ width: 136, height: 240 });
    expect(vjPreviewSize(500, 333)).toEqual({ width: 240, height: 160 });
    expect(vjPreviewSize(120, 120)).toEqual({ width: 240, height: 240 });
  });

  it("keeps a very thin side at 2 pixels", () => {
    expect(vjPreviewSize(4000, 10)).toEqual({ width: 240, height: 2 });
  });
});

describe("vjPreviewStartMs", () => {
  it("starts a video at one second, or halfway through a short one", () => {
    expect(vjPreviewStartMs(8000)).toBe(1000);
    expect(vjPreviewStartMs(2000)).toBe(1000);
    expect(vjPreviewStartMs(1200)).toBe(600);
  });

  it("starts at 0 when the duration is unknown", () => {
    expect(vjPreviewStartMs(null)).toBe(0);
    expect(vjPreviewStartMs(Number.NaN)).toBe(0);
    expect(vjPreviewStartMs(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("vjPreviewHeaderCodeOf", () => {
  const webmBytes = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0]);
  const isoMp4Bytes = new Uint8Array([
    0,
    0,
    0,
    0x18,
    ...asciiBytes("ftypisom"),
    0,
    0,
    0,
    0,
  ]);
  const quickTimeBytes = new Uint8Array([
    0,
    0,
    0,
    0x14,
    ...asciiBytes("ftypqt  "),
    0,
    0,
    0,
    0,
  ]);

  it("accepts a WebM and an isom MP4", () => {
    expect(vjPreviewHeaderCodeOf(webmBytes, "video/webm")).toBeNull();
    expect(vjPreviewHeaderCodeOf(isoMp4Bytes, "video/mp4")).toBeNull();
  });

  it("names a QuickTime-branded MP4 as VJ_PREVIEW_UNSUPPORTED", () => {
    expect(vjPreviewHeaderCodeOf(quickTimeBytes, "video/mp4")).toBe(
      "VJ_PREVIEW_UNSUPPORTED",
    );
  });

  it("names a WebM take without its header as VJ_PREVIEW_FAILED", () => {
    expect(vjPreviewHeaderCodeOf(isoMp4Bytes, "video/webm")).toBe(
      "VJ_PREVIEW_FAILED",
    );
  });
});
