import { describe, expect, it } from "vitest";
import { memorySource } from "../analysis/studioMp3TestFrames";
import { aiffBytes, extended80Bytes, wavBytes } from "./studioPcmTestFiles";
import {
  PCM_HEADER_WINDOW_BYTES,
  readExtended80,
  readPcmHeader,
  type PcmHeader,
} from "./studioPcmHeader";

async function headerOf(bytes: Uint8Array): Promise<PcmHeader> {
  const result = await readPcmHeader(memorySource(bytes).source);
  if (!result.ok) throw new Error(`expected a header, got ${result.reason}`);
  return result.header;
}

const reasonOf = async (bytes: Uint8Array) => {
  const result = await readPcmHeader(memorySource(bytes).source);
  return result.ok ? "ok" : result.reason;
};

describe("readPcmHeader on WAV", () => {
  it("reads 16-bit PCM with its exact duration", async () => {
    const header = await headerOf(
      wavBytes({
        channels: 2,
        sampleRate: 48000,
        bitsPerSample: 16,
        frames: 12000,
      }),
    );
    expect(header).toEqual({
      container: "wav",
      channels: 2,
      sampleRate: 48000,
      bitsPerSample: 16,
      isFloat: false,
      isLittleEndian: true,
      dataOffset: 44,
      dataBytes: 48000,
      durationSeconds: 0.25,
      hasUnreliableSizes: false,
    });
  });

  it("reads 24-bit PCM", async () => {
    const header = await headerOf(
      wavBytes({
        channels: 1,
        sampleRate: 96000,
        bitsPerSample: 24,
        frames: 9600,
      }),
    );
    expect(header).toMatchObject({ bitsPerSample: 24, dataBytes: 28800 });
    expect(header.durationSeconds).toBeCloseTo(0.1, 9);
  });

  it("reads 32-bit float and WAVE_FORMAT_EXTENSIBLE around it", async () => {
    const spec = {
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 32,
      frames: 441,
      isFloat: true,
    };
    expect(await headerOf(wavBytes(spec))).toMatchObject({
      isFloat: true,
      bitsPerSample: 32,
    });
    expect(
      await headerOf(wavBytes({ ...spec, isExtensible: true })),
    ).toMatchObject({
      isFloat: true,
      dataOffset: 68,
    });
  });

  it("reads RF64 through its ds64 sizes", async () => {
    const header = await headerOf(
      wavBytes({
        channels: 2,
        sampleRate: 44100,
        bitsPerSample: 16,
        frames: 441,
        isRf64: true,
      }),
    );
    expect(header).toMatchObject({
      dataBytes: 1764,
      hasUnreliableSizes: false,
      dataOffset: 80,
    });
  });

  it("refuses compressed WAV, also inside EXTENSIBLE", async () => {
    const spec = {
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      frames: 8,
      formatTag: 2,
    };
    expect(await reasonOf(wavBytes(spec))).toBe("compressed");
    expect(await reasonOf(wavBytes({ ...spec, isExtensible: true }))).toBe(
      "compressed",
    );
  });

  it("refuses a truncated header and bytes that are no WAV or AIFF", async () => {
    const full = wavBytes({
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      frames: 4,
    });
    expect(await reasonOf(full.slice(0, 30))).toBe("truncated");
    expect(await reasonOf(new Uint8Array(100))).toBe("unrecognised");
  });

  it("steps over an odd-size chunk and its pad byte", async () => {
    const header = await headerOf(
      wavBytes({
        channels: 2,
        sampleRate: 44100,
        bitsPerSample: 16,
        frames: 4,
        chunksBeforeData: [{ id: "LIST", size: 3 }],
      }),
    );
    expect(header.dataOffset).toBe(56);
  });

  it("reaches a data chunk past the first 64 KB with small reads", async () => {
    const bytes = wavBytes({
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      frames: 4,
      chunksBeforeData: [{ id: "JUNK", size: 70000 }],
    });
    const { source, reads } = memorySource(bytes);
    const result = await readPcmHeader(source);
    expect(result.ok && result.header.dataOffset).toBe(70052);
    expect(reads[0]).toEqual({ start: 0, end: PCM_HEADER_WINDOW_BYTES });
    const bytesRead = reads.reduce(
      (total, read) => total + read.end - read.start,
      0,
    );
    expect(bytesRead).toBeLessThan(PCM_HEADER_WINDOW_BYTES + 100);
  });

  it("reads to the end of the file when a recorder left the sizes at zero", async () => {
    const bytes = wavBytes({
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      frames: 441,
      riffSizeField: 0,
      dataSizeField: 0,
    });
    expect(await headerOf(bytes)).toMatchObject({
      dataBytes: 1764,
      hasUnreliableSizes: true,
    });
  });

  it("reads to the end of the file when the sizes say 0xFFFFFFFF", async () => {
    const bytes = wavBytes({
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      frames: 441,
      riffSizeField: 0xffffffff,
      dataSizeField: 0xffffffff,
    });
    expect(await headerOf(bytes)).toMatchObject({
      dataBytes: 1764,
      hasUnreliableSizes: false,
    });
  });
});

