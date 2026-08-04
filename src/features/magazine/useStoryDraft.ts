import { useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_DRAFT, type DraftForm } from "./submitStory.data";

const STORY_DRAFT_KEY = "qp-story-draft-v1";

/** How the "Saved" indicator reflects the ACTUAL localStorage write. */
export type StoryDraftSaveState = "saved" | "saving" | "unsaved";

interface StoredStoryDraft {
  form: DraftForm;
  coverName: string | null;
  savedAt: number;
}

function readStoredStoryDraft(): StoredStoryDraft | null {
  try {
    const raw = localStorage.getItem(STORY_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as StoredStoryDraft) : null;
  } catch {
    return null;
  }
}

/**
 * Real persistence for the submit-a-story editor, modelled on the listing
 * wizard's `useListingDraft`: the in-progress piece (every field plus the
 * chosen cover key) is debounce-written to localStorage so a half-written
 * story survives a navigation or a refresh instead of silently vanishing.
 *
 * The returned `saveState` reflects the write for real — "saving" while a
 * write is pending, "saved" only once it lands, "unsaved" only when storage
 * is unavailable and nothing was persisted — so the indicator never claims a
 * save that didn't happen.
 *
 * `saved` is the snapshot read once on mount (for the resume banner); it is
 * held stable so it never changes underfoot as autosave overwrites the slot.
 */
export function useStoryDraft(form: DraftForm, coverName: string | null) {
  const [saved] = useState<StoredStoryDraft | null>(() =>
    readStoredStoryDraft(),
  );
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<StoryDraftSaveState>("saved");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The editor mounts pre-filled with an example draft that was never saved.
  // `set()` replaces `form` with a fresh object on the first edit, so an
  // identity change from INITIAL_DRAFT (or a chosen cover) is our signal that
  // the writer has actually started — StrictMode-safe, unlike a first-run ref.
  const started = form !== INITIAL_DRAFT || coverName !== null;

  const writeNow = useCallback((): boolean => {
    const stamp = Date.now();
    try {
      localStorage.setItem(
        STORY_DRAFT_KEY,
        JSON.stringify({ form, coverName, savedAt: stamp }),
      );
      setSavedAt(stamp);
      setSaveState("saved");
      return true;
    } catch {
      // Storage full / unavailable (e.g. private mode) — be honest that the
      // changes did NOT persist rather than flashing a false "Saved".
      setSaveState("unsaved");
      return false;
    }
  }, [form, coverName]);

  useEffect(() => {
    if (!started) return;
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => writeNow(), 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [started, writeNow]);

  /** Persist immediately (the "Save draft" button); returns whether it stuck. */
  const saveNow = useCallback((): boolean => {
    if (timer.current) clearTimeout(timer.current);
    return writeNow();
  }, [writeNow]);

  const clearDraft = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    try {
      localStorage.removeItem(STORY_DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setSavedAt(null);
  }, []);

  return { saved, savedAt, saveState, saveNow, clearDraft };
}
