import { memberRefToPerson, type MemberRefDTO } from "../../../shared/api/refs";
import type { Formatters } from "../../../shared/i18n/format";
import { activeLocale } from "../../../shared/i18n/locale";
import type { TFunction } from "../../../shared/i18n/types";
import type { Community } from "../../homepage/data/types";
import type {
  CommunityDetail,
  Person,
  Reply,
  Thread,
  Tint,
} from "../communityDetails";
import type {
  CommunityEvent,
  LivingCommunity,
  ModReport,
  ModRequest,
  Post,
  PostReply,
  Reaction,
  RosterMember,
} from "../community.model";
import type { CommunityDraft } from "../startCommunity/startCommunity.data";
import type {
  AccessTier,
  CommunityCardDTO,
  CommunityDetailDTO,
  CommunityJoinRequestDTO,
  CommunityPostDTO,
  CommunityPulseEventDTO,
  CommunityPulseOpportunityDTO,
  CommunityPulseThreadDTO,
  CommunityReactionSummary,
  CommunityReplyDTO,
  CommunityReportDTO,
  CommunityType,
  CreateCommunityDto,
  RosterEntryDTO,
  UpdateCommunityDto,
} from "./communities.api";

// Map each backend DTO onto the EXISTING mock view-model types the pages
// already render. Prototype-only fields the API can't supply (day/month event
// chips, sister-community graphs, moments, resources…) are defaulted so nothing
// renders blank — the same graceful-default approach as `profileToMember`.

/** Short grid label per community type (the discover cards use these). */
const TYPE_SHORT: Record<CommunityType, string> = {
  social: "Social",
  arts: "Arts",
  activism: "Activism",
  support: "Support",
  sports: "Sports",
  professional: "Professional",
};

/** The short grid label a card shows for a community type. Exported so the
 *  edit modal's live card preview labels the letterhead exactly the way the
 *  saved card will, instead of re-deriving its own wording. */
export function shortTypeLabel(type: CommunityType): string {
  return TYPE_SHORT[type] ?? "Community";
}

/** Join-CTA label per access tier, matching the mock grid copy. */
function joinLabelFor(tier: AccessTier, translate: TFunction): string {
  return tier === "public"
    ? translate("communities:card.join.public")
    : tier === "invite"
      ? translate("communities:card.join.invite")
      : translate("communities:card.join.request");
}

/**
 * Relative times are NOT resolved here. An adapter runs once, outside a render,
 * with no locale bound to it — a hand-rolled `"4mo"` token baked in at map time
 * is English forever and goes stale as the page stays open. So every mapper
 * below carries the raw ISO `createdAt` through onto the view-model and the
 * render layer turns it into words via `useCommunityTime()` (which wraps the
 * shared `relativeAgo` + `Intl.RelativeTimeFormat`). See `communityTime.ts`.
 */

/** Format an ISO date to the "Founded March 2025" line the detail hero shows.
 *  Month + year, written the way the active language writes it (EN "March
 *  2025", PT "março de 2025"). It reads `activeLocale()` because an adapter
 *  runs outside React and cannot reach the provider's language via a hook. */
function foundedLabel(iso: string, translate: TFunction): string {
  const timestamp = iso ? Date.parse(iso) : Number.NaN;
  if (Number.isNaN(timestamp)) {
    return translate("communities:detail.foundedRecently");
  }
  const date = new Intl.DateTimeFormat(activeLocale(), {
    month: "long",
    year: "numeric",
  }).format(timestamp);
  return translate("communities:detail.founded", { date });
}

/** Map a (possibly null) member ref to the community's local `Person` shape.
 *  The shared `memberRefToPerson` carries the same slug/name/initials/tint; the
 *  community `Tint` union is a subset of `AvatarTint` so we narrow with a cast. */
export function refToPerson(
  ref: MemberRefDTO | null | undefined,
  translate: TFunction,
): Person {
  const p = memberRefToPerson(ref);
  if (!p) {
    return {
      initials: "?",
      name: translate("communities:common.someMember"),
      tint: "plum",
    };
  }
  return {
    initials: p.initials,
    name: p.name,
    tint: p.tint as Tint,
    slug: p.slug,
    avatarUrl: p.avatarUrl,
  };
}

