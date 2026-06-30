export const HOW = [
  {
    n: "01",
    title: "Write anonymously",
    desc: "Your identity is never attached to your review. We verify you're a member — nothing else is logged.",
  },
  {
    n: "02",
    title: "Rate what matters",
    desc: "Safety to be out, management awareness, trans inclusion, HR responsiveness, and culture vs. stated values.",
  },
  {
    n: "03",
    title: "Help the next person",
    desc: "Your review helps other queer people make better choices about where they take their talent and their whole selves.",
  },
];

export interface Bar {
  label: string;
  pct: number;
  score: string;
  accent?: boolean;
}
export interface Review {
  text: string;
  meta: string[];
}
export interface Company {
  av: string;
  avBg: string;
  avColor: string;
  name: string;
  industry: string;
  score: string;
  scoreColor?: string;
  /** Total number of member reviews behind the score — drives the confidence line. */
  reviewCount: number;
  /** Whether the employer is queer-led/owned (vs. only queer-friendly). */
  queerRun?: boolean;
  bars: Bar[];
  quote: string;
  meta: string[];
  reviews: Review[];
}

export const COMPANIES: Company[] = [
  {
    av: "LX",
    avBg: "rgba(var(--jade-rgb),.15)",
    avColor: "var(--jade)",
    name: "Lisbon Tech Hub",
    industry: "Technology · 200–500 employees",
    score: "7.8",
    reviewCount: 14,
    bars: [
      { label: "Safe to be out", pct: 82, score: "8.2" },
      { label: "Trans inclusion", pct: 72, score: "7.2", accent: true },
      { label: "HR awareness", pct: 78, score: "7.8" },
    ],
    quote:
      '"Generally good. The team is fine — leadership is still catching up. They have an ERG but it needs more budget and teeth."',
    meta: ["14 reviews", "Last updated 2 weeks ago"],
    reviews: [
      {
        text: '"My manager used my pronouns from day one and corrected a client who didn\'t. That mattered more than any policy doc."',
        meta: ["Engineering", "2 weeks ago"],
      },
      {
        text: '"The ERG is real but under-resourced — it runs on volunteers. Trans healthcare in the plan is decent though."',
        meta: ["Design", "1 month ago"],
      },
      {
        text: '"Came out at the offsite and it was a non-event in the best way. Leadership still defaults to assumptions in all-hands."',
        meta: ["Product", "6 weeks ago"],
      },
    ],
  },
  {
    av: "NV",
    avBg: "rgba(var(--plum-rgb),.1)",
    avColor: "var(--plum)",
    name: "Nova Ventures",
    industry: "Finance · 50–200 employees",
    score: "4.3",
    scoreColor: "var(--accent-ink)",
    reviewCount: 8,
    bars: [
      { label: "Safe to be out", pct: 40, score: "4.0", accent: true },
      { label: "Trans inclusion", pct: 28, score: "2.8", accent: true },
      { label: "HR awareness", pct: 52, score: "5.2", accent: true },
    ],
    quote:
      '"Pride month branding. Zero follow-through. I was out for two years and not once did a manager acknowledge it in any way that felt real."',
    meta: ["8 reviews", "Last updated 1 month ago"],
    reviews: [
      {
        text: '"HR meant well but had no idea how to handle a name change. I had to walk them through it myself."',
        meta: ["Operations", "1 month ago"],
      },
      {
        text: '"The rainbow logo goes up in June and comes down in July. Read the room before you accept an offer here."',
        meta: ["Finance", "2 months ago"],
      },
      {
        text: '"One supportive director kept me there a year longer than I should have stayed. Culture below them is rough."',
        meta: ["Analyst", "3 months ago"],
      },
    ],
  },
  {
    av: "MC",
    avBg: "rgba(var(--jade-rgb),.12)",
    avColor: "var(--jade)",
    name: "Marvila Creative",
    industry: "Creative agency · 20–50 employees",
    score: "9.1",
    reviewCount: 6,
    queerRun: true,
    bars: [
      { label: "Safe to be out", pct: 94, score: "9.4" },
      { label: "Trans inclusion", pct: 90, score: "9.0" },
      { label: "HR awareness", pct: 88, score: "8.8" },
    ],
    quote:
      '"Genuinely queer-led culture. My pronouns were on my contract. No one made a big deal of it — it was just how it worked there."',
    meta: ["6 reviews", "Last updated 3 weeks ago"],
    reviews: [
      {
        text: '"Founder is trans and it shows in every policy — gender-neutral facilities, real healthcare, flexible time for appointments."',
        meta: ["Creative", "3 weeks ago"],
      },
      {
        text: '"First job where I never once did the mental maths about whether to be out. I just was."',
        meta: ["Account", "1 month ago"],
      },
      {
        text: '"Small team, so pay is below the big agencies — but the safety is worth a lot. Be clear-eyed about the trade."',
        meta: ["Strategy", "2 months ago"],
      },
    ],
  },
];

export const VERIFY = [
  {
    label: "Verified safe",
    desc: "Inclusive policies confirmed on paper, then cross-checked against 3+ anonymous staff reviews. Re-verified yearly.",
  },
  {
    label: "Queer-run vs. queer-friendly",
    desc: "Queer-run means led or owned by queer people. Queer-friendly is affirming but not community-led — we never conflate the two.",
  },
  {
    label: "Confidence in the score",
    desc: "Every score shows how many reviews it rests on. More reviews, more confidence — a 9 from 3 people is not a 9 from 30.",
  },
];

export const RULES = [
  "Reviews are anonymous — your name is never attached",
  "We verify you're a QueerPulse member, nothing more",
  "Employers cannot edit, remove, or respond to reviews",
  "We moderate for factual accuracy, not for comfort",
  "You can update or retract your review at any time",
  "No company can buy a higher rating or featured placement",
];
