import type { OwnedPartnerDTO } from "./partners.api";

/**
 * Demo fixture for the partner self-service editor (PRD-263).
 *
 * One approved partner, so the demo shows the editor doing its job rather than
 * its (equally real, and separately reachable) "you maintain no partner
 * profile" state. Dated and worded like the rest of the demo registry: this is
 * a fictional Lisbon organisation, never a real one.
 */
export const MY_PARTNERS_DEMO: OwnedPartnerDTO[] = [
  {
    id: "demo-partner-casa-aurora",
    slug: "casa-aurora",
    name: "Casa Aurora",
    logo: "CA",
    region: "pt",
    regionLabel: "Portugal",
    city: "Lisboa",
    desc: "A drop-in house in Arroios with peer support four evenings a week, a clothing swap, and a warm meal on Thursdays.",
    tags: ["Drop-in", "Peer support", "Youth"],
    tier: "Community partner",
    since: "With us since 2025",
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    eyebrow: "Partner · Drop-in house",
    tagline: "Somewhere to be, on the evenings that are hardest.",
    about: [
      "Casa Aurora opened in 2021 above a bakery on Rua do Forno, with two sofas and a kettle.",
      "It now runs four evenings a week and a Thursday kitchen, staffed almost entirely by people who first came through the door as visitors.",
    ],
    stats: [
      { value: "4", label: "evenings a week" },
      { value: "180+", label: "people a month" },
    ],
    aboutMore: [
      {
        heading: "Who it is for",
        body: "Anyone queer or questioning, at any age, with no referral and no intake form.",
      },
    ],
    jointWork: [],
    timeline: [],
    how: [
      {
        heading: "Just turn up",
        body: "The door is open from 18:00. There is no list and nobody asks for a name.",
      },
    ],
    funding:
      "Funded by a municipal grant and by monthly donors. No corporate sponsorship.",
    atGlance: [
      { label: "Founded", value: "2021" },
      { label: "Neighbourhood", value: "Arroios" },
    ],
    contact: {
      phone: "+351 210 000 000",
      phoneNote: "Weekdays, 14:00 to 20:00",
      email: "ola@casa-aurora.example",
      website: "casa-aurora.example",
      address: "Rua do Forno 12, 1000-000 Lisboa",
    },
    status: "approved",
  },
];
