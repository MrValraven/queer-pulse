import { memberRefToPerson, type MemberRefDTO } from "../../../shared/api/refs";
import type { Community } from "../../homepage/data/types";
import type { CommunityDetail, Person, Tint } from "../communityDetails";
import type {
  LivingCommunity,
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
  CommunityReactionSummary,
  CommunityReplyDTO,
  CommunityType,
  CreateCommunityDto,
  RosterEntryDTO,
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

/** Join-CTA label per access tier, matching the mock grid copy. */
function joinLabelFor(tier: AccessTier): string {
  return tier === "public"
    ? "Join →"
    : tier === "invite"
      ? "Join with invite →"
      : "Request →";
}

/**
 * A coarse "N ago" label from an ISO timestamp — the community feed shows a
 * short relative time next to posts/replies. Falls back to "just now".
 */
export function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const secs = Math.max(0, (Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo` : `${Math.floor(days / 365)}y`;
}

/** Format an ISO date to the "Founded 2025" line the detail hero shows. */
function foundedLabel(iso: string): string {
  const year = iso?.slice(0, 4) ?? "";
  return /^\d{4}$/.test(year) ? `Founded ${year}` : "Founded recently";
}

/** Map a (possibly null) member ref to the community's local `Person` shape.
 *  The shared `memberRefToPerson` carries the same slug/name/initials/tint; the
 *  community `Tint` union is a subset of `AvatarTint` so we narrow with a cast. */
export function refToPerson(ref: MemberRefDTO | null | undefined): Person {
  const p = memberRefToPerson(ref);
  if (!p) return { initials: "··", name: "A member", tint: "plum" };
  return {
    initials: p.initials,
    name: p.name,
    tint: p.tint as Tint,
    slug: p.slug,
  };
}

/** GET /communities card → the discover-grid `Community` view-model. */
export function cardDtoToCommunity(dto: CommunityCardDTO): Community {
  return {
    slug: dto.slug,
    href: `/community/${dto.slug}`,
    type: dto.type,
    typeLabel: TYPE_SHORT[dto.type] ?? "Community",
    name: dto.name,
    description: dto.tagline,
    count:
      dto.accessTier === "private"
        ? "Members only"
        : `${dto.memberCount} members`,
    joinLabel: joinLabelFor(dto.accessTier),
    dashed: dto.accessTier === "private",
    privateBadge: dto.accessTier === "private",
    // Carry the viewer's membership through so the discover grid can show the
    // joined state without a second lookup — the detail page reads the same
    // `myRole` off its DTO. Dropping it here is what made the grid always show
    // "Join" even for communities you're already in.
    myRole: dto.myRole,
  };
}

/** The detail DTO also carries card fields, so reuse the card mapping. */
export function detailDtoToCommunity(dto: CommunityDetailDTO): Community {
  return cardDtoToCommunity(dto);
}

/** GET /communities/:slug → the `CommunityDetail` "info" object. Event-chip,
 *  cadence and topic-thread copy are prototype-only, defaulted gracefully. */
export function detailDtoToDetail(dto: CommunityDetailDTO): CommunityDetail {
  const badge = TYPE_SHORT[dto.type] ?? "Community";
  const organiser = { ...refToPerson(dto.owner), bio: "", role: "Organiser" };
  return {
    badge,
    founded: foundedLabel(dto.createdAt),
    cadence: "Finding its rhythm",
    about: [dto.purpose],
    whoFor: [dto.whoFor],
    tags: [badge],
    organiser,
    nextEvent: {
      dd: "—",
      mm: "soon",
      title: "Next gathering to be announced",
      meta: "Check the events tab",
      spots: "Open to members",
      tba: true,
    },
    topicThread: {
      votes: 0,
      title: `Welcome to ${dto.name}`,
      author: organiser,
      time: "recently",
      replyCount: 0,
      post: dto.purpose,
      replies: [],
    },
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
  };
}

/** The 4-key reaction summary → the local `Reaction` (mine → reacted). */
function summaryToReaction(s: CommunityReactionSummary): Reaction {
  return { key: s.key, count: s.count, reacted: s.mine };
}

function replyDtoToPostReply(dto: CommunityReplyDTO): PostReply {
  return {
    author: refToPerson(dto.author),
    text: dto.text,
    time: relTime(dto.createdAt),
  };
}

/** GET /communities/:slug/posts item → a Pulse `Post`. */
export function postDtoToPost(dto: CommunityPostDTO, slug: string): Post {
  return {
    id: dto.id,
    author: refToPerson(dto.author),
    body: dto.body,
    image: dto.image ?? undefined,
    kind: dto.kind,
    pinned: dto.pinned,
    reactions: dto.reactions.map(summaryToReaction),
    replies: dto.replies.map(replyDtoToPostReply),
    time: relTime(dto.createdAt),
    communitySlug: slug,
  };
}

/** Split a posts page into the pinned / non-pinned lists the Pulse tab reads. */
export function postsToPulse(
  posts: CommunityPostDTO[],
  slug: string,
): { pinned: Post[]; pulse: Post[] } {
  const mapped = posts.map((p) => postDtoToPost(p, slug));
  return {
    pinned: mapped.filter((p) => p.pinned),
    pulse: mapped.filter((p) => !p.pinned),
  };
}

/** GET /communities/:slug/roster entry → a `RosterMember`. */
export function rosterEntryToRosterMember(dto: RosterEntryDTO): RosterMember {
  const p = refToPerson(dto.member);
  return { ...p, role: dto.role };
}

/** A pending join request → the mod-tools `ModRequest`. */
export function joinRequestToModRequest(
  dto: CommunityJoinRequestDTO,
): ModRequest {
  return {
    id: dto.id,
    person: refToPerson(dto.member),
    note: dto.note ?? undefined,
    time: relTime(dto.createdAt),
  };
}

/** Start-a-Community wizard draft → the POST /communities payload.
 *  Co-stewards (non-owner) are sent as `stewards` (seeded as mods); the invite
 *  seeds are forwarded as `invites` (accepted but not persisted server-side). */
export function draftToCreateDto(draft: CommunityDraft): CreateCommunityDto {
  return {
    name: draft.name.trim(),
    purpose: draft.purpose.trim(),
    type: (draft.type || "social") as CommunityType,
    whoFor: draft.whoFor.trim(),
    accessTier: (draft.accessTier || "public") as AccessTier,
    rosterVisible: draft.rosterVisible,
    features: draft.features,
    rules: draft.rules,
    tagline: draft.tagline.trim(),
    handle: draft.handle.trim(),
    stewards: draft.stewards
      .filter((s) => s.role !== "owner" && s.key !== "owner")
      .map((s) => s.key),
    invites: draft.invites,
  };
}
