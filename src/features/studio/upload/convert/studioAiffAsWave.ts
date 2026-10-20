import type { PcmHeader } from "./studioPcmHeader";

export const CANONICAL_WAVE_HEADER_BYTES = 44;
const WAVE_FORMAT_PCM = 1;
const WAVE_FORMAT_IEEE_FLOAT = 3;

/** AIFF always, and a WAV whose size fields mediabunny would trust wrongly. */
export function needsCanonicalWave(header: PcmHeader): boolean {
  return header.container === "aiff" || header.hasUnreliableSizes;
}

function writeFourCharacterCode(
  target: Uint8Array,
  offset: number,
  code: string,
) {
  for (let index = 0; index < 4; index += 1)
    target[offset + index] = code.charCodeAt(index);
}

/** RIFF, a 16-byte fmt chunk (format 1 or 3) and the data chunk's header. */
export function canonicalWaveHeader(
  header: PcmHeader,
): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(CANONICAL_WAVE_HEADER_BYTES);
  const view = new DataView(bytes.buffer);
  const blockAlign = header.channels * (header.bitsPerSample / 8);
  writeFourCharacterCode(bytes, 0, "RIFF");
  view.setUint32(4, 36 + header.dataBytes, true);
  writeFourCharacterCode(bytes, 8, "WAVE");
  writeFourCharacterCode(bytes, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(
    20,
    header.isFloat ? WAVE_FORMAT_IEEE_FLOAT : WAVE_FORMAT_PCM,
    true,
  );
  view.setUint16(22, header.channels, true);
  view.setUint32(24, header.sampleRate, true);
  view.setUint32(28, header.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, header.bitsPerSample, true);
  writeFourCharacterCode(bytes, 36, "data");
  view.setUint32(40, header.dataBytes, true);
  return bytes;
}

/** Puts a run of whole samples into WAV order, in place: big-endian samples
 *  are byte-swapped, and AIFF's signed 8-bit samples become unsigned. */
export function toWaveSampleOrder(
  samples: Uint8Array,
  header: PcmHeader,
): void {
  const bytesPerSample = header.bitsPerSample / 8;
  if (bytesPerSample === 1) {
    if (header.container !== "aiff") return;
    for (let index = 0; index < samples.length; index += 1)
      samples[index] = (samples[index] ?? 0) ^ 0x80;
    return;
  }
  if (header.isLittleEndian) return;
  for (
    let start = 0;
    start + bytesPerSample <= samples.length;
    start += bytesPerSample
  )
    for (
      let low = start, high = start + bytesPerSample - 1;
      low < high;
      low += 1, high -= 1
    ) {
      const lowByte = samples[low] ?? 0;
      samples[low] = samples[high] ?? 0;
      samples[high] = lowByte;
    }
}

export interface CanonicalWaveReader {
  size: number;
  /** Bytes [start, end) of the canonical WAV. */
  read: (start: number, end: number) => Promise<Uint8Array>;
}

/** The file as a canonical WAV: a fresh 44-byte header, then the audio read
 *  through Blob.slice and put into WAV order as it is read. */
export function createCanonicalWaveReader(
  file: Blob,
  header: PcmHeader,
): CanonicalWaveReader {
  const headerBytes = canonicalWaveHeader(header);
  const bytesPerSample = header.bitsPerSample / 8;
  const size = CANONICAL_WAVE_HEADER_BYTES + header.dataBytes;

  /** Audio bytes [dataStart, dataEnd), widened to whole samples for the swap. */
  async function readAudio(dataStart: number, dataEnd: number) {
    const alignedStart = dataStart - (dataStart % bytesPerSample);
    const alignedEnd = Math.min(
      header.dataBytes,
      Math.ceil(dataEnd / bytesPerSample) * bytesPerSample,
    );
    const samples = new Uint8Array(
      await file
        .slice(header.dataOffset + alignedStart, header.dataOffset + alignedEnd)
        .arrayBuffer(),
    );
    toWaveSampleOrder(samples, header);
    return samples.subarray(dataStart - alignedStart, dataEnd - alignedStart);
  }

  return {
    size,
    read: async (start, end) => {
      const clampedEnd = Math.min(end, size);
      const result = new Uint8Array(Math.max(0, clampedEnd - start));
      if (start < CANONICAL_WAVE_HEADER_BYTES)
        result.set(
          headerBytes.subarray(
            start,
            Math.min(clampedEnd, CANONICAL_WAVE_HEADER_BYTES),
          ),
          0,
        );
      if (clampedEnd > CANONICAL_WAVE_HEADER_BYTES) {
        const audioStart = Math.max(start, CANONICAL_WAVE_HEADER_BYTES);
        result.set(
          await readAudio(
            audioStart - CANONICAL_WAVE_HEADER_BYTES,
            clampedEnd - CANONICAL_WAVE_HEADER_BYTES,
          ),
          audioStart - start,
        );
      }
      return result;
    },
  };
}
