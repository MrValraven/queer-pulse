import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPurchaseReferenceView,
  type StudioPurchaseReferenceView,
} from "./studioPurchases.adapters";
import { postStudioPurchaseReference } from "./studioPurchases.api";

interface ReferenceState {
  reference: StudioPurchaseReferenceView | null;
  status: "loading" | "ready" | "failed";
  error: unknown;
}

const LOADING: ReferenceState = {
  reference: null,
  status: "loading",
  error: null,
};

/** One payment code per mount: a request fired once on mount (and again on
 *  `requestNew`) with no cache, so every opening of the sheet gets a fresh
 *  code. Route 18 stores nothing, so there is no query to write or reuse.
 *  The promise of the current attempt lives in a ref, so StrictMode's
 *  simulated remount reuses one request and a real unmount discards the
 *  answer. */
export function useStudioPurchaseReference(): ReferenceState & {
  requestNew: () => void;
} {
  const { demoMode } = useDemoMode();
  const [state, setState] = useState<ReferenceState>(LOADING);
  const [attempt, setAttempt] = useState(0);
  const inFlightRef = useRef<{
    attempt: number;
    promise: Promise<StudioPurchaseReferenceView>;
  } | null>(null);
  useEffect(() => {
    let isCancelled = false;
    if (inFlightRef.current?.attempt !== attempt) {
      inFlightRef.current = {
        attempt,
        promise: (async () => {
          const dto = demoMode
            ? (
                await import("./studioDemoPurchaseWrites")
              ).demoStudioPurchaseReference()
            : await postStudioPurchaseReference();
          const reference = toPurchaseReferenceView(dto);
          if (!reference)
            throw new Error(
              "The server sent a payment code this build cannot read",
            );
          return reference;
        })(),
      };
    }
    inFlightRef.current.promise.then(
      (reference) => {
        if (!isCancelled) setState({ reference, status: "ready", error: null });
      },
      (error: unknown) => {
        if (!isCancelled)
          setState({ reference: null, status: "failed", error });
      },
    );
    return () => {
      isCancelled = true;
    };
  }, [attempt, demoMode]);
  const requestNew = useCallback(() => {
    setState(LOADING);
    setAttempt((previous) => previous + 1);
  }, []);
  return { ...state, requestNew };
}