/** GET /communities card → the discover-grid `Community` view-model. */
export function cardDtoToCommunity(
  dto: CommunityCardDTO,
  translate: TFunction,
): Community {
  return {
    slug: dto.slug,
    href: `/community/${dto.slug}`,
    type: dto.type,
    typeLabel: shortTypeLabel(dto.type),
    name: dto.name,
    description: dto.tagline,
    count:
      dto.accessTier === "private"
        ? translate("communities:common.count.membersOnly")
        : translate("communities:common.count.members", {
            count: dto.memberCount,
          }),
    joinLabel: joinLabelFor(dto.accessTier, translate),
    dashed: dto.accessTier === "private",
    privateBadge: dto.accessTier === "private",
    // Carry the raw tier through so consumers can filter on join policy (e.g.
    // onboarding only suggests instantly-joinable "public" communities) without
    // re-deriving it from the presentational flags above.
    accessTier: dto.accessTier,
    // Carry the viewer's membership through so the discover grid can show the
    // joined state without a second lookup — the detail page reads the same
    // `myRole` off its DTO. Dropping it here is what made the grid always show
    // "Join" even for communities you're already in.
    myRole: dto.myRole,
    // Carry the raw weekly-activity count through so the discover grid's
    // "Busy this week" toggle / "Most active" sort can read it client-side
    // (see the `Community.activeThisWeek` doc comment for why).
    activeThisWeek: dto.activeThisWeek,
    coverImageUrl: dto.coverImageUrl,
    // Curated tag ids for the card pills — absent/empty when none picked yet.
    tags: dto.tags,
  };
}

/** The detail DTO also carries card fields, so reuse the card mapping. */
export function detailDtoToCommunity(
  dto: CommunityDetailDTO,
  translate: TFunction,
): Community {
  return cardDtoToCommunity(dto, translate);
}

/** GET /communities/:slug → the `CommunityDetail` "info" object. Event-chip,
 *  cadence and topic-thread copy are prototype-only, defaulted gracefully. */
export function detailDtoToDetail(
  dto: CommunityDetailDTO,
  translate: TFunction,
): CommunityDetail {
  const badge = TYPE_SHORT[dto.type] ?? "Community";
  const organiser = {
    ...refToPerson(dto.owner, translate),
    bio: "",
    role: translate("communities:detail.sidebar.organiser"),
  };
  return {
    badge,
    founded: foundedLabel(dto.createdAt, translate),
    cadence: translate("communities:detail.cadenceDefault"),
    about: [dto.purpose],
    whoFor: [dto.whoFor],
    tags: [badge],
    organiser,
    nextEvent: {
      dd: "-",
      mm: translate("communities:detail.nextEvent.soonChip"),
      title: translate("communities:detail.nextEvent.tbaTitle"),
      meta: translate("communities:detail.nextEvent.checkEventsTab"),
      spots: translate("communities:detail.nextEvent.openToMembers"),
      tba: true,
    },
    topicThread: {
      votes: 0,
      title: translate("communities:detail.topicThread.welcomeTitle", {
        name: dto.name,
      }),
      // No timestamp exists for this synthetic thread, so it carries the
      // "recently" idiom as a translated phrase rather than an ISO date.
      time: translate("communities:detail.topicThread.recently"),
      // The welcome thread is written by the space itself, not a member, so
      // it carries the community's own byline rather than a person.
      author: {
        initials: dto.name.slice(0, 2).toUpperCase(),
        name: dto.name,
        tint: "plum",
      },
      replyCount: 0,
      post: dto.purpose,
      replies: [],
    },
    frozen: dto.frozen ?? false,
  };
}

/** GET /communities/:slug → the enriched `LivingCommunity`. Roster and posts
 *  arrive from their own endpoints (filled in by the detail page); events,
 *  resources, moments and reports have no endpoint yet → empty defaults. */
export function detailDtoToLiving(dto: CommunityDetailDTO): LivingCommunity {
  return {
    slug: dto.slug,
    accessTier: dto.accessTier,
    rules: dto.rules ?? [],
    resources: [],
    events: [],
    roster: [],
    pinned: [],
    pulse: [],
    moments: [],
    stats: {
      members: dto.memberCount,
      activeThisWeek: dto.activeThisWeek,
      postsThisWeek: dto.postsThisWeek,
    },
    joinRequests: [],
    reports: [],
    frozen: dto.frozen ?? false,
    features: dto.features,
    rosterVisible: dto.rosterVisible,
  };
}

/** The 4-key reaction summary → the local `Reaction` (mine → reacted). */
function summaryToReaction(s: CommunityReactionSummary): Reaction {
  return { key: s.key, count: s.count, reacted: s.mine };
}

