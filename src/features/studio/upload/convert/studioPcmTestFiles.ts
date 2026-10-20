/** WAV and AIFF files built in memory for the converter tests: a header
 *  writer plus a short sine, so no binary fixture lives in the repo. */

export interface PcmTestSpec {
  channels: number;
  sampleRate: number;
  /** Bits each sample takes in the file: 8, 16, 24, 32 or 64. */
  bitsPerSample: number;
  frames: number;
  isFloat?: boolean;
}

/** A chunk of zeros written between the format and the audio. */
export interface TestChunk {
  id: string;
  size: number;
}

export interface WavTestOptions extends PcmTestSpec {
  /** Wraps the format in WAVE_FORMAT_EXTENSIBLE (a 40-byte fmt chunk). */
  isExtensible?: boolean;
  /** Any other format tag, for example 2 (ADPCM). */
  formatTag?: number;
  isRf64?: boolean;
  chunksBeforeData?: TestChunk[];
  /** What the RIFF and data size fields say when a recorder never filled them in. */
  riffSizeField?: number;
  dataSizeField?: number;
}

export type AiffCompression = "NONE" | "twos" | "sowt" | "fl32" | "ulaw";

export interface AiffTestOptions extends PcmTestSpec {
  /** Writes an AIFF-C with this compression type; plain AIFF when left out. */
  compression?: AiffCompression;
  chunksBeforeSound?: TestChunk[];
  /** The SSND offset field: bytes skipped before the first sample. */
  soundOffset?: number;
}

type ByteOrder = "little" | "big";

function writeFourCharacterCode(
  target: Uint8Array,
  offset: number,
  code: string,
) {
  for (let index = 0; index < 4; index += 1)
    target[offset + index] = code.charCodeAt(index);
}

function concatBytes(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const joined = new Uint8Array(
    parts.reduce((total, part) => total + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}

/** A chunk header, its body and the pad byte an odd body needs. */
function chunkBytes(
  id: string,
  body: Uint8Array,
  byteOrder: ByteOrder,
): Uint8Array<ArrayBuffer> {
  const chunk = new Uint8Array(8 + body.length + (body.length % 2));
  writeFourCharacterCode(chunk, 0, id);
  new DataView(chunk.buffer).setUint32(4, body.length, byteOrder === "little");
  chunk.set(body, 8);
  return chunk;
}

function setUint64LittleEndian(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value % 2 ** 32, true);
  view.setUint32(offset + 4, Math.floor(value / 2 ** 32), true);
}

/** Interleaved samples in -1..1: a quiet 440 Hz sine, shifted per channel. */
function sineSamples(spec: PcmTestSpec): number[] {
  const samples: number[] = [];
  for (let frame = 0; frame < spec.frames; frame += 1)
    for (let channel = 0; channel < spec.channels; channel += 1)
      samples.push(
        0.5 * Math.sin((2 * Math.PI * 440 * frame) / spec.sampleRate + channel),
      );
  return samples;
}

/** The samples as a WAV stores them (unsigned 8-bit) or as an AIFF does
 *  (signed 8-bit), in the given byte order. */
function encodeSamples(
  spec: PcmTestSpec,
  byteOrder: ByteOrder,
  isSigned8Bit: boolean,
): Uint8Array<ArrayBuffer> {
  const samples = sineSamples(spec);
  const bytesPerSample = spec.bitsPerSample / 8;
  const bytes = new Uint8Array(samples.length * bytesPerSample);
  const view = new DataView(bytes.buffer);
  const isLittleEndian = byteOrder === "little";
  samples.forEach((sample, index) => {
    const offset = index * bytesPerSample;
    if (spec.isFloat) {
      if (bytesPerSample === 4) view.setFloat32(offset, sample, isLittleEndian);
      else view.setFloat64(offset, sample, isLittleEndian);
      return;
    }
    if (bytesPerSample === 1) {
      const value = Math.round(sample * 127);
      view.setUint8(offset, isSigned8Bit ? value & 0xff : value + 128);
      return;
    }
    const value = Math.round(sample * (2 ** (spec.bitsPerSample - 1) - 1));
    if (bytesPerSample === 2) view.setInt16(offset, value, isLittleEndian);
    else if (bytesPerSample === 4) view.setInt32(offset, value, isLittleEndian);
    else {
      const unsigned = value & 0xffffff;
      const lowByte = unsigned & 0xff;
      const middleByte = (unsigned >> 8) & 0xff;
      const highByte = (unsigned >> 16) & 0xff;
      bytes.set(
        isLittleEndian
          ? [lowByte, middleByte, highByte]
          : [highByte, middleByte, lowByte],
        offset,
      );
    }
  });
  return bytes;
}

function waveFormatBody(options: WavTestOptions, formatTag: number) {
  const bytesPerSample = options.bitsPerSample / 8;
  const blockAlign = options.channels * bytesPerSample;
  const body = new Uint8Array(options.isExtensible ? 40 : 16);
  const view = new DataView(body.buffer);
  view.setUint16(0, options.isExtensible ? 0xfffe : formatTag, true);
  view.setUint16(2, options.channels, true);
  view.setUint32(4, options.sampleRate, true);
  view.setUint32(8, options.sampleRate * blockAlign, true);
  view.setUint16(12, blockAlign, true);
  view.setUint16(14, options.bitsPerSample, true);
  if (options.isExtensible) {
    view.setUint16(16, 22, true);
    view.setUint16(18, options.bitsPerSample, true);
    view.setUint32(20, options.channels === 1 ? 0x4 : 0x3, true);
    view.setUint16(24, formatTag, true);
    body.set(
      [
        0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00, 0xaa, 0x00, 0x38,
        0x9b, 0x71,
      ],
      26,
    );
  }
  return body;
}

/** A WAV in the canonical layout (RIFF, fmt, data) unless options add chunks,
 *  EXTENSIBLE, RF64 or unset size fields. */
export function wavBytes(options: WavTestOptions): Uint8Array<ArrayBuffer> {
  const samples = encodeSamples(options, "little", false);
  const formatTag = options.formatTag ?? (options.isFloat ? 3 : 1);
  const dataChunk = chunkBytes("data", samples, "little");
  const parts = [
    ...(options.isRf64
      ? [chunkBytes("ds64", new Uint8Array(28), "little")]
      : []),
    chunkBytes("fmt ", waveFormatBody(options, formatTag), "little"),
    ...(options.chunksBeforeData ?? []).map((chunk) =>
      chunkBytes(chunk.id, new Uint8Array(chunk.size), "little"),
    ),
    dataChunk,
  ];
  const file = concatBytes([new Uint8Array(12), ...parts]);
  const view = new DataView(file.buffer);
  const bodyLength = file.length - 8;
  const dataSizeOffset = file.length - dataChunk.length + 4;
  writeFourCharacterCode(file, 0, options.isRf64 ? "RF64" : "RIFF");
  writeFourCharacterCode(file, 8, "WAVE");
  if (options.isRf64) {
    view.setUint32(4, 0xffffffff, true);
    // ds64 is the first chunk, so its body starts at byte 20.
    setUint64LittleEndian(view, 20, bodyLength);
    setUint64LittleEndian(view, 28, samples.length);
    setUint64LittleEndian(view, 36, options.frames);
    view.setUint32(dataSizeOffset, 0xffffffff, true);
    return file;
  }
  view.setUint32(4, options.riffSizeField ?? bodyLength, true);
  if (options.dataSizeField !== undefined)
    view.setUint32(dataSizeOffset, options.dataSizeField, true);
  return file;
}

/** An 80-bit IEEE extended number, the way an AIFF COMM chunk stores its rate. */
export function extended80Bytes(value: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(10);
  if (value === 0) return bytes;
  const exponent = Math.floor(Math.log2(value));
  const scaled = (value / 2 ** exponent) * 2 ** 31;
  const highWord = Math.floor(scaled);
  const lowWord = Math.round((scaled - highWord) * 2 ** 32);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, exponent + 16383);
  view.setUint32(2, highWord);
  view.setUint32(6, lowWord >>> 0);
  return bytes;
}

