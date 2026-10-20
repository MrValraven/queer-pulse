import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useHasEarlyAccess } from "../auth/api/useMyEarlyAccess";

/** Flip to true on launch day, together with the backend's `launchedFeatures`
 *  entry. Read only through `isQuizshowVisible`. */
export const IS_QUIZSHOW_LAUNCHED = false;

/** Demo shows everything; `pnpm dev` shows everything; a built live artifact
 *  shows Pulse Live once launched, and before launch only to members holding
 *  the `quizshow` early-access grant. The grant gates hosting only: any
 *  signed-in member can play. */
export function isQuizshowVisible(options: {
  isDemoMode: boolean;
  isDevBuild?: boolean;
  hasEarlyAccess?: boolean;
}): boolean {
  const isDevBuild = options.isDevBuild ?? import.meta.env.DEV;
  return (
    options.isDemoMode ||
    isDevBuild ||
    IS_QUIZSHOW_LAUNCHED ||
    options.hasEarlyAccess === true
  );
}

/** `isQuizshowVisible` for the current viewer: demo mode plus their own
 *  early-access grant. Also the hosting route gate's check in `app/routes.tsx`. */
export function useIsQuizshowVisible(): boolean {
  const { demoMode } = useDemoMode();
  const hasEarlyAccess = useHasEarlyAccess("quizshow");
  return isQuizshowVisible({ isDemoMode: demoMode, hasEarlyAccess });
}
