/**
 * Builds the follow-up email a reviewer sends from their own mail app when an
 * applicant needs to share a bit more. QueerPulse sends no email itself, so
 * this only ever produces a `mailto:` link or clipboard text.
 *
 * The address is encoded too (keeping `@` readable) so an applicant-typed
 * address can never smuggle in its own `?subject=` or `&body=`.
 */
export interface FollowUpEmail {
  subject: string;
  body: string;
}

export function followUpMailto(email: string, message: FollowUpEmail): string {
  const address = encodeURIComponent(email).replace(/%40/g, "@");
  const subject = encodeURIComponent(message.subject);
  const body = encodeURIComponent(message.body);
  return `mailto:${address}?subject=${subject}&body=${body}`;
}

export function followUpClipboardText(message: FollowUpEmail): string {
  return `${message.subject}\n\n${message.body}`;
}
