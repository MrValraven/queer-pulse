import { useEffect } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../../app/providers/useSaved";
import { safeStorage } from "../../../shared/storage/safeStorage";
import { DEMO_LIBRARY_SAVES } from "../studioLibrary.data";

export type StudioLibrarySaveKind =
  "studio_release" | "studio_track" | "studio_playlist";

/** Listed in `shared/consent/storageInventory.ts` (the `previewMode` row);
 *  rename both together. v3 reseeds browsers that hold an older library
 *  fixture (v2, v1 and the pre-v1 key), so they see the Withdrawn and "Demo
 *  tape" rows and the liked songs, the withdrawn one among them. */
const SEEDED_FLAG_KEY = "qp.demo.studioLibrarySeeded.v3";
/** Older flags: a browser that holds one has the old fixture, so it is
 *  dropped and the new fixture seeds. */
const OLDER_SEEDED_FLAG_KEYS = [
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
