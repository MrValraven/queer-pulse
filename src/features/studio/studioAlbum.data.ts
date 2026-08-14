import { routes } from "../../app/routeMap";

export const ALBUM_COVER =
  "https://images.unsplash.com/photo-1651443040219-ce2e7a36219f?q=80&w=600&auto=format&fit=crop";

export const ALBUM = {
  id: "post:studio-album-cidade-dos-santos",
  kind: "post" as const,
  title: "Cidade dos santos",
  href: routes.studioAlbum,
  meta: "Mariana Sol · Album",
  description:
    "A nine-track meditation on faith, the city, and queer longing, recorded live in Lisbon.",
};

export const TRACKS: {
  n: number;
  pre: string;
  em?: string;
  post?: string;
  who: string;
  tm: string;
  now?: boolean;
  image?: string;
}[] = [
  {
    n: 1,
    pre: "Abertura: ",
    em: "a luz",
    who: "instrumental · piano",
    tm: "2:10",
    image:
      "https://images.unsplash.com/photo-1760574734038-a69d4649a9e8?q=80&w=400&auto=format&fit=crop",
  },
  {
    n: 2,
    pre: "Cidade dos ",
    em: "santos",
    who: "solo voice + piano",
    tm: "3:54",
    image:
      "https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 3,
    pre: "Mãe, três ",
    em: "vezes",
    who: "solo voice + piano",
    tm: "4:08",
    image:
      "https://images.unsplash.com/photo-1565502233254-3d22afd146eb?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 4,
    pre: "A ",
    em: "vizinha",
    post: " que reza",
    who: "duet with Coro de Outubro",
    tm: "5:31",
    image:
      "https://images.unsplash.com/photo-1566108253680-7c860e4633a3?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 5,
    pre: "Intervalo",
    who: "instrumental · piano",
    tm: "1:48",
    image:
      "https://images.unsplash.com/photo-1585310808021-c2221275d7ad?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 6,
    pre: "Carta para a ",
    em: "santa",
    who: "now playing · in the Wednesday set",
    tm: "4:18",
    now: true,
    image:
      "https://images.unsplash.com/photo-1615749303653-6d12ed97eb1e?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 7,
    pre: "Festa ",
    em: "pequena",
    who: "João Anjos · cello, Inês T. · percussion",
    tm: "3:24",
    image:
      "https://images.unsplash.com/photo-1618327907102-e07a8d7081c6?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 8,
    pre: "O ",
    em: "nome",
    who: "solo voice + piano",
    tm: "4:55",
    image:
      "https://images.unsplash.com/photo-1618853606853-bacd55fb7f70?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 9,
    pre: "Casa da ",
    em: "avó",
    who: "field recording + voice",
    tm: "3:12",
    image:
      "https://images.unsplash.com/photo-1634146330658-b052db81cd15?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 10,
    pre: "Pedido",
    who: "solo voice + piano",
    tm: "4:38",
    image:
      "https://images.unsplash.com/photo-1635237773272-dcd7a1e16859?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 11,
    pre: "Fecho: ",
    em: "a luz que entra",
    who: "instrumental · piano + cello",
    tm: "3:32",
    image:
      "https://images.unsplash.com/photo-1636207608470-dfedb46c2380?q=80&w=800&auto=format&fit=crop",
  },
];

// Stable canonical ids — the tab's *stored* value never changes with
// language; only `labelKey` resolves via t() at render (i18n §5.1).
export const TABS = [
  { id: "tracklist", labelKey: "studio:album.tabs.tracklist" },
  { id: "linerNotes", labelKey: "studio:album.tabs.linerNotes" },
  { id: "credits", labelKey: "studio:album.tabs.credits" },
] as const;
export type AlbumTabId = (typeof TABS)[number]["id"];

// Mock ledger + buy figures — per-instance analytics, run through
// useFormat() at the call site rather than hardcoded as display strings.
export const ALBUM_BUY = {
  price: 8,
  payWhatYouCanMin: 1,
};

export const ALBUM_LEDGER = {
  paidToArtistLifetime: 8940,
  paidToCollaborators: 1420,
  playsThisMonth: 42840,
};

export const MORE: {
  pre: string;
  em?: string;
  meta: string;
  tag: "mem" | "free";
  tagLabelKey: string;
  tint: "plum" | "coral" | "jade";
  image?: string;
}[] = [
  {
    pre: "A ",
    em: "Beja",
    meta: "EP · 5 tracks · 2024",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1651443039959-582bbea6be6a?q=80&w=400&auto=format&fit=crop",
  },
  {
    pre: "Devoção",
    meta: "Album · 9 tracks · 2023",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1657627157213-c5f44dbd0724?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Mãe, ",
    em: "vento",
    meta: "Single · 2025",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1670956008011-a9dfc94e12b8?q=80&w=800&auto=format&fit=crop",
  },
  {
    pre: "Bairro ",
    em: "quente",
    meta: "Single · 2024",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1671703938773-df94fd42e838?q=80&w=800&auto=format&fit=crop",
  },
];
