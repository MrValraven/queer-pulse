import type { Formatters } from "../../../shared/i18n/format";
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
  // Sent to a member barred from one community. System-toned: the payload
  // carries no actor, so the row never names the moderator who acted. It does
  // carry the terms, `reason`, `expiresAt` (null for a permanent bar) and
  // `ruleText` (the community's own house rule, snapshotted at the moment of
  // the decision), because this is the only channel the member has. QueerPulse
  // sends no email, and there is no way to message a community's moderators.
  | "community_banned"
  | "forum_thread_reply"
  // Sent to a member who follows a topic (`topic_follows`) when a new post
  // lands on it — a forum thread created with a tag matching that topic
  // (mirrors the backend `notifications_type_enum` value added in
  // `AddTopicNewPostNotificationType1792400100000`, emitted from
  // `TopicFollowNotificationsListener`). Carries an actor (the poster) —
  // `payload.actorId` — plus `topicSlug`/`topicLabel`/`source: 'forum'`/
  // `threadSlug`/`threadTitle`; `source: 'forum'` reuses the SAME deep-link
  // shape a forum `@mention` already writes, so `sourceHrefFromPayload`
  // resolves it with no new branch.
  | "topic_new_post"
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
  // Sent to the invitee when a host/co-host invites them to co-host a
  // gathering, the real invite-to-accept flow (mirrors the backend
  // `notifications_type_enum` value added in
  // `AddEventCohostInviteNotificationType1790500000000`, SDD 2026-08-18
  // "cohost invite flow").
  | "event_cohost_invite"
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
  // Sent to the submitter of any NON-concern intake form when staff reach a
  // terminal decision on it (mirrors the backend `notifications_type_enum`
  // value added in `AddIntakeAndDsarNotificationTypes1794660000000`, emitted
  // from `IntakesService.notifySubmitter`). Every one of these used to arrive
  // as `concern_update`, so a member who submitted a playlist to Culture was
  // told "The concern you raised has been reviewed" — wrong about what they
  // sent, and unsettling if they had never raised a concern at all.
  //
  // System-driven, no actor. Payload carries `{ source: "intake", kind,
  // status }`: `status` (`resolved`/`dismissed`) selects the copy, and `kind`
  // is the FORM's own name from the backend's closed `INTAKE_KINDS` list,
  // translated here into a member-facing phrase ("your playlist submission")
  // by `intakeFormToken`. No deep link: there is no member-facing page for an
  // intake submission, and an honest missing link beats one that would ask
  // them to fill the form in again.
  | "intake_reviewed"
  // Sent to the member who filed a GDPR data-subject request when an operator
  // reaches a terminal decision on it (same migration, emitted from
  // `AdminDsarService.updateStatus`). This too used to arrive as
  // `concern_update`, so exercising a statutory data right was reported back as
  // a resolved "concern".
  //
  // System-driven, no actor. Payload carries `{ source: "account_dsar",
  // status, reference }`: `status` is `resolved` or `rejected` (each with its
  // own copy — a refusal is not a resolution) and `reference` is the member's
  // own case number, interpolated into the copy so the row is matchable to
  // what they filed. Deep-links to the data-request page, where their
  // reference history is listed.
  | "dsar_resolved"
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
  | "badge_earned"
  // Sent to a magazine writer applicant when an admin approves or declines
  // their application (mirrors the backend `notifications_type_enum`
  // additions in `AddWriterApplicationNotificationTypes1790700000000`).
  // System-driven, no actor. Flat copy — no payload-driven key branching,
  // like `xp_level_up`/`badge_earned`.
  | "writer_application_approved"
  | "writer_application_declined"
  // Sent to the member who submitted a story to the magazine when staff decide
  // on it (mirrors the backend `notifications_type_enum` addition in
  // `AddStorySubmissionDecision1794833100000`, emitted from
  // `AdminStorySubmissionsService.decide`). Before it existed, a submission sat
  // at "submitted" forever and the member heard nothing. System-driven, no
  // actor. Payload carries `decision` (`accepted | declined | commissioned`)
  // selecting the copy, plus `workingTitle` — the member's own headline —
  // interpolated via `interpolationTokens`. The decider's reply note is not on
  // the payload: it lives on the tracker card this row points at.
  | "story_submission_decided"
  // Sent to the poster when a member applies to their volunteer opportunity
  // (mirrors the backend `notifications_type_enum` value added in
  // `AddVolunteerApplicationNotificationTypes1790700000000`, emitted from
  // `VolunteeringService.signup`). Member-driven — carries `actorId` (the
  // applicant) — with `opportunitySlug` on the payload for the deep link.
  | "volunteer_application_received"
  // Sent to the applicant when the poster accepts or declines them (mirrors
  // the same migration, emitted from `VolunteeringService.decideSignup`).
  // System-driven, no actor — the platform telling you about your own
  // status, like `concern_update`. Payload carries `status`
  // (`accepted`/`declined`) selecting the copy, plus `opportunitySlug`.
  | "volunteer_application_decided"
  // Sent to the nominator when an admin approves or dismisses their Change
  // Makers nomination (mirrors the backend `notifications_type_enum`
  // additions in `AddChangemakerNominationTriage1792500100000`, COM-17:
  // nominations used to be a one-way black hole). System-driven, no actor.
  // Flat copy — no payload-driven key branching, like
  // `writer_application_approved`/`declined`. Payload carries
  // `{ nomineeName, reviewNote }`; `nomineeName` interpolates into the copy
  // via `interpolationTokens`.
  | "changemaker_nomination_approved"
  | "changemaker_nomination_dismissed"
  // Sent to a swap listing's owner when a member proposes an exchange against
  // it (mirrors the backend `notifications_type_enum` value added with the
  // barter module, emitted from `BarterService.createProposal`). Member-driven
  // — the proposer is resolved into the standard `actor` field. The payload
  // carries `barterListingId` and `listingOffer` ONLY: the proposal's own
  // message is deliberately dropped at the payload allowlist, because that
  // boundary does not carry member-authored text, so the copy never tries to
  // quote it. `listingOffer` is empty on a listing that only asks for
  // something, which is why `barterOfferToken` resolves it defensively.
  | "barter_proposal_received"
  // Sent to platform staff (`users.role` of `moderator`/`admin`) the moment a
  // member files a report, and to a community's owner/co-owners/mods when the
  // report is against a post or reply in their community (mirrors the backend
  // `notifications_type_enum` values added in
  // `AddReportFiledNotificationTypes1794600000000`, emitted from
  // `ReportNotificationsListener`). Before these existed, filing a report told
  // nobody anything, so the platform's 1-hour outing/doxxing SLA depended on a
  // staff member already having the queue open.
  //
  // System-driven, no actor: the bell never names who filed, anonymously or
  // not. Payload carries `severity` (`emergency | high | medium | low`),
  // `reasonCode`, `subjectType` and `reportId`, plus `communityName`/
  // `communitySlug` on the community variant. `severity === "emergency"`
  // branches BOTH the copy (`.emergency.*` keys) and the row's icon — that is
  // the outing/doxxing case the SLA is written for.
  | "report_filed"
  | "community_report_filed"
  // Sent to a member when their account is signed in to from a device they
  // have not used before (mirrors the backend `notifications_type_enum` value
  // added in `AddSecurityAlertsAndDeviceLabel1794610100000`, emitted from
  // `AuthService.issueTokens` via `SECURITY_NEW_SIGN_IN`). The first kind in
  // this list about the ACCOUNT rather than about the community.
  //
  // System-driven, no actor. Payload carries `{ source: "security",
  // deviceLabel, signedInAt, familyId }` — the coarse device name interpolates
  // into the copy as `{deviceLabel}` through `interpolationTokens`, and
  // `source: "security"` deep-links the row to /account/sessions, the one
  // place the member can end the session.
  | "security_new_sign_in"
  // The two account-lifecycle moments that used to end in silence (same
  // migration). NEITHER IS EMITTED YET — both belong to the backend's account
  // module — but the copy and the routing land now so wiring the emit is a
  // one-line backend change rather than a paired deploy.
  //
  // `account_export_ready` carries `{ source: "account_data" }` and links to
  // the data-export page. `account_deletion_final_warning` carries
  // `{ source: "account", daysRemaining }`, interpolated into its copy, and
  // links to the delete-account page where cancelling still lives.
  //
  // Both are IN-APP (plus push). QueerPulse sends no email, so no copy for
  // either may say one is on the way.
  | "account_export_ready"
  | "account_deletion_final_warning"
  // Sent to every active member when the desk ships a magazine issue (mirrors
  // the backend `notifications_type_enum` value added in
  // `AddMagazineIssuePublishedNotificationType1794714500000`, emitted from
  // `MagazinePieceService.shipIssue`). CON-05: this REPLACES the members'
  // email digest, which queued a message per newsletter subscriber and drained
  // it on a cron. QueerPulse sends no email, so no copy for this type may say
  // anything is on its way.
  //
  // System-driven, no actor. Payload carries `{ source: "magazine",
  // issueNumber, issueTitle }`; both fields interpolate into the copy through
  // `interpolationTokens`, and `source: "magazine"` + `issueNumber` deep-link
  // the row to that issue's page, where the desk's curated "In this issue"
  // panel is.
  | "magazine_issue_published";

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
  event_cohost_invite: "events",
  event_rsvp: "events",
  community_reply: "community",
  community_banned: "community",
  forum_thread_reply: "community",
  // A new post in a followed topic is community activity, same tab as
  // forum_thread_reply/community_reply.
  topic_new_post: "community",
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
  // An outcome on a form you submitted, or on a data request you filed, is the
  // platform's word on your own submission — same tab as concern_update.
  intake_reviewed: "platform",
  dsar_resolved: "platform",
  // An admin manually adjusting your verification standing is the platform's
  // word, same tab as moderation_outcome/concern_update.
  verification_update: "platform",
  // The awarding engine crediting XP/badges is the platform's word on your
  // own standing, same tab as verification_update.
  xp_level_up: "platform",
  badge_earned: "platform",
  // An admin's decision on a writer application is the platform's word on
  // your own submission — same tab as concern_update/moderation_outcome.
  writer_application_approved: "platform",
  writer_application_declined: "platform",
  // A decision on a story you sent the magazine is the platform's word on your
  // own submission — same tab as writer_application_approved/declined.
  story_submission_decided: "platform",
  // A volunteer application landing / being decided is the platform's word,
  // same tab as writer_application_approved/declined.
  volunteer_application_received: "platform",
  volunteer_application_decided: "platform",
  // An admin's decision on a Change Makers nomination is the platform's word
  // on your own submission — same tab as writer_application_approved/declined.
  changemaker_nomination_approved: "platform",
  changemaker_nomination_dismissed: "platform",
  // A proposal landing on one of your swap listings is board activity about
  // your own post, same tab as job_application/volunteer_application_received.
  barter_proposal_received: "platform",
  // A report landing is platform duty mail, same tab as moderation_outcome.
  // The community variant sits here too rather than under "community": it is
  // the platform handing a community's staff something to action, and it deep
  // -links into mod tools rather than into the community's own activity.
  report_filed: "platform",
  community_report_filed: "platform",
  // Account and security news is the platform's word about your own account,
  // same tab as moderation_outcome/verification_update. There is no separate
  // "security" tab and these three do not earn one: a member who is being told
  // their account was signed in to elsewhere needs the row to be findable, not
  // filed away behind a filter they have never used.
  security_new_sign_in: "platform",
  account_export_ready: "platform",
  account_deletion_final_warning: "platform",
  // A new issue is the magazine speaking to the whole membership — platform
  // tab, same as roadmap_status.
  magazine_issue_published: "platform",
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
  return action === "warn" ||
    action === "suspend" ||
    action === "ban" ||
    action === "restriction_lifted"
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
 * Resolve the i18n subkey an `intake_reviewed` notification's copy lives under.
 * The row carries `payload.status` (`resolved | dismissed`) — "we took it
 * forward" and "we are not taking it further" are different news and get
 * different headlines, so the key branches to `intake_reviewed.<status>`. An
 * unknown/missing status falls back to the flat `intake_reviewed.*` copy, which
 * says only that the submission was reviewed. Non-intake types pass through
 * unchanged.
 */
