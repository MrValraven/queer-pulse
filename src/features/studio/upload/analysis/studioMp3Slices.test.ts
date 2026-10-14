import { describe, expect, it } from "vitest";
import { StudioNotMp3Error, mp3Slices } from "./studioMp3Slices";
import { FRAME_LENGTH, memorySource, mp3Bytes } from "./studioMp3TestFrames";

async function collect(
  bytes: Uint8Array,
  options: { sliceBytes: number; lookaheadBytes: number },
) {
  const { source, reads } = memorySource(bytes);
  const slices: Uint8Array[] = [];
  for await (const slice of mp3Slices(source, options))
    slices.push(new Uint8Array(slice.bytes));
  return { slices, reads };
}

describe("mp3Slices", () => {
  it("cuts every slice on a frame header and covers the whole file", async () => {
    const bytes = mp3Bytes(60, { id3PayloadLength: 100 });
    const { slices } = await collect(bytes, {
      sliceBytes: 5000,
      lookaheadBytes: 1000,
    });
    expect(slices.length).toBeGreaterThan(3);
    for (const slice of slices)
      expect([slice[0], slice[1]]).toEqual([0xff, 0xfb]);
    const total = slices.reduce((sum, slice) => sum + slice.length, 0);
    expect(total).toBe(bytes.length - 110);
    const joined = new Uint8Array(total);
    let offset = 0;
    for (const slice of slices) {
      joined.set(slice, offset);
      offset += slice.length;
    }
    expect(joined).toEqual(bytes.slice(110));
  });

  it("never reads more than one slice and its lookahead", async () => {
    const bytes = mp3Bytes(400);
    const { reads } = await collect(bytes, {
      sliceBytes: 20000,
      lookaheadBytes: 2000,
    });
    for (const read of reads)
      expect(read.end - read.start).toBeLessThanOrEqual(22000);
    for (let index = 1; index < reads.length; index += 1)
      expect(reads[index]?.start ?? 0).toBeGreaterThanOrEqual(
        reads[index - 1]?.start ?? 0,
      );
  });

  it("reports the first frame's sample rate with each slice", async () => {
    const { source } = memorySource(mp3Bytes(20));
    for await (const slice of mp3Slices(source, {
      sliceBytes: 3000,
      lookaheadBytes: 800,
    }))
      expect(slice.header.sampleRate).toBe(44100);
  });

  it("refuses a file with no frame", async () => {
    const { source } = memorySource(new Uint8Array(5000));
    const iterate = async () => {
      for await (const slice of mp3Slices(source)) void slice;
    };
    await expect(iterate()).rejects.toBeInstanceOf(StudioNotMp3Error);
  });

  it("stops when the signal aborts", async () => {
    const controller = new AbortController();
    const { source } = memorySource(mp3Bytes(60));
    const seen: number[] = [];
    const iterate = async () => {
      for await (const slice of mp3Slices(source, {
        sliceBytes: 3 * FRAME_LENGTH,
        lookaheadBytes: 2 * FRAME_LENGTH,
        signal: controller.signal,
      })) {
        seen.push(slice.bytes.byteLength);
        controller.abort();
      }
    };
    await expect(iterate()).rejects.toThrow();
    expect(seen).toHaveLength(1);
  });

  it("refuses a file with no second header inside the lookahead", async () => {
    const frames = mp3Bytes(12);
    const bytes = new Uint8Array(frames.length + 3000);
    bytes.set(frames, 0);
    const { source } = memorySource(bytes);
    const iterate = async () => {
      for await (const slice of mp3Slices(source, {
        sliceBytes: 5000,
        lookaheadBytes: 1000,
      }))
        void slice;
    };
    await expect(iterate()).rejects.toBeInstanceOf(StudioNotMp3Error);
  });

  it("refuses a source that returns no bytes before the end", async () => {
    const bytes = mp3Bytes(60);
    const source = {
      size: bytes.length,
      read: (start: number, end: number) =>
        Promise.resolve(
          start > 0 ? new ArrayBuffer(0) : bytes.slice(start, end).buffer,
        ),
    };
    const iterate = async () => {
      for await (const slice of mp3Slices(source, {
        sliceBytes: 3000,
        lookaheadBytes: 800,
      }))
        void slice;
    };
    await expect(iterate()).rejects.toBeInstanceOf(StudioNotMp3Error);
  });
});
