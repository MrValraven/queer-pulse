import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import type { ListingDraft } from "./listBusiness.data";
import { saveListingDraft, deleteListingDraft } from "./api/listingDrafts.api";
import { LISTING_DRAFTS_KEY } from "./api/useListingDrafts";

/** Demo-only single-draft slot. Live drafts live server-side (multiple), keyed
 *  per member — see `api/listingDrafts.api.ts`. In demo the storage scope is a
 *  single fixed persona, so the original un-suffixed key is correct (matching
 *  the `useScopedLocalStorage` "demo" contract); a real per-user bucket only
 *  exists in live, where we never touch localStorage at all. */
const DEMO_KEY = "qp-listing-draft-v2";
const AUTOSAVE_MS = 600;

export interface StoredDraft {
  draft: ListingDraft;
  step: number;
  savedAt: number;
}

/** Read the demo localStorage draft, if any. Exported so the landing drafts
 *  panel can show it without re-implementing the parse. */
export function readDemoDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

/** Discard the demo localStorage draft. */
export function clearDemoDraft(): void {
  try {
    localStorage.removeItem(DEMO_KEY);
  } catch {
    /* storage unavailable — ignore in the prototype */
  }
}

export interface UseListingDraftOptions {
  /** Autosave on/off. Off in edit mode so an owner editing a live listing never
   *  touches the create-draft slot. Default `true`. */
  enabled?: boolean;
  /** Read the persisted demo draft for the in-wizard resume banner. Off once a
   *  draft has already been resumed (landing list / `?draft` deep link), so the
   *  wizard doesn't offer to resume the draft it's already showing. Default
   *  `true`. Live resume is the landing list, never this banner. */
  offerResume?: boolean;
  /** Live: the id of the draft row this wizard is resuming, so autosave upserts
   *  that same row rather than minting a duplicate. */
  initialDraftId?: string;
}

export interface UseListingDraftResult {
  /** Demo snapshot for the in-wizard resume banner; always `null` in live. */
  saved: StoredDraft | null;
  /** Timestamp of the last successful save, for the "Draft saved" chip. */
  savedAt: number | null;
  /** Discard the current draft (demo: clear localStorage; live: delete the row). */
  clearDraft: () => void;
  /** Persist immediately, resolving `true` on success — the "Save & finish
   *  later" affordance awaits this before leaving. */
  saveAndExit: () => Promise<boolean>;
}

/**
 * Dual-mode autosave/resume for the list-a-business wizard.
 *
 * - DEMO keeps the original single localStorage draft (byte-for-byte the old
 *   behaviour) and offers the in-wizard resume banner.
 * - LIVE debounce-autosaves the draft to `POST /listing-drafts` (supporting
 *   MULTIPLE cross-device drafts), remembers the server id so subsequent saves
 *   upsert the same row, and deletes it on submit/discard. The demo never hits
 *   the network.
 */
export function useListingDraft(
  draft: ListingDraft,
  step: number,
  options: UseListingDraftOptions = {},
): UseListingDraftResult {
  const { enabled = true, offerResume = true, initialDraftId } = options;
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();

  const demoAutosaveOn = enabled && demoMode;
  const liveAutosaveOn = enabled && !demoMode && loggedIn;

  // Demo resume snapshot — read once at mount (demo only, when offering resume).
  const [saved] = useState<StoredDraft | null>(() =>
    demoAutosaveOn && offerResume ? readDemoDraft() : null,
  );
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Live: the server draft-row id we keep upserting into (seeded from a resume).
  const liveDraftId = useRef<string | undefined>(initialDraftId);
  // Single-flight guard for the FIRST create so two concurrent saves (a debounced
  // autosave racing `saveAndExit`) don't both POST id-less and mint two rows.
  const createInFlight = useRef<Promise<string> | null>(null);
  // Bumped by `clearDraft` (submit/discard). A create that resolves after a bump
  // belongs to a draft that's already gone, so it's deleted, not adopted —
  // preventing a late autosave from resurrecting a just-deleted row.
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't autosave until the member has actually started (a path is chosen).
  const started = draft.path !== "";

  /** The persistence primitive shared by the debounced autosave and the
   *  explicit `saveAndExit`. Returns whether the write succeeded. Best-effort in
   *  demo (storage may be blocked) and live (network may be down); both swallow
   *  their own failure so autosave never toasts. */
  const persist = useCallback(async (): Promise<boolean> => {
    const stamp = Date.now();
    if (demoAutosaveOn) {
      try {
        localStorage.setItem(
          DEMO_KEY,
          JSON.stringify({ draft, step, savedAt: stamp }),
        );
        setSavedAt(stamp);
        return true;
      } catch {
        return false;
      }
    }
    if (liveAutosaveOn) {
      const gen = generation.current;
      try {
        // Existing row (seeded resume, or an already-created draft) → plain upsert.
        if (liveDraftId.current) {
          await saveListingDraft({ draft, step }, liveDraftId.current);
          setSavedAt(stamp);
          return true;
        }
        // A create is already running → wait for its id, then upsert that row
        // instead of starting a second create.
        if (createInFlight.current) {
          const existingId = await createInFlight.current;
          if (gen !== generation.current) return false; // cleared meanwhile
          await saveListingDraft({ draft, step }, existingId);
          setSavedAt(stamp);
          return true;
        }
        // First create — single-flight it so concurrent saves reuse this id.
        const createPromise = saveListingDraft({ draft, step }, undefined).then(
          (result) => result.id,
        );
        createInFlight.current = createPromise;
        let newId: string;
        try {
          newId = await createPromise;
        } finally {
          if (createInFlight.current === createPromise)
            createInFlight.current = null;
        }
        if (gen !== generation.current) {
          // The draft was submitted/discarded while this create was in flight —
          // don't adopt the orphaned row; delete it so it never lingers.
          void deleteListingDraft(newId).catch(() => {});
          return false;
        }
        liveDraftId.current = newId;
        setSavedAt(stamp);
        // A freshly-minted row should appear in the landing list next time it
        // mounts — mark it stale (no observers here, so this won't refetch now).
        void queryClient.invalidateQueries({ queryKey: LISTING_DRAFTS_KEY });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [demoAutosaveOn, liveAutosaveOn, draft, step, queryClient]);

  useEffect(() => {
    if (!started || (!demoAutosaveOn && !liveAutosaveOn)) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void persist(), AUTOSAVE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [persist, started, demoAutosaveOn, liveAutosaveOn]);

  const clearDraft = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    // Invalidate any in-flight create: its late-resolving row is orphaned, not
    // adopted (see `persist`), so a stray autosave can't resurrect this draft.
    generation.current += 1;
    createInFlight.current = null;
    if (demoMode) clearDemoDraft();
    else if (liveDraftId.current) {
      const id = liveDraftId.current;
      liveDraftId.current = undefined;
      void deleteListingDraft(id)
        .then(() =>
          queryClient.invalidateQueries({ queryKey: LISTING_DRAFTS_KEY }),
        )
        .catch(() => {});
    }
    setSavedAt(null);
  }, [demoMode, queryClient]);

  const saveAndExit = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    if (!started) return true; // nothing meaningful to persist yet
    return persist();
  }, [persist, started]);

  return { saved, savedAt, clearDraft, saveAndExit };
}
