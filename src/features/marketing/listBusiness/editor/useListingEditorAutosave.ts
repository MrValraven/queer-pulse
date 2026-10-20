import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStorageScope } from "../../../../app/providers/useStorageScope";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  CreatorDraftConflict,
  CreatorDraftResponse,
} from "../../../creatorDrafts/api/creatorDrafts.types";
import {
  useCreatorDraftAutosave,
  type CreatorDraftSaveStatus,
} from "../../../creatorDrafts/api/useCreatorDraftAutosave";
import {
  readLegacyListingEditDraft,
  removeLegacyListingEditDraft,
} from "../../../creatorDrafts/legacyCreatorDraftStorage";
import type { ListingDraft, MissingField } from "../listBusiness.data";
import { listingEditMissingCodes } from "./listingEditMissingCodes";
import { comparableDraft } from "./restoreDiff/listingDraftComparable";

/**
 * Autosave for the OWNER EDITOR, kept apart from the create flow's draft slot.
 *
 * `useListingDraft` is switched off in edit mode on purpose: its live half
 * writes to `POST /listing-drafts`, which is the store of listings that have
 * never been submitted. An edit of a listing that is already published is not
 * one of those, so it goes to its own creator draft slot,
 * `listing_edit/<listingRef>`, through the shared creator draft engine. The
 * server keys that slot per member, so a shared browser never hands one
 * owner's unsaved wording to the next. Our team can see the draft (the save
 * bar says so).
 *
 * Nothing is ever restored on its own. The stored copy is offered, and the
 * owner chooses: the listing on screen stays exactly what the server returned
 * until they press restore. A copy the old browser-only autosave left behind
 * is offered the same way once, and its local key goes as soon as the first
 * save after restoring it lands on the server.
 */

interface StoredEditDraft {
  draft: ListingDraft;
  /** Epoch millis of the last save. */
  savedAt: number;
  /** Fingerprint of the SERVER version this copy was edited on top of.
   *  Compared against the server version showing now, so a restore that would
   *  paper over a change made elsewhere can say so before it happens. */
  baseline: string;
}

/** True when a stored payload holds a listing edit this editor can restore. */
export function isListingEditPayload(
  payload: Record<string, unknown>,
): boolean {
  const { draft, baseline } = payload as {
    draft?: unknown;
    baseline?: unknown;
  };
  return (
    typeof baseline === "string" && typeof draft === "object" && draft !== null
  );
}

/** The listing edit inside a stored creator draft, or null for any other shape. */
function serverEditDraftOf(
  serverDraft: CreatorDraftResponse | null,
): StoredEditDraft | null {
  if (serverDraft === null || !isListingEditPayload(serverDraft.payload))
    return null;
  const { draft, baseline } = serverDraft.payload as {
    draft: ListingDraft;
    baseline: string;
  };
  const savedAt = Date.parse(serverDraft.savedAt);
  return {
    draft,
    savedAt: Number.isNaN(savedAt) ? Date.now() : savedAt,
    baseline,
  };
}

/**
 * Small, stable fingerprint of what a draft SAYS. Only ever compared for
 * equality, so a djb2 hash is plenty and keeps the stored payload from
 * doubling in size.
 *
 * Hashed from `comparableDraft`, which drops the client-only row ids. Those
 * ids come from module counters and change on every mount, so hashing the raw
 * draft made an unchanged listing look changed: it offered a restore banner
 * with nothing in it, and claimed the server copy was "updated since" after
 * every remount.
 */
export function fingerprint(draft: ListingDraft): string {
  const serialized = JSON.stringify(comparableDraft(draft));
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
  /** A stored copy worth offering, or null when there is nothing to restore. */
  restorable: RestorableEditDraft | null;
  /** Stop offering it and keep it stored (the owner restored it, or is
   *  ignoring the banner for now and may still want it after a reload). */
  dismissRestorable: () => void;
  /** Throw the stored copy away. */
  discardRestorable: () => void;
  /** The full save landed: sending stops and the server draft goes. */
  clearAutosave: () => void;
}

/**
 * What the full editor reads: the restore contract above plus the server
 * draft's save state and its 409 choice. Kept as its own interface so the
 * restore review keeps taking the four fields it uses.
 */
export interface ListingEditorDraftAutosave extends ListingEditorAutosave {
  status: CreatorDraftSaveStatus;
  conflict: CreatorDraftConflict | null;
  isConflictBusy: boolean;
  /** Fetches the newer copy and puts it into the form. */
  loadNewer: () => void;
  keepThisVersion: () => void;
  /** The listing itself was deleted: drop the draft with no request, since
   *  the server clears a draft whose listing is gone. */
  forgetAutosave: () => void;
}

/** The offer a stored copy is worth making, or null. A copy identical to what
 *  the server already has is not worth offering. */
function offerFrom(
  candidate: StoredEditDraft | null,
  serverFingerprint: string,
): RestorableEditDraft | null {
  if (!candidate) return null;
  if (fingerprint(candidate.draft) === serverFingerprint) return null;
  return {
    draft: candidate.draft,
    savedAt: candidate.savedAt,
    hasServerChanged: candidate.baseline !== serverFingerprint,
  };
}

