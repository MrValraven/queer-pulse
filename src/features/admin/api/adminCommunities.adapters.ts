import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { REASON_LABEL_KEYS, type ReasonCode } from "../../safety/reportReasons";
import { relativeAgeLabel } from "../moderationAge";
import { reasonCategoryKey } from "./moderationCategories";
import type { AvatarTone } from "../ui";
import type {
  Community,
  Moderator,
  QueueItem,
  Visibility,
} from "../adminCommunities.data";
import type {
  ActivityLabel,
  AdminCommunityCardDTO,
  AdminCommunityDetailDTO,
  AdminCommunityHealthBreakdownDTO,
  AdminCommunityModeratorDTO,
  AdminCommunityQueueItemDTO,
} from "./adminCommunities.api";

// Map the admin-communities DTOs onto the EXISTING `Community` view model the
// grid/detail/health/support components already render (spec `adminCommunities.data.ts`).
//
// i18n scope rule (docs/i18n/extraction-brief.md §1): `activityLabel` and a
// moderator's owner/mod role are chrome this code authors and classifies, so
// they resolve through `translate()`. A community's own description is real API
// content and is deliberately left untranslated.
//
// FE-ADM-26 correction: a queue item's category badge, its reason label, and
// its status/overdue/age meta line were grouped with "API content" and left in
// English. They are not fetched text — this file builds them from stable codes
// (`reasonCode`, `status`, `overdue`, an ISO timestamp), which is exactly what
// makes them client chrome, so they now resolve through `translate()` and
// `Intl` too. The one genuinely fetched string is `queueItemDto.detail`, the
// reporter's own words, which still passes through untouched.
//
// Locale-threading fix (Task 7 review, applied in Task 8): `members`,
// `founded`, and a moderator's "since" date are locale-sensitive numbers/dates,
// not chrome strings, so `translate()` alone can't localize them. Every
// adapter here now also takes a `Formatters` (see
// `src/shared/i18n/format.ts`), following the `jobs.adapters.ts` precedent
// (`formatPay`/`postedText`/`deadlineText` all take `fmt: Formatters`) rather
// than `useJoinRequests.ts`'s bare `locale: string` — this file has two
// distinct locale-sensitive kinds (a count and a date) reused across multiple
// helpers (`formatMemberCount`, `monthYearLabel` is called from both
// `cardDtoToCommunity`'s `founded` and `moderatorRoleLine`), and bundling them
// as one `Formatters` object avoids every call site re-deriving its own
// `Intl` formatter or re-passing a raw locale string past each other.

const ACTIVITY_LABEL_KEY: Record<ActivityLabel, string> = {
  Quiet: "admin:communities.activityLabel.quiet",
  Growing: "admin:communities.activityLabel.growing",
  Steady: "admin:communities.activityLabel.steady",
  Active: "admin:communities.activityLabel.active",
  High: "admin:communities.activityLabel.high",
  Busy: "admin:communities.activityLabel.busy",
};

/** `Sparkline` divides by `points.length - 1`, so a one-element array is a
 *  `NaN` coordinate and an empty one throws. Eight zeros reads as "flat". */
const FALLBACK_SPARKLINE: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

function sparklineFrom(activitySparkline: number[]): number[] {
  return activitySparkline.length < 2 ? FALLBACK_SPARKLINE : activitySparkline;
}

/** [memberActivity, reportResolution, memberSentiment, safetyLoad] — the null
 *  sentiment passes through untouched; see the module doc comment. */
function healthBreakdownToTuple(
  healthBreakdown: AdminCommunityHealthBreakdownDTO,
): [number, number, number | null, number] {
  return [
    healthBreakdown.memberActivity,
    healthBreakdown.reportResolution,
    healthBreakdown.memberSentiment,
    healthBreakdown.safetyLoad,
  ];
}

/** "1,204" (EN) / "1204" grouped per pt-PT convention — locale-aware via the
 *  caller's `Formatters`. */
function formatMemberCount(memberCount: number, fmt: Formatters): string {
  return fmt.number(memberCount);
}

/** "Mar 2023" (EN) / "mar. 2023" (PT) from an ISO timestamp, locale-aware via
 *  the caller's `Formatters`; "" if the timestamp doesn't parse. */
