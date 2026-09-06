import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import type { NotifType } from "../notifications.types";
import { ADMIN_QUEUE_ROUTES } from "./adminQueueRoutes";

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
  // PRD-147. Sent to the AUTHOR of a post or reply a community moderator took
  // down. System-toned like `community_banned` above and for the same reason:
  // the payload carries no actor, so the row never names the moderator who
  // acted. It does carry `subject` (`post` | `reply`, the closed vocabulary the
  // copy branches on), the moderator's `reason` written for this member to
  // read, and the community's own `ruleText` snapshotted at the moment of the
  // decision. Before it existed a takedown was silent: the author found a
  // tombstone where their words had been and had no way to learn why, since
  // QueerPulse sends no email and there is no way to message a community's
  // moderators.
  | "community_post_removed"
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
  // PRD-289. The reporter's OWN receipt, written when they file rather than
  // when a moderator closes the case. Before this the reporter's first in-app
  // word about their own report was `report_resolved`, up to seven days later
  // at the low severity band, so anyone who dismissed the success toast held
  // no record at all. Carries `reportId`, `reference` (the quotable case
  // code), `subjectType` and `severity`; no actor, because the platform is
  // speaking.
  | "report_received"
  | "appeal_resolved"
  | "invite_accepted"
  // PRD-140. A community moderator inviting a member in. Before this the type
  // was absent from this union, so `isKnownKind` was false and the bell fell
  // through to the generic unknown copy: the invitation arrived as an
  // unnamed row. The invite itself is now a durable record, so the row has
  // somewhere real to lead.
  | "community_invite_received"
  | "listing_review"
  // Sent to the MEMBER WHO ASKED a public question on a business page when
  // that question is answered (mirrors the backend `notifications_type_enum`
  // value added in
  // `AddListingPublicQuestionNotificationTypes1794300000000`). It has been
  // written since that migration shipped and had no entry here, so it rendered
  // the `unknown` fallback: a member got "Something happened on QueerPulse" as
  // the answer to a question they personally typed.
  //
  // THE COPY IS WRITTEN FOR NO ACTOR, which is the common case rather than the
  // edge one. The public Q&A names nobody: an answer is attributed by ROLE
  // (`answeredByRole: 'owner' | 'moderator'`), a co-manager is invisible on the
  // page by design, and an owner who is anonymous or who withheld
  // `linkToProfile` has told the platform not to tie their name to the
  // business. The backend spreads `payload.actorId` only where the page already
  // links that owner's profile, so most rows resolve no actor at all. The asker
  // is owed the ANSWER, and the sentence says exactly that without depending on
  // a name that usually is not there.
  //
  // Payload carries `listingName` for the sentence, plus `source: 'listing'`
  // and `listingSlug`, which `sourceHrefFromPayload` resolves to the business
  // page the answer is published on. The answer text itself never rides along:
  // it is on the page one click away, the same rule that keeps a review reply's
  // text off `review_replied`.
  // The other half of the public Q&A on a business listing, going to the
  // listing's OWNER when a member asks something on their page. It was missing
  // here for the same reason its sibling was: both were added to the backend
  // enum and neither reached the frontend, so an owner's "somebody asked you a
  // question" row rendered the unknown-kind fallback, "You have a new
  // notification." Carries `payload.actorId` (the asker, who IS named on the
  // page they asked from, so nothing is withheld) plus `listingName` for the
  // sentence and a slug for the deep link. The question text stays off the
  // bell, the same rule that keeps the ANSWER off the answered row.
  | "listing_public_question"
  | "listing_public_question_answered"
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
  // PRD-208. Sent to everyone FOLLOWING a persona when that persona publishes
  // new work: items added to a content section of a live persona (mirrors the
  // backend `notifications_type_enum` value added in
  // `AddPersonaUpdateNotificationType1810000000000`, emitted from
  // `SubprofileUpdatesService`). Payload: `{ subprofileName,
  // subprofileSlugOrHandle, itemTitle, newItemCount, deepLink }`. Carries no
  // actor key at all, so the row never names the human behind a pseudonymous
  // persona; it stays icon-based and speaks in the persona's own name. The
  // copy is CLDR-pluralised on `newItemCount`, mirrored onto `count` below.
  | "persona_update"
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
  // PRD-240. The housing viewing lifecycle, all three emitted from
  // `HousingViewingsService` (mirrors the backend values added in
  // `AddHousingLifecycleNotificationTypes1817000000000`). Before them the whole
  // lifecycle was silent and a lister only learned somebody wanted to see their
  // home by opening /local/housing/viewings.
  //
  // `housing_viewing_requested` goes to the LISTER and carries the requester as
  // its actor. `housing_viewing_decided` goes to the REQUESTER with
  // `decision` (`accepted`/`declined`/`proposed`) selecting the copy, and the
  // lister as its actor. `housing_viewing_cancelled` goes to whichever
  // participant did NOT cancel. All three carry `title`/`slug`/`viewingId`.
  | "housing_viewing_requested"
  | "housing_viewing_decided"
  | "housing_viewing_cancelled"
  // PRD-242. The outcome of a co-op or vetted housing-group join request, from
  // `HousingService.triageJoinRequest` and `HousingGroupsService.triageJoinRequest`.
  // System-driven, no actor: the bell never names which admin decided. `kind`
  // (`coop`/`group`) and `decision` (`accepted`/`declined`) select the copy.
  | "housing_join_decided"
  // PRD-244. The one-week warning before a housing listing lapses, from
  // `HousingListingExpirySweeperService`. System-driven, fires once per listing
  // lifetime, with `title`/`slug`/`expiresAt` on the payload.
  | "housing_listing_expiring"
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
  // TS-04. Sent to platform staff when a moderation queue crosses its own
  // published threshold, and again with `severity: "ok"` when it recovers.
  // Payload: `{ source: "moderation", queue, severity, depth, overdueCount,
  // oldestItemHours }`. Staff-only, unmutable, no actor, never pushed to a
  // phone: it is duty mail about the state of the work, and a phone buzzing
  // about a backlog at midnight is the burnout this feature exists to reduce.
  //
  // Its copy lives in the `admin:` namespace rather than `notifications:`,
  // which is the one exception in this file. Every word of it (the queue
  // names, the severity levels) is admin vocabulary shared with the queue
  // health panel, it is served only to moderators and admins, and there is
  // deliberately no member-facing counterpart to any of it. See
  // `moderationQueueAlertKey` below.
  | "moderation_queue_alert"
  // Sent to a community's owner, co-owners and moderators when PLATFORM STAFF
  // offer that community support (mirrors the backend `notifications_type_enum`
  // value added in
  // `AddCommunitySupportOfferedNotificationType1795660200000`, emitted from
  // `AdminCommunitySupportService.create`). OPS-05: the admin console's "Offer
  // support" button used to write nothing at all, so the community it was
  // offered to never heard a word.
  //
  // System-driven, no actor: the bell never names which staff member typed the
  // offer, so a moderator's personal block of them cannot swallow it. The
  // payload carries `communityName` and `communitySlug` and nothing else — the
  // staff member's note lives behind the community's own mod-tools
  // authentication, which is also where the offer is answered, and where this
  // row deep-links to.
  //
  // In-app plus web push. QueerPulse sends no email, so no copy here may say
  // anything is on its way.
  | "community_support_offered"
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
  | "magazine_issue_published"
  // The magazine desk speaking to the WRITER of one piece. All four rows below
  // carry the acting editor as `payload.actorId`, so each resolves a real
  // `actor` (avatar + profile link) and block/mute filtering applies, and all
  // four sit in the `Magazine` preference category on the backend.
  //
  // `magazine_piece_message` (the editor-writer message thread, backend value
  // added in `AddMagazinePieceMessageNotificationType1787300100000`) has been
  // written since that migration shipped and had NO entry here, so for months
  // it rendered the unknown-kind fallback: somebody was messaged about a piece
  // they are writing and their bell said "You have a new notification." It is
  // the only one of the four with no display payload at all — the backend's
  // `PAYLOAD_ALLOWLIST` has no entry for it, so its `pieceId`/`messageId` are
  // stripped at that boundary and the copy names no piece. It is also the only
  // one that goes to EITHER party (editor to writer, or writer to editor),
  // which is why it resolves no deep link: see `notifications.adapters.ts`.
  //
  // The other three are PRD-121, and each goes to the writer alone (the backend
  // skips a piece somebody commissioned to themselves). Before them the desk
  // told a writer nothing: being given a piece, every stage it moved through
  // and its publication were all silent, so a writer learned they had work by
  // opening `/magazine/writer` on a hunch. Payload carries `{ source:
  // "magazine", pieceId, title, actorId }`, plus `stage` on the stage change
  // (a machine `PieceStage` value, translated by `pieceStageToken` rather than
  // printed) and `href` on the publication (the reader path the piece just
  // went live at, which the row deep-links to).
  //
  // Nothing editorial rides along on any of them: the brief, the care record,
  // the editor's notes and the draft body are all absent from the backend's
  // allowlist, so none of them can reach a bell.
  | "magazine_piece_message"
  | "magazine_piece_commissioned"
  | "magazine_piece_stage_changed"
  | "magazine_piece_published"
  // A membership card thirty days from expiry (SUS-07; mirrors the backend
  // `notifications_type_enum` value added in
  // `AddCardSelfRenewAndExpiryWarning1795620000000`, emitted from
  // `CardExpiryWarningService`). Before this, a card expired in silence and its
  // holder found out at a door.
  //
  // System-driven, no actor. Payload carries `{ source: "card", communitySlug,
  // communityName, daysRemaining, canSelfRenew }`. `daysRemaining` is a NUMBER
  // mirrored onto `count` below for CLDR pluralisation, the same way
  // `account_deletion_final_warning` does it, and `canSelfRenew` picks between
  // the copy that points at the member's own Renew button and the copy that
  // points at their community. `source: "card"` deep-links to /account/cards.
  //
  // IN-APP. QueerPulse sends no email, so no copy for this type may say
  // anything is on its way by any other channel.
  | "card_expiring"
  // Sent to the members holding an unmade decision about a gathering (they
  // saved it, or they RSVP'd `maybe`) when its last few seats go (PRD-18,
  // mirrors the backend `notifications_type_enum` value added in
  // `AddEventNearlyFullNotificationType1796020000000`, emitted from
  // `EventCapacityAlertsService`). System-driven, no actor: a room filling up
  // is nobody's act. Payload carries `{ source: "event", eventSlug, title,
  // seatsRemaining }`; `seatsRemaining` is a NUMBER, mirrored onto `count` for
  // CLDR pluralisation the same way `daysRemaining` is.
  | "event_nearly_full"
  // PRD-31, the two rows that close the ban-evasion loop. A community's
  // moderators get a one-bit "this applicant matches somebody THIS community
  // barred" flag on a join request, plus a one-click ask for platform staff to
  // look; before these, the ask disappeared and the answer never came back.
  //
  // `ban_evasion_escalation_raised` goes to platform staff (moderator and
  // admin), minus whoever raised it. Payload: `{ source: "moderation",
  // escalationId, communitySlug, communityName }`. It is a work item: it names
  // the community and says a moderator asked, and it never names the applicant
  // or hints at an answer, because staff have not looked yet.
  //
  // `ban_evasion_escalation_resolved` goes only to the community moderator who
  // raised it. Payload: `{ source: "community", escalationId, joinRequestId,
  // communitySlug, communityName }`. The backend deliberately withholds the
  // resolution note, the resolver and the timestamp: what staff found is the
  // cross-community judgement the one-bit flag exists to withhold. So the copy
  // says the escalation is closed and that the decision on the request is
  // still the moderator's, and says nothing else.
  //
  // Both are system-driven with no actor, in-app only (absent from the push
  // whitelist), and always delivered (no preference mutes them). Neither may
  // promise any other channel: QueerPulse sends no email.
  | "ban_evasion_escalation_raised"
  | "ban_evasion_escalation_resolved"
  // PRD-48, the two rows behind the shared intake primitive (mirrors the
  // backend `notifications_type_enum` values added in
  // `AddSubmissionAndReviewNotificationTypes1796400000000`).
  //
  // `submission_decided` goes to the MEMBER WHO SUBMITTED when the reviewing
  // side reaches a terminal outcome, written by `SubmissionDecisionNotifier`.
  // The gap it closes is a class of gap rather than one instance: every intake
  // on the platform had its own entity, its own status words and its own
  // decision endpoint, and whether the person who submitted ever heard back was
  // decided one intake at a time, so a partner application, a barter proposal
  // and a suggested resource each ended in permanent silence for the same
  // reason.
  //
  // ONE KIND, TWO DISCRIMINATORS. Payload carries `{ kind, outcome,
  // subjectLabel?, reviewNote? }`: `kind` is which intake this was (the
  // backend's `SubmissionKind`) and `outcome` is `accepted | declined |
  // archived`. The copy branches on BOTH, because "your swap was turned down"
  // and "your resource suggestion is live" are not the same sentence and must
  // not share a hedged one. An unknown kind, or a known kind with an unknown
  // outcome, degrades one step at a time to honest generic copy rather than
  // rendering nothing. System-driven, no actor: the bell never names who
  // decided.
  //
  // `subjectLabel` is the submission's own headline read back to the member so
  // the row says WHICH submission, and `reviewNote` is the reviewer's reason
  // where one was given. The note is the meta line, exactly as
  // `moderation_outcome`'s `{note}` is: these intakes have no member-facing
  // tracker page and QueerPulse sends no email, so this row is the whole of
  // what the member ever hears, and a declined outcome without its reason would
  // be the reasonless refusal the finding exists to stop.
  | "submission_decided"
  // `review_replied` goes to the AUTHOR OF A REVIEW when the SUBJECT of that
  // review answers it in public, written by `ReviewReplyNotifier`. A business
  // owner's public reply to a member's review used to tell that member nothing,
  // so the only way to find a reply was to go back and look.
  //
  // Member-driven, and the one difference from `submission_decided` above: it
  // carries `payload.actorId` (the replying owner, employer or lister) so the
  // same block/mute gate `listing_public_question_answered` sits behind applies
  // here too. A moderator-written reply omits the actor and reads as the
  // platform speaking. Payload also carries `subjectLabel` (the reviewed
  // thing's own public name) plus `source` and a slug for the deep link. The
  // REPLY TEXT never rides along: it is already published on the page this row
  // opens, which is the same rule that keeps
  // `listing_public_question_answered`'s answer body off the bell.
  | "review_replied"
  // Sent to the staff who can work an admin review queue when an item lands in
  // it (mirrors the backend `notifications_type_enum` value added in
  // `AddAdminQueueItemNotificationType`, written by
  // `AdminQueueNotificationsService.announce`). One kind for all twenty-seven
  // queues; which one is in `payload.queue`.
  //
  // Staff-only, unmutable, no actor, never pushed to a phone. Like
  // `moderation_queue_alert`, its copy lives in the `admin:` namespace rather
  // than `notifications:`: the queue names are admin vocabulary shared with
  // the queue-health panel, and there is no member-facing counterpart to any
  // of it.
  //
  // It BUNDLES on the queue, so one row can stand for several arrivals. Its
  // copy therefore carries the count itself and `NotificationItem` suppresses
  // the generic "and N others" suffix for it.
  | "admin_queue_item";

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
  // A takedown of your own post or reply is community moderation, same tab as
  // community_banned.
  community_post_removed: "community",
  forum_thread_reply: "community",
  // A new post in a followed topic is community activity, same tab as
  // forum_thread_reply/community_reply.
  topic_new_post: "community",
  join_request_received: "community",
  join_request_approved: "community",
  join_request_declined: "community",
  invite_accepted: "community",
  community_invite_received: "community",
  listing_review: "community",
  // The answer to a question you asked on a business page is a public exchange
  // about a place, same tab as listing_review and review_replied rather than
  // the platform tab: this is not the platform's word on something you
  // submitted, it is a business answering you where other members can read it.
  // Both halves of a listing's public Q&A sit under "community": they are a
  // public exchange about a place, not the platform's word on a submission.
  listing_public_question: "community",
  listing_public_question_answered: "community",
  job_application: "platform",
  listing_approved: "platform",
  report_resolved: "platform",
  report_received: "platform",
  appeal_resolved: "platform",
  roadmap_status: "platform",
  moderation_outcome: "platform",
  // A fellow member crediting you is community activity, same tab as
  // vouch_received/introduction_made.
  subprofile_credit: "community",
  // New work from a persona you follow is somebody else's activity you asked
  // to hear about — the community tab, same as subprofile_credit.
  persona_update: "community",
  // A member vouching for your safe space is community activity, same tab as
  // vouch_received.
  safe_space_vouch: "community",
  // A saved-search match is the platform telling you about a new home — a
  // platform notification, like listing_approved.
  housing_listing_match: "platform",
  // PRD-240/242/244. The housing lifecycle. All five are the platform (or a
  // counterparty acting through it) reporting on a home you listed or asked
  // about, which is the same tab housing_listing_match already sits in.
  housing_viewing_requested: "platform",
  housing_viewing_decided: "platform",
  housing_viewing_cancelled: "platform",
  housing_join_decided: "platform",
  housing_listing_expiring: "platform",
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
  // A queue crossing its threshold is platform duty mail, same tab as
  // report_filed, and it deep-links into the moderation console.
  moderation_queue_alert: "platform",
  // An offer of support sits beside `community_report_filed` for the same
  // reason: it is the platform handing a community's staff something to
  // answer, and it deep-links into mod tools rather than into the community's
  // own activity.
  community_support_offered: "platform",
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
  // The four desk rows sit beside `magazine_issue_published` rather than under
  // "community", even though three of them carry a named editor. The desk is
  // WORK: a commission, a stage change and a publication are the magazine
  // telling its writer where their piece stands, and the community tab is
  // activity in a room the member belongs to. Filing them there would bury a
  // deadline-bearing row under replies and mentions.
  magazine_piece_message: "platform",
  magazine_piece_commissioned: "platform",
  magazine_piece_stage_changed: "platform",
  magazine_piece_published: "platform",
  // A credential of the member's own running out is the platform's word about
  // their own standing, same tab as account_deletion_final_warning.
  card_expiring: "platform",
  // A gathering you were weighing up running out of room is gathering news,
  // same tab as event_reminder and waitlist_promoted.
  event_nearly_full: "events",
  // Both halves of a ban-evasion escalation sit beside `report_filed` and
  // `community_report_filed` for the same reason those do: each hands somebody
  // with a duty a queue to open, and each deep-links into a console rather than
  // into a community's own activity.
  ban_evasion_escalation_raised: "platform",
  ban_evasion_escalation_resolved: "platform",
  // The outcome of something the member submitted is the platform's word on
  // their own submission, same tab as intake_reviewed and
  // volunteer_application_decided. True even for a barter proposal, whose
  // reviewer is another member: what the row reports is the fate of the
  // member's own submission, not activity in a community.
  submission_decided: "platform",
  // A member answering a review you wrote is activity between two members
  // about a place, same tab as listing_review, which is the row on the other
  // side of the same conversation.
  review_replied: "community",
  // An arrival in a review queue is platform duty mail that deep-links into a
  // console, same tab as moderation_queue_alert.
  admin_queue_item: "platform",
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
 * The row carries `payload.status` (`reviewing | resolved | dismissed`, written
 * by the backend when an admin triages the concern) — each gets its own
 * headline ("Someone is looking at it" vs "Your concern was resolved" vs
 * "…was reviewed and closed"), so the key branches to
 * `concern_update.<status>`. An unknown/missing status falls back to the flat
 * `concern_update.*` copy. Non-concern types pass through unchanged.
 */
