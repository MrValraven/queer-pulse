import {
  chimeNoteFrequency,
  playChimeNote,
  primeMessageChime,
  runningChimeCueOutput,
  type ChimeCueOutput,
} from "../../../shared/lib/messageChime";

/**
 * Short, quiet, low sound cues for the presenter and the remote, voiced like
 * the message chime: sine notes with a brief 4x mallet knock, all at or below
 * C5 and under a second long.
 */
export type QuizshowCue =
  | "playerJoined"
  | "questionOpens"
  | "timeAlmostUp"
  | "reveal"
  | "podium"
  /** The held beat before 1st place (C6.7): a short, quiet, low roll. */
  | "podiumDrum"
  | "wheelTick"
  | "wheelLand";

interface QuizshowCueNote {
  semitonesFromA4: number;
  delaySeconds: number;
  peakGain: number;
  decaySeconds: number;
}

export const QUIZSHOW_CUE_NOTES: Record<
  QuizshowCue,
  ReadonlyArray<QuizshowCueNote>
> = {
  playerJoined: [
    {
      semitonesFromA4: -14,
      delaySeconds: 0,
      peakGain: 0.12,
      decaySeconds: 0.14,
    },
  ],
  questionOpens: [
    { semitonesFromA4: -9, delaySeconds: 0, peakGain: 0.18, decaySeconds: 0.2 },
    {
      semitonesFromA4: -5,
      delaySeconds: 0.08,
      peakGain: 0.18,
      decaySeconds: 0.2,
    },
  ],
  timeAlmostUp: [
    {
      semitonesFromA4: -12,
      delaySeconds: 0,
      peakGain: 0.12,
      decaySeconds: 0.08,
    },
    {
      semitonesFromA4: -12,
      delaySeconds: 0.25,
      peakGain: 0.12,
      decaySeconds: 0.08,
    },
  ],
  reveal: [
    {
      semitonesFromA4: -9,
      delaySeconds: 0,
      peakGain: 0.22,
      decaySeconds: 0.22,
    },
    {
      semitonesFromA4: -2,
      delaySeconds: 0.09,
      peakGain: 0.22,
      decaySeconds: 0.22,
    },
  ],
  podium: [
    {
      semitonesFromA4: -9,
      delaySeconds: 0,
      peakGain: 0.22,
      decaySeconds: 0.15,
    },
    {
      semitonesFromA4: -5,
      delaySeconds: 0.08,
      peakGain: 0.22,
      decaySeconds: 0.15,
    },
    {
      semitonesFromA4: -2,
      delaySeconds: 0.16,
      peakGain: 0.22,
      decaySeconds: 0.3,
    },
  ],
  // Seven soft knocks on C3 that swell a little, all inside 0.4 s.
  podiumDrum: [
    {
      semitonesFromA4: -21,
      delaySeconds: 0,
      peakGain: 0.06,
      decaySeconds: 0.07,
    },
    {
      semitonesFromA4: -21,
      delaySeconds: 0.05,
      peakGain: 0.075,
      decaySeconds: 0.07,
    },
    {
      semitonesFromA4: -21,
      delaySeconds: 0.1,
      peakGain: 0.09,
      decaySeconds: 0.07,
    },
    {
      semitonesFromA4: -21,
      delaySeconds: 0.15,
      peakGain: 0.105,
      decaySeconds: 0.07,
    },
    {
      semitonesFromA4: -21,
      delaySeconds: 0.2,
      peakGain: 0.12,
      decaySeconds: 0.07,
    },
    {
      semitonesFromA4: -21,
      delaySeconds: 0.25,
      peakGain: 0.135,
      decaySeconds: 0.07,
    },
    {
      semitonesFromA4: -21,
      delaySeconds: 0.3,
      peakGain: 0.15,
      decaySeconds: 0.1,
    },
  ],
  wheelTick: [
    {
      semitonesFromA4: -14,
      delaySeconds: 0,
      peakGain: 0.05,
      decaySeconds: 0.03,
    },
  ],
  wheelLand: [
    {
      semitonesFromA4: -14,
      delaySeconds: 0,
      peakGain: 0.16,
      decaySeconds: 0.18,
    },
    {
      semitonesFromA4: -9,
      delaySeconds: 0.09,
      peakGain: 0.16,
      decaySeconds: 0.22,
    },
  ],
};

const MIN_GAP_BETWEEN_SAME_CUE_MS = 300;

/** Per-cue same-cue gaps; a cue absent here keeps the 300 ms default. */
export const QUIZSHOW_CUE_MIN_GAP_MS: Partial<Record<QuizshowCue, number>> = {
  wheelTick: 60,
};
const START_OFFSET_SECONDS = 0.01;
const MALLET_PARTIAL_MULTIPLE = 4;
const MALLET_PEAK_RATIO = 0.27;
const MALLET_DECAY_SECONDS = 0.04;
const ATTACK_SECONDS = 0.006;
const MALLET_ATTACK_SECONDS = 0.004;

const lastPlayedAtMs: Partial<Record<QuizshowCue, number>> = {};

/** The TV's sound level (item 39): a gain after the chime voice's compressor and lowpass, timbre and pitch unchanged. */
export type QuizshowSoundLevel = "quiet" | "normal" | "venue";

export const QUIZSHOW_SOUND_LEVELS: readonly QuizshowSoundLevel[] = [
  "quiet",
  "normal",
  "venue",
];

export const QUIZSHOW_SOUND_LEVEL_GAINS: Record<QuizshowSoundLevel, number> = {
  quiet: 0.5,
  normal: 1,
  venue: 1.8,
};

