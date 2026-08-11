import { currentUser, currentUserSlug } from "../../members/data/members";
import { isContentSection } from "../subprofile-kinds";
import type {
  CollaboratorDTO,
  EndorserDTO,
  MemberDTO,
  MyInviteDTO,
  PersonaInviteDTO,
  RestrictedState,
  SubprofileCardDTO,
  SubprofileDTO,
  SubprofilePublicDTO,
} from "../api/subprofiles.api";

// ── Demo collaborator directory ─────────────────────────────────────────────
// A tiny handle→CollaboratorDTO registry standing in for the backend's
// `handles` table + block-filtered resolver. Seeds the one demo item with
// collaborator credits and backs the MSW section-replace echo + the demo
// mutation path (`useSubprofileMutations`), both of which resolve incoming
// handle strings the same way the backend would: known handle → resolved
// card, unknown handle → dropped.
const RUI_COLLABORATOR: CollaboratorDTO = {
  handle: "rui",
  type: "member",
  name: "Rui Marçal",
  avatarUrl:
    "https://plus.unsplash.com/premium_photo-1682144187125-b55e638cf286?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  slug: "rui",
};

const GRAIN_COLLABORATOR: CollaboratorDTO = {
  handle: "grain-studio",
  type: "persona",
  name: "GRAIN",
  avatarUrl:
    "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=800&auto=format&fit=crop",
  slug: null,
};

const DEMO_COLLABORATOR_DIRECTORY: Record<string, CollaboratorDTO> = {
  rui: RUI_COLLABORATOR,
  "grain-studio": GRAIN_COLLABORATOR,
};

/** Resolve collaborator handle strings against the demo directory, dropping
 *  any handle that isn't a seeded member/persona — mirrors the backend's
 *  drop-if-unresolvable rule for the demo/MSW paths. */
export function resolveCollaboratorsDemo(
  handles: string[] = [],
): CollaboratorDTO[] {
  return handles
    .map((handle) => DEMO_COLLABORATOR_DIRECTORY[handle])
    .filter((collaborator): collaborator is CollaboratorDTO =>
      Boolean(collaborator),
    );
}

// ── Demo personas ────────────────────────────────────────────────────────────
// Owner-full `SubprofileDTO`s attached to existing mock members. The registry is
// keyed nowhere special; each carries its own `ownerSlug` (demo-only field below)
// so the mock selectors can build public views. Shapes match the wire DTOs.

/** A demo persona = the owner-full DTO plus the owner slug/name (demo-only) and
 *  the demo-only endorsement state (`viewerEndorsed`/`endorsers`; `endorsementCount`
 *  is already part of `SubprofileDTO`). `viewerFollowing` is likewise demo-only
 *  state (`followerCount` is already part of `SubprofileDTO`). */
export interface DemoSubprofile extends SubprofileDTO {
  ownerSlug: string;
  ownerName: string;
  viewerEndorsed: boolean;
  /** The note the demo viewer saved with their endorsement (edit-mode prefill).
   *  Optional so the seeded fixtures don't each need to declare it; set/cleared
   *  by `mockSetEndorsed`, read back by `mockMyEndorsement`. */
  viewerEndorsementNote?: string | null;
  endorsers: EndorserDTO[];
  viewerFollowing: boolean;
}

