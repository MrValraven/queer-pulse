/**
 * A soft low marimba "do-sol" for an arriving message, synthesized with the Web
 * Audio API so there is no audio file to ship. Best-effort throughout: browsers
 * keep an AudioContext suspended until a real gesture, so `primeMessageChime`
 * unlocks it on the member's first tap or key press, and every function here
 * swallows failures so a missing or blocked audio stack never surfaces.
 *
 * The voice goes through one output chain built once per context: a master
 * gain, a compressor and a gentle lowpass, plus a short quiet echo send that
 * gives the sound some air.
 */

const MIN_GAP_BETWEEN_CHIMES_MS = 1000;
const SILENT_GAIN = 0.0001;
const MASTER_GAIN = 0.32;
const OUTPUT_LOWPASS_HZ = 7000;
const ECHO_DELAY_SECONDS = 0.11;
const ECHO_FEEDBACK = 0.15;
const ECHO_LOWPASS_HZ = 3000;
const ECHO_WET_GAIN = 0.06;

type AudioContextConstructor = typeof AudioContext;

interface OutputChain {
  /** Where every voice connects. */
  input: AudioNode;
}

let sharedContext: AudioContext | null = null;
let outputChain: OutputChain | null = null;
let lastChimeAtMs = 0;
let isPrimed = false;

/** Equal-temperament frequency for a semitone offset from A4 (440 Hz). */
function noteFrequency(semitonesFromA4: number): number {
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

/** The two notes of the do-sol, as semitone offsets from A4. */
const NOTE = {
  C4: -9,
  G4: -2,
} as const;

function resolveAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const legacyWindow = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return window.AudioContext ?? legacyWindow.webkitAudioContext ?? null;
}

/** Create the shared context on first use; only call from a real gesture. */
function ensureContext(): AudioContext | null {
  if (sharedContext) return sharedContext;
  const AudioContextClass = resolveAudioContextConstructor();
  if (!AudioContextClass) return null;
  sharedContext = new AudioContextClass();
  return sharedContext;
}

function buildOutputChain(context: AudioContext): OutputChain {
  const master = context.createGain();
  master.gain.value = MASTER_GAIN;
  const compressor = context.createDynamicsCompressor();
  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = OUTPUT_LOWPASS_HZ;
  master.connect(compressor);
  compressor.connect(lowpass);
  lowpass.connect(context.destination);

  const echoDelay = context.createDelay(0.5);
  echoDelay.delayTime.value = ECHO_DELAY_SECONDS;
  const echoFeedback = context.createGain();
  echoFeedback.gain.value = ECHO_FEEDBACK;
  const echoLowpass = context.createBiquadFilter();
  echoLowpass.type = "lowpass";
  echoLowpass.frequency.value = ECHO_LOWPASS_HZ;
  const echoWet = context.createGain();
  echoWet.gain.value = ECHO_WET_GAIN;
  master.connect(echoDelay);
  echoDelay.connect(echoLowpass);
  echoLowpass.connect(echoFeedback);
  echoFeedback.connect(echoDelay);
  echoLowpass.connect(echoWet);
  echoWet.connect(compressor);
  return { input: master };
}

interface NoteOptions {
  startTime: number;
  frequencyHz: number;
  peakGain: number;
  attackSeconds: number;
  decaySeconds: number;
}

/** One enveloped sine: soft attack, exponential decay, stops after its tail. */
function playNote(
  context: AudioContext,
  destination: AudioNode,
  options: NoteOptions,
): void {
  const { startTime, frequencyHz, attackSeconds, decaySeconds } = options;
  const endTime = startTime + attackSeconds + decaySeconds;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequencyHz, startTime);
  gainNode.gain.setValueAtTime(SILENT_GAIN, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    options.peakGain,
    startTime + attackSeconds,
  );
  gainNode.gain.exponentialRampToValueAtTime(SILENT_GAIN, endTime);
  oscillator.connect(gainNode);
  gainNode.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.05);
}

/** A warm wooden do-sol: C4 then G4, a sine plus a brief 4x mallet knock. */
function playMarimba(
  context: AudioContext,
  destination: AudioNode,
  startTime: number,
): void {
  [NOTE.C4, NOTE.G4].forEach((semitones, noteIndex) => {
    const noteStart = startTime + noteIndex * 0.09;
    const fundamentalHz = noteFrequency(semitones);
    playNote(context, destination, {
      startTime: noteStart,
      frequencyHz: fundamentalHz,
      peakGain: 0.3,
      attackSeconds: 0.006,
      decaySeconds: 0.2,
    });
    playNote(context, destination, {
      startTime: noteStart,
      frequencyHz: fundamentalHz * 4,
      peakGain: 0.08,
      attackSeconds: 0.004,
      decaySeconds: 0.04,
    });
  });
}

function schedule(context: AudioContext): void {
  outputChain ??= buildOutputChain(context);
  playMarimba(context, outputChain.input, context.currentTime + 0.01);
  lastChimeAtMs = Date.now();
}

/**
 * Installs one-time pointerdown and keydown listeners that create and resume
 * the context inside a real gesture, then remove themselves. Safe to call
 * repeatedly.
 */
export function primeMessageChime(): void {
  if (isPrimed || typeof window === "undefined") return;
  isPrimed = true;
  const unlock = () => {
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    try {
      const context = ensureContext();
      if (context && context.state === "suspended") void context.resume();
    } catch {
      // Best-effort: no audio is better than a thrown error.
    }
  };
  window.addEventListener("pointerdown", unlock, {
    capture: true,
    passive: true,
  });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
}

/**
 * Plays the chime when the context is already running and the minimum gap since
 * the last chime has passed. Returns whether it actually played, so a caller
 * can leave the OS notification sound on when it did not.
 */
export function playMessageChime(): boolean {
  try {
    const context = sharedContext;
    if (!context) return false;
    if (context.state !== "running") {
      void context.resume().catch(() => undefined);
      return false;
    }
    if (Date.now() - lastChimeAtMs < MIN_GAP_BETWEEN_CHIMES_MS) return false;
    schedule(context);
    return true;
  } catch {
    return false;
  }
}

/**
 * Plays the chime for the settings toggle and the account menu test. Call it inside the click handler so
 * the context can be created and resumed, and it ignores the minimum gap.
 */
export function previewMessageChime(): void {
  try {
    const context = ensureContext();
    if (!context) return;
    const play = () => schedule(context);
    if (context.state === "running") {
      play();
    } else {
      void context
        .resume()
        .then(play)
        .catch(() => undefined);
    }
  } catch {
    // Best-effort: the preview is a courtesy.
  }
}
