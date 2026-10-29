import type { Language } from "../../../shared/i18n/types";
import {
  sendJoinRequestWelcomeEmail,
  type WelcomeEmailSendResult,
} from "./adminWelcomeEmail.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";

export interface SendWelcomeEmailVars {
  /** The JOIN REQUEST id (a different value from the invite code). */
  id: string;
  /** Which published Resend template to send. */
  locale: Language;
}

/**
 * A reviewer sends the welcome email for an approved applicant with one click.
 * Live mode POSTs `/admin/join-requests/:id/invite/email`, and the backend
 * sends the published Resend template to the address on the request. Demo mode
 * waits out the usual simulated round-trip and resolves `{ sent: true }`, so
 * the pending and sent states are exercisable with no backend and no mail
 * leaves the browser.
 *
 * The card shows its own specific error line and toast, so the global error
 * toast is silenced. Nothing in the cached queue changes (the invite stays as
 * it was), so there is nothing to invalidate.
 */
export function useSendWelcomeEmail() {
  const { demoMode } = useDemoMode();
  return useDemoAwareMutation<
    WelcomeEmailSendResult,
    Error,
    SendWelcomeEmailVars
  >({
    demoMode,
    meta: { silentError: true },
    demoResult: () => ({ sent: true }),
    live: ({ id, locale }) => sendJoinRequestWelcomeEmail(id, locale),
    logLabel: "admin.joinRequest.sendWelcomeEmail",
    logContext: ({ id, locale }) => ({ id, locale }),
  });
}
