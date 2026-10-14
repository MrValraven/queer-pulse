import type {
  AnalysisRequest,
  AnalysisResponse,
} from "./studioAnalysisProtocol";
import { createAnalysisWorkerHandler } from "./studioAnalysisWorkerHandler";

/** The dedicated worker scope, typed by hand: tsconfig.app has the DOM lib
 *  only, where `postMessage` is Window's and wants a target origin. */
interface AnalysisWorkerScope {
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<AnalysisRequest>) => void,
  ) => void;
  postMessage: (message: AnalysisResponse) => void;
}

const scope = globalThis as unknown as AnalysisWorkerScope;
const handle = createAnalysisWorkerHandler((response) =>
  scope.postMessage(response),
);
scope.addEventListener("message", (event) => handle(event.data));
