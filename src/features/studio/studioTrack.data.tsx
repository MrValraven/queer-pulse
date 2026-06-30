import { type ReactNode } from "react";

export interface SplitRow {
  c: string;
  k: string;
  sub: string;
  v: ReactNode;
}

export interface CreditRow {
  who: string;
  role: string;
}

export interface MoreTrack {
  pre: string;
  em: string;
  post?: string;
  meta: string;
  tint: "coral" | "jade" | "plum";
  image?: string;
}

export const coverImage =
  "https://plus.unsplash.com/premium_photo-1725353759981-53a3c8c60f31?q=80&w=600&auto=format&fit=crop";

export const SPLIT: SplitRow[] = [
  {
    c: "var(--accent)",
    k: "Mariana Sol",
    sub: "Direct, monthly",
    v: (
      <>
        €<em>0.80</em>
      </>
    ),
  },
  {
    c: "var(--jade)",
    k: "Solidarity fund",
    sub: "Grants & mastering vouchers",
    v: "€0.08",
  },
  {
    c: "var(--plum)",
    k: "Platform & staff",
    sub: "Hosting, captions, council",
    v: "€0.08",
  },
  {
    c: "rgba(247,243,238,.2)",
    k: "Payment fees",
    sub: "Stripe / SEPA only",
    v: "€0.04",
  },
];

export const CREDITS: CreditRow[] = [
  { who: "Mariana Sol · voice, piano, words", role: "85% · songwriter" },
  { who: "João Anjos · cello", role: "10%" },
  { who: "Inês T. · mix & master", role: "5%" },
  { who: "Helena P. · translator", role: "€40 from solidarity fund" },
];

export const MORE: MoreTrack[] = [
  {
    pre: "Mãe, três ",
    em: "vezes",
    meta: "Track 3 · CDS",
    tint: "plum",
    image:
      "https://plus.unsplash.com/premium_photo-1674978723787-e865b2492bb8?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "A ",
    em: "vizinha",
    post: " que reza",
    meta: "Track 4 · CDS",
    tint: "jade",
    image:
      "https://plus.unsplash.com/premium_photo-1668447592202-2b9b2ba31020?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "O ",
    em: "nome",
    meta: "Track 8 · CDS",
    tint: "coral",
    image:
      "https://plus.unsplash.com/premium_photo-1681426317576-18cf057e9bb1?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Mãe, ",
    em: "vento",
    meta: "Single · 2025",
    tint: "plum",
    image:
      "https://plus.unsplash.com/premium_photo-1683134676662-645988a8074e?q=80&w=800&auto=format&fit=crop",
  },
];
