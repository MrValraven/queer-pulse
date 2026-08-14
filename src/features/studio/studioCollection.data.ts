import type { ImageSlotTint } from "../../shared/components/ui";

export const HERO_COVER =
  "https://images.unsplash.com/photo-1651443146979-4cf9a27dcade?q=80&w=600&auto=format&fit=crop";

export const COLLECTION = {
  title: "Lisbon dyke-bar ",
  em: "standards",
  curator: "Sara Marques",
  count: "28 tracks",
  hours: "1h 54m",
  blurb:
    "The songs that actually get played: at Purex, at the Anjos back room, at every house party that goes past 4am. Curated from the catalogue, paid to the artists on every listen.",
};

export interface CollTrack {
  pre: string;
  em?: string;
  post?: string;
  meta: string;
  tint: ImageSlotTint;
  image?: string;
}

export const TRACKS: CollTrack[] = [
  {
    pre: "Carta para a ",
    em: "santa",
    meta: "Mariana Sol · 4:18",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1651443040361-40c9b4c440f8?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Vespertina ",
    em: "vol. iv",
    meta: "Sara Marques · 6:02",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1746417222725-17e161c1f6fa?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Anjos ",
    em: "tape",
    meta: "D. Okoye · 3:44",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1746470621234-ded97a0d8f3a?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Madrugada",
    meta: "Inês T. · 5:11",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1746470621309-0bb74b10b19b?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Purex ",
    em: "theme",
    meta: "Various · 3:02",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1748723594339-46dc3e25e329?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Última ",
    em: "dança",
    meta: "Helena P. · 4:50",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1749496935342-11fddc03871c?q=80&w=800&auto=format&fit=crop",
  },
];

export const RELATED: {
  pre: string;
  em?: string;
  meta: string;
  tint: ImageSlotTint;
  image?: string;
}[] = [
  {
    pre: "Trans ",
    em: "composers",
    meta: "Mix · D. Okoye",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1641515860544-483ea99e265d?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Late ",
    em: "Marvila",
    meta: "Collection · 19 tracks",
    tint: "coral" as const,
    image:
      "https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Fado ",
    em: "reworked",
    meta: "Collection · 12 tracks",
    tint: "jade" as const,
    image:
      "https://images.unsplash.com/photo-1565502233254-3d22afd146eb?q=80&w=800&auto=format&fit=crop",
  },
];
