import { memberName } from "../members/data/members";

export type Cat =
  "therapy" | "legal" | "medical" | "dental" | "vet" | "finance" | "body";
export type Tint = "coral" | "jade" | "plum";

export interface Practitioner {
  id: string;
  name: string;
  category: Cat;
  spec: string;
  hood: string;
  langs: string[];
  isMember: boolean;
  range: string;
  scaleNote: string;
  description: string;
  tags: string[];
  tint: Tint;
}

export const PRACTITIONERS: Practitioner[] = [
  {
    id: "p1",
    name: memberName("mariana-costa"),
    category: "therapy",
    spec: "Psychotherapy & EMDR",
    hood: "Mouraria",
    langs: ["PT", "EN"],
    isMember: true,
    range: "€30 – €80",
    scaleNote:
      "Income-based. First session free to assess fit. No proof required — you set the amount.",
    description: "Queer-affirming, trauma-informed psychotherapy. Works with gender identity, relationship structures, and life transitions. In-person and remote.",
    tags: ["LGBTQ+", "trauma", "relationships", "trans-affirming"],
    tint: "jade",
  },
  {
    id: "p2",
    name: "Beatriz Melo",
    category: "legal",
    spec: "Immigration & Employment Law",
    hood: "Príncipe Real",
    langs: ["PT", "EN", "FR"],
    isMember: false,
    range: "€0 – €120/hr",
    scaleNote:
      "Name-your-price for community members earning under €1,400/month. Full rate for others.",
    description: "Specialises in NHR applications, D7 visas, residency renewals, and employment contracts. Bilingual consultations in PT, EN, or FR.",
    tags: ["visas", "NHR", "employment", "immigration"],
    tint: "plum",
  },
  {
    id: "p3",
    name: "Dr. Luís Ferreira",
    category: "medical",
    spec: "General Practice / SNS",
    hood: "Intendente",
    langs: ["PT", "EN"],
    isMember: false,
    range: "Free (SNS) or €35 private",
    scaleNote:
      "SNS patients pay nothing. Private appointments for those without a centros de saúde allocation — sliding scale for income under €1,200/month.",
    description: "LGBTQ+-affirming GP with experience in trans health. Provides referrals for gender dysphoria care within the SNS system. No judgement, ever.",
    tags: ["GP", "trans-affirming", "SNS", "HRT referrals"],
    tint: "jade",
  },
  {
    id: "p4",
    name: "Catarina Luz",
    category: "therapy",
    spec: "Sex & Relationship Therapy",
    hood: "Santos",
    langs: ["PT", "EN", "ES"],
    isMember: true,
    range: "€25 – €90",
    scaleNote:
      "Sliding scale based on income bracket. Three brackets: under €900, €900–1500, above €1500. You self-select, no questions asked.",
    description: "Relational and somatic sex therapy. Works with queer, poly, and kinky clients. No prior knowledge of your sexuality or relationship structure required.",
    tags: ["sex therapy", "poly", "kink", "somatic"],
    tint: "coral",
  },
  {
    id: "p5",
    name: "Ricardo Pais",
    category: "finance",
    spec: "Tax & Freelancer Accounting",
    hood: "Alfama",
    langs: ["PT", "EN"],
    isMember: true,
    range: "€40 – €150",
    scaleNote:
      "Flat rate for recibos verdes setup (€40). Annual IRS filing: sliding scale by income. Earners under €1,000/month pay €40.",
    description: "Certified accountant specialising in freelancers and self-employed community members. Recibos verdes, IRS, NHR regime, invoicing. Patient and thorough.",
    tags: ["tax", "freelance", "recibos verdes", "IRS"],
    tint: "plum",
  },
  {
    id: "p6",
    name: "Sofia Dinis",
    category: "dental",
    spec: "General Dentistry",
    hood: "Mouraria",
    langs: ["PT", "EN"],
    isMember: false,
    range: "€0 – €60 consultation",
    scaleNote:
      "Consultation and check-up on sliding scale. Treatment costs negotiated separately — no one is turned away for cost alone.",
    description: "Queer-welcoming dental practice. Trans patients: preferred name and pronouns on file from the first visit. Consultations in PT or EN.",
    tags: ["dental", "LGBTQ+ welcoming", "trans-affirming"],
    tint: "jade",
  },
  {
    id: "p7",
    name: "Nuno Gaspar",
    category: "vet",
    spec: "Small Animal Veterinary Care",
    hood: "Estrela",
    langs: ["PT", "EN"],
    isMember: false,
    range: "€15 – €55 consultation",
    scaleNote:
      "Consultation fee sliding scale. Treatments and medications at cost for verified community members in financial difficulty.",
    description: "Queer-owned veterinary practice. Cats, dogs, rabbits, and some small mammals. Emergency appointments prioritised for community members in crisis.",
    tags: ["pets", "cats", "dogs", "emergency"],
    tint: "coral",
  },
  {
    id: "p8",
    name: "Ana Branco",
    category: "body",
    spec: "Physiotherapy & Somatic Work",
    hood: "Bairro Alto",
    langs: ["PT", "EN"],
    isMember: true,
    range: "€25 – €75",
    scaleNote:
      "You set the amount within the range. Sessions are 50 minutes. No documentation needed.",
    description: "LGBTQ+-affirming physiotherapy and body-based therapy. Works with chronic pain, post-surgery recovery, and body-gender relationships. Trans clients very welcome.",
    tags: ["physiotherapy", "trans", "chronic pain", "post-surgery"],
    tint: "jade",
  },
  {
    id: "p9",
    name: "Joana Teixeira",
    category: "therapy",
    spec: "Psychiatry & Medication",
    hood: "Príncipe Real",
    langs: ["PT", "EN"],
    isMember: false,
    range: "€50 – €150",
    scaleNote:
      "Sliding scale by income. Earners under €1,000/month: €50. Community members can request a fee review at any time.",
    description: "Psychiatrist with expertise in gender dysphoria, trauma, and complex PTSD. Provides psychiatric support letters for gender-affirming procedures.",
    tags: ["psychiatry", "HRT support", "gender dysphoria", "PTSD"],
    tint: "plum",
  },
  {
    id: "p10",
    name: "Tiago Alves",
    category: "legal",
    spec: "Family & Housing Law",
    hood: "Cais do Sodré",
    langs: ["PT", "EN"],
    isMember: false,
    range: "€0 – €100/hr",
    scaleNote:
      "Pro bono for community members facing housing discrimination or family exclusion. Sliding scale for other cases.",
    description: "Specialises in housing rights, eviction defence, same-sex family law, and adoption. Has represented clients in hate-crime civil proceedings.",
    tags: ["housing", "family law", "adoption", "discrimination"],
    tint: "coral",
  },
  {
    id: "p11",
    name: "Marta Santos",
    category: "body",
    spec: "Massage & Trauma-Sensitive Bodywork",
    hood: "Graça",
    langs: ["PT", "EN"],
    isMember: true,
    range: "€20 – €60",
    scaleNote:
      "Name-your-price within range. Consent and boundaries discussed before every session. No pressure, ever.",
    description: "Trauma-sensitive massage practitioner. Works with survivors, people in gender transition, and anyone whose relationship with their body is complex.",
    tags: ["massage", "trauma-sensitive", "trans-affirming"],
    tint: "jade",
  },
  {
    id: "p12",
    name: "Pedro Rocha",
    category: "medical",
    spec: "Sexual Health & HIV Medicine",
    hood: "Intendente",
    langs: ["PT", "EN", "ES"],
    isMember: false,
    range: "Free – €40",
    scaleNote:
      "SNS referrals: free. Private consultations: sliding scale. PrEP access consultations always free for first visit.",
    description: "Specialist in sexual health, HIV prevention and treatment, PrEP, and PEP. Works with Checkpoint and GAT. No judgment, complete confidentiality.",
    tags: ["HIV", "PrEP", "PEP", "sexual health"],
    tint: "plum",
  },
];

