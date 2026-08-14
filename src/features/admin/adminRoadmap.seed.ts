/**
 * Seed data for the demo-mode admin roadmap store (`adminRoadmap.data.ts`).
 * Split out purely for file size — `buildRoadmapSeed()` is the only export
 * the store logic needs.
 *
 * Transcribed for fidelity from the backend's rich fixture
 * (`queerpulse-backend/src/roadmap/roadmap.seed.ts`,
 * `ROADMAP_ADMIN_SEED_ITEMS`/`_PENDING_IDEAS`/`_NOT_BUILDING`/`_TEAM`/
 * `_AUDIT`/`_HERO_STATS`), itself transcribed from the Claude Design
 * project's `qp-roadmap-data.js` prototype fixture — so the demo board reads
 * the same as a freshly-seeded live database. Item ids reuse the base public
 * mock's ids (`marketing/roadmap.data.ts`) where an item overlaps with it
 * (e.g. `gathering-dashboard`, `mobile-app-beta`); the 12 items that only
 * exist in the rich admin fixture (e.g. `safe-spaces-map`,
 * `therapist-directory`) get fresh kebab-case ids. This is demo fiction —
 * owner/team names and ids are made up for the prototype, not a live user.
 */

import type {
  AdminItemCommentDTO,
  AdminRoadmapIdeaDTO,
  AdminRoadmapItemDTO,
  AdminVoteBreakdownDTO,
  RoadmapAdminHeroStatDTO,
  RoadmapAuditEntryDTO,
  RoadmapColumn,
  RoadmapConfidence,
  RoadmapCost,
  RoadmapDeclineReason,
  RoadmapGuideDTO,
  RoadmapGuideStep,
  RoadmapPaidKind,
  RoadmapPriority,
  RoadmapSafetyStatus,
  RoadmapSlipEntryDTO,
  RoadmapTeamMemberDTO,
} from "./api/roadmapAdmin.api";
import type { DemoRoadmapState } from "./adminRoadmap.data";

// ── Demo owner/team identities ──────────────────────────────────────────────
// Stable fake ids so an item's `ownerId` and a roster row's `userId` can
// point at the same demo person (the Capacity view sums building-load hours
// against a team member's `userId`). Never real user ids — this store never
// runs in live mode.

const OWNER_TIAGO = "demo-owner-tiago-costa";
const OWNER_MARIANA = "demo-owner-mariana-reis";
const OWNER_JO = "demo-owner-jo-silva";
const OWNER_ANA = "demo-owner-ana-duarte";
const OWNER_VERA = "demo-owner-vera-lopes";

const OWNER_NAME: Record<string, string> = {
  [OWNER_TIAGO]: "Tiago Costa",
  [OWNER_MARIANA]: "Mariana Reis",
  [OWNER_JO]: "Jo Silva",
  [OWNER_ANA]: "Ana Duarte",
  [OWNER_VERA]: "Vera Lopes",
};

// ── Vote-breakdown fiction ──────────────────────────────────────────────────
// The admin DTO's `voteBreakdown` needs a plausible "which communities voted
// for this" split. There's no real vote ledger in demo mode, so this derives
// a deterministic (not random — stable across reads) top-two/other split
// from the item's own name, roughly matching the prototype's ~42%/~31%/rest
// shape.

const VOTER_COMMUNITY_POOL = [
  "Trans Lisboa",
  "Queer Nightlife Crew",
  "Neurodivergent & Queer",
  "Poly & Kinky Lisboa",
  "Bear Community PT",
  "Queer Book Club",
  "Sober & Queer",
  "Queer Parents Network",
];

function communityPoolOffset(seedText: string): number {
  let charCodeSum = 0;
  for (let charIndex = 0; charIndex < seedText.length; charIndex += 1) {
    charCodeSum += seedText.charCodeAt(charIndex);
  }
  return charCodeSum;
}

function buildVoteBreakdown(
  itemName: string,
  votes: number,
): AdminVoteBreakdownDTO {
  if (votes <= 0) return { top: [], other: 0 };
  const offset = communityPoolOffset(itemName);
  const firstCommunity =
    VOTER_COMMUNITY_POOL[offset % VOTER_COMMUNITY_POOL.length] ??
    "Trans Lisboa";
  const secondCommunity =
    VOTER_COMMUNITY_POOL[(offset + 3) % VOTER_COMMUNITY_POOL.length] ??
    "Queer Nightlife Crew";
  const firstCount = Math.round(votes * 0.42);
  const secondCount = Math.round(votes * 0.31);
  const otherCount = Math.max(votes - firstCount - secondCount, 0);
  return {
    top: [
      { communityName: firstCommunity, count: firstCount },
      { communityName: secondCommunity, count: secondCount },
    ],
    other: otherCount,
  };
}

// ── Guide helper ─────────────────────────────────────────────────────────────

