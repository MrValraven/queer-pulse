import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { AvatarTone } from "../ui";
import type {
  AdminMember,
  CommTone,
  DrawerStat,
  FlaggedMember,
  FlaggedStatusId,
  GraphNode,
  MemberDetail,
  ModerationEntry,
  VouchAvatar,
} from "../adminMembers.data";
import type {
  AdminMemberCardDTO,
  AdminMemberDetailDTO,
  AdminMemberModerationEntryDTO,
  FlaggedMemberDTO,
  ModerationState,
  VouchAvatarDTO,
  VouchGraphNodeDTO,
} from "./adminMembers.api";

/**
 * Maps the admin-members DTOs (`adminMembers.api.ts`, D1) onto the EXISTING
 * `AdminMember` / `FlaggedMember` / `MemberDetail` view models the
 * grid/drawer components already render (`adminMembers.data.ts`). Follows the
 * `(dto, t, fmt)` shape of `adminCommunities.adapters.ts`: the backend emits
 * data + primitives only (a `joinedAt` ISO string, a stable `moderationState`
 * code, …) and this file is solely responsible for composing every
 * user-facing sentence and resolving every enum → tone/label, so no English
 * ever gets baked into the view model itself.
 *
 * i18n scope rule (docs/i18n/extraction-brief.md §1, mirrored from
 * `adminCommunities.adapters.ts`): chrome this code authors and classifies
 * (the "Joined {date}" meta prefix, glance labels, timeline titles) resolves
 * through `t()`; real API content a report/report-detail/contribution already
 * carries as free text (`latestReportDetail`, a contribution's own `detail`)
 * is left as-is, exactly like the communities adapter leaves a queue item's
 * `detail`/`reasonCode` label untranslated.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;
const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;
const MILLISECONDS_PER_YEAR = 365 * MILLISECONDS_PER_DAY;
const DAYS_UNTIL_NO_LONGER_NEW = 30;

/** "Mar 2023" (EN) / "mar. 2023" (PT) from an ISO timestamp, locale-aware via
 *  the caller's `Formatters`; "" if the timestamp doesn't parse. Mirrors
 *  `adminCommunities.adapters.ts`'s `monthYearLabel`. */
function monthYearLabel(isoTimestamp: string, fmt: Formatters): string {
  const parsedDate = new Date(isoTimestamp);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return fmt.date(parsedDate, { month: "short", year: "numeric" });
}

/** "Joined Mar 2023" (or "" when `isoTimestamp` doesn't parse, so callers can
 *  filter it out of a joined meta line without a stray " · "). */
function joinedMetaSegment(
  isoTimestamp: string,
  t: TFunction,
  fmt: Formatters,
): string {
  const dateLabel = monthYearLabel(isoTimestamp, fmt);
  if (!dateLabel) return "";
  return t("admin:members.meta.joined", { date: dateLabel });
}

/* ── Card → AdminMember (member directory grid) ──────────────────────────── */

export function cardDtoToMember(
  cardDto: AdminMemberCardDTO,
  t: TFunction,
  fmt: Formatters,
): AdminMember {
  const metaSegments = [
    joinedMetaSegment(cardDto.joinedAt, t, fmt),
    cardDto.tagline ?? "",
    ...cardDto.communities,
  ].filter((segment) => segment.length > 0);
  return {
    id: cardDto.id,
    slug: cardDto.slug,
    name: cardDto.name,
    initials: cardDto.initials,
    tone: cardDto.tone,
    pronoun: cardDto.pronouns ?? "",
    verified: cardDto.verified,
    role: cardDto.role,
    avatarUrl: cardDto.avatarUrl,
    openReportsCount: cardDto.openReportCount || undefined,
    statusTone: cardDto.verified ? "jade" : "coral",
    newThisWeek:
      Date.now() - Date.parse(cardDto.joinedAt) < MILLISECONDS_PER_WEEK,
    meta: metaSegments.join(" · "),
    vouchCount: cardDto.vouchCount,
    vouchedBy: cardDto.vouchedBy.map(
      (vouchAvatarDto: VouchAvatarDTO): VouchAvatar => ({
        initials: vouchAvatarDto.initials,
        tone: vouchAvatarDto.tone,
        avatarUrl: vouchAvatarDto.avatarUrl,
      }),
    ),
  };
}

/* ── Flagged queue ────────────────────────────────────────────────────────── */

type FlaggedCategory = FlaggedMember["category"];

