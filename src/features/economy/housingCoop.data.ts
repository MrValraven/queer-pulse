import type { AvatarTint } from "../../shared/components/ui";
import type { CoopTemplateSlug } from "./coopTemplateContent.data";

export type { CoopTemplateSlug };

/** Hero stat rows — `value`/`valueKey` renders plain, `em` in coral italic
 *  after it. Platform-authored programme copy (same shape as
 *  `incubator.step.*`), so `label`/`value` are catalog keys; `em` figures are
 *  either live counts (kept as plain numeric strings) or the proper noun
 *  "Porto" (identical in both languages, so it carries no key — "Lisbon"
 *  does change to "Lisboa" in pt-PT, so that one gets `valueKey`). */
export interface CoopStat {
  labelKey: string;
  value?: string;
  valueKey?: string;
  em?: string;
}

export const COOP_STATS: CoopStat[] = [
  { labelKey: "economy:housingCoop.stats.activeGroups", em: "8" },
  { labelKey: "economy:housingCoop.stats.householdsHoused", em: "14" },
  { labelKey: "economy:housingCoop.stats.inPhase", em: "3" },
  {
    labelKey: "economy:housingCoop.stats.cities",
    valueKey: "economy:housingCoop.stats.citiesLisbon",
    em: "Porto",
  },
];

/** One step in the five-phase formation timeline. Platform-authored programme
 *  copy (same shape as `incubator.step.*`) — `name`/`nameEm`/`time`/`desc` are
 *  all catalog keys; `num` is a plain ordinal, not translated. */
export interface CoopPhase {
  number: string;
  nameKey: string;
  nameEmKey: string;
  timeKey: string;
  descKey: string;
}

