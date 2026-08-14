import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import type { NotifType } from "../notifications.types";

/**
 * The notification kinds the backend's `notifications_type_enum` can serve
 * (`src/notifications/entities/notification.entity.ts`). This mirrors a backend
 * enum across a repo boundary with no mechanical link, so treat it as a
 * best-effort hint, never an exhaustive guarantee — see `formatNotification`.
 */
export type NotificationKind =
  | "connection_request"
  | "connection_accepted"
  | "vouch_received"
  | "promoted_to_member"
  // `new_message` is intentionally NOT listed: a new-DM alert is surfaced only
  // by the message-icon unread badge and push, never in the notifications
  // centre. A `new_message` row from the API is treated as an unknown kind and
  // dropped upstream (see `useNotifications`) so it never renders here.
  | "event_invite"
  | "event_reminder"
  | "waitlist_promoted"
  | "event_cancelled"
  | "introduction_made"
  | "mention"
  | "forum_reply"
  // Platform-wide coverage sweep (mirrors the backend `notifications_type_enum`
  // additions in `AddMissingNotificationTypes1785004000000`).
  | "event_rsvp"
  | "community_reply"
  | "forum_thread_reply"
  | "join_request_received"
  | "join_request_approved"
  | "join_request_declined"
  | "job_application"
  | "listing_approved"
  | "report_resolved"
  | "appeal_resolved"
  | "invite_accepted"
  | "listing_review"
  | "roadmap_status"
  // Sent to the member a moderation action lands on (mirrors the backend
  // `notifications_type_enum` value added in
  // `AddModerationOutcomeNotificationType1785900000000`).
  | "moderation_outcome"
  // Sent to an event's RSVP'd + invited members when the organizer makes a
  // material edit — start time or location (mirrors the backend
  // `notifications_type_enum` value added in
  // `AddEventUpdatedNotificationType1786001600000`).
  | "event_updated"
  // Sent to a member the first time a save newly credits their handle as a
  // collaborator on someone else's persona item (mirrors the backend
  // `notifications_type_enum` value added in
  // `AddSubprofileCreditNotificationType1786700100000`, emitted from
  // `SubprofilesService.replaceSection`'s collaborator diff — Personas
  // discovery Phase 5, Decision §3). Payload: `{ subprofileName,
  // subprofileSlugOrHandle, itemTitle, deepLink }`. Carries no `actorId`
  // (only used for the block/mute gate at emit time), so the row never
  // resolves a `dto.actor` and stays icon-based. The first live kind whose
  // `.actions` the adapter populates — see `notificationDtoToView`.
  | "subprofile_credit"
  // Sent to a safe space's listing owner when a member vouches for it (mirrors
  // the backend `notifications_type_enum` value added in
  // `AddSafeSpaceVouchNotificationType1787500000000`, emitted from
  // `SafeSpaceVouchesService.createVouch`). Carries the voucher (`voucherId`)
  // as the actor — omitted for an anonymous vouch, which then reads as
  // "Someone" — plus `spaceName`/`spaceSlug` on the payload.
  | "safe_space_vouch"
  // Sent to a member when a NEW housing listing goes live that matches one of
  // their saved searches with alerts on (mirrors the backend
  // `notifications_type_enum` value added in
  // `AddHousingListingMatchNotificationType1788300200000`, emitted from
  // `HousingSavedSearchAlertsListener`). System-driven — no actor — with
  // `title`/`area`/`slug` on the payload for the copy + deep link.
  | "housing_listing_match"
  // Sent to the submitter of a governance concern when an admin resolves or
  // dismisses it (mirrors the backend `notifications_type_enum` value added in
  // `AddConcernUpdateNotificationType1788600000000`, emitted from
  // `IntakesService.updateStatus`). System-driven, no actor, with
  // `status` (`resolved`/`dismissed`) on the payload selecting the copy.
  | "concern_update"
  // Sent to a member on a change to their verification standing (mirrors the
  // backend `notifications_type_enum` value added in
  // `AddVerificationUpdateNotificationType1789100100000`). System-driven, no
  // actor. THREE distinct payload shapes share this one kind:
  //  - an admin override (`VerificationService.override`): `{ fromLevel,
  //    toLevel }` — no `decision` field. The copy names only the new level
  //    (`toLevel`), via its own inline label set
  //    (`type.verification_update.level.<level>`).
  //  - a request approved (`VerificationService.decideRequest`):
  //    `{ requestedLevel, decision: 'approved' }` — no `toLevel`; the level
  //    label sources from `requestedLevel` instead.
  //  - a request rejected (`VerificationService.decideRequest`):
  //    `{ requestedLevel, decision: 'rejected', reason }` — no level change
  //    to name; `reason` surfaces as the meta line instead.
  | "verification_update"
  // Sent to a member when the XP/badge awarding engine credits them across a
  // level threshold (mirrors the backend `notifications_type_enum` value
  // added in `AddRecognitionNotificationTypes1789600000000`). System-driven,
  // no actor. Payload carries `{ level, name }`; both interpolate straight
  // into the flat `type.xp_level_up.text` copy via `interpolationTokens`
  // (no key branching needed, unlike `moderation_outcome`/`concern_update`).
  | "xp_level_up"
  // Sent to a member when the XP/badge awarding engine grants them a badge
  // (mirrors the backend `notifications_type_enum` value added in
  // `AddRecognitionNotificationTypes1789600000000`). System-driven, no
  // actor. Payload carries `{ badgeName }`, interpolated the same way as
  // `xp_level_up` above.
  | "badge_earned";