interface InspectedSources {
  serverDraft: CreatorDraftResponse | null;
  scopeId: string | null;
}

/**
 * The restore offer, snapshot from the server draft (or, when the server has
 * none, the old browser-only copy) and held in state, so pressing restore
 * always brings back the copy the banner was describing. Declared before the
 * engine, so sending can wait on the first inspection.
 */
function useRestorableOfferState() {
  const [restorable, setRestorable] = useState<RestorableEditDraft | null>(
    null,
  );
  const [isOfferLegacy, setIsOfferLegacy] = useState(false);
  const [inspected, setInspected] = useState<InspectedSources | null>(null);
  // The offer arrived after the owner had started typing, so a save now would
  // write over the stored copy before they chose what to do with it.
  const [isOfferLate, setIsOfferLate] = useState(false);
  return {
    restorable,
    setRestorable,
    isOfferLegacy,
    setIsOfferLegacy,
    inspected,
    setInspected,
    isOfferLate,
    setIsOfferLate,
  };
}

type RestorableOfferState = ReturnType<typeof useRestorableOfferState>;

/**
 * Reads the offer from the settled sources, with React's "adjust state while
 * rendering" pattern so it lands in the same commit and never flashes an
 * empty banner slot. The server read and the member scope both resolve a beat
 * after mount: the first settled read is always inspected, even when the owner
 * typed before it arrived, and later changes are read again until the owner
 * starts editing.
 */
function inspectRestorableOffer(
  offer: RestorableOfferState,
  {
    listingRef,
    scopeId,
    serverDraft,
    isServerDraftLoading,
    hasEdited,
    serverFingerprint,
  }: {
    listingRef: string;
    scopeId: string | null;
    serverDraft: CreatorDraftResponse | null;
    isServerDraftLoading: boolean;
    hasEdited: boolean;
    serverFingerprint: string;
  },
) {
  if (isServerDraftLoading) return;
  const { inspected } = offer;
  const isFirstInspection = inspected === null;
  const hasSourcesChanged =
    isFirstInspection ||
    inspected.serverDraft !== serverDraft ||
    inspected.scopeId !== scopeId;
  if (!isFirstInspection && (hasEdited || !hasSourcesChanged)) return;
  offer.setInspected({ serverDraft, scopeId });
  const serverEdit = serverEditDraftOf(serverDraft);
  const legacyEdit =
    serverEdit === null
      ? readLegacyListingEditDraft(listingRef, scopeId)
      : null;
  offer.setRestorable(offerFrom(serverEdit ?? legacyEdit, serverFingerprint));
  offer.setIsOfferLegacy(serverEdit === null && legacyEdit !== null);
  offer.setIsOfferLate(hasEdited);
}

/** Where a pending legacy removal stands: a save already out at the restore
 *  settles first, then a save has to start and then land. */
type LegacyRemovalPhase = "awaitingInFlightSave" | "awaitingSave" | "saving";

/**
 * Removes the old browser-only copy once the first server save that starts
 * after its restore lands. A save already on the wire at the restore carries
 * the older edit, so its answer never counts.
 */
function useLegacyRemovalAfterSave(
  listingRef: string,
  scopeId: string | null,
  status: CreatorDraftSaveStatus,
) {
  const phaseRef = useRef<LegacyRemovalPhase | null>(null);
  const statusKind = status.kind;
  const savedAt = status.kind === "saved" ? status.savedAt : null;
  useEffect(() => {
    const phase = phaseRef.current;
    if (phase === null) return;
    if (phase === "awaitingInFlightSave") {
      if (statusKind !== "saving") phaseRef.current = "awaitingSave";
      return;
    }
    if (phase === "awaitingSave") {
      if (statusKind === "saving") phaseRef.current = "saving";
      return;
    }
    if (statusKind !== "saved") return;
    phaseRef.current = null;
    removeLegacyListingEditDraft(listingRef, scopeId);
  }, [listingRef, scopeId, statusKind, savedAt]);
  const markPending = useCallback(() => {
    phaseRef.current =
      statusKind === "saving" ? "awaitingInFlightSave" : "awaitingSave";
  }, [statusKind]);
  /** The local key goes now, so nothing waits on a save any more. */
  const removeNow = useCallback(() => {
    phaseRef.current = null;
    removeLegacyListingEditDraft(listingRef, scopeId);
  }, [listingRef, scopeId]);
  return { markPending, removeNow };
}