const ALL_GUIDE_STEPS: RoadmapGuideStep[] = [
  "research",
  "draft",
  "lived",
  "expert",
  "translate",
  "publish",
];

function buildGuide(fields: {
  reviewer: string;
  credential: string;
  reVerifyBy: string | null;
  languages: { en: boolean; pt: boolean; br: boolean };
  trueSteps: RoadmapGuideStep[];
}): RoadmapGuideDTO {
  const steps = {} as Record<RoadmapGuideStep, boolean>;
  for (const step of ALL_GUIDE_STEPS) {
    steps[step] = fields.trueSteps.includes(step);
  }
  return {
    reviewer: fields.reviewer,
    credential: fields.credential,
    reVerifyBy: fields.reVerifyBy,
    languages: fields.languages,
    steps,
  };
}

// ── Item factory ─────────────────────────────────────────────────────────────
// Every field the backend's `RoadmapItem` entity defaults, defaulted here
// too, so each of the 24 item literals below only states what makes it
// distinct.

interface SeedItemFields {
  id: string;
  column: RoadmapColumn;
  category: string;
  name: string;
  description: string;
  publicNote?: string | null;
  date?: string | null;
  stage?: string | null;
  eta?: string | null;
  targetQuarter?: string | null;
  progress?: number | null;
  priority?: RoadmapPriority;
  confidence?: RoadmapConfidence;
  committed?: boolean;
  isPublic?: boolean;
  requested?: boolean;
  hot?: boolean;
  notified?: boolean;
  spikeFlag?: boolean;
  safetyStatus?: RoadmapSafetyStatus;
  blockedBy?: string | null;
  blockedWhy?: string | null;
  paidKind?: RoadmapPaidKind;
  weeklyHours?: number;
  cost?: RoadmapCost;
  ownerId?: string | null;
  slips?: RoadmapSlipEntryDTO[];
  guide?: RoadmapGuideDTO | null;
  deps?: string[];
  votes: number;
  comments?: AdminItemCommentDTO[];
  archived?: boolean;
  sortOrder: number;
  updatedAt: string;
}

function buildItem(fields: SeedItemFields): AdminRoadmapItemDTO {
  const ownerId = fields.ownerId ?? null;
  return {
    id: fields.id,
    column: fields.column,
    category: fields.category,
    name: fields.name,
    description: fields.description,
    publicNote: fields.publicNote ?? null,
    date: fields.date ?? null,
    stage: fields.stage ?? null,
    eta: fields.eta ?? null,
    targetQuarter: fields.targetQuarter ?? null,
    progress: fields.progress ?? null,
    priority: fields.priority ?? "P2",
    confidence: fields.confidence ?? "maybe",
    committed: fields.committed ?? false,
    isPublic: fields.isPublic ?? true,
    requested: fields.requested ?? false,
    hot: fields.hot ?? false,
    notified: fields.notified ?? false,
    spikeFlag: fields.spikeFlag ?? false,
    safetyStatus: fields.safetyStatus ?? 0,
    blockedBy: fields.blockedBy ?? null,
    blockedWhy: fields.blockedWhy ?? null,
    paidKind: fields.paidKind ?? "volunteer",
    weeklyHours: fields.weeklyHours ?? 0,
    cost: fields.cost ?? "none",
    ownerId,
    ownerName: ownerId ? (OWNER_NAME[ownerId] ?? null) : null,
    slips: fields.slips ?? [],
    guide: fields.guide ?? null,
    deps: fields.deps ?? [],
    votes: fields.votes,
    liveVotes: 0,
    voteBreakdown: buildVoteBreakdown(fields.name, fields.votes),
    comments: fields.comments ?? [],
    archived: fields.archived ?? false,
    sortOrder: fields.sortOrder,
    updatedAt: fields.updatedAt,
  };
}

// ── The 24 items ─────────────────────────────────────────────────────────────
// Grouped by column, matching the backend fixture's own ordering. NOTE the
// safety-gate invariant the admin service enforces: no item may have
// `isPublic: true` together with `safetyStatus: 1` (review required) —
// "Honest employer reviews", "Portuguese legal rights guide", "Anonymous Q&A
// threads" and "Shared housing board" are all gated `isPublic: false` below.

