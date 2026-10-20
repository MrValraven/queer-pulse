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
