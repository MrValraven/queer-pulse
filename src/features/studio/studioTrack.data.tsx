/** "Name · role", split into a credit by the demo API. */
export interface CreditRow {
  who: string;
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

export const TRACK = {
  id: "post:studio-track-carta-para-a-santa",
  kind: "post" as const,
  title: "Carta para a santa",
  href: "/studio/track",
  meta: "Mariana Sol · Track 6",
};

export const CREDITS: CreditRow[] = [
  { who: "Mariana Sol · voice, piano, words" },
  { who: "João Anjos · cello" },
  { who: "Inês T. · mix & master" },
  { who: "Helena P. · translator" },
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
