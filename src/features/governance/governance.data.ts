import type { IconType } from "react-icons";
import {
  FiLock,
  FiEye,
  FiSlash,
  FiMessageCircle,
  FiBookOpen,
} from "react-icons/fi";
import { MdAccessible } from "react-icons/md";
import { MEMBERS, memberName } from "../members/data/members";
import { routes } from "../../app/routeMap";
import type { ConcernCategory } from "./api/governance.api";

/**
 * i18n Pattern A. The concern categories `RaiseSection` offers, in the order
 * the select lists them. Each carries a stable payload value (persisted,
 * localisation-independent) and the i18n key for its visible label.
 */
export const CONCERN_OPTIONS: { value: ConcernCategory; labelKey: string }[] = [
  { value: "member", labelKey: "governance:sections.raise.option.member" },
  {
    value: "gathering",
    labelKey: "governance:sections.raise.option.gathering",
  },
  { value: "content", labelKey: "governance:sections.raise.option.content" },
  { value: "appeal", labelKey: "governance:sections.raise.option.appeal" },
  { value: "other", labelKey: "governance:sections.raise.option.other" },
];

/**
 * i18n Pattern A. All chrome: a static nav rail (page-authored anchor labels).
 */
export const NAV = [
  { id: "health", labelKey: "governance:nav.health" },
  { id: "moderation", labelKey: "governance:nav.moderation" },
  { id: "council", labelKey: "governance:nav.council" },
  { id: "principles", labelKey: "governance:nav.principles" },
  { id: "finances", labelKey: "governance:nav.finances" },
  { id: "proposals", labelKey: "governance:nav.proposals" },
  { id: "decisions", labelKey: "governance:nav.decisions" },
  { id: "raise", labelKey: "governance:nav.raise" },
];

/** i18n Pattern A. Platform-authored index of the constitutional documents. */
export const GOVERNING_DOCS = [
  {
    labelKey: "governance:governingDocs.constitution.label",
    to: routes.constitution,
    blurbKey: "governance:governingDocs.constitution.blurb",
  },
  {
    labelKey: "governance:governingDocs.codeOfConduct.label",
    to: routes.codeOfConduct,
    blurbKey: "governance:governingDocs.codeOfConduct.blurb",
  },
  {
    labelKey: "governance:governingDocs.transparency.label",
    to: routes.transparencyReport,
    blurbKey: "governance:governingDocs.transparency.blurb",
  },
];

/**
 * Admin-demo only. The invented health tiles seed the demo admin Policy
 * editor (`useAdminGovernanceOverview`); the public page reads the live
 * overview and shows its empty state in demo, so none of these figures
 * renders there.
 */
export const HEALTH: {
  value: string;
  labelKey: string;
  trendKey: string;
  trendValues?: { count: number };
  up: boolean;
}[] = [
  {
    value: "247",
    labelKey: "governance:health.stat.activeMembers.label",
    trendKey: "governance:health.trend.upThisQuarter",
    trendValues: { count: 38 },
    up: true,
  },
  {
    value: "96%",
    labelKey: "governance:health.stat.retention.label",
    trendKey: "governance:health.trend.steady",
    up: false,
  },
  {
    value: "12",
    labelKey: "governance:health.stat.reportsFiled.label",
    trendKey: "governance:health.trend.allResolved",
    up: false,
  },
  {
    value: "3",
    labelKey: "governance:health.stat.membersRemoved.label",
    trendKey: "governance:health.trend.cocViolations",
    up: false,
  },
  {
    value: "34",
    labelKey: "governance:health.stat.gatheringsHosted.label",
    trendKey: "governance:health.trend.upVsQ1",
    trendValues: { count: 8 },
    up: true,
  },
  {
    value: "1",
    labelKey: "governance:health.stat.appealUpheld.label",
    trendKey: "governance:health.trend.ofFiled",
    trendValues: { count: 2 },
    up: false,
  },
];

/** i18n Pattern A. The moderation process rail — platform-authored procedure. */
export const STEPS = [
  {
    titleKey: "governance:steps.reportFiled.title",
    textKey: "governance:steps.reportFiled.text",
  },
  {
    titleKey: "governance:steps.review.title",
    textKey: "governance:steps.review.text",
  },
  {
    titleKey: "governance:steps.decision.title",
    textKey: "governance:steps.decision.text",
  },
  {
    titleKey: "governance:steps.appeal.title",
    textKey: "governance:steps.appeal.text",
  },
];

/**
 * i18n Pattern A. `name` stays a real member's name (from the member registry);
 * `role` is this page's own short descriptor of their council seat, so it's
 * translated as platform chrome via `roleKey`.
 */
/**
 * The demo council.
 *
 * A live seat names someone on the platform STAFF roster and the backend
 * resolves their profile, so these mocks are drawn from the demo staff roster
 * (`ADMIN_STAFF_ROSTER_DEMO`) and carry the fields a resolved seat has — slug,
 * name, initials, photo. Seating a demo member who is not staff would show a
 * council the real editor cannot produce.
 */
