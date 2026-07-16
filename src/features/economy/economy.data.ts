import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBookOpen,
  FiClipboard,
  FiClock,
  FiColumns,
  FiDollarSign,
  FiFileText,
  FiHeart,
  FiShield,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";

export type Tab = "incubator" | "freelance" | "salary";
export type Sector = "tech" | "design" | "creative" | "ngo" | "law";

export const JOBS = routes.jobs;
export const MENTORSHIP = routes.mentorship;

/** i18n Pattern A — platform-authored programme steps; IncubatorTab.tsx resolves titleKey/descKey/metaKey via t(). */
export const STEPS = [
  {
    n: 1,
    titleKey: "economy:incubator.step.apply.title",
    descKey: "economy:incubator.step.apply.desc",
    metaKey: "economy:incubator.step.apply.meta",
  },
  {
    n: 2,
    titleKey: "economy:incubator.step.match.title",
    descKey: "economy:incubator.step.match.desc",
    metaKey: "economy:incubator.step.match.meta",
  },
  {
    n: 3,
    titleKey: "economy:incubator.step.cohort.title",
    descKey: "economy:incubator.step.cohort.desc",
    metaKey: "economy:incubator.step.cohort.meta",
  },
  {
    n: 4,
    titleKey: "economy:incubator.step.demo.title",
    descKey: "economy:incubator.step.demo.desc",
    metaKey: "economy:incubator.step.demo.meta",
  },
];

/** A community member who mentors in the incubator. `slug` ties into the member
 *  registry (name, role, photo, tint all derive from there); `tags` are what they
 *  specifically mentor founders on. */
export interface IncMentor {
  slug: string;
  tags: string[];
}
export const INC_MENTORS: IncMentor[] = [
  { slug: "carla", tags: ["Product strategy", "Fundraising", "Hiring"] },
  { slug: "ines", tags: ["Brand & identity", "B2C", "Bootstrapping"] },
  { slug: "rui", tags: ["Engineering", "Infrastructure", "Open source"] },
  { slug: "jordan", tags: ["Team & culture", "Facilitation", "Cooperatives"] },
];

export interface ToolCard {
  icon: IconType;
  titleKey: string;
  descKey: string;
  ctaKey: string;
  to: string;
}

/** i18n Pattern A. Real document generators (PDF / copyable text), no backend — all chrome, a static tool directory. */
export const TOOLS: ToolCard[] = [
  {
    icon: FiDollarSign,
    titleKey: "economy:tool.invoice.title",
    descKey: "economy:tool.invoice.desc",
    ctaKey: "economy:tool.invoice.cta",
    to: routes.invoiceTool,
  },
  {
    icon: FiFileText,
    titleKey: "economy:tool.contract.title",
    descKey: "economy:tool.contract.desc",
    ctaKey: "economy:tool.contract.cta",
    to: routes.contractTool,
  },
  {
    icon: FiClipboard,
    titleKey: "economy:tool.scope.title",
    descKey: "economy:tool.scope.desc",
    ctaKey: "economy:tool.scope.cta",
    to: routes.scopeTool,
  },
  {
    icon: FiBookOpen,
    titleKey: "economy:tool.reciboGuide.title",
    descKey: "economy:tool.reciboGuide.desc",
    ctaKey: "economy:tool.reciboGuide.cta",
    to: routes.reciboVerdeGuide,
  },
];

/** Live calculators — real math from the dated tax constants. */
export const CALC_TOOLS: ToolCard[] = [
  {
    icon: FiTrendingUp,
    titleKey: "economy:tool.takeHome.title",
    descKey: "economy:tool.takeHome.desc",
    ctaKey: "economy:tool.takeHome.cta",
    to: routes.takeHomeTool,
  },
  {
    icon: FiClock,
    titleKey: "economy:tool.dayRate.title",
    descKey: "economy:tool.dayRate.desc",
    ctaKey: "economy:tool.dayRate.cta",
    to: routes.dayRateTool,
  },
  {
    icon: FiTarget,
    titleKey: "economy:tool.ivaTracker.title",
    descKey: "economy:tool.ivaTracker.desc",
    ctaKey: "economy:tool.ivaTracker.cta",
    to: routes.ivaTracker,
  },
  {
    icon: FiShield,
    titleKey: "economy:tool.setAside.title",
    descKey: "economy:tool.setAside.desc",
    ctaKey: "economy:tool.setAside.cta",
    to: routes.setAsideTool,
  },
  {
    icon: FiColumns,
    titleKey: "economy:tool.comparator.title",
    descKey: "economy:tool.comparator.desc",
    ctaKey: "economy:tool.comparator.cta",
    to: routes.comparatorTool,
  },
];