function buildShippedItems(): AdminRoadmapItemDTO[] {
  return [
    buildItem({
      id: "gathering-dashboard",
      column: "shipped",
      category: "Gatherings",
      name: "Gathering dashboard",
      description:
        "Live check-in and attendance management for hosts, including QR scanning and waitlist promotion.",
      date: "May 2026",
      progress: 100,
      votes: 88,
      publicNote: "Hosting, without the spreadsheet.",
      targetQuarter: "Q3 2026",
      priority: "P1",
      confidence: "likely",
      committed: true,
      isPublic: true,
      notified: true,
      ownerId: OWNER_MARIANA,
      sortOrder: 0,
      updatedAt: "2026-05-28T10:00:00.000Z",
    }),
    buildItem({
      id: "moderation-queue",
      column: "shipped",
      category: "Safety",
      name: "Moderation queue",
      description:
        "Internal tools for reviewing member reports, assigning cases, and issuing decisions.",
      date: "Apr 2026",
      progress: 100,
      votes: 71,
      requested: true,
      publicNote: "Safety built into the infrastructure.",
      targetQuarter: "Q3 2026",
      priority: "P0",
      confidence: "likely",
      committed: true,
      isPublic: true,
      notified: true,
      ownerId: OWNER_TIAGO,
      sortOrder: 1,
      updatedAt: "2026-04-25T09:00:00.000Z",
    }),
    buildItem({
      id: "connection-requests",
      column: "shipped",
      category: "Members",
      name: "Connection requests",
      description:
        "Send, receive, accept and decline connection requests. Mutual connections view included.",
      date: "Mar 2026",
      progress: 100,
      votes: 56,
      publicNote: "Introductions, not cold DMs.",
      targetQuarter: "Q3 2026",
      priority: "P1",
      confidence: "likely",
      committed: true,
      isPublic: true,
      notified: true,
      ownerId: OWNER_JO,
      sortOrder: 2,
      updatedAt: "2026-03-20T09:00:00.000Z",
    }),
    buildItem({
      id: "badges-levels",
      column: "shipped",
      category: "Community",
      name: "Badges & levels",
      description:
        "XP system, earned badges, member perks, and a redeem page for level bonuses.",
      date: "Jun 2026",
      progress: 100,
      votes: 34,
      requested: false,
      publicNote: "Recognition for the people who build this.",
      priority: "P2",
      confidence: "likely",
      committed: false,
      isPublic: false,
      ownerId: OWNER_ANA,
      sortOrder: 3,
      updatedAt: "2026-06-18T09:00:00.000Z",
    }),
    buildItem({
      id: "safe-spaces-map",
      column: "shipped",
      category: "Safety",
      name: "Safe spaces map",
      description:
        "Member-sourced map of physically and socially safe venues, filtered by verified tags.",
      date: "Jul 2026",
      progress: 100,
      votes: 112,
      requested: true,
      publicNote: "Where you can exhale.",
      targetQuarter: "Q3 2026",
      priority: "P0",
      confidence: "likely",
      committed: true,
      isPublic: true,
      notified: true,
      safetyStatus: 2,
      ownerId: OWNER_TIAGO,
      sortOrder: 4,
      updatedAt: "2026-07-22T09:00:00.000Z",
    }),
  ];
}