function intakeReviewedKeyFor(type: string, payload: unknown): string {
  if (type !== "intake_reviewed") return type;
  const status = (payload as { status?: string } | null)?.status;
  return status === "resolved" || status === "dismissed"
    ? `intake_reviewed.${status}`
    : "intake_reviewed";
}

/**
 * The closed set of intake form names the backend can put on `payload.kind`,
 * mirroring `INTAKE_KINDS` in `src/intakes/intake-kinds.ts`. `governance_concern`
 * is deliberately absent: that kind keeps the older `concern_update` type and
 * never reaches this renderer.
 *
 * A closed set rather than a free interpolation, for the same reason
 * `verification_update` translates its level enum: the raw value is a snake_case
 * identifier, and `culture_submit_playlist` is not a thing to show a member.
 */
const INTAKE_FORM_KINDS = new Set<string>([
  "grant",
  "suggest_edit",
  "sober_host",
  "panel_signup",
  "incubator_cohort",
  "incubator_mentor",
  "incubator_session",
  "culture_suggest_pick",
  "culture_post_project",
  "culture_submit_work",
  "culture_submit_playlist",
]);

/**
 * Resolves the `{form}` token an `intake_reviewed` notification interpolates:
 * the member-facing name of the form they actually filled in ("your playlist
 * submission"), translated from the backend's `payload.kind` identifier.
 *
 * This token is the entire point of the type. Before it, every one of these
 * rows read "The concern you raised has been reviewed", which named the wrong
 * thing for eleven of the twelve intake kinds. An unrecognised or missing kind
 * — a form added on the backend before this list learns about it — falls back
 * to a generic phrase rather than printing a raw identifier.
 */
