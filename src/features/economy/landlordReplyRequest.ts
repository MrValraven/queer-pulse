/**
 * PRD-249. The named landlord's right of reply, and the one thing on this
 * surface that has to work for somebody with no account.
 *
 * ## WHY THIS IS A PUBLIC PAGE AND NOT A FORM ON THE LANDLORD PAGE
 *
 * A landlord in the community directory is a third party. They hold no account,
 * there is no claim path, and the directory itself is member-only, so a
 * landlord cannot open the page that rates them, let alone answer on it. Every
 * other right of reply in this codebase belongs to a member answering for
 * themselves (a housing lister, a business owner). Neither shape exists here.
 *
 * So the reply arrives the only way it can: a member sends the landlord this
 * link, the landlord fills in a PUBLIC form with no sign-in, and a staff member
 * checks who they are dealing with and publishes what they said onto the
 * recommendation. The path is deliberately outside `/work` and `/local/housing`
 * (both gated in `authGate`) so a logged-out visitor reaches it.
 *
 * The recommendation id travels in the query string because the person opening
 * this page cannot look it up: they were sent a link, and it has to carry which
 * recommendation they are answering. The id addresses nothing on its own. It is
 * already public to every member as the report handle, and this form only
 * WRITES an intake row for staff, so a guessed id buys somebody the ability to
 * submit an unpublished claim into an admin queue that a human reads.
 */

/** The public route. Top-level on purpose: `authGate` is a denylist and this
 *  path is deliberately absent from it. */
export const LANDLORD_REPLY_REQUEST_PATH = "/landlord-reply";

/** Query params the page reads. Spelled once so the link builder and the page
 *  cannot drift. */
export const LANDLORD_REPLY_QUERY = {
  landlord: "landlord",
  recommendation: "recommendation",
} as const;

/** The link a member can hand to the landlord, carrying which entry and which
 *  recommendation is being answered. */
export function landlordReplyRequestHref(
  landlordSlug: string,
  recommendationId: string,
): string {
  const query = new URLSearchParams({
    [LANDLORD_REPLY_QUERY.landlord]: landlordSlug,
    [LANDLORD_REPLY_QUERY.recommendation]: recommendationId,
  });
  return `${LANDLORD_REPLY_REQUEST_PATH}?${query.toString()}`;
}
