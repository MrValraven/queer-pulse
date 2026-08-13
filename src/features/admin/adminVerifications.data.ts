import type { AdminVerificationDTO } from "./api/adminVerifications.api";

/**
 * Demo fixture for the admin verification console. The prototype has no real
 * verification events, so this stands in with a couple of illustrative rows and
 * never hits the network (the live endpoint is moderator/admin-only). Override
 * actions are disabled in demo — there is no real record to change.
 */
export const ADMIN_VERIFICATIONS_DEMO: AdminVerificationDTO[] = [
  {
    userId: "demo-user-1",
    member: {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: null,
    },
    level: "id_verified",
    method: "id_document",
    provider: "stub_identity",
    providerRef: "stub_demo_0001",
    verifiedAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    userId: "demo-user-2",
    member: {
      slug: "rui",
      firstName: "Rui",
      lastName: "Mendes",
      avatarUrl: null,
    },
    level: "phone",
    method: "phone_otp",
    provider: "dev_phone",
    providerRef: null,
    verifiedAt: "2026-08-05T14:30:00.000Z",
    updatedAt: "2026-08-05T14:30:00.000Z",
  },
];
