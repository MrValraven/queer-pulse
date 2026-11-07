/**
 * What the projector shows and the shuffle clock behind it (contract 6.8,
 * 6.9, 7.4). A newly applied state always wins; between states, the lead
 * screen reports each shuffle pick to the server and switches on the echo,
 * and a screen that is disconnected, or a lead whose echo is late, shuffles
 * locally until the next stage:state. A connected lead keeps reporting even
 * while it shows a local pick: each report carries the clipSequence it holds,
 * so the echo brings every screen back to the same clip.
 *
 * The lead plans its next pick ahead (`nextClipId`, contract 3.8) and the
 * clock fire takes exactly that clip. The clock is timed from `liveSince` on
 * the synced clock, and the lead sends a quantized advance
 * `VJ_LIMITS.quantizedAdvanceEarlyMs` early so the server's beat lands on the
 * interval's end.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  VJ_LIMITS,
  vjShuffleIntervalMs,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjClockReader } from "../engine/vjEngineLook";
import type { VjCommandOutcome, VjStageController } from "../live/useVjStage";
import {
  EMPTY_VJ_SHUFFLE_BAG,
  markVjClipPlayed,
  type VjShuffleBag,
} from "../live/vjShuffleBag";
import { VJ_LEAD_ADVANCE_FALLBACK_MS } from "../vj.constants";
import {
  EMPTY_VJ_SHUFFLE_LOOKAHEAD,
  planVjNextClip,
  takeVjPlannedClip,
  vjShufflePool,
  type VjShuffleLookahead,
} from "./vjShuffleLookahead";

export interface VjScreenProgramInput {
  /** The applied state, or the record's on an offline start. */
  state: VjStageState | null;
  isConnected: boolean;
  isLead: boolean;
  /** Ready clips of the active pack, pack order: the shuffle's pool before exclusions. */
  readyClipIds: readonly string[];
  /** Whether a clip of the active pack is a favorite (shuffle source "favorites"). */
  isFavorite: (clipId: string) => boolean;
  /** The synced clock; `toLocalTime` answers performance.now() time. */
  clock: VjClockReader;
  advance: VjStageController["advance"];
  random?: () => number;
}

export interface VjScreenProgram {
  displayedClipId: string | null;
  /** True after a local switch, until the next applied state or reattach. */
  isLocal: boolean;
  /** The lead's planned next shuffle pick; null on a follower and while shuffle is off. */
  nextClipId: string | null;
}

interface VjProgramState {
  wasConnected: boolean;
  /** Bumps on every reattach, so the screen snaps to the stage then. */
  connectGeneration: number;
  adoptedKey: string | null;
  /** `stageEpoch|revision` of the last state seen. */
  seenRevisionKey: string | null;
  displayedClipId: string | null;
  isLocal: boolean;
  bag: VjShuffleBag;
  /** The planned next pick; reset whenever the bag is replaced. */
  lookahead: VjShuffleLookahead;
  /** Bumps on every clock fire that waits for no echo, to arm the next one. */
  clockTurn: number;
  /** The clockTurn of the latest adoption: only that turn is timed from liveSince. */
  anchorTurn: number;
}

type VjOutcomeCode = Extract<VjCommandOutcome, { ok: false }>["code"];

/** Outcome codes of a report that never reached the server. */
const TRANSPORT_FAILURE_CODES: ReadonlySet<VjOutcomeCode> =
  new Set<VjOutcomeCode>(["offline", "timeout", "failed"]);

function adoptionKeyOf(state: VjStageState, connectGeneration: number): string {
  return [
    state.stageEpoch,
    state.clipSequence,
    state.liveClipId ?? "",
    connectGeneration,
  ].join("|");
}

function adoptLiveClip(
  program: VjProgramState,
  state: VjStageState,
): VjProgramState {
  if (state.liveClipId === null) {
    return { ...program, displayedClipId: null, isLocal: false };
  }
  return {
    ...program,
    displayedClipId: state.liveClipId,
    isLocal: false,
    bag: markVjClipPlayed(program.bag, state.liveClipId),
    lookahead: EMPTY_VJ_SHUFFLE_LOOKAHEAD,
  };
}

/**
 * Pure: counts reattaches and adopts the state's live clip when its epoch,
 * clipSequence or liveClipId changed, or the screen just reattached. A
 * screen shuffling locally also snaps back to the stage on any newly
 * applied state (a new revision), so every projector shows the same clip
 * again. The same input twice returns the same object.
 */
function reconcileProgram(
  program: VjProgramState,
  state: VjStageState | null,
  isConnected: boolean,
): VjProgramState {
  let next = program;
  if (isConnected !== next.wasConnected) {
    next = {
      ...next,
      wasConnected: isConnected,
      connectGeneration: isConnected
        ? next.connectGeneration + 1
        : next.connectGeneration,
    };
  }
  if (state === null) return next;
  const adoptionKey = adoptionKeyOf(state, next.connectGeneration);
  const revisionKey = `${state.stageEpoch}|${state.revision}`;
  if (adoptionKey !== next.adoptedKey) {
    return {
      ...adoptLiveClip(next, state),
      adoptedKey: adoptionKey,
      seenRevisionKey: revisionKey,
      anchorTurn: next.clockTurn,
    };
  }
  if (revisionKey === next.seenRevisionKey) return next;
  const seen = { ...next, seenRevisionKey: revisionKey };
  return seen.isLocal ? adoptLiveClip(seen, state) : seen;
}

