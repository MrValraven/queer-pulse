/**
 * The deadlines the account-state screens (banned, suspended) print, mirrored
 * from the backend constants that actually enforce them.
 *
 * These screens are the one place a member has to be able to trust a number:
 * they are read by someone who has just lost access and is deciding whether to
 * appeal. Every value here has exactly one source of truth on the server, named
 * below. **Change the server constant and this file in the same breath**, or
 * the screen goes back to publishing a deadline nothing keeps.
 *
 * Source of truth:
 *  - `queerpulse-backend/src/moderation/appeal-window.ts`
 *    (`APPEAL_FILING_WINDOW_DAYS`, `APPEAL_DECISION_WINDOW_DAYS`)
 *  - `queerpulse-backend/src/account/account.constants.ts`
 *    (`DELETION_GRACE_DAYS`)
 *
 * The banned/suspended copy previously stated 21 days and "5 working days" for
 * an appeal decision the server decides in 7, and described erasure as
 * automatic when it only ever happens on the member's own request.
 */

/**
 * How long a member has to file an appeal, counted from the decision they are
 * contesting. Enforced by `isWithinAppealFilingWindow`.
 */
export const APPEAL_FILING_WINDOW_DAYS = 14;

/**
 * How long the platform has to decide an appeal once it is filed. Stamped onto
 * `appeals.sla_due_at` at filing by `appealDecisionDueAt`.
 */
export const APPEAL_DECISION_WINDOW_DAYS = 7;

/**
 * The grace period between a member requesting erasure and the data actually
 * being deleted. The account is deactivated the moment the request is written;
 * `AccountDeletionProcessorService` erases it once the grace period is up.
 *
 * Erasure is never automatic: nothing in the moderation path schedules a
 * deletion request, so a banned account keeps its data until the member asks.
 */
export const ACCOUNT_ERASURE_GRACE_DAYS = 30;
