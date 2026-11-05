import { apiPost } from "../../../shared/api/client";
import type { Language } from "../../../shared/i18n/types";

/**
 * What the backend answers once Resend accepted the welcome email: the
 * request's new send total, counting this one, and when this send went out.
 * Every send is a real new email, so a resend lands a second copy in the
 * applicant's inbox and the count says how many they have.
 *
 * Both fields are optional for one release, because a backend that predates
 * the counter answers `{ sent: true }` alone. `useSendWelcomeEmail` fills them
 * in for that case, so callers always read a complete result.
 */
export interface WelcomeEmailSendResult {
  sent: true;
  welcomeEmailSendCount?: number;
  welcomeEmailLastSentAt?: string;
}

/**
 * Send the published Resend welcome template for one approved join request
 * (Mod/Admin only), addressed by the JOIN REQUEST id. The recipient is read
 * from the request on the server, so the client never sends an address.
 *
 * Each refusal carries a `reason` code in the error body
 * (see `welcomeEmailSendError.ts`, which gives every one its own sentence):
 * - `404 join_request_not_found`
 * - `409 invite_not_usable`: the invite is revoked, used, expired or missing
 * - `503 welcome_email_not_configured`: no Resend key or template for the language
 * - `502 welcome_email_rejected`: Resend refused the send
 * - `503 welcome_email_unavailable`: Resend is down or timed out
 */
export const sendJoinRequestWelcomeEmail = (id: string, locale: Language) =>
  apiPost<WelcomeEmailSendResult>(
    `/admin/join-requests/${encodeURIComponent(id)}/invite/email`,
    { locale },
  );