/** The i18n key root used when `type` is one we don't know how to render. */
const FALLBACK_KEY = "unknown";

/**
 * Which UI tab/icon each backend kind belongs to. The backend's ten semantic
 * kinds collapse into the four categories the prototype's tabs filter on.
 */
const KIND_CATEGORY: Record<NotificationKind, NotifType> = {
  connection_request: "community",
  connection_accepted: "community",
  vouch_received: "community",
  introduction_made: "community",
  mention: "community",
  forum_reply: "community",
  promoted_to_member: "platform",
  event_invite: "events",
  event_reminder: "events",
  waitlist_promoted: "events",
  event_cancelled: "events",
  event_updated: "events",
  event_rsvp: "events",
  community_reply: "community",
  forum_thread_reply: "community",
  join_request_received: "community",
  join_request_approved: "community",
  join_request_declined: "community",
  invite_accepted: "community",
  listing_review: "community",
  job_application: "platform",
  listing_approved: "platform",
  report_resolved: "platform",
  appeal_resolved: "platform",
  roadmap_status: "platform",
  moderation_outcome: "platform",
  // A fellow member crediting you is community activity, same tab as
  // vouch_received/introduction_made.
  subprofile_credit: "community",
  // A member vouching for your safe space is community activity, same tab as
  // vouch_received.
  safe_space_vouch: "community",
  // A saved-search match is the platform telling you about a new home — a
  // platform notification, like listing_approved.
  housing_listing_match: "platform",
  // An outcome on a concern you raised is the platform's word — platform tab.
  concern_update: "platform",
  // An admin manually adjusting your verification standing is the platform's
  // word, same tab as moderation_outcome/concern_update.
  verification_update: "platform",
  // The awarding engine crediting XP/badges is the platform's word on your
  // own standing, same tab as verification_update.
  xp_level_up: "platform",
  badge_earned: "platform",
};

/** Every kind we have copy for. Anything else routes to the fallback. */
const KNOWN_KINDS = Object.keys(KIND_CATEGORY) as NotificationKind[];

function isKnownKind(type: string): type is NotificationKind {
  return (KNOWN_KINDS as string[]).includes(type);
}

export interface FormattedNotification {
  /** The row's display text, already translated into the active language. */
  text: string;
  /** The row's sub-line ("Private message", "Gathering invitation", …). */
  meta: string;
  /** The tab/icon category this kind renders under. */
  category: NotifType;
  /** The recognised backend kind, or `null` for an unknown/future type. Lets
   *  callers build the personalized `type.<kind>.textNamed` variant without
   *  re-deriving the type→kind mapping that lives here. */
  kind: NotificationKind | null;
}

/**
 * Narrow a raw jsonb payload to the scalar entries that are safe to feed
 * `t()` as `{token}` interpolation values.
 *
 * The backend's payloads currently carry only opaque IDs (`senderId`,
 * `eventId`, …) and no display names, so today's catalog strings deliberately
 * contain no tokens and this yields nothing. It is the forward seam: if the
 * backend later enriches a payload with, say, `senderName`, the catalog string
 * can start using `{senderName}` with no change here.
 */
function interpolationTokens(payload: unknown): TranslateOptions {
  if (typeof payload !== "object" || payload === null) return {};
  const tokens: TranslateOptions = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" || typeof value === "number") {
      tokens[key] = value;
    }
  }
  return tokens;
}

