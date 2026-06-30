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

export const STEPS = [
  {
    n: 1,
    title: "Apply",
    desc: "A short application — your idea, where you are, what you need. No pitch deck required. Decisions in 3 weeks.",
    meta: "Applications open · Deadline 30 Jul",
  },
  {
    n: 2,
    title: "Match with a mentor",
    desc: "Matched to a community mentor based on your sector, stage, and what you told us you need. You meet fortnightly for six months.",
    meta: "Sep–Feb · Fortnightly sessions",
  },
  {
    n: 3,
    title: "Cohort sessions",
    desc: "Monthly workshops with the full cohort — legal, finance, fundraising, design — plus time for peer support and honest conversation.",
    meta: "First Saturday of every month",
  },
  {
    n: 4,
    title: "Demo night",
    desc: "Share what you've built with the community, investors, and the press. Low-stakes, high-support. You decide how much to reveal.",
    meta: "March · Invite-only",
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
  title: string;
  desc: string;
  cta: string;
  to: string;
}

/** Real document generators (PDF / copyable text), no backend. */
export const TOOLS: ToolCard[] = [
  {
    icon: FiDollarSign,
    title: "Invoice maker",
    desc: "Build a clean, Portuguese-correct fatura-recibo — NIF, IVA options, the art. 53.º exemption and art. 101.º-B dispensa notes — and save it as a real PDF. Your details are remembered for next time.",
    cta: "Open invoice maker",
    to: routes.invoiceTool,
  },
  {
    icon: FiFileText,
    title: "Contract builder",
    desc: "Assemble a freelance services contract clause by clause — scope, payment, IP, cancellation, confidentiality. Download a PDF or copy the text to edit.",
    cta: "Open contract builder",
    to: routes.contractTool,
  },
  {
    icon: FiClipboard,
    title: "Scope & quote builder",
    desc: "Spell out exactly what you're delivering, what you're not, revisions, and timeline — add a price to turn it into a quote. Export a PDF that prevents most disputes.",
    cta: "Open scope builder",
    to: routes.scopeTool,
  },
  {
    icon: FiBookOpen,
    title: "Recibos verdes guide",
    desc: "A plain-language guide to the Portuguese freelance tax system — registering, retention, IVA, Segurança Social, and your first year. Always current.",
    cta: "Read the guide",
    to: routes.reciboVerdeGuide,
  },
];

/** Live calculators — real math from the dated tax constants. */
export const CALC_TOOLS: ToolCard[] = [
  {
    icon: FiTrendingUp,
    title: "Take-home calculator",
    desc: "Turn your gross freelance income into what you actually keep — after IRS and Segurança Social, with the regime-simplificado coefficients and your first years built in.",
    cta: "Open calculator",
    to: routes.takeHomeTool,
  },
  {
    icon: FiClock,
    title: "Day-rate calculator",
    desc: "Work back from the income you need to a day (and hourly) rate that actually sustains you — overhead, unpaid days, and IVA included.",
    cta: "Open calculator",
    to: routes.dayRateTool,
  },
  {
    icon: FiTarget,
    title: "IVA threshold tracker",
    desc: "Track your invoiced income against the €15,000 art. 53.º exemption limit, so crossing it never takes you by surprise. Saved on your device.",
    cta: "Open tracker",
    to: routes.ivaTracker,
  },
  {
    icon: FiShield,
    title: "Tax set-aside planner",
    desc: "Work out what slice of every invoice to park now, and keep a running pot, so the IRS and Segurança Social bills never sting later.",
    cta: "Open planner",
    to: routes.setAsideTool,
  },
  {
    icon: FiColumns,
    title: "Freelance vs salaried",
    desc: "Compare what you'd actually take home as a freelancer versus an equivalent salary — net for net, with the costs a payslip hides.",
    cta: "Compare",
    to: routes.comparatorTool,
  },
];

/** Community / solidarity tools. */
export const COMMUNITY_TOOLS: ToolCard[] = [
  {
    icon: FiBarChart2,
    title: "Rate transparency board",
    desc: "Anonymous day rates shared by the community, by role and experience — so nobody has to guess what to charge. Add yours, see where you stand.",
    cta: "Open the board",
    to: routes.rateBoard,
  },
  {
    icon: FiHeart,
    title: "Sliding-scale price card",
    desc: "Publish a sliding scale so people pay what fits their means and you still get paid fairly. Build a card and export it to share.",
    cta: "Build a card",
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
export const SAL_FILTERS: { id: Sector | "all"; label: string }[] = [
  { id: "all", label: "All sectors" },
  { id: "tech", label: "Tech" },
  { id: "design", label: "Design" },
  { id: "creative", label: "Creative" },
  { id: "ngo", label: "NGO / non-profit" },
  { id: "law", label: "Law" },
];

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("pt-PT");
