import { useDemoMode } from "../../app/providers/DemoModeProvider";

/** Flip to true on launch day, together with the backend's `launchedFeatures`
 *  entry. Read only through `isQuizshowVisible`. */
export const IS_QUIZSHOW_LAUNCHED = false;

/** Demo shows everything; `pnpm dev` shows everything; a built live artifact
 *  shows Pulse Live once launched. */
export function isQuizshowVisible(options: {
  isDemoMode: boolean;
  isDevBuild?: boolean;
}): boolean {
  const isDevBuild = options.isDevBuild ?? import.meta.env.DEV;
  return options.isDemoMode || isDevBuild || IS_QUIZSHOW_LAUNCHED;
}

export function useIsQuizshowVisible(): boolean {
  const { demoMode } = useDemoMode();
  return isQuizshowVisible({ isDemoMode: demoMode });
}