export const COUNCIL = [
  {
    slug: "mariana",
    initials: MEMBERS.mariana!.initials,
    name: memberName("mariana"),
    avatarUrl: MEMBERS.mariana!.photo ?? null,
    roleKey: "governance:council.psychologistChair",
    background: "rgba(74,140,111,.15)",
    color: "var(--jade)",
  },
  {
    slug: "ana",
    initials: MEMBERS.ana!.initials,
    name: memberName("ana"),
    avatarUrl: MEMBERS.ana!.photo ?? null,
    roleKey: "governance:council.lawyerLegalAdvisor",
    background: "rgba(122,82,184,.12)",
    color: "var(--violet)",
  },
  {
    slug: "ines",
    initials: MEMBERS.ines!.initials,
    name: memberName("ines"),
    avatarUrl: MEMBERS.ines!.photo ?? null,
    roleKey: "governance:council.housingActivist",
    background: "rgba(45,27,61,.1)",
    color: "var(--plum)",
  },
  {
    slug: "rui",
    initials: MEMBERS.rui!.initials,
    name: memberName("rui"),
    avatarUrl: MEMBERS.rui!.photo ?? null,
    roleKey: "governance:council.healthcareAdvocate",
    background: "rgba(74,140,111,.12)",
    color: "var(--jade)",
  },
];

/** i18n Pattern A. Platform principles — fixed policy prose, chrome either way. */
export const PRINCIPLES: {
  icon: IconType;
  titleKey: string;
  textKey: string;
}[] = [
  {
    icon: FiLock,
    titleKey: "governance:principles.noSellingData.title",
    textKey: "governance:principles.noSellingData.text",
  },
  {
    icon: FiEye,
    titleKey: "governance:principles.visibilityChoice.title",
    textKey: "governance:principles.visibilityChoice.text",
  },
  {
    icon: FiSlash,
    titleKey: "governance:principles.noAlgorithms.title",
    textKey: "governance:principles.noAlgorithms.text",
  },
  {
    icon: FiMessageCircle,
    titleKey: "governance:principles.communityVoice.title",
    textKey: "governance:principles.communityVoice.text",
  },
  {
    icon: FiBookOpen,
    titleKey: "governance:principles.transparency.title",
    textKey: "governance:principles.transparency.text",
  },
  {
    icon: MdAccessible,
    titleKey: "governance:principles.accessNotConditional.title",
    textKey: "governance:principles.accessNotConditional.text",
  },
];

export const FIN_STATS = [
  {
    n: "€4,620",
    l: "Total income this quarter",
    trend: "↑ €380 vs Q1",
    up: true,
  },
  { n: "€4,150", l: "Total expenditure", trend: "Within budget", up: false },
  { n: "€470", l: "Quarterly surplus", trend: "Added to reserve", up: false },
  {
    n: "28",
    l: "Members on free or reduced access",
    trend: "No questions asked",
    up: false,
  },
];

export interface FinLine {
  label: string;
  amount: string;
  note: string;
  width: number;
  items: { name: string; period: string; amount: string }[];
  total: { label: string; amount: string };
  /** Whether this row renders on the admin Finances tab. Absent means
   *  enabled. Not read by the public transparency page. */
  enabled?: boolean;
}

export const EVENTS: [string, string][] = [
  [
    "Hosts keep 100% of ticket sales.",
    "QueerPulse charges no platform fee. Sell 20 tickets at €8, you receive €160.",
  ],
  [
    "Sliding scale is mandatory.",
    "Every paid event must offer a reduced rate. Members request it privately, no explanation asked.",
  ],
  [
    "QueerPulse subsidises specific event types.",
    "Newcomer, mental health, and education events can apply for a venue subsidy. We covered 7 this quarter.",
  ],
  [
    "No paid promotion.",
    "Events are never ranked by payment. Only recency and community engagement affect visibility.",
  ],
  [
    "This quarter:",
    "34 events hosted. ~€8,400 in ticket revenue, all of which went directly to hosts.",
  ],
];

/**
 * Admin-demo only. The public Governance page no longer reads any of the
 * finance fixtures in this file (`FIN_STATS`, `EVENTS`, `RESERVE_*`,
 * `FINANCE_PARTNERS`, `HEALTH`): demo and live both render the empty states
 * until a real report is published. Only the admin demo hooks
 * (`useAdminGovernanceFinances`, `useAdminGovernanceOverview`) still seed
 * their editors from them; remove them there first, then here.
 */
export const RESERVE_CURRENT = 4380;
export const RESERVE_TARGET = 12450;

export interface FinancePartner {
  name: string;
  amount: number;
  scopeKey?: string;
  scope?: string;
}

// Demo fixture: the partners, venues and vendors in this file are fictional
// (PRD-447), so the sandbox never names a real organisation as a funder.
export const FINANCE_PARTNERS: FinancePartner[] = [
  {
    name: "Harbour Light Foundation",
    amount: 400,
    scopeKey: "governance:sections.finances.partnerScope.mentalHealthFund",
  },
  {
    name: "Riverside Rights Collective",
    amount: 200,
    scopeKey: "governance:sections.finances.partnerScope.communityEvents",
  },
];