function intakeFormToken(payload: unknown, t: TFunction): string {
  const kind = (payload as { kind?: string } | null)?.kind;
  return typeof kind === "string" && INTAKE_FORM_KINDS.has(kind)
    ? t(`notifications:type.intake_reviewed.form.${kind}`)
    : t("notifications:type.intake_reviewed.formFallback");
}

/**
 * Resolve the i18n subkey a `dsar_resolved` notification's copy lives under.
 * The row carries `payload.status` (`resolved | rejected`, the two terminal
 * states of a data-subject request). A refusal is not a resolution and must not
 * read as one, so each gets its own headline. An unknown/missing status falls
 * back to the flat `dsar_resolved.*` copy, which says only that a decision has
 * been reached. Non-DSAR types pass through unchanged.
 */
function dsarResolvedKeyFor(type: string, payload: unknown): string {
  if (type !== "dsar_resolved") return type;
  const status = (payload as { status?: string } | null)?.status;
  return status === "resolved" || status === "rejected"
    ? `dsar_resolved.${status}`
    : "dsar_resolved";
}

/**
 * Resolves the `{reference}` token a `dsar_resolved` notification interpolates:
 * the member's own case number, the same string the data-request page lists in
 * their history, and the only thing that tells one request from another.
 *
 * Read defensively like every other payload token here. The backend always
 * writes one, but a row from an older or future shape must not leave a literal
 * `{reference}` in the copy; it falls back to a phrase that stays grammatical
 * in the sentence's "Reference: …" slot.
 */
