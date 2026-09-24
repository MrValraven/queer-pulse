import { useCallback, useEffect, useRef } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import {
  isArticleDraftConflict,
  type ArticleDraftDto,
  type UpdateArticleDraftDto,
} from "../../api/pieces.api";
import { snapshotsEqual, type DraftSnapshot } from "./articleDraftSnapshot";

/** How one write settled. Always resolves, so a caller awaiting a write it
 *  did not start (see `saveBeforeLeaving`) needs no catch of its own. */
export type SettledWrite = { isSaved: true } | { isSaved: false; error: Error };

/** The newest write the server has confirmed: the snapshot it holds and the
 *  article `version` that write moved the row to. */
interface ConfirmedWrite {
  snapshot: DraftSnapshot | null;
  version: number | null;
}

/**
 * The PATCH body for one write: the whole snapshot plus the article `version`
 * this editor last read, declared as the precondition (ENG-111). Built in one
 * place so the four write paths (the debounced autosave, the pagehide flush,
 * the explicit `saveNow` and "Save and leave") can never disagree about what
 * they declare.
 * `null` means the draft has not been seeded yet, in which case there is no
 * version to claim and the server falls back to its in-request guard alone.
 */
function toSavePayload(
  pending: DraftSnapshot,
  baseVersion: number | null,
): UpdateArticleDraftDto {
  if (baseVersion === null) return { ...pending };
  return { ...pending, expectedVersion: baseVersion };
}

export interface UseArticleDraftWritesArgs {
  save: UseMutationResult<ArticleDraftDto | null, Error, UpdateArticleDraftDto>;
  /** The live, undebounced snapshot on screen. */
  snapshot: DraftSnapshot;
  lastSavedSnapshot: DraftSnapshot | null;
  baseVersion: number | null;
  hasSaveConflict: boolean;
  setLastSavedSnapshot: (snapshot: DraftSnapshot) => void;
  setBaseVersion: (version: number) => void;
  setHasSaveConflict: (hasConflict: boolean) => void;
}

/**
 * The article editor's write bookkeeping, split out of
 * `useArticleEditorDraftState` (which owns the fields, the seed and the
 * autosave loop) to keep that hook under the line cap. Holds the one
 * `writeSnapshot` every path sends through, what is on the wire, the newest
 * confirmed write, and "Save and leave" (`saveBeforeLeaving`).
 */
