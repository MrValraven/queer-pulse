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

/**
 * i18n Pattern A. All chrome: a static nav rail (page-authored anchor labels).
 */
export const NAV = [
  { id: "health", labelKey: "governance:nav.health" },
  { id: "moderation", labelKey: "governance:nav.moderation" },
  { id: "council", labelKey: "governance:nav.council" },
  { id: "principles", labelKey: "governance:nav.principles" },
  { id: "finances", labelKey: "governance:nav.finances" },
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
    labelKey: "governance:governingDocs.annualAssembly.label",
    to: routes.annualAssembly,
    blurbKey: "governance:governingDocs.annualAssembly.blurb",
  },
  {
    labelKey: "governance:governingDocs.transparencyReport.label",
    to: routes.transparencyReport,
    blurbKey: "governance:governingDocs.transparencyReport.blurb",
  },
];

/**
 * i18n Pattern A/B. The quarterly health snapshot has no backend of its own
 * (unlike the finances section below) — it's hardcoded identically in demo and
 * live, so it's chrome, not fetched content. `n`/`up` stay plain data; `trend`
 * was a fused chrome+datum string ("↑ 38 this quarter") in the original, so it
 * now carries a key + optional interpolation values instead — see
 * `buildHealthStats(t)` in GovernanceSections.tsx.
 */