function dsarReferenceToken(payload: unknown, t: TFunction): string {
  const reference = (payload as { reference?: string } | null)?.reference;
  return typeof reference === "string" && reference.trim() !== ""
    ? reference
    : t("notifications:type.dsar_resolved.referenceFallback");
}

/**
 * Resolve the i18n subkey a `volunteer_application_decided` notification's
 * copy lives under. The row carries `payload.status` (`accepted | declined`,
 * written by the backend when a poster decides on an applicant) — each gets
 * its own headline, so the key branches to
 * `volunteer_application_decided.<status>`. An unknown/missing status falls
 * back to the flat `volunteer_application_decided.*` copy. Non-matching types
 * pass through unchanged.
 */
function volunteerApplicationDecidedKeyFor(
  type: string,
  payload: unknown,
): string {
  if (type !== "volunteer_application_decided") return type;
  const status = (payload as { status?: string } | null)?.status;
  return status === "accepted" || status === "declined"
    ? `volunteer_application_decided.${status}`
    : "volunteer_application_decided";
}

/**
 * Resolve the i18n subkey a `story_submission_decided` notification's copy
 * lives under. The row carries `payload.decision`
 * (`accepted | declined | commissioned`, written by the backend when staff
 * decide) — each gets its own headline, so the key branches to
 * `story_submission_decided.<decision>`. An unknown/missing decision falls
 * back to the flat `story_submission_decided.*` copy. Non-matching types pass
 * through unchanged.
 */