function replyDtoToPostReply(
  dto: CommunityReplyDTO,
  translate: TFunction,
): PostReply {
  return {
    id: dto.id,
    author: refToPerson(dto.author, translate),
    text: dto.text,
    createdAt: dto.createdAt,
    editedAt: dto.editedAt,
    deleted: dto.deleted,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canRestore: dto.canRestore,
    canViewHistory: dto.canViewHistory,
  };
}

/** GET /communities/:slug/posts item → a Pulse `Post`. */
export function postDtoToPost(
  dto: CommunityPostDTO,
  slug: string,
  translate: TFunction,
): Post {
  return {
    id: dto.id,
    author: refToPerson(dto.author, translate),
    body: dto.body,
    image: dto.image ?? undefined,
    kind: dto.kind,
    pinned: dto.pinned,
    reactions: dto.reactions.map(summaryToReaction),
    replies: dto.replies.map((reply) => replyDtoToPostReply(reply, translate)),
    replyCount: dto.replyCount,
    createdAt: dto.createdAt,
    communitySlug: slug,
    editedAt: dto.editedAt,
    deleted: dto.deleted,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canRestore: dto.canRestore,
    canViewHistory: dto.canViewHistory,
  };
}

/** Split a posts page into the pinned / non-pinned lists the Pulse tab reads. */
export function postsToPulse(
  posts: CommunityPostDTO[],
  slug: string,
  translate: TFunction,
): { pinned: Post[]; pulse: Post[] } {
  const mapped = posts.map((post) => postDtoToPost(post, slug, translate));
  return {
    pinned: mapped.filter((p) => p.pinned),
    pulse: mapped.filter((p) => !p.pinned),
  };
}

/** GET /communities/:slug/roster entry → a `RosterMember`. */
export function rosterEntryToRosterMember(
  dto: RosterEntryDTO,
  translate: TFunction,
): RosterMember {
  return { ...refToPerson(dto.member, translate), role: dto.role };
}

/** A pending join request → the mod-tools `ModRequest`. */
export function joinRequestToModRequest(
  dto: CommunityJoinRequestDTO,
  translate: TFunction,
): ModRequest {
  return {
    id: dto.id,
    person: refToPerson(dto.member, translate),
    note: dto.note ?? undefined,
    createdAt: dto.createdAt,
  };
}

/** `GET /communities/:slug/reports` item → the mod-tools `ModReport`. Leaner
 *  than the demo mock (no author/reporter/excerpt — the backend DTO doesn't
 *  carry them): `ModReportedPosts` resolves `reasonCode` to a label at render
 *  time via `REASON_LABEL_KEYS` and renders a plainer row for these. */
export function communityReportToModReport(dto: CommunityReportDTO): ModReport {
  return {
    id: dto.id,
    createdAt: dto.createdAt,
    reasonCode: dto.reasonCode,
    subjectType: dto.subjectType,
    subjectId: dto.subjectId,
  };
}

/** The post body's first line, trimmed, as the discussion thread's heading.
 *  Community posts have no title (sub-project #2 decision: derive from body). */
function headingFromBody(body: string): string {
  const firstLine =
    body
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? body.trim();
  return firstLine.length > 120 ? `${firstLine.slice(0, 119)}…` : firstLine;
}

function postReplyToThreadReply(reply: PostReply): Reply {
  return {
    id: reply.id,
    createdAt: reply.createdAt,
    initials: reply.author.initials,
    name: reply.author.name,
    tint: reply.author.tint,
    authorSlug: reply.author.slug,
    text: reply.text,
    editedAt: reply.editedAt,
    deleted: reply.deleted,
    canEdit: reply.canEdit,
    canDelete: reply.canDelete,
    canRestore: reply.canRestore,
    canViewHistory: reply.canViewHistory,
  };
}

/** GET .../posts/:id/replies item ("load more replies") → the Thread widget's
 *  `Reply` view-model — the same two-step DTO→PostReply→Reply mapping
 *  `postToThread` already applies to the embedded preview, so a loaded-more
 *  reply renders identically to one that arrived in the post's own payload. */
export function replyDtoToThreadReply(
  dto: CommunityReplyDTO,
  translate: TFunction,
): Reply {
  return postReplyToThreadReply(replyDtoToPostReply(dto, translate));
}

/** A community `Post` → the Discussion widget's `Thread` view-model. Heading is
 *  the first body line; `votes` is the Heart-reaction count (the discussion
 *  upvote arrow maps to a Heart toggle). */
