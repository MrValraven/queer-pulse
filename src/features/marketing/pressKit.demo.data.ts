import type {
  PressContactDTO,
  PressCoverageDTO,
  PressKitFactDTO,
  PressKitResponseDTO,
} from "../admin/api/pressKit.api";

/**
 * Demo-only press-kit payload, shaped exactly like `GET /press-kit`.
 *
 * This is the ONLY place the fabricated press coverage, spokespeople and
 * headline figures live now — reachable solely through the demo branch of
 * `usePressKit()`. Live mode never imports or reads any of it (demo-persona-leak
 * rule). It mirrors the honest live contract: the same six fact keys the backend
 * emits (no fabricated `toPrograms` / `totalRaised` / `microGrants` /
 * `transNonBinary`), plain pre-formatted fact values, free-text coverage dates,
 * and outlet-name-only sources. Values match the admin demo fixture in
 * `features/admin/adminPressKit.data.ts` so demo and admin read alike.
 */

/** The six derived headline numbers the live `GET /press-kit` returns under
 *  `facts`, in order. `key` resolves `marketing:pressKit.facts.<key>`; `value`
 *  is already formatted for display. */
const DEMO_FACTS: PressKitFactDTO[] = [
  { key: "founded", value: "2024" },
  { key: "activeMembers", value: "1,847" },
  { key: "communities", value: "38" },
  { key: "gatherings", value: "284" },
  { key: "safeSpaces", value: "42" },
  { key: "magazineIssues", value: "9" },
];

/** Fabricated press coverage — the old `COVERAGE` fixture reshaped to the public
 *  DTO: `source` is the outlet name only, `publishedOn` is a free-text date, and
 *  `url` is `null` when there's no linkable online version. */
const DEMO_COVERAGE: PressCoverageDTO[] = [
  {
    id: "demo-coverage-publico",
    source: "Público",
    title: "Em Lisboa, uma rede profissional queer e independente.",
    meta: "Long-form feature · by Ana Sá Lopes · 6,400 words",
    publishedOn: "4 Mar 2026",
    url: "https://www.publico.pt/",
  },
  {
    id: "demo-coverage-vice",
    source: "Vice Portugal",
    title: "The platform that refuses to scale.",
    meta: "Interview with Marta Reis · 22 min read",
    publishedOn: "18 Feb 2026",
    url: "https://www.vice.com/pt",
  },
  {
    id: "demo-coverage-ft",
    source: "FT Weekend",
    title: "Inside Lisbon's quietest queer institution.",
    meta: "Long-form magazine piece · syndicated to FT.com",
    publishedOn: "24 Jan 2026",
    url: "https://www.ft.com/",
  },
  {
    id: "demo-coverage-mensagem",
    source: "Mensagem de Lisboa",
    title: "A Câmara dos Anjos.",
    meta: "Local-press feature on the neighbourhood",
    publishedOn: "11 Nov 2025",
    url: null,
  },
  {
    id: "demo-coverage-arena",
    source: "Are.na Annual",
    title: "The 12 platforms we wished existed in 2024.",
    meta: "Editor's pick · positioned #4",
    publishedOn: "Dec 2024",
    url: null,
  },
];

/** Fabricated press-desk contacts — the old `buildTeam` spokespeople reshaped to
 *  the public DTO. Role / description / languages are plain strings here (as the
 *  live backend returns admin-entered text, not translated copy). */
const DEMO_CONTACTS: PressContactDTO[] = [
  {
    id: "demo-contact-marta",
    name: "Marta Reis",
    role: "Founder & director",
    description: "Speaks to strategy, funding and the platform's story.",
    languages: "EN / PT",
    email: "marta@queerpulse.app",
    avatarUrl: null,
  },
  {
    id: "demo-contact-catarina",
    name: "Catarina Vaz",
    role: "Head of community",
    description: "Speaks to safe spaces, gatherings and moderation.",
    languages: "EN / PT / ES",
    email: "catarina@queerpulse.app",
    avatarUrl: null,
  },
  {
    id: "demo-contact-andre",
    name: "André Bento",
    role: "Editor, the magazine",
    description: "Speaks to editorial, commissions and partnerships.",
    languages: "EN / PT",
    email: "andre@queerpulse.app",
    avatarUrl: null,
  },
];

/** The full demo press-kit payload, resolved with no network call. */
export function demoPressKit(): PressKitResponseDTO {
  return {
    facts: DEMO_FACTS,
    coverage: DEMO_COVERAGE,
    contacts: DEMO_CONTACTS,
  };
}