const NIGHTFORM: DemoSubprofile = {
  ownerSlug: "diogo",
  ownerName: "Diogo Vasques",
  id: "sp-diogo-nightform",
  kind: "musician",
  slug: "nightform",
  handle: "nightform",
  displayName: "NIGHTFORM",
  avatarUrl:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
  tagline: "After-hours electronics for queer dancefloors",
  bio: "NIGHTFORM is a Lisbon-based producer and DJ making low-slung, hypnotic club tracks for the hours when the room finally lets go. Resident at a handful of the city's queer nights.",
  coverUrl:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1600&auto=format&fit=crop",
  accent: "violet",
  availability: "booking",
  ctaLabel: "Book a set",
  ctaUrl: "https://example.com/nightform/booking",
  socialLinks: [
    { platform: "instagram", urlOrHandle: "@nightform" },
    { platform: "bandcamp", urlOrHandle: "nightform" },
    { platform: "soundcloud", urlOrHandle: "nightform" },
  ],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 3,
  viewerEndorsed: false,
  followerCount: 41,
  viewerFollowing: false,
  skinData: {
    booker: {
      fee: "€400–600, depending on set length",
      rider: "Two CDJs, a 4-channel mixer, and a green room that isn't a hallway.",
      press: "https://example.com/nightform/press-kit",
      contact: "booking@nightform.example",
    },
  },
  affiliations: [
    {
      targetType: "event",
      targetSlug: "queer-karaoke-night",
      role: "performing",
      name: "Queer Karaoke Night",
      imageUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    },
    {
      targetType: "community",
      targetSlug: "rainbow-arts",
      role: "founder",
      name: "Rainbow Arts Collective",
      imageUrl: null,
    },
  ],
  endorsers: [
    {
      slug: "rui",
      name: "Rui Marçal",
      avatarUrl: null,
      note: "Saw NIGHTFORM close out Rrraw — the whole room was still buzzing an hour later.",
    },
    {
      slug: "anika",
      name: "Anika Kovač",
      avatarUrl: null,
      note: "Threshold EP has been on repeat since it dropped.",
    },
    {
      slug: "andre",
      name: "André Quintela",
      avatarUrl: null,
      note: null,
    },
  ],
  items: [
    {
      section: "discography",
      title: "Threshold EP",
      subtitle: "Penumbra Records",
      description: null,
      url: "https://example.com/listen/threshold",
      imageUrl:
        "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: ["techno", "vinyl"],
      // Sample persona for the spotlight: the one featured item in the demo registry.
      isFeatured: true,
      // Sample item for collab credits: a member (mix) + an unlinked persona (art).
      collaborators: [RUI_COLLABORATOR, GRAIN_COLLABORATOR],
    },
    {
      section: "discography",
      title: "Static Bloom",
      subtitle: "self-released",
      description: null,
      url: "https://example.com/listen/static-bloom",
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
      date: "2024",
      meta: null,
      tags: ["ambient"],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "discography",
      title: "Undertow (remixes)",
      subtitle: "Penumbra Records",
      description: null,
      url: "https://example.com/listen/undertow",
      imageUrl: null,
      date: "2024",
      meta: null,
      tags: ["remix"],
      isFeatured: false,
      collaborators: [],
    },
    // NOTE: demo `date` values below are absolute (not relative to "today"),
    // so at least one per stage persona is deliberately set in 2027 to stay
    // "upcoming" for the StageNextUp/Played split — a known limitation that
    // will lapse and need bumping again as real time passes.
    {
      section: "gigs",
      title: "Rrraw · Warehouse",
      subtitle: "Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "14 Mar 2027",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
      venue: "Warehouse, Cais do Sodré, Lisbon",
      doors: "22:00",
      ticketUrl: "https://example.com/nightform/rrraw-tickets",
      gigState: "sold_out",
    },
    {
      section: "gigs",
      title: "Mina Collective",
      subtitle: "Porto",
      description: null,
      url: null,
      imageUrl: null,
      date: "Sep 2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
      venue: "Mina Collective, Porto",
      doors: "23:30",
      ticketUrl: "https://example.com/nightform/mina-tickets",
      gigState: "guest",
    },
    {
      section: "links",
      title: "Bandcamp",
      url: "https://example.com/nightform",
      subtitle: null,
      description: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "links",
      title: "SoundCloud",
      url: "https://example.com/nightform-sc",
      subtitle: null,
      description: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

const RUI_DEV: DemoSubprofile = {
  ownerSlug: "rui",
  ownerName: "Rui Marçal",
  id: "sp-rui-dev",
  kind: "developer",
  slug: "engineering",
  handle: null,
  displayName: "Rui Marçal",
  avatarUrl: null,
  tagline: "Backend & infrastructure · Rust, Go, Postgres",
  bio: "Systems engineer focused on resilient backends and developer tooling. I care about the boring parts that keep things up at 3am.",
  coverUrl:
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1600&auto=format&fit=crop",
  accent: "coral",
  availability: "open_to_collabs",
  ctaLabel: "Get in touch",
  ctaUrl: "https://example.com/rui/contact",
  socialLinks: [
    { platform: "github", urlOrHandle: "ruimarcal" },
    { platform: "website", urlOrHandle: "ruimarcal.dev" },
  ],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 6,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "projects",
      title: "Tide",
      subtitle: null,
      description: "A queue-backed job runner with first-class backpressure.",
      url: "https://example.com/tide",
      imageUrl: null,
      date: "2025",
      meta: null,
      tags: ["Rust", "Postgres"],
      // Featured so this becomes the Spotlight (where `structured.snippet`
      // renders via `WorkshopSnippet`) — otherwise no featured item on this
      // persona means the Spotlight/WorkshopSnippet never mounts in demo.
      isFeatured: true,
      collaborators: [],
      workState: "shipped",
      structured: {
        snippet: [
          "queue.enqueue(job, { backpressure: true })",
          "queue.on(\"drain\", () => log.info(\"caught up\"))",
        ],
      },
    },
    {
      section: "projects",
      title: "Ledger",
      subtitle: null,
      description: "Append-only event store for small teams.",
      url: "https://example.com/ledger",
      imageUrl: null,
      date: "2024",
      meta: null,
      tags: ["Go", "gRPC"],
      isFeatured: false,
      collaborators: [],
      workState: "archived",
    },
    {
      section: "open_source",
      title: "pg-migrate-lite",
      subtitle: null,
      description: "Tiny forward-only migration CLI.",
      url: "https://example.com/pg-migrate-lite",
      imageUrl: null,
      date: "2023–",
      meta: "Maintainer · 1.2k stars",
      tags: [],
      isFeatured: false,
      collaborators: [],
      workState: "shipped",
    },
  ],
};

const ANIKA_WRITER: DemoSubprofile = {
  ownerSlug: "anika",
  ownerName: "Anika Kovač",
  id: "sp-anika-writer",
  kind: "writer",
  slug: "poetry",
  handle: null,
  displayName: "Anika Kovač",
  avatarUrl: null,
  tagline: "Poems & translations on migration and belonging",
  bio: "Bilingual poet and translator working between Slovene and Portuguese. My work lives in the seams between languages.",
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 14,
  viewerFollowing: false,
  skinData: {
    excerpt: {
      from: "Salt Lines",
      lines: [
        "The tongue keeps what the mouth forgets —",
        "a border folded into every vowel.",
        "I write toward home in a language",
        "that was never quite mine to keep.",
      ],
    },
    colophon:
      "Set in Fraunces, printed on paper the colour of an afternoon that didn't want to end.",
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "publications",
      title: "Salt Lines",
      subtitle: "Tinta Permanente",
      description: "A chapbook on leaving and being left.",
      url: "https://example.com/salt-lines",
      imageUrl: null,
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "publications",
      title: "Two Tongues (anthology)",
      subtitle: "Migrant Voices Press",
      description: null,
      url: "https://example.com/two-tongues",
      imageUrl: null,
      date: "2024",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "readings",
      title: "Noite de Poesia",
      subtitle: "Casa do Comum, Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "May 2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "readings",
      title: "Migrant Voices Festival",
      subtitle: "Porto",
      description: null,
      url: null,
      imageUrl: null,
      date: "Oct 2024",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

const ANDRE_LENS: DemoSubprofile = {
  ownerSlug: "andre",
  ownerName: "André Quintela",
  id: "sp-andre-grain",
  kind: "visual_artist",
  slug: "grain",
  handle: "grain-studio",
  displayName: "GRAIN",
  avatarUrl:
    "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=800&auto=format&fit=crop",
  tagline: "Analog portraiture, queer bodies, medium format",
  bio: "GRAIN is a film photography practice photographing queer and trans community. Slow, consensual, tender portraits — no rush, no flash.",
  coverUrl:
    "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=1600&auto=format&fit=crop",
  accent: "amber",
  availability: "open_to_collabs",
  ctaLabel: "Book a sitting",
  ctaUrl: "https://example.com/grain/inquire",
  socialLinks: [
    { platform: "instagram", urlOrHandle: "@grain.studio" },
    { platform: "website", urlOrHandle: "grainstudio.pt" },
    { platform: "kofi", urlOrHandle: "grainstudio" },
  ],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 2,
  viewerEndorsed: false,
  followerCount: 23,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [
    {
      slug: "diogo",
      name: "Diogo Vasques",
      avatarUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
      note: "Sat for the Held series — gentlest photographer I've worked with.",
    },
    {
      slug: "tiago",
      name: "Tiago Costa",
      avatarUrl: null,
      note: null,
    },
  ],
  items: [
    {
      section: "portfolio",
      title: "Held",
      subtitle: null,
      description: "A series of hands and the people they belong to.",
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: ["analog", "film"],
      isFeatured: false,
      collaborators: [],
      medium: "Silver gelatin print",
      dimensions: "40 × 50 cm",
      edition: "Edition of 12",
    },
    {
      section: "portfolio",
      title: "First Light",
      subtitle: null,
      description: "Morning-after portraits on expired stock.",
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=600&auto=format&fit=crop",
      date: "2024",
      meta: null,
      tags: ["expired-film"],
      isFeatured: false,
      collaborators: [],
      medium: "C-print on expired Kodak stock",
      dimensions: "30 × 40 cm",
      edition: "Edition of 8",
    },
    {
      section: "portfolio",
      title: "Softbutch",
      subtitle: null,
      description: null,
      url: null,
      imageUrl: null,
      date: "2024",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
      medium: "Silver gelatin print",
      dimensions: "24 × 30 cm",
      edition: "Edition of 20",
    },
    {
      section: "exhibitions",
      title: "Grain & Body",
      subtitle: "Galeria Foco, Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** The current user's own work-in-progress draft (unlinked, not yet passing the
 *  publish check — no avatar, short bio, only two items). Drives the dashboard
 *  empty-ish state and the PublishChecklist demo. */
const TIAGO_DRAFT: DemoSubprofile = {
  ownerSlug: currentUserSlug,
  ownerName: "Tiago Costa",
  id: "sp-tiago-draft",
  kind: "developer",
  slug: "code",
  handle: null,
  displayName: "Tiago Costa",
  avatarUrl: null,
  tagline: "Fullstack — React, TypeScript, Node",
  bio: "Building for the community.",
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "draft",
  position: 0,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 0,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "projects",
      title: "QueerPulse",
      subtitle: null,
      description: "A community platform. This one.",
      url: null,
      imageUrl: null,
      date: "2026",
      meta: null,
      tags: ["React", "TypeScript"],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "open_source",
      title: "use-demo-mode",
      subtitle: null,
      description: "Dual-mode data hooks helper.",
      url: null,
      imageUrl: null,
      date: "2026",
      meta: "Author",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Standalone chef persona — exercises the `table` skin's `skinData.menuMeta`
 *  and an item's `structured.courses` (Phase 0 demo coverage). Owned by
 *  Tomás Beto, whose member role ("Chef · Supper Club Host") is this exact
 *  identity's day job. */
const CASA_CORVO: DemoSubprofile = {
  ownerSlug: "tomas",
  ownerName: "Tomás Beto",
  id: "sp-tomas-casa-corvo",
  kind: "chef",
  slug: "casa-corvo",
  handle: "casa-corvo",
  displayName: "Casa Corvo",
  avatarUrl:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
  tagline: "Supper club for people who arrive hungry and leave late",
  bio: "A roaming queer supper club. Fourteen seats, one long table, whatever the market gave us that morning.",
  coverUrl:
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1600&auto=format&fit=crop",
  accent: "amber",
  availability: "booking",
  ctaLabel: "Ask about a seat",
  ctaUrl: "https://example.com/casa-corvo/inquire",
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 5,
  viewerEndorsed: false,
  followerCount: 32,
  viewerFollowing: false,
  skinData: {
    menuMeta: {
      no: "Menu no. 12",
      when: "February 2026",
      practical: ["14 seats", "€45", "bring your own", "from 20:00"],
    },
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "menus",
      title: "Winter, no. 12",
      subtitle: "six courses",
      description: "Chestnut, salt cod, burnt honey.",
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
      date: "Feb 2026",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
      structured: {
        courses: [
          {
            n: "I",
            name: "To start",
            dishes: [
              {
                title: "Bread, cultured butter, sea salt",
                note: "sourdough, three days",
                marks: ["v"],
              },
              {
                title: "Chestnut broth, burnt onion",
                note: "from the Serra, smoked over vine",
                marks: ["ve", "gf"],
              },
            ],
          },
          {
            n: "II",
            name: "The table",
            dishes: [
              {
                title: "Salt cod, chickpea, coriander",
                note: "soaked 36 hours",
                marks: ["gf"],
              },
              {
                title: "Winter greens, garlic, lemon",
                note: "whatever the market gave us",
                marks: ["ve", "gf"],
              },
            ],
          },
          {
            n: "III",
            name: "To finish",
            dishes: [
              {
                title: "Burnt honey, thyme, cream",
                note: "honey from Odemira",
                marks: ["v", "gf"],
              },
            ],
          },
        ],
      },
    },
    {
      section: "menus",
      title: "The Long Table",
      subtitle: "four courses",
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop",
      date: "Nov 2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "residencies",
      title: "Casa do Comum kitchen",
      subtitle: "Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "2025–",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Linked therapist persona — exercises the `practice` skin's
 *  `skinData.practical`/`firstSession`/`access`/`referrals` (Phase 0 demo
 *  coverage). Owned by Maria Ferreira, whose member profile already lists
 *  therapy-adjacent community offerings — a natural pairing, not invented. */
const SOFIA_NEVES: DemoSubprofile = {
  ownerSlug: "maria",
  ownerName: "Maria Ferreira",
  id: "sp-maria-therapist",
  kind: "therapist",
  slug: "practice",
  handle: null,
  displayName: "Sofia Neves",
  avatarUrl: null,
  tagline: "Psychotherapy for LGBTQ+ adults · EN / PT",
  bio: "I work with queer and trans adults on identity, family, grief and the long tail of coming out. Sessions in Lisbon or online, sliding scale available.",
  coverUrl: null,
  accent: "jade",
  availability: "open_to_collabs",
  ctaLabel: "Book a first session",
  ctaUrl: "https://example.com/sofia-neves/book",
  socialLinks: [],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 9,
  viewerFollowing: false,
  skinData: {
    practical: {
      fee: "€60 per session",
      sliding: "€30 sliding scale, no questions asked",
      length: "50 minutes",
      languages: "English, Portuguese",
      mode: "In person in Anjos, or online",
      next: "Two openings from 3 March",
    },
    firstSession: [
      {
        title: "You write, I answer within two days",
        body: "A few lines about what brings you. No form, no intake questionnaire.",
      },
      {
        title: "A 20-minute call, free",
        body: "We work out whether I'm the right person. If I'm not, I'll name two people who might be.",
      },
      {
        title: "The first session",
        body: "Fifty minutes. You set the pace and nothing is required of you.",
      },
    ],
    access: [
      "Step-free entrance and lift",
      "Gender-neutral bathroom",
      "Quiet street, no buzzer name",
      "Fragrance-free room",
    ],
    referrals: [
      { name: "Dr. Marta Reis", note: "Clinical psychologist · Lisbon" },
      { name: "Casa Trans Lisboa", note: "Community referral partner" },
    ],
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "specialisms",
      title: "Identity & coming out",
      subtitle: null,
      description: "Including later-in-life and second comings-out.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      section: "specialisms",
      title: "Family estrangement",
      subtitle: null,
      description: "Repair, boundaries, and grief that has no funeral.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "specialisms",
      title: "Transition-related support",
      subtitle: null,
      description: "Not gatekeeping. Not assessment. Support.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "credentials",
      title: "OPP registered psychologist",
      subtitle: "Ordem dos Psicólogos Portugueses",
      description: null,
      url: null,
      imageUrl: null,
      date: "since 2016",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "credentials",
      title: "MSc Clinical Psychology",
      subtitle: "Universidade de Lisboa",
      description: null,
      url: null,
      imageUrl: null,
      date: "2015",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "gallery",
      title: "",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "gallery",
      title: "",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop",
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "gallery",
      title: "",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=600&auto=format&fit=crop",
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Linked DJ persona — exercises gig-field variety (`venue`/`doors`/
 *  `ticketUrl`) alongside NIGHTFORM's `gigState` coverage. */
/** Unlinked astrologer persona — the only demo coverage for the `chart` skin
 *  and its `skinData.sky`/`birthData`/`ethics` blocks. Owned by Carla Nogueira,
 *  kept standalone (unlinked) so the practice reads on its own terms. */
const DECIMA_CASA: DemoSubprofile = {
  ownerSlug: "carla",
  ownerName: "Carla Nogueira",
  id: "sp-carla-decima-casa",
  kind: "astrologer",
  slug: "decima-casa",
  handle: "decima-casa",
  displayName: "Décima Casa",
  avatarUrl: null,
  tagline: "Charts read slowly, for people the textbooks never described",
  bio: "Décima Casa is a queer astrology practice in Anjos. I read birth charts and transits as a language for the life you are actually living — not a forecast, not a verdict. Trans and non-binary charts are read without the gendered shorthand the tradition arrived with.",
  coverUrl: null,
  accent: "violet",
  availability: "booking",
  ctaLabel: "Book a reading",
  ctaUrl: "https://example.com/decima-casa/book",
  socialLinks: [
    { platform: "instagram", urlOrHandle: "@decimacasa" },
    { platform: "website", urlOrHandle: "decimacasa.pt" },
  ],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 7,
  viewerEndorsed: false,
  followerCount: 96,
  viewerFollowing: false,
  skinData: {
    sky: {
      moon: "Moon in Scorpio",
      phase: "Waxing gibbous",
      note: "Mercury retrograde until 3 March",
    },
    birthData: {
      date: "The day you were born",
      time: "The exact minute — from the certificate, not from memory",
      place: "City and country",
      note: "No birth time? Say so when you book. There is a way to work without it, and it costs the same.",
    },
    ethics: [
      "Not a forecast. I will not tell you what happens, or when.",
      "Not a diagnosis. Astrology sits beside therapy and medicine, never in front of them.",
      "Not a verdict on anyone else. I do not read the chart of someone who has not asked.",
      "No gendered readings. Venus is not the woman in your chart.",
    ],
  },
  affiliations: [
    {
      targetType: "event",
      targetSlug: "new-moon-circle",
      role: "hosting",
      name: "New Moon circle",
      imageUrl: null,
    },
  ],
  endorsers: [
    {
      slug: "maria",
      name: "Maria Ferreira",
      avatarUrl: null,
      note: "Décima Casa gave me language for a year I had no language for. Nothing was predicted and everything was clearer.",
    },
    {
      slug: "anika",
      name: "Anika Kovač",
      avatarUrl: null,
      note: null,
    },
  ],
  items: [
    {
      section: "charts",
      title: "Natal reading",
      subtitle: "90 minutes · €70",
      description:
        "Your whole chart, once, slowly. Recorded and sent to you afterwards so you never have to take notes.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      section: "charts",
      title: "The year ahead",
      subtitle: "60 minutes · €55",
      description:
        "Return and transits, in plain language — what this year keeps asking of you.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "charts",
      title: "Two charts together",
      subtitle: "90 minutes · €95",
      description:
        "For couples, throuples, collaborators, or a person and their mother. Everyone present consents first.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "sky",
      title: "New Moon circle",
      subtitle: "Casa do Comum · Lisbon",
      description: "Twelve people, one hour, no prior knowledge assumed.",
      url: null,
      imageUrl: null,
      date: "18 Sep 2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "sky",
      title: "Eclipse season, explained",
      subtitle: "workshop · online",
      description:
        "What eclipses actually are, and why the internet is wrong about them.",
      url: null,
      imageUrl: null,
      date: "2 Oct 2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "sky",
      title: "Saturn in Aries",
      subtitle: "group reading · Anjos",
      description: null,
      url: null,
      imageUrl: null,
      date: "Nov 2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "links",
      title: "Letters from the tenth house",
      subtitle: null,
      description: null,
      url: "https://decimacasa.substack.com",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "links",
      title: "Instagram",
      subtitle: null,
      description: null,
      url: "https://instagram.com/decimacasa",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

const LECHATDASHINKO: DemoSubprofile = {
  ownerSlug: "jordan",
  ownerName: "Jordan Park",
  id: "sp-jordan-lechatdashinko",
  kind: "dj",
  slug: "lechatdashinko",
  handle: null,
  displayName: "LeChatDashinko",
  avatarUrl:
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
  tagline: "Slow builds, filthy drops, no requests",
  bio: "Resident at a handful of the city's queer nights. I play long, patient sets that go somewhere.",
  coverUrl:
    "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?q=80&w=1600&auto=format&fit=crop",
  accent: "violet",
  availability: "booking",
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 18,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "mixes",
      title: "Nocturne 04",
      subtitle: "112 min",
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1571266028243-e4733b0f5c6d?q=80&w=600&auto=format&fit=crop",
      date: "2026",
      meta: null,
      tags: ["techno"],
      isFeatured: true,
      collaborators: [],
    },
    {
      section: "mixes",
      title: "Soft Opening",
      subtitle: "74 min",
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1571751239008-058e94b8e6e2?q=80&w=600&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    // NOTE: see NIGHTFORM's gigs comment above — this date is an absolute
    // 2027 demo value, deliberately kept "upcoming"; known limitation.
    {
      section: "gigs",
      title: "Rrraw · Warehouse",
      subtitle: "Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "21 Feb 2027",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
      venue: "Rrraw",
      doors: "01:00",
      ticketUrl: "https://ra.co/lechat",
    },
    {
      section: "gigs",
      title: "Damas",
      subtitle: "Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "Nov 2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "links",
      title: "SoundCloud",
      subtitle: null,
      description: null,
      url: "https://soundcloud.com/lechatdashinko",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Standalone drag persona — exercises gig-field variety on `shows` plus the
 *  `looks` visual section (image-grid rendering, not new-field-related).
 *  Owned by Inês Fonseca, a choreographer whose tags ("Queer performance")
 *  and affiliations ("Queer Performance Night · Curator") make her a
 *  creative/performance-leaning fit for a drag persona. */
const VANDA_DIESEL: DemoSubprofile = {
  ownerSlug: "ines-fonseca",
  ownerName: "Inês Fonseca",
  id: "sp-ines-fonseca-vanda-diesel",
  kind: "drag",
  slug: "vanda-diesel",
  handle: "vanda-diesel",
  displayName: "Vanda Diesel",
  avatarUrl:
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop",
  tagline: "Lip sync assassin. Ex-altar boy.",
  bio: "Vanda Diesel has been terrorising Lisbon stages since 2019. Numbers about religion, motorbikes, and my mother.",
  coverUrl:
    "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=1600&auto=format&fit=crop",
  accent: "coral",
  availability: "booking",
  ctaLabel: "Book Vanda",
  ctaUrl: "https://example.com/vanda-diesel/book",
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 7,
  viewerEndorsed: false,
  followerCount: 54,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    // NOTE: see NIGHTFORM's gigs comment above — this date is an absolute
    // 2027 demo value, deliberately kept "upcoming"; known limitation.
    {
      section: "shows",
      title: "Sunday Service",
      subtitle: "Trumps · monthly",
      description: null,
      url: null,
      imageUrl: null,
      date: "12 Apr 2027",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
      venue: "Trumps",
      doors: "23:30",
      ticketUrl: "https://trumps.pt",
    },
    {
      section: "shows",
      title: "Drag Race Lisboa",
      subtitle: "guest judge",
      description: null,
      url: null,
      imageUrl: null,
      date: "Jan 2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "looks",
      title: "Motorbike Madonna",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      section: "looks",
      title: "First Communion",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
      date: "2024",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

// ── Phase 1b restricted-state demo fixtures ──────────────────────────────────
// One small, dedicated persona per non-"ok" outcome the Shared Contract
// defines, so all four `PublicSubprofileResult` states are reachable in demo
// without touching the six skin-showcase personas above. Each reuses an
// already-seeded owner identity (never invents a new member) as a second,
// unlinked persona of theirs — publishable/private/removed personas
// coexisting with someone's "main" one is realistic, not a stretch.

/** `visibility: "private"` — resolves to `{restricted:"private"}` for anyone
 *  but Anika herself. Reuses her `ANIKA_WRITER` identity. */
const ANIKA_JOURNAL: DemoSubprofile = {
  ownerSlug: ANIKA_WRITER.ownerSlug,
  ownerName: ANIKA_WRITER.ownerName,
  id: "sp-anika-journal",
  kind: "writer",
  slug: "journal",
  handle: "anika-journal",
  displayName: "Anika's Journal",
  avatarUrl: null,
  tagline: "Unfinished drafts, kept for no one but me",
  bio: "A private working notebook — half-formed lines that aren't ready for anyone else yet.",
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "private",
  status: "published",
  position: 1,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 0,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "publications",
      title: "Untitled, March",
      subtitle: null,
      description: "A working draft, not for outside eyes yet.",
      url: null,
      imageUrl: null,
      date: "2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** `visibility: "network"` — resolves to `{restricted:"members_only"}` for a
 *  signed-out viewer (Phase 1b's simplified "network" gate: authenticated at
 *  all, not a trust-graph check yet). Reuses Jordan's `LECHATDASHINKO`
 *  identity as a second, quieter alias. */
const JORDAN_AFTERHOURS: DemoSubprofile = {
  ownerSlug: LECHATDASHINKO.ownerSlug,
  ownerName: LECHATDASHINKO.ownerName,
  id: "sp-jordan-afterhours",
  kind: "dj",
  slug: "afterhours",
  handle: "afterhours-jordan",
  displayName: "Afterhours",
  avatarUrl: null,
  tagline: "The quiet alias — sets shared with people I actually know",
  bio: "A second, smaller alias for the sets I don't put on the main page. Visible to signed-in members only.",
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "network",
  status: "published",
  position: 1,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 0,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    {
      section: "mixes",
      title: "Living Room, vol. 3",
      subtitle: "58 min",
      description: null,
      url: null,
      imageUrl: null,
      date: "2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** A moderator takedown (`removedAt` set) — resolves to
 *  `{restricted:"removed"}` for anyone but Tomás himself. Reuses his
 *  `CASA_CORVO` identity as a retired earlier supper-club identity.
 *  NOTE (non-goal, see plan): nothing in this repo yet SETS `removedAt` —
 *  that's a separate moderation-console action — this fixture only makes the
 *  resulting state display-ready. */
const CASA_CORVO_ANTIGA: DemoSubprofile = {
  ownerSlug: CASA_CORVO.ownerSlug,
  ownerName: CASA_CORVO.ownerName,
  id: "sp-tomas-casa-corvo-antiga",
  kind: "chef",
  slug: "casa-corvo-antiga",
  handle: "casa-corvo-antiga",
  displayName: "Casa Corvo (antiga)",
  avatarUrl: null,
  tagline: "The old supper club address",
  bio: "An earlier iteration of Casa Corvo, taken down after a guidelines review.",
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 1,
  removedAt: "2026-06-15T00:00:00.000Z",
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 0,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [],
};

/** Every demo persona across all owners. */
export const DEMO_SUBPROFILES: DemoSubprofile[] = [
  NIGHTFORM,
  RUI_DEV,
  ANIKA_WRITER,
  ANDRE_LENS,
  TIAGO_DRAFT,
  CASA_CORVO,
  SOFIA_NEVES,
  DECIMA_CASA,
  LECHATDASHINKO,
  VANDA_DIESEL,
  ANIKA_JOURNAL,
  JORDAN_AFTERHOURS,
  CASA_CORVO_ANTIGA,
];

// ── Mock selectors (mirror the backend gating; used by the demo hook branches) ─

/** Strip the owner-only demo fields down to the owner-full wire DTO. */
export function toOwnerDto(sp: DemoSubprofile): SubprofileDTO {
  return {
    id: sp.id,
    kind: sp.kind,
    slug: sp.slug,
    handle: sp.handle,
    displayName: sp.displayName,
    avatarUrl: sp.avatarUrl,
    tagline: sp.tagline,
    bio: sp.bio,
    coverUrl: sp.coverUrl,
    accent: sp.accent,
    availability: sp.availability,
    ctaLabel: sp.ctaLabel,
    ctaUrl: sp.ctaUrl,
    socialLinks: sp.socialLinks,
    linkVisibility: sp.linkVisibility,
    visibility: sp.visibility,
    status: sp.status,
    position: sp.position,
    items: sp.items,
    endorsementCount: sp.endorsementCount,
    followerCount: sp.followerCount,
    affiliations: sp.affiliations,
    skinData: sp.skinData ?? null,
  };
}

/** Owner-strip when unlinked; keep ownerSlug/ownerName only when linked.
 *  `viewerIsMember` defaults `false` (the overwhelming majority of demo
 *  public reads are a solo-owned persona seen by someone who isn't its
 *  owner); `resolvePublicAccessDemo` below passes `true` for the one case
 *  where the demo viewer IS the owner/co-owner previewing their own
 *  persona (Phase 1b). */
export function toPublicDto(
  sp: DemoSubprofile,
  viewerIsMember = false,
): SubprofilePublicDTO {
  const base: SubprofilePublicDTO = {
    id: sp.id,
    kind: sp.kind,
    slug: sp.slug,
    handle: sp.handle,
    displayName: sp.displayName,
    avatarUrl: sp.avatarUrl,
    tagline: sp.tagline,
    bio: sp.bio,
    coverUrl: sp.coverUrl,
    accent: sp.accent,
    availability: sp.availability,
    ctaLabel: sp.ctaLabel,
    ctaUrl: sp.ctaUrl,
    socialLinks: sp.socialLinks,
    linkVisibility: sp.linkVisibility,
    status: sp.status,
    items: sp.items,
    endorsementCount: sp.endorsementCount,
    viewerEndorsed: sp.viewerEndorsed,
    followerCount: sp.followerCount,
    viewerFollowing: sp.viewerFollowing,
    affiliations: sp.affiliations,
    skinData: sp.skinData ?? null,
    removedAt: sp.removedAt ?? null,
    viewerIsMember,
  };
  if (sp.linkVisibility === "linked") {
    base.ownerSlug = sp.ownerSlug;
    base.ownerName = sp.ownerName;
  }
  return base;
}

/** Union of tags across a persona's content items (excludes `links`), dedup,
 *  capped at 12 — mirrors the backend's batched `loadContentTagsFor`. */
function contentItemTags(sp: DemoSubprofile): string[] {
  const tags: string[] = [];
  for (const item of sp.items) {
    if (!isContentSection(item.section)) continue;
    for (const tag of item.tags ?? []) {
      if (tags.length < 12 && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }
  return tags;
}

export function toCardDto(sp: DemoSubprofile): SubprofileCardDTO {
  return {
    handle: sp.handle ?? sp.slug,
    kind: sp.kind,
    displayName: sp.displayName,
    avatarUrl: sp.avatarUrl,
    tagline: sp.tagline,
    accent: sp.accent,
    availability: sp.availability,
    socialCount: sp.socialLinks.length,
    tags: contentItemTags(sp),
    // Mirrors the backend's directory `followerCount` (Personas redesign
    // Phase 4, Decision §3) — the demo registry already carries this field
    // for `SubprofileDTO`/`SubprofilePublicDTO`, so it's a straight passthrough.
    followerCount: sp.followerCount ?? 0,
  };
}

/** The current owner's personas (all statuses) — for GET /subprofiles/mine. */
export const mockMineSubprofiles = (): SubprofileDTO[] =>
  DEMO_SUBPROFILES.filter((s) => s.ownerSlug === currentUserSlug).map(
    toOwnerDto,
  );

/** Owner fetch by id — for GET /subprofiles/:id. */
export const mockSubprofileById = (id: string): SubprofileDTO | null => {
  const sp = DEMO_SUBPROFILES.find((s) => s.id === id);
  return sp ? toOwnerDto(sp) : null;
};

/** Resolve a persona by its non-identifying endorse-route id (published only) —
 *  backs the MSW `:id/endorse*` handlers, which key on `id`, never slug/handle. */
const findEndorsablePersona = (id: string): DemoSubprofile | undefined =>
  DEMO_SUBPROFILES.find((s) => s.id === id && s.status === "published");

/** GET /subprofiles/:id/endorsements mock — active endorsers for the persona. */
export const mockEndorsersById = (
  id: string,
): { count: number; endorsers: EndorserDTO[] } | null => {
  const sp = findEndorsablePersona(id);
  return sp ? { count: sp.endorsementCount, endorsers: sp.endorsers } : null;
};

/** POST/DELETE /subprofiles/:id/endorse mock — flips the in-memory demo state for
 *  the persona so a route-smoke suite exercising both calls in sequence sees a
 *  consistent count. Idempotent on the count: repeating the same direction is a
 *  no-op there. The optional `note` mirrors the backend's re-endorse behaviour —
 *  it's stored when endorsing (a re-endorse updates the note in place) and
 *  cleared on withdraw, so `mockMyEndorsement` can prefill the edit modal. */
export const mockSetEndorsed = (
  id: string,
  viewerEndorsed: boolean,
  note?: string,
): { endorsementCount: number; viewerEndorsed: boolean } | null => {
  const sp = findEndorsablePersona(id);
  if (!sp) return null;
  if (sp.viewerEndorsed !== viewerEndorsed) {
    sp.endorsementCount = Math.max(
      0,
      sp.endorsementCount + (viewerEndorsed ? 1 : -1),
    );
    sp.viewerEndorsed = viewerEndorsed;
  }
  sp.viewerEndorsementNote = viewerEndorsed ? (note?.trim() || null) : null;
  return {
    endorsementCount: sp.endorsementCount,
    viewerEndorsed: sp.viewerEndorsed,
  };
};

/** GET /subprofiles/:id/endorsement/mine mock — the demo viewer's own
 *  endorsement state + saved note, for the edit-mode endorse modal prefill. */
export const mockMyEndorsement = (
  id: string,
): { viewerEndorsed: boolean; note: string | null } | null => {
  const sp = findEndorsablePersona(id);
  if (!sp) return null;
  return {
    viewerEndorsed: sp.viewerEndorsed,
    note: sp.viewerEndorsementNote ?? null,
  };
};

/** POST/DELETE /subprofiles/:id/follow mock — flips the in-memory demo state for
 *  the persona so a route-smoke suite exercising both calls in sequence sees a
 *  consistent count. Idempotent: repeating the same direction is a no-op. */
export const mockSetFollowing = (
  id: string,
  viewerFollowing: boolean,
): { followerCount: number; viewerFollowing: boolean } | null => {
  const sp = findEndorsablePersona(id);
  if (!sp) return null;
  if (sp.viewerFollowing !== viewerFollowing) {
    sp.followerCount = Math.max(
      0,
      sp.followerCount + (viewerFollowing ? 1 : -1),
    );
    sp.viewerFollowing = viewerFollowing;
  }
  return {
    followerCount: sp.followerCount,
    viewerFollowing: sp.viewerFollowing,
  };
};

/** Linked + published personas of a member — GET /profiles/:slug/subprofiles.
 *  (The single-item nested read now goes through `resolvePublicAccessDemo` +
 *  `findDemoSubprofileByOwnerSlug` instead — see below — since this bulk list
 *  can only ever return already-viewable personas, with no room to carry one
 *  item's restricted signal.) */
export const mockSubprofilesForProfile = (
  ownerSlug: string,
): SubprofilePublicDTO[] =>
  DEMO_SUBPROFILES.filter(
    (s) =>
      s.ownerSlug === ownerSlug &&
      s.status === "published" &&
      s.linkVisibility === "linked" &&
      !s.removedAt,
  ).map((sp) => toPublicDto(sp));

/** Directory cards: unlinked + published + open + not removed, filtered by
 *  kind/query. */
export const mockDirectory = (
  params: { kind?: string; query?: string } = {},
): SubprofileCardDTO[] => {
  const q = params.query?.trim().toLowerCase();
  return DEMO_SUBPROFILES.filter(
    (s) =>
      s.status === "published" &&
      s.linkVisibility === "unlinked" &&
      s.visibility === "open" &&
      !s.removedAt &&
      (!params.kind || s.kind === params.kind) &&
      (!q ||
        s.displayName.toLowerCase().includes(q) ||
        (s.tagline ?? "").toLowerCase().includes(q)),
  ).map(toCardDto);
};

// ── Phase 1b: restricted-state resolution (Shared Contract) ─────────────────
// Mirrors the backend's `resolvePublicAccess` rule order over the demo
// registry, so `usePublicSubprofile`'s demo branch can return the same
// discriminated `ok`/`restricted`/`not-found` outcomes live mode gets from a
// 200 / 403 `{restrictedState}` / 404. Unlike the selectors above (which only
// ever look up ALREADY-published, non-removed personas), the finders here are
// deliberately unfiltered — the resolver itself decides what a given viewer
// gets to see.

export type DemoPublicAccessResult =
  | { kind: "ok"; dto: SubprofilePublicDTO }
  | { kind: "restricted"; restricted: RestrictedState }
  | { kind: "not-found" };

/** Unfiltered lookup by global handle for an UNLINKED persona. Falls back to
 *  matching the internal `slug` when `handle` is null — an unpublished
 *  unlinked draft has no handle yet (it's only assigned on publish, see
 *  `validatePublishDemo`/the MSW publish handler), so its owner's own
 *  "preview" link (`personaPublicPathForOwner`) already addresses it by slug
 *  instead. Mirroring that fallback here is what makes an owner's draft
 *  preview reachable at all. */
export const findDemoSubprofileByHandle = (
  handle: string,
): DemoSubprofile | undefined =>
  DEMO_SUBPROFILES.find(
    (s) =>
      s.linkVisibility === "unlinked" &&
      (s.handle === handle || (s.handle === null && s.slug === handle)),
  );

/** Unfiltered lookup by owner slug + persona slug for a LINKED persona (the
 *  nested `/members/:slug/:subslug` route) — every status/visibility, same
 *  reasoning as `findDemoSubprofileByHandle` above. */
export const findDemoSubprofileByOwnerSlug = (
  ownerSlug: string,
  subslug: string,
): DemoSubprofile | undefined =>
  DEMO_SUBPROFILES.find(
    (s) =>
      s.ownerSlug === ownerSlug &&
      s.slug === subslug &&
      s.linkVisibility === "linked",
  );

/** The Shared Contract's rule order, verbatim, over one demo persona.
 *  `viewerSlug` is the signed-in demo viewer's profile slug, or `null` when
 *  signed out — demo has exactly one identity (`currentUserSlug`), so
 *  "owner/co-owner" collapses to "is it currentUser's own persona, and are
 *  they signed in" and "authenticated member" (the network-visibility gate)
 *  collapses to "signed in at all", matching the backend's Phase 1b
 *  simplification (no trust-graph check yet). */
export function resolvePublicAccessDemo(
  sp: DemoSubprofile | undefined,
  viewerSlug: string | null,
): DemoPublicAccessResult {
  if (!sp) return { kind: "not-found" };
  const isOwner = viewerSlug !== null && sp.ownerSlug === viewerSlug;
  if (isOwner) return { kind: "ok", dto: toPublicDto(sp, true) };
  if (sp.removedAt) return { kind: "restricted", restricted: "removed" };
  if (sp.status !== "published") return { kind: "not-found" };
  if (sp.visibility === "private") {
    return { kind: "restricted", restricted: "private" };
  }
  if (sp.visibility === "network" && viewerSlug === null) {
    return { kind: "restricted", restricted: "members_only" };
  }
  return { kind: "ok", dto: toPublicDto(sp, false) };
}

/** Count of content items (section ≠ links) — mirrors the ≥3 publish threshold. */
export const contentItemCount = (dto: SubprofileDTO): number =>
  dto.items.filter((i) => isContentSection(i.section)).length;

// ── Co-ownership mocks (contract C6) ─────────────────────────────────────────
// Demo-only member/invite views for `GET/POST /subprofiles/:id/members|invites`
// and `GET /subprofiles/invites/mine`. These back the demo branch of Task 8's
// hooks only — no live code path may import this module.

/** The persona used to demonstrate co-ownership end-to-end (Task 12 builds the
 *  invite/manage UI against this exact id): the current demo user's own draft —
 *  the only entry in `DEMO_SUBPROFILES` owned by `currentUserSlug`, i.e. the
 *  only one `mockMineSubprofiles()` would ever expose "members" actions for. */
export const DEMO_CO_OWNED_SUBPROFILE_ID = TIAGO_DRAFT.id;

/** The current demo user, shaped as a `MemberDTO` — always the creator. Reuses
 *  the `currentUser`/`currentUserSlug` identity already seeded for this mock
 *  registry; never invented. */
const CURRENT_USER_MEMBER: MemberDTO = {
  userId: currentUserSlug,
  name: `${currentUser.first} ${currentUser.last}`,
  slug: currentUser.slug,
  avatarUrl: currentUser.photo ?? null,
  joinedAt: "2026-01-04T00:00:00.000Z",
  isCreator: true,
};

/** The accepted co-owner on `DEMO_CO_OWNED_SUBPROFILE_ID` — reuses the Rui
 *  identity already seeded above (`RUI_COLLABORATOR`) rather than inventing a
 *  new member. */
const CO_OWNER_MEMBER: MemberDTO = {
  userId: RUI_COLLABORATOR.slug ?? RUI_COLLABORATOR.handle,
  name: RUI_COLLABORATOR.name,
  slug: RUI_COLLABORATOR.slug ?? RUI_COLLABORATOR.handle,
  avatarUrl: RUI_COLLABORATOR.avatarUrl,
  joinedAt: "2026-02-10T00:00:00.000Z",
  isCreator: false,
};

/** GET /subprofiles/:id/members mock. The designated co-owned example returns
 *  both the creator and the accepted co-owner; every other persona returns the
 *  current demo user as sole creator. */
export function mockPersonaMembers(id: string): MemberDTO[] {
  if (id === DEMO_CO_OWNED_SUBPROFILE_ID) {
    return [CURRENT_USER_MEMBER, CO_OWNER_MEMBER];
  }
  return [CURRENT_USER_MEMBER];
}

/** GET /subprofiles/:id/invites mock. The designated co-owned example has one
 *  outstanding outgoing invite (to Diogo, reusing his existing `NIGHTFORM`
 *  identity); every other persona has none. */
export function mockPersonaInvites(id: string): PersonaInviteDTO[] {
  if (id !== DEMO_CO_OWNED_SUBPROFILE_ID) return [];
  return [
    {
      id: "invite-tiago-draft-diogo",
      subprofileId: DEMO_CO_OWNED_SUBPROFILE_ID,
      invitedUserId: NIGHTFORM.ownerSlug,
      invitedByUserId: CURRENT_USER_MEMBER.userId,
      status: "pending",
      createdAt: "2026-08-02T00:00:00.000Z",
      invitedName: NIGHTFORM.ownerName,
      invitedSlug: NIGHTFORM.ownerSlug,
      invitedAvatarUrl: NIGHTFORM.avatarUrl,
    },
  ];
}

/** GET /subprofiles/invites/mine mock — one incoming invite so the dashboard
 *  banner (Task 10) is demonstrable: Diogo (NIGHTFORM's owner) invites the
 *  current demo user to co-own NIGHTFORM. */
export function mockMyPersonaInvites(): MyInviteDTO[] {
  return [
    {
      id: "invite-nightform-current-user",
      subprofileId: NIGHTFORM.id,
      personaName: NIGHTFORM.displayName,
      personaAvatarUrl: NIGHTFORM.avatarUrl,
      invitedByName: NIGHTFORM.ownerName,
      createdAt: "2026-08-01T00:00:00.000Z",
    },
  ];
}

// ── Publish completeness check (demo simulation of the backend gate) ─────────
// Constants mirror contract C5; the codes returned match the exact strings the
// PublishChecklist maps. Live mode gets these from the server's 422 body instead.

export const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,29}$/;
export const RESERVED_HANDLES = [
  "p",
  "me",
  "admin",
  "members",
  "profile",
  "profiles",
  "settings",
  "account",
  "api",
  "subprofiles",
  "directory",
];
export const MIN_BIO = 80;
export const MIN_CONTENT_ITEMS = 3;
/** Placeholder blocklist; a real moderation-module hook is a documented follow-up. */
export const BLOCKED_TERMS = ["slur-placeholder", "banned-term-placeholder"];

/** Run the completeness check against a mock DTO, returning the unmet C5 codes.
 *  Linked personas only need a non-empty displayName; unlinked run the full gate. */
export function validatePublishDemo(dto: SubprofileDTO): string[] {
  const unmet: string[] = [];
  if (dto.linkVisibility === "linked") return unmet; // linked: displayName only
  const handle = dto.handle ?? dto.slug;
  if (!HANDLE_RE.test(handle)) unmet.push("handle_invalid");
  if (RESERVED_HANDLES.includes(handle)) unmet.push("handle_reserved");
  if (!dto.avatarUrl) unmet.push("avatar_missing");
  if ((dto.bio ?? "").length < MIN_BIO) unmet.push("bio_too_short");
  if (contentItemCount(dto) < MIN_CONTENT_ITEMS) unmet.push("not_enough_items");
  const haystack =
    `${dto.displayName} ${dto.bio ?? ""} ${handle}`.toLowerCase();
  if (BLOCKED_TERMS.some((t) => haystack.includes(t)))
    unmet.push("blocked_terms");
  return unmet;
}