/** Community / solidarity tools. */
export const COMMUNITY_TOOLS: ToolCard[] = [
  {
    icon: FiBarChart2,
    titleKey: "economy:tool.rateBoard.title",
    descKey: "economy:tool.rateBoard.desc",
    ctaKey: "economy:tool.rateBoard.cta",
    to: routes.rateBoard,
  },
  {
    icon: FiHeart,
    titleKey: "economy:tool.slidingScale.title",
    descKey: "economy:tool.slidingScale.desc",
    ctaKey: "economy:tool.slidingScale.cta",
    to: routes.slidingScaleTool,
  },
];

export interface SalaryRow {
  sector: Sector;
  role: string;
  sectorLabel: string;
  money: string;
  exp: string;
  type: "Full" | "Freelance" | "Part";
  typeLabel: string;
}
export const SALARIES: SalaryRow[] = [
  {
    sector: "tech",
    role: "Senior Software Engineer",
    sectorLabel: "Tech · Lisbon",
    money: "€72,000",
    exp: "8 yrs",
    type: "Full",
    typeLabel: "Full-time",
  },
  {
    sector: "design",
    role: "UX Designer",
    sectorLabel: "Design · Lisbon",
    money: "€38,000",
    exp: "4 yrs",
    type: "Full",
    typeLabel: "Full-time",
  },
  {
    sector: "creative",
    role: "Graphic Designer",
    sectorLabel: "Creative · Freelance",
    money: "€45,000",
    exp: "6 yrs",
    type: "Freelance",
    typeLabel: "Freelance",
  },
  {
    sector: "ngo",
    role: "Programme Coordinator",
    sectorLabel: "NGO · Lisbon",
    money: "€22,500",
    exp: "3 yrs",
    type: "Full",
    typeLabel: "Full-time",
  },
  {
    sector: "tech",
    role: "Product Manager",
    sectorLabel: "Tech · Remote",
    money: "€58,000",
    exp: "6 yrs",
    type: "Full",
    typeLabel: "Full-time",
  },
  {
    sector: "creative",
    role: "Documentary Filmmaker",
    sectorLabel: "Creative · Project-based",
    money: "€32,000",
    exp: "5 yrs",
    type: "Freelance",
    typeLabel: "Freelance",
  },
  {
    sector: "law",
    role: "Associate Lawyer",
    sectorLabel: "Law · Lisbon",
    money: "€34,000",
    exp: "2 yrs",
    type: "Full",
    typeLabel: "Full-time",
  },
  {
    sector: "design",
    role: "Brand Consultant",
    sectorLabel: "Design · Freelance",
    money: "€55,000",
    exp: "10 yrs",
    type: "Freelance",
    typeLabel: "Freelance",
  },
  {
    sector: "tech",
    role: "Data Analyst",
    sectorLabel: "Tech · Lisbon",
    money: "€31,000",
    exp: "2 yrs",
    type: "Full",
    typeLabel: "Full-time",
  },
  {
    sector: "ngo",
    role: "Communications Manager",
    sectorLabel: "NGO · Hybrid",
    money: "€28,000",
    exp: "5 yrs",
    type: "Part",
    typeLabel: "Part-time",
  },
];
export const BADGE_CLASS: Record<SalaryRow["type"], string> = {
  Full: "badgeFull",
  Freelance: "badgeFreelance",
  Part: "badgePart",
};
/** i18n Pattern A — chrome filter chips, resolved via t() by SalaryTab. */
export const SAL_FILTERS: { id: Sector | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "economy:salary.filter.all" },
  { id: "tech", labelKey: "economy:salary.filter.tech" },
  { id: "design", labelKey: "economy:salary.filter.design" },
  { id: "creative", labelKey: "economy:salary.filter.creative" },
  { id: "ngo", labelKey: "economy:salary.filter.ngo" },
  { id: "law", labelKey: "economy:salary.filter.law" },
];

/**
 * @deprecated unused formatting helper — callers should use `useFormat().currency()`
 * instead so pt-PT gets its `1 234,56 €` suffix form rather than a hardcoded `€` prefix.
 */
export const euro = (n: number) => "€" + Math.round(n).toLocaleString("pt-PT");