function buildBuildingItemsPartOne(): AdminRoadmapItemDTO[] {
  return [
    buildItem({
      id: "therapist-directory",
      column: "building",
      category: "Resources",
      name: "Vetted therapist directory",
      description:
        "Licensed, WPATH-informed therapists reviewed by members who've actually seen them, then vetted before listing.",
      stage: "In progress",
      eta: "~Q3 2026",
      progress: 60,
      votes: 214,
      requested: true,
      publicNote:
        "A directory of therapists our members have actually sat with.",
      targetQuarter: "Q3 2026",
      priority: "P0",
      confidence: "likely",
      committed: true,
      isPublic: true,
      paidKind: "paid",
      weeklyHours: 12,
      cost: "funded",
      safetyStatus: 2,
      ownerId: OWNER_MARIANA,
      guide: buildGuide({
        reviewer: "Dr. Inês Bragança",
        credential: "Clinical psychologist, WPATH-trained",
        reVerifyBy: "2027-02-01",
        languages: { en: true, pt: true, br: false },
        trueSteps: ["research", "draft", "lived"],
      }),
      comments: [
        {
          id: "comment-therapist-1",
          authorLabel: "Mariana Reis",
          body: "Two more therapists submitted their credentials this week, adding to the vetting queue.",
          hidden: false,
          createdAt: "2026-07-29T14:00:00.000Z",
        },
      ],
      sortOrder: 0,
      updatedAt: "2026-08-01T11:00:00.000Z",
    }),
    buildItem({
      id: "trans-health-guide",
      column: "building",
      category: "Resources",
      name: "Trans health guide",
      description:
        "Endocrinology-reviewed guide to hormone therapy access, dosing, and pathways in the Portuguese public and private systems.",
      stage: "In progress",
      eta: "~Q4 2026",
      progress: 45,
      votes: 198,
      requested: true,
      publicNote: "The guide we all wish someone had handed us.",
      targetQuarter: "Q4 2026",
      priority: "P0",
      confidence: "maybe",
      committed: true,
      isPublic: true,
      weeklyHours: 6,
      cost: "needs",
      safetyStatus: 2,
      ownerId: OWNER_ANA,
      slips: [
        {
          from: "Q3 2026",
          to: "Q4 2026",
          reason:
            "Clinical reviewer availability: we would rather be late than wrong on dosages and pathways.",
          movedByName: "Ana Duarte",
          movedAt: "2026-07-12T00:00:00.000Z",
        },
      ],
      guide: buildGuide({
        reviewer: "Dr. Miguel Antunes",
        credential: "Endocrinologist, CHULN",
        reVerifyBy: "2027-01-15",
        languages: { en: true, pt: true, br: true },
        trueSteps: ["research", "draft"],
      }),
      sortOrder: 1,
      updatedAt: "2026-07-30T15:00:00.000Z",
    }),
    buildItem({
      id: "employer-reviews",
      column: "building",
      category: "Economy",
      name: "Honest employer reviews",
      description:
        "Structured, named employer reviews from members, held pending a legal read on defamation exposure before launch.",
      stage: "Blocked",
      eta: "~Q4 2026",
      progress: 25,
      votes: 189,
      requested: true,
      publicNote: "Which Lisbon employers are actually safe to be out at.",
      targetQuarter: "Q4 2026",
      priority: "P1",
      confidence: "maybe",
      // Gated (`safetyStatus: 1`) — must stay non-public, see the file-level
      // invariant note above.
      isPublic: false,
      paidKind: "paid",
      weeklyHours: 10,
      cost: "small",
      safetyStatus: 1,
      spikeFlag: true,
      blockedBy: "Sofia Melo (legal)",
      blockedWhy:
        "Defamation exposure on named-employer reviews: waiting on a written opinion before we open it up.",
      ownerId: OWNER_JO,
      comments: [
        {
          id: "comment-employer-1",
          authorLabel: "Jo Silva",
          body: "Legal opinion should land by end of month. Holding until then.",
          hidden: false,
          createdAt: "2026-08-03T08:20:00.000Z",
        },
      ],
      sortOrder: 2,
      updatedAt: "2026-08-03T08:20:00.000Z",
    }),
    buildItem({
      id: "vouch-chain-visibility",
      column: "building",
      category: "Safety",
      name: "Vouch chain visibility",
      description:
        "Surfaces the vouch chain that got a member into the platform, so trust is visible instead of implicit.",
      stage: "In progress",
      eta: "~Q3 2026",
      progress: 75,
      votes: 64,
      publicNote: "See the door you walked through.",
      targetQuarter: "Q3 2026",
      priority: "P0",
      confidence: "likely",
      committed: true,
      isPublic: true,
      paidKind: "paid",
      weeklyHours: 14,
      cost: "funded",
      safetyStatus: 2,
      ownerId: OWNER_TIAGO,
      sortOrder: 3,
      updatedAt: "2026-07-28T09:00:00.000Z",
    }),
  ];
}

function buildBuildingItemsPartTwo(): AdminRoadmapItemDTO[] {
  return [
    buildItem({
      id: "mobile-app-beta",
      column: "building",
      category: "Platform",
      name: "Mobile app beta",
      description:
        "iOS and Android apps, starting with gatherings and messaging. Beta invites go to Level 4+ members first.",
      stage: "In progress",
      eta: "~Q3 2026",
      progress: 60,
      votes: 167,
      publicNote: "The room, in your pocket.",
      targetQuarter: "Q3 2026",
      priority: "P0",
      confidence: "likely",
      committed: true,
      isPublic: true,
      paidKind: "paid",
      weeklyHours: 18,
      cost: "funded",
      ownerId: OWNER_JO,
      slips: [
        {
          from: "Q2 2026",
          to: "Q3 2026",
          reason:
            "App Store review flagged the invite-only flow twice. We rebuilt onboarding rather than open the doors.",
          movedByName: "Jo Silva",
          movedAt: "2026-05-02T00:00:00.000Z",
        },
      ],
      sortOrder: 4,
      updatedAt: "2026-07-29T10:00:00.000Z",
    }),
    buildItem({
      id: "magazine-contributor-tools",
      column: "building",
      category: "Content",
      name: "Magazine contributor tools",
      description:
        "Drafting, editing, and publishing tools so members can write for the magazine directly.",
      stage: "In progress",
      eta: "~Q3 2026",
      progress: 35,
      votes: 59,
      requested: true,
      publicNote: "Get paid to write for us.",
      targetQuarter: "Q3 2026",
      priority: "P2",
      confidence: "maybe",
      isPublic: true,
      weeklyHours: 6,
      cost: "small",
      ownerId: OWNER_ANA,
      sortOrder: 5,
      updatedAt: "2026-07-20T09:00:00.000Z",
    }),
    buildItem({
      id: "map-view-gatherings",
      column: "building",
      category: "Gatherings",
      name: "Map view for gatherings",
      description:
        "Browse upcoming events on a city map. Filter by date, type, and distance.",
      stage: "Early design",
      eta: "~Q4 2026",
      progress: 20,
      votes: 73,
      publicNote: "What is on near you, this week.",
      targetQuarter: "Q4 2026",
      priority: "P2",
      confidence: "maybe",
      isPublic: true,
      weeklyHours: 4,
      ownerId: OWNER_MARIANA,
      deps: ["safe-spaces-map"],
      sortOrder: 6,
      updatedAt: "2026-07-15T09:00:00.000Z",
    }),
  ];
}

