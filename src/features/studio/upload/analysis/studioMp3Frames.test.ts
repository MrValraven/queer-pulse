import { describe, expect, it } from "vitest";
import {
  findFrameBoundary,
  id3v2Length,
  parseMp3FrameHeader,
} from "./studioMp3Frames";
import {
  FRAME_LENGTH,
  MONO_FRAME_HEADER,
  mp3Bytes,
} from "./studioMp3TestFrames";

describe("parseMp3FrameHeader", () => {
  it("reads sample rate, frame length and channels", () => {
    expect(parseMp3FrameHeader(mp3Bytes(1), 0)).toEqual({
      sampleRate: 44100,
      frameLength: FRAME_LENGTH,
      channelCount: 2,
    });
    expect(
      parseMp3FrameHeader(mp3Bytes(1, { header: MONO_FRAME_HEADER }), 0)
        ?.channelCount,
    ).toBe(1);
  });

  it("refuses a free or bad bitrate, a reserved rate and other layers", () => {
    expect(
      parseMp3FrameHeader(Uint8Array.from([0xff, 0xfb, 0x00, 0x00]), 0),
    ).toBeNull();
    expect(
      parseMp3FrameHeader(Uint8Array.from([0xff, 0xfb, 0xf0, 0x00]), 0),
    ).toBeNull();
    expect(
      parseMp3FrameHeader(Uint8Array.from([0xff, 0xfb, 0x9c, 0x00]), 0),
    ).toBeNull();
    expect(
      parseMp3FrameHeader(Uint8Array.from([0xff, 0xfd, 0x90, 0x00]), 0),
    ).toBeNull();
    expect(
      parseMp3FrameHeader(Uint8Array.from([0xff, 0xfb, 0x90]), 0),
    ).toBeNull();
  });
});

describe("id3v2Length", () => {
  it("adds the ten-byte header to the syncsafe size", () => {
    expect(id3v2Length(mp3Bytes(1, { id3PayloadLength: 257 }))).toBe(267);
    expect(id3v2Length(mp3Bytes(1))).toBe(0);
  });
});

describe("findFrameBoundary", () => {
  it("finds the next header that another header follows", () => {
    const bytes = mp3Bytes(4);
    expect(findFrameBoundary(bytes, 1)).toBe(FRAME_LENGTH);
  });

  it("skips a stray sync pattern inside audio data", () => {
    const bytes = mp3Bytes(4);
    bytes.set([0xff, 0xfb, 0x90, 0x00], 100);
    expect(findFrameBoundary(bytes, 50)).toBe(FRAME_LENGTH);
  });

  it("accepts a last header whose next frame lies past the window", () => {
    const bytes = mp3Bytes(2);
    expect(findFrameBoundary(bytes, FRAME_LENGTH)).toBe(FRAME_LENGTH);
  });

  it("answers null when no header remains", () => {
    expect(findFrameBoundary(new Uint8Array(2000), 0)).toBeNull();
  });
});