const FLAGGED_CATEGORY_TONE: Record<
  FlaggedCategory["kind"],
  FlaggedMember["categoryTone"]
> = {
  doxxing: "danger",
  spam: "amber",
  reportsCount: "danger",
};

const MODERATION_STATE_TO_STATUS_ID: Record<ModerationState, FlaggedStatusId> =
  {
    under_review: "underReview",
    frozen: "frozen",
    limited: "limited",
  };

const FLAGGED_STATUS_TONE: Record<FlaggedStatusId, FlaggedMember["statusTone"]> =
  {
    underReview: "coral",
    frozen: "danger",
    limited: "amber",
  };

/** `topReasonCode` is a free-form server string; only "doxxing"/"spam" get a
 *  fixed reason chip, everything else (including `null`) falls back to the
 *  member's real open-report count rather than baking an unmapped code into
 *  the view. */
function flaggedCategoryFor(flaggedDto: FlaggedMemberDTO): FlaggedCategory {
  if (flaggedDto.topReasonCode === "doxxing") return { kind: "doxxing" };
  if (flaggedDto.topReasonCode === "spam") return { kind: "spam" };
  return { kind: "reportsCount", count: flaggedDto.openReportCount };
}

export function flaggedDtoToMember(
  flaggedDto: FlaggedMemberDTO,
  t: TFunction,
  fmt: Formatters,
): FlaggedMember {
  const category = flaggedCategoryFor(flaggedDto);
  const statusId = MODERATION_STATE_TO_STATUS_ID[flaggedDto.moderationState];
  const metaSegments = [
    joinedMetaSegment(flaggedDto.joinedAt, t, fmt),
    flaggedDto.latestReportDetail ?? "",
  ].filter((segment) => segment.length > 0);
  return {
    id: flaggedDto.id,
    handle: flaggedDto.handle,
    initials: flaggedDto.initials,
    tone: flaggedDto.tone,
    avatarUrl: flaggedDto.avatarUrl,
    category,
    categoryTone: FLAGGED_CATEGORY_TONE[category.kind],
    meta: metaSegments.join(" · "),
    statusId,
    statusTone: FLAGGED_STATUS_TONE[statusId],
  };
}

/* ── Detail drawer ────────────────────────────────────────────────────────── */

/** "New" (<30d), "{count}mo", or "{count}yr" — a compact "member for" glance
 *  value, all resolved through `t()` so the abbreviation itself is never
 *  baked-in English. */
function memberForGlanceValue(joinedAtIso: string, t: TFunction): string {
  const joinedAtMs = Date.parse(joinedAtIso);
  if (Number.isNaN(joinedAtMs)) return t("admin:members.glance.memberFor.new");
  const nowMs = Date.now();
  const elapsedDays = (nowMs - joinedAtMs) / MILLISECONDS_PER_DAY;
  if (elapsedDays < DAYS_UNTIL_NO_LONGER_NEW) {
    return t("admin:members.glance.memberFor.new");
  }
  const elapsedYears = Math.floor((nowMs - joinedAtMs) / MILLISECONDS_PER_YEAR);
  if (elapsedYears >= 1) {
    return t("admin:members.glance.memberFor.years", { count: elapsedYears });
  }
  const elapsedMonths = Math.max(1, Math.floor(elapsedDays / 30));
  return t("admin:members.glance.memberFor.months", { count: elapsedMonths });
}

function glanceFor(
  detailDto: AdminMemberDetailDTO,
  t: TFunction,
): DrawerStat[] {
  return [
    {
      labelKey: "admin:members.glance.vouches",
      value: String(detailDto.vouchCount),
    },
    {
      labelKey: "admin:members.glance.memberFor",
      value: memberForGlanceValue(detailDto.joinedAt, t),
    },
    {
      labelKey: "admin:members.glance.reportsAgainst",
      value: String(detailDto.openReportCount),
    },
  ];
}

/** "21 members vouch for Inês" — or, once the member has vouched for others,
 *  "…, who vouches for 3 in return". Composed (never fabricated: only the real
 *  inbound `vouchCount`, outbound `outboundVouchCount`, and the member's own
 *  first name go into the sentence). Plurals key off the inbound count. */
function graphNoteFor(detailDto: AdminMemberDetailDTO, t: TFunction): string {
  const firstName = detailDto.name.split(" ")[0] || detailDto.name;
  const noteKey =
    detailDto.outboundVouchCount > 0
      ? "admin:members.detail.graphNoteMutual"
      : "admin:members.detail.graphNote";
  return t(noteKey, {
    count: detailDto.vouchCount,
    given: detailDto.outboundVouchCount,
    name: firstName,
  });
}