function storySubmissionDecidedKeyFor(type: string, payload: unknown): string {
  if (type !== "story_submission_decided") return type;
  const decision = (payload as { decision?: string } | null)?.decision;
  return decision === "accepted" ||
    decision === "declined" ||
    decision === "commissioned"
    ? `story_submission_decided.${decision}`
    : "story_submission_decided";
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
  const record = payload as {
    toLevel?: string;
    requestedLevel?: string;
  } | null;
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
 * Resolves the `{listingOffer}` token a `barter_proposal_received`
 * notification's META line interpolates — the swap the proposal landed on, as
 * its owner wrote it (`payload.listingOffer`).
 *
 * It lives in the meta rather than the headline because the personalized
 * `textNamed` variant is rendered by `NotificationItem` with `{name}` as its
 * only interpolation value; a second token there would print literally.
 *
 * A listing posted in `seeking` mode offers nothing, so `listingOffer` comes
 * through as an empty string: the token falls back to a generic phrase for the
 * post rather than leaving the meta trailing off after its separator. The
 * proposal's own message is never available here by design — the payload
 * allowlist drops member-authored text at that boundary — so there is nothing
 * else to name the swap by.
 */
function barterOfferToken(payload: unknown, t: TFunction): string {
  const offer = (payload as { listingOffer?: string } | null)?.listingOffer;
  return typeof offer === "string" && offer.trim() !== ""
    ? offer
    : t("notifications:type.barter_proposal_received.offerFallback");
}

/**
 * Resolve the i18n subkey a `report_filed` / `community_report_filed`
 * notification's copy lives under. The row carries `payload.severity`
 * (`emergency | high | medium | low`, derived server-side from the reason code
 * in `report-severity.ts`). Emergency is outing and doxxing, the two reasons
 * carrying a 1-hour SLA, and it gets its own urgent headline via
 * `<type>.emergency.*`. Every other severity falls through to the flat
 * `<type>.*` copy. Non-report types pass through unchanged.
 */
function reportFiledKeyFor(type: string, payload: unknown): string {
  if (type !== "report_filed" && type !== "community_report_filed") return type;
  const severity = (payload as { severity?: string } | null)?.severity;
  return severity === "emergency" ? `${type}.emergency` : type;
}

/**
 * Picks the copy for a community ban. A timed bar and a permanent one are
 * different facts about someone's life, so they get different sentences rather
 * than one hedged string, and a cited house rule adds a `.rule` variant so the
 * member can read the grounds instead of guessing at them.
 */
function communityBannedKeyFor(type: string, payload: unknown): string {
  if (type !== "community_banned") return type;
  const banned = payload as {
    expiresAt?: string | null;
    ruleText?: string | null;
  } | null;
  const term = banned?.expiresAt ? "timed" : "permanent";
  return banned?.ruleText ? `${type}.${term}.rule` : `${type}.${term}`;
}

/**
 * Resolves the `{when}` token a `security_new_sign_in` notification's copy
 * interpolates — the wall-clock time the sign-in happened.
 *
 * A sign-in alert is the one kind where the row's own "Aug 25" timestamp is
 * not enough: "was that me, at 3pm?" is exactly the question the member is
 * being asked to answer, and an alert that cannot say the hour cannot be
 * answered. `payload.signedInAt` is an ISO string written server-side, so it
 * is formatted HERE, in the member's language, rather than composed into a
 * sentence by a backend that has no language.
 *
 * Falls back to a generic phrase when `fmt` was not passed (the parameter is
 * optional so existing call sites keep working) or when the timestamp is
 * missing or unparseable, rather than interpolating a raw ISO string or the
 * word "Invalid Date" into a security alert.
 */
/**
 * Resolves the `{deviceLabel}` token a `security_new_sign_in` notification
 * interpolates — the coarse device name the backend stored at sign-in
 * ("Chrome on macOS").
 *
 * Read defensively like every other payload token here. The backend always
 * writes one (`deviceLabelFromUserAgent` never returns empty), but a row from a
 * future or older shape must not leave a literal `{deviceLabel}` sitting in a
 * security alert — the one row a member has to be able to read at a glance.
 */
function deviceLabelToken(payload: unknown, t: TFunction): string {
  const deviceLabel = (payload as { deviceLabel?: string } | null)?.deviceLabel;
  return typeof deviceLabel === "string" && deviceLabel.trim() !== ""
    ? deviceLabel
    : t("notifications:type.security_new_sign_in.deviceFallback");
}

/**
 * The date a community ban lifts, in the member's own language.
 *
 * `payload.expiresAt` is a server-written ISO string, and it is the single most
 * consequential word in the notification: it separates a week away from being
 * gone for good. Interpolating the raw ISO value would put "2026-09-02T14:00Z"
 * in front of somebody reading the worst message they will get from this
 * product, so it is formatted here, where the language is known. A missing or
 * unparseable value falls back to a phrase, which is also why the copy branches
 * on `expiresAt` before this runs: a ban that cannot state its end date is
 * shown as permanent rather than as a broken sentence.
 */
function banExpiryToken(
  payload: unknown,
  t: TFunction,
  fmt?: Formatters,
): string {
  const expiresAt = (payload as { expiresAt?: string | null } | null)
    ?.expiresAt;
  if (!fmt || typeof expiresAt !== "string") {
    return t("notifications:type.community_banned.whenFallback");
  }
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return t("notifications:type.community_banned.whenFallback");
  }
  return fmt.date(date, { day: "numeric", month: "short", year: "numeric" });
}

