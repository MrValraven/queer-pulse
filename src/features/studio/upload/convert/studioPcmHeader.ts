import type { StudioByteSource } from "../analysis/studioByteSource";

export type PcmContainer = "wav" | "aiff";

export interface PcmHeader {
  container: PcmContainer;
  channels: number;
  sampleRate: number;
  /** Bits each sample takes in the file: 8, 16, 24, 32 or 64. */
  bitsPerSample: number;
  isFloat: boolean;
  isLittleEndian: boolean;
  dataOffset: number;
  dataBytes: number;
  durationSeconds: number;
  /** A WAV whose RIFF or data size a recorder never filled in: the
   *  converter gives it a fresh header (studioAiffAsWave.ts). */
  hasUnreliableSizes: boolean;
}

export type PcmHeaderFailure =
  "unrecognised" | "compressed" | "truncated" | "invalid";

export type PcmHeaderResult =
  { ok: true; header: PcmHeader } | { ok: false; reason: PcmHeaderFailure };

/** The first read. Chunks past it (a long bext or JUNK) take small reads. */
export const PCM_HEADER_WINDOW_BYTES = 64 * 1024;
/** A size field a recorder left unset. */
const UNSET_SIZE = 0xffffffff;
/** The most data a 44-byte WAV header can describe. */
export const MAX_REWRITABLE_DATA_BYTES = UNSET_SIZE - 36;
const MAX_CHUNKS = 1024;
const MAX_CHANNELS = 32;
const MAX_SAMPLE_RATE = 768_000;
const WAVE_FORMAT_PCM = 1;
const WAVE_FORMAT_IEEE_FLOAT = 3;
const WAVE_FORMAT_EXTENSIBLE = 0xfffe;
const INTEGER_BITS: ReadonlySet<number> = new Set([8, 16, 24, 32]);
const FLOAT_BITS: ReadonlySet<number> = new Set([32, 64]);
const AIFF_ENCODINGS: ReadonlyMap<
  string,
  { isFloat: boolean; isLittleEndian: boolean }
> = new Map([
  ["NONE", { isFloat: false, isLittleEndian: false }],
  ["twos", { isFloat: false, isLittleEndian: false }],
  ["sowt", { isFloat: false, isLittleEndian: true }],
  ["fl32", { isFloat: true, isLittleEndian: false }],
  ["FL32", { isFloat: true, isLittleEndian: false }],
]);

const failure = (reason: PcmHeaderFailure): PcmHeaderResult => ({
  ok: false,
  reason,
});

interface HeaderBytes {
  size: number;
  /** The bytes at a position, from the first window or a small read. */
  at: (position: number, length: number) => Promise<DataView | null>;
}

function headerBytesOf(
  source: StudioByteSource,
  firstWindow: ArrayBuffer,
): HeaderBytes {
  return {
    size: source.size,
    at: async (position, length) => {
      if (position < 0 || length < 0 || position + length > source.size)
        return null;
      if (position + length <= firstWindow.byteLength)
        return new DataView(firstWindow, position, length);
      return new DataView(await source.read(position, position + length));
    },
  };
}

const fourCharacterCode = (view: DataView, offset: number) =>
  String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );

const readUint64LittleEndian = (view: DataView, offset: number) =>
  view.getUint32(offset + 4, true) * 2 ** 32 + view.getUint32(offset, true);

/** RIFF and AIFF both pad an odd-size chunk with one byte. */
const nextChunkAt = (bodyOffset: number, chunkSize: number) =>
  bodyOffset + chunkSize + (chunkSize % 2);

const isPlausibleLayout = (channels: number, sampleRate: number) =>
  Number.isInteger(channels) &&
  channels >= 1 &&
  channels <= MAX_CHANNELS &&
  Number.isInteger(sampleRate) &&
  sampleRate >= 1 &&
  sampleRate <= MAX_SAMPLE_RATE;

/** An 80-bit IEEE extended number (the AIFF COMM sample rate). */
export function readExtended80(view: DataView, offset: number): number {
  const signAndExponent = view.getUint16(offset, false);
  const exponent = signAndExponent & 0x7fff;
  const mantissa =
    view.getUint32(offset + 2, false) * 2 ** 32 +
    view.getUint32(offset + 6, false);
  if (exponent === 0 && mantissa === 0) return 0;
  if (exponent === 0x7fff) return Number.NaN;
  const value = mantissa * 2 ** (exponent - 16383 - 63);
  return signAndExponent & 0x8000 ? -value : value;
}

