/**
 * What the projector shows and the shuffle clock behind it (contract 6.8,
 * 6.9). A newly applied state always wins; between states, the lead screen
 * reports each shuffle pick to the server and switches on the echo, and a
 * screen that is disconnected, or a lead whose echo is late, shuffles
 * locally until the next stage:state. A connected lead keeps reporting even
 * while it shows a local pick: each report carries the clipSequence it holds,
 * so the echo brings every screen back to the same clip.
 */
import { useEffect, useRef, useState } from "react";
import {
  vjShuffleIntervalMs,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCommandOutcome, VjStageController } from "../live/useVjStage";
import {
  EMPTY_VJ_SHUFFLE_BAG,
  markVjClipPlayed,
  nextVjShuffleClip,
  type VjShuffleBag,
} from "../live/vjShuffleBag";
import { VJ_LEAD_ADVANCE_FALLBACK_MS } from "../vj.constants";

export interface VjScreenProgramInput {
  /** The applied state, or the record's on an offline start. */
  state: VjStageState | null;
  isConnected: boolean;
  isLead: boolean;
  /** Ready clips of the active pack, pack order: the shuffle's pool. */
  readyClipIds: readonly string[];
  advance: VjStageController["advance"];
  random?: () => number;
}

export interface VjScreenProgram {
  displayedClipId: string | null;
  /** True after a local switch, until the next applied state or reattach. */
  isLocal: boolean;
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
  /** Bumps on every clock fire that waits for no echo, to arm the next one. */
  clockTurn: number;
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
  return {
    ...program,
    displayedClipId: state.liveClipId,
    isLocal: false,
    bag:
      state.liveClipId === null
        ? program.bag
        : markVjClipPlayed(program.bag, state.liveClipId),
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
    };
  }
  if (revisionKey === next.seenRevisionKey) return next;
  const seen = { ...next, seenRevisionKey: revisionKey };
  return seen.isLocal ? adoptLiveClip(seen, state) : seen;
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
    clockTurn: 0,
  };
}

function shuffleKeyOf(state: VjStageState | null): string {
  if (state === null) return "";
  const { isOn, intervalKind, intervalValue, bpm } = state.shuffle;
  return `${isOn}|${intervalKind}|${intervalValue}|${bpm}`;
}

export function useVjScreenProgram({
  state,
  isConnected,
  isLead,
  readyClipIds,
  advance,
  random = Math.random,
}: VjScreenProgramInput): VjScreenProgram {
  const [storedProgram, setProgram] = useState<VjProgramState>(() =>
    reconcileProgram(initialProgram(isConnected), state, isConnected),
  );
  const program = reconcileProgram(storedProgram, state, isConnected);
  if (program !== storedProgram) setProgram(program);

  const bagRef = useRef(program.bag);
  const readyClipIdsRef = useRef(readyClipIds);
  const randomRef = useRef(random);
  const advanceRef = useRef(advance);
  useEffect(() => {
    bagRef.current = program.bag;
    readyClipIdsRef.current = readyClipIds;
    randomRef.current = random;
    advanceRef.current = advance;
  });

  const shouldRunClock =
    state !== null &&
    state.shuffle.isOn &&
    state.activePackId !== null &&
    (!isConnected || isLead || program.isLocal);
  const isStageMode = isConnected && isLead;
  const intervalMs = state === null ? 0 : vjShuffleIntervalMs(state.shuffle);
  const expectedClipSequence = state?.clipSequence ?? 0;
  const shuffleKey = shuffleKeyOf(state);
  const { adoptedKey, clockTurn } = program;

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
    const switchLocally = (clipId: string, bag: VjShuffleBag): void => {
      if (!finish()) return;
      setProgram((current) => ({
        ...current,
        displayedClipId: clipId,
        isLocal: true,
        bag,
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

    const clockTimerId = window.setTimeout(() => {
      const pick = nextVjShuffleClip(
        bagRef.current,
        readyClipIdsRef.current,
        randomRef.current,
      );
      const clipId = pick.clipId;
      if (clipId === null) {
        // No ready clip: hold what is on screen and try again next interval.
        armAgain();
        return;
      }
      if (!isStageMode) {
        switchLocally(clipId, pick.bag);
        return;
      }
      fallbackTimerId = window.setTimeout(
        () => switchLocally(clipId, pick.bag),
        VJ_LEAD_ADVANCE_FALLBACK_MS,
      );
      void advanceRef.current(expectedClipSequence, clipId).then((outcome) => {
        if (!isCurrent || outcome.ok) return;
        if (TRANSPORT_FAILURE_CODES.has(outcome.code)) {
          switchLocally(clipId, pick.bag);
          return;
        }
        // A server refusal: any state it carried is already applied and
        // re-arms through the adoption key; otherwise keep the clock going.
        armAgain();
      });
    }, intervalMs);

    return () => {
      isCurrent = false;
      window.clearTimeout(clockTimerId);
      window.clearTimeout(fallbackTimerId);
    };
  }, [
    shouldRunClock,
    isStageMode,
    intervalMs,
    expectedClipSequence,
    shuffleKey,
    isConnected,
    adoptedKey,
    clockTurn,
  ]);

  return {
    displayedClipId: program.displayedClipId,
    isLocal: program.isLocal,
  };
}
