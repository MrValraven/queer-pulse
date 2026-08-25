import {
  MEMBERS,
  currentUser,
  currentUserSlug,
  memberName,
} from "../../members/data/members";
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

/** Resolve collaborator handle strings against the demo world: the seeded
 *  handle→card directory first (for personas + curated overrides like Rui),
 *  then any real member from the registry (a member's handle is their slug), so
 *  a collaborator just picked from the member search survives the save echo
 *  instead of being dropped. An unknown handle still drops, mirroring the
 *  backend's drop-if-unresolvable rule for the demo/MSW paths. */
export function resolveCollaboratorsDemo(
  handles: string[] = [],
): CollaboratorDTO[] {
  return handles
    .map((handle) => {
      const seeded = DEMO_COLLABORATOR_DIRECTORY[handle];
      if (seeded) return seeded;
      const member = MEMBERS[handle];
      if (!member) return undefined;
      return {
        handle,
        type: "member",
        name: memberName(handle),
        avatarUrl: member.photo ?? null,
        slug: handle,
      } satisfies CollaboratorDTO;
    })
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
      rider:
        "Two CDJs, a 4-channel mixer, and a green room that isn't a hallway.",
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
      note: "Saw NIGHTFORM close out Rrraw. The whole room was still buzzing an hour later.",
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
      id: "itm-discography-threshold-ep",
      section: "discography",
      createdAt: "2025-01-08T09:14:00.000Z",
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
      id: "itm-discography-static-bloom",
      section: "discography",
      createdAt: "2025-01-11T23:07:00.000Z",
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
      id: "itm-discography-undertow-remixes",
      section: "discography",
      createdAt: "2025-01-14T12:00:00.000Z",
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
      id: "itm-gigs-rrraw-warehouse",
      section: "gigs",
      createdAt: "2025-01-19T00:53:00.000Z",
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
      id: "itm-gigs-mina-collective",
      section: "gigs",
      createdAt: "2025-01-21T13:46:00.000Z",
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
      id: "itm-links-bandcamp",
      section: "links",
      createdAt: "2025-01-26T02:39:00.000Z",
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
      id: "itm-links-soundcloud",
      section: "links",
      createdAt: "2025-01-28T15:32:00.000Z",
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
      id: "itm-projects-tide",
      section: "projects",
      createdAt: "2025-02-02T04:25:00.000Z",
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
          'queue.on("drain", () => log.info("caught up"))',
        ],
      },
    },
    {
      id: "itm-projects-ledger",
      section: "projects",
      createdAt: "2025-02-04T17:18:00.000Z",
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
      id: "itm-open-source-pg-migrate-lite",
      section: "open_source",
      createdAt: "2025-02-09T07:11:00.000Z",
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
      id: "itm-publications-salt-lines",
      section: "publications",
      createdAt: "2025-02-11T20:04:00.000Z",
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
      id: "itm-publications-two-tongues-anthology",
      section: "publications",
      createdAt: "2025-02-16T08:57:00.000Z",
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
      id: "itm-readings-noite-de-poesia",
      section: "readings",
      createdAt: "2025-02-18T21:50:00.000Z",
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
      id: "itm-readings-migrant-voices-festival",
      section: "readings",
      createdAt: "2025-02-22T10:43:00.000Z",
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
  bio: "GRAIN is a film photography practice photographing queer and trans community. Slow, consensual, tender portraits: no rush, no flash.",
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
      note: "Sat for the Held series. Gentlest photographer I've worked with.",
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
      id: "itm-portfolio-held",
      section: "portfolio",
      createdAt: "2025-02-25T23:36:00.000Z",
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
      id: "itm-portfolio-first-light",
      section: "portfolio",
      createdAt: "2025-03-01T12:29:00.000Z",
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
      id: "itm-portfolio-softbutch",
      section: "portfolio",
      createdAt: "2025-03-05T01:22:00.000Z",
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
      id: "itm-exhibitions-grain-body",
      section: "exhibitions",
      createdAt: "2025-03-08T14:15:00.000Z",
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
  tagline: "Fullstack: React, TypeScript, Node",
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
      id: "itm-projects-queerpulse",
      section: "projects",
      createdAt: "2025-03-12T04:08:00.000Z",
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
      id: "itm-open-source-use-demo-mode",
      section: "open_source",
      createdAt: "2025-03-15T17:01:00.000Z",
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
      id: "itm-menus-winter-no-12",
      section: "menus",
      createdAt: "2025-03-19T05:54:00.000Z",
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
      id: "itm-menus-the-long-table",
      section: "menus",
      createdAt: "2025-03-22T18:47:00.000Z",
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
      id: "itm-residencies-casa-do-comum-kitchen",
      section: "residencies",
      createdAt: "2025-03-26T07:40:00.000Z",
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
    approach: [
      "I work relationally and at your pace. Nothing about your identity is a problem to be solved here.",
      "Sessions draw on affirmative, trauma-informed and somatic work. We find what fits you rather than the other way round.",
    ],
    training: [
      "MSc Clinical Psychology, Universidade de Lisboa",
      "Certified in Gender-Affirming Care, WPATH pathway",
      "EMDR Level II",
    ],
    venue: {
      name: "Anjos practice room",
      lines: ["Rua de Álvaro Coutinho", "1150-024 Lisboa"],
    },
    feeSchedule: [
      { label: "Standard session", value: "€60" },
      { label: "Sliding scale", value: "from €30" },
      { label: "First 20-min call", value: "Free" },
    ],
    availability: {
      startDate: "2026-03-02",
      slotTime: "18:00",
      cells: [
        "off",
        "off",
        "open",
        "off",
        "open",
        "off",
        "off",
        "off",
        "full",
        "off",
        "open",
        "off",
        "off",
        "off",
        "off",
        "open",
        "off",
        "off",
        "open",
        "off",
        "off",
        "off",
        "off",
        "open",
        "off",
        "off",
        "off",
        "off",
      ],
    },
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-specialisms-identity-coming-out",
      section: "specialisms",
      createdAt: "2025-03-29T20:33:00.000Z",
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
      id: "itm-specialisms-family-estrangement",
      section: "specialisms",
      createdAt: "2025-04-01T09:26:00.000Z",
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
      id: "itm-specialisms-transition-related-support",
      section: "specialisms",
      createdAt: "2025-04-05T22:19:00.000Z",
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
      id: "itm-credentials-opp-registered-psychologist",
      section: "credentials",
      createdAt: "2025-04-08T12:12:00.000Z",
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
      id: "itm-credentials-msc-clinical-psychology",
      section: "credentials",
      createdAt: "2025-04-13T01:05:00.000Z",
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
      id: "itm-gallery",
      section: "gallery",
      createdAt: "2025-04-15T13:58:00.000Z",
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
      id: "itm-gallery-2",
      section: "gallery",
      createdAt: "2025-04-20T02:51:00.000Z",
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
      id: "itm-gallery-3",
      section: "gallery",
      createdAt: "2025-04-22T15:44:00.000Z",
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
  bio: "Décima Casa is a queer astrology practice in Anjos. I read birth charts and transits as a language for the life you are actually living, a way of reflecting on the present. Trans and non-binary charts are read without the gendered shorthand the tradition arrived with.",
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
      time: "The exact minute: from the certificate, not from memory",
      place: "City and country",
      note: "No birth time? Say so when you book. There is a way to work without it, and it costs the same.",
    },
    ethics: [
      "Not a forecast. I will not tell you what happens, or when.",
      "Not a diagnosis. Astrology sits beside therapy and medicine as a companion to them.",
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
      id: "itm-charts-natal-reading",
      section: "charts",
      createdAt: "2025-04-27T04:37:00.000Z",
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
      id: "itm-charts-the-year-ahead",
      section: "charts",
      createdAt: "2025-04-29T17:30:00.000Z",
      title: "The year ahead",
      subtitle: "60 minutes · €55",
      description:
        "Return and transits, in plain language: what this year keeps asking of you.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-charts-two-charts-together",
      section: "charts",
      createdAt: "2025-05-03T06:23:00.000Z",
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
      id: "itm-sky-new-moon-circle",
      section: "sky",
      createdAt: "2025-05-06T19:16:00.000Z",
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
      id: "itm-sky-eclipse-season-explained",
      section: "sky",
      createdAt: "2025-05-10T09:09:00.000Z",
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
      id: "itm-sky-saturn-in-aries",
      section: "sky",
      createdAt: "2025-05-13T22:02:00.000Z",
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
      id: "itm-links-letters-from-the-tenth-house",
      section: "links",
      createdAt: "2025-05-16T10:55:00.000Z",
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
      id: "itm-links-instagram",
      section: "links",
      createdAt: "2025-05-20T23:48:00.000Z",
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
      id: "itm-mixes-nocturne-04",
      section: "mixes",
      createdAt: "2025-05-23T12:41:00.000Z",
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
      id: "itm-mixes-soft-opening",
      section: "mixes",
      createdAt: "2025-05-28T01:34:00.000Z",
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
      id: "itm-gigs-rrraw-warehouse-2",
      section: "gigs",
      createdAt: "2025-05-30T14:27:00.000Z",
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
      id: "itm-gigs-damas",
      section: "gigs",
      createdAt: "2025-06-04T03:20:00.000Z",
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
      id: "itm-links-soundcloud-2",
      section: "links",
      createdAt: "2025-06-06T17:13:00.000Z",
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
      id: "itm-shows-sunday-service",
      section: "shows",
      createdAt: "2025-06-11T06:06:00.000Z",
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
      id: "itm-shows-drag-race-lisboa",
      section: "shows",
      createdAt: "2025-06-13T18:59:00.000Z",
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
      id: "itm-looks-motorbike-madonna",
      section: "looks",
      createdAt: "2025-06-18T07:52:00.000Z",
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
      id: "itm-looks-first-communion",
      section: "looks",
      createdAt: "2025-06-20T20:45:00.000Z",
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
  bio: "A private working notebook, half-formed lines that aren't ready for anyone else yet.",
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
      id: "itm-publications-untitled-march",
      section: "publications",
      createdAt: "2025-06-24T09:38:00.000Z",
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
  tagline: "The quiet alias: sets shared with people I actually know",
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
      id: "itm-mixes-living-room-vol-3",
      section: "mixes",
      createdAt: "2025-06-27T22:31:00.000Z",
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

/** Unlinked hair-stylist persona — the demo coverage for the `chair` skin and
 *  its `skinData.chair`/`beforeYouSit` blocks. Owned by Bea Antunes, kept
 *  standalone (unlinked) so the one-chair salon reads on its own terms. */
const CADEIRA_LIVRE: DemoSubprofile = {
  ownerSlug: "bea",
  ownerName: "Bea Antunes",
  id: "sp-bea-cadeira",
  kind: "hair_stylist",
  slug: "cadeira-livre",
  handle: "cadeira-livre",
  displayName: "Cadeira Livre",
  avatarUrl: null,
  tagline: "One price. Any hair. Any name you go by.",
  bio: "A one-chair salon on Rua do Benformoso. I cut hair for trans and gender-non-conforming people, and for anybody else who wants to sit down and be spoken to plainly. Nobody is asked what they used to look like.",
  coverUrl: null,
  accent: "coral",
  availability: "booking",
  ctaLabel: "Book the chair",
  ctaUrl: "https://cadeiralivre.pt/marcar",
  socialLinks: [{ platform: "instagram", urlOrHandle: "@cadeiralivre" }],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 12,
  viewerEndorsed: false,
  followerCount: 148,
  viewerFollowing: false,
  skinData: {
    chair: {
      rate: "€25, every cut, every head",
      walkins: "Walk-ins Thursday, 15:00–19:00",
      where: "Rua do Benformoso 42, Anjos",
      quiet: "Quiet hours Monday, no music, no small talk",
    },
    beforeYouSit: [
      "I ask what you want your hair to do. Not what it did before.",
      "You can bring a friend, or your own clippers, or nothing at all.",
      "First binder-friendly cut is on the house if money is tight. Just say so when you book.",
    ],
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-services-cut-any-hair",
      section: "services",
      createdAt: "2025-07-01T11:24:00.000Z",
      title: "Cut, any hair",
      subtitle: "45 minutes",
      description:
        "Wash, cut, and as long as you need in the chair afterwards.",
      url: null,
      imageUrl: null,
      date: "€25",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-services-clipper-cut-fade",
      section: "services",
      createdAt: "2025-07-05T00:17:00.000Z",
      title: "Clipper cut & fade",
      subtitle: "30 minutes",
      description: null,
      url: null,
      imageUrl: null,
      date: "€20",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-services-colour-single-process",
      section: "services",
      createdAt: "2025-07-08T14:10:00.000Z",
      title: "Colour, single process",
      subtitle: "2 hours",
      description: "Bleach and tone. Patch test a week before, no exceptions.",
      url: null,
      imageUrl: null,
      date: "€60",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-services-first-cut-after-coming-out",
      section: "services",
      createdAt: "2025-07-12T03:03:00.000Z",
      title: "First cut after coming out",
      subtitle: "as long as it takes",
      description:
        "Sliding scale, down to free. Nobody has ever been asked to prove anything.",
      url: null,
      imageUrl: null,
      date: "€0–25",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-looks-grown-out-bleach",
      section: "looks",
      createdAt: "2025-07-15T15:56:00.000Z",
      title: "Grown-out bleach",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop",
      date: "2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-looks-short-back-long-everything",
      section: "looks",
      createdAt: "2025-07-19T04:49:00.000Z",
      title: "Short back, long everything",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-looks-the-anjos-mullet",
      section: "looks",
      createdAt: "2025-07-22T17:42:00.000Z",
      title: "The Anjos mullet",
      subtitle: null,
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-links-booking",
      section: "links",
      createdAt: "2025-07-26T06:35:00.000Z",
      title: "Booking",
      subtitle: null,
      description: null,
      url: "https://cadeiralivre.pt/marcar",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Unlinked fashion-designer persona — the demo coverage for the `runway` skin
 *  and its `skinData.credits` block. Owned by Kiko Sales, kept standalone. */
const SANTA_CRUEL: DemoSubprofile = {
  ownerSlug: "kiko",
  ownerName: "Kiko Sales",
  id: "sp-kiko-santacruel",
  kind: "fashion_designer",
  slug: "santa-cruel",
  handle: "santa-cruel",
  displayName: "SANTA CRUEL",
  avatarUrl: null,
  tagline: "Tailoring for the bodies the pattern books skipped",
  bio: "SANTA CRUEL is a Lisbon label making tailoring to measure, drafted from scratch for each body rather than graded off a size chart. Made in a studio in Marvila, in runs of forty or fewer.",
  coverUrl: null,
  accent: "plum",
  availability: "open_to_collabs",
  ctaLabel: "Request the lookbook",
  ctaUrl: "https://santacruel.pt/ss26",
  socialLinks: [
    { platform: "instagram", urlOrHandle: "@santacruel" },
    { platform: "website", urlOrHandle: "santacruel.pt" },
  ],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 4,
  viewerEndorsed: false,
  followerCount: 302,
  viewerFollowing: false,
  skinData: {
    credits: {
      press: "Vogue Portugal, Gerador, i-D",
      stockists: "Concept, Lisbon · Sivo, Porto · online",
      made: "Cut and sewn in Marvila, runs of 40",
      contact: "studio@santacruel.pt",
    },
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-collections-penitente",
      section: "collections",
      createdAt: "2025-07-29T19:28:00.000Z",
      title: "PENITENTE",
      subtitle: "SS26",
      description: "Fifteen looks in wool, chiffon and church velvet.",
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
      date: "2026",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-collections-irm",
      section: "collections",
      createdAt: "2025-08-02T08:21:00.000Z",
      title: "IRMÃ",
      subtitle: "AW25",
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-collections-primeira-comunh-o",
      section: "collections",
      createdAt: "2025-08-05T21:14:00.000Z",
      title: "PRIMEIRA COMUNHÃO",
      subtitle: "SS25",
      description: null,
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
      date: "2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-shows-modalisboa-sala-principal",
      section: "shows",
      createdAt: "2025-08-08T11:07:00.000Z",
      title: "ModaLisboa · Sala Principal",
      subtitle: "Lisbon",
      description: null,
      url: null,
      imageUrl: null,
      date: "6 Mar 2026",
      meta: "Upcoming",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-shows-portugal-fashion",
      section: "shows",
      createdAt: "2025-08-13T00:00:00.000Z",
      title: "Portugal Fashion",
      subtitle: "Porto",
      description: null,
      url: null,
      imageUrl: null,
      date: "Oct 2025",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-shows-casa-do-comum-presentation",
      section: "shows",
      createdAt: "2025-08-15T12:53:00.000Z",
      title: "Casa do Comum · presentation",
      subtitle: "Lisbon",
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
      id: "itm-links-lookbook",
      section: "links",
      createdAt: "2025-08-19T01:46:00.000Z",
      title: "Lookbook",
      subtitle: null,
      description: null,
      url: "https://santacruel.pt/ss26",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Unlinked gallerist persona — the demo coverage for the `gallery` skin and
 *  its `skinData.onView`/`visit` blocks. Owned by Célia Matos, kept standalone. */
const TERCEIRO_PISO: DemoSubprofile = {
  ownerSlug: "celia",
  ownerName: "Célia Matos",
  id: "sp-celia-terceiro",
  kind: "gallerist",
  slug: "terceiro-piso",
  handle: "terceiro-piso",
  displayName: "Terceiro Piso",
  avatarUrl: null,
  tagline:
    "A third-floor room for work that the institutions keep almost showing",
  bio: "Terceiro Piso is an artist-run space above a hardware shop in Intendente. Four exhibitions a year, no commission on first sales, and a reading room that stays open when the shows come down.",
  coverUrl: null,
  accent: "jade",
  availability: "open_to_collabs",
  ctaLabel: "Plan a visit",
  ctaUrl: "https://terceiropiso.pt/programa",
  socialLinks: [
    { platform: "instagram", urlOrHandle: "@terceiropiso" },
    { platform: "website", urlOrHandle: "terceiropiso.pt" },
  ],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 5,
  viewerEndorsed: false,
  followerCount: 211,
  viewerFollowing: false,
  skinData: {
    onView: {
      title: "Held, Again",
      artist: "GRAIN (André Quintela)",
      dates: "14 Feb – 30 Mar 2026",
      room: "Room 1 & reading room",
    },
    visit: {
      hours: "Thursday to Sunday, 14:00–19:00",
      address: "Rua dos Anjos 88, 3º · Lisbon",
      access:
        "Third floor, no lift. We bring the work down for anyone who asks",
      admission: "Free, always",
    },
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-programme-held-again",
      section: "programme",
      createdAt: "2025-08-22T14:39:00.000Z",
      title: "Held, Again",
      subtitle: "GRAIN · photographs, 2023–2026",
      description:
        "Twenty-two silver gelatin prints of hands and the people they belong to.",
      url: null,
      imageUrl:
        "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=800&auto=format&fit=crop",
      date: "Feb–Mar 2026",
      meta: "On view",
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-programme-the-long-room",
      section: "programme",
      createdAt: "2025-08-26T03:32:00.000Z",
      title: "The Long Room",
      subtitle: "group exhibition · six artists",
      description: null,
      url: null,
      imageUrl: null,
      date: "Apr–Jun 2026",
      meta: "In preparation",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-programme-papel-queimado",
      section: "programme",
      createdAt: "2025-08-29T16:25:00.000Z",
      title: "Papel Queimado",
      subtitle: "Vera Luís · works on paper",
      description: null,
      url: null,
      imageUrl: null,
      date: "Oct–Dec 2025",
      meta: "In storage",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-artists-grain-andr-quintela",
      section: "artists",
      createdAt: "2025-09-02T05:18:00.000Z",
      title: "GRAIN (André Quintela)",
      subtitle: "photography · represented since 2024",
      description: null,
      url: null,
      imageUrl: null,
      date: null,
      meta: "On view",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-artists-vera-lu-s",
      section: "artists",
      createdAt: "2025-09-05T19:11:00.000Z",
      title: "Vera Luís",
      subtitle: "works on paper · represented since 2023",
      description: null,
      url: null,
      imageUrl: null,
      date: null,
      meta: "On loan",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-artists-bruno-sanches",
      section: "artists",
      createdAt: "2025-09-09T08:04:00.000Z",
      title: "Bruno Sanches",
      subtitle: "sculpture · represented since 2025",
      description: null,
      url: null,
      imageUrl: null,
      date: null,
      meta: "Conservation",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-links-programme",
      section: "links",
      createdAt: "2025-09-12T20:57:00.000Z",
      title: "Programme",
      subtitle: null,
      description: null,
      url: "https://terceiropiso.pt/programa",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Unlinked oral-historian persona — the demo coverage for the `record`
 *  (history) skin and its `skinData.record` block. Owned by Rita Camões. */
const ANTES_DE_NOS: DemoSubprofile = {
  ownerSlug: "rita",
  ownerName: "Rita Camões",
  id: "sp-rita-antes",
  kind: "oral_historian",
  slug: "antes-de-nos",
  handle: "antes-de-nos",
  displayName: "Antes de Nós",
  avatarUrl: null,
  tagline: "Recording the people who were here before the parade",
  bio: "An oral history project collecting testimony from LGBTQ+ people in Portugal who lived through the dictatorship, decriminalisation and the epidemic. Ninety-one recordings so far. Every narrator keeps the right to withdraw, forever.",
  coverUrl: null,
  accent: "amber",
  availability: "open_to_collabs",
  ctaLabel: "Add a testimony",
  ctaUrl: "https://antesdenos.pt/arquivo",
  socialLinks: [{ platform: "website", urlOrHandle: "antesdenos.pt" }],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 8,
  viewerEndorsed: false,
  followerCount: 174,
  viewerFollowing: false,
  skinData: {
    record: {
      held: "Arquivo Municipal de Lisboa · deposited yearly",
      access: "Open, unless the narrator sealed it",
      consent: "Withdrawable at any time, by anyone, without a reason",
      gaps: "Almost nothing survives from outside Lisbon and Porto before 1990. We say so rather than smoothing it over.",
    },
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-testimonies-maria-da-concei-o-84",
      section: "testimonies",
      createdAt: "2025-09-15T09:50:00.000Z",
      title: "Maria da Conceição, 84",
      subtitle: "Lisbon · recorded 2025",
      description:
        "On the bars behind Cais do Sodré that had no name on the door, and the police who knew exactly where they were.",
      url: null,
      imageUrl: null,
      date: "1962–1974",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-testimonies-ant-nio-toni-vale-71",
      section: "testimonies",
      createdAt: "2025-09-19T22:43:00.000Z",
      title: "António 'Toni' Vale, 71",
      subtitle: "Porto · recorded 2024",
      description:
        "On losing eleven friends in four years, and the ward where nobody would touch the door handle.",
      url: null,
      imageUrl: null,
      date: "1985–1992",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-testimonies-sealed-until-2040",
      section: "testimonies",
      createdAt: "2025-09-22T11:36:00.000Z",
      title: "Sealed until 2040",
      subtitle: "narrator's request",
      description:
        "Recorded and catalogued. Nobody hears it before the date they set.",
      url: null,
      imageUrl: null,
      date: "2023",
      meta: "Sealed until 2040",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-projects-ninety-one-voices",
      section: "projects",
      createdAt: "2025-09-27T00:29:00.000Z",
      title: "Ninety-One Voices",
      subtitle: "exhibition · Arquivo Municipal",
      description: null,
      url: null,
      imageUrl: null,
      date: "2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-projects-transcription-school",
      section: "projects",
      createdAt: "2025-09-29T13:22:00.000Z",
      title: "Transcription school",
      subtitle: "with volunteers from the network",
      description: null,
      url: null,
      imageUrl: null,
      date: "2024–",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-links-the-archive",
      section: "links",
      createdAt: "2025-10-04T02:15:00.000Z",
      title: "The archive",
      subtitle: null,
      description: null,
      url: "https://antesdenos.pt/arquivo",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Unlinked organiser persona — the demo coverage for the `poster`
 *  (collective) skin and its `skinData.nextAction`/`principles` blocks. Owned
 *  by Vera Duarte, kept standalone. */
const BLOCO_ROSA: DemoSubprofile = {
  ownerSlug: "vera",
  ownerName: "Vera Duarte",
  id: "sp-vera-bloco",
  kind: "organizer",
  slug: "bloco-rosa",
  handle: "bloco-rosa",
  displayName: "BLOCO ROSA",
  avatarUrl: null,
  tagline: "Housing, healthcare, and getting people to the room",
  bio: "A queer tenants' and healthcare organising bloc in Lisbon. We turn up to evictions, we fill waiting rooms, and we run an assembly on the third Saturday of every month that anyone can speak at.",
  coverUrl: null,
  accent: "coral",
  availability: "open_to_collabs",
  ctaLabel: "Come to the assembly",
  ctaUrl: "https://blocorosa.pt/rede",
  socialLinks: [{ platform: "instagram", urlOrHandle: "@blocorosa" }],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 14,
  viewerEndorsed: false,
  followerCount: 620,
  viewerFollowing: false,
  skinData: {
    nextAction: {
      what: "Housing assembly",
      when: "Sat 21 Mar · 15:00",
      where: "Casa do Comum, Bairro Alto",
    },
    principles: [
      "Nobody is handed to the police. Ever.",
      "Decisions are made by the people who show up in the room.",
      "Trans healthcare is housing is migration. We do not rank them.",
      "Childcare and interpretation at every assembly, or the assembly is postponed.",
    ],
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-campaigns-despejo-zero",
      section: "campaigns",
      createdAt: "2025-10-06T16:08:00.000Z",
      title: "Despejo Zero",
      subtitle: "eviction defence · Anjos & Intendente",
      description:
        "Nineteen households kept in their homes since 2024. A phone tree, a legal clinic, and a lot of bodies in doorways.",
      url: null,
      imageUrl: null,
      date: "2024–",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-campaigns-fila-trans",
      section: "campaigns",
      createdAt: "2025-10-11T05:01:00.000Z",
      title: "Fila Trans",
      subtitle: "healthcare waiting lists",
      description:
        "Accompaniment for anyone facing a hostile appointment, plus the paperwork nobody explains to you.",
      url: null,
      imageUrl: null,
      date: "2025–",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-actions-housing-assembly",
      section: "actions",
      createdAt: "2025-10-13T17:54:00.000Z",
      title: "Housing assembly",
      subtitle: "Casa do Comum · open to all",
      description: null,
      url: null,
      imageUrl: null,
      date: "21 Mar 2026",
      meta: "Upcoming",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-actions-waiting-room-takeover",
      section: "actions",
      createdAt: "2025-10-18T06:47:00.000Z",
      title: "Waiting room takeover",
      subtitle: "Hospital Santa Maria",
      description: null,
      url: null,
      imageUrl: null,
      date: "4 Apr 2026",
      meta: "Upcoming",
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-actions-march-for-trans-healthcare",
      section: "actions",
      createdAt: "2025-10-20T19:40:00.000Z",
      title: "March for trans healthcare",
      subtitle: "Marquês to Rossio",
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
      id: "itm-links-phone-tree",
      section: "links",
      createdAt: "2025-10-25T08:33:00.000Z",
      title: "Phone tree",
      subtitle: null,
      description: null,
      url: "https://blocorosa.pt/rede",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Unlinked teacher persona — the demo coverage for the `classroom` skin and
 *  its `skinData.fees`/`promises` blocks. Owned by Hugo Bernárdez. */
const AULA_ABERTA: DemoSubprofile = {
  ownerSlug: "hugo",
  ownerName: "Hugo Bernárdez",
  id: "sp-hugo-aula",
  kind: "teacher",
  slug: "aula-aberta",
  handle: "aula-aberta",
  displayName: "Aula Aberta",
  avatarUrl: null,
  tagline: "Portuguese, from scratch, for queer people who just arrived",
  bio: "Free Portuguese classes for LGBTQ+ migrants and refugees in Lisbon. Small groups, no level tests, no paperwork, and nobody is asked about their status at the door.",
  coverUrl: null,
  accent: "jade",
  availability: "open_to_collabs",
  ctaLabel: "Join a class",
  ctaUrl: "https://aulaaberta.pt/horario",
  socialLinks: [{ platform: "instagram", urlOrHandle: "@aulaaberta.lx" }],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 11,
  viewerEndorsed: false,
  followerCount: 265,
  viewerFollowing: false,
  skinData: {
    fees: {
      cost: "Free, always, for everyone",
      materials: "Books, notebooks and pens provided",
      where: "Biblioteca dos Anjos, Tuesdays & Saturdays",
      extras: "Childcare on Saturdays · metro fare reimbursed if you ask",
      note: "No paperwork. Nobody is asked about their status at the door.",
    },
    promises: [
      "You leave able to say what you need at a health centre.",
      "You leave with the words for your own family, in the shape your family actually has.",
      "You are never made to read out loud before you want to.",
    ],
  },
  affiliations: [],
  endorsers: [],
  items: [
    {
      id: "itm-courses-portugu-s-a1-from-zero",
      section: "courses",
      createdAt: "2025-10-27T21:26:00.000Z",
      title: "Português A1 · from zero",
      subtitle: "12 weeks · Tuesdays 19:00",
      description:
        "For people with no Portuguese at all. Starts again every twelve weeks, no test to get in.",
      url: null,
      imageUrl: null,
      date: "Week 1–12",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-courses-portugu-s-a2-paperwork-appointments",
      section: "courses",
      createdAt: "2025-10-31T10:19:00.000Z",
      title: "Português A2 · paperwork & appointments",
      subtitle: "8 weeks · Saturdays 11:00",
      description:
        "SEF forms, health centre appointments, tenancy contracts, and how to say no on the phone.",
      url: null,
      imageUrl: null,
      date: "Week 1–8",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-courses-conversation-table",
      section: "courses",
      createdAt: "2025-11-04T00:12:00.000Z",
      title: "Conversation table",
      subtitle: "weekly · drop in",
      description:
        "No curriculum. Coffee, and an hour where nobody corrects your accent.",
      url: null,
      imageUrl: null,
      date: "Ongoing",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-resources-health-centre-phrasebook",
      section: "resources",
      createdAt: "2025-11-07T13:05:00.000Z",
      title: "Health centre phrasebook",
      subtitle: "PT / EN / FR / AR · free download",
      description: null,
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-resources-name-and-gender-marker-forms-explained",
      section: "resources",
      createdAt: "2025-11-11T01:58:00.000Z",
      title: "Name and gender-marker forms, explained",
      subtitle: "updated Feb 2026",
      description: null,
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-links-timetable",
      section: "links",
      createdAt: "2025-11-14T14:51:00.000Z",
      title: "Timetable",
      subtitle: null,
      description: null,
      url: "https://aulaaberta.pt/horario",
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};

/** Linked pole-dancer persona — the demo coverage for a `stage`-skin kind that
 *  is both performer and teacher (sections `performances`/`classes`/`reel`/
 *  `workshops`). Owned by Jordan Park. */
const IRON_ORCHID: DemoSubprofile = {
  ownerSlug: "jordan",
  ownerName: "Jordan Park",
  id: "sp-jordan-iron-orchid",
  kind: "pole_dancer",
  slug: "iron-orchid",
  handle: "iron-orchid",
  displayName: "Iron Orchid",
  avatarUrl: null,
  tagline: "Pole as strength and as language. I perform, and I teach.",
  bio: "Iron Orchid is a pole practice built on strength, control, and expression. I perform showcases across the city and teach weekly classes for every body: beginners welcome, no prior athletic background assumed. Trans and queer students especially welcome.",
  coverUrl: null,
  accent: "coral",
  availability: "booking",
  ctaLabel: "Book a class",
  ctaUrl: "https://ironorchid.studio/classes",
  socialLinks: [
    { platform: "instagram", urlOrHandle: "@ironorchid" },
    { platform: "website", urlOrHandle: "ironorchid.studio" },
  ],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 0,
  endorsementCount: 5,
  viewerEndorsed: false,
  followerCount: 74,
  viewerFollowing: false,
  skinData: null,
  affiliations: [],
  endorsers: [
    {
      slug: "maria",
      name: "Maria Ferreira",
      avatarUrl: null,
      note: "Iron Orchid's beginner class was the first time a studio felt built for a body like mine.",
    },
    {
      slug: "anika",
      name: "Anika Kovač",
      avatarUrl: null,
      note: null,
    },
    {
      slug: "rui",
      name: "Rui Batista",
      avatarUrl: null,
      note: null,
    },
  ],
  items: [
    {
      id: "itm-performances-vertical-live",
      section: "performances",
      createdAt: "2025-11-18T03:44:00.000Z",
      title: "Vertical, live",
      subtitle: "Casa do Comum · Lisbon",
      description:
        "A twenty-minute showcase set: three pieces, one continuous arc from floor to top of the pole.",
      url: null,
      imageUrl: null,
      date: "14 Jun 2026",
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-classes-beginner-pole-foundations",
      section: "classes",
      createdAt: "2025-11-21T16:37:00.000Z",
      title: "Beginner pole: foundations",
      subtitle: "Level 1 · weekly · Estúdio Norte",
      description:
        "Grip, spins, and your first climb, at a pace that assumes nothing. Every body, every week.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: true,
      collaborators: [],
    },
    {
      id: "itm-classes-flow-choreography",
      section: "classes",
      createdAt: "2025-11-25T05:30:00.000Z",
      title: "Flow & choreography",
      subtitle: "Level 2 · weekly · Estúdio Norte",
      description:
        "Once the basics are yours: linking moves into phrases, and phrases into a piece that's yours.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-reel-2026-reel",
      section: "reel",
      createdAt: "2025-11-28T18:23:00.000Z",
      title: "2026 reel",
      subtitle: "Two minutes",
      description: "Showcase highlights and studio footage from the last year.",
      url: null,
      imageUrl: null,
      date: null,
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
    {
      id: "itm-workshops-aerial-strength-intensive",
      section: "workshops",
      createdAt: "2025-12-02T07:16:00.000Z",
      title: "Aerial strength intensive",
      subtitle: "One day · open level",
      description:
        "A single-session deep dive into the conditioning that makes everything else possible.",
      url: null,
      imageUrl: null,
      date: "12 Sep 2026",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
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
  IRON_ORCHID,
  CADEIRA_LIVRE,
  SANTA_CRUEL,
  TERCEIRO_PISO,
  ANTES_DE_NOS,
  BLOCO_ROSA,
  AULA_ABERTA,
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
    linkVisibility: sp.linkVisibility,
    ownerSlug: sp.linkVisibility === "linked" ? sp.ownerSlug : null,
    slug: sp.slug,
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
  sp.viewerEndorsementNote = viewerEndorsed ? note?.trim() || null : null;
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

/** Directory cards: published + open + not removed, filtered by kind/query.
 *  Includes both unlinked AND linked personas (linked ones route to their
 *  owner-nested URL via `personaCardPath`). */
export const mockDirectory = (
  params: { kind?: string; query?: string } = {},
): SubprofileCardDTO[] => {
  const q = params.query?.trim().toLowerCase();
  return DEMO_SUBPROFILES.filter(
    (s) =>
      s.status === "published" &&
      s.visibility === "open" &&
      !s.removedAt &&
      (!params.kind || s.kind === params.kind) &&
      (!q ||
        s.displayName.toLowerCase().includes(q) ||
        (s.tagline ?? "").toLowerCase().includes(q)),
  ).map(toCardDto);
};

/** Therapist-kind personas for the resources directory. Unlike `mockDirectory`,
 *  this INCLUDES linked personas (so Sofia, linked to Maria, appears). */
export const therapistPersonaCardsDemo = (): SubprofilePublicDTO[] =>
  DEMO_SUBPROFILES.filter(
    (s) =>
      s.kind === "therapist" &&
      s.status === "published" &&
      s.visibility === "open" &&
      !s.removedAt,
  ).map((sp) => toPublicDto(sp));

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
      linkVisibility: NIGHTFORM.linkVisibility,
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