function buildPlannedItems(): AdminRoadmapItemDTO[] {
  return [
    buildItem({
      id: "legal-rights-guide",
      column: "planned",
      category: "Resources",
      name: "Portuguese legal rights guide",
      description:
        "Plain-language guide to Portuguese legal protections and processes: name/gender marker changes, anti-discrimination law, housing and employment rights.",
      votes: 176,
      requested: true,
      publicNote: "Your rights here, in words that make sense.",
      targetQuarter: "Q4 2026",
      priority: "P1",
      confidence: "maybe",
      committed: true,
      // Gated (`safetyStatus: 1`) — see the invariant note above.
      isPublic: false,
      weeklyHours: 5,
      cost: "needs",
      safetyStatus: 1,
      ownerId: OWNER_VERA,
      guide: buildGuide({
        reviewer: "Sofia Melo",
        credential: "Lawyer, ILGA Portugal",
        reVerifyBy: "2027-03-01",
        languages: { en: true, pt: true, br: false },
        trueSteps: ["research"],
      }),
      sortOrder: 0,
      updatedAt: "2026-07-10T09:00:00.000Z",
    }),
    buildItem({
      id: "business-directory",
      column: "planned",
      category: "Economy",
      name: "Queer-owned business directory",
      description:
        "A curated directory of queer-owned and affirming businesses in Lisbon and beyond.",
      votes: 142,
      hot: true,
      requested: true,
      publicNote: "Spend your money where it comes back to us.",
      targetQuarter: "Q4 2026",
      priority: "P1",
      confidence: "likely",
      isPublic: true,
      weeklyHours: 6,
      ownerId: null,
      sortOrder: 1,
      updatedAt: "2026-07-18T09:00:00.000Z",
    }),
    buildItem({
      id: "peer-mentoring-matches",
      column: "planned",
      category: "Members",
      name: "Peer mentoring matches",
      description:
        "Matches newer members with someone a few steps further along, opt-in and time-boxed.",
      votes: 131,
      requested: true,
      publicNote: "Someone a few steps ahead of you, once a month.",
      targetQuarter: "Q1 2027",
      priority: "P1",
      confidence: "maybe",
      isPublic: true,
      weeklyHours: 8,
      paidKind: "paid",
      ownerId: OWNER_MARIANA,
      deps: ["vouch-chain-visibility"],
      sortOrder: 2,
      updatedAt: "2026-07-05T09:00:00.000Z",
    }),
    buildItem({
      id: "sexual-health-guide",
      column: "planned",
      category: "Resources",
      name: "Sexual health guide",
      description:
        "Testing sites, PrEP access, and harm-reduction basics reviewed by a sexual health nurse.",
      votes: 124,
      requested: true,
      publicNote: "Testing, PrEP and care, without the lecture.",
      targetQuarter: "Q4 2026",
      priority: "P1",
      confidence: "likely",
      committed: true,
      isPublic: true,
      weeklyHours: 5,
      safetyStatus: 2,
      ownerId: OWNER_ANA,
      guide: buildGuide({
        reviewer: "Enfermeira Cláudia Pinto",
        credential: "Sexual health nurse, CheckpointLX",
        reVerifyBy: "2027-02-01",
        languages: { en: true, pt: true, br: false },
        trueSteps: ["research"],
      }),
      sortOrder: 3,
      updatedAt: "2026-07-08T09:00:00.000Z",
    }),
    buildItem({
      id: "anon-qa",
      column: "planned",
      category: "Members",
      name: "Anonymous Q&A threads",
      description:
        "Ask questions anonymously within communities. No names. Just honest answers.",
      votes: 98,
      requested: true,
      publicNote: "Ask the thing you cannot sign your name to.",
      targetQuarter: "Q4 2026",
      priority: "P1",
      confidence: "maybe",
      // Gated (`safetyStatus: 1`) — see the invariant note above.
      isPublic: false,
      safetyStatus: 1,
      ownerId: null,
      sortOrder: 4,
      updatedAt: "2026-06-30T09:00:00.000Z",
    }),
    buildItem({
      id: "group-messaging",
      column: "planned",
      category: "Messaging",
      name: "Group messaging",
      description:
        "Create threads with multiple members, for planning gatherings, projects, or just chatting.",
      votes: 76,
      publicNote: "Small rooms inside the room.",
      targetQuarter: "Q1 2027",
      priority: "P2",
      confidence: "maybe",
      isPublic: true,
      ownerId: null,
      sortOrder: 5,
      updatedAt: "2026-06-20T09:00:00.000Z",
    }),
    buildItem({
      id: "reading-groups",
      column: "planned",
      category: "Content",
      name: "Reading groups",
      description:
        'Structured book and article reading groups with discussion threads and a shared reading schedule. Currently scoped to the "Queer Creatives" community.',
      votes: 54,
      publicNote: "One book, one room, once a month.",
      targetQuarter: "Q1 2027",
      priority: "P3",
      confidence: "hoping",
      isPublic: true,
      ownerId: null,
      sortOrder: 6,
      updatedAt: "2026-06-15T09:00:00.000Z",
    }),
  ];
}

