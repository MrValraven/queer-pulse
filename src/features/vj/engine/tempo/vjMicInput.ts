/**
 * The screen's microphone input: asks for the mic, runs the envelope worklet
 * (`vjMicWorklet.ts`) and hands its batches of `VjEnvelopeSample` to the
 * caller. Every way it can fail answers a named `VjMicFailure`, which the
 * setup card turns into copy.
 *
 * Graph: mic source -> worklet node with no outputs. Nothing is connected
 * to the speakers, nothing is recorded, and the sound never leaves this
 * device; only the envelope numbers reach the main thread.
 *
 * The worklet loads through Vite's `?worker&url`, which serves it from this
 * origin (dev: the transformed module; build: an emitted chunk), so it fits
 * the `script-src 'self'` policy.
 */
import vjMicWorkletUrl from "./vjMicWorklet.ts?worker&url";
import type { VjEnvelopeSample } from "./vjOnsetDetector";

export const VJ_MIC_FAILURES = [
  "insecure",
  "notSupported",
  "denied",
  "noDevice",
  "inUse",
  "workletFailed",
  "interrupted",
] as const;
export type VjMicFailure = (typeof VJ_MIC_FAILURES)[number];

/** The name `vjMicWorklet.ts` registers its processor under (it imports
 *  nothing, so it repeats this string). */
export const VJ_MIC_PROCESSOR_NAME = "vj-onset-envelope";

/** Raw sound for tempo analysis: the browser's voice processing would flatten
 *  the very peaks the onset detector looks for. */
const VJ_MIC_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
};

/** Events that count as a user gesture for resuming a suspended context. */
const GESTURE_EVENTS = ["pointerdown", "keydown"] as const;

const FAILURE_BY_ERROR_NAME = new Map<string, VjMicFailure>([
  ["NotAllowedError", "denied"],
  ["SecurityError", "denied"],
  ["PermissionDeniedError", "denied"],
  ["NotFoundError", "noDevice"],
  ["DevicesNotFoundError", "noDevice"],
  ["OverconstrainedError", "noDevice"],
  ["NotReadableError", "inUse"],
  ["TrackStartError", "inUse"],
  ["AbortError", "inUse"],
]);

/** The failure a `getUserMedia` rejection names. An error the browser gives
 *  no known name for reads as `notSupported`. */
export function vjMicFailureOf(error: unknown): VjMicFailure {
  const name =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string"
      ? error.name
      : null;
  if (name === null) return "notSupported";
  return FAILURE_BY_ERROR_NAME.get(name) ?? "notSupported";
}

export interface VjMicSession {
  audioContext: AudioContext;
  stop(): void;
}

export interface VjMicInputHandlers {
  onEnvelope: (samples: readonly VjEnvelopeSample[]) => void;
  /** The mic track ended on its own (unplugged, revoked, taken by the system). */
  onInterrupted: () => void;
}

export type VjMicStartResult =
  { ok: true; session: VjMicSession } | { ok: false; reason: VjMicFailure };

/** What the input reads from the browser; tests hand in a fake. */
export interface VjMicEnvironment {
  isSecureContext: boolean;
  mediaDevices: Pick<MediaDevices, "getUserMedia"> | undefined;
  AudioContextConstructor: (new () => AudioContext) | undefined;
  AudioWorkletNodeConstructor:
    | (new (
        context: BaseAudioContext,
        name: string,
        options?: AudioWorkletNodeOptions,
      ) => AudioWorkletNode)
    | undefined;
  workletUrl: string;
  /** Where a click or key press resumes a context the browser suspended. */
  gestureTarget: Pick<
    EventTarget,
    "addEventListener" | "removeEventListener"
  > | null;
}

