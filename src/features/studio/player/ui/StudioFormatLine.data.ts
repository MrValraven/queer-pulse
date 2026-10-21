import type { StudioStreamFormat } from "./StudioFormatLine.probe";

/** Demo has no audio files, so Now playing's format line reads one of these
 *  per track (picked from the track id). Every one is a format Studio
 *  accepts at upload: MP3 or AAC in an M4A, stored as sent. */
export const DEMO_STREAM_FORMATS: readonly StudioStreamFormat[] = [
  { codec: "AAC", sampleRateHz: 44100, channelCount: 2 },
  { codec: "MP3", sampleRateHz: 44100, channelCount: 2 },
  { codec: "AAC", sampleRateHz: 48000, channelCount: 2 },
  { codec: "MP3", sampleRateHz: 48000, channelCount: 1 },
];