function monthYearLabel(isoTimestamp: string, fmt: Formatters): string {
  const parsedDate = new Date(isoTimestamp);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return fmt.date(parsedDate, { month: "short", year: "numeric" });
}

// The card endpoint carries no visibility at all — only GET
// /admin/communities/:slug does. Nothing renders `vis` off a card-derived
// Community (the grid never reads it), so this placeholder is inert; picked
// "network" over "private"/"public" as the least presumptive of the three.
const CARD_PATH_VISIBILITY_PLACEHOLDER: Visibility = "network";

const MODERATOR_AVATAR_TONES: AvatarTone[] = [
  "plum",
  "coral",
  "jade",
  "violet",
  "amber",
];

/** Deterministic avatar tone from a member slug, so a moderator keeps the
 *  same colour across renders without the backend storing one — mirrors the
 *  backend's own `toneFor` (admin-communities-response.ts). */
function avatarToneForSlug(slug: string): AvatarTone {
  let hash = 0;
  for (
    let characterIndex = 0;
    characterIndex < slug.length;
    characterIndex += 1
  ) {
    hash = (hash * 31 + slug.charCodeAt(characterIndex)) % 1_000_003;
  }
  return MODERATOR_AVATAR_TONES[hash % MODERATOR_AVATAR_TONES.length]!;
}

/** "Founded the community" / "Moderator since Mar 2023" — composed chrome,
 *  so it resolves through `translate()` (see the module doc comment). */
function moderatorRoleLine(
  moderatorDto: AdminCommunityModeratorDTO,
  translate: TFunction,
  fmt: Formatters,
): string {
  if (moderatorDto.role === "owner") {
    return translate("admin:communities.moderators.roleLine.owner");
  }
  return translate("admin:communities.moderators.roleLine.mod", {
    date: monthYearLabel(moderatorDto.joinedAt, fmt),
  });
}

function moderatorDtoToModerator(
  moderatorDto: AdminCommunityModeratorDTO,
  translate: TFunction,
  fmt: Formatters,
): Moderator {
  return {
    initials: moderatorDto.initials,
    name: moderatorDto.name,
    // Neither endpoint exposes a moderator's pronouns yet — no backend field.
    pronouns: "",
    avatarUrl: moderatorDto.avatarUrl,
    tone: avatarToneForSlug(moderatorDto.slug),
    role: moderatorRoleLine(moderatorDto, translate, fmt),
    memberId: moderatorDto.userId,
    slug: moderatorDto.slug,
    isOwner: moderatorDto.role === "owner",
  };
}

/** Queue-item status codes the backend can send (`ReportStatus`), as catalog
 *  keys. An unmapped status falls back to the raw code rather than a
 *  hand-capitalized English word. */
const QUEUE_STATUS_KEY: Record<string, string> = {
  open: "admin:communities.queue.status.open",
  resolved: "admin:communities.queue.status.resolved",
  escalated: "admin:communities.queue.status.escalated",
};

const QUEUE_SEVERITY_TONE: Record<
  AdminCommunityQueueItemDTO["severity"],
  QueueItem["severity"]
> = {
  emergency: "danger",
  high: "coral",
  medium: "amber",
  low: "jade",
};

/** The reporter's own words when they gave any; otherwise the localized reason
 *  label, falling back to the raw code for a reason this client hasn't mapped. */
function queueItemTitle(
  queueItemDto: AdminCommunityQueueItemDTO,
  translate: TFunction,
): string {
  if (queueItemDto.detail) return queueItemDto.detail;
  const reasonLabelKey =
    REASON_LABEL_KEYS[queueItemDto.reasonCode as ReasonCode];
  return reasonLabelKey ? translate(reasonLabelKey) : queueItemDto.reasonCode;
}

const META_SEPARATOR = " · ";

/** "Open · overdue · 3 hours ago" / "Aberta · Atrasado · há 3 horas" — every
 *  part is derived from a stable code or a timestamp, so each resolves through
 *  `translate()` or `Intl`. A timestamp that doesn't parse simply drops the age
 *  rather than printing an English placeholder. */
