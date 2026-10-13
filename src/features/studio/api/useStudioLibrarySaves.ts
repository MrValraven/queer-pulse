import { useEffect } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../../app/providers/useSaved";
import { safeStorage } from "../../../shared/storage/safeStorage";
import { DEMO_LIBRARY_SAVES } from "../studioLibrary.data";

export type StudioLibrarySaveKind =
  "studio_release" | "studio_track" | "studio_playlist";

/** Listed in `shared/consent/storageInventory.ts` (the `previewMode` row);
 *  rename both together. */
const SEEDED_FLAG_KEY = "qp.demo.studioLibrarySeeded.v1";
/** Pre-v1 key. A browser that still holds it was seeded already. */
const LEGACY_SEEDED_FLAG_KEY = "qp-demo-studio-library-seeded";
let hasSeededThisSession = false;

/** `safeStorage` never throws, so a blocked store reads as "not seeded" and
 *  the in-memory flag keeps the seed to once per session. */
function hasSeededBefore(): boolean {
  if (hasSeededThisSession) return true;
  if (safeStorage.get(LEGACY_SEEDED_FLAG_KEY) !== null) {
    safeStorage.set(SEEDED_FLAG_KEY, "1");
    safeStorage.remove(LEGACY_SEEDED_FLAG_KEY);
    return true;
  }
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
  safeStorage.remove(LEGACY_SEEDED_FLAG_KEY);
}

/** One kind of Studio save from the existing Saved feature. The demo puts
 *  its library fixture into the saved store once, so every tab shows the
 *  surface it exists to show and an unsave anywhere removes the row for good. */
export function useStudioLibrarySaves(
  kind: StudioLibrarySaveKind,
): SavedItem[] {
  const { byKind, save } = useSaved();
  const { demoMode } = useDemoMode();
  useEffect(() => {
    if (!demoMode || hasSeededBefore()) return;
    markSeeded();
    for (const item of DEMO_LIBRARY_SAVES) save(item);
  }, [demoMode, save]);
  return byKind(kind);
}
