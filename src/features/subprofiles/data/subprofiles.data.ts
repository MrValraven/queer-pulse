import { currentUser, currentUserSlug } from "../../members/data/members";
import { isContentSection } from "../subprofile-kinds";
import type {
  CollaboratorDTO,
  EndorserDTO,
  MemberDTO,
  MyInviteDTO,
  PersonaInviteDTO,
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
    {
      section: "gigs",
      title: "Rrraw · Warehouse",
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
      title: "Tидe",
      subtitle: null,
      description: "A queue-backed job runner with first-class backpressure.",
      url: "https://example.com/tide",
      imageUrl: null,
      date: "2025",
      meta: null,
      tags: ["Rust", "Postgres"],
      isFeatured: false,
      collaborators: [],
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

/** Every demo persona across all owners. */
export const DEMO_SUBPROFILES: DemoSubprofile[] = [
  NIGHTFORM,
  RUI_DEV,
  ANIKA_WRITER,
  ANDRE_LENS,
  TIAGO_DRAFT,
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
  };
}

/** Owner-strip when unlinked; keep ownerSlug/ownerName only when linked. */
export function toPublicDto(sp: DemoSubprofile): SubprofilePublicDTO {
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
    items: sp.items,
    endorsementCount: sp.endorsementCount,
    viewerEndorsed: sp.viewerEndorsed,
    followerCount: sp.followerCount,
    viewerFollowing: sp.viewerFollowing,
    affiliations: sp.affiliations,
    // Demo has no reachable public view of the one co-owned persona (it's
    // the current user's unpublished draft — `DEMO_CO_OWNED_SUBPROFILE_ID` —
    // so it never passes the linked+published / unlinked+published+open
    // gates below). Every demo public persona is solo-owned, so `false` here
    // is always correct, not a placeholder.
    viewerIsMember: false,
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
 *  consistent count. Idempotent: repeating the same direction is a no-op. */
export const mockSetEndorsed = (
  id: string,
  viewerEndorsed: boolean,
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
  return {
    endorsementCount: sp.endorsementCount,
    viewerEndorsed: sp.viewerEndorsed,
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

/** Public fetch by global handle (unlinked + published) — GET /by-handle/:handle. */
export const mockPublicByHandle = (
  handle: string,
): SubprofilePublicDTO | null => {
  const sp = DEMO_SUBPROFILES.find(
    (s) =>
      s.handle === handle &&
      s.status === "published" &&
      s.linkVisibility === "unlinked",
  );
  return sp ? toPublicDto(sp) : null;
};

/** Linked + published personas of a member — GET /profiles/:slug/subprofiles. */
export const mockSubprofilesForProfile = (
  ownerSlug: string,
): SubprofilePublicDTO[] =>
  DEMO_SUBPROFILES.filter(
    (s) =>
      s.ownerSlug === ownerSlug &&
      s.status === "published" &&
      s.linkVisibility === "linked",
  ).map(toPublicDto);

/** Public fetch by owner slug + persona slug (nested URL) — from the same list. */
export const mockPublicByOwnerSlug = (
  ownerSlug: string,
  subslug: string,
): SubprofilePublicDTO | null => {
  const sp = DEMO_SUBPROFILES.find(
    (s) =>
      s.ownerSlug === ownerSlug &&
      s.slug === subslug &&
      s.status === "published" &&
      s.linkVisibility === "linked",
  );
  return sp ? toPublicDto(sp) : null;
};

/** Directory cards: unlinked + published + open, filtered by kind/query. */
export const mockDirectory = (
  params: { kind?: string; query?: string } = {},
): SubprofileCardDTO[] => {
  const q = params.query?.trim().toLowerCase();
  return DEMO_SUBPROFILES.filter(
    (s) =>
      s.status === "published" &&
      s.linkVisibility === "unlinked" &&
      s.visibility === "open" &&
      (!params.kind || s.kind === params.kind) &&
      (!q ||
        s.displayName.toLowerCase().includes(q) ||
        (s.tagline ?? "").toLowerCase().includes(q)),
  ).map(toCardDto);
};

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