describe("readPcmHeader on AIFF", () => {
  it("reads 16-bit and 24-bit big-endian AIFF", async () => {
    const sixteen = await headerOf(
      aiffBytes({
        channels: 2,
        sampleRate: 44100,
        bitsPerSample: 16,
        frames: 4410,
      }),
    );
    expect(sixteen).toEqual({
      container: "aiff",
      channels: 2,
      sampleRate: 44100,
      bitsPerSample: 16,
      isFloat: false,
      isLittleEndian: false,
      dataOffset: 54,
      dataBytes: 17640,
      durationSeconds: 0.1,
      hasUnreliableSizes: false,
    });
    const twentyFour = await headerOf(
      aiffBytes({
        channels: 1,
        sampleRate: 96000,
        bitsPerSample: 24,
        frames: 960,
      }),
    );
    expect(twentyFour).toMatchObject({
      sampleRate: 96000,
      bitsPerSample: 24,
      dataBytes: 2880,
    });
  });

  it("reads AIFF-C sowt as little-endian and fl32 as float", async () => {
    expect(
      await headerOf(
        aiffBytes({
          channels: 2,
          sampleRate: 48000,
          bitsPerSample: 16,
          frames: 48,
          compression: "sowt",
        }),
      ),
    ).toMatchObject({ isLittleEndian: true, isFloat: false, dataOffset: 72 });
    expect(
      await headerOf(
        aiffBytes({
          channels: 2,
          sampleRate: 48000,
          bitsPerSample: 32,
          frames: 48,
          isFloat: true,
          compression: "fl32",
        }),
      ),
    ).toMatchObject({
      isLittleEndian: false,
      isFloat: true,
      bitsPerSample: 32,
    });
  });

  it("reads AIFF-C twos as big-endian integer audio, like NONE", async () => {
    expect(
      await headerOf(
        aiffBytes({
          channels: 2,
          sampleRate: 44100,
          bitsPerSample: 16,
          frames: 48,
          compression: "twos",
        }),
      ),
    ).toMatchObject({
      container: "aiff",
      isLittleEndian: false,
      isFloat: false,
      bitsPerSample: 16,
    });
  });

  it("refuses AIFF-C codecs other than NONE, twos, sowt and fl32", async () => {
    expect(
      await reasonOf(
        aiffBytes({
          channels: 1,
          sampleRate: 8000,
          bitsPerSample: 16,
          frames: 8,
          compression: "ulaw",
        }),
      ),
    ).toBe("compressed");
  });

  it("steps over an odd-size chunk and honours the SSND offset", async () => {
    const header = await headerOf(
      aiffBytes({
        channels: 2,
        sampleRate: 44100,
        bitsPerSample: 16,
        frames: 4,
        chunksBeforeSound: [{ id: "ANNO", size: 5 }],
        soundOffset: 4,
      }),
    );
    expect(header.dataOffset).toBe(54 + 14 + 4);
  });

  it("refuses AIFF audio too long for a 44-byte canonical header", async () => {
    const bytes = aiffBytes({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      frames: 4,
    });
    const view = new DataView(bytes.buffer);
    const commonAt = new TextDecoder().decode(bytes).indexOf("COMM");
    const soundAt = new TextDecoder().decode(bytes).indexOf("SSND");
    view.setUint32(commonAt + 10, 0, false);
    view.setUint32(soundAt + 4, 0xfffffff0, false);
    const declaredSize = 5 * 2 ** 30;
    const result = await readPcmHeader({
      size: declaredSize,
      read: (start, end) => {
        const copy = new Uint8Array(end - start);
        copy.set(bytes.subarray(start, Math.min(end, bytes.length)));
        return Promise.resolve(copy.buffer);
      },
    });
    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("decodes the 80-bit extended sample rate", () => {
    for (const rate of [22050, 44100, 96000, 176400])
      expect(
        readExtended80(new DataView(extended80Bytes(rate).buffer), 0),
      ).toBe(rate);
  });
});

/** A copy of `bytes` with big- or little-endian fields overwritten. */
function patched(
  bytes: Uint8Array<ArrayBuffer>,
  edits: { at: number; size: 1 | 2 | 4; value: number; isLittle?: boolean }[],
) {
  const copy = bytes.slice();
  const view = new DataView(copy.buffer);
  for (const { at, size, value, isLittle = true } of edits) {
    if (size === 1) view.setUint8(at, value);
    else if (size === 2) view.setUint16(at, value, isLittle);
    else view.setUint32(at, value, isLittle);
  }
  return copy;
}

// A canonical mono 16-bit WAV: fmt body at 20 (channels 22, rate 24), data
// size at 40, samples from 44.
const smallWav = () =>
  wavBytes({ channels: 1, sampleRate: 8000, bitsPerSample: 16, frames: 100 });

describe("readPcmHeader on 8-bit and 64-bit float audio", () => {
  it("reads 8-bit WAV", async () => {
    const header = await headerOf(
      wavBytes({
        channels: 1,
        sampleRate: 8000,
        bitsPerSample: 8,
        frames: 8000,
      }),
    );
    expect(header).toMatchObject({
      bitsPerSample: 8,
      isFloat: false,
      dataBytes: 8000,
      durationSeconds: 1,
    });
  });

  it("reads 64-bit float WAV", async () => {
    const header = await headerOf(
      wavBytes({
        channels: 2,
        sampleRate: 44100,
        bitsPerSample: 64,
        frames: 4410,
        isFloat: true,
      }),
    );
    expect(header).toMatchObject({
      bitsPerSample: 64,
      isFloat: true,
      dataBytes: 4410 * 16,
    });
    expect(header.durationSeconds).toBeCloseTo(0.1, 9);
  });

  it("refuses 64-bit integer WAV, which no converter reads", async () => {
    expect(
      await reasonOf(
        wavBytes({
          channels: 1,
          sampleRate: 8000,
          bitsPerSample: 64,
          frames: 10,
        }),
      ),
    ).toBe("invalid");
  });

  it("reads 8-bit AIFF", async () => {
    const header = await headerOf(
      aiffBytes({
        channels: 1,
        sampleRate: 8000,
        bitsPerSample: 8,
        frames: 800,
      }),
    );
    expect(header).toMatchObject({
      container: "aiff",
      bitsPerSample: 8,
      dataBytes: 800,
    });
  });
});

describe("readPcmHeader on hostile headers", () => {
  it("refuses an empty file and one shorter than the RIFF lead", async () => {
    expect(await reasonOf(new Uint8Array(0))).toBe("truncated");
    expect(await reasonOf(smallWav().slice(0, 11))).toBe("truncated");
  });

  it("refuses a fmt chunk that claims 4 GB, without reading past the file", async () => {
    const bytes = patched(smallWav(), [{ at: 16, size: 4, value: 0xffffffff }]);
    expect(await reasonOf(bytes)).toBe("truncated");
  });

  it("refuses zero channels and a zero sample rate", async () => {
    expect(
      await reasonOf(patched(smallWav(), [{ at: 22, size: 2, value: 0 }])),
    ).toBe("invalid");
    expect(
      await reasonOf(patched(smallWav(), [{ at: 24, size: 4, value: 0 }])),
    ).toBe("invalid");
  });

  it("refuses a block size that disagrees with channels and bits", async () => {
    expect(
      await reasonOf(patched(smallWav(), [{ at: 32, size: 2, value: 7 }])),
    ).toBe("invalid");
  });

  it("clamps a data size larger than the file to the bytes that exist", async () => {
    const header = await headerOf(
      patched(smallWav(), [{ at: 40, size: 4, value: 0x7fffffff }]),
    );
    expect(header.dataBytes).toBe(200);
  });

  it("refuses audio that comes before its format", async () => {
    const bytes = new Uint8Array(12 + 8 + 4);
    bytes.set(new TextEncoder().encode("RIFF"), 0);
    bytes.set(new TextEncoder().encode("WAVE"), 8);
    bytes.set(new TextEncoder().encode("data"), 12);
    new DataView(bytes.buffer).setUint32(16, 4, true);
    expect(await reasonOf(bytes)).toBe("invalid");
  });

  it("gives up on a file of endless empty chunks", async () => {
    const chunkCount = 2000;
    const bytes = new Uint8Array(12 + chunkCount * 8);
    bytes.set(new TextEncoder().encode("RIFF"), 0);
    bytes.set(new TextEncoder().encode("WAVE"), 8);
    for (let index = 0; index < chunkCount; index += 1)
      bytes.set(new TextEncoder().encode("JUNK"), 12 + index * 8);
    expect(await reasonOf(bytes)).toBe("invalid");
  });

  it("refuses an AIFF whose SSND chunk is smaller than its own header", async () => {
    const bytes = aiffBytes({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      frames: 100,
    });
    // FORM lead 12, COMM 8 + 18, so SSND starts at 38 and its size at 42.
    expect(
      await reasonOf(
        patched(bytes, [{ at: 42, size: 4, value: 0, isLittle: false }]),
      ),
    ).toBe("invalid");
  });

  it("refuses an AIFF whose SSND offset points past the file", async () => {
    const bytes = aiffBytes({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      frames: 100,
    });
    expect(
      await reasonOf(
        patched(bytes, [
          { at: 46, size: 4, value: 0xffffffff, isLittle: false },
        ]),
      ),
    ).toBe("invalid");
  });

  it("refuses an AIFF whose sample rate is infinite", async () => {
    const bytes = aiffBytes({
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 16,
      frames: 100,
    });
    // COMM body starts at 20; the 80-bit rate sits 8 bytes in.
    expect(
      await reasonOf(
        patched(bytes, [{ at: 28, size: 2, value: 0x7fff, isLittle: false }]),
      ),
    ).toBe("invalid");
  });
});