/** The one localStorage key the level is kept under on this device (C9.1). */
export const QUIZSHOW_SOUND_LEVEL_STORAGE_KEY = "quizshow.soundLevel";

/**
 * The limiter after the level gain: a hard knee at 0 dBFS, so below clipping
 * it is transparent (no gain reduction and no automatic makeup gain) and
 * Normal sounds exactly as before the level existed; only Venue's loudest
 * peaks reach it. The level sits after the cue chain's own compressor and
 * lowpass (`runningChimeCueOutput().tail`), so that compressor no longer
 * evens Venue's boost back out.
 */
const LIMITER_THRESHOLD_DB = 0;
const LIMITER_KNEE_DB = 0;
const LIMITER_RATIO = 20;
const LIMITER_ATTACK_SECONDS = 0.003;
const LIMITER_RELEASE_SECONDS = 0.15;

let activeSoundLevel: QuizshowSoundLevel = "normal";
/** The level stage built on a cue chain's tail; `levelGain` null when the nodes failed and the tail plays straight out. */
let levelStage: { context: AudioContext; levelGain: GainNode | null } | null =
  null;

function isSoundLevel(value: unknown): value is QuizshowSoundLevel {
  return QUIZSHOW_SOUND_LEVELS.includes(value as QuizshowSoundLevel);
}

/** The stored level, or Normal when none is stored or storage is blocked. */
export function readStoredSoundLevel(): QuizshowSoundLevel {
  try {
    const stored = window.localStorage.getItem(
      QUIZSHOW_SOUND_LEVEL_STORAGE_KEY,
    );
    return isSoundLevel(stored) ? stored : "normal";
  } catch {
    return "normal";
  }
}

/** Keeps the level for the next load; a blocked storage keeps it for this page only. */
export function saveSoundLevel(level: QuizshowSoundLevel): void {
  try {
    window.localStorage.setItem(QUIZSHOW_SOUND_LEVEL_STORAGE_KEY, level);
  } catch {
    // Private mode or a full storage: the level still applies until the page closes.
  }
}

/** Sets the level every cue plays at from now on. Never throws. */
export function applySoundLevel(level: QuizshowSoundLevel): void {
  activeSoundLevel = level;
  try {
    if (levelStage === null || levelStage.levelGain === null) return;
    const { context, levelGain } = levelStage;
    levelGain.gain.setValueAtTime(
      QUIZSHOW_SOUND_LEVEL_GAINS[level],
      context.currentTime,
    );
  } catch {
    // Best-effort: the next stage built picks the level up.
  }
}

/**
 * Routes the cue chain's tail through the level gain and its limiter to the
 * speakers, once per context: tail, level gain, limiter, destination.
 */
function connectLevelStage(output: ChimeCueOutput): void {
  const { context, tail } = output;
  if (levelStage !== null && levelStage.context === context) return;
  try {
    const levelGain = context.createGain();
    levelGain.gain.value = QUIZSHOW_SOUND_LEVEL_GAINS[activeSoundLevel];
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = LIMITER_THRESHOLD_DB;
    limiter.knee.value = LIMITER_KNEE_DB;
    limiter.ratio.value = LIMITER_RATIO;
    limiter.attack.value = LIMITER_ATTACK_SECONDS;
    limiter.release.value = LIMITER_RELEASE_SECONDS;
    tail.connect(levelGain);
    levelGain.connect(limiter);
    limiter.connect(context.destination);
    levelStage = { context, levelGain };
  } catch {
    // An audio stack without these nodes still plays, at the Normal level.
    tail.connect(context.destination);
    levelStage = { context, levelGain: null };
  }
}

/** Whether the shared audio context runs, so a cue would sound now. Never throws. */
export function isQuizshowAudioRunning(): boolean {
  return runningChimeCueOutput() !== null;
}

/**
 * Asks for the audio context from a tap: the chime's gesture listeners create
 * and resume it on this tap and every later one until it runs.
 */
export function resumeQuizshowAudio(): void {
  primeMessageChime();
}

/** Plays one cue when audio is running; returns whether it played. Never throws. */
export function playQuizshowCue(cue: QuizshowCue): boolean {
  try {
    const nowMs = Date.now();
    const lastMs = lastPlayedAtMs[cue];
    const minGapMs =
      QUIZSHOW_CUE_MIN_GAP_MS[cue] ?? MIN_GAP_BETWEEN_SAME_CUE_MS;
    if (lastMs !== undefined && nowMs - lastMs < minGapMs) {
      return false;
    }
    const output = runningChimeCueOutput();
    if (!output) return false;
    connectLevelStage(output);
    const { context, input } = output;
    const baseTime = context.currentTime + START_OFFSET_SECONDS;
    QUIZSHOW_CUE_NOTES[cue].forEach((note) => {
      const startTime = baseTime + note.delaySeconds;
      const frequencyHz = chimeNoteFrequency(note.semitonesFromA4);
      playChimeNote(context, input, {
        startTime,
        frequencyHz,
        peakGain: note.peakGain,
        attackSeconds: ATTACK_SECONDS,
        decaySeconds: note.decaySeconds,
      });
      playChimeNote(context, input, {
        startTime,
        frequencyHz: frequencyHz * MALLET_PARTIAL_MULTIPLE,
        peakGain: note.peakGain * MALLET_PEAK_RATIO,
        attackSeconds: MALLET_ATTACK_SECONDS,
        decaySeconds: MALLET_DECAY_SECONDS,
      });
    });
    lastPlayedAtMs[cue] = nowMs;
    return true;
  } catch {
    return false;
  }
}