function buildBacklogItems(): AdminRoadmapItemDTO[] {
  return [
    buildItem({
      id: "mental-health-guide",
      column: "backlog",
      category: "Resources",
      name: "Mental health guide",
      description:
        "Crisis and non-crisis mental health resources, from a 3am hotline to ongoing local support.",
      votes: 118,
      requested: true,
      publicNote: "What to do at 3am, and what to do next month.",
      targetQuarter: "Q1 2027",
      priority: "P1",
      confidence: "hoping",
      isPublic: true,
      ownerId: null,
      guide: buildGuide({
        reviewer: "",
        credential: "",
        reVerifyBy: "2027-06-01",
        languages: { en: false, pt: false, br: false },
        trueSteps: [],
      }),
      sortOrder: 0,
      updatedAt: "2026-05-10T09:00:00.000Z",
    }),
    buildItem({
      id: "coming-out-guide",
      column: "backlog",
      category: "Resources",
      name: "Coming out guide",
      description:
        "An open-ended resource: options and considerations for members thinking about coming out, including not doing it.",
      votes: 97,
      requested: true,
      publicNote: "No single script. Including the option of not doing it.",
      targetQuarter: "Q1 2027",
      priority: "P2",
      confidence: "hoping",
      isPublic: true,
      ownerId: null,
      guide: buildGuide({
        reviewer: "",
        credential: "",
        reVerifyBy: null,
        languages: { en: false, pt: false, br: false },
        trueSteps: [],
      }),
      sortOrder: 1,
      updatedAt: "2026-05-05T09:00:00.000Z",
    }),
    buildItem({
      id: "shared-housing-board",
      column: "backlog",
      category: "Community",
      name: "Shared housing board",
      description:
        "A dedicated space for queer-safe housing listings and flatmate search, separate from the main feed.",
      votes: 161,
      requested: true,
      publicNote: null,
      targetQuarter: null,
      priority: "P1",
      confidence: "hoping",
      // Gated (`safetyStatus: 1`) — see the invariant note above.
      isPublic: false,
      safetyStatus: 1,
      spikeFlag: true,
      blockedBy: "Trust & Safety",
      blockedWhy:
        "Scam and predation risk on housing posts. Needs identity gating and a reporting path before it can exist publicly.",
      ownerId: null,
      sortOrder: 2,
      updatedAt: "2026-06-25T09:00:00.000Z",
    }),
    buildItem({
      id: "sliding-scale-membership",
      column: "backlog",
      category: "Economy",
      name: "Sliding-scale membership",
      description:
        "Income-based membership pricing so cost isn't a barrier to joining.",
      votes: 87,
      requested: true,
      publicNote: null,
      targetQuarter: null,
      priority: "P1",
      confidence: "maybe",
      isPublic: false,
      cost: "needs",
      ownerId: OWNER_TIAGO,
      sortOrder: 3,
      updatedAt: "2026-05-20T09:00:00.000Z",
    }),
    buildItem({
      id: "governance-votes",
      column: "backlog",
      category: "Community",
      name: "Community governance votes",
      description: "Structured member votes on platform policy and priorities.",
      votes: 43,
      publicNote: "You get a say in the rules.",
      targetQuarter: "Q2 2027",
      priority: "P3",
      confidence: "hoping",
      isPublic: true,
      ownerId: null,
      sortOrder: 4,
      updatedAt: "2026-04-15T09:00:00.000Z",
    }),
  ];
}

function buildRoadmapItems(): AdminRoadmapItemDTO[] {
  return [
    ...buildShippedItems(),
    ...buildBuildingItemsPartOne(),
    ...buildBuildingItemsPartTwo(),
    ...buildPlannedItems(),
    ...buildBacklogItems(),
  ];
}

