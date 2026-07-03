/**
 * Static content for the Sustainer page. Values are copy + light structure only;
 * anything that depends on the CSS module (tint class maps) stays in components.
 */
import type { TierName } from "./sustainer.pricing";

/** Where contributions go — the impact grid. `tint` maps to a dot colour class. */
export type ImpactTint = "jade" | "accent" | "plumSoft" | "jadeSoft";
export const IMPACT_CARDS: {
  tint: ImpactTint;
  title: string;
  desc: string;
}[] = [
  {
    tint: "jade",
    title: "Moderation & safety",
    desc: "Reviewing reports, managing appeals, and keeping the community a place people actually want to be in.",
  },
  {
    tint: "accent",
    title: "Hosting & infrastructure",
    desc: "Servers, email delivery, backups, and the small army of services that make it all reliable.",
  },
  {
    tint: "plumSoft",
    title: "The team",
    desc: "Two part-time people and a small contractor budget. We pay fair wages. That costs money.",
  },
  {
    tint: "jadeSoft",
    title: "Free access for everyone",
    desc: "Supporting members make it possible for the platform to stay free for everyone else. Always.",
  },
];

/** Monthly running-cost breakdown for the transparency block. */
export type BudgetTint = "plum" | "accent" | "jade" | "plumSoft" | "ink";
export const BUDGET_ROWS: {
  name: string;
  pct: number;
  tint: BudgetTint;
  amount: string;
}[] = [
  { name: "Team (2 part-time)", pct: 100, tint: "plum", amount: "€1,900" },
  {
    name: "Magazine & contributors",
    pct: 19,
    tint: "accent",
    amount: "€360",
  },
  {
    name: "Hosting & infrastructure",
    pct: 13,
    tint: "jade",
    amount: "€240",
  },
  {
    name: "Moderation & safety tools",
    pct: 8,
    tint: "plumSoft",
    amount: "€160",
  },
  { name: "Payment processing", pct: 5, tint: "ink", amount: "€90" },
];
export const BUDGET_TOTAL = "€2,750";

/** Per-tier perk lists and the little microlabel under each name. */
export const TIER_MICROLABELS: Record<TierName, string> = {
  Supporter: "Popular with new members",
  Friend: "The sweet spot",
  Patron: "Best for regulars",
};
export const TIER_PERKS: Record<TierName, string[]> = {
  Supporter: [
    "Sustainer badge on your profile",
    "Name in monthly thank-you post",
    "Our genuine gratitude",
  ],
  Friend: [
    "Everything in Supporter",
    "Early access to new features",
    "Sustainer badge (Rare)",
    "10 XP credited monthly",
  ],
  Patron: [
    "Everything in Friend",
    "Name in annual supporters list",
    "Direct line to the team",
    "Input on roadmap priorities",
  ],
};

export const HERO_CHIPS = [
  "Built by a small team",
  "No investors",
  "Free forever",
];

export const HOW_STEPS = [
  "Pick an amount that feels right for you",
  "Pay securely — card, Apple Pay, PayPal or SEPA",
  "Your Sustainer badge activates instantly",
  "Change or cancel any time, no questions",
];

/** Stacked-avatar initials + tint for the social-proof cards. */
export type AvatarTint =
  "jade" | "accent" | "cream" | "jadeDim" | "accentDim" | "creamDim";
export const HERO_AVATARS: { initials: string; bg: string; fg: string }[] = [
  { initials: "TM", bg: "#4a8c6f", fg: "#fff" },
  { initials: "AK", bg: "#e8775a", fg: "#fff" },
  { initials: "JP", bg: "#6a4f80", fg: "#fff" },
  { initials: "MF", bg: "#3c7a5f", fg: "#fff" },
  { initials: "KL", bg: "#c85a40", fg: "#fff" },
];
export const SIDEBAR_AVATARS: { initials: string; tint: AvatarTint }[] = [
  { initials: "TM", tint: "jade" },
  { initials: "AK", tint: "accent" },
  { initials: "JP", tint: "cream" },
  { initials: "MF", tint: "jadeDim" },
  { initials: "KL", tint: "accentDim" },
  { initials: "BK", tint: "creamDim" },
  { initials: "NC", tint: "jadeDim" },
];

export const IMPACT_STATS = [
  { num: "€18k", label: "to the mental-health fund" },
  { num: "47", label: "free memberships funded" },
  { num: "3 yrs", label: "running, still here" },
  { num: "100%", label: "community-funded" },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  tint: "jade" | "accent" | "plum";
};
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I found my flat, my GP and half my friends here. Ten euro a month is nothing next to that.",
    name: "Teresa M.",
    role: "Friend · 14 months",
    tint: "jade",
  },
  {
    quote:
      "I like knowing exactly where my money goes. They actually publish the numbers. That's rare.",
    name: "András K.",
    role: "Patron · 8 months",
    tint: "accent",
  },
  {
    quote:
      "No investors means no one's trying to sell me. I'll pay to keep it that way.",
    name: "Joana P.",
    role: "Supporter · 3 months",
    tint: "plum",
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I change or pause my amount later?",
    a: "Any time, from your account settings. Change the amount, switch between monthly and yearly, pause for a few months, or cancel — all self-serve, no email required.",
  },
  {
    q: "Can I cancel?",
    a: "Yes, instantly, any time — from your account settings. No questions, no retention flow, no guilt trip. Your Sustainer badge stays until the billing period ends.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you change your mind within 14 days of a payment, email us and we'll refund it in full, no reason needed. After that, cancelling stops future payments but past ones aren't refunded.",
  },
  {
    q: "Which payment methods work?",
    a: "Card, Apple Pay, PayPal and SEPA direct debit for EU bank accounts. Everything is processed by Stripe — we never see or store your card details.",
  },
  {
    q: "Can I get an invoice or receipt?",
    a: "Yes. Every payment sends a receipt to your email automatically, and you can download a dated invoice — including a company name and VAT number — from your account.",
  },
  {
    q: "Is this tax deductible?",
    a: "No — QueerPulse is not a registered charity. Your contribution is a membership payment, not a donation. We can't provide tax receipts for deduction purposes.",
  },
  {
    q: "Can I support in a currency other than euro?",
    a: "Euro is our default and what our costs are in, but you can pay in GBP or USD using the currency switch above the amounts. Your card can be from anywhere.",
  },
  {
    q: "What if I can't afford it?",
    a: "The platform is free and always will be. Contributing is never required. If you want to support in other ways — hosting a gathering, vouching for members, writing for the magazine — those matter just as much.",
  },
];
