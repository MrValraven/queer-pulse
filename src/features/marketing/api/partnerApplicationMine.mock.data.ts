import type { MyPartnerApplicationDTO } from "./partnerApplicationMine.api";

/**
 * Demo fixture for `useMyPartnerApplications` (PRD-37). Three rows, chosen so
 * the submissions index has every state to render with no network: one still
 * pending, one approved, and one refused with the reviewer's reason.
 *
 * Demo-only. No live path may import this file.
 */
export const MY_PARTNER_APPLICATIONS_DEMO: MyPartnerApplicationDTO[] = [
  {
    id: "demo-partner-application-1",
    slug: "casa-arco",
    name: "Casa Arco",
    city: "Lisbon",
    tagline: "A daytime space for queer teenagers and the adults around them.",
    status: "pending",
    createdAt: "2026-08-19T10:24:00.000Z",
    decidedAt: null,
    reviewNote: null,
  },
  {
    id: "demo-partner-application-2",
    slug: "coletivo-margem",
    name: "Coletivo Margem",
    city: "Porto",
    tagline: "Legal clinics for trans people navigating name changes.",
    status: "approved",
    createdAt: "2026-06-02T14:05:00.000Z",
    decidedAt: "2026-06-16T09:12:00.000Z",
    reviewNote: null,
  },
  {
    id: "demo-partner-application-3",
    slug: "rede-vizinhanca",
    name: "Rede Vizinhanca",
    city: "Almada",
    tagline: "Neighbourhood mutual aid across the river.",
    status: "rejected",
    createdAt: "2026-04-11T08:40:00.000Z",
    decidedAt: "2026-04-24T16:30:00.000Z",
    reviewNote:
      "Your work overlaps closely with a partner we already list in Almada. Come back to us if the two of you split the coverage.",
  },
];
