import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { VouchGraphUrlView } from "./vouchGraph.types";
import { EMPTY_FILTERS } from "./vouchGraphFilters";
import {
  readVouchGraphUrlView,
  writeVouchGraphUrlView,
} from "./vouchGraphUrlState";

/** Delay before a view change lands in the URL, so a burst of changes (a
 *  replay, typing a month) writes once. */
const URL_SYNC_DELAY_MS = 150;

export interface TrustNetworkUrl {
  /** The view the `tn*` params describe, or null when the network is closed. */
  openView: VouchGraphUrlView | null;
  open: (
    focusSlug: string,
    partial?: Partial<Omit<VouchGraphUrlView, "focus">>,
  ) => void;
  /** Writes the view with `replace`, debounced 150 ms. */
  sync: (view: VouchGraphUrlView) => void;
  /** Removes every `tn*` param. */
  close: () => void;
  /** Drops a pending `sync` write. A closing network calls it first, so a
   *  write still waiting on the debounce cannot land after the close and put
   *  the `tn*` params back. */
  cancel: () => void;
}

/**
 * B9: the trust network's view lives in the current route's `tn*` params, so
 * the open network survives a reload and a copied link opens the same view.
 * Every write replaces the history entry, so moving around the graph never
 * fills the back stack. `sync`, `open`, `close` and `cancel` keep their
 * identity across URL changes, so a caller can sync from an effect without
 * looping.
 */
export function useTrustNetworkUrl(): TrustNetworkUrl {
  const [searchParams, setSearchParams] = useSearchParams();
  const latestParamsRef = useRef(searchParams);
  const setSearchParamsRef = useRef(setSearchParams);
  const pendingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    latestParamsRef.current = searchParams;
    setSearchParamsRef.current = setSearchParams;
  }, [searchParams, setSearchParams]);

  const cancelPending = useCallback(() => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const writeNow = useCallback((view: VouchGraphUrlView | null) => {
    const current = latestParamsRef.current;
    const next = writeVouchGraphUrlView(current, view);
    if (next.toString() === current.toString()) return;
    latestParamsRef.current = next;
    setSearchParamsRef.current(next, { replace: true });
  }, []);

  const open = useCallback(
    (
      focusSlug: string,
      partial?: Partial<Omit<VouchGraphUrlView, "focus">>,
    ) => {
      cancelPending();
      writeNow({
        mode: "plain",
        selectedId: null,
        pathA: null,
        pathB: null,
        filters: EMPTY_FILTERS,
        isListView: false,
        ...partial,
        focus: focusSlug,
      });
    },
    [cancelPending, writeNow],
  );

  const sync = useCallback(
    (view: VouchGraphUrlView) => {
      cancelPending();
      pendingTimerRef.current = window.setTimeout(() => {
        pendingTimerRef.current = null;
        writeNow(view);
      }, URL_SYNC_DELAY_MS);
    },
    [cancelPending, writeNow],
  );

  const close = useCallback(() => {
    cancelPending();
    writeNow(null);
  }, [cancelPending, writeNow]);

  // An unmount drops a pending write: the view it carried is gone.
  useEffect(() => cancelPending, [cancelPending]);

  const openView = useMemo(
    () => readVouchGraphUrlView(searchParams),
    [searchParams],
  );

  return { openView, open, sync, close, cancel: cancelPending };
}
