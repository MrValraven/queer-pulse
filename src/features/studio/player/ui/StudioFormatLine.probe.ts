import { sniffAudioKind } from "../../upload/analysis/studioAudioSniff";
import {
  rangeByteSource,
  type StudioByteSource,
} from "../../upload/analysis/studioByteSource";
import {
  findFrameBoundary,
  id3v2Length,
  parseMp3FrameHeader,
} from "../../upload/analysis/studioMp3Frames";

/** What the stream's own header says about the audio. Null fields were not
 *  in the bytes read; the line leaves them out. */
export interface StudioStreamFormat {
  /** A codec name, such as MP3 or AAC: not translated. */
  codec: string;
  sampleRateHz: number | null;
  channelCount: number | null;
}

/** One read serves the type sniff, an MP3's first frame and a fast-start
 *  M4A's movie header. */
const HEAD_BYTES = 64 * 1024;
const MP3_FRAME_SCAN_BYTES = 16 * 1024;
const BOX_HEADER_BYTES = 16;
/** Enough of a movie box to reach its sample description. */
const MOOV_WINDOW_BYTES = 256 * 1024;
const TOP_LEVEL_BOX_LIMIT = 32;
/** AudioSampleEntry fields, from the start of the entry box. */
const ENTRY_VERSION_OFFSET = 16;
const ENTRY_CHANNEL_COUNT_OFFSET = 24;
const ENTRY_SAMPLE_RATE_OFFSET = 32;
const ENTRY_MIN_BYTES = 36;

const M4A_CODECS: Readonly<Record<string, string>> = {
  mp4a: "AAC",
  alac: "ALAC",
  fLaC: "FLAC",
  Opus: "Opus",
  "ac-3": "AC-3",
  "ec-3": "E-AC-3",
};
/** Boxes on the path from the movie down to the sample description. */
const M4A_PATH = new Set(["trak", "mdia", "minf", "stbl"]);

/** Serves reads inside the first `headBytes` from one request. */
async function withCachedHead(
  source: StudioByteSource,
  headBytes: number,
): Promise<StudioByteSource> {
  const head = await source.read(0, Math.min(source.size, headBytes));
  return {
    size: source.size,
    read: (start, end) =>
      end <= head.byteLength
        ? Promise.resolve(head.slice(start, end))
        : source.read(start, end),
  };
}

async function probeMp3(source: StudioByteSource): Promise<StudioStreamFormat> {
  const tag = new Uint8Array(await source.read(0, Math.min(source.size, 10)));
  const start = id3v2Length(tag);
  const bytes = new Uint8Array(
    await source.read(
      start,
      Math.min(source.size, start + MP3_FRAME_SCAN_BYTES),
    ),
  );
  const offset = findFrameBoundary(bytes, 0);
  const header = offset === null ? null : parseMp3FrameHeader(bytes, offset);
  return {
    codec: "MP3",
    sampleRateHz: header?.sampleRate ?? null,
    channelCount: header?.channelCount ?? null,
  };
}

interface BoxHeader {
  type: string;
  size: number;
  headerLength: number;
}

function boxHeaderAt(
  view: DataView,
  offset: number,
  remaining: number,
): BoxHeader | null {
  if (offset + 8 > view.byteLength) return null;
  const smallSize = view.getUint32(offset);
  const type = String.fromCharCode(
    view.getUint8(offset + 4),
    view.getUint8(offset + 5),
    view.getUint8(offset + 6),
    view.getUint8(offset + 7),
  );
  if (smallSize === 1) {
    if (offset + 16 > view.byteLength) return null;
    return {
      type,
      size: Number(view.getBigUint64(offset + 8)),
      headerLength: 16,
    };
  }
  const size = smallSize === 0 ? remaining : smallSize;
  return size < 8 ? null : { type, size, headerLength: 8 };
}

/** The first audio sample entry under `start`..`end`, walking trak, mdia,
 *  minf and stbl down to stsd. A cover-art track is passed over. */
function audioEntryFormat(
  view: DataView,
  start: number,
  end: number,
): StudioStreamFormat | null {
  let offset = start;
  while (offset + 8 <= end) {
    const header = boxHeaderAt(view, offset, end - offset);
    if (!header) return null;
    const boxEnd = Math.min(end, offset + header.size);
    if (M4A_PATH.has(header.type)) {
      const found = audioEntryFormat(
        view,
        offset + header.headerLength,
        boxEnd,
      );
      if (found) return found;
    } else if (header.type === "stsd") {
      // A full box: version and flags, the entry count, then the entries.
      const entryOffset = offset + header.headerLength + 8;
      const entry = boxHeaderAt(view, entryOffset, boxEnd - entryOffset);
      const codec = entry ? M4A_CODECS[entry.type] : undefined;
      if (codec) return sampleEntryFormat(view, entryOffset, codec);
    }
    offset += header.size;
  }
  return null;
}

function sampleEntryFormat(
  view: DataView,
  entryOffset: number,
  codec: string,
): StudioStreamFormat {
  if (entryOffset + ENTRY_MIN_BYTES > view.byteLength)
    return { codec, sampleRateHz: null, channelCount: null };
  // A QuickTime version 2 entry keeps both fields elsewhere.
  const isVersionTwo = view.getUint16(entryOffset + ENTRY_VERSION_OFFSET) === 2;
  const channelCount = view.getUint16(entryOffset + ENTRY_CHANNEL_COUNT_OFFSET);
  // 16.16 fixed point; a rate past 65535 Hz does not fit and reads as 0.
  const sampleRateHz =
    view.getUint32(entryOffset + ENTRY_SAMPLE_RATE_OFFSET) >>> 16;
  return {
    codec,
    sampleRateHz: !isVersionTwo && sampleRateHz > 0 ? sampleRateHz : null,
    channelCount: !isVersionTwo && channelCount > 0 ? channelCount : null,
  };
}

async function probeM4a(
  source: StudioByteSource,
): Promise<StudioStreamFormat | null> {
  let offset = 0;
  for (let index = 0; index < TOP_LEVEL_BOX_LIMIT; index += 1) {
    if (offset + 8 > source.size) return null;
    const view = new DataView(
      await source.read(
        offset,
        Math.min(source.size, offset + BOX_HEADER_BYTES),
      ),
    );
    const header = boxHeaderAt(view, 0, source.size - offset);
    if (!header) return null;
    if (header.type === "moov") {
      const bodyStart = offset + header.headerLength;
      const bodyEnd = Math.min(
        source.size,
        offset + header.size,
        bodyStart + MOOV_WINDOW_BYTES,
      );
      const body = new DataView(await source.read(bodyStart, bodyEnd));
      return audioEntryFormat(body, 0, body.byteLength);
    }
    offset += header.size;
  }
  return null;
}

/**
 * Reads the format from the stream's own header bytes: a few small ranged
 * reads of the URL already playing, decoded here and never re-encoded. Any
 * refusal (plain mode's missing CORS, an expired URL, a server without
 * ranges) or an unknown layout resolves null, and the line stays hidden:
 * the format is a nicety, so there is no error to show.
 */
export async function probeStreamFormat(
  url: string,
  signal: AbortSignal,
): Promise<StudioStreamFormat | null> {
  try {
    const source = await withCachedHead(
      await rangeByteSource(url, { signal }),
      HEAD_BYTES,
    );
    const kind = await sniffAudioKind(source);
    if (kind === "mp3") return await probeMp3(source);
    if (kind === "m4a") return await probeM4a(source);
    return null;
  } catch {
    return null;
  }
}
