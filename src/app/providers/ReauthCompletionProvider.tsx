import type { ReactNode } from "react";
import {
  useReauthAvailabilitySync,
  useReauthCompletion,
} from "../../features/settings/api/useReauthToken";
import { ReauthCodeDialog } from "../../features/settings/ReauthCodeDialog";
import { useIsEmailCodeSignInOn } from "../../shared/api/useIsEmailCodeSignInOn";

/**
 * Home of step-up re-authentication, placed inside both `I18nProvider`
 * (needs `t()`) and `ToastProvider` (needs `useToast()`), which `AuthProvider`
 * itself sits above. It does three things (see `useReauthToken.ts`):
 * - runs `useReauthCompletion()`, which picks up a completed Google step-up
 *   round trip once per app load and toasts the outcome;
 * - renders the "Confirm it's you" code dialog (`ReauthCodeDialog`) beside the
 *   app, so any page can open it through `beginReauth()`. It is in the tree
 *   only while the email code sign-in is explicitly on;
 * - runs `useReauthAvailabilitySync()`, which tells `beginReauth()` whether
 *   the email code sign-in is on and whether the member has Google.
 * This sits ABOVE the router, so the dialog and everything it renders use no
 * `Link`, `useNavigate` or `Button to=`.
 */
export function ReauthCompletionProvider({
  children,
}: {
  children: ReactNode;
}) {
  useReauthCompletion();
  useReauthAvailabilitySync();
  const isEmailCodeOn = useIsEmailCodeSignInOn();
  return (
    <>
      {children}
      {isEmailCodeOn ? <ReauthCodeDialog /> : null}
    </>
  );
}
