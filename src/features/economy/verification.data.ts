import type { VerificationStatusDTO } from "./api/verification.api";

/**
 * Demo-mode verification standing. The prototype has no real verification, so
 * the demo persona is treated as fully ID-verified — every gated housing action
 * flows without a network call, and the step-up modal's demo path simulates the
 * OTP locally. Never used in live mode (which reads `GET /verification/me`).
 */
export const DEMO_VERIFICATION_STATUS: VerificationStatusDTO = {
  level: "id_verified",
  phoneVerified: true,
  idVerified: true,
  method: "id_document",
  provider: "stub_identity",
  verifiedAt: "2026-01-01T00:00:00.000Z",
};

/** What the demo phone step "returns" after a simulated OTP — phone level. */
export const DEMO_PHONE_VERIFIED: VerificationStatusDTO = {
  level: "phone",
  phoneVerified: true,
  idVerified: false,
  method: "phone_otp",
  provider: "dev_phone",
  verifiedAt: "2026-01-01T00:00:00.000Z",
};