function queueItemMeta(
  queueItemDto: AdminCommunityQueueItemDTO,
  translate: TFunction,
  fmt: Formatters,
): string {
  const statusKey = QUEUE_STATUS_KEY[queueItemDto.status];
  const parts = [statusKey ? translate(statusKey) : queueItemDto.status];
  if (queueItemDto.overdue)
    parts.push(translate("admin:moderation.slaOverdue"));
  const ageLabel = relativeAgeLabel(queueItemDto.createdAt, fmt);
  if (ageLabel) parts.push(ageLabel);
  return parts.join(META_SEPARATOR);
}

function queueItemDtoToQueueItem(
  queueItemDto: AdminCommunityQueueItemDTO,
  translate: TFunction,
  fmt: Formatters,
): QueueItem {
  const severityTone = QUEUE_SEVERITY_TONE[queueItemDto.severity];
  return {
    severity: severityTone,
    categoryTone: severityTone,
    categoryLabel: translate(reasonCategoryKey(queueItemDto.reasonCode)),
    title: queueItemTitle(queueItemDto, translate),
    meta: queueItemMeta(queueItemDto, translate, fmt),
  };
}

/** GET /admin/communities item → the admin grid's `Community`. */
export function cardDtoToCommunity(
  cardDto: AdminCommunityCardDTO,
  translate: TFunction,
  fmt: Formatters,
): Community {
  return {
    slug: cardDto.slug,
    name: cardDto.name,
    initials: cardDto.initials,
    tone: cardDto.tone,
    tag: cardDto.tag,
    // The card endpoint carries no description — only the detail endpoint does.
    description: "",
    members: formatMemberCount(cardDto.memberCount, fmt),
    activity: translate(ACTIVITY_LABEL_KEY[cardDto.activityLabel]),
    activePercent: cardDto.activePercentage,
    reports: cardDto.openReportCount,
    // Not a genuinely missing field: the backend's own
    // `toAdminCommunityDetail` derives `resolvedPercentage` from exactly this
    // nested value (admin-communities-response.ts), so the card already
    // carries it under a different name.
    resolvedPercent: cardDto.healthBreakdown.reportResolution,
    health: cardDto.healthScore,
    // The card endpoint carries no founding date — only the detail endpoint does.
    founded: "",
    spark: sparklineFrom(cardDto.activitySparkline),
    breakdown: healthBreakdownToTuple(cardDto.healthBreakdown),
    // Neither the card nor the detail endpoint expose a "who can join"
    // policy string yet — there is no backend field for it at all.
    join: "",
    // Neither endpoint exposes a code-of-care summary yet — no backend field.
    code: "",
    visibility: CARD_PATH_VISIBILITY_PLACEHOLDER,
    // The card endpoint carries no safety-policy flags — only the detail
    // endpoint does. Default off; the grid never reads these.
    requiresSecondVouch: false,
    autoFreezeOnReports: false,
    // The card endpoint carries no featured flag — only the detail endpoint does.
    isFeatured: false,
    support: cardDto.needsSupport,
    // The card endpoint carries no moderator roster.
    moderators: [],
    // The card endpoint carries no scoped report queue.
    queue: [],
  };
}

/** GET /admin/communities/:slug → the admin detail page's `Community`. */
export function detailDtoToCommunity(
  detailDto: AdminCommunityDetailDTO,
  translate: TFunction,
  fmt: Formatters,
): Community {
  return {
    ...cardDtoToCommunity(detailDto, translate, fmt),
    description: detailDto.description,
    resolvedPercent: detailDto.resolvedPercentage,
    founded: monthYearLabel(detailDto.foundedAt, fmt),
    visibility: detailDto.visibility,
    requiresSecondVouch: detailDto.requiresSecondVouch,
    autoFreezeOnReports: detailDto.autoFreezeOnReports,
    isFeatured: detailDto.isFeatured,
    frozen: detailDto.frozen,
    archived: detailDto.archived,
    truncated: detailDto.truncated,
    // Still no backend field for either of these — see the card-path comment.
    join: "",
    code: "",
    moderators: detailDto.moderators.map((moderatorDto) =>
      moderatorDtoToModerator(moderatorDto, translate, fmt),
    ),
    queue: detailDto.scopedQueue.map((queueItemDto) =>
      queueItemDtoToQueueItem(queueItemDto, translate, fmt),
    ),
  };
}
