import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { OPEN_CALLS_TOPIC_TAG } from "../../forum/funding/funding.data";
import { formatLisbonDeadline } from "../../forum/funding/fundingDates";
import type { NotifType } from "../notifications.types";

/**
 * ENG-409. Thirty-one kinds the backend has been writing (its
 * `NotificationType` enum in `src/notifications/entities/notification.entity.ts`)
 * that this client had no entry for, so every one of them rendered the
 * unknown-kind fallback, "You have a new notification." They live here, in
 * their own module, to keep `formatNotification.ts` under its function-length
 * cap; `formatNotification.ts` folds this union into `NotificationKind` and
 * spreads the category map below into `KIND_CATEGORY`.
 *
 * Every copy token below reads only a field the backend's per-type
 * `PAYLOAD_ALLOWLIST` (`src/notifications/notification-response.ts`) forwards,
 * and every token is read defensively: several emit sites started writing
 * their named fields only recently, and rows stored before the backend
 * forwarded those fields keep the older payload, so a row missing a field
 * still reads as a whole sentence.
 */
export type LifecycleNotificationKind =
  // The community fan-outs and staff notices.
  | "community_new_post"
  | "community_announcement"
  | "community_resource_added"
  | "community_member_removed"
  | "community_archived"
  | "community_frozen"
  | "community_unfrozen"
  | "community_role_changed"
  | "community_ownership_transferred"
  | "community_owner_review_requested"
  | "community_tag_request_resolved"
  // A host's announcement to a gathering's guests.
  | "event_announcement"
  // The verdict on a forum thread its author sent to review.
  | "forum_thread_reviewed"
  // A member motion screened by platform staff, and the staff alert for one.
  | "governance_motion_approved"
  | "governance_motion_rejected"
  | "governance_motion_ready_for_review"
  // The LOC-19 approval queues plus the housing listing decision.
  | "group_listing_decided"
  | "landlord_suggestion_decided"
  | "landlord_intro_request_decided"
  | "reading_group_proposal_decided"
  | "housing_listing_decision"
  // Business directory claims and corrections.
  | "listing_claim_approved"
  | "listing_claim_declined"
  | "listing_edit_suggestion_accepted"
  | "venue_event_attachment"
  // PRD-433. A business listing the member suggested: live, a question for
  // them, sent back to review, or removed.
  | "listing_suggestion_live"
  | "listing_suggestion_needs_info"
  | "listing_suggestion_sent_back"
  | "listing_suggestion_removed"
  // Personas.
  | "persona_endorsed"
  | "persona_followed"
  | "subprofile_invite"
  | "subprofile_co_owner_joined"
  | "subprofile_deleted"
  | "subprofile_member_removed"
  // Funding & Grants (P3). A saved open call is about to close (stage `7d` or
  // `1d`), or its deadline moved. System-driven, no actor; the payload carries
  // `threadSlug`, `threadTitle`, `deadline` and, for the reminder, `stage`.
  | "funding_deadline_soon"
  | "funding_deadline_changed";

/**
 * Which tab each of these kinds files under, following the neighbours already
 * in `KIND_CATEGORY`: activity inside a community or a persona is
 * "community", news about a gathering is "events", and the platform's word on
 * something the member submitted (or duty mail for staff) is "platform".
 */
export const LIFECYCLE_KIND_CATEGORY: Record<
  LifecycleNotificationKind,
  NotifType
> = {
  community_new_post: "community",
  community_announcement: "community",
  community_resource_added: "community",
  community_member_removed: "community",
  community_archived: "community",
  // Staff notices about their own community's state, the same tab as the
  // space-request decisions.
  community_frozen: "community",
  community_unfrozen: "community",
  community_role_changed: "community",
  community_ownership_transferred: "community",
  // Staff duty mail that deep-links into a console, the same tab as
  // community_report_filed.
  community_owner_review_requested: "platform",
  community_tag_request_resolved: "community",
  event_announcement: "events",
  // A gathering listed at the member's venue is gathering news.
  venue_event_attachment: "events",
  forum_thread_reviewed: "platform",
  governance_motion_approved: "platform",
  governance_motion_rejected: "platform",
  governance_motion_ready_for_review: "platform",
  group_listing_decided: "platform",
  landlord_suggestion_decided: "platform",
  landlord_intro_request_decided: "platform",
  reading_group_proposal_decided: "platform",
  housing_listing_decision: "platform",
  listing_claim_approved: "platform",
  listing_claim_declined: "platform",
  listing_edit_suggestion_accepted: "platform",
  // The platform's word on a listing the member suggested, the same tab as
  // listing_approved.
  listing_suggestion_live: "platform",
  listing_suggestion_needs_info: "platform",
  listing_suggestion_sent_back: "platform",
  listing_suggestion_removed: "platform",
  // Persona activity, the same tab as subprofile_credit/persona_update.
  persona_endorsed: "community",
  persona_followed: "community",
  subprofile_invite: "community",
  subprofile_co_owner_joined: "community",
  subprofile_deleted: "community",
  subprofile_member_removed: "community",
  // A saved call's deadline news, the tab housing_listing_expiring uses.
  funding_deadline_soon: "platform",
  funding_deadline_changed: "platform",
};

