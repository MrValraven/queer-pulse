/** Constant-bitrate steps, best first, in kilobits per second. */
export const MP3_BITRATE_LADDER_KBPS = [320, 256, 192, 160, 128] as const;
/** Frame headers and tags add a little to the audio itself. */
export const MP3_SIZE_MARGIN = 1.03;
const LOWEST_KBPS = 128;

const mp3BytesFor = (durationSeconds: number, kbps: number) =>
  ((durationSeconds * kbps * 1000) / 8) * MP3_SIZE_MARGIN;

/** The best bitrate (kbps) whose MP3 fits the cap; null when even 128 kbps
 *  is too big, so the file is refused before any encoding. */
export function mp3BitrateFor(
  durationSeconds: number,
  maxBytes: number,
): number | null {
  for (const kbps of MP3_BITRATE_LADDER_KBPS)
    if (mp3BytesFor(durationSeconds, kbps) <= maxBytes) return kbps;
  return null;
}

/** The whole minutes that fit the cap at 128 kbps, for the refusal line. */
export function maxMinutesAt128(maxBytes: number): number {
  return Math.floor(maxBytes / mp3BytesFor(60, LOWEST_KBPS));
}

export interface Mp3Target {
  sampleRate: number;
  numberOfChannels: number;
}

const MP3_NATIVE_RATES: ReadonlySet<number> = new Set([32000, 44100, 48000]);
const RATES_THAT_HALVE_TO_48K: ReadonlySet<number> = new Set([96000, 192000]);

/** 96 and 192 kHz become 48 kHz; every other rate MP3 lacks becomes 44.1 kHz. */
export function mp3SampleRateFor(sampleRate: number): number {
  if (MP3_NATIVE_RATES.has(sampleRate)) return sampleRate;
  return RATES_THAT_HALVE_TO_48K.has(sampleRate) ? 48000 : 44100;
}

/** Mono stays mono; anything wider mixes down to stereo. */
export function mp3TargetFor(source: {
  sampleRate: number;
  channels: number;
}): Mp3Target {
  return {
    sampleRate: mp3SampleRateFor(source.sampleRate),
    numberOfChannels: Math.min(source.channels, 2),
  };
}
