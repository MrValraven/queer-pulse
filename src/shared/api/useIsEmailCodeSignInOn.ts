import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { PlatformStatusDTO } from "./platformStatus.api";
import { usePlatformStatus } from "./usePlatformStatus";

/**
 * Whether the email code sign-in is switched on, from a platform status read
 * (or none yet). Only an explicit `true` counts: a status still loading, a
 * failed read and an older backend that leaves the field out all read as off,
 * so the email option never flashes in and back out. Demo mode is always on.
 */
export function isEmailCodeSignInOn(
  status: Pick<PlatformStatusDTO, "emailCodeSignIn"> | undefined,
  isDemo: boolean,
): boolean {
  return isDemo || status?.emailCodeSignIn === true;
}

/**
 * The email code switch as three states: `true` on, `false` off, `null` while
 * no status has been read (still loading, or the read failed). Demo mode is
 * always `true`. Every email-code component renders only on `true`; the
 * three states are for step-up, whose toast tells "switched off" apart from
 * "still checking".
 */
export function emailCodeSignInState(
  status: Pick<PlatformStatusDTO, "emailCodeSignIn"> | undefined,
  isDemo: boolean,
): boolean | null {
  if (isDemo) return true;
  if (status === undefined) return null;
  return status.emailCodeSignIn === true;
}

/**
 * The email code switch for a component that shows or hides the email option
 * (the sign-in card, the invite card). It lives in its own module so a test
 * that mocks `usePlatformStatus` keeps this hook.
 */
export function useIsEmailCodeSignInOn(): boolean {
  const { demoMode } = useDemoMode();
  const { data: platformStatus } = usePlatformStatus();
  return isEmailCodeSignInOn(platformStatus, demoMode);
}

/** The three-state switch (see `emailCodeSignInState`), for step-up, the
 *  settings sign-in row and the verification page. */
export function useEmailCodeSignInState(): boolean | null {
  const { demoMode } = useDemoMode();
  const { data: platformStatus } = usePlatformStatus();
  return emailCodeSignInState(platformStatus, demoMode);
}
