import { apiGet, apiPost } from "../../../shared/api/client";

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
  /**
   * When the platform has undertaken to decide this appeal by (TS-11,
   * PRD-286). Computed and stored at this exact moment as `filedAt` plus the
   * published decision window, and now returned as well: the deadline was
   * already a fact the instant the member pressed submit, and withholding it
   * until they came back to the outcome page hid the promise at the one moment
   * it was worth the most.
   */
  slaDueAt: string;
}

/** File an appeal against a moderation decision taken on the current member. */
export const submitAppeal = (body: SubmitAppealInput) =>
  apiPost<SubmittedAppealDTO>("/appeals", body);

/**
 * The calling member's own appeal record — deliberately NARROWER than the
 * moderator-facing `AppealDTO` (`features/admin/api/moderation.api.ts`): no
 * appellant handle, no original moderator's name, just enough for the member
 * to see their own case's status, the moderator's decision text (once
 * resolved), and the facts they themselves supplied. Mirrors the backend's
 * `MemberAppealDTO` (`moderation-response.ts`).
 */
export interface MemberAppealDTO {
  id: string;
  status: AppealStatus;
  decision: string | null;
  argument: string;
  severity: "emergency" | "high" | "medium" | "low";
  community: string | null;
  createdAt: string;
  /**
   * When the platform has undertaken to decide this appeal by (TS-11).
   *
   * Sent to the MEMBER on purpose. The Code of Conduct §05 publishes a 7-day
   * decision window to them, so the deadline is theirs to hold the platform
   * to, and a member locked out by the decision they are appealing has no
   * other surface to read it from.
   */
  slaDueAt: string;
  /** When it was decided. Null while it is still awaiting. */
  decidedAt: string | null;
}

/**
 * The member-facing complement to `submitAppeal`: checking on an appeal
 * already filed. Reachable by a suspended member (same `AppealSubmitGuard`
 * exception as `POST /appeals`) so the person who most needs to track a
 * decision actually can. Returns the member's own appeals, most recent first.
 */
export const getMyAppeals = () => apiGet<MemberAppealDTO[]>("/appeals/me");
