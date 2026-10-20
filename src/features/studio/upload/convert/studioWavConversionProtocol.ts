import type { PcmHeader } from "./studioPcmHeader";

/** Main thread to worker: one file per worker. */
export interface WavConversionRequest {
  type: "convert";
  file: File;
  header: PcmHeader;
  bitrateKbps: number;
}

/** Worker to main thread. Progress runs 0 to 1; the MP3's buffer is transferred. */
export type WavConversionResponse =
  | { type: "progress"; progress: number }
  | { type: "done"; buffer: ArrayBuffer }
  | { type: "error"; message: string };