function concernUpdateKeyFor(type: string, payload: unknown): string {
  if (type !== "concern_update") return type;
  const status = (payload as { status?: string } | null)?.status;
  // PRD-261 added `reviewing`: the backend now writes this bell when a concern
  // is PICKED UP, not only when it reaches an outcome. "Someone is looking at
  // it" is the transition a person waiting on a report about harm most needs,
  // and it must not borrow the two outcome headlines, which both say the matter
  // is closed. An unknown/missing status still falls back to the flat
  // `concern_update.*` copy, which says only that there is an update.
  return status === "reviewing" ||
    status === "resolved" ||
    status === "dismissed"
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
 * PRD-240. The catalog key for a housing viewing decision, which is one
 * notification type covering three outcomes rather than three near-identical
 * enum members: the lister accepted, declined, or proposed a different time.
 *
 * `decision` is on the backend's payload allowlist for this type, so it always
 * survives the wire when it was written. A row whose payload is missing it, or
 * carries a value this build has never seen, falls back to the flat key rather
 * than rendering an empty string, matching every other discriminator here.
 */
function housingViewingDecidedKeyFor(type: string, payload: unknown): string {
  if (type !== "housing_viewing_decided") return type;
  const decision = (payload as { decision?: string } | null)?.decision;
  return decision === "accepted" ||
    decision === "declined" ||
    decision === "proposed"
    ? `housing_viewing_decided.${decision}`
    : "housing_viewing_decided";
}

/**
 * PRD-242. The catalog key for a co-op or housing-group join decision.
 *
 * Branches on `decision` alone and NOT on `payload.kind`, even though both are
 * on the allowlist. The copy names the thing through the `{name}` token the
 * payload already carries ("Your request to join Casa Aurora was accepted"), so
 * splitting the key by kind as well would double the strings to say the same
 * sentence twice. `kind` earns its place on the wire by choosing the deep link,
 * which `sourceHrefFromPayload` reads, rather than the words.
 */
function housingJoinDecidedKeyFor(type: string, payload: unknown): string {
  if (type !== "housing_join_decided") return type;
  const decision = (payload as { decision?: string } | null)?.decision;
  return decision === "accepted" || decision === "declined"
    ? `housing_join_decided.${decision}`
    : "housing_join_decided";
}

/**
 * The closed set of intake names the backend can put on a `submission_decided`
 * row's `payload.kind`, mirroring `SubmissionKind` in
 * `queerpulse-backend/src/submissions/submission-kinds.ts`.
 *
 * A closed set rather than a free interpolation, for the same reason
 * `INTAKE_FORM_KINDS` above is one: the raw value is a snake_case identifier,
 * and `resource_suggestion` is not a thing to show a member. A kind the backend
 * adds before this list learns about it degrades to the generic copy rather
 * than printing the identifier or rendering an empty row.
 */
const SUBMISSION_KINDS = new Set<string>([
  "partner_application",
  "barter_proposal",
  "resource_suggestion",
]);

/**
 * The closed set of terminal outcomes, mirroring `SubmissionOutcome` on the
 * backend. `archived` is its own outcome rather than a shade of `declined`
 * because telling somebody they were turned down when nobody weighed it is a
 * worse row than telling them the queue item was closed.
 */
const SUBMISSION_OUTCOMES = new Set<string>([
  "accepted",
  "declined",
  "archived",
]);

/**
 * Resolve the i18n subkey a `submission_decided` notification's copy lives
 * under. TWO discriminators, so the fallback happens in two steps rather than
 * one:
 *
 *  - both known  -> `submission_decided.<kind>.<outcome>`, the real sentence.
 *  - kind known, outcome not -> `submission_decided.<kind>`, which still names
 *    the thing the member sent in and says a decision was reached.
 *  - neither known -> the flat `submission_decided.*` copy, which says only
 *    that there is news about something they sent in.
 *
 * Degrading a step at a time is the point: an intake added on the backend
 * before this file learns about it still produces an honest, readable row
 * rather than a blank one or a raw identifier. Non-matching types pass through
 * unchanged.
 */
function submissionDecidedKeyFor(type: string, payload: unknown): string {
  if (type !== "submission_decided") return type;
  const decided = payload as { kind?: string; outcome?: string } | null;
  const kind = decided?.kind;
  if (typeof kind !== "string" || !SUBMISSION_KINDS.has(kind)) {
    return "submission_decided";
  }
  const outcome = decided?.outcome;
  return typeof outcome === "string" && SUBMISSION_OUTCOMES.has(outcome)
    ? `submission_decided.${kind}.${outcome}`
    : `submission_decided.${kind}`;
}

/**
 * Resolves the `{subjectLabel}` token a `submission_decided` row interpolates:
 * the submission's own headline, read back to the member so the row says which
 * submission it is about.
 *
 * Read defensively like every other payload token here. The backend omits the
 * key entirely rather than writing a blank one, so a submission whose headline
 * was never recorded must still produce a whole sentence instead of leaving
 * `{subjectLabel}` on screen. The fallback is per-kind, because "your swap
 * proposal on a listing" and "your partner application for your organisation"
 * are different sentences and one shared phrase fits neither.
 */
function submissionSubjectToken(payload: unknown, t: TFunction): string {
  const decided = payload as { kind?: string; subjectLabel?: string } | null;
  const subjectLabel = decided?.subjectLabel;
  if (typeof subjectLabel === "string" && subjectLabel.trim() !== "") {
    return subjectLabel;
  }
  const kind = decided?.kind;
  return typeof kind === "string" && SUBMISSION_KINDS.has(kind)
    ? t(`notifications:type.submission_decided.${kind}.subjectFallback`)
    : t("notifications:type.submission_decided.subjectFallback");
}

/**
 * Resolves the `{reviewNote}` token a `submission_decided` row interpolates
 * into its META line: the reviewer's reason, where one was given.
 *
 * The meta line IS the note, the same shape `moderation_outcome.*.meta` uses
 * (`"{note}"`). That is deliberate: these intakes have no member-facing tracker
 * page, and QueerPulse sends no email, so the bell is the only place the reason
 * can be read at all.
 *
 * A decision with no note falls back to the kind's own short label ("Partner
 * application"), so the meta line still says what the row is about instead of
 * going blank. It never apologises and never suggests the decision might yet
 * change.
 */
function submissionNoteToken(payload: unknown, t: TFunction): string {
  const decided = payload as { kind?: string; reviewNote?: string } | null;
  const reviewNote = decided?.reviewNote;
  if (typeof reviewNote === "string" && reviewNote.trim() !== "") {
    return reviewNote;
  }
  const kind = decided?.kind;
  return typeof kind === "string" && SUBMISSION_KINDS.has(kind)
    ? t(`notifications:type.submission_decided.${kind}.label`)
    : t("notifications:type.submission_decided.labelFallback");
}

/**
 * Resolves the `{subjectLabel}` token a `review_replied` row interpolates: the
 * public name of the thing the member reviewed (the business, the employer, the
 * home).
 *
 * Same defensive read as `submissionSubjectToken`, with one shared fallback
 * rather than a per-kind one: this row has no kind discriminator, and "your
 * review of something you reviewed" is not a sentence, so the fallback phrasing
 * is what the copy string is written around.
 */
function reviewSubjectToken(payload: unknown, t: TFunction): string {
  const subjectLabel = (payload as { subjectLabel?: string } | null)
    ?.subjectLabel;
  return typeof subjectLabel === "string" && subjectLabel.trim() !== ""
    ? subjectLabel
    : t("notifications:type.review_replied.subjectFallback");
}

/**
 * Resolves the `{listingName}` token both halves of a listing's public Q&A
 * interpolate: the public name of the business, which the asker's row uses to
 * say what they asked about and the owner's row uses to say which of their
 * listings was asked about.
 *
 * Same defensive read as `reviewSubjectToken`. The backend has always written
 * `listingName`, so the fallback is for a malformed or truncated payload rather
 * than an older row shape, and it exists because leaving `{listingName}` on
 * screen would be the worst possible version of a row whose whole job is to
 * hand somebody an answer they asked for. The business is one click away
 * through `sourceHref` in either case.
 */
function listingQuestionSubjectToken(payload: unknown, t: TFunction): string {
  const listingName = (payload as { listingName?: string } | null)?.listingName;
  return typeof listingName === "string" && listingName.trim() !== ""
    ? listingName
    : t("notifications:type.listing_public_question_answered.subjectFallback");
}

/**
 * The editorial stages a magazine piece moves through, mirroring `PieceStage`
 * in `queerpulse-backend/src/magazine/` (and `PIECE_STAGE_ORDER` in the desk's
 * own `pieces.adapters.ts`, which carries the same eight values plus
 * `published`).
 *
 * A closed set rather than a free interpolation, the same reason
 * `INTAKE_FORM_KINDS` and `SUBMISSION_KINDS` above are closed sets: `stage`
 * arrives as a MACHINE VALUE, and `sensitivity_read` is not a thing to show a
 * writer. A stage the backend adds before this list learns about it degrades to
 * a neutral phrase rather than printing the identifier.
 */
const PIECE_STAGES = new Set<string>([
  "commissioned",
  "drafting",
  "in_review",
  "edit",
  "sensitivity_read",
  "layout",
  "ready",
  "published",
]);

/**
 * Resolves the `{stage}` token a `magazine_piece_stage_changed` row
 * interpolates: the name of the stage the piece just moved to, in the writer's
 * own language.
 *
 * The labels live inline under `type.magazine_piece_stage_changed.stage.*`
 * rather than reaching into the `magazine:` namespace, which is the
 * `verification_update.level.*` precedent and holds for the same reason: the
 * magazine namespace is a separate, lazily-chunked catalog a member reading
 * their bell has no reason to have loaded, and every other payload-driven kind
 * in this file keeps its label set self-contained in `notifications`. The
 * desk's own English-only stage chips are a deliberately untranslated
 * editorial vocabulary; a bell row is member-facing copy, so these are
 * translated.
 */
function pieceStageToken(payload: unknown, t: TFunction): string {
  const stage = (payload as { stage?: string } | null)?.stage;
  return typeof stage === "string" && PIECE_STAGES.has(stage)
    ? t(`notifications:type.magazine_piece_stage_changed.stage.${stage}`)
    : t("notifications:type.magazine_piece_stage_changed.stageFallback");
}

/**
 * Resolves the `{title}` token the three PRD-121 desk rows interpolate: the
 * piece's own working title, which is what tells a writer WHICH piece a row is
 * about when they have several open.
 *
 * Read defensively like every other payload token here. The backend writes the
 * piece's `title` on all three, so the fallback is for a malformed payload
 * rather than an older row shape, and it exists because the whole job of these
 * rows is to name the piece: leaving `{title}` on screen would be the worst
 * version of that. The fallback reads as a title, because the copy quotes it.
 *
 * One key serves all three kinds, the same way `listingQuestionSubjectToken`
 * above shares one fallback across both halves of a listing's public Q&A: the
 * phrase is identical in every sentence it lands in.
 */
function pieceTitleToken(payload: unknown, t: TFunction): string {
  const title = (payload as { title?: string } | null)?.title;
  return typeof title === "string" && title.trim() !== ""
    ? title
    : t("notifications:type.magazine_piece_commissioned.titleFallback");
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
  // `reopened` is not a verdict, it CLEARS one: an admin put a declined story
  // back in the queue. It has to be listed here rather than left to the
  // fallback, because the flat copy reads "The magazine has decided on X",
  // which is the precise opposite of what happened and would tell a member
  // their story had been answered at the moment it stopped being answered.
  return decision === "accepted" ||
    decision === "declined" ||
    decision === "commissioned" ||
    decision === "reopened"
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
 * Resolves the `{communityName}` token both PRD-31 ban-evasion rows
 * interpolate: the community the escalation was raised from.
 *
 * Read defensively, the way `barterOfferToken` and `deviceLabelToken` are. The
 * backend writes `communityName` on both payloads, but a row from an older or
 * future shape must not leave a literal `{communityName}` sitting in a
 * moderation row, and a blank one must not leave a hole mid-sentence. The
 * fallback phrase is per type because the two sentences read differently: the
 * staff row is about some community, and the moderator's row is about their
 * own. Passing the type through keeps that in the catalog, where the
 * surrounding grammar lives, rather than hardcoding a phrase here.
 */
function banEvasionCommunityToken(
  type: string,
  payload: unknown,
  t: TFunction,
): string {
  const communityName = (payload as { communityName?: string } | null)
    ?.communityName;
  return typeof communityName === "string" && communityName.trim() !== ""
    ? communityName
    : t(`notifications:type.${type}.communityFallback`);
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
/**
 * Which half of the card-expiry copy this row gets.
 *
 * The two say different things to do. Where the issuing programme allows self
 * renewal the member has a Renew button waiting on /account/cards; where it
 * does not, the community issues the new card and the copy has to say so
 * rather than pointing at a control that is not there. A payload missing the
 * flag falls back to the community wording, which is the answer that is true
 * of every programme that never opted in.
 */
function cardExpiringKeyFor(type: string, payload: unknown): string {
  if (type !== "card_expiring") return type;
  const canSelfRenew = (payload as { canSelfRenew?: unknown } | null)
    ?.canSelfRenew;
  return canSelfRenew === true ? `${type}.renewable` : type;
}

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
 * Resolve the copy for a moderator takedown (PRD-147). Two axes, both read off
 * the payload, mirroring `communityBannedKeyFor` directly above.
 *
 * `subject` (`post` | `reply`) is a closed vocabulary the server writes, and it
 * decides which sentence the member reads. `reason` and `ruleText` are each
 * optional, because a takedown is never blocked on a form: one that is blocked
 * on a form is one that does not happen when it needs to. That gives four
 * grounds variants rather than one hedged sentence with empty tokens in it,
 * because "no reason was recorded" is a different thing to be told than a
 * reason, and it is honest about what the member is being given.
 */
function communityPostRemovedKeyFor(type: string, payload: unknown): string {
  if (type !== "community_post_removed") return type;
  const removal = payload as {
    subject?: unknown;
    reason?: string | null;
    ruleText?: string | null;
  } | null;
  const subject = removal?.subject === "reply" ? "reply" : "post";
  const hasReason = Boolean(removal?.reason);
  const hasRule = Boolean(removal?.ruleText);
  const grounds = hasReason
    ? hasRule
      ? ".reasonRule"
      : ".reason"
    : hasRule
      ? ".rule"
      : "";
  return `${type}.${subject}${grounds}`;
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

/** The queues TS-04 measures. Guarded so a queue key this build has no copy
 *  for degrades to a neutral phrase instead of printing a snake_case token. */
const MODERATION_QUEUE_KEYS = [
  "invite_requests",
  "reports",
  "appeals",
  "verification",
  "ban_ratifications",
] as const;

/**
 * The `admin:` key prefix a `moderation_queue_alert` row's copy lives under.
 *
 * The payload's `severity` carries the level, exactly as `report_filed` keeps
 * its four urgency levels in the payload rather than minting a notification
 * type per level, and `ok` is the RECOVERY notice rather than an absence of
 * one. An unrecognised level resolves to `warning`: it says "look at this"
 * without claiming either that the platform is failing somebody or that a
 * queue has recovered, neither of which this row would know.
 */
function moderationQueueAlertKey(payload: unknown): string {
  const severity = (payload as { severity?: string } | null)?.severity;
  const level =
    severity === "ok" || severity === "critical" ? severity : "warning";
  return `admin:moderationHealth.notification.${level}`;
}

/**
 * The queue name, the overdue count and the oldest wait as ready phrases.
 *
 * Three numbers and one `{count}` slot: CLDR selection in `translate.ts` keys
 * off `count` alone, so the headline number (the depth) takes it and the other
 * two are pluralised here into their own tokens. `oldestItemHours` is nullable
 * on the wire, and a null means the queue is EMPTY, which the recovery copy
 * has to be able to say.
 */
function moderationQueueAlertTokens(
  payload: unknown,
  t: TFunction,
  fmt?: Formatters,
): Record<string, string | number> {
  const alert = payload as {
    queue?: string;
    depth?: number;
    overdueCount?: number;
    oldestItemHours?: number | null;
  } | null;
  const queue = alert?.queue;
  const isKnownQueue = MODERATION_QUEUE_KEYS.some((key) => key === queue);
  const overdueCount =
    typeof alert?.overdueCount === "number" ? alert.overdueCount : 0;
  const oldestItemHours =
    typeof alert?.oldestItemHours === "number" ? alert.oldestItemHours : null;
  const formatNumber = (value: number) =>
    fmt ? fmt.number(value) : String(value);
  return {
    count: typeof alert?.depth === "number" ? alert.depth : 0,
    queue: isKnownQueue
      ? t(`admin:moderationHealth.queue.${queue}`)
      : t("admin:moderationHealth.queue.unknown"),
    overdue: t("admin:moderationHealth.notification.overdueToken", {
      count: overdueCount,
      value: formatNumber(overdueCount),
    }),
    oldest:
      oldestItemHours === null
        ? t("admin:moderationHealth.notification.oldestNone")
        : t("admin:moderationHealth.notification.oldestToken", {
            count: oldestItemHours,
            value: formatNumber(oldestItemHours),
          }),
  };
}

/** The queue key from an admin-queue payload, or null when it is missing. */
function adminQueueKeyOf(payload: unknown): string | null {
  const record = payload as { queue?: unknown } | null;
  const queue = record?.queue;
  return typeof queue === "string" && queue.length > 0 ? queue : null;
}

/**
 * The catalog key for a queue's name. Reuses `moderationHealth.queue.*`, which
 * already names five of these queues for the queue-health panel, so the bell
 * and the panel cannot end up calling the same queue two different things. An
 * unknown or missing key falls back to the neutral entry that namespace
 * already carries, so a queue this build has never heard of still reads.
 *
 * "Recognised" means present in `ADMIN_QUEUE_ROUTES`, not merely non-empty: a
 * newer backend can send a queue key this build has never seen, and that key
 * has no `moderationHealth.queue.<key>` catalog entry, so building the string
 * anyway would hand `t()` a miss. `I18nProvider`'s `t` returns a missing key
 * verbatim, which is exactly the raw-translation-code-on-screen failure this
 * fallback exists to prevent.
 */
function adminQueueLabelKey(queue: string | null): string {
  if (!queue || !(queue in ADMIN_QUEUE_ROUTES)) {
    return "admin:moderationHealth.queue.unknown";
  }
  return `admin:moderationHealth.queue.${queue}`;
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
  /**
   * How many further arrivals a bundled row stands for. Only
   * `admin_queue_item` reads it: its copy carries the count itself, because
   * "4 invite requests waiting" is the useful sentence and "A new invite
   * request landed. and 3 others" is not. Optional, so every call site that
   * predates it keeps compiling.
   */
  otherActorCount?: number,
): FormattedNotification {
  const known = isKnownKind(type);
  // TS-04 is the ONE type whose copy lives outside the `notifications:`
  // namespace. Its whole vocabulary is admin vocabulary shared with the queue
  // health panel, and it is served only to moderators and admins, so it is
  // resolved here and returns early rather than falling through to the
  // `notifications:type.*` lookup every other kind uses.
  if (type === "moderation_queue_alert") {
    const key = moderationQueueAlertKey(payload);
    const tokens = moderationQueueAlertTokens(payload, t, fmt);
    return {
      text: t(`${key}.text`, tokens),
      meta: t(`${key}.meta`, tokens),
      category: "platform",
      kind: "moderation_queue_alert",
    };
  }
  // The second kind whose copy lives outside the `notifications:` namespace,
  // for the same reason the first does. Returns early rather than falling
  // through to the `notifications:type.*` lookup.
  if (type === "admin_queue_item") {
    const queue = adminQueueKeyOf(payload);
    return {
      text: t("admin:queueArrival.text", {
        count: (otherActorCount ?? 0) + 1,
        queue: t(adminQueueLabelKey(queue)),
      }),
      meta: t("admin:queueArrival.meta"),
      category: "platform",
      kind: "admin_queue_item",
    };
  }
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
  } else if (type === "housing_viewing_decided") {
    key = housingViewingDecidedKeyFor(type, payload);
  } else if (type === "housing_join_decided") {
    key = housingJoinDecidedKeyFor(type, payload);
  } else if (type === "story_submission_decided") {
    key = storySubmissionDecidedKeyFor(type, payload);
  } else if (type === "submission_decided") {
    key = submissionDecidedKeyFor(type, payload);
  } else if (type === "report_filed" || type === "community_report_filed") {
    key = reportFiledKeyFor(type, payload);
  } else if (type === "community_banned") {
    key = communityBannedKeyFor(type, payload);
  } else if (type === "community_post_removed") {
    key = communityPostRemovedKeyFor(type, payload);
  } else if (type === "card_expiring") {
    key = cardExpiringKeyFor(type, payload);
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
  if (type === "card_expiring") {
    // Same reason as `account_deletion_final_warning` above: the copy is
    // pluralised ("in 1 day" / "in 30 days") and CLDR selection keys off
    // `count`, while the payload names the value `daysRemaining` because that
    // is what the copy interpolates. Both names carry the same number.
    const daysRemaining = (payload as { daysRemaining?: unknown } | null)
      ?.daysRemaining;
    if (typeof daysRemaining === "number") {
      tokens.count = daysRemaining;
    }
  }
  if (type === "persona_update") {
    // Same reason as the three blocks above: the copy is pluralised ("a new
    // piece of work" / "3 new pieces of work") and CLDR selection keys off
    // `count`, while the payload names the value `newItemCount` because that
    // is what the emit site calls it. Both names carry the same number.
    const newItemCount = (payload as { newItemCount?: unknown } | null)
      ?.newItemCount;
    if (typeof newItemCount === "number") {
      tokens.count = newItemCount;
    }
  }
  if (type === "event_nearly_full") {
    // Same reason as `card_expiring` above: the copy is pluralised ("1 spot
    // left" / "3 spots left") and CLDR selection keys off `count`, while the
    // payload names the value `seatsRemaining` because that is what the copy
    // interpolates. Both names carry the same number.
    const seatsRemaining = (payload as { seatsRemaining?: unknown } | null)
      ?.seatsRemaining;
    if (typeof seatsRemaining === "number") {
      tokens.count = seatsRemaining;
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
  if (
    type === "ban_evasion_escalation_raised" ||
    type === "ban_evasion_escalation_resolved"
  ) {
    // Overrides the raw `communityName` `interpolationTokens` already copied
    // through with the same value, defensively re-resolved so a row whose
    // payload is missing or malformed still reads as a whole sentence instead
    // of showing `{communityName}` to somebody being asked to act.
    tokens.communityName = banEvasionCommunityToken(type, payload, t);
  }
  if (type === "submission_decided") {
    // Overrides the raw `subjectLabel`/`reviewNote` `interpolationTokens`
    // already copied through with the same values, defensively re-resolved so a
    // row missing either still reads as a whole sentence and a whole meta line
    // instead of showing a brace token to somebody being told their submission
    // was turned down.
    tokens.subjectLabel = submissionSubjectToken(payload, t);
    tokens.reviewNote = submissionNoteToken(payload, t);
  }
  if (type === "review_replied") {
    // Same reason: the reviewed thing's name is the copy's only interpolation
    // slot, so a row missing it must still name something readable.
    tokens.subjectLabel = reviewSubjectToken(payload, t);
  }
  if (
    type === "listing_public_question" ||
    type === "listing_public_question_answered"
  ) {
    // Same reason again: the business name is the sentence's only slot. On the
    // answered row it usually names no PERSON at all, so the place is the whole
    // of what tells the asker which question was answered; on the question row
    // it is what tells an owner which of their listings was asked about.
    tokens.listingName = listingQuestionSubjectToken(payload, t);
  }
  if (
    type === "magazine_piece_commissioned" ||
    type === "magazine_piece_stage_changed" ||
    type === "magazine_piece_published"
  ) {
    // Overrides the raw `title` `interpolationTokens` already copied through
    // with the same value, defensively re-resolved so a row missing it still
    // reads as a whole sentence. `magazine_piece_message` is absent because it
    // carries no title at all: the backend's payload allowlist has no entry for
    // it, so its copy names no piece and interpolates nothing.
    tokens.title = pieceTitleToken(payload, t);
  }
  if (type === "magazine_piece_stage_changed") {
    // Overrides the raw machine value (`sensitivity_read`) that
    // `interpolationTokens` copied through verbatim with the translated,
    // writer-facing label the catalog string's `{stage}` expects.
    tokens.stage = pieceStageToken(payload, t);
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
