/**
 * The desk's URL entry points. The shell's global actions (the rail button
 * and the ⌘K palette row) live outside this page, so they can't reach its
 * handlers directly: the modal and the new-draft call both need the desk's
 * own `editors`/`sections` data. They navigate here with a flag instead, and
 * this hook consumes it.
 *
 * Each flag is stripped BEFORE its action runs. "Write" navigates away to the
 * article editor on success, so a param left in the URL would start a second
 * draft the moment the editor pressed Back.
 *
 * The write flag also waits for `isWriteReady`. Arriving from the rail mounts
 * this page and the session resolves a beat later; consuming the flag in that
 * window would spend it on a "still loading" toast and no draft.
 */

import { useEffect } from "react";
import type { SetURLSearchParams } from "react-router-dom";

export interface UseDeskEntryParamsParams {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  /** Runs for `?write=new` — start a piece this editor writes themselves. */
  onWrite: () => void;
  /** Whether `onWrite` can succeed yet (the signed-in editor has resolved). */
  isWriteReady: boolean;
  /** Runs for `?commission=new` — open the commission modal. */
  onCommission: () => void;
}

export function useDeskEntryParams({
  searchParams,
  setSearchParams,
  onWrite,
  isWriteReady,
  onCommission,
}: UseDeskEntryParamsParams): void {
  useEffect(() => {
    const isWrite = searchParams.get("write") === "new";
    const isCommission = searchParams.get("commission") === "new";
    if (isWrite && !isWriteReady) return;
    if (!isWrite && !isCommission) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("write");
    nextParams.delete("commission");
    setSearchParams(nextParams, { replace: true });

    if (isWrite) onWrite();
    else onCommission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isWriteReady]);
}
