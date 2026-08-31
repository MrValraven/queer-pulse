import { apiGet } from "../../../shared/api/client";
import type { BanEvasionAssessmentDTO } from "./adminInvites.api";

/**
 * Ban-evasion signals for ONE account that is already on the platform
 * (`GET /admin/ban-evasion/users/:userId`, moderator + admin).
 *
 * The twin of `getBanEvasionForJoinRequests` in `adminInvites.api.ts`, which
 * assesses a page of the invite review queue before anyone is let in. This one
 * answers the later question: someone got in, and staff are now asking whether
 * this is a return.
 *
 * Same wire shape, same guarantees. ADVISORY ONLY: the backend returns a
 * confidence tier and a list of reasons, each one about a specific account that
 * was removed, and the staff member reading it decides. Nothing on the platform
 * acts on the result.
 *
 * Addressed by user id, never by a raw email or a hash, so this can never be
 * used as a "has this address ever been banned" lookup.
 *
 * The response is always an assessment, `tier: "none"` included, so "checked,
 * clear" is a stated result rather than an empty body the caller has to guess
 * at. An account the backend cannot find comes back as `tier: "none"` too.
 */
export const getBanEvasionForUser = (userId: string) =>
  apiGet<BanEvasionAssessmentDTO>(`/admin/ban-evasion/users/${userId}`);
