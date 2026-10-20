import { describe, expect, it } from "vitest";
import { memorySource } from "../analysis/studioMp3TestFrames";
import {
  createCanonicalWaveReader,
  needsCanonicalWave,
} from "./studioAiffAsWave";
import { readPcmHeader } from "./studioPcmHeader";
import { aiffBytes, wavBytes, type PcmTestSpec } from "./studioPcmTestFiles";

async function canonicalOf(fileBytes: Uint8Array<ArrayBuffer>) {
  const parsed = await readPcmHeader(memorySource(fileBytes).source);
  if (!parsed.ok) throw new Error(`unreadable test file: ${parsed.reason}`);
  const reader = createCanonicalWaveReader(
    new Blob([fileBytes]),
    parsed.header,
  );
  return {
    reader,
    header: parsed.header,
    bytes: Array.from(await reader.read(0, reader.size)),
  };
}

const STEREO: Omit<PcmTestSpec, "bitsPerSample"> = {
  channels: 2,
  sampleRate: 44100,
  frames: 64,
};

describe("createCanonicalWaveReader", () => {
  it.each([16, 24])(
    "turns a %i-bit AIFF into the WAV of the same samples",
    async (bitsPerSample) => {
      const spec = { ...STEREO, bitsPerSample };
      const { bytes, header } = await canonicalOf(aiffBytes(spec));
      expect(needsCanonicalWave(header)).toBe(true);
      expect(bytes).toEqual(Array.from(wavBytes(spec)));
    },
  );

  it("passes sowt through, swaps twos like NONE and labels fl32 as float", async () => {
    const sixteen = { ...STEREO, bitsPerSample: 16 };
    expect(
      (await canonicalOf(aiffBytes({ ...sixteen, compression: "twos" }))).bytes,
    ).toEqual(Array.from(wavBytes(sixteen)));
    expect(
      (await canonicalOf(aiffBytes({ ...sixteen, compression: "sowt" }))).bytes,
    ).toEqual(Array.from(wavBytes(sixteen)));
    const float = { ...STEREO, bitsPerSample: 32, isFloat: true };
    expect(
      (await canonicalOf(aiffBytes({ ...float, compression: "fl32" }))).bytes,
    ).toEqual(Array.from(wavBytes(float)));
  });

  it("turns signed 8-bit AIFF samples into WAV's unsigned bytes", async () => {
    const spec = {
      channels: 1,
      sampleRate: 8000,
      bitsPerSample: 8,
      frames: 64,
    };
    expect((await canonicalOf(aiffBytes(spec))).bytes).toEqual(
      Array.from(wavBytes(spec)),
    );
  });

  it("answers reads that split the header and a sample", async () => {
    const spec = { ...STEREO, bitsPerSample: 24 };
    const { reader } = await canonicalOf(aiffBytes(spec));
    const pieces = [
      await reader.read(0, 43),
      await reader.read(43, 50),
      await reader.read(50, reader.size),
    ];
    expect(pieces.flatMap((piece) => Array.from(piece))).toEqual(
      Array.from(wavBytes(spec)),
    );
  });

  it("writes a fresh header for a WAV whose recorder left the sizes at zero", async () => {
    const spec = {
      channels: 2,
      sampleRate: 48000,
      bitsPerSample: 16,
      frames: 64,
    };
    const { bytes, header } = await canonicalOf(
      wavBytes({ ...spec, riffSizeField: 0, dataSizeField: 0 }),
    );
    expect(needsCanonicalWave(header)).toBe(true);
    expect(bytes).toEqual(Array.from(wavBytes(spec)));
  });

  it("leaves a sound WAV to mediabunny's own reader", async () => {
    const parsed = await readPcmHeader(
      memorySource(wavBytes({ ...STEREO, bitsPerSample: 16 })).source,
    );
    expect(parsed.ok && needsCanonicalWave(parsed.header)).toBe(false);
  });
});
