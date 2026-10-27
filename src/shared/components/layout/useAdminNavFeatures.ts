import { useIsQuizshowVisible } from "../../../features/quizshow/quizshowLaunch";
import type { AdminNavFeature } from "./adminNav.data";

const QUIZSHOW_FEATURES: readonly AdminNavFeature[] = ["quizshow"];
const NO_FEATURES: readonly AdminNavFeature[] = [];

/**
 * The unlaunched features whose console pages this viewer can open, for
 * `visibleAdminNavSections`. Pulse Live joins while `useIsQuizshowVisible()` is
 * true (demo, `pnpm dev`, launch, or the early-access grant). Each answer is a
 * module constant, so the sidebar's memo only reruns when visibility flips.
 */
export function useAdminNavFeatures(): readonly AdminNavFeature[] {
  const isQuizshowVisible = useIsQuizshowVisible();
  return isQuizshowVisible ? QUIZSHOW_FEATURES : NO_FEATURES;
}