function signInTimeToken(
  payload: unknown,
  t: TFunction,
  fmt?: Formatters,
): string {
  const signedInAt = (payload as { signedInAt?: string } | null)?.signedInAt;
  if (!fmt || typeof signedInAt !== "string") {
    return t("notifications:type.security_new_sign_in.whenFallback");
  }
  const date = new Date(signedInAt);
  if (Number.isNaN(date.getTime())) {
    return t("notifications:type.security_new_sign_in.whenFallback");
  }
  return `${fmt.date(date, { day: "numeric", month: "short" })}, ${fmt.time(date)}`;
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
  /**
   * Optional, and optional on purpose: only `security_new_sign_in` needs a
   * locale-bound clock, and every other call site predates it. A caller that
   * omits it gets the generic "recently" phrasing rather than a broken string.
   */
  fmt?: Formatters,
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
  } else if (type === "intake_reviewed") {
    key = intakeReviewedKeyFor(type, payload);
  } else if (type === "dsar_resolved") {
    key = dsarResolvedKeyFor(type, payload);
  } else if (type === "verification_update") {
    key = verificationUpdateKeyFor(type, payload);
  } else if (type === "volunteer_application_decided") {
    key = volunteerApplicationDecidedKeyFor(type, payload);
  } else if (type === "story_submission_decided") {
    key = storySubmissionDecidedKeyFor(type, payload);
  } else if (type === "report_filed" || type === "community_report_filed") {
    key = reportFiledKeyFor(type, payload);
  } else if (type === "community_banned") {
    key = communityBannedKeyFor(type, payload);
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
  if (type === "account_deletion_final_warning") {
    // The copy is pluralised ("in 1 day" / "in 3 days"), and CLDR selection in
    // `translate.ts` keys off `count` specifically. The payload names the value
    // `daysRemaining` — which the copy also interpolates by that name — so the
    // same number is mirrored onto `count` for the plural to resolve. Without
    // this the row would fall through to the `_other` form and read "in 1
    // days".
    const daysRemaining = (payload as { daysRemaining?: unknown } | null)
      ?.daysRemaining;
    if (typeof daysRemaining === "number") {
      tokens.count = daysRemaining;
    }
  }
  if (type === "intake_reviewed") {
    // The copy names the form the member actually filled in; the payload only
    // carries its snake_case identifier, so the readable phrase is resolved
    // here rather than composed by a backend that has no language.
    tokens.form = intakeFormToken(payload, t);
  }
  if (type === "dsar_resolved") {
    // Overrides the raw `reference` `interpolationTokens` already copied
    // through with the same value, defensively re-resolved so a row missing it
    // reads as a phrase instead of leaving "Reference: ." on screen.
    tokens.reference = dsarReferenceToken(payload, t);
  }
  if (type === "community_banned") {
    // Overrides the raw ISO `expiresAt` that `interpolationTokens` already
    // copied through, with a date a person can read.
    tokens.expiresAt = banExpiryToken(payload, t, fmt);
  }
  if (type === "security_new_sign_in") {
    // Overrides the raw ISO `signedInAt` that `interpolationTokens` already
    // copied through, with a time a person can read in their own language.
    tokens.when = signInTimeToken(payload, t, fmt);
    // Same reason: overrides the raw value `interpolationTokens` copied so a
    // missing label reads as a phrase rather than an empty gap.
    tokens.deviceLabel = deviceLabelToken(payload, t);
  }
  if (type === "barter_proposal_received") {
    // Overrides the raw `listingOffer` `interpolationTokens` already copied
    // through, so a listing that only asks for something reads as a phrase
    // instead of leaving a gap where the swap's name should be.
    tokens.listingOffer = barterOfferToken(payload, t);
  }
  return {
    text: t(`notifications:type.${key}.text`, tokens),
    meta: t(`notifications:type.${key}.meta`, tokens),
    category: known ? KIND_CATEGORY[type] : "platform",
    kind: known ? type : null,
  };
}
