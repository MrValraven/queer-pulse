import { useCallback, useEffect, useState } from "react";
import { useScopedLocalStorage } from "../../../../app/providers/useScopedLocalStorage";
import { useStorageScope } from "../../../../app/providers/useStorageScope";
import type { ListingDraft } from "../listBusiness.data";

/**
 * Local autosave for the OWNER EDITOR, deliberately separate from the create
 * flow's draft slot.
 *
 * `useListingDraft` is switched off in edit mode on purpose: its live half
 * writes to `POST /listing-drafts`, which is the store of listings that have
 * never been submitted. An edit of a listing that is already published is not
 * one of those, and putting it there would make an owner's half-finished
 * wording show up in "your saved drafts" as if it were a new business waiting
 * to be sent. So this keeps the whole thing on the member's own device.
 *
 * The stored copy is keyed per listing ref AND per signed-in member (through
 * `useScopedLocalStorage`), so two listings never share a slot and a shared
 * browser never hands one owner's unsaved wording to the next.
 *
 * Nothing is ever restored on its own. The stored copy is offered, and the
 * owner chooses: the listing on screen stays exactly what the server returned
 * until they press restore.
 */

/** Base key; the listing ref and the member scope are appended to it. */
const BASE_KEY = "qp-listing-edit-draft.v1";
const AUTOSAVE_MS = 800;

interface StoredEditDraft {
  draft: ListingDraft;
  /** Epoch millis of the last local write. */
  savedAt: number;
  /** Fingerprint of the SERVER version this local copy was edited on top of.
   *  Compared against the server version showing now, so a restore that would
   *  paper over a change made elsewhere can say so before it happens. */
  baseline: string;
}

function isStoredEditDraft(value: unknown): value is StoredEditDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.savedAt === "number" &&
    typeof record.baseline === "string" &&
    Boolean(record.draft) &&
    typeof record.draft === "object"
  );
}

/** Small, stable fingerprint of a draft. Only ever compared for equality, so a
 *  djb2 hash is plenty and keeps the stored payload from doubling in size. */
function fingerprint(draft: ListingDraft): string {
  const serialized = JSON.stringify(draft);
  let hash = 5381;
  for (let index = 0; index < serialized.length; index += 1) {
    hash = ((hash << 5) + hash + serialized.charCodeAt(index)) | 0;
  }
  return `${serialized.length}.${(hash >>> 0).toString(36)}`;
}

export interface RestorableEditDraft {
  draft: ListingDraft;
  savedAt: number;
  /** The server's copy changed after this local one was written, so restoring
   *  would replace newer published wording with older local wording. */
  hasServerChanged: boolean;
}

export interface ListingEditorAutosave {
  /** A local copy worth offering, or null when there is nothing to restore. */
  restorable: RestorableEditDraft | null;
  /** Stop offering it, keep it on disk (the owner restored it, or is ignoring
   *  the banner for now and may still want it after a reload). */
  dismissRestorable: () => void;
  /** Throw the local copy away. */
  discardRestorable: () => void;
  /** Wipe the slot after the edit has actually reached the server. */
  clearAutosave: () => void;
}

export function useListingEditorAutosave({
  listingRef,
  draft,
  initialDraft,
  isDirty,
}: {
  listingRef: string;
  draft: ListingDraft;
  /** What the server returned when the editor mounted. */
  initialDraft: ListingDraft;
  isDirty: boolean;
}): ListingEditorAutosave {
  const scopeId = useStorageScope();
  const [stored, setStored] = useScopedLocalStorage<StoredEditDraft | null>(
    `${BASE_KEY}.${listingRef}`,
    scopeId,
    null,
    (value): value is StoredEditDraft | null =>
      value === null || isStoredEditDraft(value),
  );

  const serverFingerprint = fingerprint(initialDraft);

  /** The offer a stored copy is worth making, or null. A copy identical to
   *  what the server already has is not worth offering, and a copy from
   *  another listing or another member never reaches this key at all. */
  const offerFrom = (
    candidate: StoredEditDraft | null,
  ): RestorableEditDraft | null => {
    if (!candidate) return null;
    if (fingerprint(candidate.draft) === serverFingerprint) return null;
    return {
      draft: candidate.draft,
      savedAt: candidate.savedAt,
      hasServerChanged: candidate.baseline !== serverFingerprint,
    };
  };

  // Only start writing once the owner has actually changed something, so
  // merely opening the editor never clears a copy that is still being offered.
  // Latched in state rather than a ref: turning it back off has to re-run the
  // autosave effect, which is what cancels a write still waiting on its timer.
  const [hasEdited, setHasEdited] = useState(false);
  if (isDirty && !hasEdited) setHasEdited(true);

  // Snapshot the offer BEFORE autosave gets a chance to touch the slot, and
  // hold it in state: the offered draft then survives every later autosave, so
  // pressing restore always brings back the copy the banner was describing.
  const [restorable, setRestorable] = useState<RestorableEditDraft | null>(() =>
    offerFrom(stored),
  );

  // The member scope resolves a beat after mount on a cold load (the session
  // is still being checked), and only then does the real bucket become
  // readable. Re-read the offer when the stored value first arrives, using
  // React's "adjust state while rendering" pattern so it lands in the same
  // commit rather than flashing an empty banner slot.
  const [inspected, setInspected] = useState(stored);
  if (inspected !== stored && !hasEdited) {
    setInspected(stored);
    setRestorable(offerFrom(stored));
  }

  useEffect(() => {
    // A save or a discard put this back to false, and this effect re-running is
    // what cancels the write that was still waiting on its timer.
    if (!hasEdited) return;
    const timer = setTimeout(() => {
      // Back to exactly what the server has: there is nothing unsaved left to
      // rescue, so the slot goes rather than holding a redundant copy.
      setStored(
        isDirty
          ? { draft, savedAt: Date.now(), baseline: serverFingerprint }
          : null,
      );
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [draft, isDirty, hasEdited, serverFingerprint, setStored]);

  const dismissRestorable = useCallback(() => setRestorable(null), []);

  const discardRestorable = useCallback(() => {
    setHasEdited(false);
    setRestorable(null);
    setStored(null);
  }, [setStored]);

  const clearAutosave = useCallback(() => {
    setHasEdited(false);
    setRestorable(null);
    setStored(null);
  }, [setStored]);

  return {
    restorable,
    dismissRestorable,
    discardRestorable,
    clearAutosave,
  };
}
