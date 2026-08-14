import type { PartnerApplicationDTO } from "./partners.api";

/**
 * A small mock queue of PENDING applications for demo mode, so the admin triage
 * view has something to render without a backend. Plain strings throughout (no
 * JSX) — these are raw DTOs, adapted for display by `applicationToView`.
 */
export const MOCK_PARTNER_APPLICATIONS: PartnerApplicationDTO[] = [
  {
    id: "app-casa-arco",
    slug: "casa-arco",
    name: "Casa Arco",
    logo: "CA",
    region: "pt",
    regionLabel: "Portugal",
    city: "Porto",
    desc: "A queer-run community kitchen and drop-in in Porto, offering warm meals, a warm room, and a soft landing for people between housing.",
    tags: ["Housing", "Food", "Drop-in"],
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    tier: "Community partner",
    since: "Applying · 2026",
    eyebrow: "Partner · Community drop-in",
    tagline:
      "A community kitchen that decided nobody in Porto should be cold or hungry while they wait for a queer-safe bed.",
    about: [
      "Casa Arco runs a nightly community kitchen and a daytime drop-in, staffed almost entirely by volunteers who've been through the door themselves.",
    ],
    stats: [{ value: "2023", label: "Opened" }],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding:
      "Volunteer-run; funded by neighbourhood donations and small grants.",
    atGlance: [
      { label: "Type", value: "Community kitchen" },
      { label: "HQ", value: "Porto" },
    ],
    contact: {
      phone: null,
      phoneNote: null,
      email: "ola@casaarco.pt",
      website: "casaarco.pt",
      address: "Rua de Santa Catarina, Porto",
    },
    status: "pending",
    submittedBy: {
      slug: "marta-luis",
      firstName: "Marta",
      lastName: "Luís",
      avatarUrl: null,
    },
    reviewNote: null,
    createdAt: "2026-07-02T09:14:00.000Z",
  },
  {
    id: "app-transfeminist-fund",
    slug: "transfeminist-mutual-fund",
    name: "Transfeminist Mutual Fund",
    logo: "TMF",
    region: "eu",
    regionLabel: "Europe",
    city: "Barcelona",
    desc: "A member-run mutual-aid fund covering surgery travel, binders, and legal fees for trans people across the Iberian peninsula.",
    tags: ["Trans care", "Mutual aid", "Funder"],
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    tier: "Solidarity partner",
    since: "Applying · 2026",
    eyebrow: "Partner · Mutual-aid fund",
    tagline:
      "Small money in trans hands, fast. No gatekeeping letters, no waiting for a grant cycle.",
    about: [
      "The Transfeminist Mutual Fund pools monthly member contributions and disburses micro-grants decided by a rotating trans committee.",
    ],
    stats: [{ value: "2022", label: "Founded" }],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding: "Member contributions and a small solidarity reserve.",
    atGlance: [
      { label: "Type", value: "Mutual-aid fund" },
      { label: "Reach", value: "Iberian peninsula" },
    ],
    contact: {
      phone: null,
      phoneNote: null,
      email: "hola@transfeministfund.org",
      website: "transfeministfund.org",
      address: null,
    },
    status: "pending",
    submittedBy: null,
    reviewNote: null,
    createdAt: "2026-06-28T16:40:00.000Z",
  },
];