export function isLifecycleKind(
  type: string,
): type is LifecycleNotificationKind {
  return Object.prototype.hasOwnProperty.call(LIFECYCLE_KIND_CATEGORY, type);
}

/**
 * The payload field each outcome-bearing kind branches its copy on, and the
 * closed set of values that have their own sentence. A value outside the set
 * (or a missing field) keeps the flat `type.<kind>.*` copy, the same one-step
 * degradation `volunteerApplicationDecidedKeyFor` and its siblings use.
 */
const OUTCOME_FIELDS: Partial<
  Record<LifecycleNotificationKind, { field: string; values: string[] }>
> = {
  forum_thread_reviewed: {
    field: "decision",
    values: ["approved", "rejected"],
  },
  // `hidden` (PRD-463) is the post-publication takedown on
  // /admin/housing-groups; un-hiding sends `live` again.
  group_listing_decided: {
    field: "decision",
    values: ["live", "question", "declined", "hidden"],
  },
  landlord_suggestion_decided: {
    field: "decision",
    values: ["live", "review", "removed"],
  },
  landlord_intro_request_decided: {
    field: "decision",
    values: ["accepted", "declined"],
  },
  reading_group_proposal_decided: {
    field: "decision",
    values: ["approved", "declined"],
  },
  housing_listing_decision: {
    field: "decision",
    values: ["approve", "request_changes", "reject", "take_down"],
  },
  community_role_changed: {
    field: "role",
    values: ["owner", "co_owner", "mod", "member"],
  },
  funding_deadline_soon: { field: "stage", values: ["7d", "1d"] },
};

