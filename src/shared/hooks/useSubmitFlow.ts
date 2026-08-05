import { useCallback, useEffect, useRef, useState } from "react";

export type FlowStatus = "idle" | "sending" | "done";

/**
 * Drives the idle → sending → done transition that powers a simulated submit
 * (loading spinner, then a success panel). Prototype-only: there's no real
 * request, just a timer. Consolidates the per-feature copies.
 *
 * @example
 * const { sending, done, submit } = useSubmitFlow()
 * <Button disabled={sending} onClick={() => submit()}>
 *   {sending ? <Sending label="Sending…" /> : 'Send'}
 * </Button>
 * {done && <SuccessPanel … />}
 */
export function useSubmitFlow() {
  const [status, setStatus] = useState<FlowStatus>("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const submit = useCallback((onComplete?: () => void, ms = 1000) => {
    setStatus("sending");
    timer.current = window.setTimeout(() => {
      onComplete?.();
      setStatus("done");
    }, ms);
  }, []);
  /**
   * The live counterpart of `submit`: drives idle → sending → done around a real
   * async task (e.g. a POST). On success the panel flips to `done`; on failure
   * it returns to `idle` and the error is re-thrown so the caller can toast it.
   */
  const run = useCallback(async (task: () => Promise<void>) => {
    setStatus("sending");
    try {
      await task();
      setStatus("done");
    } catch (error) {
      setStatus("idle");
      throw error;
    }
  }, []);
  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    setStatus("idle");
  }, []);
  return {
    status,
    submit,
    run,
    reset,
    idle: status === "idle",
    sending: status === "sending",
    done: status === "done",
  };
}
