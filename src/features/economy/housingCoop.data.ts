import type { AvatarTint } from "../../shared/components/ui";

/** Hero stat rows — `value` renders plain, `em` in coral italic after it. */
export interface CoopStat {
  label: string;
  value?: string;
  em?: string;
}

export const COOP_STATS: CoopStat[] = [
  { label: "Active groups", em: "8" },
  { label: "Households housed", em: "14" },
  { label: "In phase 4–5", em: "3" },
  { label: "Cities", value: "Lisbon · ", em: "Porto" },
];

/** One step in the five-phase formation timeline. */
export interface CoopPhase {
  num: string;
  name: string;
  nameEm: string;
  time: string;
  desc: string;
}

export const COOP_PHASES: CoopPhase[] = [
  {
    num: "01",
    name: "Find",
    nameEm: "the people",
    time: "2–4 months",
    desc: "4–12 households who share values, calendar, money habits. Vibes test, financial honesty, exit clause.",
  },
  {
    num: "02",
    name: "Legal",
    nameEm: "incorporation",
    time: "1–3 months",
    desc: "CRL co-op structure, statutes, member shares. Templates for Portuguese law specifically.",
  },
  {
    num: "03",
    name: "Finance &",
    nameEm: "structure",
    time: "3–8 months",
    desc: "Member share capital, ethical bank financing, government supports, group fund mechanics.",
  },
  {
    num: "04",
    name: "Find",
    nameEm: "the property",
    time: "6–12 months",
    desc: "Survey, negotiate, sign. Most groups buy. Some lease-to-own. Some take long lease from public stock.",
  },
  {
    num: "05",
    name: "Daily",
    nameEm: "governance",
    time: "Forever",
    desc: "Decision-making, conflict, repairs, new members, succession. Tools that survive boredom & bad days.",
  },
];

/** A meta stat shown under a co-op card's description. */
export interface CoopMeta {
  label: string;
  value: string;
}

/** A single face in a co-op card's avatar stack. */
export interface CoopFace {
  initials: string;
  tint: AvatarTint;
}

export type CoopCtaKind = "join" | "updates" | "mentor";

/** A co-op currently forming (or operational) on the platform. */
export interface FormingCoop {
  id: string;
  name: string;
  nameEm?: string;
  location: string;
  phaseLabel: string;
  /** 0–100. Operational co-ops render a full jade bar. */
  progress: number;
  progressLabel: string;
  /** Coral/jade emphasis after the label (e.g. the operational-since date). */
  progressEm?: string;
  operational?: boolean;
  desc: string;
  meta: CoopMeta[];
  faces: CoopFace[];
  cta: { label: string; kind: CoopCtaKind };
}