// ── Ideas ────────────────────────────────────────────────────────────────────
// Three groups: the already-published "Top ideas" (mirrors the public page's
// own mock — same ids as `marketing/roadmap.data.ts`'s `TOP_IDEAS`), the
// pending member-submitted queue the admin Ideas view triages, and the two
// dismissed "not building this, and why" entries the public page's honesty
// section reads.

function buildPublishedIdea(fields: {
  id: string;
  text: string;
  votes: number;
  sortOrder: number;
  createdAt: string;
}): AdminRoadmapIdeaDTO {
  return {
    id: fields.id,
    text: fields.text,
    status: "published",
    category: "General",
    note: null,
    duplicateOfItemId: null,
    declineReason: null,
    declineNote: null,
    votes: fields.votes,
    liveVotes: 0,
    fromMember: true,
    sortOrder: fields.sortOrder,
    createdAt: fields.createdAt,
  };
}

function buildPendingIdea(fields: {
  id: string;
  text: string;
  category: string;
  votes: number;
  note: string;
  duplicateOfItemId?: string | null;
  sortOrder: number;
  createdAt: string;
}): AdminRoadmapIdeaDTO {
  return {
    id: fields.id,
    text: fields.text,
    status: "pending",
    category: fields.category,
    note: fields.note,
    duplicateOfItemId: fields.duplicateOfItemId ?? null,
    declineReason: null,
    declineNote: null,
    votes: fields.votes,
    liveVotes: 0,
    fromMember: true,
    sortOrder: fields.sortOrder,
    createdAt: fields.createdAt,
  };
}

function buildDismissedIdea(fields: {
  id: string;
  text: string;
  category: string;
  votes: number;
  declineReason: RoadmapDeclineReason;
  declineNote: string;
  sortOrder: number;
  createdAt: string;
}): AdminRoadmapIdeaDTO {
  return {
    id: fields.id,
    text: fields.text,
    status: "dismissed",
    category: fields.category,
    note: null,
    duplicateOfItemId: null,
    declineReason: fields.declineReason,
    declineNote: fields.declineNote,
    votes: fields.votes,
    liveVotes: 0,
    fromMember: true,
    sortOrder: fields.sortOrder,
    createdAt: fields.createdAt,
  };
}

function buildRoadmapIdeas(): AdminRoadmapIdeaDTO[] {
  return [
    // Already-published (same content/ids as the public mock).
    buildPublishedIdea({
      id: "idea-sms",
      text: "Event reminders via SMS",
      votes: 34,
      sortOrder: 0,
      createdAt: "2026-07-01T09:00:00.000Z",
    }),
    buildPublishedIdea({
      id: "idea-dark-mode",
      text: "Dark mode",
      votes: 29,
      sortOrder: 1,
      createdAt: "2026-07-02T09:00:00.000Z",
    }),
    buildPublishedIdea({
      id: "idea-sub-communities",
      text: "Sub-communities within communities",
      votes: 22,
      sortOrder: 2,
      createdAt: "2026-07-03T09:00:00.000Z",
    }),
    buildPublishedIdea({
      id: "idea-recurring-gatherings",
      text: "Recurring gatherings (monthly series)",
      votes: 18,
      sortOrder: 3,
      createdAt: "2026-07-04T09:00:00.000Z",
    }),
    buildPublishedIdea({
      id: "idea-ticket-splitting",
      text: "Shared event costs / ticket splitting",
      votes: 15,
      sortOrder: 4,
      createdAt: "2026-07-05T09:00:00.000Z",
    }),

    // Pending — awaiting a moderator decision in the admin Ideas queue.
    buildPendingIdea({
      id: "idea-barber-list",
      text: "Trans-friendly barber & salon list",
      category: "Resources",
      votes: 64,
      note: 'Submitted by Rui M., "Getting a haircut without being misgendered is harder than it sounds."',
      duplicateOfItemId: "business-directory",
      sortOrder: 5,
      createdAt: "2026-07-25T09:00:00.000Z",
    }),
    buildPendingIdea({
      id: "idea-buddy-system",
      text: "Buddy system for first gatherings",
      category: "Gatherings",
      votes: 51,
      note: 'Submitted by Sofia A., "Walking in alone the first time is the hardest part."',
      sortOrder: 6,
      createdAt: "2026-07-26T09:00:00.000Z",
    }),
    buildPendingIdea({
      id: "idea-asylum-hub",
      text: "Asylum & residency resource hub",
      category: "Resources",
      votes: 47,
      note: 'Submitted anonymously, "For queer migrants navigating AIMA. Nothing accurate exists in English." Flagged as a possible spike.',
      duplicateOfItemId: "legal-rights-guide",
      sortOrder: 7,
      createdAt: "2026-07-27T09:00:00.000Z",
    }),
    buildPendingIdea({
      id: "idea-skill-swap",
      text: "Skill swap between members",
      category: "Economy",
      votes: 38,
      note: 'Submitted by Nuno F., "I will do your brand identity, you do my accounting."',
      sortOrder: 8,
      createdAt: "2026-07-28T09:00:00.000Z",
    }),
    buildPendingIdea({
      id: "idea-sober-tag",
      text: "Sober-friendly gathering tag",
      category: "Gatherings",
      votes: 33,
      note: 'Submitted by Beatriz L., "Not everything has to happen in a bar."',
      sortOrder: 9,
      createdAt: "2026-07-29T09:00:00.000Z",
    }),

    // Dismissed — the public "Not building this, and why" section.
    buildDismissedIdea({
      id: "idea-public-profiles",
      text: "Public member profiles",
      category: "Members",
      declineReason: "scope",
      declineNote:
        "Public profiles turn a vouched room into a directory strangers can scrape. The whole point is that you cannot see in from outside.",
      votes: 29,
      sortOrder: 10,
      createdAt: "2026-06-10T09:00:00.000Z",
    }),
    buildDismissedIdea({
      id: "idea-dating-feature",
      text: "Dating / matching feature",
      category: "Members",
      declineReason: "harm",
      declineNote:
        "Mixing professional networking with dating puts people who are out at work in an impossible position. There are good apps for this; we are not one.",
      votes: 74,
      sortOrder: 11,
      createdAt: "2026-06-12T09:00:00.000Z",
    }),
  ];
}