export function aiffBytes(options: AiffTestOptions): Uint8Array<ArrayBuffer> {
  const isAifc = options.compression !== undefined;
  const byteOrder: ByteOrder =
    options.compression === "sowt" ? "little" : "big";
  const samples = encodeSamples(options, byteOrder, true);
  const soundOffset = options.soundOffset ?? 0;
  const soundBody = new Uint8Array(8 + soundOffset + samples.length);
  new DataView(soundBody.buffer).setUint32(0, soundOffset, false);
  soundBody.set(samples, 8 + soundOffset);
  // AIFF-C adds the compression type and an empty name (length byte, pad byte).
  const commonBody = new Uint8Array(isAifc ? 24 : 18);
  const commonView = new DataView(commonBody.buffer);
  commonView.setInt16(0, options.channels, false);
  commonView.setUint32(2, options.frames, false);
  commonView.setInt16(6, options.bitsPerSample, false);
  commonBody.set(extended80Bytes(options.sampleRate), 8);
  if (options.compression)
    writeFourCharacterCode(commonBody, 18, options.compression);
  const versionBody = new Uint8Array([0xa2, 0x80, 0x51, 0x40]);
  const parts = [
    ...(isAifc ? [chunkBytes("FVER", versionBody, "big")] : []),
    chunkBytes("COMM", commonBody, "big"),
    ...(options.chunksBeforeSound ?? []).map((chunk) =>
      chunkBytes(chunk.id, new Uint8Array(chunk.size), "big"),
    ),
    chunkBytes("SSND", soundBody, "big"),
  ];
  const file = concatBytes([new Uint8Array(12), ...parts]);
  writeFourCharacterCode(file, 0, "FORM");
  writeFourCharacterCode(file, 8, isAifc ? "AIFC" : "AIFF");
  new DataView(file.buffer).setUint32(4, file.length - 8, false);
  return file;
}
