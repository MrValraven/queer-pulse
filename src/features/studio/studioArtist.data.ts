import { routes } from "../../app/routeMap";

export const heroImage =
  "https://images.unsplash.com/photo-1695270918704-2c788f9e3cbf?q=80&w=600&auto=format&fit=crop";

export const ARTIST_ID = "mariana-sol";

export const TABS = ["Music", "Featured in", "Sheet music", "About"] as const;

export interface ArtistRelease {
  pre: string;
  em?: string;
  meta: string;
  buy: string;
  split: string;
  tint: "coral" | "plum" | "jade";
  to: string;
  image: string;
}

export interface ArtistSingle {
  pre: string;
  em?: string;
  meta: string;
  tag: "mem" | "free";
  tint: "coral" | "plum" | "jade";
  image: string;
}

export const RELEASES: ArtistRelease[] = [
  {
    pre: "Cidade dos ",
    em: "santos",
    meta: "Album · 11 tracks · 2026",
    buy: "buy · €8",
    split: "€6.40 to Mariana",
    tint: "coral",
    to: routes.studioAlbum,
    image:
      "https://images.unsplash.com/photo-1721539584865-134ea847dbaf?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "A ",
    em: "Beja",
    meta: "EP · 5 tracks · 2024",
    buy: "buy · €4",
    split: "€3.20",
    tint: "plum",
    to: routes.studioAlbum,
    image:
      "https://images.unsplash.com/photo-1750841897025-97188706c29d?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Devoção",
    meta: "Album · 9 tracks · 2023",
    buy: "buy · €7",
    split: "€5.60",
    tint: "jade",
    to: routes.studioAlbum,
    image:
      "https://images.unsplash.com/photo-1754254235621-59958525d4ba?q=80&w=800&auto=format&fit=crop",
  },
];

export const SINGLES: ArtistSingle[] = [
  {
    pre: "Carta para a ",
    em: "santa",
    meta: "Single · 2026",
    tag: "mem",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1615749303653-6d12ed97eb1e?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Mãe, ",
    em: "vento",
    meta: "Single · 2025",
    tag: "free",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1754403754631-75ccec6ca1ed?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Bairro ",
    em: "quente",
    meta: "Single · 2024",
    tag: "free",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1755276706451-7258309ed76a?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Para a ",
    em: "Inês",
    meta: "Single · 2023",
    tag: "free",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "O ",
    em: "silêncio",
    meta: "Single · 2022",
    tag: "mem",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1756743119526-e6ca4404d0c2?q=80&w=800&auto=format&fit=crop",
  },
];
