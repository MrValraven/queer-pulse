import { apiPost } from "../../../shared/api/client";
import type { Language } from "../../../shared/i18n/types";

/** What the backend answers once Resend accepted the welcome email. */
export interface WelcomeEmailSendResult {
  sent: true;
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