export const HEALTH: {
  n: string;
  labelKey: string;
  trendKey: string;
  trendValues?: { count: number };
  up: boolean;
}[] = [
  {
    n: "247",
    labelKey: "governance:health.stat.activeMembers.label",
    trendKey: "governance:health.trend.upThisQuarter",
    trendValues: { count: 38 },
    up: true,
  },
  {
    n: "96%",
    labelKey: "governance:health.stat.retention.label",
    trendKey: "governance:health.trend.steady",
    up: false,
  },
  {
    n: "12",
    labelKey: "governance:health.stat.reportsFiled.label",
    trendKey: "governance:health.trend.allResolved",
    up: false,
  },
  {
    n: "3",
    labelKey: "governance:health.stat.membersRemoved.label",
    trendKey: "governance:health.trend.cocViolations",
    up: false,
  },
  {
    n: "34",
    labelKey: "governance:health.stat.gatheringsHosted.label",
    trendKey: "governance:health.trend.upVsQ1",
    trendValues: { count: 8 },
    up: true,
  },
  {
    n: "1",
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
export const COUNCIL = [
  {
    i: MEMBERS.mariana!.initials,
    name: memberName("mariana"),
    roleKey: "governance:council.psychologistChair",
    bg: "rgba(74,140,111,.15)",
    color: "var(--jade)",
  },
  {
    i: MEMBERS["raquel-baptista"]!.initials,
    name: memberName("raquel-baptista"),
    roleKey: "governance:council.lawyerLegalAdvisor",
    bg: "rgba(122,82,184,.12)",
    color: "var(--violet)",
  },
  {
    i: MEMBERS["catarina-vaz"]!.initials,
    name: memberName("catarina-vaz"),
    roleKey: "governance:council.housingActivist",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
  },
  {
    i: MEMBERS.jonas!.initials,
    name: memberName("jonas"),
    roleKey: "governance:council.healthcareAdvocate",
    bg: "rgba(74,140,111,.12)",
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
}

export const INCOME: FinLine[] = [
  {
    label: "Member contributions",
    amount: "€1,840",
    note: "Sliding scale €5–€25/month. 99 of 247 members contribute. No one is required to. No one is chased.",
    width: 80,
    items: [
      {
        name: "Pay-what-you-can tier (€5–€9/mo)",
        period: "28 members",
        amount: "€504",
      },
      {
        name: "Standard tier (€10–€14/mo)",
        period: "38 members",
        amount: "€836",
      },
      {
        name: "Supporter tier (€15–€25/mo)",
        period: "33 members",
        amount: "€500",
      },
    ],
    total: { label: "99 contributing members", amount: "€1,840" },
  },
  {
    label: "Gathering ticket sales",
    amount: "€2,180",
    note: "Net figure. QueerPulse takes 0% of ticket revenue — 100% goes to hosts. This line covers only events we organise ourselves.",
    width: 94,
    items: [
      {
        name: "Newcomer welcome dinner (April)",
        period: "26 tickets · €8",
        amount: "€208",
      },
      {
        name: "Community skills fair (April)",
        period: "45 tickets · €12",
        amount: "€540",
      },
      {
        name: "Queer cinema nights × 2 (May–June)",
        period: "38 tickets · €10",
        amount: "€380",
      },
      {
        name: "Mental health workshops × 2",
        period: "24 tickets · €6",
        amount: "€144",
      },
      {
        name: "Summer community dinner (June)",
        period: "47 tickets · €18",
        amount: "€846",
      },
      { name: "Miscellaneous", period: "—", amount: "€62" },
    ],
    total: { label: "6 platform-run events", amount: "€2,180" },
  },
  {
    label: "Partner support",
    amount: "€600",
    note: "Restricted grants from two organisations. Disclosed in full below. Neither has any influence over platform decisions.",
    width: 26,
    items: [
      {
        name: "Fundação Calouste Gulbenkian",
        period: "Mental Health Fund",
        amount: "€400",
      },
      { name: "ILGA Portugal", period: "Community events", amount: "€200" },
    ],
    total: { label: "2 partners · restricted use only", amount: "€600" },
  },
];

export const EXPENSE: FinLine[] = [
  {
    label: "Platform & tools",
    amount: "€520",
    note: "Hosting, email infrastructure, storage, and development tools. No proprietary stack — we use open-source where possible.",
    width: 26,
    items: [
      {
        name: "Domain registration (queerpulse.pt + .com)",
        period: "€3/mo",
        amount: "€9",
      },
      { name: "Web server (Hetzner CX41)", period: "€20/mo", amount: "€60" },
      {
        name: "Database hosting (managed PostgreSQL)",
        period: "€28/mo",
        amount: "€84",
      },
      { name: "Email sending (Postmark)", period: "€24/mo", amount: "€72" },
      {
        name: "File & media storage (Backblaze B2)",
        period: "€9/mo",
        amount: "€27",
      },
      {
        name: "Video calls (Jitsi, self-hosted)",
        period: "€12/mo",
        amount: "€36",
      },
      {
        name: "Security & monitoring (Sentry + uptime)",
        period: "€22/mo",
        amount: "€66",
      },
      {
        name: "Development tools (GitHub Pro, CI)",
        period: "€15/mo",
        amount: "€45",
      },
      { name: "Design & collaboration tools", period: "€14/mo", amount: "€42" },
      { name: "Backup & disaster recovery", period: "€13/mo", amount: "€39" },
      { name: "Miscellaneous", period: "—", amount: "€40" },
    ],
    total: { label: "11 line items", amount: "€520" },
  },
  {
    label: "Community events",
    amount: "€1,240",
    note: "Venue hire, equipment, and materials for platform-organised gatherings. Newcomer events, mental health sessions, and community dinners.",
    width: 60,
    items: [
      {
        name: "Newcomer dinner — venue (Casa do Alentejo)",
        period: "April",
        amount: "€180",
      },
      {
        name: "Newcomer dinner — food & catering",
        period: "April",
        amount: "€220",
      },
      {
        name: "Trans healthcare session — equipment",
        period: "May · venue donated",
        amount: "€40",
      },
      {
        name: "Skills fair — venue hire (LX Factory)",
        period: "April",
        amount: "€280",
      },
      {
        name: "Skills fair — materials & printing",
        period: "April",
        amount: "€60",
      },
      {
        name: "Queer cinema nights × 2 (Cinema Ideal)",
        period: "May–June",
        amount: "€180",
      },
      {
        name: "Mental health peer support rooms × 4",
        period: "Quarterly",
        amount: "€80",
      },
      {
        name: "Archive Night room hire × 3",
        period: "Quarterly",
        amount: "€60",
      },
      { name: "Miscellaneous supplies", period: "—", amount: "€140" },
    ],
    total: { label: "9 line items · 7 events subsidised", amount: "€1,240" },
  },
  {
    label: "Mental health fund",
    amount: "€740",
    note: "Subsidised therapy sessions for members who need them. Funded in part by the Gulbenkian grant. 11 sessions this quarter.",
    width: 36,
    items: [
      {
        name: "Individual therapy subsidies (8 members)",
        period: "avg €46/session",
        amount: "€368",
      },
      {
        name: "Group therapy facilitation × 3 sessions",
        period: "€90/session",
        amount: "€270",
      },
      {
        name: "Crisis support disbursements (2 members)",
        period: "€51 each",
        amount: "€102",
      },
    ],
    total: { label: "11 sessions · 10 members supported", amount: "€740" },
  },
  {
    label: "Micro-grants",
    amount: "€800",
    note: "Direct financial support to members for community projects, emergency needs, and creative work. 6 grants this quarter.",
    width: 38,
    items: [
      {
        name: "Grant #1 — Housing emergency support",
        period: "—",
        amount: "€200",
      },
      {
        name: "Grant #2 — Creative project (documentary)",
        period: "—",
        amount: "€150",
      },
      {
        name: "Grant #3 — Trans healthcare travel costs",
        period: "—",
        amount: "€120",
      },
      {
        name: "Grant #4 — Community event materials",
        period: "—",
        amount: "€80",
      },
      {
        name: "Grant #5 — Skills training course fee",
        period: "—",
        amount: "€150",
      },
      {
        name: "Grant #6 — Emergency relocation support",
        period: "—",
        amount: "€100",
      },
    ],
    total: { label: "6 grants awarded this quarter", amount: "€800" },
  },
  {
    label: "Magazine production",
    amount: "€380",
    note: "Contributor honoraria, editorial costs, and design. Contributors are paid — no unpaid labour policy.",
    width: 18,
    items: [
      {
        name: "Contributor honoraria (9 pieces)",
        period: "avg €28/piece",
        amount: "€252",
      },
      {
        name: "Photography & illustration (2 pieces)",
        period: "—",
        amount: "€64",
      },
      { name: "Editorial coordination", period: "—", amount: "€40" },
      { name: "Design & layout", period: "—", amount: "€24" },
    ],
    total: { label: "Issue 18 · June 2026", amount: "€380" },
  },
  {
    label: "Moderator honoraria",
    amount: "€470",
    note: "Small quarterly payments to our three volunteer moderators. Moderation is difficult work and should not be entirely unpaid.",
    width: 22,
    items: [
      { name: "Mariana — lead moderator", period: "Q2 2026", amount: "€200" },
      { name: "Rui — moderator", period: "Q2 2026", amount: "€150" },
      {
        name: "Ana — moderator (part-time)",
        period: "Q2 2026",
        amount: "€120",
      },
    ],
    total: { label: "3 moderators", amount: "€470" },
  },
];

export const EVENTS: [string, string][] = [
  [
    "Hosts keep 100% of ticket sales.",
    "QueerPulse charges no platform fee. Sell 20 tickets at €8, you receive €160.",
  ],
  [
    "Sliding scale is mandatory.",
    "Every paid gathering must offer a reduced rate. Members request it privately, no explanation asked.",
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
    "34 gatherings hosted. ~€8,400 in ticket revenue — all of which went directly to hosts.",
  ],
];

/**
 * i18n Pattern A. The decision log is platform-authored institutional record —
 * fixed prose, identical in both modes, no backend of its own. `leadKey` is the
 * bolded lead sentence, `bodyKey` the rest of the paragraph.
 */
export const DECISIONS: { leadKey: string; bodyKey: string }[] = [
  {
    leadKey: "governance:decisions.slidingScale.lead",
    bodyKey: "governance:decisions.slidingScale.body",
  },
  {
    leadKey: "governance:decisions.forumLaunched.lead",
    bodyKey: "governance:decisions.forumLaunched.body",
  },
  {
    leadKey: "governance:decisions.visibilityDefaults.lead",
    bodyKey: "governance:decisions.visibilityDefaults.body",
  },
  {
    leadKey: "governance:decisions.languageToggle.lead",
    bodyKey: "governance:decisions.languageToggle.body",
  },
];

/**
 * The operational-reserve progress line and the two disclosed-partner rows in
 * `FinancesSection` are hardcoded prose with no backend of their own (unlike
 * `FIN_STATS`/`INCOME`/`EXPENSE`/`EVENTS` above, which `GET /governance/finances`
 * serves) — so per the scope rule they're chrome, and the surrounding sentence
 * is translated. The euro figures stay real numbers here and are formatted with
 * `useFormat().currency()` at render, never baked as pre-formatted strings.
 */
export const RESERVE_CURRENT = 4380;
export const RESERVE_TARGET = 12450;

export interface FinancePartner {
  name: string;
  amount: number;
  scopeKey: string;
}

export const FINANCE_PARTNERS: FinancePartner[] = [
  {
    name: "Fundação Calouste Gulbenkian",
    amount: 400,
    scopeKey: "governance:sections.finances.partnerScope.mentalHealthFund",
  },
  {
    name: "ILGA Portugal",
    amount: 200,
    scopeKey: "governance:sections.finances.partnerScope.communityEvents",
  },
];
