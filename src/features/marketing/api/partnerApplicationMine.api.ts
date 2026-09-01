import { apiGet } from "../../../shared/api/client";
import type { PartnerStatus } from "./partners.api";

/**
 * The applicant's own view of a partner application (PRD-37).
 *
 * Deliberately much smaller than the admin queue's `PartnerApplicationDTO` in
 * `partners.api.ts`. The backend hand-maps this shape and withholds the
 * assigned reviewer, the internal SLA due date and the editorial fields, so
 * those are absent here because they never arrive, never because a client hid
 * them.
 */
export interface MyPartnerApplicationDTO {
  id: string;
  /** The public partner slug. Resolves to a live page only once approved. */
  slug: string;
  /** The organisation name as it was submitted. */
  name: string;
  city: string;
  tagline: string;
  /**
   * `pending` is the only open state. `approved` and `rejected` are both
   * terminal, and the applicant is notified when the row lands on either.
   */
  status: PartnerStatus;
  /** ISO 8601. When the application was submitted. */
  createdAt: string;
  /**
   * ISO 8601, or null. When an admin decided it.
   *
   * Null does NOT mean "still waiting": applications settled before the
   * platform recorded a decision date carry null too. Read `status` for
   * whether it is decided, and treat this only as the date to show when there
   * is one.
   */
  decidedAt: string | null;
  /**
   * The reviewer's reason for turning the application down, or null.
   *
   * Present only on a `rejected` row whose decision the platform actually
   * recorded a date for, which is exactly the set of refusals whose reason was
   * also delivered to the member's notifications. Applications settled before
   * that carry null, because their note was written when it was private.
   *
   * Never rendered as a quote from a named person: the reviewer's identity is
   * withheld and there is nothing to attribute it to.
   */
  reviewNote: string | null;
}

/**
 * GET /partner-applications/mine — the caller's own applications, newest
 * first, scoped server-side by the session. Returns `[]` when the member has
 * never applied, so this is a plain `apiGet`, never nullable.
 */
export const getMyPartnerApplications = () =>
  apiGet<MyPartnerApplicationDTO[]>("/partner-applications/mine");