export function useArticleDraftWrites({
  save,
  snapshot,
  lastSavedSnapshot,
  baseVersion,
  hasSaveConflict,
  setLastSavedSnapshot,
  setBaseVersion,
  setHasSaveConflict,
}: UseArticleDraftWritesArgs) {
  // What a PATCH is currently carrying, so a save that resolves while a newer
  // one is already in flight can't make the autosave fire that newer snapshot
  // a second time. Written and read only from effects/handlers, never render.
  const inFlightSnapshotRef = useRef<DraftSnapshot | null>(null);
  // The settling promise of the write on the wire, so "Save and leave" can
  // let it land before sending its own: two overlapping PATCHes declare the
  // same version and the second 409s against this editor's own first.
  const inFlightWriteRef = useRef<Promise<SettledWrite> | null>(null);
  // Mirrors `lastSavedSnapshot` and `baseVersion`, but a confirmed write
  // updates it at once, ahead of the render carrying the new state. A save
  // landing right before the editor unmounts (the "Save and leave" path)
  // never gets that render, and flushing from the stale state would resend
  // the draft on the version that save had just moved, and 409.
  const confirmedWriteRef = useRef<ConfirmedWrite>({
    snapshot: null,
    version: null,
  });
  // Synced only when the state itself changes (a seed, a reload, a restore or
  // a confirmed write's own render), so a render committed with older state
  // never rolls the ref back.
  useEffect(() => {
    confirmedWriteRef.current = {
      snapshot: lastSavedSnapshot,
      version: baseVersion,
    };
  }, [lastSavedSnapshot, baseVersion]);

  /**
   * The one write every path goes through (the debounced autosave, the
   * pagehide flush, `saveNow` and `saveBeforeLeaving`). It always resolves,
   * to how the write settled.
   *
   * Only a confirmed write advances the saved marker: on failure the snapshot
   * stays dirty, so the next edit (or an explicit retry via `saveNow`) sends
   * this content again instead of dropping it. A confirmed write also
   * advances the concurrency baseline from the row the server hands back;
   * demo mode resolves to `null` (no server, no row to move), so the baseline
   * stays where the fixture put it. A 409 is the one failure that must never
   * be retried, since the retry would carry the same stale
   * `expectedVersion`, so it latches the conflict and stops every write path.
   */
  // `useCallback` so the ref bookkeeping sits in a callback the compiler
  // knows never runs during render.
  const writeSnapshot = useCallback(
    (pending: DraftSnapshot, version: number | null): Promise<SettledWrite> => {
      inFlightSnapshotRef.current = pending;
      const settledWrite = save
        .mutateAsync(toSavePayload(pending, version))
        .then(
          (saved): SettledWrite => {
            confirmedWriteRef.current = {
              snapshot: pending,
              version: saved ? saved.version : version,
            };
            if (saved) setBaseVersion(saved.version);
            setLastSavedSnapshot(pending);
            return { isSaved: true };
          },
          (error: Error): SettledWrite => {
            if (isArticleDraftConflict(error)) setHasSaveConflict(true);
            return { isSaved: false, error };
          },
        )
        .finally(() => {
          if (inFlightSnapshotRef.current === pending)
            inFlightSnapshotRef.current = null;
          if (inFlightWriteRef.current === settledWrite)
            inFlightWriteRef.current = null;
        });
      inFlightWriteRef.current = settledWrite;
      return settledWrite;
    },
    [save, setBaseVersion, setLastSavedSnapshot, setHasSaveConflict],
  );

  /**
   * "Save and leave" in the app-wide leave dialog: flushes the pending
   * autosave now and resolves true once the server holds everything on
   * screen. Never publishes; publishing stays the explicit action it is.
   *
   * A write already on the wire lands first (sending over it would 409, see
   * `inFlightWriteRef`), and a second one the autosave started meanwhile is
   * awaited too. Then whatever those did not cover is sent from the newest
   * confirmed version. The debounce needs no cancelling: once this write
   * lands, the autosave effect finds the live draft saved and skips its older
   * snapshot, and leaving unmounts its timer.
   *
   * Resolves false on a failed save (the header's error state and the save
   * toast say so) and on a conflict, whose banner explains why the writer
   * stayed. The dialog only offers this while no conflict is latched.
   */
  const saveBeforeLeaving = useCallback(async (): Promise<boolean> => {
    if (hasSaveConflict) return false;
    let pendingWrite = inFlightWriteRef.current;
    while (pendingWrite) {
      const settledWrite = await pendingWrite;
      if (!settledWrite.isSaved && isArticleDraftConflict(settledWrite.error))
        return false;
      const nextWrite = inFlightWriteRef.current;
      pendingWrite = nextWrite === pendingWrite ? null : nextWrite;
    }
    const confirmed = confirmedWriteRef.current;
    // Nothing seeded yet means nothing typed yet, so nothing is lost.
    if (!confirmed.snapshot || snapshotsEqual(snapshot, confirmed.snapshot))
      return true;
    const settledWrite = await writeSnapshot(snapshot, confirmed.version);
    return settledWrite.isSaved;
  }, [snapshot, hasSaveConflict, writeSnapshot]);

  /** A conflict reload discards whatever this tab had on the wire. */
  const forgetSnapshotInFlight = useCallback(() => {
    inFlightSnapshotRef.current = null;
  }, []);

  return {
    inFlightSnapshotRef,
    confirmedWriteRef,
    writeSnapshot,
    saveBeforeLeaving,
    forgetSnapshotInFlight,
  };
}