export function browserVjMicEnvironment(): VjMicEnvironment {
  const hasWindow = typeof window !== "undefined";
  return {
    isSecureContext: hasWindow && window.isSecureContext,
    mediaDevices:
      typeof navigator === "undefined" ? undefined : navigator.mediaDevices,
    AudioContextConstructor:
      typeof AudioContext === "undefined" ? undefined : AudioContext,
    AudioWorkletNodeConstructor:
      typeof AudioWorkletNode === "undefined" ? undefined : AudioWorkletNode,
    workletUrl: vjMicWorkletUrl,
    gestureTarget: hasWindow ? window : null,
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** The envelope samples of one worklet message; anything malformed is dropped. */
export function vjEnvelopeSamplesOf(data: unknown): VjEnvelopeSample[] {
  if (!Array.isArray(data)) return [];
  const samples: VjEnvelopeSample[] = [];
  for (const entry of data as unknown[]) {
    if (typeof entry !== "object" || entry === null) continue;
    const { timeSec, rms, lowEnergy } = entry as Record<string, unknown>;
    if (!isFiniteNumber(timeSec) || !isFiniteNumber(rms)) continue;
    if (!isFiniteNumber(lowEnergy)) continue;
    samples.push({ timeSec, rms, lowEnergy });
  }
  return samples;
}

function stopTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

function closeContext(audioContext: AudioContext): void {
  if (audioContext.state === "closed") return;
  void audioContext.close().catch(() => undefined);
}

interface VjMicGraph {
  stream: MediaStream;
  audioContext: AudioContext;
  source: MediaStreamAudioSourceNode;
  node: AudioWorkletNode;
}

/** Wires the running graph into a session: envelope messages, track ends,
 *  gesture resume, and a stop that undoes all of it once. */
function sessionOf(
  graph: VjMicGraph,
  handlers: VjMicInputHandlers,
  gestureTarget: VjMicEnvironment["gestureTarget"],
): VjMicSession {
  const { stream, audioContext, source, node } = graph;
  let isStopped = false;
  const resume = () => {
    if (isStopped || audioContext.state !== "suspended") return;
    void audioContext.resume().catch(() => undefined);
  };
  const onTrackEnded = () => {
    if (!isStopped) handlers.onInterrupted();
  };
  node.port.onmessage = (event: MessageEvent<unknown>) => {
    if (isStopped) return;
    const samples = vjEnvelopeSamplesOf(event.data);
    if (samples.length > 0) handlers.onEnvelope(samples);
  };
  const tracks = stream.getTracks();
  for (const track of tracks) track.addEventListener("ended", onTrackEnded);
  for (const eventName of GESTURE_EVENTS) {
    gestureTarget?.addEventListener(eventName, resume);
  }
  resume();
  return {
    audioContext,
    stop: () => {
      if (isStopped) return;
      isStopped = true;
      node.port.onmessage = null;
      for (const eventName of GESTURE_EVENTS) {
        gestureTarget?.removeEventListener(eventName, resume);
      }
      for (const track of tracks) {
        track.removeEventListener("ended", onTrackEnded);
      }
      source.disconnect();
      node.disconnect();
      stopTracks(stream);
      closeContext(audioContext);
    },
  };
}

/** Builds the graph on a granted stream; answers the failure and releases
 *  everything when a step fails. */
async function graphOf(
  stream: MediaStream,
  environment: VjMicEnvironment,
  AudioContextConstructor: new () => AudioContext,
  AudioWorkletNodeConstructor: NonNullable<
    VjMicEnvironment["AudioWorkletNodeConstructor"]
  >,
): Promise<VjMicGraph | VjMicFailure> {
  let audioContext: AudioContext;
  try {
    audioContext = new AudioContextConstructor();
  } catch {
    stopTracks(stream);
    return "notSupported";
  }
  try {
    await audioContext.audioWorklet.addModule(environment.workletUrl);
    const source = audioContext.createMediaStreamSource(stream);
    const node = new AudioWorkletNodeConstructor(
      audioContext,
      VJ_MIC_PROCESSOR_NAME,
      {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
        channelCountMode: "explicit",
      },
    );
    source.connect(node);
    return { stream, audioContext, source, node };
  } catch {
    stopTracks(stream);
    closeContext(audioContext);
    return "workletFailed";
  }
}

/** Asks for the mic and starts the envelope. Call it from a user action (the
 *  setup card button), or on mount only when permission is already granted. */
export async function startVjMicInput(
  handlers: VjMicInputHandlers,
  environment: VjMicEnvironment = browserVjMicEnvironment(),
): Promise<VjMicStartResult> {
  if (!environment.isSecureContext) return { ok: false, reason: "insecure" };
  const { mediaDevices, AudioContextConstructor, AudioWorkletNodeConstructor } =
    environment;
  if (
    mediaDevices === undefined ||
    typeof mediaDevices.getUserMedia !== "function" ||
    AudioContextConstructor === undefined ||
    AudioWorkletNodeConstructor === undefined
  ) {
    return { ok: false, reason: "notSupported" };
  }
  let stream: MediaStream;
  try {
    stream = await mediaDevices.getUserMedia(VJ_MIC_CONSTRAINTS);
  } catch (error) {
    return { ok: false, reason: vjMicFailureOf(error) };
  }
  const graph = await graphOf(
    stream,
    environment,
    AudioContextConstructor,
    AudioWorkletNodeConstructor,
  );
  if (typeof graph === "string") return { ok: false, reason: graph };
  return {
    ok: true,
    session: sessionOf(graph, handlers, environment.gestureTarget),
  };
}
