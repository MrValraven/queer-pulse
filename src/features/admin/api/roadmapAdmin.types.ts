// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `roadmap` domain's admin surface returns/accepts
// (`/admin/roadmap/*`). This is the admin-only read+write counterpart to the
// public `marketing/api/roadmap.api.ts` (`GET /roadmap`) — the admin tools
// edit backlog/planned/building/shipped items, ideas, the team roster, the
// audit trail, and the hero-stat chips that page reads. Field names/shapes
// mirror the Appendix — Frozen Contract in
// `docs/superpowers/plans/2026-08-04-admin-roadmap-redesign.md` and the
// backend's `roadmap-admin-response.ts`/`entities/roadmap-item.entity.ts`/
// `entities/roadmap-idea.entity.ts` verbatim. Split out of `roadmapAdmin.api.ts`
// (which holds the fetch functions) purely for file size — every export here
// is re-exported from that file too, so callers can import from either.

export type RoadmapColumn = "backlog" | "planned" | "building" | "shipped";
export type RoadmapPriority = "P0" | "P1" | "P2" | "P3";
export type RoadmapConfidence = "likely" | "maybe" | "hoping";
export type RoadmapPaidKind = "paid" | "volunteer";
export type RoadmapCost = "none" | "small" | "funded" | "needs";
/** 0 = none, 1 = required, 2 = cleared. Gates `isPublic` while `1`. */
export type RoadmapSafetyStatus = 0 | 1 | 2;
export type RoadmapDeclineReason =
  | "scope"
  | "unsafe"
  | "capacity"
  | "exists"
  | "harm";
export type RoadmapGuideStep =
  | "research"
  | "draft"
  | "lived"
  | "expert"
  | "translate"
  | "publish";
export type RoadmapIdeaStatus = "pending" | "published" | "dismissed";
export type RoadmapBulkAction = "move" | "show" | "hide" | "archive" | "delete";

/** One entry in an item's `slips` — a target-date move with a reason. */
export interface RoadmapSlipEntryDTO {
  from: string;
  to: string;
  reason: string;
  movedByName: string;
  movedAt: string;
}

/** `RoadmapItem.guide` — present only for resource/how-to items. */
export interface RoadmapGuideDTO {
  steps: Record<RoadmapGuideStep, boolean>;
  reviewer: string;
  credential: string;
  reVerifyBy: string | null;
  languages: { en: boolean; pt: boolean; br: boolean };
}

/** One entry in an item's `voteBreakdown.top` — the communities its voters
 *  come from, most-represented first. */
export interface AdminVoteBreakdownEntryDTO {
  communityName: string;
  count: number;
}

export interface AdminVoteBreakdownDTO {
  top: AdminVoteBreakdownEntryDTO[];
  // Voters not attributable to one of the `top` communities (no community,
  // or a long tail collapsed into one bucket).
  other: number;
}

/** One row in an item's drawer Comments section. */
export interface AdminItemCommentDTO {
  id: string;
  authorLabel: string;
  body: string;
  hidden: boolean;
  createdAt: string;
}

export interface AdminRoadmapItemDTO {
  id: string;
  column: RoadmapColumn;
  category: string;
  name: string;
  // Internal notes, not shown to members.
  description: string;
  // The warm one-liner shown on the public roadmap.
  publicNote: string | null;
  date: string | null;
  stage: string | null;
  eta: string | null;
  targetQuarter: string | null;
  progress: number | null;
  priority: RoadmapPriority;
  confidence: RoadmapConfidence;
  committed: boolean;
  isPublic: boolean;
  requested: boolean;
  // Planned only — flags the "Hot" badge.
  hot: boolean;
  notified: boolean;
  spikeFlag: boolean;
  safetyStatus: RoadmapSafetyStatus;
  blockedBy: string | null;
  blockedWhy: string | null;
  paidKind: RoadmapPaidKind;
  weeklyHours: number;
  cost: RoadmapCost;
  ownerId: string | null;
  // Resolved server-side from `users` in one batch query per `GET /admin` call.
  ownerName: string | null;
  slips: RoadmapSlipEntryDTO[];
  guide: RoadmapGuideDTO | null;
  // Outgoing "depends on" edges — other item ids.
  deps: string[];
  votes: number;
  liveVotes: number;
  voteBreakdown: AdminVoteBreakdownDTO;
  comments: AdminItemCommentDTO[];
  // Archive view = `archived: true`; every other view excludes archived
  // items. Toggled via the dedicated `PATCH .../archive` endpoint, not a
  // plain `updateItem` — see `RoadmapItemWriteBody`'s doc.
  archived: boolean;
  sortOrder: number;
  // `RoadmapItem.updatedAt` — the drawer/board label this "touched".
  updatedAt: string;
}

