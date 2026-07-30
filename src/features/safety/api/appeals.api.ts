import { apiPost } from "../../../shared/api/client";

/**
 * The member-facing half of appeals: submitting one. The moderator-facing
 * half — the queue and the uphold/overturn decision — lives in
 * `features/admin/api/moderation.api.ts` (`GET /mod/appeals`,
 * `PATCH /mod/appeals/:id`).
 *
 * Crucially, `POST /appeals` is reachable by a SUSPENDED member: the backend
 * guards it with a deliberate `ActiveMemberGuard` exception
 * (`AppealSubmitGuard`) so the one person who most needs to contest a decision
 * — the person locked out by it — actually can.
 */

export type AppealStatus = "awaiting" | "upheld" | "overturned";

export interface SubmitAppealInput {
  /** The member's free-text case for reconsidering the decision. */
  reason: string;
  /**
   * The specific moderator action being appealed, when the member has its id
   * to hand (e.g. from a deep link). Optional — the backend resolves the most
   * recent enforcement action against the member when it's absent.
   */
  actionId?: string;
}

/** Narrow acknowledgement — the member's own appeal id, status, and filing time. */
export interface SubmittedAppealDTO {
  id: string;
  status: AppealStatus;
  createdAt: string;
}

/** File an appeal against a moderation decision taken on the current member. */
export const submitAppeal = (body: SubmitAppealInput) =>
  apiPost<SubmittedAppealDTO>("/appeals", body);
