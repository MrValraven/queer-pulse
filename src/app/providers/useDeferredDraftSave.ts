import { useCallback, useEffect, useRef } from "react";
import { useProfileEdit, type ProfileDraft } from "./useProfile";

/** A patch handed to `updateDraft`, what those keys held before it (to undo a
 *  failed or abandoned save), and whether `save()` has started for it (so the
 *  effect never fires twice for one patch, and the belt below never mistakes
 *  in-flight for silently-never-applied). */
interface PendingDraftSave {
  patch: Partial<ProfileDraft>;
  previous: Partial<ProfileDraft>;
  hasStarted: boolean;
}

/** What a call site wants to happen around the save itself. Every one is
 *  optional: the revert on failure and the pending bookkeeping are the
 *  primitive's job, and a site that only needs those passes nothing. */
export interface DeferredDraftSaveHandlers {
  /** The save succeeded. */
  onSaved?: () => void;
  /** The save failed AND the patch has already been reverted off the shared
   *  draft. Surface it to the member here. */
  onFailed?: () => void;
  /**
   * The patch never reached the draft, so no save was ever started and the
   * record has been dropped. Happens when the provider re-seeds in the same
   * batch and wins, discarding the patch. Nothing was persisted and nothing
   * needs reverting, but the member asked for a change that did not happen.
   */
  onPatchLost?: () => void;
}

/**
 * Patch the shared profile draft and persist it immediately, without entering
 * the full edit session behind `ProfileEditBar`'s Save button. Behind the
 * "takes effect right away" controls: the profile rail's 24h self-hide, the
 * "Who sees what" visibility switches and presets, and the Now card's modal.
 *
 * WHY A PATCH CANNOT JUST BE FOLLOWED BY `save()`
 *
 * `useProfileEdit().save` is a `useCallback` closed over the draft at render
 * time (see `useProfileDraftState.ts`), so calling it in the same tick as
 * `updateDraft()` ships the PRE-patch draft: React has not re-rendered between
 * the two calls. The persist has to wait for a later render.
 *
 * WHY IT WAITS ON THE DRAFT, NOT ON `save`'s IDENTITY
 *
 * The obvious wait is an effect keyed on `save`, on the theory that `save`
 * only takes a new identity once the provider has committed the patch. That
 * theory is false, and both of this hook's original call sites shipped it.
 * `save`'s dependencies include `t`, which `I18nProvider` memoises on
 * `loadedNamespaces`, and that provider background-prefetches roughly thirty
 * lazy EN namespaces after first paint. So `save` takes a new identity dozens
 * of times over the app's early life for reasons that have nothing to do with
 * the draft, and an effect keyed on it alone can fire on any of those commits
 * with the draft still unpatched. `save()` then persists the unpatched draft:
 * the control shows the new value, and nothing is stored.
 *
 * Gating on the draft CONTENT instead is the actual signal. A render where
 * `draft` carries the patch is necessarily a render where `save` was rebuilt
 * from that patched draft, so the content gate implies the identity gate and
 * cannot fire early.
 *
 * WHAT ELSE IT OWNS
 *
 * A failed or abandoned save must not leave its patch in the SHARED draft, or
 * the next save from ANY surface ships it too, so `previous` is restored via
 * `updateDraft` on a rejected `save()` and, if the caller unmounts BEFORE that
 * save ever started, from the unmount cleanup. A save already in flight when
 * the caller unmounts is left alone: it owns its own outcome via the supersede
 * guard either way, and reverting it too would race a PATCH that later
 * succeeds and commits against the draft the cleanup just erased.
 *
 * A second patch arriving while one is still pending is dropped rather than
 * queued: it would recompute `previous` from the already-patched draft, making
 * a later revert a no-op, and orphan the first record.
 *
 * @param handlers Read fresh at the moment each is called, so a call site can
 *   pass inline closures over current props and state without re-running (or
 *   having to stabilise) anything.
 * @returns Stage `patch` on the shared draft and persist it as soon as the
 *   draft carries it.
 */
export function useDeferredDraftSave(
  handlers: DeferredDraftSaveHandlers = {},
): (patch: Partial<ProfileDraft>) => void {
  const { draft, updateDraft, save } = useProfileEdit();
  const pending = useRef<PendingDraftSave | null>(null);
  const latestHandlers = useRef(handlers);

  // Declared before the effect that reads it, so a commit that both rebuilds
  // the handlers and lands the patch starts the save against the new ones.
  useEffect(() => {
    latestHandlers.current = handlers;
  });

  useEffect(() => {
    const current = pending.current;
    if (!current || current.hasStarted) return;
    const isPatchApplied = (
      Object.keys(current.patch) as (keyof ProfileDraft)[]
    ).every((key) => draft[key] === current.patch[key]);
    if (!isPatchApplied) return;
    current.hasStarted = true;
    void (async () => {
      const hasSaved = await save();
      // Already reverted by the unmount cleanup, or superseded.
      if (pending.current !== current) return;
      pending.current = null;
      if (hasSaved) {
        latestHandlers.current.onSaved?.();
        return;
      }
      updateDraft(current.previous);
      latestHandlers.current.onFailed?.();
    })();
  }, [draft, save, updateDraft]);

  useEffect(() => {
    return () => {
      if (pending.current && !pending.current.hasStarted) {
        updateDraft(pending.current.previous);
        pending.current = null;
      }
    };
  }, [updateDraft]);

  return useCallback(
    (patch: Partial<ProfileDraft>) => {
      if (pending.current) return;
      const previous = Object.fromEntries(
        (Object.keys(patch) as (keyof ProfileDraft)[]).map((key) => [
          key,
          draft[key],
        ]),
      ) as Partial<ProfileDraft>;
      const record: PendingDraftSave = { patch, previous, hasStarted: false };
      pending.current = record;
      updateDraft(patch);
      // Belt: if the provider's re-seed batches in and wins, `draft` never
      // carries this patch and the effect above never starts. Drop an
      // unclaimed record after a tick, so it cannot block every later patch
      // behind the pending guard, and say so. One already started is left be.
      setTimeout(() => {
        if (pending.current !== record || record.hasStarted) return;
        pending.current = null;
        latestHandlers.current.onPatchLost?.();
      }, 0);
    },
    [draft, updateDraft],
  );
}