interface WaveFormat {
  formatTag: number;
  channels: number;
  sampleRate: number;
  blockAlign: number;
  bitsPerSample: number;
}

function parseWaveFormat(body: DataView): WaveFormat | PcmHeaderFailure {
  let formatTag = body.getUint16(0, true);
  if (formatTag === WAVE_FORMAT_EXTENSIBLE) {
    if (body.byteLength < 40) return "invalid";
    formatTag = body.getUint16(24, true);
  }
  if (formatTag !== WAVE_FORMAT_PCM && formatTag !== WAVE_FORMAT_IEEE_FLOAT)
    return "compressed";
  return {
    formatTag,
    channels: body.getUint16(2, true),
    sampleRate: body.getUint32(4, true),
    blockAlign: body.getUint16(12, true),
    bitsPerSample: body.getUint16(14, true),
  };
}

function finishWave(
  format: WaveFormat,
  dataOffset: number,
  declaredDataBytes: number | null,
  sizes: { riffSize: number; isRf64: boolean; fileSize: number },
): PcmHeaderResult {
  const isFloat = format.formatTag === WAVE_FORMAT_IEEE_FLOAT;
  if (!(isFloat ? FLOAT_BITS : INTEGER_BITS).has(format.bitsPerSample))
    return failure("invalid");
  const blockAlign = format.channels * (format.bitsPerSample / 8);
  if (
    !isPlausibleLayout(format.channels, format.sampleRate) ||
    format.blockAlign !== blockAlign
  )
    return failure("invalid");
  const availableBytes = Math.max(0, sizes.fileSize - dataOffset);
  const rawDataBytes =
    declaredDataBytes !== null &&
    declaredDataBytes > 0 &&
    declaredDataBytes !== UNSET_SIZE
      ? Math.min(declaredDataBytes, availableBytes)
      : availableBytes;
  const dataBytes = rawDataBytes - (rawDataBytes % blockAlign);
  if (dataBytes === 0) return failure("invalid");
  const isDataSizeMissing =
    declaredDataBytes === null || declaredDataBytes === 0;
  const isRiffSizeUsable =
    sizes.isRf64 ||
    (sizes.riffSize !== 0 && sizes.riffSize + 8 >= dataOffset + dataBytes);
  const hasUnreliableSizes = isDataSizeMissing || !isRiffSizeUsable;
  if (hasUnreliableSizes && dataBytes > MAX_REWRITABLE_DATA_BYTES)
    return failure("invalid");
  return {
    ok: true,
    header: {
      container: "wav",
      channels: format.channels,
      sampleRate: format.sampleRate,
      bitsPerSample: format.bitsPerSample,
      isFloat,
      isLittleEndian: true,
      dataOffset,
      dataBytes,
      durationSeconds: dataBytes / blockAlign / format.sampleRate,
      hasUnreliableSizes,
    },
  };
}

async function readWaveHeader(
  bytes: HeaderBytes,
  isRf64: boolean,
  riffSize: number,
): Promise<PcmHeaderResult> {
  let format: WaveFormat | null = null;
  let ds64DataBytes: number | null = null;
  let position = 12;
  for (let chunkCount = 0; chunkCount < MAX_CHUNKS; chunkCount += 1) {
    const chunk = await bytes.at(position, 8);
    if (!chunk) break;
    const chunkId = fourCharacterCode(chunk, 0);
    const chunkSize = chunk.getUint32(4, true);
    const bodyOffset = position + 8;
    if (chunkId === "ds64") {
      const body = await bytes.at(bodyOffset, 16);
      if (!body) return failure("truncated");
      ds64DataBytes = readUint64LittleEndian(body, 8);
    } else if (chunkId === "fmt ") {
      if (chunkSize < 16) return failure("invalid");
      const body = await bytes.at(bodyOffset, Math.min(chunkSize, 40));
      if (!body) return failure("truncated");
      const parsed = parseWaveFormat(body);
      if (typeof parsed === "string") return failure(parsed);
      format = parsed;
    } else if (chunkId === "data") {
      // Audio before its format is legal and very rare: refused.
      if (!format) return failure("invalid");
      const declared =
        isRf64 && chunkSize === UNSET_SIZE ? ds64DataBytes : chunkSize;
      return finishWave(format, bodyOffset, declared, {
        riffSize,
        isRf64,
        fileSize: bytes.size,
      });
    }
    position = nextChunkAt(bodyOffset, chunkSize);
  }
  return failure(format ? "truncated" : "invalid");
}

interface AiffCommon {
  channels: number;
  sampleFrames: number;
  sampleSizeBits: number;
  sampleRate: number;
  compressionType: string;
}