function removeBodyFor(detailDto: AdminMemberDetailDTO, t: TFunction): string {
  return t("admin:members.detail.removeBody", { name: detailDto.name });
}

const COMMUNITY_ROLE_LABEL_KEY: Record<"owner" | "mod", string> = {
  owner: "admin:members.communities.role.owner",
  mod: "admin:members.communities.role.mod",
};

const COMMUNITY_TONES: CommTone[] = [
  "jade",
  "violet",
  "plum",
  "coral",
  "amber",
];

/** Deterministic tone from a community's name, so a chip keeps the same
 *  colour across renders without the backend storing one — mirrors
 *  `adminCommunities.adapters.ts`'s `avatarToneForSlug`. */
function communityToneFor(communityName: string): CommTone {
  let hash = 0;
  for (
    let characterIndex = 0;
    characterIndex < communityName.length;
    characterIndex += 1
  ) {
    hash = (hash * 31 + communityName.charCodeAt(characterIndex)) % 1_000_003;
  }
  return COMMUNITY_TONES[hash % COMMUNITY_TONES.length]!;
}

function communityDtoToChip(
  communityDto: AdminMemberDetailDTO["communities"][number],
  t: TFunction,
): MemberDetail["communities"][number] {
  const roleLabelKey =
    communityDto.role === "owner" || communityDto.role === "mod"
      ? COMMUNITY_ROLE_LABEL_KEY[communityDto.role]
      : null;
  return {
    label: roleLabelKey
      ? `${communityDto.name} · ${t(roleLabelKey)}`
      : communityDto.name,
    tone: communityToneFor(communityDto.name),
  };
}

/** Only "vouch" is emitted by the backend today (`admin-members.service.ts`);
 *  any other `kind` (the DTO leaves it a free-form string) falls back to a
 *  generic, honest title rather than surfacing an unmapped code. */
const CONTRIBUTION_TITLE_KEY: Partial<Record<string, string>> = {
  vouch: "admin:members.contributions.kind.vouch",
};

/** A contribution's own `detail` (e.g. "Vouched for Marco Vieira") is real,
 *  backend-composed content — left as-is, exactly like a queue item's
 *  `detail` in `adminCommunities.adapters.ts`'s `queueItemTitle`. Only the
 *  generic fallback (no `detail`) is chrome this file authors. */
function contributionTitle(
  contributionDto: AdminMemberDetailDTO["contributions"][number],
  t: TFunction,
): string {
  if (contributionDto.detail) return contributionDto.detail;
  return t(
    CONTRIBUTION_TITLE_KEY[contributionDto.kind] ??
      "admin:members.contributions.kind.other",
  );
}

/** "2 minutes ago" while recent, then "Jun 12" once it's more than a week
 *  old — fully `Intl`-localized via `fmt`, no catalog strings needed since
 *  `Intl.RelativeTimeFormat`/`Intl.DateTimeFormat` already carry the locale. */
function contributionWhen(isoTimestamp: string, fmt: Formatters): string {
  const atMs = Date.parse(isoTimestamp);
  if (Number.isNaN(atMs)) return "";
  const elapsedMs = Date.now() - atMs;
  const elapsedMinutes = Math.round(elapsedMs / MILLISECONDS_PER_MINUTE);
  if (elapsedMinutes < 60) return fmt.relativeTime(-elapsedMinutes, "minute");
  const elapsedHours = Math.round(elapsedMs / MILLISECONDS_PER_HOUR);
  if (elapsedHours < 24) return fmt.relativeTime(-elapsedHours, "hour");
  const elapsedDays = Math.round(elapsedMs / MILLISECONDS_PER_DAY);
  if (elapsedDays < 7) return fmt.relativeTime(-elapsedDays, "day");
  return fmt.date(new Date(atMs), { month: "short", day: "numeric" });
}

/** Every `action` the backend can emit (`mod-action.dto.ts`'s
 *  `MOD_ACTION_CODES`, plus `admin-members.service.ts`'s own
 *  "verified"/"no_reports"/"appeal_upheld"/"suspension_lifted"). Kept
 *  `Partial` since the DTO leaves `action` an untyped string. */