export const FORMING_COOPS: FormingCoop[] = [
  {
    id: "casa-almirante",
    name: "Casa",
    nameEm: "Almirante",
    location: "Alfama, Lisbon · 6 households",
    phaseLabel: "Phase 4 · property",
    progress: 78,
    progressLabel: "78%",
    desc: "A 6-household co-op with a survey signed on a 19th-century triplex in Alfama. Closing target: September 2026. Trans-led. Looking for one more household before close.",
    meta: [
      { label: "Member shares", value: "€8k" },
      { label: "Monthly", value: "€420" },
      { label: "Forming since", value: "Oct 2024" },
    ],
    faces: [
      { initials: "MV", tint: "coral" },
      { initials: "DO", tint: "jade" },
      { initials: "YR", tint: "plum" },
      { initials: "RC", tint: "coral" },
      { initials: "SC", tint: "jade" },
      { initials: "+1", tint: "plum" },
    ],
    cta: { label: "Ask to join", kind: "join" },
  },
  {
    id: "cooperativa-antunes",
    name: "Cooperativa Antunes",
    location: "Marvila, Lisbon · 8 households",
    phaseLabel: "Phase 3 · finance",
    progress: 52,
    progressLabel: "52%",
    desc: "8 households organising around a former industrial building in Marvila offered by the municipality on long lease. Negotiating financing through Caixa Crédito Agrícola Mútuo & the Lisbon city housing fund.",
    meta: [
      { label: "Member shares", value: "€5k" },
      { label: "Monthly", value: "€340" },
      { label: "Forming since", value: "Mar 2025" },
    ],
    faces: [
      { initials: "HP", tint: "jade" },
      { initials: "MF", tint: "coral" },
      { initials: "CB", tint: "plum" },
      { initials: "IT", tint: "jade" },
      { initials: "PR", tint: "coral" },
      { initials: "+3", tint: "plum" },
    ],
    cta: { label: "Read updates", kind: "updates" },
  },
  {
    id: "casa-sambizanga",
    name: "Casa",
    nameEm: "Sambizanga",
    location: "Cova da Moura, Lisbon · 9 households",
    phaseLabel: "Phase 5 · daily",
    progress: 100,
    progressLabel: "Operational since",
    progressEm: "Jan 2024",
    operational: true,
    desc: "QueerPulse's first formed co-op. 9 households, 14 adults, 3 children. Mostly Black queer households, formed through the Cova da Moura tenants' association. Open to mentor new co-ops.",
    meta: [
      { label: "Member shares", value: "€4k" },
      { label: "Monthly", value: "€280" },
      { label: "Operating", value: "2 years" },
    ],
    faces: [
      { initials: "CS", tint: "coral" },
      { initials: "+13", tint: "jade" },
    ],
    cta: { label: "Request mentoring", kind: "mentor" },
  },
  {
    id: "porto-sem-nome",
    name: "Sem nome",
    nameEm: "ainda · Porto",
    location: "Cedofeita, Porto · 5 households",
    phaseLabel: "Phase 1 · forming",
    progress: 22,
    progressLabel: "22%",
    desc: "First QueerPulse co-op in Porto. 5 households so far, looking for 3 more before incorporating. Monthly meetings at Centro Galiza. Mostly under 35.",
    meta: [
      { label: "Target shares", value: "€6k" },
      { label: "Forming since", value: "Apr 2026" },
    ],
    faces: [
      { initials: "SR", tint: "jade" },
      { initials: "PA", tint: "coral" },
      { initials: "MM", tint: "plum" },
      { initials: "+2", tint: "jade" },
    ],
    cta: { label: "Ask to join", kind: "join" },
  },
];

/** A downloadable formation template. */
export interface CoopTemplate {
  tag: string;
  name: string;
  nameEm: string;
  meta: string;
}

export const COOP_TEMPLATES: CoopTemplate[] = [
  {
    tag: "Phase 1 · template",
    name: "Founding values &",
    nameEm: "vibes test",
    meta: "PDF · PT + EN · 14 pages",
  },
  {
    tag: "Phase 1 · template",
    name: "Financial honesty",
    nameEm: "worksheet",
    meta: "Spreadsheet · 1 sheet per member",
  },
  {
    tag: "Phase 2 · legal",
    name: "CRL co-op",
    nameEm: "statutes",
    meta: "DOCX · Portuguese law · vetted",
  },
  {
    tag: "Phase 2 · legal",
    name: "Member share",
    nameEm: "agreement",
    meta: "PDF · clauses for chosen family",
  },
  {
    tag: "Phase 3 · finance",
    name: "Group finance",
    nameEm: "model",
    meta: "Spreadsheet · with Lisbon & Porto data",
  },
  {
    tag: "Phase 5 · governance",
    name: "Conflict resolution",
    nameEm: "process",
    meta: "PDF · adapted from Casa Sambizanga",
  },
];

/** A mentor / partner row in the Start-a-co-op panel. `em` renders in coral. */
export interface CoopResource {
  pre?: string;
  em?: string;
  post?: string;
  meta: string;
}

export const COOP_RESOURCES: CoopResource[] = [
  { em: "Casa Sambizanga", post: " mentors", meta: "4 active" },
  { pre: "QP legal team", meta: "3 lawyers" },
  { pre: "Lisbon housing fund liaison", meta: "1 contact" },
  { pre: "Caixa ", em: "CCAM", post: " co-op desk", meta: "Partner" },
  { pre: "Monthly co-op assembly", meta: "First Sat" },
];
