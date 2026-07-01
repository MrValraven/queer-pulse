import { useCallback, useEffect, useRef, useState } from "react";
import type { ListingDraft } from "./listBusiness.data";

const DKEY = "qp-listing-draft-v2";

interface StoredDraft {
  draft: ListingDraft;
  step: number;
  savedAt: number;
}

function read(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(DKEY);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

/**
 * Autosaves the wizard to localStorage (debounced) and exposes any saved draft
 * found on mount so the page can offer a "resume" banner.
 */
export function useListingDraft(draft: ListingDraft, step: number) {
  // Snapshot what was on disk at mount — used only for the resume banner.
  const [saved] = useState<StoredDraft | null>(() => read());
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Don't autosave until the user has actually started (path chosen).
  const started = draft.path !== "";

  useEffect(() => {
    if (!started) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const stamp = Date.now();
      try {
        localStorage.setItem(
          DKEY,
          JSON.stringify({ draft, step, savedAt: stamp }),
        );
        setSavedAt(stamp);
      } catch {
        /* storage full / unavailable — ignore in the prototype */
      }
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, step, started]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DKEY);
    } catch {
      /* ignore */
    }
    setSavedAt(null);
  }, []);

  return { saved, savedAt, clearDraft };
}
