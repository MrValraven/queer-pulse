/**
 * A dragged control's draft value (the v1 `useVjFadeSlider`, generalized):
 * while dragging, values go out through a trailing sender (at most one per
 * `throttleMs`, contract 7.12), the release flushes the final value, and the
 * draft shows until the newest received state reaches the revision of the
 * last send. A refusal of that last send drops the draft, vibrates "refused"
 * and hands its named reason to `onRefused`.
 *
 * Only the newest send settles the draft: an ack for an older send, or one
 * that lands while a newer value still waits in the sender, changes nothing.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { VjCommandOutcome } from "../../live/vjStageCommands";
import {
  createVjTrailingSender,
  type VjTrailingSender,
} from "../rules/vjThrottle";
import { reportVjRefusal, type VjSendRefusal } from "./useVjOptimisticValue";

export interface UseVjThrottledDraftOptions<Value> {
  serverValue: Value;
  stateRevision: number | null;
  throttleMs: number;
  send: (value: Value) => Promise<VjCommandOutcome>;
  isBlocked: boolean;
  onRefused?: (refusal: VjSendRefusal) => void;
  now?: () => number;
}

interface VjDraft<Value> {
  value: Value;
  /** The revision of the ack for the value shown; null until it lands. */
  awaitedRevision: number | null;
}

interface VjDraftSend {
  sendId: number;
  /** How many values had been pushed when this one went out. */
  pushCount: number;
}

interface VjDraftSender<Value> {
  intervalMs: number;
  sender: VjTrailingSender<Value>;
}

export function useVjThrottledDraft<Value>(
  options: UseVjThrottledDraftOptions<Value>,
): {
  value: Value;
  isDragging: boolean;
  change: (value: Value) => void;
  release: () => void;
} {
  const { serverValue, stateRevision } = options;
  const [draft, setDraft] = useState<VjDraft<Value> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasDraftLanded =
    !isDragging &&
    draft !== null &&
    draft.awaitedRevision !== null &&
    stateRevision !== null &&
    stateRevision >= draft.awaitedRevision;
  if (hasDraftLanded) setDraft(null);

  const latestRef = useRef(options);
  useEffect(() => {
    latestRef.current = options;
  });
  const senderRef = useRef<VjDraftSender<Value> | null>(null);
  const isDraggingRef = useRef(false);
  const pushCountRef = useRef(0);
  const nextSendIdRef = useRef(0);
  const latestSendRef = useRef<VjDraftSend | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      senderRef.current?.sender.cancel();
      senderRef.current = null;
    };
  }, []);

  const settle = useCallback(
    (sendId: number, outcome: VjCommandOutcome | null) => {
      const latestSend = latestSendRef.current;
      if (!isMountedRef.current || latestSend?.sendId !== sendId) return;
      if (outcome?.ok === true) {
        // A newer value waits in the sender; its own send settles the draft.
        if (pushCountRef.current !== latestSend.pushCount) return;
        const { revision } = outcome;
        setDraft((current) =>
          current === null
            ? current
            : { ...current, awaitedRevision: revision },
        );
        return;
      }
      setDraft(null);
      if (outcome !== null) {
        reportVjRefusal(outcome, latestRef.current.onRefused);
      }
    },
    [],
  );

  const sendValue = useCallback(
    (value: Value) => {
      nextSendIdRef.current += 1;
      const sendId = nextSendIdRef.current;
      latestSendRef.current = { sendId, pushCount: pushCountRef.current };
      void latestRef.current.send(value).then(
        (outcome) => settle(sendId, outcome),
        () => settle(sendId, null),
      );
    },
    [settle],
  );

  const senderOf = useCallback((): VjTrailingSender<Value> => {
    const intervalMs = latestRef.current.throttleMs;
    const current = senderRef.current;
    if (current !== null && current.intervalMs === intervalMs) {
      return current.sender;
    }
    current?.sender.flushNow();
    const sender = createVjTrailingSender<Value>({
      intervalMs,
      send: sendValue,
    });
    senderRef.current = { intervalMs, sender };
    return sender;
  }, [sendValue]);

  const change = useCallback(
    (value: Value) => {
      if (latestRef.current.isBlocked) return;
      isDraggingRef.current = true;
      setIsDragging(true);
      pushCountRef.current += 1;
      setDraft({ value, awaitedRevision: null });
      senderOf().push(value, (latestRef.current.now ?? Date.now)());
    },
    [senderOf],
  );

  const release = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const current = senderRef.current;
    if (latestRef.current.isBlocked) {
      // Nothing goes out while blocked: the control shows the server value.
      current?.sender.cancel();
      setDraft(null);
      return;
    }
    current?.sender.flushNow();
  }, []);

  return {
    value: draft === null ? serverValue : draft.value,
    isDragging,
    change,
    release,
  };
}
