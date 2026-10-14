import {
  createAnalysisAccumulator,
  type AnalysisAccumulator,
} from "./studioAnalysisAccumulator";
import type {
  AnalysisRequest,
  AnalysisResponse,
} from "./studioAnalysisProtocol";

/** The worker's logic, apart from its global scope so tests can run it. */
export function createAnalysisWorkerHandler(
  reply: (response: AnalysisResponse) => void,
) {
  let accumulator: AnalysisAccumulator | null = null;
  return (request: AnalysisRequest) => {
    try {
      if (request.type === "start") {
        accumulator = createAnalysisAccumulator(
          request.sampleRate,
          request.channelCount,
        );
        return;
      }
      if (!accumulator) throw new Error("Analysis data arrived before start");
      if (request.type === "chunk") {
        accumulator.push(request.channels);
        return;
      }
      reply({ type: "result", analysis: accumulator.finish() });
      accumulator = null;
    } catch (error) {
      accumulator = null;
      reply({
        type: "error",
        message: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  };
}