export function useListingEditorAutosave({
  listingRef,
  draft,
  initialDraft,
  isDirty,
  missing,
  applyDraft,
}: {
  listingRef: string;
  draft: ListingDraft;
  /** What the server returned when the editor mounted. */
  initialDraft: ListingDraft;
  isDirty: boolean;
  /** The editor's still-missing fields; staff see the public ones. */
  missing?: MissingField[];
  /** Puts a draft into the form (Load the newer draft). */
  applyDraft: (nextDraft: ListingDraft) => void;
}): ListingEditorDraftAutosave {
  const scopeId = useStorageScope();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const serverFingerprint = useMemo(
    () => fingerprint(initialDraft),
    [initialDraft],
  );

  // Only start saving once the owner has actually changed something, so
  // merely opening the editor never replaces a copy that is still offered.
  const [hasEdited, setHasEdited] = useState(false);
  if (isDirty && !hasEdited) setHasEdited(true);

  // The draft on screen when the full save landed. Sending stays off while it
  // is still the draft on screen, so nothing re-saves the edit on the way out;
  // a later change starts a new draft.
  const [suspendedAtDraft, setSuspendedAtDraft] = useState<ListingDraft | null>(
    null,
  );
  const isSuspended = suspendedAtDraft === draft;

  const payload = useMemo(
    () =>
      !isSuspended && hasEdited && isDirty
        ? { draft, baseline: serverFingerprint }
        : null,
    [isSuspended, hasEdited, isDirty, draft, serverFingerprint],
  );
  const missingCodes = useMemo(
    () => listingEditMissingCodes(missing ?? []),
    [missing],
  );
  const offer = useRestorableOfferState();
  // Sending waits for the first server read to be inspected, and stays off
  // while an offer that arrived after the first keystroke is still open, so
  // early typing never replaces a stored copy the owner has not seen.
  const isLateOfferOpen = offer.isOfferLate && offer.restorable !== null;
  const autosave = useCreatorDraftAutosave({
    slot: { kind: "listing_edit", listingRef },
    payload,
    progress: null,
    missing: missingCodes,
    isEnabled: !isSuspended && offer.inspected !== null && !isLateOfferOpen,
  });
  const { discard, forget, keepThisVersion } = autosave;
  const loadNewerDraft = autosave.loadNewer;

  inspectRestorableOffer(offer, {
    listingRef,
    scopeId,
    serverDraft: autosave.serverDraft,
    isServerDraftLoading: autosave.isServerDraftLoading,
    hasEdited,
    serverFingerprint,
  });
  const { restorable, setRestorable, isOfferLegacy, setIsOfferLegacy } = offer;
  const legacyRemoval = useLegacyRemovalAfterSave(
    listingRef,
    scopeId,
    autosave.status,
  );
  const markLegacyRemovalPending = legacyRemoval.markPending;
  const removeLegacyNow = legacyRemoval.removeNow;

  const dismissRestorable = useCallback(() => {
    if (isOfferLegacy) markLegacyRemovalPending();
    setRestorable(null);
  }, [isOfferLegacy, markLegacyRemovalPending, setRestorable]);

  const discardRestorable = useCallback(() => {
    const discardedOffer = restorable;
    setRestorable(null);
    setIsOfferLegacy(false);
    removeLegacyNow();
    // Once the owner has typed, the server slot holds that new typing (or
    // soon will), so only the offer goes.
    if (hasEdited && isDirty) return;
    setHasEdited(false);
    discard().catch(() => {
      // The server copy stays, so the banner offers it again for another try.
      showToast(
        t("marketing:listBusiness.editor.restore.discardError"),
        "error",
      );
      setRestorable(discardedOffer);
    });
  }, [
    restorable,
    setRestorable,
    setIsOfferLegacy,
    removeLegacyNow,
    hasEdited,
    isDirty,
    discard,
    showToast,
    t,
  ]);

  const clearAutosave = useCallback(() => {
    setHasEdited(false);
    setRestorable(null);
    setSuspendedAtDraft(draft);
    removeLegacyNow();
    // The quick edit modal shares PATCH /listings/:ref, so the server keeps
    // the draft through a save and the full editor deletes its own.
    discard().catch(() => {
      showToast(t("marketing:listBusiness.editor.draftClearError"), "error");
    });
  }, [draft, setRestorable, removeLegacyNow, discard, showToast, t]);

  const forgetAutosave = useCallback(() => {
    setHasEdited(false);
    setRestorable(null);
    setSuspendedAtDraft(draft);
    removeLegacyNow();
    forget();
  }, [draft, setRestorable, removeLegacyNow, forget]);

  // The owner chose the other tab's copy, so it goes straight into the form
  // and the engine saves the next change on its revision. An emptied slot
  // keeps the edit as typed, and so does a copy of a shape this editor cannot
  // read: the engine then keeps the 409 pause and resolves null.
  const loadNewer = useCallback(() => {
    // A failed read keeps the pause, so the strip stays to choose again.
    loadNewerDraft({ isReadable: isListingEditPayload })
      .then((newerDraft) => {
        const newerEdit = serverEditDraftOf(newerDraft);
        if (newerEdit === null) return;
        setRestorable(null);
        setIsOfferLegacy(false);
        removeLegacyNow();
        applyDraft(newerEdit.draft);
      })
      .catch(() => undefined);
  }, [
    loadNewerDraft,
    applyDraft,
    setRestorable,
    setIsOfferLegacy,
    removeLegacyNow,
  ]);

  return {
    restorable,
    dismissRestorable,
    discardRestorable,
    clearAutosave,
    status: autosave.status,
    conflict: autosave.conflict,
    isConflictBusy: autosave.isConflictBusy,
    loadNewer,
    keepThisVersion,
    forgetAutosave,
  };
}
