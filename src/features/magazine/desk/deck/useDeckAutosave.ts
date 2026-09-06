import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../../../../shared/hooks";
import type { DeckDraft } from "../../deckDraft";
import { draftsEqual } from "../../deckEditorLoad";

export interface UseDeckAutosaveArgs {
  /** Server id, or `null` for a never-saved draft. */
  deckId: string | null;
  /** Current editor state, undebounced. */
  draft: DeckDraft;
  /** The last snapshot the SERVER has confirmed. */
  lastSaved: DeckDraft;
  /** Persists one snapshot and resolves once the server has it. Rejects on
   *  failure, which leaves the snapshot dirty so the next edit resends it. */
  saveDraft: (snapshot: DeckDraft) => Promise<void>;
}

/**
 * PRD-131 — autosave for the deck editor, which had none: every unsaved slide
 * was lost to a Back press or a command-palette jump, while the article
 * editor beside it had saved the same work seconds earlier.
 *
 * Follows `desk/editor/useArticleEditorDraftState.ts` for the three things
 * that make autosave trustworthy, and deliberately nothing else:
 *
 *  1. The ~1.2s debounce, so a burst of typing is one request.
 *  2. `lastSaved` only advances when the server confirms a write, so a failed
 *     save stays dirty and is resent by the next edit rather than being
 *     quietly dropped while the header claims everything is saved.
 *  3. A flush on unmount and on `pagehide`, so whatever was typed inside the
 *     debounce window still reaches the server when the editor is left.
 *
 * What it does NOT copy is that hook's optimistic-concurrency handling. A
 * deck has no `version` column and the deck PATCH is a whole-row replace, so
 * there is no server-side conflict signal to react to. Last write wins, and
 * the in-flight guard below is only there to stop this hook resending a
 * snapshot it is already sending.
 *
 * Autosave stays off until the deck has been saved once. Creating a deck
 * needs a slug the writer picks and the unique index enforces, so firing a
 * create from a debounce timer would either claim a half-typed slug or 409 on
 * every keystroke. The explicit Save button owns that first write.
 */
export function useDeckAutosave({
  deckId,
  draft,
  lastSaved,
  saveDraft,
}: UseDeckAutosaveArgs): { isAutosaving: boolean } {
  const [isAutosaving, setIsAutosaving] = useState(false);
  const debouncedDraft = useDebouncedValue(draft, 1200);

  // Which snapshot a PATCH is currently carrying, so a save resolving while a
  // newer one is already in flight cannot make the effect fire that newer
  // snapshot twice. Written and read from effects only, never during render.
  const inFlightDraftRef = useRef<DeckDraft | null>(null);

  // Latest-value refs for the effects below, which must see the CURRENT save
  // function and the CURRENT draft rather than whatever was current when
  // they last ran (or, for the flush, when its listener was registered).
  const saveDraftRef = useRef(saveDraft);
  const flushRef = useRef<() => void>(() => {});

  // Declared FIRST on purpose: effects run in declaration order within a
  // commit, so both refs are up to date before the autosave effect below
  // reads `saveDraftRef.current`. No dependency array, so it re-runs every
  // render, which is what "latest value" means here.
  useEffect(() => {
    saveDraftRef.current = saveDraft;
    flushRef.current = () => {
      if (!deckId) return;
      const pendingDraft = draft;
      if (draftsEqual(pendingDraft, lastSaved)) return;
      const inFlightDraft = inFlightDraftRef.current;
      if (inFlightDraft && draftsEqual(pendingDraft, inFlightDraft)) return;
      inFlightDraftRef.current = pendingDraft;
      void saveDraftRef.current(pendingDraft).catch(() => {
        inFlightDraftRef.current = null;
      });
    };
  });

  useEffect(() => {
    if (!deckId) return;
    if (draftsEqual(debouncedDraft, lastSaved)) return;
    const inFlightDraft = inFlightDraftRef.current;
    if (inFlightDraft && draftsEqual(debouncedDraft, inFlightDraft)) return;
    inFlightDraftRef.current = debouncedDraft;
    setIsAutosaving(true);
    void saveDraftRef
      .current(debouncedDraft)
      .catch(() => {
        // Swallowed on purpose: the caller owns the failure toast, and
        // leaving `lastSaved` behind is what marks the draft dirty so the
        // next edit sends this content again.
      })
      .finally(() => {
        inFlightDraftRef.current = null;
        setIsAutosaving(false);
      });
  }, [deckId, debouncedDraft, lastSaved]);

  useEffect(() => {
    const flushPendingSave = () => flushRef.current();
    // `pagehide` also fires when a tab merely goes to the background, where
    // this component stays mounted, so the flush settles its own bookkeeping
    // instead of assuming it is on the way out.
    window.addEventListener("pagehide", flushPendingSave);
    return () => {
      window.removeEventListener("pagehide", flushPendingSave);
      flushPendingSave();
    };
  }, []);

  return { isAutosaving };
}
