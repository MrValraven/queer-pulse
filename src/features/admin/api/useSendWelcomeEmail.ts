import { useQueryClient } from "@tanstack/react-query";
import type { Language } from "../../../shared/i18n/types";
import { sendJoinRequestWelcomeEmail } from "./adminWelcomeEmail.api";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { isPlatformQueueQuery } from "./useUpdateJoinRequestNote";
import type { JoinRequestView } from "./useJoinRequests";

export interface SendWelcomeEmailVars {
  /** The JOIN REQUEST id (a different value from the invite code). */
  id: string;
  /** Which published Resend template to send. */
  locale: Language;
  /** How many welcome emails the card already shows for this request. Demo
   *  mode, and a backend that predates the counter, count on from it. */
  previousSendCount: number;
}

/** A send the server accepted, with the request's updated send record. */
export interface WelcomeEmailSent {
  /** Total sends for this request, counting this one. */
  welcomeEmailSendCount: number;
  /** ISO timestamp this send went out. */
  welcomeEmailLastSentAt: string;
}

/**
 * A reviewer sends the welcome email for an approved applicant with one click.
 * Live mode POSTs `/admin/join-requests/:id/invite/email`, and the backend
 * sends the published Resend template to the address on the request. Every
 * send is a new email, so a resend puts another copy in the applicant's inbox.
 * Demo mode waits out the usual simulated round-trip and counts the send on
 * locally, so the pending and sent states are exercisable with no backend and
 * no mail leaves the browser.
 *
 * The result always carries the new send count and date. A backend that
 * answers `{ sent: true }` alone gets them filled in as one more send, made
 * now.
 *
 * On success the new count and date are laid onto every loaded queue row with
 * that id, so each card and Decided row shows the send straight away. Live
 * mode then invalidates to reconcile with the server. Demo mode skips that
 * refetch, because its queue is re-derived from a fixture that never changes
 * and a refetch there would put the old count straight back.
 *
 * The card shows its own specific error line and toast, so the global error
 * toast is silenced.
 */
export function useSendWelcomeEmail() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<WelcomeEmailSent, Error, SendWelcomeEmailVars>({
    demoMode,
    meta: { silentError: true },
    demoResult: ({ previousSendCount }) => ({
      welcomeEmailSendCount: previousSendCount + 1,
      welcomeEmailLastSentAt: new Date().toISOString(),
    }),
    live: async ({ id, locale, previousSendCount }) => {
      const result = await sendJoinRequestWelcomeEmail(id, locale);
      return {
        welcomeEmailSendCount:
          result.welcomeEmailSendCount ?? previousSendCount + 1,
        welcomeEmailLastSentAt:
          result.welcomeEmailLastSentAt ?? new Date().toISOString(),
      };
    },
    logLabel: "admin.joinRequest.sendWelcomeEmail",
    logContext: ({ id, locale }) => ({ id, locale }),
    onSuccess: (sent, { id }) => {
      queryClient.setQueriesData<JoinRequestView[]>(
        { queryKey: ["join-requests"], predicate: isPlatformQueueQuery },
        (rows) =>
          rows?.some((row) => row.id === id)
            ? rows.map((row) => (row.id === id ? { ...row, ...sent } : row))
            : rows,
      );
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["join-requests"],
        predicate: isPlatformQueueQuery,
      });
    },
  });
}
