import type { AdminLegalRequestDTO } from "./api/adminLegalRequests.api";

/**
 * Demo-mode rows for the legal and government request register, so the console
 * renders with no backend. Mirrors {@link AdminLegalRequestDTO} exactly.
 *
 * Fabricated, and it must never surface as platform truth: the live endpoint is
 * admin-only and 403s otherwise, so demo mode reads this instead of the network
 * rather than showing an empty register.
 *
 * The three rows are the three shapes the pane has to render: a disclosure
 * where nobody could be told and the reason is on file, a refusal with no
 * disclosure at all, and a struck record carrying its void reason.
 */
export const ADMIN_LEGAL_REQUESTS_DEMO: AdminLegalRequestDTO[] = [
  {
    id: "demo-legal-request-1",
    requestingBody: "Polícia Judiciária, Lisbon",
    jurisdiction: "Portugal",
    requestType: "police_request",
    receivedOn: "2026-07-18",
    accountsAffected: 2,
    outcome: "narrowed",
    dataDisclosed: ["account_identifiers", "account_metadata"],
    memberNotifiedOn: null,
    accountsNotified: 0,
    notificationWithheldReason:
      "The order carries a non-disclosure clause, so the affected members could not be told at the time.",
    isUnderGagOrder: true,
    internalNote:
      "Original scope asked for private messages. Counsel pushed back and the final order covers identifiers only.",
    recordedByName: "Ana Marques",
    isVoided: false,
    voidedAt: null,
    voidReason: null,
    createdAt: "2026-07-18T09:20:00.000Z",
    updatedAt: "2026-07-30T15:05:00.000Z",
  },
  {
    id: "demo-legal-request-2",
    requestingBody: "District Court of Braga",
    jurisdiction: "Portugal",
    requestType: "court_order",
    receivedOn: "2026-06-02",
    accountsAffected: 1,
    outcome: "refused",
    dataDisclosed: [],
    memberNotifiedOn: "2026-06-09",
    accountsNotified: 1,
    notificationWithheldReason: null,
    isUnderGagOrder: false,
    internalNote: "Refused as out of jurisdiction. Nothing was handed over.",
    recordedByName: "Ana Marques",
    isVoided: false,
    voidedAt: null,
    voidReason: null,
    createdAt: "2026-06-02T11:00:00.000Z",
    updatedAt: "2026-06-09T08:40:00.000Z",
  },
  {
    id: "demo-legal-request-3",
    requestingBody: "Municipal licensing office, Porto",
    jurisdiction: "Portugal",
    requestType: "other",
    receivedOn: "2026-05-11",
    accountsAffected: 0,
    outcome: "withdrawn",
    dataDisclosed: [],
    memberNotifiedOn: null,
    accountsNotified: 0,
    notificationWithheldReason: null,
    isUnderGagOrder: false,
    internalNote: null,
    recordedByName: "Rui Tavares",
    isVoided: true,
    voidedAt: "2026-05-14T10:30:00.000Z",
    voidReason:
      "Entered twice by mistake. The surviving record for this demand is the one dated 11 May.",
    createdAt: "2026-05-11T13:15:00.000Z",
    updatedAt: "2026-05-14T10:30:00.000Z",
  },
];
