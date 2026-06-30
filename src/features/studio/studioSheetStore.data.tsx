import { type ReactNode } from "react";

export const SPECS = [
  "Voice + piano",
  "Key · D minor",
  "PT lyrics",
  "4 pages",
  "PDF · A4",
];

export const PAY_METHODS: { nm: string; sub: string }[] = [
  { nm: "Saved card · Visa ·· 4291", sub: "one-tap, no re-entry" },
  { nm: "SEPA direct", sub: "lower fee, 1–2 day settle" },
];

export const scoreCoverImage =
  "https://images.unsplash.com/photo-1591025810539-a321000cda85?q=80&w=600&auto=format&fit=crop";

export const SPLIT: { c: string; nm: ReactNode; v: string }[] = [
  {
    c: "var(--jade-light)",
    nm: (
      <>
        Teresa Rocha · <em>transcriber</em>
      </>
    ),
    v: "€0.55",
  },
  {
    c: "var(--accent)",
    nm: (
      <>
        Mariana Sol · <em>composer</em>
      </>
    ),
    v: "€0.35",
  },
  { c: "rgba(247,243,238,.3)", nm: "The co-op · hosting & infra", v: "€0.10" },
];

export const ALSO: {
  pre: string;
  em: string;
  who: string;
  tag: string;
  tint: "plum" | "jade" | "coral";
  image?: string;
}[] = [
  {
    pre: "A ",
    em: "Beja",
    who: "Mariana Sol · piano",
    tag: "€1",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1717699841849-98dcc1c6184a?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Cantiga para a ",
    em: "vizinha",
    who: "Coro de Outubro · SATB",
    tag: "€1",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1453906971074-ce568cccbc63?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "The first ",
    em: "Sunday",
    who: "Helena P. · lead sheet",
    tag: "Free read",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1485688809171-248861015a63?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Salt water, ",
    em: "slowly",
    who: "Akin Diallo · guitar tab",
    tag: "€1",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format&fit=crop",
  },
];