/** Pure: plans the next pick from the current pool; a null pool (shuffle off) keeps the program. */
function planProgram(
  program: VjProgramState,
  pool: readonly string[] | null,
  random: () => number,
): VjProgramState {
  if (pool === null) return program;
  const lookahead = planVjNextClip(
    program.lookahead,
    program.bag,
    pool,
    random,
  );
  return lookahead === program.lookahead ? program : { ...program, lookahead };
}

function initialProgram(isConnected: boolean): VjProgramState {
  return {
    wasConnected: isConnected,
    connectGeneration: 0,
    adoptedKey: null,
    seenRevisionKey: null,
    displayedClipId: null,
    isLocal: false,
    bag: EMPTY_VJ_SHUFFLE_BAG,
    lookahead: EMPTY_VJ_SHUFFLE_LOOKAHEAD,
    clockTurn: 0,
    anchorTurn: 0,
  };
}

function shuffleKeyOf(state: VjStageState | null): string {
  if (state === null) return "";
  const { isOn, intervalKind, intervalValue } = state.shuffle;
  return `${isOn}|${intervalKind}|${intervalValue}`;
}

/** Whether the shuffle clock runs on this screen at all. */
function isShuffleActive(state: VjStageState | null): boolean {
  return state !== null && state.shuffle.isOn && state.activePackId !== null;
}

/**
 * Milliseconds until the clock fires: `liveSince + interval` on the synced
 * clock, less `earlyMs`, when the turn is anchored; else the v1 interval from
 * now.
 */
function shuffleDelayMs(
  anchorServerMs: number | null,
  intervalMs: number,
  earlyMs: number,
  clock: VjClockReader,
): number {
  if (anchorServerMs === null) return intervalMs;
  const fireAtLocalMs =
    clock.toLocalTime(anchorServerMs + intervalMs) - earlyMs;
  return Math.max(0, fireAtLocalMs - performance.now());
}

interface VjShuffleClockRefs {
  bagRef: RefObject<VjShuffleBag>;
  lookaheadRef: RefObject<VjShuffleLookahead>;
  poolRef: RefObject<readonly string[]>;
  randomRef: RefObject<() => number>;
  advanceRef: RefObject<VjStageController["advance"]>;
  clockRef: RefObject<VjClockReader>;
}

interface VjShuffleClockInput {
  shouldRunClock: boolean;
  isStageMode: boolean;
  intervalMs: number;
  earlyMs: number;
  anchorServerMs: number | null;
  expectedClipSequence: number;
  shuffleKey: string;
  isConnected: boolean;
  adoptedKey: string | null;
  clockTurn: number;
  refs: VjShuffleClockRefs;
  setProgram: (update: (current: VjProgramState) => VjProgramState) => void;
}

/** Fallback wait after an accepted report: past its applyAt when the server quantized it. */
function fallbackDelayMs(
  outcome: VjCommandOutcome,
  clock: VjClockReader,
): number | null {
  if (!outcome.ok || outcome.applyAt === null) return null;
  const untilApplyMs = clock.toLocalTime(outcome.applyAt) - performance.now();
  return Math.max(0, untilApplyMs) + VJ_LEAD_ADVANCE_FALLBACK_MS;
}