export function postToThread(post: Post): Thread {
  const heart = post.reactions.find((reaction) => reaction.key === "heart");
  return {
    id: post.id,
    votes: heart?.count ?? 0,
    voted: heart?.reacted ?? false,
    pinned: post.pinned ?? false,
    createdAt: post.createdAt,
    title: headingFromBody(post.body),
    author: post.author,
    time: post.time,
    replyCount: post.replyCount ?? post.replies.length,
    post: post.body,
    replies: post.replies.map(postReplyToThreadReply),
    editedAt: post.editedAt,
    deleted: post.deleted,
    canEdit: post.canEdit,
    canDelete: post.canDelete,
    canRestore: post.canRestore,
    canViewHistory: post.canViewHistory,
  };
}

/** Start-a-Community wizard draft → the POST /communities payload.
 *  Co-stewards (non-owner) are sent as `stewards` (seeded as mods); the invite
 *  seeds are forwarded as `invites` (accepted but not persisted server-side). */
export function draftToCreateDto(draft: CommunityDraft): CreateCommunityDto {
  return {
    name: draft.name.trim(),
    purpose: draft.purpose.trim(),
    type: draft.type || "social",
    whoFor: draft.whoFor.trim(),
    accessTier: draft.accessTier || "public",
    rosterVisible: draft.rosterVisible,
    features: draft.features,
    rules: draft.rules,
    tagline: draft.tagline.trim(),
    coverImageUrl: draft.coverImageUrl || null,
    handle: draft.handle.trim(),
    stewards: draft.stewards
      .filter((s) => s.role !== "owner" && s.key !== "owner")
      .map((s) => s.key),
    invites: draft.invites,
  };
}

/** The exact set of fields an owner/mod may edit (backend whitelist). One clean
 *  interface for the edit modal to seed from, in both demo and live mode. */
export interface EditableCommunityFields {
  name: string;
  tagline: string;
  type: CommunityType;
  whoFor: string;
  purpose: string;
  accessTier: AccessTier;
  rosterVisible: boolean;
  features: string[];
  rules: string[];
  /** Resolved cover URL (or "" for none) — round-trips through the edit modal's
   *  `ImageUploadField`; the backend rewrites the `/files/*` URL back to a key. */
  coverImageUrl: string;
  /** Curated tag ids (⊆ `COMMUNITY_TAGS`), capped at `MAX_COMMUNITY_TAGS`. */
  tags: string[];
}

/** Live seed: the authoritative current values straight off the detail DTO. */
export function dtoToEditable(
  dto: CommunityDetailDTO,
): EditableCommunityFields {
  return {
    name: dto.name,
    tagline: dto.tagline,
    type: dto.type,
    whoFor: dto.whoFor,
    purpose: dto.purpose,
    accessTier: dto.accessTier,
    rosterVisible: dto.rosterVisible,
    features: dto.features,
    rules: dto.rules,
    coverImageUrl: dto.coverImageUrl ?? "",
    tags: dto.tags ?? [],
  };
}

/** Merge a demo edit patch onto the discover-grid `Community` view-model.
 *  `count` is left as-is: the raw member number isn't recoverable here, so an
 *  access-tier change only re-derives the private/join affordances. */
export function applyCommunityOverride(
  community: Community,
  patch: UpdateCommunityDto,
  translate: TFunction,
): Community {
  const next: Community = { ...community };
  if (patch.name !== undefined) next.name = patch.name;
  if (patch.tagline !== undefined) next.description = patch.tagline;
  if (patch.type !== undefined) {
    next.type = patch.type;
    next.typeLabel = TYPE_SHORT[patch.type] ?? community.typeLabel;
  }
  if (patch.accessTier !== undefined) {
    next.accessTier = patch.accessTier;
    next.privateBadge = patch.accessTier === "private";
    next.dashed = patch.accessTier === "private";
    next.joinLabel = joinLabelFor(patch.accessTier, translate);
  }
  if (patch.tags !== undefined) next.tags = patch.tags;
  return next;
}

/** Merge a demo edit patch onto the `CommunityDetail` "info" view-model. */
export function applyDetailOverride(
  detail: CommunityDetail,
  patch: UpdateCommunityDto,
): CommunityDetail {
  const badge =
    patch.type !== undefined
      ? (TYPE_SHORT[patch.type] ?? detail.badge)
      : detail.badge;
  return {
    ...detail,
    badge,
    tags: patch.type !== undefined ? [badge] : detail.tags,
    about: patch.purpose !== undefined ? [patch.purpose] : detail.about,
    whoFor: patch.whoFor !== undefined ? [patch.whoFor] : detail.whoFor,
  };
}