/**
 * Resolve the i18n subkey a `mention` notification's copy lives under.
 *
 * `mention` rows carry `payload.entityKind` (`member | community | business |
 * event | thread`, written by the backend) identifying what was actually
 * @-mentioned. The flat `mention.*` keys stay the **member** variant — both
 * because that's the plain "you were mentioned" case and for backward
 * compatibility with rows created before `entityKind` existed (no field →
 * falls through to `mention`). Any other kind branches to its own
 * `mention.<entityKind>.*` keys. Non-`mention` types pass through unchanged.
 */
function mentionKeyFor(type: string, payload: unknown): string {
  if (type !== "mention") return type;
  const entityKind = (payload as { entityKind?: string } | null)?.entityKind;
  return entityKind && entityKind !== "member"
    ? `mention.${entityKind}`
    : "mention";
}

/**
 * Resolve the i18n subkey a `moderation_outcome` notification's copy lives
 * under. The row carries `payload.action` (`warn | suspend | ban`, written by
 * the backend) — each gets its own headline ("You've received a warning" vs
 * "Your account has been suspended"), so the key branches to
 * `moderation_outcome.<action>`. An unknown/missing action falls back to the
 * flat `moderation_outcome.*` copy. Non-moderation types pass through unchanged.
 */
function moderationKeyFor(type: string, payload: unknown): string {
  if (type !== "moderation_outcome") return type;
  const action = (payload as { action?: string } | null)?.action;
  return action === "warn" || action === "suspend" || action === "ban"
    ? `moderation_outcome.${action}`
    : "moderation_outcome";
}

/**
 * Resolve the i18n subkey a `concern_update` notification's copy lives under.
 * The row carries `payload.status` (`resolved | dismissed`, written by the
 * backend when an admin triages the concern) — each gets its own headline
 * ("Your concern was resolved" vs "…was reviewed and closed"), so the key
 * branches to `concern_update.<status>`. An unknown/missing status falls back
 * to the flat `concern_update.*` copy. Non-concern types pass through unchanged.
 */
function concernUpdateKeyFor(type: string, payload: unknown): string {
  if (type !== "concern_update") return type;
  const status = (payload as { status?: string } | null)?.status;
  return status === "resolved" || status === "dismissed"
    ? `concern_update.${status}`
    : "concern_update";
}

/**
 * Resolve the i18n subkey an `event_updated` notification's copy lives under.
 * The row carries `payload.changes` (a `string[]` of what materially changed,
 * written by the backend — `startAt` and/or `location`). A change to only the
 * time or only the place gets its own precise headline
 * (`event_updated.time` / `event_updated.location`); a change to both — or an
 * unrecognised/missing `changes` list — falls back to the generic
 * `event_updated.*` copy. Non-event-updated types pass through unchanged.
 */
function eventUpdatedKeyFor(type: string, payload: unknown): string {
  if (type !== "event_updated") return type;
  const changes = (payload as { changes?: unknown } | null)?.changes;
  if (!Array.isArray(changes)) return "event_updated";
  const changedTime = changes.includes("startAt");
  const changedLocation = changes.includes("location");
  if (changedTime && !changedLocation) return "event_updated.time";
  if (changedLocation && !changedTime) return "event_updated.location";
  return "event_updated";
}

/**
 * Resolve the i18n subkey a `verification_update` notification's copy lives
 * under. The row carries `payload.decision` (`approved | rejected`, written
 * by `VerificationService.decideRequest`) only for the two request-decision
 * shapes — an admin override never sets it. `approved`/`rejected` each get
 * their own copy (`verification_update.approved` / `.rejected`); a missing
 * `decision` (the override shape, or an unrecognised future value) falls
 * back to the flat `verification_update.*` copy — the EXISTING
 * `toLevel`-based override rendering, unchanged. Non-`verification_update`
 * types pass through unchanged.
 */
function verificationUpdateKeyFor(type: string, payload: unknown): string {
  if (type !== "verification_update") return type;
  const decision = (payload as { decision?: string } | null)?.decision;
  return decision === "approved" || decision === "rejected"
    ? `verification_update.${decision}`
    : "verification_update";
}

