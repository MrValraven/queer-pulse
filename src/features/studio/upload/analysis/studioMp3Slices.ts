import type { StudioByteSource } from "./studioByteSource";
import {
  findFrameBoundary,
  id3v2Length,
  parseMp3FrameHeader,
  type Mp3FrameHeader,
} from "./studioMp3Frames";

export const MP3_SLICE_BYTES = 2 * 1024 * 1024;
export const MP3_SLICE_LOOKAHEAD_BYTES = 16 * 1024;

export class StudioNotMp3Error extends Error {
  constructor() {
    super("No MP3 frame found");
    this.name = "StudioNotMp3Error";
  }
}

/** The offset of the first frame after any ID3v2 tag. */
async function firstFrameOffset(
  source: StudioByteSource,
  lookaheadBytes: number,
) {
  const head = new Uint8Array(await source.read(0, Math.min(10, source.size)));
  const tagLength = id3v2Length(head);
  const windowEnd = Math.min(source.size, tagLength + lookaheadBytes);
  const window = new Uint8Array(await source.read(tagLength, windowEnd));
  const boundary = findFrameBoundary(window, 0);
  if (boundary === null) throw new StudioNotMp3Error();
  return tagLength + boundary;
}

/**
 * Yields the file as runs of whole frames of about `sliceBytes` each. Each
 * read covers one slice plus a lookahead in which the next cut is found, so
 * memory stays at one slice however long the file is.
 */
export async function* mp3Slices(
  source: StudioByteSource,
  options: {
    sliceBytes?: number;
    lookaheadBytes?: number;
    signal?: AbortSignal;
  } = {},
): AsyncGenerator<{ bytes: ArrayBuffer; header: Mp3FrameHeader }> {
  const sliceBytes = options.sliceBytes ?? MP3_SLICE_BYTES;
  const lookaheadBytes = options.lookaheadBytes ?? MP3_SLICE_LOOKAHEAD_BYTES;
  let cursor = await firstFrameOffset(source, lookaheadBytes);
  let header: Mp3FrameHeader | null = null;
  while (cursor < source.size) {
    options.signal?.throwIfAborted();
    const windowEnd = Math.min(
      source.size,
      cursor + sliceBytes + lookaheadBytes,
    );
    const window = await source.read(cursor, windowEnd);
    const view = new Uint8Array(window);
    if (view.length === 0) throw new StudioNotMp3Error();
    header ??= parseMp3FrameHeader(view, 0);
    if (!header) throw new StudioNotMp3Error();
    const isLast = windowEnd === source.size;
    const cut = isLast ? view.length : findFrameBoundary(view, sliceBytes);
    if (cut === null) throw new StudioNotMp3Error();
    yield {
      bytes: cut === view.length ? window : window.slice(0, cut),
      header,
    };
    cursor += cut;
  }
}
