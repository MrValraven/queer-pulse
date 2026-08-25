export type Section = "qp" | "pt" | "eu";
export type Status = "open" | "rolling" | "closed";

export interface Grant {
  sec: Section;
  name: string;
  organization: string;
  amount: string;
  status: Status;
  cats: string[];
  description: string;
  tags: string[];
  to: string;
}

export const GRANTS: Grant[] = [
  {
    sec: "qp",
    name: "QueerPulse Micro Grant",
    organization: "QueerPulse Community Fund",
    amount: "€200–€2,000",
    status: "open",
    cats: ["individual", "org", "community"],
    description:
      "Community-funded micro grants for queer projects in Lisbon. Open to members and non-members. Decisions made by a rotating community panel of members.",
    tags: ["Lisbon", "community", "rolling"],
    to: "/work/grants",
  },
  {
    sec: "pt",
    name: "Gulbenkian: Social Programme",
    organization: "Fundação Gulbenkian",
    amount: "€5,000–€50,000",
    status: "rolling",
    cats: ["org", "community", "arts"],
    description:
      "Gulbenkian's social cohesion programme funds community organisations working with marginalised groups. An inclusion-framed application is needed.",
    tags: ["Gulbenkian", "large grant", "social"],
    to: "/work/grants",
  },
  {
    sec: "pt",
    name: "Active Citizens Fund Portugal",
    organization: "EEA Grants",
    amount: "€5,000–€200,000",
    status: "rolling",
    cats: ["org", "community"],
    description:
      "Civil society strengthening grants via the EEA mechanism. LGBTQ+ groups have been funded under previous rounds.",
    tags: ["EEA", "civil society"],
    to: "/work/grants",
  },
  {
    sec: "pt",
    name: "DGES: Arts & Culture Residency",
    organization: "DGES",
    amount: "€2,000–€15,000",
    status: "closed",
    cats: ["individual", "arts"],
    description:
      "Annual residency and creation support for individual artists. Frame your work in terms of its cultural value.",
    tags: ["arts", "residency"],
    to: "/work/grants",
  },
  {
    sec: "eu",
    name: "Citizens, Equality, Rights and Values (CERV)",
    organization: "European Commission",
    amount: "€50,000–€1,000,000+",
    status: "rolling",
    cats: ["org", "eu"],
    description:
      "The EU's main civil society and equality programme. The LGBTIQ Equality strand funds work across Europe. Requires EU-wide partnerships.",
    tags: ["EU", "large grant", "transnational"],
    to: "/work/grants",
  },
  {
    sec: "eu",
    name: "Arcus Foundation: LGBTQ Programme",
    organization: "Arcus Foundation",
    amount: "$50,000–$300,000",
    status: "rolling",
    cats: ["org", "eu"],
    description:
      "US-based foundation with a major LGBTQ programme in Europe. Focuses on movement-building, legal advocacy, and trans rights.",
    tags: ["movement building", "international"],
    to: "/work/grants",
  },
  {
    sec: "eu",
    name: "Rainbow Railroad Emergency Fund",
    organization: "Rainbow Railroad",
    amount: "up to $2,000",
    status: "rolling",
    cats: ["individual", "eu"],
    description:
      "Direct financial assistance for LGBTQI+ people in dangerous situations, including help leaving unsafe situations. For individuals only.",
    tags: ["emergency", "individual", "safety"],
    to: "/work/grants",
  },
];

export const FILTERS = [
  { value: "all", labelKey: "economy:grants.filter.all" },
  { value: "individual", labelKey: "economy:grants.filter.individual" },
  { value: "org", labelKey: "economy:grants.filter.org" },
  { value: "arts", labelKey: "economy:grants.filter.arts" },
  { value: "community", labelKey: "economy:grants.filter.community" },
  { value: "eu", labelKey: "economy:grants.filter.eu" },
];

export const SECTIONS: { id: Section; labelKey: string }[] = [
  { id: "qp", labelKey: "economy:grants.section.qp" },
  { id: "pt", labelKey: "economy:grants.section.pt" },
  { id: "eu", labelKey: "economy:grants.section.eu" },
];

export const STATUS_LABEL_KEY: Record<Status, string> = {
  open: "economy:grants.status.open",
  rolling: "economy:grants.status.rolling",
  closed: "economy:grants.status.closed",
};

export const STEPS = [
  {
    n: "01",
    titleKey: "economy:grants.guide.step.criteria.title",
    bodyKey: "economy:grants.guide.step.criteria.body",
  },
  {
    n: "02",
    titleKey: "economy:grants.guide.step.story.title",
    bodyKey: "economy:grants.guide.step.story.body",
  },
  {
    n: "03",
    titleKey: "economy:grants.guide.step.community.title",
    bodyKey: "economy:grants.guide.step.community.body",
  },
  {
    n: "04",
    titleKey: "economy:grants.guide.step.review.title",
    bodyKey: "economy:grants.guide.step.review.body",
  },
];
