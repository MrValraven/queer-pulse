import { apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { VerificationLevel } from "../../economy/api/verification.api";

/**
 * Admin verification review (`/admin/verifications`, moderator/admin-only).
 * Carries only the member ref, the level, its provenance, and the opaque
 * provider ref — never any document/biometric data, because none is stored.
 */
export interface AdminVerificationDTO {
  userId: string;
  member: MemberRefDTO | null;
  level: VerificationLevel;
  method: string | null;
  provider: string | null;
  providerRef: string | null;
  verifiedAt: string | null;
  updatedAt: string;
}

export const getAdminVerifications = () =>
  apiGet<AdminVerificationDTO[]>("/admin/verifications");

/** Manual override (the stub review path) — grants or revokes a level. */
export const overrideVerification = (
  userId: string,
  level: VerificationLevel,
) =>
  apiPatch<AdminVerificationDTO>(`/admin/verifications/${userId}`, { level });