const MODERATION_ACTION_TITLE_KEY: Partial<Record<string, string>> = {
  dismiss: "admin:members.timeline.action.dismiss",
  warn: "admin:members.timeline.action.warn",
  hide_content: "admin:members.timeline.action.hideContent",
  remove_content: "admin:members.timeline.action.removeContent",
  restrict: "admin:members.timeline.action.restrict",
  suspend: "admin:members.timeline.action.suspend",
  ban: "admin:members.timeline.action.ban",
  shield: "admin:members.timeline.action.shield",
  escalate: "admin:members.timeline.action.escalate",
  appeal_upheld: "admin:members.timeline.action.appealUpheld",
  suspension_lifted: "admin:members.timeline.action.suspensionLifted",
  verified: "admin:members.timeline.action.verified",
  no_reports: "admin:members.timeline.action.noReports",
};

function moderationEntryTitle(
  moderationEntryDto: AdminMemberModerationEntryDTO,
  t: TFunction,
): string {
  return t(
    MODERATION_ACTION_TITLE_KEY[moderationEntryDto.action] ??
      "admin:members.timeline.action.other",
  );
}

/** "no_reports" is stamped with "now" purely so it sorts into the timeline
 *  (see the backend's own comment on it — there is no real historical `at`
 *  for "nothing has happened yet"), so it gets a dateless, generic meta
 *  rather than a misleading "just now". */
function moderationEntryMeta(
  moderationEntryDto: AdminMemberModerationEntryDTO,
  t: TFunction,
  fmt: Formatters,
): string {
  if (moderationEntryDto.action === "no_reports") {
    return t("admin:members.timeline.noReportsMeta");
  }
  const dateLabel = monthYearLabel(moderationEntryDto.at, fmt);
  if (moderationEntryDto.action === "verified") {
    return t("admin:members.timeline.verifiedMeta", { date: dateLabel });
  }
  if (moderationEntryDto.actorName) {
    return t("admin:members.timeline.actedByMeta", {
      date: dateLabel,
      name: moderationEntryDto.actorName,
    });
  }
  return dateLabel;
}

function moderationEntryDtoToEntry(
  moderationEntryDto: AdminMemberModerationEntryDTO,
  t: TFunction,
  fmt: Formatters,
): ModerationEntry {
  return {
    tone: moderationEntryDto.tone,
    title: moderationEntryTitle(moderationEntryDto, t),
    meta: moderationEntryMeta(moderationEntryDto, t, fmt),
    // Only entries tied to a real report get a "view" link into the audit
    // log; there is nothing to link to otherwise.
    metaLink: moderationEntryDto.reportId
      ? t("admin:members.timeline.viewCta")
      : undefined,
    note: moderationEntryDto.note ?? undefined,
  };
}

function vouchAvatarDtoToAvatar(vouchAvatarDto: VouchAvatarDTO): {
  initials: string;
  tone: AvatarTone;
  avatarUrl: string | null;
} {
  return {
    initials: vouchAvatarDto.initials,
    tone: vouchAvatarDto.tone,
    avatarUrl: vouchAvatarDto.avatarUrl,
  };
}

/** Graph node = a vouch avatar plus which way the vouch runs. */
function graphNodeDtoToNode(graphNodeDto: VouchGraphNodeDTO): GraphNode {
  return {
    initials: graphNodeDto.initials,
    tone: graphNodeDto.tone,
    avatarUrl: graphNodeDto.avatarUrl,
    direction: graphNodeDto.direction,
  };
}

/** GET /admin/members/:id → the drawer's `MemberDetail`. */
export function detailDtoToMember(
  detailDto: AdminMemberDetailDTO,
  t: TFunction,
  fmt: Formatters,
): MemberDetail {
  return {
    id: detailDto.id,
    role: detailDto.role,
    isSystem: detailDto.isSystem,
    suspended: detailDto.suspended ?? false,
    glance: glanceFor(detailDto, t),
    graphNote: graphNoteFor(detailDto, t),
    communities: detailDto.communities.map((communityDto) =>
      communityDtoToChip(communityDto, t),
    ),
    contributions: detailDto.contributions.map((contributionDto) => ({
      what: contributionTitle(contributionDto, t),
      when: contributionWhen(contributionDto.at, fmt),
    })),
    moderationTimeline: detailDto.moderationTimeline.map(
      (moderationEntryDto) =>
        moderationEntryDtoToEntry(moderationEntryDto, t, fmt),
    ),
    removeBody: removeBodyFor(detailDto, t),
    graph: {
      center: vouchAvatarDtoToAvatar(detailDto.graph.center),
      nodes: detailDto.graph.nodes.map(graphNodeDtoToNode),
    },
  };
}