function useVjShuffleClock({
  shouldRunClock,
  isStageMode,
  intervalMs,
  earlyMs,
  anchorServerMs,
  expectedClipSequence,
  shuffleKey,
  isConnected,
  adoptedKey,
  clockTurn,
  refs,
  setProgram,
}: VjShuffleClockInput): void {
  useEffect(() => {
    if (!shouldRunClock) return undefined;
    let isCurrent = true;
    let fallbackTimerId: number | undefined;

    const finish = (): boolean => {
      if (!isCurrent) return false;
      isCurrent = false;
      window.clearTimeout(fallbackTimerId);
      return true;
    };
    const switchLocally = (
      clipId: string,
      bag: VjShuffleBag,
      lookahead: VjShuffleLookahead,
    ): void => {
      if (!finish()) return;
      setProgram((current) => ({
        ...current,
        displayedClipId: clipId,
        isLocal: true,
        bag,
        lookahead,
        clockTurn: current.clockTurn + 1,
      }));
    };
    const armAgain = (): void => {
      if (!finish()) return;
      setProgram((current) => ({
        ...current,
        clockTurn: current.clockTurn + 1,
      }));
    };

    const fire = (): void => {
      const taken = takeVjPlannedClip(
        refs.lookaheadRef.current,
        refs.bagRef.current,
        refs.poolRef.current,
        refs.randomRef.current,
      );
      const clipId = taken.clipId;
      if (clipId === null) {
        // No clip in the pool: hold what is on screen and try again next interval.
        armAgain();
        return;
      }
      const switchToTaken = (): void =>
        switchLocally(clipId, taken.bag, taken.lookahead);
      if (!isStageMode) {
        switchToTaken();
        return;
      }
      fallbackTimerId = window.setTimeout(
        switchToTaken,
        VJ_LEAD_ADVANCE_FALLBACK_MS,
      );
      void refs.advanceRef
        .current(expectedClipSequence, clipId)
        .then((outcome) => {
          if (!isCurrent) return;
          if (outcome.ok) {
            // A quantized echo applies at its applyAt: wait past it.
            const delayMs = fallbackDelayMs(outcome, refs.clockRef.current);
            if (delayMs === null) return;
            window.clearTimeout(fallbackTimerId);
            fallbackTimerId = window.setTimeout(switchToTaken, delayMs);
            return;
          }
          if (TRANSPORT_FAILURE_CODES.has(outcome.code)) {
            switchToTaken();
            return;
          }
          // A server refusal: any state it carried is already applied and
          // re-arms through the adoption key; otherwise keep the clock going.
          armAgain();
        });
    };

    const clockTimerId = window.setTimeout(
      fire,
      shuffleDelayMs(
        anchorServerMs,
        intervalMs,
        earlyMs,
        refs.clockRef.current,
      ),
    );

    return () => {
      isCurrent = false;
      window.clearTimeout(clockTimerId);
      window.clearTimeout(fallbackTimerId);
    };
  }, [
    shouldRunClock,
    isStageMode,
    intervalMs,
    earlyMs,
    anchorServerMs,
    expectedClipSequence,
    shuffleKey,
    isConnected,
    adoptedKey,
    clockTurn,
    refs,
    setProgram,
  ]);
}

/** Latest values the clock fire reads, kept in refs so they never re-arm it. */
function useVjShuffleClockRefs(values: {
  bag: VjShuffleBag;
  lookahead: VjShuffleLookahead;
  pool: readonly string[];
  random: () => number;
  advance: VjStageController["advance"];
  clock: VjClockReader;
}): VjShuffleClockRefs {
  const bagRef = useRef(values.bag);
  const lookaheadRef = useRef(values.lookahead);
  const poolRef = useRef(values.pool);
  const randomRef = useRef(values.random);
  const advanceRef = useRef(values.advance);
  const clockRef = useRef(values.clock);
  useEffect(() => {
    bagRef.current = values.bag;
    lookaheadRef.current = values.lookahead;
    poolRef.current = values.pool;
    randomRef.current = values.random;
    advanceRef.current = values.advance;
    clockRef.current = values.clock;
  });
  const [refs] = useState<VjShuffleClockRefs>(() => ({
    bagRef,
    lookaheadRef,
    poolRef,
    randomRef,
    advanceRef,
    clockRef,
  }));
  return refs;
}

export function useVjScreenProgram({
  state,
  isConnected,
  isLead,
  readyClipIds,
  isFavorite,
  clock,
  advance,
  random = Math.random,
}: VjScreenProgramInput): VjScreenProgram {
  const isActive = isShuffleActive(state);
  const pool =
    isActive && state !== null
      ? vjShufflePool(readyClipIds, state.shuffle, isFavorite)
      : null;
  const [storedProgram, setProgram] = useState<VjProgramState>(() =>
    planProgram(
      reconcileProgram(initialProgram(isConnected), state, isConnected),
      pool,
      random,
    ),
  );
  const program = planProgram(
    reconcileProgram(storedProgram, state, isConnected),
    pool,
    random,
  );
  if (program !== storedProgram) setProgram(program);

  const refs = useVjShuffleClockRefs({
    bag: program.bag,
    lookahead: program.lookahead,
    pool: pool ?? [],
    random,
    advance,
    clock,
  });

  const isStageMode = isConnected && isLead;
  const isQuantized = state !== null && state.tempo.quantize !== "off";
  const { adoptedKey, clockTurn } = program;
  const isAnchored = !program.isLocal && clockTurn === program.anchorTurn;
  useVjShuffleClock({
    shouldRunClock: isActive && (!isConnected || isLead || program.isLocal),
    isStageMode,
    intervalMs:
      state === null ? 0 : vjShuffleIntervalMs(state.shuffle, state.tempo),
    earlyMs: isStageMode && isQuantized ? VJ_LIMITS.quantizedAdvanceEarlyMs : 0,
    anchorServerMs: isAnchored ? (state?.liveSince ?? null) : null,
    expectedClipSequence: state?.clipSequence ?? 0,
    shuffleKey: shuffleKeyOf(state),
    isConnected,
    adoptedKey,
    clockTurn,
    refs,
    setProgram,
  });

  return {
    displayedClipId: program.displayedClipId,
    isLocal: program.isLocal,
    nextClipId: isLead && isActive ? program.lookahead.plannedClipId : null,
  };
}