/**
 * Resolves the `{level}` token a `verification_update` notification's copy
 * interpolates — the level the member was moved TO. An admin override
 * carries this as `payload.toLevel` (written by `VerificationService.
 * override`); a request approval carries no `toLevel` at all, only
 * `payload.requestedLevel` (written by `VerificationService.decideRequest`)
 * — since an approval always grants the level that was requested, the same
 * token doubles for both, preferring `toLevel` when present. Its own small
 * label set lives inline under `type.verification_update.level.*` — the
 * ladder only has four rungs — rather than reaching into the admin
 * console's `admin:verifications.level.<level>` keys: those live in a
 * separate, lazily-chunked namespace an ordinary (non-admin) member's session
 * never otherwise loads, and every other payload-driven kind in this file
 * (`moderation_outcome`, `concern_update`, …) already keeps its label set
 * self-contained in this same `notifications` namespace. A missing/
 * unrecognised level (a future ladder rung an old client doesn't know) falls
 * back to a generic phrase so the row never interpolates a raw enum value
 * like `id_verified`. Never called for the `rejected` decision, which names
 * no level. Non-`verification_update` types are never called with this.
 */
function verificationLevelToken(payload: unknown, t: TFunction): string {
  const record = payload as
    | { toLevel?: string; requestedLevel?: string }
    | null;
  const level = record?.toLevel ?? record?.requestedLevel;
  const isKnownLevel =
    level === "none" ||
    level === "email" ||
    level === "phone" ||
    level === "id_verified";
  return isKnownLevel
    ? t(`notifications:type.verification_update.level.${level}`)
    : t("notifications:type.verification_update.levelFallback");
}

/**
 * Resolves the `{reason}` token a rejected `verification_update` notification
 * interpolates — the admin's reason for declining the request
 * (`payload.reason`, written by `VerificationService.decideRequest`; the
 * backend requires a non-empty reason to reject, but this reads defensively
 * like every other payload-driven helper in this file, in case an older row
 * predates that guarantee or the field arrives as something unexpected). A
 * missing/blank reason falls back to a generic phrase rather than
 * interpolating an empty or literal-unresolved token. Only called for the
 * `rejected` decision.
 */
function verificationReasonToken(payload: unknown, t: TFunction): string {
  const reason = (payload as { reason?: string } | null)?.reason;
  return typeof reason === "string" && reason.trim() !== ""
    ? reason
    : t("notifications:type.verification_update.rejected.reasonFallback");
}

/**
 * Render a backend notification (`type` + structured `payload`) into display
 * text, through i18n keys rather than hardcoded English — this is why the
 * formatting lives on the frontend at all: it keeps the API language-neutral
 * so Portuguese stays possible.
 *
 * An unknown or future `type` resolves to a safe generic fallback: never a
 * blank row, never a throw. That matters because the backend's enum can grow a
 * member (or an old client can meet a new server) without a frontend deploy.
 */
export function formatNotification(
  type: string,
  payload: unknown,
  t: TFunction,
): FormattedNotification {
  const known = isKnownKind(type);
  let key: string;
  if (!known) {
    key = FALLBACK_KEY;
  } else if (type === "moderation_outcome") {
    key = moderationKeyFor(type, payload);
  } else if (type === "event_updated") {
    key = eventUpdatedKeyFor(type, payload);
  } else if (type === "concern_update") {
    key = concernUpdateKeyFor(type, payload);
  } else if (type === "verification_update") {
    key = verificationUpdateKeyFor(type, payload);
  } else {
    // `mentionKeyFor` passes every non-`mention` type through unchanged.
    key = mentionKeyFor(type, payload);
  }
  const tokens = interpolationTokens(payload);
  if (type === "verification_update") {
    const decision = (payload as { decision?: string } | null)?.decision;
    if (decision === "rejected") {
      // Overrides the raw `reason` string `interpolationTokens` would already
      // have copied through with the same value, defensively re-resolved so a
      // missing/blank reason falls back to a generic phrase instead of
      // interpolating an empty string.
      tokens.reason = verificationReasonToken(payload, t);
    } else {
      // Overrides the raw `toLevel`/`fromLevel`/`requestedLevel` enum values
      // `interpolationTokens` would otherwise copy through verbatim (e.g.
      // `id_verified`) with the translated, member-facing label the catalog
      // string's `{level}` expects. Covers both the override shape
      // (`decision` absent) and the `approved` decision.
      tokens.level = verificationLevelToken(payload, t);
    }
  }
  return {
    text: t(`notifications:type.${key}.text`, tokens),
    meta: t(`notifications:type.${key}.meta`, tokens),
    category: known ? KIND_CATEGORY[type] : "platform",
    kind: known ? type : null,
  };
}
