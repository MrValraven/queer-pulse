import type { PersonaPostDTO } from "../api/personaPosts.types";

const HOUR_MS = 3_600_000;
const agoIso = (hours: number) =>
  new Date(Date.now() - hours * HOUR_MS).toISOString();

/** Shown on Mariana's Studio page (the demo viewer owns her persona). */
const MARIANA_POSTS: PersonaPostDTO[] = [
  {
    id: "demo-post-mariana-1",
    body: "Maré alta comes out on Friday and I recorded it live in one take in Sintra with the windows open so yeah the gulls are on it too",
    linkUrl: null,
    imageUrl: null,
    createdAt: agoIso(2),
    editedAt: null,
    canEdit: true,
  },
  {
    id: "demo-post-mariana-2",
    body: "playing the songs from Cidade dos santos at Casa do Comum on 24 October, doors at 21:00 and come say hi after",
    linkUrl: "https://example.org/casa-do-comum/mariana-sol",
    imageUrl: null,
    createdAt: agoIso(72),
    editedAt: null,
    canEdit: true,
  },
  {
    id: "demo-post-mariana-3",
    body: "track 9 has a new version now with the whole recording of my grandmother humming and thank you for every save this month honestly",
    linkUrl: null,
    imageUrl:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80",
    createdAt: agoIso(288),
    editedAt: agoIso(270),
    canEdit: true,
  },
];

/** Shown on /p/nightform and NIGHTFORM's Studio page, read as a visitor. */
const NIGHTFORM_POSTS: PersonaPostDTO[] = [
  ["new single in nine days, Night bus, the long version", 5],
  [
    "back at the Friday night in Anjos this week and we got the last set of the night",
    30,
  ],
  ["finished the mix for Last stop at 4am as is tradition", 80],
  ["thank you to everyone who came out on Saturday, still buzzing", 140],
  [
    "swapped the old drum machine for a borrowed one and kept it and no regrets",
    300,
  ],
  ["first rehearsal in the new space today and it sounds huge in there", 600],
].map(([body, hours], index) => ({
  id: `demo-post-nightform-${index + 1}`,
  body: String(body),
  linkUrl: null,
  imageUrl: null,
  createdAt: agoIso(Number(hours)),
  editedAt: null,
  canEdit: false,
}));

export const DEMO_PERSONA_POSTS: Record<string, PersonaPostDTO[]> = {
  "demo-persona-mariana-sol": MARIANA_POSTS,
  "sp-diogo-nightform": NIGHTFORM_POSTS,
};
