import type { IconType } from "react-icons";
import { FiBook, FiHeart, FiPenTool, FiSun, FiUsers } from "react-icons/fi";
import { LuScale } from "react-icons/lu";
import { memberName } from "../members/data/members";

export interface Grant {
  amount: string;
  name: string;
  description: string;
  tags: string[];
  status: "in-progress" | "awarded";
  statusLabel: string;
}

export interface BudgetRow {
  id: number;
  item: string;
  amount: string;
}

/** i18n Pattern A — `n` is the stable display number; `titleKey`/`bodyKey` resolve via `t()`. */
export const HOW = [
  {
    n: "01",
    titleKey: "resources:microGrants.how.01.title",
    bodyKey: "resources:microGrants.how.01.body",
  },
  {
    n: "02",
    titleKey: "resources:microGrants.how.02.title",
    bodyKey: "resources:microGrants.how.02.body",
  },
  {
    n: "03",
    titleKey: "resources:microGrants.how.03.title",
    bodyKey: "resources:microGrants.how.03.body",
  },
  {
    n: "04",
    titleKey: "resources:microGrants.how.04.title",
    bodyKey: "resources:microGrants.how.04.body",
  },
];

/** i18n Pattern A — each entry is a catalog key, resolved via `t()` at render. */
export const CRITERIA_KEYS = [
  "resources:microGrants.criteria.member",
  "resources:microGrants.criteria.benefit",
  "resources:microGrants.criteria.timeline",
  "resources:microGrants.criteria.update",
  "resources:microGrants.criteria.impact",
];

export const CURRENT: Grant[] = [
  {
    amount: "€800",
    name: "Corpo Presente — touring exhibition costs",
    description: "Lena Ferraz's embroidered textile works touring queer community spaces in Lisbon — covering transport, installation materials, and printing a proper catalogue.",
    tags: ["art", "trans", "textile"],
    status: "in-progress",
    statusLabel: "In progress",
  },
  {
    amount: "€500",
    name: "Queer reading group starter kit — 12 groups",
    description: "Books, hosting costs, and printed materials for 12 new reading groups across Lisbon. Each group gets a library of 6 titles to start from.",
    tags: ["reading", "community", "education"],
    status: "in-progress",
    statusLabel: "In progress",
  },
  {
    amount: "€1,200",
    name: "GAT Lisboa volunteer supplies (naloxone + testing kits)",
    description: "Topping up the harm reduction supply stock at GAT Lisboa — naloxone kits, rapid test strips, and safer sex supplies for the next quarter of outreach nights.",
    tags: ["harm reduction", "health", "community"],
    status: "in-progress",
    statusLabel: "In progress",
  },
];

export const PAST: Grant[] = [
  {
    amount: "€600",
    name: "Legal name change accompaniment fund",
    description: "Covering transport, printing, and time costs for 14 trans community members navigating the Conservatória process with ILGA accompaniment.",
    tags: ["legal", "trans", "accompaniment"],
    status: "awarded",
    statusLabel: "Completed",
  },
  {
    amount: "€400",
    name: "Supper club sliding-scale meals — 6 editions",
    description: "Subsidising twelve seats per supper club edition for community members in financial difficulty. Six months of monthly dinners.",
    tags: ["food", "community", "access"],
    status: "awarded",
    statusLabel: "Completed",
  },
  {
    amount: "€900",
    name: "Harm reduction zine — 2,000 copies",
    description: "Printing and distribution of a queer harm reduction zine across Lisbon venues, clinics, and community spaces. Plain language, honest, no moralising.",
    tags: ["harm reduction", "print", "health"],
    status: "awarded",
    statusLabel: "Completed",
  },
  {
    amount: "€350",
    name: "Emergency deaf/HoH queer group — interpreter fees",
    description: "Covering sign language interpreter costs for four community events to make them accessible to deaf and hard-of-hearing members.",
    tags: ["accessibility", "deaf", "community"],
    status: "awarded",
    statusLabel: "Completed",
  },
];

/** i18n Pattern A — `titleKey`/`bodyKey` resolve via `t()`. */
export const RULES = [
  {
    titleKey: "resources:microGrants.rule.oneGrant.title",
    bodyKey: "resources:microGrants.rule.oneGrant.body",
  },
  {
    titleKey: "resources:microGrants.rule.maximum.title",
    bodyKey: "resources:microGrants.rule.maximum.body",
  },
  {
    titleKey: "resources:microGrants.rule.benefit.title",
    bodyKey: "resources:microGrants.rule.benefit.body",
  },
  {
    titleKey: "resources:microGrants.rule.reporting.title",
    bodyKey: "resources:microGrants.rule.reporting.body",
  },
  {
    titleKey: "resources:microGrants.rule.noPolitics.title",
    bodyKey: "resources:microGrants.rule.noPolitics.body",
  },
];

export const PANEL = [
  { title: "Mariana Costa", body: "Psychotherapist · Mouraria" },
  { title: memberName("rui"), body: "Software engineer · Bairro Alto" },
  { title: memberName("beatriz"), body: "Ceramicist · Graça" },
  {
    title: "+ 2 community members",
    body: "Rotating seats — open to any member who hasn't applied this round",
  },
];

/** i18n Pattern A — `nameKey`/`subKey` resolve via `t()`. */
export const CATEGORIES: { icon: IconType; nameKey: string; subKey: string }[] =
  [
    {
      icon: FiPenTool,
      nameKey: "resources:microGrants.apply.category.creative.name",
      subKey: "resources:microGrants.apply.category.creative.sub",
    },
    {
      icon: FiBook,
      nameKey: "resources:microGrants.apply.category.education.name",
      subKey: "resources:microGrants.apply.category.education.sub",
    },
    {
      icon: FiHeart,
      nameKey: "resources:microGrants.apply.category.health.name",
      subKey: "resources:microGrants.apply.category.health.sub",
    },
    {
      icon: LuScale,
      nameKey: "resources:microGrants.apply.category.legal.name",
      subKey: "resources:microGrants.apply.category.legal.sub",
    },
    {
      icon: FiUsers,
      nameKey: "resources:microGrants.apply.category.community.name",
      subKey: "resources:microGrants.apply.category.community.sub",
    },
    {
      icon: FiSun,
      nameKey: "resources:microGrants.apply.category.other.name",
      subKey: "resources:microGrants.apply.category.other.sub",
    },
  ];

/** i18n Pattern A — each entry is a catalog key, resolved via `t()` at render. */
export const COMMITMENT_KEYS = [
  "resources:microGrants.apply.commitment.update",
  "resources:microGrants.apply.commitment.benefit",
  "resources:microGrants.apply.commitment.timeline",
];

/** i18n Pattern A — each entry is a catalog key, resolved via `t()` at render. */
export const STEP_LABEL_KEYS = [
  "resources:microGrants.apply.stepLabel.category",
  "resources:microGrants.apply.stepLabel.project",
  "resources:microGrants.apply.stepLabel.budget",
  "resources:microGrants.apply.stepLabel.about",
  "resources:microGrants.apply.stepLabel.review",
];
export const TOTAL_STEPS = 5;
