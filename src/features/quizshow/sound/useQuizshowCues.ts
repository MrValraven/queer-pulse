import { useEffect, useRef } from "react";
import type { QuizshowPhase } from "../../../shared/contracts/quizshow";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { remainingMs } from "../realtime/quizshowClock";
import { playQuizshowCue, type QuizshowCue } from "./quizshowCues";

const TIME_ALMOST_UP_MS = 5000;
const TICK_INTERVAL_MS = 250;
const MIN_GAP_BETWEEN_JOIN_CUES_MS = 1000;
const QUESTION_PHASES: readonly QuizshowPhase[] = ["open", "write"];
const COUNTDOWN_PHASES: readonly QuizshowPhase[] = ["open", "write", "vote"];

interface UseQuizshowCuesOptions {
  isMuted: boolean;
  clockOffsetMs: number;
  cues: readonly QuizshowCue[];
}

interface PreviousSnapshot {
  phaseId: string;
  playerCount: number;
}

/**
 * Plays the cues a screen or remote asks for as the shared state moves: the
 * lobby growing, a question opening, five seconds left, the reveal and the
 * podium. Silent while muted; compares the previous state with the current one
 * so a reconnect that replays the same phase stays quiet.
 */
export function useQuizshowCues(
  state: QuizshowClientState,
  options: UseQuizshowCuesOptions,
): void {
  const { isMuted, clockOffsetMs, cues } = options;
  const previousRef = useRef<PreviousSnapshot | null>(null);
  const lastJoinCueAtMsRef = useRef(0);
  const almostUpPhaseIdRef = useRef<string | null>(null);
  const latestRef = useRef({ state, isMuted, clockOffsetMs, cues });
  useEffect(() => {
    latestRef.current = { state, isMuted, clockOffsetMs, cues };
  });

  const session = state.session;
  const cursor = session?.cursor ?? null;
  const phaseId = cursor?.phaseId ?? null;
  const phase = cursor?.phase ?? null;
  const playerCount = session?.lobby.playerCount ?? 0;

  useEffect(() => {
    if (phaseId === null || phase === null) return;
    const previous = previousRef.current;
    previousRef.current = { phaseId, playerCount };
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
    if (previous.phaseId === phaseId) return;
    if (QUESTION_PHASES.includes(phase)) play("questionOpens");
    if (phase === "reveal") play("reveal");
    if (phase === "podium") play("podium");
  }, [phaseId, phase, playerCount]);

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
}