export const COOP_PHASES: CoopPhase[] = [
  {
    number: "01",
    nameKey: "economy:housingCoop.phase.findPeople.name",
    nameEmKey: "economy:housingCoop.phase.findPeople.nameEm",
    timeKey: "economy:housingCoop.phase.findPeople.time",
    descKey: "economy:housingCoop.phase.findPeople.desc",
  },
  {
    number: "02",
    nameKey: "economy:housingCoop.phase.legalIncorporation.name",
    nameEmKey: "economy:housingCoop.phase.legalIncorporation.nameEm",
    timeKey: "economy:housingCoop.phase.legalIncorporation.time",
    descKey: "economy:housingCoop.phase.legalIncorporation.desc",
  },
  {
    number: "03",
    nameKey: "economy:housingCoop.phase.financeStructure.name",
    nameEmKey: "economy:housingCoop.phase.financeStructure.nameEm",
    timeKey: "economy:housingCoop.phase.financeStructure.time",
    descKey: "economy:housingCoop.phase.financeStructure.desc",
  },
  {
    number: "04",
    nameKey: "economy:housingCoop.phase.findProperty.name",
    nameEmKey: "economy:housingCoop.phase.findProperty.nameEm",
    timeKey: "economy:housingCoop.phase.findProperty.time",
    descKey: "economy:housingCoop.phase.findProperty.desc",
  },
  {
    number: "05",
    nameKey: "economy:housingCoop.phase.dailyGovernance.name",
    nameEmKey: "economy:housingCoop.phase.dailyGovernance.nameEm",
    timeKey: "economy:housingCoop.phase.dailyGovernance.time",
    descKey: "economy:housingCoop.phase.dailyGovernance.desc",
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
  description: string;
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
    description: "A 6-household co-op with a survey signed on a 19th-century triplex in Alfama. Closing target: September 2026. Trans-led. Looking for one more household before close.",
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
    description: "8 households organising around a former industrial building in Marvila offered by the municipality on long lease. Negotiating financing through Caixa Crédito Agrícola Mútuo & the Lisbon city housing fund.",
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
    description: "QueerPulse's first formed co-op. 9 households, 14 adults, 3 children. Mostly Black queer households, formed through the Cova da Moura tenants' association. Open to mentor new co-ops.",
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
    description: "First QueerPulse co-op in Porto. 5 households so far, looking for 3 more before incorporating. Monthly meetings at Centro Galiza. Mostly under 35.",
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

/** A downloadable formation template. Platform-authored programme copy — all
 *  four fields are catalog keys (same treatment as `COOP_PHASES` above). */
export interface CoopTemplate {
  tagKey: string;
  nameKey: string;
  nameEmKey: string;
  metaKey: string;
  /** Looks up the template's full in-app document in `COOP_TEMPLATE_CONTENT`
   *  (see `coopTemplateContent.data.tsx`). */
  slug: CoopTemplateSlug;
}

export const COOP_TEMPLATES: CoopTemplate[] = [
  {
    tagKey: "economy:housingCoop.template.foundingValues.tag",
    nameKey: "economy:housingCoop.template.foundingValues.name",
    nameEmKey: "economy:housingCoop.template.foundingValues.nameEm",
    metaKey: "economy:housingCoop.template.foundingValues.meta",
    slug: "founding-values",
  },
  {
    tagKey: "economy:housingCoop.template.financialHonesty.tag",
    nameKey: "economy:housingCoop.template.financialHonesty.name",
    nameEmKey: "economy:housingCoop.template.financialHonesty.nameEm",
    metaKey: "economy:housingCoop.template.financialHonesty.meta",
    slug: "financial-honesty",
  },
  {
    tagKey: "economy:housingCoop.template.crlStatutes.tag",
    nameKey: "economy:housingCoop.template.crlStatutes.name",
    nameEmKey: "economy:housingCoop.template.crlStatutes.nameEm",
    metaKey: "economy:housingCoop.template.crlStatutes.meta",
    slug: "crl-statutes",
  },
  {
    tagKey: "economy:housingCoop.template.shareAgreement.tag",
    nameKey: "economy:housingCoop.template.shareAgreement.name",
    nameEmKey: "economy:housingCoop.template.shareAgreement.nameEm",
    metaKey: "economy:housingCoop.template.shareAgreement.meta",
    slug: "share-agreement",
  },
  {
    tagKey: "economy:housingCoop.template.financeModel.tag",
    nameKey: "economy:housingCoop.template.financeModel.name",
    nameEmKey: "economy:housingCoop.template.financeModel.nameEm",
    metaKey: "economy:housingCoop.template.financeModel.meta",
    slug: "finance-model",
  },
  {
    tagKey: "economy:housingCoop.template.conflictResolution.tag",
    nameKey: "economy:housingCoop.template.conflictResolution.name",
    nameEmKey: "economy:housingCoop.template.conflictResolution.nameEm",
    metaKey: "economy:housingCoop.template.conflictResolution.meta",
    slug: "conflict-resolution",
  },
];

/** A mentor / partner row in the Start-a-co-op panel. `em` renders in coral —
 *  it's always a proper noun here (a co-op or partner-bank name) so it's
 *  never translated; `pre`/`post` are chrome connective text and `meta` a
 *  short chrome status label, so those resolve via `t()`. */
export interface CoopResource {
  preKey?: string;
  em?: string;
  postKey?: string;
  metaKey: string;
}

export const COOP_RESOURCES: CoopResource[] = [
  {
    em: "Casa Sambizanga",
    postKey: "economy:housingCoop.resource.sambizangaMentorsPost",
    metaKey: "economy:housingCoop.resource.sambizangaMentorsMeta",
  },
  {
    preKey: "economy:housingCoop.resource.qpLegalTeamPre",
    metaKey: "economy:housingCoop.resource.qpLegalTeamMeta",
  },
  {
    preKey: "economy:housingCoop.resource.housingFundLiaisonPre",
    metaKey: "economy:housingCoop.resource.housingFundLiaisonMeta",
  },
  {
    preKey: "economy:housingCoop.resource.caixaPre",
    em: "CCAM",
    postKey: "economy:housingCoop.resource.caixaPost",
    metaKey: "economy:housingCoop.resource.caixaMeta",
  },
  {
    preKey: "economy:housingCoop.resource.monthlyAssemblyPre",
    metaKey: "economy:housingCoop.resource.monthlyAssemblyMeta",
  },
];