export interface AdminRoadmapIdeaDTO {
  id: string;
  text: string;
  status: RoadmapIdeaStatus;
  category: string;
  note: string | null;
  duplicateOfItemId: string | null;
  declineReason: RoadmapDeclineReason | null;
  declineNote: string | null;
  votes: number;
  liveVotes: number;
  fromMember: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface RoadmapTeamMemberDTO {
  id: string;
  userId: string;
  // Resolved from `users` in one batch query, same as `ownerName` above —
  // never a raw relation load per row.
  name: string;
  role: string;
  weeklyCapHours: number;
  paid: boolean;
  sortOrder: number;
}

export interface RoadmapAuditEntryDTO {
  id: string;
  actorLabel: string;
  action: string;
  createdAt: string;
}

export interface RoadmapAdminHeroStatDTO {
  label: string;
  value?: string;
  note?: string;
  jade?: boolean;
}

export interface RoadmapAdminResponseDTO {
  items: AdminRoadmapItemDTO[];
  ideas: AdminRoadmapIdeaDTO[];
  team: RoadmapTeamMemberDTO[];
  audit: RoadmapAuditEntryDTO[];
  heroStats: RoadmapAdminHeroStatDTO[];
}

// ── Write bodies ────────────────────────────────────────────────────────────

/** `POST /admin/items` body — every `AdminRoadmapItemDTO` field except the
 *  ones the server computes (`id`, `liveVotes`, `ownerName`,
 *  `voteBreakdown`, `comments`, `updatedAt`) and the ones with their own
 *  endpoints (`deps` via `PATCH .../deps`, `slips` — appended automatically
 *  server-side from `slipReason` on update, never written directly;
 *  `archived` via `PATCH .../archive`, never set on create). */
export type RoadmapItemWriteBody = Omit<
  AdminRoadmapItemDTO,
  | "id"
  | "liveVotes"
  | "ownerName"
  | "voteBreakdown"
  | "comments"
  | "updatedAt"
  | "deps"
  | "slips"
  | "archived"
> & { slipReason?: string };

/** `PATCH /admin/items/:id` body. `slipReason` is required server-side when
 *  `targetQuarter` changes on an item whose `column !== 'shipped'`. */
export type RoadmapItemUpdateBody = Partial<RoadmapItemWriteBody> & {
  slipReason?: string;
};

/** `PATCH /admin/items/:id/deps` body — one dependency edge added and/or
 *  removed per call. */
export interface RoadmapUpdateDepsBody {
  add?: string;
  remove?: string;
}

/** `PATCH /admin/items/bulk` body — one action over many items at once. */
export interface RoadmapBulkItemsBody {
  ids: string[];
  action: RoadmapBulkAction;
  // Required when `action === 'move'`; ignored otherwise.
  column?: RoadmapColumn;
}

/** `PATCH /admin/ideas/:id` body. Promoting sets `status: 'published'`;
 *  dismissing sets `status: 'dismissed'`; reopening a declined idea is also a
 *  plain `status: 'published'` patch (the server clears `declineReason`/
 *  `declineNote` itself). */
export interface RoadmapIdeaUpdateBody {
  text?: string;
  status?: RoadmapIdeaStatus;
  category?: string;
  note?: string | null;
  duplicateOfItemId?: string | null;
  sortOrder?: number;
  votes?: number;
}

/** `POST /admin/team` body — adds a roster row to the Capacity view.
 *  `userId` is unique: a member has at most one roster row. */
export interface RoadmapTeamMemberWriteBody {
  userId: string;
  role: string;
  weeklyCapHours?: number;
  paid?: boolean;
  sortOrder?: number;
}

/** `PATCH /admin/team/:id` body — every creation field independently
 *  patchable (`userId` included: reassigning a roster row is rare but not
 *  forbidden). */
export type RoadmapTeamMemberUpdateBody = Partial<RoadmapTeamMemberWriteBody>;

/** `GET /admin/audit` query — cursor-paginated by `createdAt` (`before` is a
 *  timestamp cursor, not an offset). */
export interface RoadmapAuditQueryParams {
  limit?: number;
  before?: string;
}
