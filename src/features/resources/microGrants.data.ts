import type { IconType } from "react-icons";
import { FiBook, FiHeart, FiPenTool, FiSun, FiUsers } from "react-icons/fi";
import { LuScale } from "react-icons/lu";
import { memberName } from "../members/data/members";

export interface Grant {
  amount: string;
  name: string;
  desc: string;
  tags: string[];
  status: "in-progress" | "awarded";
  statusLabel: string;
}

export interface BudgetRow {
  id: number;
  item: string;
  amount: string;
}

export const HOW = [
  {
    n: "01",
    title: "Members contribute",
    body: "Members who can afford to contribute add to the quarterly pot — any amount, from €5 upwards. No pressure, no minimum.",
  },
  {
    n: "02",
    title: "Projects apply",
    body: "Any QueerPulse member can apply for a grant. One page: what the project is, how much you need, what it will do.",
  },
  {
    n: "03",
    title: "Community decides",
    body: "A rotating panel of 5 members reviews applications. Decisions published in full with reasoning. No appeals — but the next round is always open.",
  },
  {
    n: "04",
    title: "Projects report back",
    body: "Recipients share a short update at 3 months. What happened, what changed, what they spent. Everything published in the magazine.",
  },
];

export const CRITERIA = [
  "You are a QueerPulse member in good standing",
  "The project benefits the queer community in Lisbon — not just you personally",
  "You can deliver it within 3 months of receiving the grant",
  "You are willing to share a brief public update on what happened",
  "The money will genuinely change what is possible — not just make it faster",
];

export const CURRENT: Grant[] = [
  {
    amount: "€800",
    name: "Corpo Presente — touring exhibition costs",
    desc: "Lena Ferraz's embroidered textile works touring queer community spaces in Lisbon — covering transport, installation materials, and printing a proper catalogue.",
    tags: ["art", "trans", "textile"],
    status: "in-progress",
    statusLabel: "In progress",
  },
  {
    amount: "€500",
    name: "Queer reading group starter kit — 12 groups",
    desc: "Books, hosting costs, and printed materials for 12 new reading groups across Lisbon. Each group gets a library of 6 titles to start from.",
    tags: ["reading", "community", "education"],
    status: "in-progress",
    statusLabel: "In progress",
  },
  {
    amount: "€1,200",
    name: "GAT Lisboa volunteer supplies (naloxone + testing kits)",
    desc: "Topping up the harm reduction supply stock at GAT Lisboa — naloxone kits, rapid test strips, and safer sex supplies for the next quarter of outreach nights.",
    tags: ["harm reduction", "health", "community"],
    status: "in-progress",
    statusLabel: "In progress",
  },
];

export const PAST: Grant[] = [
  {
    amount: "€600",
    name: "Legal name change accompaniment fund",
    desc: "Covering transport, printing, and time costs for 14 trans community members navigating the Conservatória process with ILGA accompaniment.",
    tags: ["legal", "trans", "accompaniment"],
    status: "awarded",
    statusLabel: "Completed",
  },
  {
    amount: "€400",
    name: "Supper club sliding-scale meals — 6 editions",
    desc: "Subsidising twelve seats per supper club edition for community members in financial difficulty. Six months of monthly dinners.",
    tags: ["food", "community", "access"],
    status: "awarded",
    statusLabel: "Completed",
  },
  {
    amount: "€900",
    name: "Harm reduction zine — 2,000 copies",
    desc: "Printing and distribution of a queer harm reduction zine across Lisbon venues, clinics, and community spaces. Plain language, honest, no moralising.",
    tags: ["harm reduction", "print", "health"],
    status: "awarded",
    statusLabel: "Completed",
  },
  {
    amount: "€350",
    name: "Emergency deaf/HoH queer group — interpreter fees",
    desc: "Covering sign language interpreter costs for four community events to make them accessible to deaf and hard-of-hearing members.",
    tags: ["accessibility", "deaf", "community"],
    status: "awarded",
    statusLabel: "Completed",
  },
];

export const RULES = [
  {
    title: "One grant per member",
    body: "Per calendar year. Collaborative projects can apply as a group.",
  },
  {
    title: "Maximum €2,000",
    body: "For larger projects, we encourage applying across multiple rounds or pairing with the Barter exchange.",
  },
  {
    title: "Community benefit required",
    body: "Must benefit queer people in Lisbon beyond the applicant. Personal projects are not eligible.",
  },
  {
    title: "Public reporting",
    body: "A brief update at 3 months — published here and in the magazine. No repayment, but accountability matters.",
  },
  {
    title: "No political campaigns",
    body: "We fund community projects, not election or party-political activity.",
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

export const CATEGORIES: { icon: IconType; name: string; sub: string }[] = [
  {
    icon: FiPenTool,
    name: "Creative & art",
    sub: "Exhibitions, prints, performances",
  },
  {
    icon: FiBook,
    name: "Education & knowledge",
    sub: "Workshops, guides, resources",
  },
  {
    icon: FiHeart,
    name: "Health & wellbeing",
    sub: "Mental health, harm reduction",
  },
  { icon: LuScale, name: "Legal & advocacy", sub: "Rights, accompaniment" },
  { icon: FiUsers, name: "Community & space", sub: "Gatherings, mutual aid" },
  { icon: FiSun, name: "Other", sub: "Something that doesn't fit neatly" },
];

export const COMMITMENTS = [
  "I will share a brief public update at 3 months — what happened, what was spent, what changed.",
  "This project genuinely benefits the queer community in Lisbon, not just me personally.",
  "I can deliver this within 3 months of receiving the grant.",
];

export const STEP_LABELS = [
  "Choose a category",
  "Project details",
  "Budget breakdown",
  "About you",
  "Review & submit",
];
export const TOTAL_STEPS = 5;
