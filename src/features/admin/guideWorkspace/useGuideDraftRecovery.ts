import { useCallback, useEffect, useState } from "react";
import { isDraftDirty, rekeyDraft, type GuideDraft } from "./guideDraft";
import {
  readStoredGuideDraft,
  removeStoredGuideDraft,
  writeStoredGuideDraft,
} from "./guideDraftStorage";
import { GUIDE_DRAFT_WRITE_DELAY_MS } from "./guideWorkspace.data";

export interface PendingGuideRecovery {
  storedAt: string;
  /** The guide was saved after this copy was written. */
  isOlderBase: boolean;
  draft: GuideDraft;
}

export interface GuideDraftRecovery {
  pending: PendingGuideRecovery | null;
  restore: () => GuideDraft | null;
  discard: () => void;
  clear: () => void;
}

/**
 * Keeps unsaved work in this browser. While dirty, the draft is written
 * `GUIDE_DRAFT_WRITE_DELAY_MS` after the last change. On open, a stored copy
 * that differs from the loaded guide becomes `pending` for the banner, and
 * nothing overwrites it until the editor restores or discards it.
 */
export function useGuideDraftRecovery({
  storageKey,
  draft,
  cleanDraft,
  isDirty,
  baseUpdatedAt,
}: {
  storageKey: string;
  draft: GuideDraft;
  cleanDraft: GuideDraft;
  isDirty: boolean;
  baseUpdatedAt: string | null;
}): GuideDraftRecovery {
  const [pending, setPending] = useState<PendingGuideRecovery | null>(() => {
    const stored = readStoredGuideDraft(storageKey);
    if (!stored) return null;
    try {
      if (!isDraftDirty(stored.draft, cleanDraft)) return null;
    } catch {
      // A copy stored in an older draft shape: open without a recovery banner.
      return null;
    }
    return {
      storedAt: stored.storedAt,
      isOlderBase: stored.baseUpdatedAt !== baseUpdatedAt,
      draft: stored.draft,
    };
  });
  const hasPending = pending !== null;

  useEffect(() => {
    if (hasPending || !isDirty) return;
    const timer = window.setTimeout(() => {
      writeStoredGuideDraft(storageKey, {
        storedAt: new Date().toISOString(),
        baseUpdatedAt,
        draft,
      });
    }, GUIDE_DRAFT_WRITE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [draft, isDirty, hasPending, storageKey, baseUpdatedAt]);

  const restore = useCallback(() => {
    if (!pending) return null;
    setPending(null);
    return rekeyDraft(pending.draft);
  }, [pending]);

  const discard = useCallback(() => {
    removeStoredGuideDraft(storageKey);
    setPending(null);
  }, [storageKey]);

  const clear = useCallback(
    () => removeStoredGuideDraft(storageKey),
    [storageKey],
  );

  return { pending, restore, discard, clear };
}
