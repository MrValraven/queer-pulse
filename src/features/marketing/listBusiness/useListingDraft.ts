import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
  type CauseErrorCopy,
} from "../../../shared/api/causeErrorKey";
import type { ListingDraft } from "./listBusiness.data";
import {
  saveListingDraft,
  saveListingDraftKeepalive,
  deleteListingDraft,
} from "./api/listingDrafts.api";
import { LISTING_DRAFTS_KEY } from "./api/useListingDrafts";

/** Demo-only single-draft slot. Live drafts live server-side (multiple), keyed
 *  per member (see `api/listingDrafts.api.ts`). In demo the storage scope is a
 *  single fixed persona, so the original un-suffixed key is correct (matching
 *  the `useScopedLocalStorage` "demo" contract); a real per-user bucket only
 *  exists in live, where we never touch localStorage at all. */
const DEMO_KEY = "qp-listing-draft-v2";
const AUTOSAVE_MS = 600;

interface PersistOptions {
  /** Send the live save so it outlives a closing page. */
  keepalive?: boolean;
}

export interface StoredDraft {
  draft: ListingDraft;
  step: number;
  savedAt: number;
}

/** Read the demo localStorage draft, if any. Exported so the Continue screen,
 *  the `?continue=demo` link and the directory CTA share one parse. */
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
    /* storage unavailable: ignore in the prototype */
  }
}

export interface UseListingDraftOptions {
  /** Autosave on/off. Off in edit mode so an owner editing a live listing never
   *  touches the create-draft slot. Default `true`. */
  enabled?: boolean;
  /** Live: the id of the draft row this wizard is resuming, so autosave upserts
   *  that same row and never mints a duplicate. */
  initialDraftId?: string;
}

/**
 * How an explicit draft save ended. A failure carries the cause line to show
 * (offline, signed out, rate limited, a blocked browser store, a draft that was
 * submitted while it saved), so "Save and finish later" can say why.
 */
export type ListingDraftSaveResult =
  { isSaved: true } | { isSaved: false; cause: CauseErrorCopy };

const DRAFT_STORAGE_BLOCKED: CauseErrorCopy = {
  key: "marketing:listBusiness.saveLater.cause.storage",
};
const DRAFT_ALREADY_CLEARED: CauseErrorCopy = {
  key: "marketing:listBusiness.saveLater.cause.superseded",
};
const DRAFT_SIGNED_OUT: CauseErrorCopy = { key: SHARED_CAUSE_KEY.signedOut };

export interface UseListingDraftResult {
  /** Timestamp of the last successful save, for the "Draft saved" chip. */
  savedAt: number | null;
  /** The listing was sent: discard its draft (demo: clear localStorage; live:
   *  delete the row) and stop saving for good. Editing the sent listing from
   *  the success panel then writes no new draft, so it never reappears on the
   *  Continue screen or the directory CTA. */
  clearDraft: () => void;
  /** Open the store again for a brand-new listing ("List another"), so its
   *  edits autosave into a fresh draft. */
  startFreshDraft: () => void;
  /** Persist immediately, resolving `{ isSaved: true }` on success. The "Save &
   *  finish later" affordance awaits this before leaving, and shows the
   *  failure's cause line otherwise. */
  saveAndExit: () => Promise<ListingDraftSaveResult>;
}

/**
 * Dual-mode autosave/resume for the list-a-business wizard.
 *
 * - DEMO keeps the original single localStorage draft (byte-for-byte the old
 *   behaviour). The page's Continue screen offers it back.
 * - LIVE debounce-autosaves the draft to `POST /listing-drafts` (supporting
 *   MULTIPLE cross-device drafts), remembers the server id so subsequent saves
 *   upsert the same row, and deletes it on submit. The demo never hits
 *   the network.
 */
