import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";
import {
  getMember,
  memberAvatar,
  memberName,
} from "../../members/data/members";
import { isCoOwnerRole, isOwnerRole, isStaffRole } from "../communityStaffRole";
import { getLiving } from "../livingCommunities.data";
import type { CommunityRole } from "../membership.types";
import { findDemoSpace } from "../spaces.data";
import type {
  CommunityBadgeAdminDTO,
  CommunityBadgeAdminResponse,
  CommunityBadgesResponse,
  CommunityFlairDTO,
  CommunityFlairResponse,
  CommunityGiftAllowanceDTO,
  CommunityMemberGiftsResponse,
  CommunitySentGiftDTO,
  CommunityShelfGiftDTO,
  CreateCommunityBadgeBody,
  DeleteCommunityBadgeResult,
  SendCommunityGiftBody,
  UpdateCommunityBadgeBody,
} from "./api/communityBadges.api";
import {
  canManageCommunityBadges,
  canSendCommunityGifts,
} from "./communityBadgeAccess";
import {
  COMMUNITY_BADGE_LIMIT,
  COMMUNITY_BADGE_STARTERS,
  COMMUNITY_GIFT_WEEKLY_LIMIT,
  COMMUNITY_GIFT_WINDOW_DAYS,
  type CommunityBadgeRuleType,
  type CommunityBadgeStarterKey,
} from "./communityBadges.catalog";
import {
  DEMO_BADGE_AWARDED_DAYS_AGO,
  DEMO_BADGE_EXTRA_BADGES,
  DEMO_BADGE_PROGRESS,
  DEMO_GIFT_SEED,
  DEMO_WORN_BADGES,
  type DemoBadgeProgress,
} from "./communityBadgesDemo.data";
import {
  assertBadgeNameFree,
  checkBadgeCreate,
  checkBadgeUpdate,
  checkFlairBadgeId,
  checkGiftHidden,
  checkGiftSend,
} from "./communityBadgesDemoRules";
import { communityBadgeRefusal } from "./communityBadgeErrors";

/**
 * The demo community badges: one lazily seeded, module-scoped, in-memory
 * record read and written by the badge hooks in demo (contract section 10),
 * shaped like `leadsDemoStore`. It answers the server's shapes, order and
 * reason codes (contract section 4). The seed lives in
 * `communityBadgesDemo.data`, the field checks in `communityBadgesDemoRules`.
 * Each community seeds on its first read; spaces never seed.
 */

export interface CommunityBadgesDemoViewer {
  viewerSlug: string;
  role: CommunityRole | null;
  isMember: boolean;
  isSpace: boolean;
}

