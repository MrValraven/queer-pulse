import {
  chimeNoteFrequency,
  playChimeNote,
  runningChimeOutput,
} from "../../../shared/lib/messageChime";

/**
 * Short, quiet, low sound cues for the presenter and the remote, voiced like
 * the message chime: sine notes with a brief 4x mallet knock, all at or below
 * C5 and under a second long.
 */
export type QuizshowCue =
  "playerJoined" | "questionOpens" | "timeAlmostUp" | "reveal" | "podium";

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
};

const MIN_GAP_BETWEEN_SAME_CUE_MS = 300;
const START_OFFSET_SECONDS = 0.01;
const MALLET_PARTIAL_MULTIPLE = 4;
const MALLET_PEAK_RATIO = 0.27;
const MALLET_DECAY_SECONDS = 0.04;
const ATTACK_SECONDS = 0.006;
const MALLET_ATTACK_SECONDS = 0.004;

const lastPlayedAtMs: Partial<Record<QuizshowCue, number>> = {};

/** Plays one cue when audio is running; returns whether it played. Never throws. */
export function playQuizshowCue(cue: QuizshowCue): boolean {
  try {
    const nowMs = Date.now();
    const lastMs = lastPlayedAtMs[cue];
    if (lastMs !== undefined && nowMs - lastMs < MIN_GAP_BETWEEN_SAME_CUE_MS) {
      return false;
    }
    const output = runningChimeOutput();
    if (!output) return false;
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
