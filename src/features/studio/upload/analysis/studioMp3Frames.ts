export interface Mp3FrameHeader {
  sampleRate: number;
  frameLength: number;
  channelCount: 1 | 2;
}

/** kbps by bitrate index, Layer III only. Index 0 (free) and 15 are refused. */
const MPEG1_LAYER3_KBPS = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320,
];
const MPEG2_LAYER3_KBPS = [
  0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160,
];
const SAMPLE_RATES: Record<number, readonly number[]> = {
  3: [44100, 48000, 32000], // MPEG-1
  2: [22050, 24000, 16000], // MPEG-2
  0: [11025, 12000, 8000], // MPEG-2.5
};
const LAYER_3_BITS = 0b01;

/** The four-byte MPEG audio header at `offset`, Layer III only. */
export function parseMp3FrameHeader(
  bytes: Uint8Array,
  offset: number,
): Mp3FrameHeader | null {
  if (offset + 4 > bytes.length) return null;
  const first = bytes[offset] ?? 0;
  const second = bytes[offset + 1] ?? 0;
  const third = bytes[offset + 2] ?? 0;
  const fourth = bytes[offset + 3] ?? 0;
  if (first !== 0xff || (second & 0xe0) !== 0xe0) return null;
  const versionBits = (second >> 3) & 0b11;
  if (((second >> 1) & 0b11) !== LAYER_3_BITS) return null;
  const rates = SAMPLE_RATES[versionBits];
  const bitrateIndex = third >> 4;
  const rateIndex = (third >> 2) & 0b11;
  if (!rates || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3)
    return null;
  const isMpeg1 = versionBits === 3;
  const kbps =
    (isMpeg1 ? MPEG1_LAYER3_KBPS : MPEG2_LAYER3_KBPS)[bitrateIndex] ?? 0;
  const sampleRate = rates[rateIndex] ?? 0;
  const padding = (third >> 1) & 1;
  const frameLength =
    Math.floor(((isMpeg1 ? 144 : 72) * kbps * 1000) / sampleRate) + padding;
  return { sampleRate, frameLength, channelCount: fourth >> 6 === 3 ? 1 : 2 };
}

/** Length of a leading ID3v2 tag (header, syncsafe size, optional footer). */
export function id3v2Length(bytes: Uint8Array): number {
  if (
    bytes.length < 10 ||
    bytes[0] !== 0x49 ||
    bytes[1] !== 0x44 ||
    bytes[2] !== 0x33
  )
    return 0;
  const size =
    ((bytes[6] ?? 0) << 21) |
    ((bytes[7] ?? 0) << 14) |
    ((bytes[8] ?? 0) << 7) |
    (bytes[9] ?? 0);
  const hasFooter = ((bytes[5] ?? 0) & 0x10) !== 0;
  return 10 + size + (hasFooter ? 10 : 0);
}

/** The first offset at or after `from` holding a header whose following
 *  frame also starts with a header (or lies past the end of `bytes`). */
export function findFrameBoundary(
  bytes: Uint8Array,
  from: number,
): number | null {
  for (let offset = from; offset + 4 <= bytes.length; offset += 1) {
    const header = parseMp3FrameHeader(bytes, offset);
    if (!header) continue;
    const next = offset + header.frameLength;
    if (next + 4 > bytes.length || parseMp3FrameHeader(bytes, next))
      return offset;
  }
  return null;
}
