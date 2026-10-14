import type { StudioAudioAnalysis } from "./studioAnalysisAccumulator";

/** Main thread to worker. Chunks arrive in file order; channel buffers are
 *  transferred, so the sender must not touch them afterwards. */
export type AnalysisRequest =
  | { type: "start"; sampleRate: number; channelCount: number }
  | { type: "chunk"; channels: Float32Array[] }
  | { type: "finish" };

export type AnalysisResponse =
  | { type: "result"; analysis: StudioAudioAnalysis | null }
  | { type: "error"; message: string };