/** Merge a demo edit patch onto the enriched `LivingCommunity` (rules, tier,
 *  and the tab-visibility toggles — so a demo owner flipping "events"/"roster"
 *  or "show roster to members" off in `EditCommunityModal` sees the hub tabs
 *  react the same way a live edit does). */
export function applyLivingOverride(
  living: LivingCommunity | undefined,
  patch: UpdateCommunityDto,
): LivingCommunity | undefined {
  if (!living) return living;
  return {
    ...living,
    rules: patch.rules !== undefined ? patch.rules : living.rules,
    accessTier:
      patch.accessTier !== undefined ? patch.accessTier : living.accessTier,
    features: patch.features !== undefined ? patch.features : living.features,
    rosterVisible:
      patch.rosterVisible !== undefined
        ? patch.rosterVisible
        : living.rosterVisible,
  };
}

/** Seed the shared wizard-draft shape from the current editable values. The
 *  steward/invite/handle/consent/tint fields are inert here — the edit modal
 *  never shows them and `draftToUpdateDto` never sends them. */
export function editableToDraft(
  editable: EditableCommunityFields,
): CommunityDraft {
  return {
    name: editable.name,
    purpose: editable.purpose,
    type: editable.type,
    whoFor: editable.whoFor,
    accessTier: editable.accessTier,
    rosterVisible: editable.rosterVisible,
    stewards: [],
    features: editable.features,
    rules: editable.rules,
    tint: "coral",
    coverImageUrl: editable.coverImageUrl,
    tagline: editable.tagline,
    invites: [],
    handle: "",
    consent: true,
    tags: editable.tags,
  };
}

/** A recent discussion thread filed to this community — the sidebar's
 *  "Recent discussions" card (`GET /communities/:slug/pulse`). */
export interface CommunityPulseThread {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  replyCount: number;
}

/** An open volunteer opportunity filed to this community — the sidebar's
 *  "Open opportunities" card (`GET /communities/:slug/pulse`). */
export interface CommunityPulseOpportunity {
  slug: string;
  role: string;
  org: string;
}

/** `GET /communities/:slug/pulse`'s `upcomingEvents` lane → an Events-tab row.
 *  `fmt` drives localized day/month/weekday labels (no English-only hardcoding
 *  here — this is live data, unlike the demo mock's own English-only registry,
 *  see `nextGathering.ts`); `goingLabel` is the already-translated spots string
 *  (reuses the gatherings feature's own `spots.going`/`spots.openToAll` copy —
 *  see `useCommunityPulse`). */
export function pulseEventToCommunityEvent(
  dto: CommunityPulseEventDTO,
  fmt: Formatters,
  goingLabel: string,
  onlineLabel: string,
): CommunityEvent {
  const start = new Date(dto.startAt);
  const venue = dto.venue ?? (dto.isOnline ? onlineLabel : null);
  const weekday = fmt.date(start, { weekday: "long" });
  return {
    id: dto.slug,
    dd: fmt.date(start, { day: "numeric" }),
    mm: fmt.date(start, { month: "short" }),
    title: dto.title,
    meta: venue ? `${weekday} · ${venue}` : weekday,
    spots: goingLabel,
    slug: dto.slug,
  };
}

/** `recentThreads` lane → the sidebar's compact thread row. */
export function pulseThreadToCard(
  dto: CommunityPulseThreadDTO,
): CommunityPulseThread {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    authorName: dto.author.displayName,
    replyCount: dto.replyCount,
  };
}

/** `openOpportunities` lane → the sidebar's compact opportunity row. */
export function pulseOpportunityToCard(
  dto: CommunityPulseOpportunityDTO,
): CommunityPulseOpportunity {
  return { slug: dto.slug, role: dto.role, org: dto.org };
}

/** Edit-modal draft → the PATCH /communities/:slug payload. Editable fields
 *  only — no handle/slug (frozen), no stewards/invites. */
export function draftToUpdateDto(draft: CommunityDraft): UpdateCommunityDto {
  return {
    name: draft.name.trim(),
    purpose: draft.purpose.trim(),
    type: draft.type || "social",
    whoFor: draft.whoFor.trim(),
    accessTier: draft.accessTier || "public",
    rosterVisible: draft.rosterVisible,
    features: draft.features,
    rules: draft.rules,
    tagline: draft.tagline.trim(),
    // "" clears the cover; a resolved URL round-trips (the backend's ownership
    // interceptor rewrites our own `/files/*` URL back to the stored key).
    coverImageUrl: draft.coverImageUrl || null,
    tags: draft.tags,
  };
}