function payloadString(payload: unknown, field: string): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const value = (payload as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/**
 * The kinds whose sentence ends on a named thing ("…: {title}."). A row with
 * no value for that field reads a whole sentence of its own, written without
 * the name, so no fallback phrase ever has to stand in at the end of one.
 */
const NO_VALUE_VARIANTS: Partial<
  Record<LifecycleNotificationKind, { field: string; variant: string }>
> = {
  community_resource_added: { field: "title", variant: "untitled" },
  community_tag_request_resolved: { field: "label", variant: "unlabelled" },
  venue_event_attachment: { field: "eventTitle", variant: "untitled" },
};

/**
 * The mirror image of `NO_VALUE_VARIANTS`: kinds whose original sentence
 * names nothing, and whose payload gained a name on the backend later. A row
 * carrying the field reads the `.<variant>` sentence that names it; a row
 * stored before the backend forwarded the field keeps the original flat
 * sentence.
 */
const NAMED_VARIANTS: Partial<
  Record<LifecycleNotificationKind, { field: string; variant: string }>
> = {
  persona_endorsed: { field: "subprofileName", variant: "named" },
  persona_followed: { field: "subprofileName", variant: "named" },
  governance_motion_approved: { field: "title", variant: "titled" },
  governance_motion_rejected: { field: "title", variant: "titled" },
  governance_motion_ready_for_review: { field: "title", variant: "titled" },
  listing_claim_approved: { field: "listingName", variant: "named" },
  listing_claim_declined: { field: "listingName", variant: "named" },
};

/**
 * The catalog subkey one of these kinds (or `event_reminder`) reads its copy
 * from. Any other type passes through unchanged.
 *
 * `event_reminder` is here for PRD-404: the backend now writes the
 * gathering's `eventTitle`, and a row that carries it names the gathering
 * (`event_reminder.titled`). Rows written before that change carry no title
 * and keep the original sentence.
 */
export function lifecycleKeyFor(type: string, payload: unknown): string {
  if (type === "event_reminder") {
    return payloadString(payload, "eventTitle")
      ? "event_reminder.titled"
      : "event_reminder";
  }
  if (!isLifecycleKind(type)) return type;
  // The incoming owner gets their own sentence; everyone else, and every
  // row stored before `youAreNowOwner` reached the client, keeps the neutral
  // "changed hands" one.
  if (type === "community_ownership_transferred") {
    const isYou =
      (payload as { youAreNowOwner?: unknown } | null)?.youAreNowOwner === true;
    return isYou ? `${type}.you` : type;
  }
  const named = NAMED_VARIANTS[type];
  if (named) {
    return payloadString(payload, named.field)
      ? `${type}.${named.variant}`
      : type;
  }
  const noValue = NO_VALUE_VARIANTS[type];
  if (noValue) {
    return payloadString(payload, noValue.field)
      ? type
      : `${type}.${noValue.variant}`;
  }
  const outcome = OUTCOME_FIELDS[type];
  if (!outcome) return type;
  const value = payloadString(payload, outcome.field);
  return value && outcome.values.includes(value) ? `${type}.${value}` : type;
}

/**
 * The payload tokens each kind's copy interpolates. Each one is resolved to
 * the payload's own value when it is a non-empty string, or else to
 * `type.<kind>.<token>Fallback`, so no row ever shows a bare `{token}`. The
 * three fields in `NO_VALUE_VARIANTS` are absent here: a row missing one reads
 * its own variant sentence, which never interpolates that field.
 *
 * The moderator's words to the member (`reason`, `reviewNote`, a rejected
 * motion's `note`) are absent too: they travel on the row's own `reason`
 * field (see `notificationReason.ts`), and every `.meta` of these kinds is
 * the kind's short label (PRD-402).
 */
const TOKEN_FIELDS: Partial<Record<LifecycleNotificationKind, string[]>> = {
  community_new_post: ["communityName"],
  community_announcement: ["communityName"],
  community_resource_added: ["communityName"],
  community_member_removed: ["communityName"],
  community_archived: ["communityName"],
  community_frozen: ["communityName"],
  community_unfrozen: ["communityName"],
  community_role_changed: ["communityName"],
  community_ownership_transferred: ["communityName"],
  community_owner_review_requested: ["communityName"],
  // The gathering's title sits mid-sentence in both `.text` and
  // `.textNamed`, so a row stored before the backend forwarded the title
  // reads "one of your gatherings" there.
  event_announcement: ["title"],
  forum_thread_reviewed: ["title"],
  group_listing_decided: ["listingTitle", "groupName"],
  landlord_suggestion_decided: ["landlordName"],
  landlord_intro_request_decided: ["landlordName"],
  reading_group_proposal_decided: ["book"],
  housing_listing_decision: ["title"],
  venue_event_attachment: ["listingName"],
  // PRD-433. The business's public name sits mid-sentence in every one of
  // these, so a row missing it reads "the place you suggested" there.
  listing_suggestion_live: ["listingName"],
  listing_suggestion_needs_info: ["listingName"],
  listing_suggestion_sent_back: ["listingName"],
  listing_suggestion_removed: ["listingName"],
  subprofile_invite: ["subprofileName"],
  subprofile_co_owner_joined: ["subprofileName"],
  subprofile_deleted: ["subprofileName"],
  subprofile_member_removed: ["subprofileName"],
  funding_deadline_soon: ["threadTitle"],
  funding_deadline_changed: ["threadTitle"],
};

/**
 * The business-listing fields a member can suggest a correction to, mirroring
 * `EDIT_SUGGESTION_FIELDS` in the backend's
 * `src/listings/dto/create-edit-suggestion.dto.ts`. `other` is absent on
 * purpose: it names no field, so it reads as the generic fallback phrase.
 */
const EDIT_SUGGESTION_FIELDS = new Set<string>([
  "hours",
  "address",
  "phone",
  "website",
  "description",
]);

/**
 * Overwrites, on `tokens`, every payload value these kinds interpolate with
 * its defensively resolved form (see `TOKEN_FIELDS`). A no-op for any other
 * type, so `formatNotification` can call it unconditionally.
 */
export function applyLifecycleTokens(
  type: string,
  payload: unknown,
  tokens: TranslateOptions,
  t: TFunction,
): void {
  if (!isLifecycleKind(type)) return;
  for (const field of TOKEN_FIELDS[type] ?? []) {
    tokens[field] =
      payloadString(payload, field) ??
      t(`notifications:type.${type}.${field}Fallback`);
  }
  if (type === "listing_edit_suggestion_accepted") {
    // `field` arrives as a machine value (`hours`); the copy needs the
    // member-facing name of that part of their listing.
    const field = payloadString(payload, "field");
    tokens.field =
      field && EDIT_SUGGESTION_FIELDS.has(field)
        ? t(
            `notifications:type.listing_edit_suggestion_accepted.field.${field}`,
          )
        : t(
            "notifications:type.listing_edit_suggestion_accepted.fieldFallback",
          );
  }
}

/**
 * The deadline a funding notification names, as a Lisbon date and time: the
 * reminders run on Lisbon time, and the facts panel shows the same clock. A
 * row with no readable deadline, or rendered without formatters, reads the
 * kind's own fallback phrase.
 */
export function fundingDeadlineToken(
  type: string,
  payload: unknown,
  t: TFunction,
  fmt?: Formatters,
): string {
  const deadline = payloadString(payload, "deadline");
  if (!fmt || !deadline || Number.isNaN(Date.parse(deadline))) {
    return t(`notifications:type.${type}.dateFallback`);
  }
  return formatLisbonDeadline(fmt, deadline);
}

/**
 * The open-calls topic's name in the reader's language, for a
 * `topic_new_post` row about it; null for every other row.
 */
export function openCallsTopicLabel(
  type: string,
  payload: unknown,
  t: TFunction,
): string | null {
  if (type !== "topic_new_post") return null;
  return payloadString(payload, "topicSlug") === OPEN_CALLS_TOPIC_TAG
    ? t("notifications:type.topic_new_post.openCallsLabel")
    : null;
}
