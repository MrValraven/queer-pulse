/** MPEG-1 Layer III, 128 kbps, 44.1 kHz, no padding: 417-byte frames. */
export const STEREO_FRAME_HEADER = [0xff, 0xfb, 0x90, 0x00] as const;
/** The same frame in single-channel mode (channel mode bits 11). */
export const MONO_FRAME_HEADER = [0xff, 0xfb, 0x90, 0xc0] as const;
export const FRAME_LENGTH = 417;

/** `count` frames whose payload is zeros, optionally after an ID3v2 tag. */
export function mp3Bytes(
  count: number,
  options: { header?: readonly number[]; id3PayloadLength?: number } = {},
): Uint8Array {
  const header = options.header ?? STEREO_FRAME_HEADER;
  const tag = options.id3PayloadLength ?? 0;
  const tagLength = tag > 0 ? 10 + tag : 0;
  const bytes = new Uint8Array(tagLength + count * FRAME_LENGTH);
  if (tag > 0) {
    bytes.set([0x49, 0x44, 0x33, 4, 0, 0], 0);
    bytes.set(
      [(tag >> 21) & 0x7f, (tag >> 14) & 0x7f, (tag >> 7) & 0x7f, tag & 0x7f],
      6,
    );
  }
  for (let frameIndex = 0; frameIndex < count; frameIndex += 1)
    bytes.set(header, tagLength + frameIndex * FRAME_LENGTH);
  return bytes;
}

/** A byte source over memory that records every read. */
export function memorySource(bytes: Uint8Array) {
  const reads: { start: number; end: number }[] = [];
  return {
    reads,
    source: {
      size: bytes.length,
      read: (start: number, end: number) => {
        reads.push({ start, end });
        return Promise.resolve(bytes.slice(start, end).buffer);
      },
    },
  };
}
