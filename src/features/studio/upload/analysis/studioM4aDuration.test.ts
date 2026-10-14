import { describe, expect, it } from "vitest";
import { m4aDurationSeconds } from "./studioM4aDuration";
import { sniffAudioKind } from "./studioAudioSniff";
import { memorySource, mp3Bytes } from "./studioMp3TestFrames";

function box(type: string, payload: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(8 + payload.length);
  new DataView(bytes.buffer).setUint32(0, bytes.length);
  bytes.set(
    Array.from(type, (character) => character.charCodeAt(0)),
    4,
  );
  bytes.set(payload, 8);
  return bytes;
}

function mvhdVersion0(timescale: number, duration: number): Uint8Array {
  const payload = new Uint8Array(100);
  const view = new DataView(payload.buffer);
  view.setUint32(12, timescale);
  view.setUint32(16, duration);
  return box("mvhd", payload);
}

function join(...parts: Uint8Array[]): Uint8Array {
  const joined = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}

describe("m4aDurationSeconds", () => {
  it("reads mvhd inside moov after the media data", async () => {
    const file = join(
      box("ftyp", new Uint8Array(16)),
      box("mdat", new Uint8Array(5000)),
      box("moov", mvhdVersion0(1000, 754_000)),
    );
    const { source, reads } = memorySource(file);
    expect(await m4aDurationSeconds(source)).toBe(754);
    expect(reads.every((read) => read.end - read.start <= 4096)).toBe(true);
  });

  it("answers null without a moov box", async () => {
    const { source } = memorySource(box("ftyp", new Uint8Array(16)));
    expect(await m4aDurationSeconds(source)).toBeNull();
  });
});

describe("sniffAudioKind", () => {
  it("tells MP3 (bare or tagged) from M4A", async () => {
    expect(await sniffAudioKind(memorySource(mp3Bytes(3)).source)).toBe("mp3");
    expect(
      await sniffAudioKind(
        memorySource(mp3Bytes(3, { id3PayloadLength: 20 })).source,
      ),
    ).toBe("mp3");
    expect(
      await sniffAudioKind(
        memorySource(box("ftyp", new Uint8Array(16))).source,
      ),
    ).toBe("m4a");
    expect(
      await sniffAudioKind(memorySource(new Uint8Array(32)).source),
    ).toBeNull();
  });
});
