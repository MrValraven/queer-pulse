import type { StudioByteSource } from "./studioByteSource";

const HEADER_BYTES = 16;
const WINDOW_BYTES = 4096;

async function boxHeader(source: StudioByteSource, offset: number) {
  const view = new DataView(
    await source.read(offset, Math.min(source.size, offset + HEADER_BYTES)),
  );
  if (view.byteLength < 8) return null;
  const smallSize = view.getUint32(0);
  const type = String.fromCharCode(
    view.getUint8(4),
    view.getUint8(5),
    view.getUint8(6),
    view.getUint8(7),
  );
  const size =
    smallSize === 1 && view.byteLength >= 16
      ? Number(view.getBigUint64(8))
      : smallSize === 0
        ? source.size - offset
        : smallSize;
  const headerLength = smallSize === 1 ? 16 : 8;
  return size < headerLength ? null : { type, size, headerLength };
}

async function mvhdDuration(
  source: StudioByteSource,
  start: number,
  end: number,
) {
  let offset = start;
  while (offset < end) {
    const header = await boxHeader(source, offset);
    if (!header) return null;
    if (header.type === "mvhd") {
      const bodyStart = offset + header.headerLength;
      const body = new DataView(
        await source.read(bodyStart, Math.min(end, bodyStart + WINDOW_BYTES)),
      );
      const version = body.getUint8(0);
      const timescale = version === 1 ? body.getUint32(20) : body.getUint32(12);
      const duration =
        version === 1 ? Number(body.getBigUint64(24)) : body.getUint32(16);
      return timescale > 0 ? duration / timescale : null;
    }
    offset += header.size;
  }
  return null;
}

/** Duration from the movie header, without decoding and without a media
 *  element, so the measurement works under any `media-src` policy. */
export async function m4aDurationSeconds(
  source: StudioByteSource,
): Promise<number | null> {
  let offset = 0;
  while (offset < source.size) {
    const header = await boxHeader(source, offset);
    if (!header) return null;
    if (header.type === "moov")
      return mvhdDuration(
        source,
        offset + header.headerLength,
        offset + header.size,
      );
    offset += header.size;
  }
  return null;
}