interface StoredBadge {
  id: string;
  starterKey: CommunityBadgeStarterKey | null;
  name: string;
  iconKey: string;
  tint: string;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

interface StoredCommunity {
  badges: StoredBadge[];
  /** Badge id to member slug to award time. */
  awards: Map<string, Map<string, number>>;
  /** Member slug to the worn badge id. */
  wornBySlug: Map<string, string>;
}

interface StoredGift {
  id: string;
  communitySlug: string;
  senderSlug: string | null;
  recipientSlug: string;
  giftKey: string;
  note: string | null;
  sentAt: number;
  hiddenAt: number | null;
  removedAt: number | null;
}

interface DemoBadgesState {
  communities: Map<string, StoredCommunity>;
  gifts: StoredGift[];
  nextGiftNumber: number;
  nextBadgeNumber: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = COMMUNITY_GIFT_WINDOW_DAYS * DAY_MS;
const SHELF_PAGE_SIZE = 20;
const MEMBER_MARKS_LIMIT = 50;
/** How long before the first read the seeded badges were created. */
const SEED_CREATED_DAYS_AGO = 90;
const ZERO_PROGRESS: DemoBadgeProgress = {
  tenure_days: 0,
  events_checked_in: 0,
  volunteer_hours: 0,
  posts_and_replies: 0,
};

let badgesState: DemoBadgesState | null = null;
let storeVersion = 0;
const listeners = new Set<() => void>();

function freshState(): DemoBadgesState {
  return {
    communities: new Map(),
    gifts: [],
    nextGiftNumber: 1,
    nextBadgeNumber: 1,
  };
}

function current(): DemoBadgesState {
  if (badgesState === null) badgesState = freshState();
  return badgesState;
}

/** Every write ends here: the version moves and subscribers rerender. */
function commit(): void {
  storeVersion += 1;
  for (const listener of listeners) listener();
}

export function subscribeCommunityBadgesDemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCommunityBadgesDemoVersion(): number {
  return storeVersion;
}

/** Put the store back to its seed; each community seeds again on next read. */
export function resetCommunityBadgesDemo(): void {
  badgesState = freshState();
  commit();
}

export function isDemoSpaceSlug(slug: string): boolean {
  const hasParent = (getLiving(slug)?.parent ?? null) !== null;
  return hasParent || findDemoSpace(slug) !== undefined;
}

const toIso = (time: number) => new Date(time).toISOString();

function rosterSlugsOf(slug: string): string[] {
  return (getLiving(slug)?.roster ?? []).flatMap((rosterMember) =>
    rosterMember.slug ? [rosterMember.slug] : [],
  );
}

function progressOf(slug: string, memberSlug: string): DemoBadgeProgress {
  const seed = DEMO_BADGE_PROGRESS[slug];
  const ownProgress = seed?.bySlug[memberSlug];
  if (ownProgress) return ownProgress;
  const isOnRoster = rosterSlugsOf(slug).includes(memberSlug);
  return (isOnRoster ? seed?.otherRosterMembers : null) ?? ZERO_PROGRESS;
}

/** Everyone whose progress the store knows in this community. */
function candidateSlugsOf(slug: string): string[] {
  const progressSlugs = Object.keys(DEMO_BADGE_PROGRESS[slug]?.bySlug ?? {});
  return [...new Set([...rosterSlugsOf(slug), ...progressSlugs])];
}

/** Awards the badge to everyone who reaches it and holds no award yet, the
 *  demo's stand-in for the server's silent backfill. */
function backfill(
  slug: string,
  community: StoredCommunity,
  badge: StoredBadge,
  awardedAt: number,
): void {
  const holders = community.awards.get(badge.id) ?? new Map<string, number>();
  for (const memberSlug of candidateSlugsOf(slug)) {
    const isReached =
      progressOf(slug, memberSlug)[badge.ruleType] >= badge.threshold;
    if (isReached && !holders.has(memberSlug))
      holders.set(memberSlug, awardedAt);
  }
  community.awards.set(badge.id, holders);
}

function seedCommunity(slug: string, state: DemoBadgesState): StoredCommunity {
  const now = Date.now();
  const createdBase = now - SEED_CREATED_DAYS_AGO * DAY_MS;
  const awardedAt = now - DEMO_BADGE_AWARDED_DAYS_AGO * DAY_MS;
  const community: StoredCommunity = {
    badges: [],
    awards: new Map(),
    wornBySlug: new Map(),
  };
  const starters = COMMUNITY_BADGE_STARTERS.map((starter, index) => ({
    seedKey: starter.key,
    starterKey: starter.key,
    ...starter,
    isEnabled: true,
    earlierHolderSlugs: [] as readonly string[],
    offset: index,
  }));
  const extras = (DEMO_BADGE_EXTRA_BADGES[slug] ?? []).map((extra, index) => ({
    seedKey: extra.key,
    starterKey: null,
    ...extra,
    offset: starters.length + index,
  }));
  for (const seed of [...starters, ...extras]) {
    const badge: StoredBadge = {
      id: `demo-badge-${slug}-${seed.seedKey}`,
      starterKey: seed.starterKey,
      name: seed.name,
      iconKey: seed.iconKey,
      tint: seed.tint,
      ruleType: seed.ruleType,
      threshold: seed.threshold,
      isEnabled: seed.isEnabled,
      createdAt: createdBase + seed.offset,
      updatedAt: createdBase + seed.offset,
    };
    community.badges.push(badge);
    backfill(slug, community, badge, awardedAt);
    const holders = community.awards.get(badge.id);
    for (const holderSlug of seed.earlierHolderSlugs)
      holders?.set(holderSlug, awardedAt);
  }
  for (const [memberSlug, badgeKey] of Object.entries(
    DEMO_WORN_BADGES[slug] ?? {},
  )) {
    community.wornBySlug.set(memberSlug, `demo-badge-${slug}-${badgeKey}`);
  }
  for (const gift of DEMO_GIFT_SEED[slug] ?? []) {
    state.gifts.push({
      id: `demo-gift-${state.nextGiftNumber++}`,
      communitySlug: slug,
      senderSlug: gift.senderSlug,
      recipientSlug: gift.recipientSlug,
      giftKey: gift.giftKey,
      note: gift.note,
      sentAt: now - gift.sentDaysAgo * DAY_MS,
      hiddenAt:
        gift.hiddenDaysAgo === null ? null : now - gift.hiddenDaysAgo * DAY_MS,
      removedAt: null,
    });
  }
  state.communities.set(slug, community);
  return community;
}

function communityOf(slug: string): StoredCommunity {
  const state = current();
  return state.communities.get(slug) ?? seedCommunity(slug, state);
}

/** Every call starts here: a space has no badges or gifts. */
function assertNotSpace(slug: string, viewer: CommunityBadgesDemoViewer): void {
  if (viewer.isSpace || isDemoSpaceSlug(slug)) {
    throw communityBadgeRefusal("SUBCOMMUNITY_FEATURE_UNAVAILABLE");
  }
}

/** Board reads: a gated community's board is for its members. */
function assertBoardReadable(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
): void {
  const accessTier = getLiving(slug)?.accessTier ?? "public";
  if (!viewer.isMember && accessTier !== "public") {
    throw communityBadgeRefusal("COMMUNITY_MEMBERS_ONLY");
  }
}

function assertCanManage(viewer: CommunityBadgesDemoViewer): void {
  if (!canManageCommunityBadges(viewer.role, true)) {
    throw communityBadgeRefusal("badge_manage_owner_only");
  }
}

const isOwnerLevel = (viewer: CommunityBadgesDemoViewer) =>
  isOwnerRole(viewer.role) || isCoOwnerRole(viewer.role);

function sortedBadges(community: StoredCommunity): StoredBadge[] {
  return [...community.badges].sort(
    (left, right) =>
      left.createdAt - right.createdAt || left.id.localeCompare(right.id),
  );
}

function findBadge(community: StoredCommunity, badgeId: string): StoredBadge {
  const badge = community.badges.find((candidate) => candidate.id === badgeId);
  if (!badge) throw communityBadgeRefusal("badge_not_found");
  return badge;
}

function holderCountOf(
  slug: string,
  community: StoredCommunity,
  badgeId: string,
  viewer: CommunityBadgesDemoViewer,
): number {
  const rosterSlugs = rosterSlugsOf(slug);
  const holders = [...(community.awards.get(badgeId)?.keys() ?? [])];
  return holders.filter(
    (holderSlug) =>
      rosterSlugs.includes(holderSlug) ||
      (viewer.isMember && holderSlug === viewer.viewerSlug),
  ).length;
}

function toAdminDTO(
  slug: string,
  community: StoredCommunity,
  badge: StoredBadge,
  viewer: CommunityBadgesDemoViewer,
): CommunityBadgeAdminDTO {
  return {
    id: badge.id,
    starterKey: badge.starterKey,
    name: badge.name,
    iconKey: badge.iconKey,
    tint: badge.tint,
    ruleType: badge.ruleType,
    threshold: badge.threshold,
    isEnabled: badge.isEnabled,
    holderCount: holderCountOf(slug, community, badge.id, viewer),
    createdAt: toIso(badge.createdAt),
    updatedAt: toIso(badge.updatedAt),
  };
}

function toFlairDTO(badge: StoredBadge): CommunityFlairDTO {
  return {
    name: badge.name,
    starterKey: badge.starterKey,
    iconKey: badge.iconKey,
    tint: badge.tint,
  };
}

/** The badge a member wears, while it is switched on and still theirs. */
function wornBadgeOf(
  community: StoredCommunity,
  memberSlug: string,
): StoredBadge | null {
  const badgeId = community.wornBySlug.get(memberSlug);
  const badge = community.badges.find((candidate) => candidate.id === badgeId);
  const isHeld = badge
    ? community.awards.get(badge.id)?.has(memberSlug) === true
    : false;
  return badge && badge.isEnabled && isHeld ? badge : null;
}

/** `GET /badges`: enabled badges, with the viewer's progress for a member. */
export function demoGetBadges(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
): CommunityBadgesResponse {
  assertNotSpace(slug, viewer);
  assertBoardReadable(slug, viewer);
  const community = communityOf(slug);
  const progress = progressOf(slug, viewer.viewerSlug);
  const badges = sortedBadges(community)
    .filter((badge) => badge.isEnabled)
    .map((badge) => {
      const awardedAt = community.awards.get(badge.id)?.get(viewer.viewerSlug);
      return {
        id: badge.id,
        name: badge.name,
        starterKey: badge.starterKey,
        iconKey: badge.iconKey,
        tint: badge.tint,
        ruleType: badge.ruleType,
        threshold: badge.threshold,
        progress: viewer.isMember ? progress[badge.ruleType] : null,
        earnedAt:
          viewer.isMember && awardedAt !== undefined ? toIso(awardedAt) : null,
      };
    });
  const wornBadgeId = viewer.isMember
    ? (wornBadgeOf(community, viewer.viewerSlug)?.id ?? null)
    : null;
  return { isMember: viewer.isMember, wornBadgeId, badges };
}

/** `GET /badges/manage`: every badge, for staff. */
export function demoGetBadgeAdmin(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
): CommunityBadgeAdminResponse {
  assertNotSpace(slug, viewer);
  if (!isStaffRole(viewer.role))
    throw communityBadgeRefusal("badge_settings_staff_only");
  const community = communityOf(slug);
  return {
    canManage: canManageCommunityBadges(viewer.role, true),
    limit: COMMUNITY_BADGE_LIMIT,
    badges: sortedBadges(community).map((badge) =>
      toAdminDTO(slug, community, badge, viewer),
    ),
  };
}

export function demoCreateBadge(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  body: CreateCommunityBadgeBody,
): CommunityBadgeAdminDTO {
  assertNotSpace(slug, viewer);
  assertCanManage(viewer);
  const fields = checkBadgeCreate(body);
  const community = communityOf(slug);
  if (community.badges.length >= COMMUNITY_BADGE_LIMIT) {
    throw communityBadgeRefusal("badge_limit_reached", {
      limit: COMMUNITY_BADGE_LIMIT,
    });
  }
  assertBadgeNameFree(fields.name, community.badges, null);
  const state = current();
  const now = Math.max(
    Date.now(),
    ...community.badges.map((badge) => badge.createdAt + 1),
  );
  const badge: StoredBadge = {
    id: `demo-badge-${slug}-custom-${state.nextBadgeNumber++}`,
    starterKey: null,
    ...fields,
    createdAt: now,
    updatedAt: now,
  };
  community.badges.push(badge);
  if (badge.isEnabled) backfill(slug, community, badge, now);
  commit();
  return toAdminDTO(slug, community, badge, viewer);
}

/** `PATCH /badges/:badgeId`. Switching off keeps awards and worn ids; an
 *  empty or unchanged body writes nothing. */
export function demoUpdateBadge(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  badgeId: string,
  body: UpdateCommunityBadgeBody & { ruleType?: unknown },
): CommunityBadgeAdminDTO {
  assertNotSpace(slug, viewer);
  assertCanManage(viewer);
  const community = communityOf(slug);
  const badge = findBadge(community, badgeId);
  const changes = checkBadgeUpdate(body, badge.ruleType);
  const changedEntries = Object.entries(changes).filter(
    ([field, value]) => badge[field as keyof typeof changes] !== value,
  );
  if (changedEntries.length === 0)
    return toAdminDTO(slug, community, badge, viewer);
  if (changes.name !== undefined)
    assertBadgeNameFree(changes.name, community.badges, badge.id);
  const shouldBackfill =
    (changes.threshold !== undefined && changes.threshold < badge.threshold) ||
    (changes.isEnabled === true && !badge.isEnabled);
  Object.assign(badge, changes, { updatedAt: Date.now() });
  if (shouldBackfill && badge.isEnabled)
    backfill(slug, community, badge, Date.now());
  commit();
  return toAdminDTO(slug, community, badge, viewer);
}

/** `DELETE /badges/:badgeId`: awards go with it and nobody wears it. */
export function demoDeleteBadge(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  badgeId: string,
): DeleteCommunityBadgeResult {
  assertNotSpace(slug, viewer);
  assertCanManage(viewer);
  const community = communityOf(slug);
  const badge = findBadge(community, badgeId);
  const holderCount = holderCountOf(slug, community, badge.id, viewer);
  community.badges = community.badges.filter(
    (candidate) => candidate.id !== badge.id,
  );
  community.awards.delete(badge.id);
  for (const [memberSlug, wornId] of community.wornBySlug) {
    if (wornId === badge.id) community.wornBySlug.delete(memberSlug);
  }
  commit();
  return { id: badge.id, holderCount };
}

/** `PUT /flair`: null stops wearing; else an enabled badge the viewer holds. */
export function demoSetFlair(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  badgeId: string | null,
): CommunityFlairResponse {
  assertNotSpace(slug, viewer);
  if (!viewer.isMember) throw communityBadgeRefusal("COMMUNITY_MEMBERS_ONLY");
  const requestedId = checkFlairBadgeId(badgeId);
  const community = communityOf(slug);
  if (requestedId === null) {
    community.wornBySlug.delete(viewer.viewerSlug);
    commit();
    return { wornBadgeId: null, flair: null };
  }
  const badge = findBadge(community, requestedId);
  if (!badge.isEnabled) throw communityBadgeRefusal("flair_badge_disabled");
  if (community.awards.get(badge.id)?.has(viewer.viewerSlug) !== true) {
    throw communityBadgeRefusal("flair_badge_not_earned");
  }
  community.wornBySlug.set(viewer.viewerSlug, badge.id);
  commit();
  return { wornBadgeId: badge.id, flair: toFlairDTO(badge) };
}

function demoMemberRef(memberSlug: string): MemberRefDTO {
  const registryMember = getMember(memberSlug);
  return {
    slug: memberSlug,
    firstName: registryMember?.first ?? memberName(memberSlug),
    lastName: registryMember?.last ?? "",
    avatarUrl: memberAvatar(memberSlug)?.photo ?? null,
  };
}

function liveGiftsOf(slug: string): StoredGift[] {
  communityOf(slug);
  return current().gifts.filter(
    (gift) => gift.communitySlug === slug && gift.removedAt === null,
  );
}

function findLiveGift(slug: string, giftId: string): StoredGift {
  const gift = liveGiftsOf(slug).find((candidate) => candidate.id === giftId);
  if (!gift) throw communityBadgeRefusal("gift_not_found");
  return gift;
}

const isVisibleMark = (gift: StoredGift, now: number) =>
  gift.removedAt === null &&
  gift.hiddenAt === null &&
  gift.sentAt > now - WINDOW_MS;

const newestFirst = (left: StoredGift, right: StoredGift) =>
  right.sentAt - left.sentAt || right.id.localeCompare(left.id);

/** Gifts the sender sent here in the last 7 days, removed ones included. */
function allowanceOf(
  slug: string,
  senderSlug: string,
): CommunityGiftAllowanceDTO {
  communityOf(slug);
  const windowStart = Date.now() - WINDOW_MS;
  const counted = current().gifts.filter(
    (gift) =>
      gift.communitySlug === slug &&
      gift.senderSlug === senderSlug &&
      gift.sentAt > windowStart,
  );
  const oldestSentAt = Math.min(...counted.map((gift) => gift.sentAt));
  return {
    limit: COMMUNITY_GIFT_WEEKLY_LIMIT,
    used: counted.length,
    remaining: Math.max(0, COMMUNITY_GIFT_WEEKLY_LIMIT - counted.length),
    resetsAt: counted.length === 0 ? null : toIso(oldestSentAt + WINDOW_MS),
  };
}

function assertCanSendGifts(viewer: CommunityBadgesDemoViewer): void {
  if (!canSendCommunityGifts(viewer.role))
    throw communityBadgeRefusal("gift_sender_not_staff");
}

/** `GET /gifts/allowance`, for staff. */
export function demoGetGiftAllowance(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
): CommunityGiftAllowanceDTO {
  assertNotSpace(slug, viewer);
  assertCanSendGifts(viewer);
  return allowanceOf(slug, viewer.viewerSlug);
}

/** `POST /gifts`: staff to a current member other than themselves. */
export function demoSendGift(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  body: SendCommunityGiftBody,
): CommunitySentGiftDTO {
  assertNotSpace(slug, viewer);
  assertCanSendGifts(viewer);
  const fields = checkGiftSend(body);
  const isRecipientMember =
    rosterSlugsOf(slug).includes(fields.recipientSlug) ||
    (viewer.isMember && fields.recipientSlug === viewer.viewerSlug);
  if (!isRecipientMember)
    throw communityBadgeRefusal("gift_recipient_not_member");
  if (fields.recipientSlug === viewer.viewerSlug)
    throw communityBadgeRefusal("gift_to_self");
  const allowance = allowanceOf(slug, viewer.viewerSlug);
  if (allowance.used >= COMMUNITY_GIFT_WEEKLY_LIMIT) {
    throw communityBadgeRefusal("gift_weekly_limit_reached", {
      limit: COMMUNITY_GIFT_WEEKLY_LIMIT,
      resetsAt: allowance.resetsAt ?? toIso(Date.now() + WINDOW_MS),
    });
  }
  const state = current();
  const gift: StoredGift = {
    id: `demo-gift-${state.nextGiftNumber++}`,
    communitySlug: slug,
    senderSlug: viewer.viewerSlug,
    recipientSlug: fields.recipientSlug,
    giftKey: fields.giftKey,
    note: fields.note,
    sentAt: Date.now(),
    hiddenAt: null,
    removedAt: null,
  };
  state.gifts.push(gift);
  commit();
  return {
    id: gift.id,
    giftKey: gift.giftKey,
    note: gift.note,
    recipient: demoMemberRef(gift.recipientSlug),
    sentAt: toIso(gift.sentAt),
    allowance: allowanceOf(slug, viewer.viewerSlug),
  };
}

function toShelfDTO(gift: StoredGift): CommunityShelfGiftDTO {
  return {
    id: gift.id,
    giftKey: gift.giftKey,
    note: gift.note,
    sender: gift.senderSlug === null ? null : demoMemberRef(gift.senderSlug),
    sentAt: toIso(gift.sentAt),
    markEndsAt: toIso(gift.sentAt + WINDOW_MS),
    isHidden: gift.hiddenAt !== null,
  };
}

/** `GET /gifts/mine?page=`: the viewer's gifts, hidden ones included. */
export function demoListShelf(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  page: number,
): Paginated<CommunityShelfGiftDTO> {
  assertNotSpace(slug, viewer);
  if (!viewer.isMember) throw communityBadgeRefusal("COMMUNITY_MEMBERS_ONLY");
  const pageNumber = Number.isInteger(page) && page >= 1 ? page : 1;
  const received = liveGiftsOf(slug)
    .filter((gift) => gift.recipientSlug === viewer.viewerSlug)
    .sort(newestFirst);
  const start = (pageNumber - 1) * SHELF_PAGE_SIZE;
  return {
    items: received.slice(start, start + SHELF_PAGE_SIZE).map(toShelfDTO),
    total: received.length,
    page: pageNumber,
    pageSize: SHELF_PAGE_SIZE,
  };
}

/** `PATCH /gifts/:giftId`: the recipient hides or shows its mark. */
export function demoSetGiftHidden(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  giftId: string,
  isHidden: unknown,
): CommunityShelfGiftDTO {
  assertNotSpace(slug, viewer);
  const gift = findLiveGift(slug, giftId);
  if (!viewer.isMember || gift.recipientSlug !== viewer.viewerSlug) {
    throw communityBadgeRefusal("gift_not_found");
  }
  const shouldHide = checkGiftHidden(isHidden);
  if (shouldHide !== (gift.hiddenAt !== null)) {
    gift.hiddenAt = shouldHide ? Date.now() : null;
    commit();
  }
  return toShelfDTO(gift);
}

const canRemoveGift = (gift: StoredGift, viewer: CommunityBadgesDemoViewer) =>
  (viewer.isMember && gift.senderSlug === viewer.viewerSlug) ||
  isOwnerLevel(viewer);

/** `DELETE /gifts/:giftId`: the sender while a member, or owner-level. */
export function demoRemoveGift(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  giftId: string,
): { id: string } {
  assertNotSpace(slug, viewer);
  const gift = findLiveGift(slug, giftId);
  if (!canRemoveGift(gift, viewer))
    throw communityBadgeRefusal("gift_remove_not_allowed");
  gift.removedAt = Date.now();
  commit();
  return { id: gift.id };
}

/** `GET /members/:memberSlug/gifts`: visible marks with id, gift and date only. */
export function demoMemberGifts(
  slug: string,
  viewer: CommunityBadgesDemoViewer,
  memberSlug: string,
): CommunityMemberGiftsResponse {
  assertNotSpace(slug, viewer);
  assertBoardReadable(slug, viewer);
  const isMemberListed =
    rosterSlugsOf(slug).includes(memberSlug) ||
    (viewer.isMember && memberSlug === viewer.viewerSlug);
  if (!isMemberListed) return { gifts: [] };
  const now = Date.now();
  const gifts = liveGiftsOf(slug)
    .filter(
      (gift) => gift.recipientSlug === memberSlug && isVisibleMark(gift, now),
    )
    .sort(newestFirst)
    .slice(0, MEMBER_MARKS_LIMIT)
    .map((gift) => ({
      id: gift.id,
      giftKey: gift.giftKey,
      sentAt: toIso(gift.sentAt),
      canRemove: canRemoveGift(gift, viewer),
    }));
  return { gifts };
}

/** The id of the newest live gift `senderSlug` sent `recipientSlug` here, so
 *  the demo gift notification can report the very gift the shelf shows. */
export function demoGiftIdOf(
  slug: string,
  senderSlug: string,
  recipientSlug: string,
): string | undefined {
  if (isDemoSpaceSlug(slug)) return undefined;
  return liveGiftsOf(slug)
    .filter(
      (gift) =>
        gift.senderSlug === senderSlug && gift.recipientSlug === recipientSlug,
    )
    .sort(newestFirst)[0]?.id;
}

/** What a member's name line shows here: the worn badge while it is on, and
 *  a gift mark while a visible one is inside its 7 days.
 *
 *  `viewer` is the demo session's viewer, when the caller knows it. The demo
 *  viewer's membership lives in the session provider, so once they leave the
 *  community their own name line shows no decor, the way live drops the worn
 *  badge and gift mark with the roster row. */
export function demoMemberDecor(
  slug: string,
  memberSlug: string | undefined,
  viewer?: Pick<CommunityBadgesDemoViewer, "viewerSlug" | "isMember">,
): { flair: CommunityFlairDTO | null; hasRecentGift: boolean } {
  if (!memberSlug || isDemoSpaceSlug(slug))
    return { flair: null, hasRecentGift: false };
  const isViewerGone =
    viewer !== undefined &&
    !viewer.isMember &&
    memberSlug === viewer.viewerSlug;
  if (isViewerGone) return { flair: null, hasRecentGift: false };
  const community = communityOf(slug);
  const wornBadge = wornBadgeOf(community, memberSlug);
  const now = Date.now();
  const hasRecentGift = current().gifts.some(
    (gift) =>
      gift.communitySlug === slug &&
      gift.recipientSlug === memberSlug &&
      isVisibleMark(gift, now),
  );
  return { flair: wornBadge ? toFlairDTO(wornBadge) : null, hasRecentGift };
}
