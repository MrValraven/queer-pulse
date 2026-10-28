import { useEffect, useLayoutEffect, useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../../app/providers/useSaved";
import { safeStorage } from "../../../shared/storage/safeStorage";
import { DEMO_LIBRARY_SAVES } from "../studioLibrary.data";
import type { StudioCursorPagesResult } from "./useStudioCursorPages";
import {
  useStudioSavedPage,
  type StudioSavedPageKind,
} from "./useStudioSavedPage";

export type StudioLibrarySaveKind =
  "studio_release" | "studio_track" | "studio_playlist";

/** Listed in `shared/consent/storageInventory.ts` (the `previewMode` row);
 *  rename both together. v4 reseeds browsers that hold an older library
 *  fixture (v3, v2, v1 and the pre-v1 key), so the saved albums and
 *  playlist carry their covers into the rail and the Library. */
const SEEDED_FLAG_KEY = "qp.demo.studioLibrarySeeded.v4";
/** Older flags: a browser that holds one has the old fixture, so it is
 *  dropped and the new fixture seeds. */
const OLDER_SEEDED_FLAG_KEYS = [
  "qp.demo.studioLibrarySeeded.v3",
  "qp.demo.studioLibrarySeeded.v2",
  "qp.demo.studioLibrarySeeded.v1",
  "qp-demo-studio-library-seeded",
];
let hasSeededThisSession = false;

/** `safeStorage` never throws, so a blocked store reads as "not seeded" and
 *  the in-memory flag keeps the seed to once per session. */
function hasSeededBefore(): boolean {
  if (hasSeededThisSession) return true;
  for (const olderKey of OLDER_SEEDED_FLAG_KEYS) safeStorage.remove(olderKey);
  return safeStorage.get(SEEDED_FLAG_KEY) === "1";
}

function markSeeded(): void {
  hasSeededThisSession = true;
  safeStorage.set(SEEDED_FLAG_KEY, "1");
}

/** Test-only reset so suites don't leak the seed flag between cases. */
export function resetStudioLibrarySeedForTests(): void {
  hasSeededThisSession = false;
  safeStorage.remove(SEEDED_FLAG_KEY);
  for (const olderKey of OLDER_SEEDED_FLAG_KEYS) safeStorage.remove(olderKey);
}

/** The demo puts its library fixture into the saved store once, so every
 *  tab shows the surface it exists to show and an unsave anywhere removes the
 *  row for good. Seeds in demo mode only and once per session. */
export function useStudioDemoLibrarySeed(): void {
  const { save, unsave } = useSaved();
  const { demoMode } = useDemoMode();
  useEffect(() => {
    if (!demoMode || hasSeededBefore()) return;
    markSeeded();
    // Replace by id, so a returning browser's old copy of a fixture row
    // gives way to the current one.
    for (const item of DEMO_LIBRARY_SAVES) {
      unsave(item.id);
      save(item);
    }
  }, [demoMode, save, unsave]);
}

/** One kind of Studio save from the existing Saved feature, with the demo
 *  library fixture seeded first. */
export function useStudioLibrarySaves(
  kind: StudioLibrarySaveKind,
): SavedItem[] {
  const { byKind } = useSaved();
  useStudioDemoLibrarySeed();
  return byKind(kind);
}

/**
 * ENG-04: Library's saved releases or playlists, every page of them. The
 * saved store leads (the bootstrap's newest saves and this session's own),
 * then the older saves the cursor pages bring, each once, keyed by id. Live,
 * each page is remembered into the store before paint, so an older save
 * reads as saved everywhere and an unsave anywhere removes its card at once.
 * Demo keeps the seeded store as the truth: a fixture save unsaved in an
 * earlier session stays gone.
 */
export interface StudioLibrarySavedPageResult extends StudioCursorPagesResult<SavedItem> {
  /** Distinct saves the cursor pages brought so far, store aside: what a
   *  load-all run counts to see whether a page added anything. */
  pagedCount: number;
}

export function useStudioLibrarySavedPage(
  kind: StudioSavedPageKind,
): StudioLibrarySavedPageResult {
  const { demoMode } = useDemoMode();
  const { items: savedItems, byKind, remember, readSaveScope } = useSaved();
  useStudioDemoLibrarySeed();
  const pages = useStudioSavedPage(kind);
  const pageItems = pages.items;
  useLayoutEffect(() => {
    if (demoMode || pageItems.length === 0) return;
    remember(pageItems, { scopeAtRead: readSaveScope() });
  }, [demoMode, pageItems, remember, readSaveScope]);
  const storeItems = byKind(kind);
  // Built once per store change, so the merge below asks a Set.
  const savedIds = useMemo(
    () => new Set(savedItems.map((item) => item.id)),
    [savedItems],
  );
  const items = useMemo(() => {
    // The server's copy is the fresher one (it says whether the save can
    // still be opened); the store decides the order and what is saved.
    const pageCopyById = new Map(pageItems.map((item) => [item.id, item]));
    const seenIds = new Set<string>();
    const merged: SavedItem[] = [];
    for (const item of [...storeItems, ...pageItems]) {
      if (seenIds.has(item.id) || !savedIds.has(item.id)) continue;
      seenIds.add(item.id);
      merged.push(pageCopyById.get(item.id) ?? item);
    }
    return merged;
  }, [storeItems, pageItems, savedIds]);
  return { ...pages, items, pagedCount: pageItems.length };
}