export const TINT_BG: Record<Tint, string> = {
  coral: "rgba(var(--accent-rgb),.14)",
  jade: "rgba(var(--jade-rgb),.14)",
  plum: "rgba(var(--plum-rgb),.1)",
};
export const TINT_FG: Record<Tint, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade)",
  plum: "var(--plum)",
};

export const HOW: { n: string; titleKey: string; bodyKey: string }[] = [
  {
    n: "01",
    titleKey: "economy:solidarity.how.step1.title",
    bodyKey: "economy:solidarity.how.step1.body",
  },
  {
    n: "02",
    titleKey: "economy:solidarity.how.step2.title",
    bodyKey: "economy:solidarity.how.step2.body",
  },
  {
    n: "03",
    titleKey: "economy:solidarity.how.step3.title",
    bodyKey: "economy:solidarity.how.step3.body",
  },
];

export const FILTERS: { id: Cat | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "economy:solidarity.filter.all" },
  { id: "therapy", labelKey: "economy:solidarity.filter.therapy" },
  { id: "legal", labelKey: "economy:solidarity.filter.legal" },
  { id: "medical", labelKey: "economy:solidarity.filter.medical" },
  { id: "dental", labelKey: "economy:solidarity.filter.dental" },
  { id: "vet", labelKey: "economy:solidarity.filter.vet" },
  { id: "finance", labelKey: "economy:solidarity.filter.finance" },
  { id: "body", labelKey: "economy:solidarity.filter.body" },
];

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}