export function useListingDraft(
  draft: ListingDraft,
  step: number,
  options: UseListingDraftOptions = {},
): UseListingDraftResult {
  const { enabled = true, initialDraftId } = options;
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();

  const demoAutosaveOn = enabled && demoMode;
  const liveAutosaveOn = enabled && !demoMode && loggedIn;

  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Live: the server draft-row id we keep upserting into (seeded from a resume).
  const liveDraftId = useRef<string | undefined>(initialDraftId);
  // Single-flight guard for the FIRST create so two concurrent saves (a debounced
  // autosave racing `saveAndExit`) don't both POST id-less and mint two rows.
  const createInFlight = useRef<Promise<string> | null>(null);
  // Bumped by `clearDraft` (submit/discard). A create that resolves after a bump
  // belongs to a draft that's already gone, so it is deleted. That
  // keeps a late autosave from resurrecting a just-deleted row.
  const generation = useRef(0);
  // Set by `clearDraft` once the listing is sent: no autosave, flush or
  // explicit save writes a draft until `startFreshDraft` opens the store.
  const hasSubmittedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Don't autosave until the member has actually started (a path is chosen).
  const started = draft.path !== "";

  /** The persistence primitive shared by the debounced autosave and the
   *  explicit `saveAndExit`. Returns whether the write succeeded, and why not.
   *  Best-effort in demo (storage may be blocked) and live (network may be
   *  down); both swallow their own failure so autosave never toasts. */
  const persist = useCallback(
    async (options: PersistOptions = {}): Promise<ListingDraftSaveResult> => {
      const save = options.keepalive
        ? saveListingDraftKeepalive
        : saveListingDraft;
      if (hasSubmittedRef.current)
        return { isSaved: false, cause: DRAFT_ALREADY_CLEARED };
      const stamp = Date.now();
      if (demoAutosaveOn) {
        try {
          localStorage.setItem(
            DEMO_KEY,
            JSON.stringify({ draft, step, savedAt: stamp }),
          );
          setSavedAt(stamp);
          return { isSaved: true };
        } catch {
          return { isSaved: false, cause: DRAFT_STORAGE_BLOCKED };
        }
      }
      if (liveAutosaveOn) {
        const gen = generation.current;
        try {
          // Existing row (seeded resume, or an already-created draft) → plain upsert.
          if (liveDraftId.current) {
            await save({ draft, step }, liveDraftId.current);
            setSavedAt(stamp);
            return { isSaved: true };
          }
          // A create is already running → wait for its id, then upsert that row,
          // so only one create ever runs.
          if (createInFlight.current) {
            const existingId = await createInFlight.current;
            if (gen !== generation.current) {
              return { isSaved: false, cause: DRAFT_ALREADY_CLEARED }; // cleared meanwhile
            }
            await save({ draft, step }, existingId);
            setSavedAt(stamp);
            return { isSaved: true };
          }
          // First create: single-flight it so concurrent saves reuse this id.
          const createPromise = save({ draft, step }, undefined).then(
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
            // The draft was submitted/discarded while this create was in flight,
            // so the orphaned row is deleted on the spot and never lingers.
            void deleteListingDraft(newId).catch(() => {});
            return { isSaved: false, cause: DRAFT_ALREADY_CLEARED };
          }
          liveDraftId.current = newId;
          setSavedAt(stamp);
          // A freshly-minted row belongs in the drafts list: mark it stale. The
          // landing still observes it and refetches, but its Continue-or-wizard
          // choice is latched, so the member stays in the wizard.
          void queryClient.invalidateQueries({ queryKey: LISTING_DRAFTS_KEY });
          return { isSaved: true };
        } catch (error) {
          return { isSaved: false, cause: causeErrorKey(error) };
        }
      }
      // Neither store is on: a signed-out visitor has nowhere to keep a draft.
      return { isSaved: false, cause: DRAFT_SIGNED_OUT };
    },
    [demoAutosaveOn, liveAutosaveOn, draft, step, queryClient],
  );

  // Listeners and the unmount cleanup call the newest `persist`. The one from
  // the render that registered them holds a stale `draft`.
  const latestPersistRef = useRef(persist);
  useEffect(() => {
    latestPersistRef.current = persist;
  }, [persist]);

  /** Writes the draft now, but only when a debounced save is still waiting.
   *  `clearDraft` and `saveAndExit` leave no pending save, so a submitted or
   *  discarded draft is never written back by a later flush. */
  const flushPendingSave = useCallback((options: PersistOptions = {}) => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
    void latestPersistRef.current(options);
  }, []);

  // Declared BEFORE the autosave effect on purpose: on unmount React runs
  // cleanups in declaration order, so this flush sees the timer before the
  // autosave cleanup below clears it.
  useEffect(() => () => flushPendingSave(), [flushPendingSave]);

  useEffect(() => {
    if (!started || (!demoAutosaveOn && !liveAutosaveOn)) return;
    if (hasSubmittedRef.current) return; // the listing was sent
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void persist();
    }, AUTOSAVE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [persist, started, demoAutosaveOn, liveAutosaveOn]);

  // Save a pending edit when the tab is hidden or closed. The save goes out
  // with `keepalive`, so a tab that is closed or killed right after still
  // delivers it.
  useEffect(() => {
    if (!demoAutosaveOn && !liveAutosaveOn) return;
    const handlePageHide = () => flushPendingSave({ keepalive: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden")
        flushPendingSave({ keepalive: true });
    };
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [demoAutosaveOn, liveAutosaveOn, flushPendingSave]);

  const clearDraft = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    // Invalidate any in-flight create: its late-resolving row is orphaned and
    // deleted (see `persist`), so a stray autosave can't resurrect this draft.
    generation.current += 1;
    createInFlight.current = null;
    hasSubmittedRef.current = true;
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

  const startFreshDraft = useCallback(() => {
    hasSubmittedRef.current = false;
    liveDraftId.current = undefined;
  }, []);

  const saveAndExit = useCallback(async (): Promise<ListingDraftSaveResult> => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!started) return { isSaved: true }; // nothing meaningful to persist yet
    return persist();
  }, [persist, started]);

  return { savedAt, clearDraft, startFreshDraft, saveAndExit };
}