interface AiffSound {
  dataOffset: number;
  soundBytes: number;
}

function parseAiffCommon(body: DataView, isAifc: boolean): AiffCommon {
  return {
    channels: body.getInt16(0, false),
    sampleFrames: body.getUint32(2, false),
    sampleSizeBits: body.getInt16(6, false),
    sampleRate: Math.round(readExtended80(body, 8)),
    compressionType: isAifc ? fourCharacterCode(body, 18) : "NONE",
  };
}

function finishAiff(common: AiffCommon, sound: AiffSound): PcmHeaderResult {
  const encoding = AIFF_ENCODINGS.get(common.compressionType);
  if (!encoding) return failure("compressed");
  const isBitDepthUsable = encoding.isFloat
    ? common.sampleSizeBits === 32
    : common.sampleSizeBits >= 1 && common.sampleSizeBits <= 32;
  if (
    !isBitDepthUsable ||
    !isPlausibleLayout(common.channels, common.sampleRate)
  )
    return failure("invalid");
  // Samples are left-justified in whole bytes (20-bit sits in 3 bytes).
  const bytesPerSample = Math.ceil(common.sampleSizeBits / 8);
  const blockAlign = common.channels * bytesPerSample;
  const framesAvailable = Math.floor(sound.soundBytes / blockAlign);
  const frames =
    common.sampleFrames > 0
      ? Math.min(common.sampleFrames, framesAvailable)
      : framesAvailable;
  if (frames === 0) return failure("invalid");
  if (frames * blockAlign > MAX_REWRITABLE_DATA_BYTES)
    return failure("invalid");
  return {
    ok: true,
    header: {
      container: "aiff",
      channels: common.channels,
      sampleRate: common.sampleRate,
      bitsPerSample: bytesPerSample * 8,
      isFloat: encoding.isFloat,
      isLittleEndian: encoding.isLittleEndian,
      dataOffset: sound.dataOffset,
      dataBytes: frames * blockAlign,
      durationSeconds: frames / common.sampleRate,
      hasUnreliableSizes: false,
    },
  };
}

async function readAiffHeader(
  bytes: HeaderBytes,
  isAifc: boolean,
): Promise<PcmHeaderResult> {
  let common: AiffCommon | null = null;
  let sound: AiffSound | null = null;
  let position = 12;
  for (
    let chunkCount = 0;
    chunkCount < MAX_CHUNKS && !(common && sound);
    chunkCount += 1
  ) {
    const chunk = await bytes.at(position, 8);
    if (!chunk) break;
    const chunkId = fourCharacterCode(chunk, 0);
    const chunkSize = chunk.getUint32(4, false);
    const bodyOffset = position + 8;
    if (chunkId === "COMM") {
      const commonLength = isAifc ? 22 : 18;
      if (chunkSize < commonLength) return failure("invalid");
      const body = await bytes.at(bodyOffset, commonLength);
      if (!body) return failure("truncated");
      common = parseAiffCommon(body, isAifc);
    } else if (chunkId === "SSND") {
      const body = await bytes.at(bodyOffset, 8);
      if (!body) return failure("truncated");
      const offset = body.getUint32(0, false);
      const dataOffset = bodyOffset + 8 + offset;
      sound = {
        dataOffset,
        soundBytes: Math.max(
          0,
          Math.min(chunkSize - 8 - offset, bytes.size - dataOffset),
        ),
      };
    }
    position = nextChunkAt(bodyOffset, chunkSize);
  }
  if (!common || !sound)
    return failure(common || sound ? "truncated" : "invalid");
  return finishAiff(common, sound);
}

/** What the file holds, read from its bytes; the MIME type and the name
 *  play no part. Refuses compressed audio and anything it cannot read. */
export async function readPcmHeader(
  source: StudioByteSource,
): Promise<PcmHeaderResult> {
  const firstWindow = await source.read(
    0,
    Math.min(source.size, PCM_HEADER_WINDOW_BYTES),
  );
  const bytes = headerBytesOf(source, firstWindow);
  const lead = await bytes.at(0, 12);
  if (!lead) return failure("truncated");
  const outerId = fourCharacterCode(lead, 0);
  const formType = fourCharacterCode(lead, 8);
  if ((outerId === "RIFF" || outerId === "RF64") && formType === "WAVE")
    return readWaveHeader(bytes, outerId === "RF64", lead.getUint32(4, true));
  if (outerId === "FORM" && (formType === "AIFF" || formType === "AIFC"))
    return readAiffHeader(bytes, formType === "AIFC");
  return failure("unrecognised");
}
