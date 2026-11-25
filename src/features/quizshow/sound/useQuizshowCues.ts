import { useCallback, useEffect, useRef, useState } from "react";
import {
  QUIZSHOW_LIMITS,
  type QuizshowPhase,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { remainingMs } from "../realtime/quizshowClock";
import {
  applySoundLevel,
  isQuizshowAudioRunning,
  playQuizshowCue,
  readStoredSoundLevel,
  resumeQuizshowAudio,
  saveSoundLevel,
  type QuizshowCue,
  type QuizshowSoundLevel,
} from "./quizshowCues";
import { useQuizshowWheelCues } from "./useQuizshowWheelCues";

const TIME_ALMOST_UP_MS = 5000;
const TICK_INTERVAL_MS = 250;
const MIN_GAP_BETWEEN_JOIN_CUES_MS = 1000;
/** How often the hook looks at the audio context while it is mounted. */
const AUDIO_CHECK_INTERVAL_MS = 1000;
/** After a tap asks for audio, a quick second look so the chip leaves at once. */
const AUDIO_RECHECK_AFTER_TAP_MS = 250;
const QUESTION_PHASES: readonly QuizshowPhase[] = ["open", "write"];
const COUNTDOWN_PHASES: readonly QuizshowPhase[] = ["open", "write", "vote"];

interface UseQuizshowCuesOptions {
  isMuted: boolean;
  clockOffsetMs: number;
  cues: readonly QuizshowCue[];
}

export interface QuizshowCuesController {
  /** True while the shared audio context runs, so a cue would sound now. */
  isAudioRunning: boolean;
  /** Call from a tap: asks the browser to start the audio context. */
  resumeAudio: () => void;
}

interface PreviousSnapshot {
  phaseId: string;
  phase: QuizshowPhase;
  playerCount: number;
  /** Distinct podium places shown so far (podium phase only, else 0). */
  podiumPlaceCount: number;
  /** 1st place is among the shown podium places (podium phase only). */
  hasPodiumWinner: boolean;
}

/**
 * The cue for a podium step while the podium stays on screen (C6.7): the drum
 * when 1st place arrives (the stage holds "And the winner is" first), the
 * podium cue when 3rd or 2nd place arrives, nothing otherwise.
 */
function podiumStepCueOf(
  previous: PreviousSnapshot,
  current: PreviousSnapshot,
): "drum" | "place" | null {
  if (previous.phase !== "podium" || current.phase !== "podium") return null;
  if (current.hasPodiumWinner && !previous.hasPodiumWinner) return "drum";
  if (current.podiumPlaceCount > previous.podiumPlaceCount) return "place";
  return null;
}

/** Polls the shared audio context, so a screen can offer "Turn on sound" until it runs. */
function useAudioRunning(): QuizshowCuesController {
  const [isAudioRunning, setIsAudioRunning] = useState(isQuizshowAudioRunning);
  const recheckTimerRef = useRef<number | null>(null);
  const check = useCallback(() => {
    setIsAudioRunning(isQuizshowAudioRunning());
  }, []);
  useEffect(() => {
    const intervalId = window.setInterval(check, AUDIO_CHECK_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
      if (recheckTimerRef.current !== null) {
        window.clearTimeout(recheckTimerRef.current);
      }
    };
  }, [check]);
  const resumeAudio = useCallback(() => {
    resumeQuizshowAudio();
    check();
    if (recheckTimerRef.current !== null) {
      window.clearTimeout(recheckTimerRef.current);
    }
    recheckTimerRef.current = window.setTimeout(
      check,
      AUDIO_RECHECK_AFTER_TAP_MS,
    );
  }, [check]);
  return { isAudioRunning, resumeAudio };
}

/**
 * The TV's sound level (item 39), read from and saved to
 * `localStorage["quizshow.soundLevel"]`. Applied to every cue while mounted;
 * back to Normal on unmount, so another page's cues keep their own level.
 */
export function useQuizshowSoundLevel(): {
  soundLevel: QuizshowSoundLevel;
  changeSoundLevel: (level: QuizshowSoundLevel) => void;
} {
  const [soundLevel, setSoundLevel] = useState(readStoredSoundLevel);
  useEffect(() => {
    applySoundLevel(soundLevel);
  }, [soundLevel]);
  useEffect(() => () => applySoundLevel("normal"), []);
  const changeSoundLevel = useCallback((level: QuizshowSoundLevel) => {
    saveSoundLevel(level);
    setSoundLevel(level);
  }, []);
  return { soundLevel, changeSoundLevel };
}

/**
 * Plays the cues a screen or remote asks for as the shared state moves: the
 * lobby growing, a question opening, five seconds left, the reveal and the
 * podium (on arriving, then once per place revealed, with the drum on the beat
 * before the winner). Silent while muted; compares the previous state with the
 * current one so a reconnect that replays the same phase stays quiet. Returns
 * whether audio runs and a tap handler that asks for it.
 */
export function useQuizshowCues(
  state: QuizshowClientState,
  options: UseQuizshowCuesOptions,
): QuizshowCuesController {
  const { isMuted, clockOffsetMs, cues } = options;
  const previousRef = useRef<PreviousSnapshot | null>(null);
  const lastJoinCueAtMsRef = useRef(0);
  const almostUpPhaseIdRef = useRef<string | null>(null);
  const winnerCueTimerRef = useRef<number | null>(null);
  const latestRef = useRef({ state, isMuted, clockOffsetMs, cues });
  useEffect(() => {
    latestRef.current = { state, isMuted, clockOffsetMs, cues };
  });
  useEffect(
    () => () => {
      if (winnerCueTimerRef.current !== null) {
        window.clearTimeout(winnerCueTimerRef.current);
      }
    },
    [],
  );

  const session = state.session;
  const cursor = session?.cursor ?? null;
  const phaseId = cursor?.phaseId ?? null;
  const phase = cursor?.phase ?? null;
  const playerCount = session?.lobby.playerCount ?? 0;
  const podiumEntries = phase === "podium" ? (session?.podium ?? []) : [];
  const podiumPlaceCount = new Set(podiumEntries.map((entry) => entry.place))
    .size;
  const hasPodiumWinner = podiumEntries.some((entry) => entry.place === 1);

  useEffect(() => {
    if (phaseId === null || phase === null) return;
    const previous = previousRef.current;
    const current = {
      phaseId,
      phase,
      playerCount,
      podiumPlaceCount,
      hasPodiumWinner,
    };
    previousRef.current = current;
    if (previous === null) {
      const { state: firstState, clockOffsetMs: firstOffsetMs } =
        latestRef.current;
      const firstLeftMs = remainingMs(
        firstState.session?.cursor.deadline ?? null,
        Date.now(),
        firstOffsetMs,
      );
      if (firstLeftMs !== null && firstLeftMs <= TIME_ALMOST_UP_MS) {
        almostUpPhaseIdRef.current = phaseId;
      }
      return;
    }
    const { isMuted: isMutedNow, cues: cuesNow } = latestRef.current;
    if (isMutedNow) return;
    const play = (cue: QuizshowCue) => {
      if (cuesNow.includes(cue)) playQuizshowCue(cue);
    };
    if (playerCount > previous.playerCount) {
      const nowMs = Date.now();
      if (nowMs - lastJoinCueAtMsRef.current >= MIN_GAP_BETWEEN_JOIN_CUES_MS) {
        lastJoinCueAtMsRef.current = nowMs;
        play("playerJoined");
      }
    }
    const podiumStepCue = podiumStepCueOf(previous, current);
    if (podiumStepCue === "drum" && cuesNow.includes("podiumDrum")) {
      // The drum fills the held beat; the podium cue lands with the winner.
      play("podiumDrum");
      if (winnerCueTimerRef.current !== null) {
        window.clearTimeout(winnerCueTimerRef.current);
      }
      winnerCueTimerRef.current = window.setTimeout(() => {
        winnerCueTimerRef.current = null;
        const latest = latestRef.current;
        if (!latest.isMuted && latest.cues.includes("podium")) {
          playQuizshowCue("podium");
        }
      }, QUIZSHOW_LIMITS.podiumWinnerHoldMs);
    } else if (podiumStepCue !== null) {
      play("podium");
    }
    if (previous.phaseId === phaseId) return;
    if (QUESTION_PHASES.includes(phase)) play("questionOpens");
    if (phase === "reveal") play("reveal");
    if (phase === "podium" && previous.phase !== "podium") play("podium");
  }, [phaseId, phase, playerCount, podiumPlaceCount, hasPodiumWinner]);

  // A podium left before the winner's beat ends (an end, a refresh) drops the late podium cue.
  useEffect(() => {
    if (phase === "podium" || winnerCueTimerRef.current === null) return;
    window.clearTimeout(winnerCueTimerRef.current);
    winnerCueTimerRef.current = null;
  }, [phase]);

  const isCountingDown =
    phase !== null &&
    COUNTDOWN_PHASES.includes(phase) &&
    cues.includes("timeAlmostUp");

  useEffect(() => {
    if (!isCountingDown) return;
    const check = () => {
      const latest = latestRef.current;
      const latestCursor = latest.state.session?.cursor;
      if (!latestCursor || latest.isMuted) return;
      if (!latest.cues.includes("timeAlmostUp")) return;
      if (almostUpPhaseIdRef.current === latestCursor.phaseId) return;
      const leftMs = remainingMs(
        latestCursor.deadline,
        Date.now(),
        latest.clockOffsetMs,
      );
      if (leftMs === null || leftMs <= 0 || leftMs > TIME_ALMOST_UP_MS) return;
      almostUpPhaseIdRef.current = latestCursor.phaseId;
      playQuizshowCue("timeAlmostUp");
    };
    check();
    const intervalId = window.setInterval(check, TICK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [isCountingDown, phaseId]);

  useQuizshowWheelCues(state, options);
  return useAudioRunning();
}
