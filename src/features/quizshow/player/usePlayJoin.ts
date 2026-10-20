import { useEffect, useRef, useState } from "react";
import type {
  QuizshowErrorCode,
  QuizshowJoinResponse,
  QuizshowPodiumEntry,
} from "../../../shared/contracts/quizshow";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  isPlayerState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { useJoinQuizshow } from "../api/useQuizshowMutations";

interface PlayJoin {
  join: QuizshowJoinResponse | null;
  errorCode: QuizshowErrorCode | null;
  isPending: boolean;
  /** The join failed with something that carries no known code (a dropped connection). */
  hasUnknownFailure: boolean;
}

/** What one join attempt came back with, tagged with the attempt it answers. */
interface JoinOutcome {
  requestKey: string;
  join: QuizshowJoinResponse | null;
  errorCode: QuizshowErrorCode | null;
  hasFailed: boolean;
}

/**
 * One `POST /quizshow/join` per code and navigation: a new `attemptKey` (the
 * router's location key) posts the same code again. A null code asks for nothing.
 * The result lands in local state through the mutation's own promise, so it
 * arrives even when StrictMode's effect replay has detached the mutation
 * observer; an answer for an older attempt is ignored.
 */
export function usePlayJoin(
  code: string | null,
  attemptKey: string = "",
): PlayJoin {
  const { mutateAsync } = useJoinQuizshow();
  const [outcome, setOutcome] = useState<JoinOutcome | null>(null);
  const requestedKeyRef = useRef<string | null>(null);
  const requestKey = code === null ? null : `${code}:${attemptKey}`;

  useEffect(() => {
    if (code === null || requestKey === null) return;
    // StrictMode replays this effect on the same mount; the ref keeps it to one post.
    if (requestedKeyRef.current === requestKey) return;
    requestedKeyRef.current = requestKey;
    // A slower answer for an older attempt never replaces the newer one.
    void mutateAsync({ code }).then(
      (join) => {
        if (requestedKeyRef.current !== requestKey) return;
        setOutcome({ requestKey, join, errorCode: null, hasFailed: false });
      },
      (error: unknown) => {
        if (requestedKeyRef.current !== requestKey) return;
        setOutcome({
          requestKey,
          join: null,
          errorCode: quizshowErrorCodeOf(error),
          hasFailed: true,
        });
      },
    );
  }, [code, requestKey, mutateAsync]);

  const current =
    outcome !== null && outcome.requestKey === requestKey ? outcome : null;
  return {
    join: current?.join ?? null,
    errorCode: current?.errorCode ?? null,
    isPending: code !== null && current === null,
    hasUnknownFailure:
      current !== null && current.hasFailed && current.errorCode === null,
  };
}

/** The copy key of any send failure; a lost connection gets the generic line. */
export function sendFailureKeyOf(
  code: QuizshowErrorCode | "transport_timeout",
) {
  return quizshowErrorKeyOf(code === "transport_timeout" ? null : code);
}

export interface QuizshowFinalPlace {
  place: number;
  total: number;
}

export function placeFromScores(state: QuizshowClientState) {
  const { session } = state;
  if (!isPlayerState(session) || session.myScores === null) return null;
  const total =
    session.scores?.entrantCount ??
    (session.playMode === "teams"
      ? session.lobby.teams.length
      : session.lobby.playerCount);
  return { place: session.myScores.rank, total };
}

export function placeFromPodium(
  state: QuizshowClientState,
  podium: readonly QuizshowPodiumEntry[],
) {
  const { session } = state;
  if (!isPlayerState(session) || session.me === null) return null;
  const { me } = session;
  const isTeams = session.playMode === "teams";
  const entry = podium.find(
    (candidate) => candidate.entrantId === (isTeams ? me.teamId : me.playerId),
  );
  if (entry === undefined) return null;
  return {
    place: entry.place,
    total: isTeams ? session.lobby.teams.length : session.lobby.playerCount,
  };
}

/** The last place the scores frames reported; the ended phase clears them, so it is kept here. */
export function useRememberedPlace(
  state: QuizshowClientState,
): QuizshowFinalPlace | null {
  const [remembered, setRemembered] = useState<QuizshowFinalPlace | null>(null);
  const current = placeFromScores(state);
  if (
    current !== null &&
    (remembered === null ||
      remembered.place !== current.place ||
      remembered.total !== current.total)
  ) {
    setRemembered(current);
  }
  return current ?? remembered;
}

/** A host removed this player, told live or by a refused re-attach. */
export function isRemovedOf(state: QuizshowClientState): boolean {
  return state.isRemoved || state.refusalCode === "quizshow_player_removed";
}