// ── Team roster ──────────────────────────────────────────────────────────────

function buildRoadmapTeam(): RoadmapTeamMemberDTO[] {
  return [
    {
      id: "team-tiago-costa",
      userId: OWNER_TIAGO,
      name: "Tiago Costa",
      role: "Trust & Safety lead",
      weeklyCapHours: 20,
      paid: true,
      sortOrder: 0,
    },
    {
      id: "team-mariana-reis",
      userId: OWNER_MARIANA,
      name: "Mariana Reis",
      role: "Community",
      weeklyCapHours: 16,
      paid: true,
      sortOrder: 1,
    },
    {
      id: "team-jo-silva",
      userId: OWNER_JO,
      name: "Jo Silva",
      role: "Product & build",
      weeklyCapHours: 24,
      paid: true,
      sortOrder: 2,
    },
    {
      id: "team-ana-duarte",
      userId: OWNER_ANA,
      name: "Ana Duarte",
      role: "Editorial",
      weeklyCapHours: 8,
      paid: false,
      sortOrder: 3,
    },
    {
      id: "team-vera-lopes",
      userId: OWNER_VERA,
      name: "Vera Lopes",
      role: "Volunteer researcher",
      weeklyCapHours: 6,
      paid: false,
      sortOrder: 4,
    },
  ];
}

// ── Audit trail ──────────────────────────────────────────────────────────────

function buildRoadmapAudit(): RoadmapAuditEntryDTO[] {
  return [
    {
      id: "audit-1",
      actorLabel: "Jo Silva",
      action:
        'Moved "Honest employer reviews" to Blocked, waiting on legal opinion',
      createdAt: "2026-08-03T08:12:00.000Z",
    },
    {
      id: "audit-2",
      actorLabel: "Ana Duarte",
      action: 'Marked "Trans health guide" draft step complete',
      createdAt: "2026-08-02T17:40:00.000Z",
    },
    {
      id: "audit-3",
      actorLabel: "Ana Duarte",
      action: 'Target moved Q3 2026 → Q4 2026 on "Trans health guide"',
      createdAt: "2026-07-12T11:05:00.000Z",
    },
    {
      id: "audit-4",
      actorLabel: "Jo Silva",
      action: 'Target moved Q2 2026 → Q3 2026 on "Mobile app beta"',
      createdAt: "2026-05-02T09:31:00.000Z",
    },
  ];
}

// ── Hero stats ───────────────────────────────────────────────────────────────

function buildRoadmapHeroStats(): RoadmapAdminHeroStatDTO[] {
  return [
    {
      label: "Resource guides live",
      value: "6",
      note: "Counts published guides only",
      jade: true,
    },
    {
      label: "Members vouched in",
      value: "8,412",
      note: "Rounded down, updated nightly",
    },
    {
      label: "Shipped this quarter",
      value: "5",
      note: "Auto-counted from the board",
    },
    {
      label: "Member ideas on the board",
      value: "11",
      note: "Ideas promoted to board items",
    },
  ];
}

/** The full demo-mode seed — 24 items, 12 ideas (5 published, 5 pending, 2
 *  dismissed), 5 team members, 4 audit entries, 4 hero stats. */
export function buildRoadmapSeed(): DemoRoadmapState {
  return {
    items: buildRoadmapItems(),
    ideas: buildRoadmapIdeas(),
    team: buildRoadmapTeam(),
    audit: buildRoadmapAudit(),
    heroStats: buildRoadmapHeroStats(),
  };
}
