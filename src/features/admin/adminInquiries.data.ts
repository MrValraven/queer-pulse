import type { AdminInquiryDTO } from "./api/adminInquiries.api";

/**
 * Demo fixture for the Inquiries section of the intake console: fabricated
 * messages standing in for what `/about/contact` collects. Never surfaces in
 * live mode — the hook only reads this when `demoMode` is on.
 *
 * Covers both kinds (a plain contact message and a partnership one, which
 * carries an organisation), both statuses, a message with no subject, and a
 * handled row with no recorded handler (rows handled before ACQ-03 shipped
 * were never backfilled).
 */
export const ADMIN_INQUIRIES: AdminInquiryDTO[] = [
  {
    id: "inquiry-demo-1",
    kind: "contact",
    name: "Vera Pinto",
    email: "vera@example.com",
    subject: "Locked out after changing my email",
    body: "I changed my email in settings, then the sign-in page told me the code had expired and now neither address works. I have been trying for three days.",
    status: "new",
    createdAt: "2026-08-23T18:40:00.000Z",
    handledAt: null,
    handledBy: null,
  },
  {
    id: "inquiry-demo-2",
    kind: "partner",
    name: "Duarte Nunes",
    email: "duarte@casadobairro.example",
    orgName: "Casa do Bairro",
    subject: "Room for community events in Marvila",
    body: "We run a neighbourhood centre with a hall that sits empty on weeknights and would like to offer it for gatherings.",
    status: "new",
    createdAt: "2026-08-25T11:15:00.000Z",
    handledAt: null,
    handledBy: null,
  },
  {
    id: "inquiry-demo-3",
    kind: "contact",
    name: "Alex Ferreira",
    email: "alex@example.com",
    body: "I am 17 and the notice said to write here. Is there anything I can join before my birthday in November?",
    status: "new",
    createdAt: "2026-08-12T08:05:00.000Z",
    handledAt: null,
    handledBy: null,
  },
  {
    id: "inquiry-demo-4",
    kind: "contact",
    name: "Sofia Rebelo",
    email: "sofia@example.com",
    subject: "My invite request never came back",
    body: "I asked for an invite in June and the confirmation page said someone would look at it. I have heard nothing since.",
    status: "handled",
    createdAt: "2026-07-08T09:30:00.000Z",
    handledAt: "2026-07-10T15:00:00.000Z",
    handledBy: { id: "admin-1", name: "Mira Lopes" },
  },
  {
    id: "inquiry-demo-5",
    kind: "partner",
    name: "Helena Cruz",
    email: "helena@clinicasul.example",
    orgName: "Clínica Sul",
    subject: "Adding our trans health service to the directory",
    body: "We have two GPs taking new patients on informed consent and would like to be listed.",
    // Handled before ACQ-03 shipped: no handler was ever recorded.
    status: "handled",
    createdAt: "2026-06-19T13:20:00.000Z",
    handledAt: "2026-06-24T10:10:00.000Z",
    handledBy: null,
  },
];
