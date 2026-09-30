import type { LegalRequestAmendmentDTO } from "./api/adminLegalRequests.api";

/**
 * Demo-mode amendment histories for the legal and government request
 * register, keyed by the record ids in `adminLegalRequests.data.ts`. Mirrors
 * {@link LegalRequestAmendmentDTO} exactly, newest first like the endpoint.
 *
 * Fabricated, and it must never surface as platform truth: the live endpoint is
 * admin-only and 403s otherwise, so demo mode reads this and leaves the network
 * alone.
 *
 * Each history ends where its record now stands. The first record was pushed
 * back on and later found to carry a gag order, the second had its member told
 * by an admin whose account has since been erased, and the struck third record
 * was never amended, so it renders the empty history.
 */
export const ADMIN_LEGAL_REQUEST_AMENDMENTS_DEMO: Record<
  string,
  LegalRequestAmendmentDTO[]
> = {
  "demo-legal-request-1": [
    {
      id: "demo-legal-request-amendment-1b",
      actorName: "Rui Tavares",
      changes: {
        notificationWithheldReason: {
          from: null,
          to: "The order carries a non-disclosure clause, so the affected members could not be told at the time.",
        },
        isUnderGagOrder: { from: false, to: true },
      },
      createdAt: "2026-07-30T15:05:00.000Z",
    },
    {
      id: "demo-legal-request-amendment-1a",
      actorName: "Ana Marques",
      changes: {
        accountsAffected: { from: 3, to: 2 },
        outcome: { from: "pending", to: "narrowed" },
        dataDisclosed: {
          from: [],
          to: ["account_identifiers", "account_metadata"],
        },
      },
      createdAt: "2026-07-24T10:12:00.000Z",
    },
  ],
  "demo-legal-request-2": [
    {
      id: "demo-legal-request-amendment-2a",
      actorName: null,
      changes: {
        memberNotifiedOn: { from: null, to: "2026-06-09" },
        accountsNotified: { from: 0, to: 1 },
      },
      createdAt: "2026-06-09T08:40:00.000Z",
    },
  ],
};
