import { ApiError, apiGet, apiPost } from "../../../shared/api/client";

/** Ordered identity-assurance ladder, mirrored from the backend. `email` is the
 * floor any account already has (Google-only sign-in proves a verified email);
 * `phone` and `id_verified` reflect a REAL, recorded verification event. */
export type VerificationLevel = "none" | "email" | "phone" | "id_verified";

export interface VerificationStatusDTO {
  level: VerificationLevel;
  phoneVerified: boolean;
  idVerified: boolean;
  method: string | null;
  provider: string | null;
  verifiedAt: string | null;
}

const LEVEL_ORDER: VerificationLevel[] = [
  "none",
  "email",
  "phone",
  "id_verified",
];

export function levelRank(level: VerificationLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

export function meetsLevel(
  actual: VerificationLevel,
  required: VerificationLevel,
): boolean {
  return levelRank(actual) >= levelRank(required);
}

/**
 * Reads a `VERIFICATION_REQUIRED` 403 body and returns the level the action
 * needs, so the caller can open the step-up prompt. Returns `null` for any other
 * error (the caller handles it normally). The backend emits
 * `{ code: "VERIFICATION_REQUIRED", requiredLevel }` from its gate.
 */
export function verificationRequiredFrom(
  error: unknown,
): VerificationLevel | null {
  if (error instanceof ApiError && error.status === 403) {
    const data = error.data as
      | { code?: string; requiredLevel?: VerificationLevel }
      | undefined;
    if (data?.code === "VERIFICATION_REQUIRED" && data.requiredLevel) {
      return data.requiredLevel;
    }
  }
  return null;
}

export const getVerificationStatus = () =>
  apiGet<VerificationStatusDTO>("/verification/me");

export const startPhoneVerification = (phoneNumber: string) =>
  apiPost<{ started: true }>("/verification/phone/start", { phoneNumber });

export const verifyPhoneCode = (code: string) =>
  apiPost<VerificationStatusDTO>("/verification/phone/verify", { code });

export const startIdentityVerification = () =>
  apiPost<{ redirectUrl: string; providerRef: string }>(
    "/verification/identity/start",
    {},
  );
