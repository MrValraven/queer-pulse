/**
 * Optimistic values over the R1 map (`rules/vjOptimistic.ts`). `apply` shows
 * the value at once, runs the send, keeps the value until the newest received
 * state (`stage.latestState?.revision`, passed as `stateRevision`) reaches the
 * revision the ack named, and rolls it back on a refusal.
 *
 * Each send keeps its own id and `sentAt`, so a late ack or refusal for an
 * older send A never settles a newer send B of the same key: only the entry
 * whose `sentAt` matches the acknowledged send is marked acked or rolled back.
 * A refusal with a copy key vibrates the "refused" pattern and reaches
 * `onRefused` with its named reason (error key and values); the silent codes
 * carry no key, so they roll back quietly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  VjCommandFailureOutcome,
  VjCommandOutcome,
  VjErrorValues,
} from "../../live/vjStageCommands";
import { vibrateVj } from "../rules/vjHaptics";
import {
  VJ_OPTIMISTIC_TTL_MS,
  vjOptimisticAcked,
  vjOptimisticFailed,
  vjOptimisticReconcile,
  vjOptimisticSet,
  vjOptimisticValueOf,
  type VjOptimisticMap,
} from "../rules/vjOptimistic";

/** The named reason of a refused send: the copy key and what it interpolates. */
export interface VjSendRefusal {
  code: VjCommandFailureOutcome["code"];
  errorKey: string;
  errorValues?: VjErrorValues;
}

/**
 * Vibrates "refused" and hands the named reason on. Silent codes (null key)
 * do neither: the state their ack carries is already applied.
 */
export function reportVjRefusal(
  failure: VjCommandFailureOutcome,
  onRefused: ((refusal: VjSendRefusal) => void) | undefined,
): void {
  if (failure.errorKey === null) return;
  vibrateVj("refused");
  onRefused?.({
    code: failure.code,
    errorKey: failure.errorKey,
    errorValues: failure.errorValues,
  });
}

export interface UseVjOptimisticValueOptions {
  stateRevision: number | null;
  now?: () => number;
  /** A refusal that rolled `key` back, with its named reason. */
  onRefused?: (refusal: VjSendRefusal, key: string) => void;
}

interface VjOptimisticSend {
  sendId: number;
  sentAt: number;
}

type VjTimerId = ReturnType<typeof setTimeout>;

export function useVjOptimisticValue<Value>(
  options: UseVjOptimisticValueOptions,
): {
  valueOf: (key: string, serverValue: Value) => Value;
  isPending: (key: string) => boolean;
  /** Shows value at once, runs send, keeps it until the state reaches the ack's revision, rolls back on failure. */
  apply: (
    key: string,
    value: Value,
    send: () => Promise<VjCommandOutcome>,
  ) => Promise<VjCommandOutcome>;
} {
  const { stateRevision } = options;
  const [optimisticMap, setOptimisticMap] = useState<VjOptimisticMap<Value>>(
    () => new Map(),
  );
  const [reconciledRevision, setReconciledRevision] = useState(stateRevision);
  if (stateRevision !== reconciledRevision) {
    setReconciledRevision(stateRevision);
    if (stateRevision !== null) {
      // Revision only: expiry is the timer's job, so render reads no clock.
      setOptimisticMap((map) =>
        vjOptimisticReconcile(map, stateRevision, Number.NEGATIVE_INFINITY),
      );
    }
  }

  const latestRef = useRef(options);
  useEffect(() => {
    latestRef.current = options;
  });
  const sendsByKeyRef = useRef(new Map<string, VjOptimisticSend>());
  const nextSendIdRef = useRef(0);
  const expiryTimersRef = useRef(new Set<VjTimerId>());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const expiryTimers = expiryTimersRef.current;
    return () => {
      isMountedRef.current = false;
      for (const timerId of expiryTimers) clearTimeout(timerId);
      expiryTimers.clear();
    };
  }, []);

  const apply = useCallback(
    async (
      key: string,
      value: Value,
      send: () => Promise<VjCommandOutcome>,
    ): Promise<VjCommandOutcome> => {
      const nowOf = () => (latestRef.current.now ?? Date.now)();
      nextSendIdRef.current += 1;
      const thisSend: VjOptimisticSend = {
        sendId: nextSendIdRef.current,
        sentAt: nowOf(),
      };
      sendsByKeyRef.current.set(key, thisSend);
      setOptimisticMap((map) =>
        vjOptimisticSet(map, key, value, thisSend.sentAt),
      );

      const expiryTimerId = setTimeout(() => {
        expiryTimersRef.current.delete(expiryTimerId);
        const revisionNow = latestRef.current.stateRevision;
        const expiredAt = nowOf();
        setOptimisticMap((map) =>
          vjOptimisticReconcile(
            map,
            revisionNow ?? Number.NEGATIVE_INFINITY,
            expiredAt,
          ),
        );
      }, VJ_OPTIMISTIC_TTL_MS + 1);
      expiryTimersRef.current.add(expiryTimerId);

      /** True while no newer send of this key replaced this one; claims it. */
      const claimLatestSend = (): boolean => {
        if (!isMountedRef.current) return false;
        if (sendsByKeyRef.current.get(key)?.sendId !== thisSend.sendId) {
          return false;
        }
        sendsByKeyRef.current.delete(key);
        return true;
      };
      const rollBack = () => {
        setOptimisticMap((map) =>
          map.get(key)?.sentAt === thisSend.sentAt
            ? vjOptimisticFailed(map, key)
            : map,
        );
      };

      let outcome: VjCommandOutcome;
      try {
        outcome = await send();
      } catch (error) {
        if (claimLatestSend()) rollBack();
        throw error;
      }
      if (!claimLatestSend()) return outcome;
      if (outcome.ok) {
        const { revision } = outcome;
        const revisionNow = latestRef.current.stateRevision;
        const ackedAt = nowOf();
        setOptimisticMap((map) => {
          if (map.get(key)?.sentAt !== thisSend.sentAt) return map;
          const ackedMap = vjOptimisticAcked(map, key, revision);
          return revisionNow === null
            ? ackedMap
            : vjOptimisticReconcile(ackedMap, revisionNow, ackedAt);
        });
        return outcome;
      }
      rollBack();
      const onRefused = latestRef.current.onRefused;
      reportVjRefusal(
        outcome,
        onRefused && ((refusal) => onRefused(refusal, key)),
      );
      return outcome;
    },
    [],
  );

  const valueOf = useCallback(
    (key: string, serverValue: Value) =>
      vjOptimisticValueOf(optimisticMap, key, serverValue),
    [optimisticMap],
  );
  const isPending = useCallback(
    (key: string) => optimisticMap.has(key),
    [optimisticMap],
  );

  return { valueOf, isPending, apply };
}
