import { useEffect, useRef, useState } from "react";

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
  const submit = (onComplete?: () => void, ms = 1000) => {
    setStatus("sending");
    timer.current = window.setTimeout(() => {
      onComplete?.();
      setStatus("done");
    }, ms);
  };
  const reset = () => {
    window.clearTimeout(timer.current);
    setStatus("idle");
  };
  return {
    status,
    submit,
    reset,
    idle: status === "idle",
    sending: status === "sending",
    done: status === "done",
  };
}
