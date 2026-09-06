import type { Catalog } from "../../types";

/**
 * Notification row copy, keyed by the backend's `notifications_type_enum`
 * value. The API sends `type` + a structured `payload` and no display text, so
 * these strings — not the server — are what a member actually reads. That is
 * what keeps the API language-neutral. See `features/notifications/api/
 * formatNotification.ts`.
 *
 * `type.unknown.*` is the safe fallback for a kind this build doesn't know
 * (the backend enum can grow without a frontend deploy). Keep it truthful and
 * contentless — it must read sensibly for *any* future notification.
 *
 * The payloads carry only opaque IDs (`senderId`, `eventId`, …) and no display
 * names, so this copy deliberately never promises a name. If the backend later
 * enriches a payload, these strings can adopt `{token}` interpolation with no
 * code change.
 */
export const notifications: Catalog = {
  "type.connection_request.text": "Someone would like to connect with you.",
  "type.connection_request.textNamed":
    "<profile>{name}</profile> would like to connect with you.",
  "type.connection_request.meta": "Connection request",

  "type.connection_accepted.text": "Your connection request was accepted.",
  "type.connection_accepted.textNamed":
    "<profile>{name}</profile> accepted your connection request.",
  "type.connection_accepted.meta": "Connection",

  "type.vouch_received.text": "Someone vouched for you.",
  "type.vouch_received.textNamed": "<profile>{name}</profile> vouched for you.",
  "type.vouch_received.meta": "Vouch",

  // Sent to the space's owner when a member vouches for it. An anonymous vouch
  // resolves no actor and keeps the generic `.text` (never names them).
  "type.safe_space_vouch.text": "Someone vouched for your safe space.",
  "type.safe_space_vouch.textNamed":
    "<profile>{name}</profile> vouched for your safe space.",
  "type.safe_space_vouch.meta": "Safe space",

  // Sent when a new home goes live that matches a saved search with alerts on.
  // System-driven (no actor); `title`/`area` come from the payload.
  "type.housing_listing_match.text":
    "A new home in {area} matches your saved search: {title}.",
  "type.housing_listing_match.meta": "Housing alert",

  // PRD-240. The viewing lifecycle, which raised no notification at all before
  // this: a lister learned somebody wanted to see their home only by opening
  // /local/housing/viewings, and a requester never learned they were accepted.
  //
  // These rows carry a real actor (the requester, the lister, whoever
  // cancelled) and so show that person's avatar, but they are deliberately NOT
  // in `PERSONALIZED_KINDS`: a `textNamed` string can interpolate `{name}` and
  // nothing else, and which HOME this is about matters more to a lister with
  // three rooms listed than the requester's first name does. So the copy names
  // the listing and lets the avatar name the person. That also rules out
  // "Someone asked...", which reads as a bug beside a named face.
  "type.housing_viewing_requested.text": "New viewing request for {title}.",
  "type.housing_viewing_requested.meta": "Viewing request",

  // Three outcomes on one type, keyed by `payload.decision`.
  //
  // DIRECTION-NEUTRAL ON PURPOSE, and this is load-bearing rather than a style
  // choice. A viewing is a negotiation either side can answer: `accept`,
  // `propose` and `decline` are each guarded by `if (viewing.proposedBy ===
  // role) throw`, so the acting party is whoever did NOT make the proposal on
  // the table. That is the lister on the first pass and the REQUESTER once the
  // lister has counter-proposed. So "your viewing request was declined" is
  // wrong half the time, and it is wrong precisely for the lister, who never
  // made a request. The recipient is named by the avatar; the copy names the
  // home and the outcome.
  //
  // For the same reason the accepted string does not mention the address
  // unlock, true though it is: an accepted viewing is one of the three gates
  // that release the exact address, but only to the requester. Telling a lister
  // the address to their own home is now visible would read as nonsense.
  "type.housing_viewing_decided.accepted.text":
    "The viewing of {title} was accepted.",
  "type.housing_viewing_decided.declined.text":
    "The viewing of {title} was declined.",
  "type.housing_viewing_decided.proposed.text":
    "A different time was proposed for the viewing of {title}.",
  // Fallback for a row whose payload carries no decision this build knows.
  "type.housing_viewing_decided.text":
    "There is an update on the viewing of {title}.",
  "type.housing_viewing_decided.meta": "Viewing",

  "type.housing_viewing_cancelled.text":
    "The viewing of {title} was cancelled.",
  "type.housing_viewing_cancelled.meta": "Viewing",

  // PRD-242. The outcome of a co-op or vetted housing-group application. One
  // pair of strings covers both surfaces: `payload.kind` picks the deep link,
  // and `{name}` already names the co-op or the group, so splitting the copy by
  // kind would write the same sentence twice.
  "type.housing_join_decided.accepted.text":
    "Your request to join {name} was accepted.",
  "type.housing_join_decided.declined.text":
    "Your request to join {name} was declined.",
  "type.housing_join_decided.text":
    "There is a decision on your request to join {name}.",
  "type.housing_join_decided.meta": "Housing",

  // PRD-244. The one warning that arrives BEFORE a listing lapses. Deliberately
  // carries no date token: `expiresAt` is on the wire as a raw ISO string and
  // the bell has no formatter for it, so interpolating it would print
  // "2026-11-05T00:00:00.000Z" to a member. The listing page has the date.
  "type.housing_listing_expiring.text":
    "Your listing {title} is about to expire. Extend it to keep it on the board.",
  "type.housing_listing_expiring.meta": "Housing",

  "type.promoted_to_member.text": "You're a full member now. Welcome in.",
  "type.promoted_to_member.meta": "Membership",

  // `new_message` (in-app "You have a new message" row) was retired: DM alerts
  // live only in the message-icon unread badge and push, never here.

  "type.introduction_made.text": "An introduction you made went through.",
  "type.introduction_made.textNamed":
    "An introduction you made for <profile>{name}</profile> went through.",
  "type.introduction_made.meta": "Introduction",

  "type.mention.text": "You were mentioned in a discussion.",
  "type.mention.textNamed":
    "<profile>{name}</profile> mentioned you in a discussion.",
  "type.mention.meta": "Mention",

  // `mention` rows branch by `payload.entityKind` — what was actually
  // @-mentioned, not who. The plain `type.mention.*` above covers a member
  // (and any older row from before `entityKind` existed); these cover the
  // rest.
  "type.mention.community.text":
    "Your community c/{entityRef} was mentioned in a discussion.",
  "type.mention.community.textNamed":
    "<profile>{name}</profile> mentioned your community c/{entityRef}.",
  "type.mention.community.meta": "Community mention",

  "type.mention.business.text":
    "Your business b/{entityRef} was mentioned in a discussion.",
  "type.mention.business.textNamed":
    "<profile>{name}</profile> mentioned your business b/{entityRef}.",
  "type.mention.business.meta": "Business mention",

  "type.mention.event.text":
    "Your gathering e/{entityRef} was mentioned in a discussion.",
  "type.mention.event.textNamed":
    "<profile>{name}</profile> mentioned your gathering e/{entityRef}.",
  "type.mention.event.meta": "Gathering mention",

  "type.mention.thread.text":
    "Your thread t/{entityRef} was mentioned in a discussion.",
  "type.mention.thread.textNamed":
    "<profile>{name}</profile> mentioned your thread t/{entityRef}.",
  "type.mention.thread.meta": "Thread mention",

  "type.forum_reply.text": "Someone replied to your comment.",
  "type.forum_reply.textNamed":
    "<profile>{name}</profile> replied to your comment.",
  "type.forum_reply.meta": "Reply",

  "type.event_invite.text": "You have an invitation to a gathering.",
  "type.event_invite.textNamed":
    "<profile>{name}</profile> invited you to a gathering.",
  "type.event_invite.meta": "Gathering invitation",

  "type.event_cohost_invite.text":
    "You've been invited to co-host a gathering.",
  "type.event_cohost_invite.textNamed":
    "<profile>{name}</profile> invited you to co-host a gathering.",
  "type.event_cohost_invite.meta": "Co-host invitation",

  // PRD-18. Reaches members who saved a gathering or said maybe, never anyone
  // who already holds a seat. Pluralised on `count`, mirrored from the
  // payload's `seatsRemaining`.
  // Flat form for a row that arrived without a seat count: it still has to
  // read as a sentence rather than leaving "{seatsRemaining}" on screen.
  "type.event_nearly_full.text":
    "A gathering you were looking at is nearly full.",
  "type.event_nearly_full.text_one":
    "A gathering you were looking at has 1 spot left.",
  "type.event_nearly_full.text_other":
    "A gathering you were looking at has {seatsRemaining} spots left.",
  "type.event_nearly_full.meta": "Last few spots",

  "type.event_reminder.text": "A gathering you're going to is coming up.",
  "type.event_reminder.meta": "Gathering reminder",

  "type.waitlist_promoted.text": "A spot opened up. You're off the waitlist.",
  "type.waitlist_promoted.meta": "Gathering waitlist",

  "type.event_cancelled.text":
    "A gathering you're going to has been cancelled.",
  "type.event_cancelled.meta": "Gathering update",

  "type.event_updated.text": "Details changed for a gathering you're going to.",
  "type.event_updated.meta": "Gathering update",
  "type.event_updated.time.text":
    "The start time changed for a gathering you're going to.",
  "type.event_updated.time.meta": "Gathering update",
  "type.event_updated.location.text":
    "The location changed for a gathering you're going to.",
  "type.event_updated.location.meta": "Gathering update",

  // Platform-wide coverage sweep. Personalized kinds carry a
  // `<profile>{name}</profile>` `textNamed` slot; the system-driven ones
  // (join approved/declined, listing approved, report/appeal/roadmap updates)
  // have no actor and so only a generic `.text`.
  "type.event_rsvp.text": "Someone RSVP'd to your gathering.",
  "type.event_rsvp.textNamed":
    "<profile>{name}</profile> RSVP'd to your gathering.",
  "type.event_rsvp.meta": "Gathering RSVP",

  "type.community_reply.text": "Someone replied to your post.",
  "type.community_reply.textNamed":
    "<profile>{name}</profile> replied to your post.",
  "type.community_reply.meta": "Reply",

  "type.forum_thread_reply.text": "Someone replied to your thread.",
  "type.forum_thread_reply.textNamed":
    "<profile>{name}</profile> replied to your thread.",
  "type.forum_thread_reply.meta": "Reply",

  // Sent to a member who follows a topic when a new post lands on it (a
  // tagged forum thread). {topicLabel} comes from the payload.
  "type.topic_new_post.text":
    "Someone posted in a topic you follow: {topicLabel}.",
  "type.topic_new_post.textNamed":
    "<profile>{name}</profile> posted in a topic you follow: {topicLabel}.",
  "type.topic_new_post.meta": "Topic update",

  "type.join_request_received.text": "Someone asked to join your community.",
  "type.join_request_received.textNamed":
    "<profile>{name}</profile> asked to join your community.",
  "type.join_request_received.meta": "Join request",

  "type.join_request_approved.text":
    "You're in. Your request to join was approved.",
  "type.join_request_approved.meta": "Join request",

  "type.join_request_declined.text":
    "Your request to join wasn't accepted this time.",
  "type.join_request_declined.meta": "Join request",

  "type.job_application.text": "Someone applied to your job posting.",
  "type.job_application.textNamed":
    "<profile>{name}</profile> applied to your job posting.",
  "type.job_application.meta": "Job application",

  "type.listing_approved.text": "Your business listing is live.",
  "type.listing_approved.meta": "Listing approved",

  "type.report_resolved.text": "We've followed up on a report you filed.",
  "type.report_resolved.meta": "Report update",
  // PRD-289. The reporter's own receipt, written when they file. Before this
  // their first in-app word about their own report was `report_resolved`, up
  // to seven days later at the low severity band, so anyone who dismissed the
  // success toast held no record at all. Token-free on purpose: the payload
  // carries the case reference, and a sentence interpolating it renders broken
  // on any row whose payload allowlist entry has not landed.
  "type.report_received.text": "Your report is with the safety team.",
  "type.report_received.meta": "Report filed",

  // Duty mail for whoever can act on a new report. The bell never names the
  // reporter, so this copy never promises one. The `.emergency.*` variants are
  // outing and doxxing, the two reasons carrying a 1-hour SLA.
  "type.report_filed.text": "A new report is waiting in the moderation queue.",
  "type.report_filed.meta": "Report filed",
  "type.report_filed.emergency.text":
    "An urgent report needs a decision within the hour.",
  "type.report_filed.emergency.meta": "Urgent report",

  "type.community_report_filed.text":
    "Something in {communityName} has been reported.",
  "type.community_report_filed.meta": "Report in your community",
  // OPS-05. Reaches a community's owner, co-owners and moderators when
  // platform staff offer that community a hand. In-app and web push only:
  // QueerPulse sends no email, so this copy promises none. The row deep-links
  // to the mod-tools pane where the offer is read in full and answered.
  "type.community_support_offered.text":
    "Someone from QueerPulse has offered {communityName} a hand.",
  "type.community_support_offered.meta": "An offer of support",
  "type.community_report_filed.emergency.text":
    "An urgent report in {communityName} needs a decision within the hour.",
  "type.community_report_filed.emergency.meta": "Urgent report",

  // ── Ban-evasion escalations (PRD-31) ─────────────────────────────────────
  // The two rows that close the loop on a community moderator asking platform
  // staff to look at a join request. THE SAME RULE GOVERNS BOTH AS GOVERNS THE
  // FLAG ITSELF: neither may say more than it knows.
  //
  // The staff row is a work item. It names the community and says a moderator
  // asked. It never names the applicant and never hints at an answer, because
  // nobody has looked yet.
  //
  // The moderator's row says the escalation is closed and stops. What staff
  // found is the cross-community judgement the one-bit flag exists to withhold,
  // and the payload deliberately carries no note, no resolver and no verdict,
  // so the copy must not fill that silence with an implication. The second
  // sentence exists to say the obvious thing out loud: closing the escalation
  // decided nothing about the request, and the moderator still decides.
  //
  // Both are in-app only. QueerPulse sends no email, so neither may say
  // anything is on its way by any other channel.
  "type.ban_evasion_escalation_raised.text":
    "A moderator has asked platform staff to look at a join request in {communityName}.",
  "type.ban_evasion_escalation_raised.meta": "Ban evasion escalation",
  "type.ban_evasion_escalation_raised.communityFallback": "a community",
  "type.ban_evasion_escalation_resolved.text":
    "Platform staff have closed the escalation you raised in {communityName}. The decision on the join request is still yours.",
  "type.ban_evasion_escalation_resolved.meta": "Escalation closed",
  "type.ban_evasion_escalation_resolved.communityFallback":
    "the community you moderate",

  // ── Removed from a community (TS-10) ─────────────────────────────────────
  // The payload names no moderator, so this copy does not either. It does
  // carry the terms, because the bell is the only place the member can read
  // them: QueerPulse sends no email, and there is no way to message a
  // community's moderators. A timed bar and a permanent one get separate
  // sentences rather than one hedged string.
  // PRD-147. The author's own bell row for a takedown. Eight variants, because
  // the reason and the cited rule are each optional and the copy must not
  // promise either when it is absent. Names no moderator: the payload carries
  // no actor, following `community_banned`.
  "type.community_post_removed.post.meta": "A post was taken down",
  "type.community_post_removed.post.reason.meta": "A post was taken down",
  "type.community_post_removed.post.reason.text":
    "A moderator took your post in {communityName} down. The reason given: {reason}",
  "type.community_post_removed.post.reasonRule.meta": "A post was taken down",
  "type.community_post_removed.post.reasonRule.text":
    "A moderator took your post in {communityName} down, under its rule “{ruleText}”. The reason given: {reason}",
  "type.community_post_removed.post.rule.meta": "A post was taken down",
  "type.community_post_removed.post.rule.text":
    "A moderator took your post in {communityName} down, under its rule “{ruleText}”.",
  "type.community_post_removed.post.text":
    "A moderator took your post in {communityName} down. No reason was recorded.",
  "type.community_post_removed.reply.meta": "A reply was taken down",
  "type.community_post_removed.reply.reason.meta": "A reply was taken down",
  "type.community_post_removed.reply.reason.text":
    "A moderator took your reply in {communityName} down. The reason given: {reason}",
  "type.community_post_removed.reply.reasonRule.meta": "A reply was taken down",
  "type.community_post_removed.reply.reasonRule.text":
    "A moderator took your reply in {communityName} down, under its rule “{ruleText}”. The reason given: {reason}",
  "type.community_post_removed.reply.rule.meta": "A reply was taken down",
  "type.community_post_removed.reply.rule.text":
    "A moderator took your reply in {communityName} down, under its rule “{ruleText}”.",
  "type.community_post_removed.reply.text":
    "A moderator took your reply in {communityName} down. No reason was recorded.",
  "type.community_banned.permanent.text":
    "You have been removed from {communityName}. The reason given: {reason}",
  "type.community_banned.permanent.meta": "Removed from a community",
  "type.community_banned.permanent.rule.text":
    "You have been removed from {communityName} under its rule \u201c{ruleText}\u201d. The reason given: {reason}",
  "type.community_banned.permanent.rule.meta": "Removed from a community",
  "type.community_banned.timed.text":
    "You cannot post in {communityName} until {expiresAt}. The reason given: {reason}",
  "type.community_banned.timed.meta": "Paused in a community",
  "type.community_banned.timed.rule.text":
    "You cannot post in {communityName} until {expiresAt}, under its rule \u201c{ruleText}\u201d. The reason given: {reason}",
  "type.community_banned.timed.rule.meta": "Paused in a community",
  "type.community_banned.whenFallback": "a date that was not recorded",

  // ── Account and security (ID-06) ─────────────────────────────────────────
  // The only rows in this catalog about the ACCOUNT rather than the community.
  //
  // Two rules govern the wording, and both are about what a member reads on a
  // lock screen before they have decided to unlock the phone:
  //  - Nothing here names QueerPulse's subject matter, another member, or any
  //    content. A push preview that outs somebody is a harm this feature would
  //    have created rather than prevented.
  //  - Nothing here promises an email. QueerPulse delivers none. The channels
  //    are this bell and Web Push, which is what "here and on your phone"
  //    means in the settings copy.
  //
  // `{deviceLabel}` is the coarse server-stored name ("Chrome on macOS") and
  // `{when}` is resolved by `signInTimeToken` in the member's own language.
  "type.security_new_sign_in.text":
    "Your account was signed in to on {deviceLabel}, {when}. If that was you, nothing to do.",
  "type.security_new_sign_in.deviceFallback": "a device we don't recognise",
  "type.security_new_sign_in.meta": "New device signed in",
  // Used when the sign-in time cannot be read from the payload. Vague on
  // purpose: a wrong time on a security alert is worse than no time.
  "type.security_new_sign_in.whenFallback": "recently",
  // The lock-screen line for the same alert. Deliberately shorter and vaguer
  // than the bell copy: a push preview is read by whoever is holding the phone,
  // so it names no device and no time, only that there is something to open.

  "type.account_export_ready.text":
    "Your data export has finished and is ready to download.",
  "type.account_export_ready.meta": "Export ready",

  // `{daysRemaining}` comes straight from the payload. Phrased around what the
  // member can still do, because for these few days they still can.
  // Flat form, for a row whose payload carries no readable day count. The
  // plural forms below win whenever it does.
  "type.account_deletion_final_warning.text":
    "Your account is scheduled for deletion soon. You can still cancel until then.",
  "type.account_deletion_final_warning.text_one":
    "Your account is deleted in {daysRemaining} day. You can still cancel until then.",
  "type.account_deletion_final_warning.text_other":
    "Your account is deleted in {daysRemaining} days. You can still cancel until then.",
  "type.account_deletion_final_warning.meta": "Deletion scheduled",

  // A membership card thirty days from expiry (SUS-07). `{communityName}` and
  // `{daysRemaining}` come straight from the payload; `daysRemaining` is also
  // mirrored onto `count` so CLDR picks the plural.
  //
  // Two sets, because the two say different things to do. The `.renewable`
  // pair is used where the issuing programme lets a member renew their own
  // card, so the copy points at the button waiting for them. The plain pair is
  // used where it does not, so the copy points at the community instead of at
  // a control that is not there.
  //
  // Nothing here mentions any channel outside the app: the card, the count and
  // the action all live on the member's own cards page.
  "type.card_expiring.text":
    "Your membership card expires soon. The community issues the new one.",
  "type.card_expiring.text_one":
    "Your {communityName} card expires in {daysRemaining} day. The community issues the new one.",
  "type.card_expiring.text_other":
    "Your {communityName} card expires in {daysRemaining} days. The community issues the new one.",
  "type.card_expiring.meta": "Card expiring",
  "type.card_expiring.renewable.text":
    "Your membership card expires soon. You can renew it yourself.",
  "type.card_expiring.renewable.text_one":
    "Your {communityName} card expires in {daysRemaining} day. You can renew it yourself.",
  "type.card_expiring.renewable.text_other":
    "Your {communityName} card expires in {daysRemaining} days. You can renew it yourself.",
  "type.card_expiring.renewable.meta": "Card expiring",

  "type.appeal_resolved.text": "There's a decision on your appeal.",
  "type.appeal_resolved.meta": "Appeal update",

  // PRD-140. A community moderator inviting a member in. The type was absent
  // from the client's `NotificationKind` union, so this row rendered the
  // generic unknown copy: an invitation arrived as an unnamed nudge. The
  // community's name now travels in the payload so the row can be acted on.
  "type.community_invite_received.text":
    "You have been invited to {communityName}.",
  "type.community_invite_received.textNamed":
    "<profile>{name}</profile> invited you to {communityName}.",
  "type.community_invite_received.meta": "Community invitation",
  "type.invite_accepted.text": "Someone you invited just joined.",
  "type.invite_accepted.textNamed":
    "<profile>{name}</profile> joined on your invite.",
  "type.invite_accepted.meta": "Invite accepted",

  "type.listing_review.text": "Someone reviewed your business.",
  "type.listing_review.textNamed":
    "<profile>{name}</profile> reviewed your business.",
  "type.listing_review.meta": "New review",

  "type.roadmap_status.text": "There's an update on an idea you shared.",
  "type.roadmap_status.meta": "Roadmap update",

  // A shipped magazine issue (CON-05). `{issueNumber}` and `{issueTitle}` come
  // straight from the payload. This replaced an email digest, so the copy names
  // the page and nothing else: nothing is on its way anywhere.
  "type.magazine_issue_published.text":
    "Issue {issueNumber} is out: {issueTitle}. See what's in it.",
  "type.magazine_issue_published.meta": "New issue",

  // The magazine desk speaking to the WRITER of one piece (PRD-121), plus the
  // pre-existing `magazine_piece_message` kind, which had no copy at all and
  // so rendered the unknown-kind fallback for months.
  //
  // `titleFallback` is shared by all three PRD-121 rows through
  // `pieceTitleToken`, the same way the listing Q&A shares one subject
  // fallback: it is read inside quote marks in every sentence, so it has to
  // read like a title.
  "type.magazine_piece_commissioned.text":
    "You have a new piece to write: \u201C{title}\u201D.",
  "type.magazine_piece_commissioned.meta": "New assignment",
  "type.magazine_piece_commissioned.titleFallback": "Untitled",

  // The eight stage labels mirror the backend's `PieceStage` machine values,
  // which is what the payload carries. Translated here rather than borrowed
  // from the `magazine` namespace: that catalog is a separate lazily-loaded
  // chunk a member reading their bell has no reason to have loaded, and the
  // desk's own stage chips are a deliberately untranslated editorial
  // vocabulary while a bell row is member-facing copy. Same call
  // `type.verification_update.level.*` already made. The fallback covers a
  // stage added on the backend before this catalog learns about it, so a
  // writer never reads `sensitivity_read` on screen.
  "type.magazine_piece_stage_changed.text":
    "Your piece \u201C{title}\u201D moved to a new stage: {stage}.",
  "type.magazine_piece_stage_changed.meta": "Piece update",
  "type.magazine_piece_stage_changed.stage.commissioned": "Commissioned",
  "type.magazine_piece_stage_changed.stage.drafting": "Drafting",
  "type.magazine_piece_stage_changed.stage.in_review": "In review",
  "type.magazine_piece_stage_changed.stage.edit": "Edit",
  "type.magazine_piece_stage_changed.stage.sensitivity_read":
    "Sensitivity read",
  "type.magazine_piece_stage_changed.stage.layout": "Layout",
  "type.magazine_piece_stage_changed.stage.ready": "Ready to publish",
  "type.magazine_piece_stage_changed.stage.published": "Published",
  "type.magazine_piece_stage_changed.stageFallback": "A new stage",

  "type.magazine_piece_published.text":
    "Your piece \u201C{title}\u201D is live in the magazine.",
  "type.magazine_piece_published.meta": "Published",

  // `textNamed` carries the `<profile>` slot, like every other entry in
  // `PERSONALIZED_KINDS`. This row names no piece because the backend's
  // `PAYLOAD_ALLOWLIST` has no entry for `magazine_piece_message`, so
  // `pieceId`/`messageId` are stripped before the client sees them. The
  // message body never reaches a bell and no copy here may quote it.
  "type.magazine_piece_message.text":
    "You have a new message about a piece on the magazine desk.",
  "type.magazine_piece_message.textNamed":
    "<profile>{name}</profile> sent you a message about a piece on the desk.",
  "type.magazine_piece_message.meta": "Desk message",

  // Concern outcome — headline per terminal status (resolved/dismissed); the
  // flat keys are the fallback for an unrecognised status.
  "type.concern_update.text": "There's an update on a concern you raised.",
  "type.concern_update.meta": "Concern update",
  "type.concern_update.resolved.text":
    "The concern you raised has been reviewed and resolved.",
  "type.concern_update.resolved.meta": "Concern update",
  "type.concern_update.dismissed.text":
    "The concern you raised has been reviewed and closed.",
  "type.concern_update.dismissed.meta": "Concern update",
  // PRD-261: the bell used to fire only on a terminal outcome, so a submitter
  // heard nothing while their concern was being worked on. `reviewing` now
  // fires too. Built at runtime by `concernUpdateKeyFor`, so neither key
  // appears as a literal anywhere: an unused-key scan will call both dead.
  "type.concern_update.reviewing.text":
    "Someone is looking at the concern you raised.",
  "type.concern_update.reviewing.meta": "Concern update",

  // ── Intake outcomes ──────────────────────────────────────────────────────
  // Every form in the backend's `intake_submissions` table EXCEPT a governance
  // concern, which keeps the `concern_update` copy above. These used to borrow
  // it, so a member who sent Culture a playlist was told their "concern" had
  // been reviewed. `{form}` is resolved by `intakeFormToken` from the payload's
  // `kind`, so the row names the form they actually filled in.
  "type.intake_reviewed.text": "We've reviewed what you sent us.",
  "type.intake_reviewed.meta": "Submission reviewed",
  "type.intake_reviewed.resolved.text":
    "We've reviewed {form} and we're taking it forward.",
  "type.intake_reviewed.resolved.meta": "Submission reviewed",
  "type.intake_reviewed.dismissed.text":
    "We've reviewed {form}. We're not taking it further this time.",
  "type.intake_reviewed.dismissed.meta": "Submission reviewed",
  // One per backend intake kind. Each reads as the object of "We've reviewed
  // …", so they stay lowercase and name the thing rather than the form.
  "type.intake_reviewed.form.grant": "your micro-grant application",
  "type.intake_reviewed.form.suggest_edit": "your suggested edit",
  "type.intake_reviewed.form.sober_host": "your alcohol-free listing",
  "type.intake_reviewed.form.panel_signup": "your panel sign-up",
  "type.intake_reviewed.form.incubator_cohort":
    "your incubator cohort application",
  "type.intake_reviewed.form.incubator_mentor": "your mentor sign-up",
  "type.intake_reviewed.form.incubator_session": "your session request",
  "type.intake_reviewed.form.culture_suggest_pick": "your suggested pick",
  "type.intake_reviewed.form.culture_post_project": "your project post",
  "type.intake_reviewed.form.culture_submit_work": "the work you submitted",
  "type.intake_reviewed.form.culture_submit_playlist": "your playlist",
  // Used when the payload names a form this catalog has not learned yet.
  "type.intake_reviewed.formFallback": "what you sent us",

  // ── Data-subject request outcome ─────────────────────────────────────────
  // A statutory data right, reported back as one. This also used to borrow
  // `concern_update`. `{reference}` is the member's own case number, the same
  // string the data-request page lists in their history, which is where the row
  // links. Nothing here promises an email: QueerPulse sends none.
  "type.dsar_resolved.text":
    "There's a decision on the data request you filed.",
  "type.dsar_resolved.meta": "Data request",
  "type.dsar_resolved.resolved.text":
    "Your data request is complete. Reference: {reference}.",
  "type.dsar_resolved.resolved.meta": "Data request",
  "type.dsar_resolved.rejected.text":
    "Your data request was reviewed and couldn't be granted. Reference: {reference}.",
  "type.dsar_resolved.rejected.meta": "Data request",
  // Used when the case number cannot be read from the payload, so the sentence
  // stays whole rather than ending in "Reference: .".
  "type.dsar_resolved.referenceFallback": "not recorded",

  // An admin manually adjusted the member's verification standing
  // (VerificationService.override). Names only the level they were moved to;
  // {level} is one of the four labels just below.
  "type.verification_update.text":
    "Your verification level was updated to {level}.",
  "type.verification_update.meta": "Verification update",
  "type.verification_update.level.none": "None",
  "type.verification_update.level.email": "Email",
  "type.verification_update.level.phone": "Phone",
  "type.verification_update.level.id_verified": "ID-verified",
  // Fallback for a `toLevel` this build doesn't recognise (a future ladder
  // rung an old client doesn't know) — keeps the row honest instead of
  // interpolating a raw enum value.
  "type.verification_update.levelFallback": "a new level",

  // A member's own verification request was approved
  // (VerificationService.decideRequest). Reuses the same {level} labels as
  // the override copy above, sourced from `requestedLevel` since an approval
  // always grants the level that was requested.
  "type.verification_update.approved.text":
    "Your verification request was approved. You're now verified to {level}.",
  "type.verification_update.approved.meta": "Verification update",

  // A member's own verification request was declined
  // (VerificationService.decideRequest). No level changed, so the copy never
  // names one. {reason} is the admin's note explaining the decision.
  "type.verification_update.rejected.text":
    "Your verification request was declined.",
  "type.verification_update.rejected.meta": "{reason}",
  // Fallback for a rejection row with no reason on the payload (shouldn't
  // happen — the backend requires one to reject — but read defensively).
  "type.verification_update.rejected.reasonFallback": "No reason was shared.",

  // Moderation outcome — headline per action; the moderator's member-facing note
  // ("the reason the member reads") rides in as {note}. Tapping opens the appeal
  // page. The flat keys are the fallback for an unrecognised action.
  "type.moderation_outcome.text":
    "There's a decision from the moderation team.",
  "type.moderation_outcome.meta": "{note}",
  "type.moderation_outcome.warn.text":
    "You've received a warning from the moderation team.",
  "type.moderation_outcome.warn.meta": "{note}",
  "type.moderation_outcome.suspend.text": "Your account has been suspended.",
  "type.moderation_outcome.suspend.meta": "{note}",
  "type.moderation_outcome.ban.text":
    "Your account has been permanently suspended.",
  "type.moderation_outcome.ban.meta": "{note}",
  // A lifted restriction is good news, and the generic
  // "there's a decision from the moderation team" line reads as more bad news
  // arriving. It gets its own sentence for that reason.
  "type.moderation_outcome.restriction_lifted.text":
    "Your restriction has been lifted.",
  "type.moderation_outcome.restriction_lifted.meta": "{note}",

  // A fellow member credited a persona of yours as a collaborator on one of
  // their items (personas discovery Phase 5, Moment 6). The first live kind
  // whose `.actions` the adapter populates — see `notificationDtoToView`.
  "type.subprofile_credit.text":
    "{subprofileName} credited you on {itemTitle}.",
  "type.subprofile_credit.meta": "Persona credit",

  // PRD-208. New work from a persona this member follows. Names the PERSONA
  // and never the human behind it: the payload carries no actor key at all, so
  // an unlinked persona stays pseudonymous. `{subprofileName}` is the payload's
  // own field name, the same one `subprofile_credit` above interpolates.
  // CLDR-pluralised: `formatNotification` mirrors the payload's `newItemCount`
  // onto `count`, and the flat `.text` covers a row that arrived without one.
  "type.persona_update.text": "{subprofileName} published something new.",
  "type.persona_update.text_one":
    "{subprofileName} published a new piece of work.",
  "type.persona_update.text_other":
    "{subprofileName} published {count} new pieces of work.",
  "type.persona_update.meta": "Persona you follow",

  // Sent when the XP/badge awarding engine credits a member across a level
  // threshold. System-driven (no actor); {level}/{name} come from the payload.
  "type.xp_level_up.text": "You reached Level {level}, {name}.",
  "type.xp_level_up.meta": "Level up",

  // Sent when the XP/badge awarding engine grants a member a badge.
  // System-driven (no actor); {badgeName} comes from the payload.
  "type.badge_earned.text": "You earned the {badgeName} badge.",
  "type.badge_earned.meta": "Badge earned",

  "type.writer_application_approved.text":
    "Your writer application was approved. You can submit stories now.",
  "type.writer_application_approved.meta": "Writer application",
  "type.writer_application_declined.text":
    "Your writer application wasn't accepted this time.",
  "type.writer_application_declined.meta": "Writer application",

  // A staff decision on a story a member sent the magazine. {workingTitle} is
  // the member's OWN headline, read back to them. The desk's reply note is not
  // in the payload — it waits on their submissions tracker.
  "type.story_submission_decided.accepted.text":
    "The magazine accepted \u201C{workingTitle}\u201D. Open your submissions to read the desk's reply.",
  "type.story_submission_decided.accepted.meta": "Story submission",
  "type.story_submission_decided.commissioned.text":
    "\u201C{workingTitle}\u201D has been commissioned. Open your submissions to read the desk's reply.",
  "type.story_submission_decided.commissioned.meta": "Story submission",
  "type.story_submission_decided.declined.text":
    "\u201C{workingTitle}\u201D wasn't taken this time. Open your submissions to read the desk's reply.",
  "type.story_submission_decided.declined.meta": "Story submission",
  "type.story_submission_decided.text":
    "The magazine has decided on \u201C{workingTitle}\u201D.",
  "type.story_submission_decided.meta": "Story submission",

  "type.volunteer_application_received.text":
    "Someone applied to volunteer for one of your opportunities.",
  "type.volunteer_application_received.meta": "Volunteer application",
  "type.volunteer_application_decided.accepted.text":
    "Your volunteer application was accepted.",
  "type.volunteer_application_decided.accepted.meta": "Volunteer application",
  "type.volunteer_application_decided.declined.text":
    "Your volunteer application wasn't accepted this time.",
  "type.volunteer_application_decided.declined.meta": "Volunteer application",
  "type.volunteer_application_decided.text":
    "There's an update on your volunteer application.",
  "type.volunteer_application_decided.meta": "Volunteer application",

  "type.changemaker_nomination_approved.text":
    "Your nomination of {nomineeName} was approved. We're starting their story.",
  "type.changemaker_nomination_approved.meta": "Changemaker nomination",
  "type.changemaker_nomination_dismissed.text":
    "Your nomination of {nomineeName} wasn't taken forward this time.",
  "type.changemaker_nomination_dismissed.meta": "Changemaker nomination",

  // A swap proposal on one of your skill-exchange posts. The payload carries
  // the listing id and the offer line only, so the meta names which swap and
  // the row sends you to the inbox to read what they actually wrote. The offer
  // sits in `meta` rather than in `textNamed`, whose only interpolation slot is
  // `{name}` (see `NotificationItem`).
  "type.barter_proposal_received.text":
    "Someone proposed a swap on your skill exchange post.",
  "type.barter_proposal_received.textNamed":
    "<profile>{name}</profile> proposed a swap on your skill exchange post.",
  "type.barter_proposal_received.meta": "Skill exchange · {listingOffer}",
  "type.barter_proposal_received.offerFallback": "a swap you posted",

  "type.unknown.text": "You have a new notification.",
  "type.unknown.meta": "Notification",

  // Notifications page chrome
  "page.title": "Notifications",
  "page.markAllRead": "Mark all as read",
  "page.markReadError":
    "We couldn't mark that as read. It's still waiting for you. Try again in a moment.",
  "page.markAllReadError":
    "We couldn't mark those as read. They're still waiting for you. Try again in a moment.",
  // PRD-224: clearing a row deletes it server-side, so it stays gone on every
  // device. The error puts the row back, and says so.
  "page.dismissedToast": "Notification cleared",
  "page.dismissError":
    "We couldn't clear that notification. It's still in your list. Try again in a moment.",
  "page.dayRecent": "Today & recent",
  "page.dayEarlier": "Earlier",
  "page.empty.title": "All caught up",
  "page.empty.description": "No notifications in this category.",
  "page.error.title": "We couldn't load your notifications",
  "page.error.description":
    "Something went wrong reaching the server. This isn't an empty inbox. Try again in a moment.",
  "page.error.retry": "Try again",
  "page.loadMoreCta": "Load more notifications",
  "page.loadingMore": "Loading…",

  // Filter tabs (data.tsx's notificationTabs + the link-style Mentions tab)
  // ── Bundled rows (SOC-10) ─────────────────────────────────────────────────
  // Appended after the row's own text, so "Ana replied" becomes
  // "Ana replied and 39 others". One row for one conversation: forty replies to
  // a thread used to be forty rows, forty unread, and forty taps to clear.
  "bundle.others_one": "and 1 other",
  "bundle.others_other": "and {count} others",

  "tabs.all": "All",
  "tabs.events": "Events",
  "tabs.community": "Community",
  "tabs.platform": "Platform",
  "tabs.mentions": "Mentions",

  // Shared action-button labels across the demo notification list
  // PRD-224: accessible name for the icon-only clear button on every row. Never
  // rendered as visible text, so it names what is being cleared.
  "actions.dismiss": "Clear this notification",
  "actions.viewThread": "View thread",
  "actions.viewEvent": "View event",
  "actions.viewProfile": "View profile",
  "actions.accept": "Accept",
  "actions.decline": "Decline",
  // PRD-15. Confirmations for the two answers the "wants to connect" row now
  // carries. The row is removed once the server agrees, so these say what
  // actually happened rather than what was attempted.
  "actions.acceptedToast": "Connected with {name}",
  "actions.declinedToast": "Politely declined",
  "actions.readNow": "Read now",
  "actions.seeDetails": "See details",
  // PRD-31: the demo ban-evasion row sends its moderator back to their own
  // join queue, which is where the decision on the request still waits.
  "actions.openRequestsQueue": "Open the requests queue",
  "actions.seeBarterBoard": "See barter board",
  "actions.viewReplies": "View replies",
  "actions.readReport": "Read report",
  // Actions on a subprofile_credit notification (personas discovery Phase 5,
  // Moment 6) — the first live kind with actions at all.
  "actions.makePersona": "Make a persona for this",
  "actions.seeTheWork": "See the work",

  // Demo notification list (notificationsList.data.tsx) — mirrors, per row,
  // what `formatNotification` produces for the analogous live `type`, but with
  // richer flavour text. Proper nouns (event/community/feature names, quoted
  // post titles) stay as `{token}` values, never translated.
  "list.2.text":
    "Your RSVP for <strong>{title}</strong> has been confirmed. The event is on {date} at {venue}.",
  "list.2.meta": "Event · Gathering",
  "list.3.text":
    "<strong>{name}</strong> invited you to join <strong>{group}</strong> reading group.",
  "list.3.meta": "Reading group · Invitation",
  "list.3.joinedToast": "Joined {group} reading group",
  "list.3.declinedToast": "Invitation declined",
  "list.4.text":
    "<strong>{name}</strong> mentioned you in the Forum thread: “{quote}”",
  "list.4.meta": "Forum · Mention",
  "list.5.text":
    "<strong>{title}</strong> is now available. Cover story: {cover}",
  "list.5.meta": "Magazine · June 2026",
  "list.6.text":
    "Reminder: <strong>{group}</strong> reading group meets {when} at {time} in Mouraria. {spots}",
  "list.6.meta": "Reading group · Reminder",
  "list.6.spots_one": "{count} spot still open.",
  "list.6.spots_other": "{count} spots still open.",
  "list.7.text": "<strong>{name}</strong> accepted your connection request.",
  "list.7.meta": "Connection",
  "list.8.text":
    "New platform feature: <strong>{feature}</strong> now supports service bundles. You can offer multi-session packages.",
  "list.8.meta": "Platform update",
  "list.9.text":
    "The <strong>{event}</strong> you attended has a follow-up discussion scheduled for {date}.",
  "list.9.meta": "Event · Follow-up",
  "list.11.text_one":
    'Your post in the Forum ("{postTitle}") received {count} reply.',
  "list.11.text_other":
    'Your post in the Forum ("{postTitle}") received {count} replies.',
  "list.11.meta": "Forum · Activity",
  "list.12.text":
    "The <strong>{report}</strong> has been published. Moderation stats and finances are now live.",
  "list.12.meta": "Governance · Quarterly report",
  "list.13.text":
    "<strong>{subprofileName}</strong> credited you on {itemTitle}.",
  "list.13.meta": "Persona credit",

  // Mentions thread (MentionsPanel.tsx / mentions.data.tsx)
  "mentions.day.today": "Today",
  "mentions.day.yesterday": "Yesterday",
  "mentions.day.thisWeek": "This week",
  "mentions.tabs.all": "All",
  "mentions.tabs.unread": "Unread",
  "mentions.tabs.posts": "In posts",
  "mentions.tabs.articles": "In articles",
  "mentions.tabs.events": "In events",
  "mentions.unreadSummary_one": "{count} unread",
  "mentions.unreadSummary_other": "{count} unread",
  "mentions.oldestFrom": "· oldest from {when}",
  "mentions.ago.justNow": "just now",
  "mentions.ago.unknown": "recently",
  "mentions.allCaughtUp": "All caught up",
  "mentions.markAllRead": "Mark all read",
  "mentions.markAllReadToast": "All marked as read",
  "mentions.empty.title": "No mentions here",
  "mentions.loadErrorBody":
    "We couldn't load your mentions. Anything waiting for you is still there. Try again in a moment.",
  "mentions.empty.description":
    "Nothing in this view right now. When someone tags you, it’ll show up here. No need to go looking.",
  // Live has no mentions inbox endpoint yet — shown instead of a silent empty
  // list so the surface reads as honestly unfinished, not broken (MentionsPanel).
  "mentions.composer.placeholder": "Reply to {name}…",
  "mentions.row.read": "Read",
  "mentions.row.going": "Going",
  "mentions.row.rsvpGoingToast": "You’re going · {name}’s invite",
  "mentions.row.rsvpWithdrawnToast": "RSVP withdrawn",
  "mentions.row.genericToast": "{label} · {name}",
  "mentions.actions.reply": "Reply",
  "mentions.actions.openThread": "Open thread",
  "mentions.actions.markRead": "Mark read",
  "mentions.actions.openArticle": "Open article",
  "mentions.actions.rsvp": "RSVP",
  "mentions.actions.openPost": "Open post",
  "mentions.where.prefix": "In",
  "mentions.context.reply": "in a reply",
  "mentions.context.articleComment": "in an article comment",
  "mentions.context.namedInvite": "in {name} invite",
  "mentions.context.communityPost": "in a {community} post",
  "mentions.context.thread": "in a thread",
  "mentions.context.eventInvite": "in an event invite",
  "mentions.context.communityReply": "in a {community} reply",
  // Live inbox (GET /mentions) — day bucket + fallbacks when the backend row
  // carries no resolved source label / actor (MentionsPanel via mentions.adapters).
  "mentions.day.earlier": "Earlier",
  "mentions.liveContext.community": "in a community post",
  "mentions.liveContext.generic": "mentioned you",
  "mentions.liveWhere.fallback": "the conversation",
  "mentions.liveActor.unknown": "Someone",

  // Notification deep-link preview (NotificationDeepLinkPage.tsx / Cards.tsx)
  "deepLink.sentReply.you": "You",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // W0-NOTIF-B — PRD-47 - the personalised variant of the review-reply row. `review_replied` is now in PERSONALIZED_KINDS in notifications.adapters.ts (the set W0-NOTIF's note called NAMED_KINDS; PERSONALIZED_KINDS is its real name), so an actor-bearing row can read as a sentence with the replier's name in it instead of saying 'Someone replied' next to their face and profile link. It DEGRADES CORRECTLY WITH NO ACTOR and needs no extra key for that: NotificationItem only reaches `actor.textKey` inside its `if (dto.actor)` branch, so a moderator-written reply, a co-manager's reply, and a reply from a business owner whose public page does not name them all keep the generic type.review_replied.text, which already carries {subjectLabel}. The named string does NOT carry the business name, and cannot: NotificationItem passes {name} and nothing else into a textNamed string, the same constraint type.barter_proposal_received.textNamed hit. The reviewed thing is still one click away through sourceHref, which resolves 'listing' + listingSlug to the business page the reply is published on. COORDINATOR NOTE: if you want the business name back on a named row, the place for it is type.review_replied.meta (currently 'Reply to your review'), which formatNotification does interpolate {subjectLabel} into. That key belongs to W0-NOTIF's manifest, so it is deliberately not redefined here rather than clobbered. Nothing here says anything is emailed or on its way: QueerPulse sends no email.
  // W0-NOTIF — PRD-48 - the two shared rows behind the intake primitive. `submission_decided` branches on payload.kind AND payload.outcome, laid out exactly like type.volunteer_application_decided.* (a key set per outcome plus a flat fallback), with one extra step because it has two discriminators: `<kind>.<outcome>` when both are known, `<kind>` when only the kind is, and flat when neither is. Every .meta is `{reviewNote}`, the same shape type.moderation_outcome.*.meta uses: these intakes have no member-facing tracker page and QueerPulse sends NO email, so the bell is the only place the reviewer's reason can be read at all. `submissionNoteToken` falls the meta back to the kind's own short label when no note was given, and `submissionSubjectToken` falls `{subjectLabel}` back to the per-kind phrase the sentence is written around. A declined outcome is written plainly, with no apology and no hint that it might yet change. No string here says anything is on its way, is being emailed, or will arrive in an inbox. `review_replied` has no textNamed key on purpose: `review_replied` is not in NAMED_KINDS in notifications.adapters.ts (a file this agent does not own), so the personalised variant would be dead copy until that one-line edit lands.
  "type.review_replied.textNamed":
    "<profile>{name}</profile> replied to your review.",
  "type.submission_decided.text": "There is news about something you sent in.",
  "type.submission_decided.meta": "{reviewNote}",
  "type.submission_decided.subjectFallback": "something you sent in",
  "type.submission_decided.labelFallback": "Submission",
  "type.submission_decided.partner_application.label": "Partner application",
  "type.submission_decided.partner_application.subjectFallback":
    "your organisation",
  "type.submission_decided.partner_application.text":
    "There is a decision on your partner application for {subjectLabel}.",
  "type.submission_decided.partner_application.meta": "{reviewNote}",
  "type.submission_decided.partner_application.accepted.text":
    "Your partner application for {subjectLabel} was accepted.",
  "type.submission_decided.partner_application.accepted.meta": "{reviewNote}",
  "type.submission_decided.partner_application.declined.text":
    "Your partner application for {subjectLabel} was not accepted.",
  "type.submission_decided.partner_application.declined.meta": "{reviewNote}",
  "type.submission_decided.partner_application.archived.text":
    "Your partner application for {subjectLabel} was closed without a decision.",
  "type.submission_decided.partner_application.archived.meta": "{reviewNote}",
  "type.submission_decided.barter_proposal.label": "Swap proposal",
  "type.submission_decided.barter_proposal.subjectFallback": "a listing",
  "type.submission_decided.barter_proposal.text":
    "There is an answer to your swap proposal on {subjectLabel}.",
  "type.submission_decided.barter_proposal.meta": "{reviewNote}",
  "type.submission_decided.barter_proposal.accepted.text":
    "Your swap proposal on {subjectLabel} was accepted.",
  "type.submission_decided.barter_proposal.accepted.meta": "{reviewNote}",
  "type.submission_decided.barter_proposal.declined.text":
    "Your swap proposal on {subjectLabel} was turned down.",
  "type.submission_decided.barter_proposal.declined.meta": "{reviewNote}",
  "type.submission_decided.barter_proposal.archived.text":
    "Your swap proposal on {subjectLabel} was closed. That listing is no longer open.",
  "type.submission_decided.barter_proposal.archived.meta": "{reviewNote}",
  "type.submission_decided.resource_suggestion.label": "Resource suggestion",
  "type.submission_decided.resource_suggestion.subjectFallback": "a resource",
  "type.submission_decided.resource_suggestion.text":
    "There is a decision on your suggestion of {subjectLabel}.",
  "type.submission_decided.resource_suggestion.meta": "{reviewNote}",
  "type.submission_decided.resource_suggestion.accepted.text":
    "Your suggestion of {subjectLabel} is now in the resources directory.",
  "type.submission_decided.resource_suggestion.accepted.meta": "{reviewNote}",
  "type.submission_decided.resource_suggestion.declined.text":
    "Your suggestion of {subjectLabel} was not added to the directory.",
  "type.submission_decided.resource_suggestion.declined.meta": "{reviewNote}",
  "type.submission_decided.resource_suggestion.archived.text":
    "Your suggestion of {subjectLabel} was closed without a decision.",
  "type.submission_decided.resource_suggestion.archived.meta": "{reviewNote}",
  "type.review_replied.text":
    "Someone replied to your review of {subjectLabel}.",
  "type.review_replied.meta": "Reply to your review",
  "type.review_replied.subjectFallback": "something you reviewed",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // W0-NOTIF-B — PRD-47 - the personalised variant of the review-reply row. `review_replied` is now in PERSONALIZED_KINDS in notifications.adapters.ts (the set W0-NOTIF's note called NAMED_KINDS; PERSONALIZED_KINDS is its real name), so an actor-bearing row can read as a sentence with the replier's name in it instead of saying 'Someone replied' next to their face and profile link. It DEGRADES CORRECTLY WITH NO ACTOR and needs no extra key for that: NotificationItem only reaches `actor.textKey` inside its `if (dto.actor)` branch, so a moderator-written reply, a co-manager's reply, and a reply from a business owner whose public page does not name them all keep the generic type.review_replied.text, which already carries {subjectLabel}. The named string does NOT carry the business name, and cannot: NotificationItem passes {name} and nothing else into a textNamed string, the same constraint type.barter_proposal_received.textNamed hit. The reviewed thing is still one click away through sourceHref, which resolves 'listing' + listingSlug to the business page the reply is published on. COORDINATOR NOTE: if you want the business name back on a named row, the place for it is type.review_replied.meta (currently 'Reply to your review'), which formatNotification does interpolate {subjectLabel} into. That key belongs to W0-NOTIF's manifest, so it is deliberately not redefined here rather than clobbered. Nothing here says anything is emailed or on its way: QueerPulse sends no email.
  // W0-NOTIF — PRD-48 - the two shared rows behind the intake primitive. `submission_decided` branches on payload.kind AND payload.outcome, laid out exactly like type.volunteer_application_decided.* (a key set per outcome plus a flat fallback), with one extra step because it has two discriminators: `<kind>.<outcome>` when both are known, `<kind>` when only the kind is, and flat when neither is. Every .meta is `{reviewNote}`, the same shape type.moderation_outcome.*.meta uses: these intakes have no member-facing tracker page and QueerPulse sends NO email, so the bell is the only place the reviewer's reason can be read at all. `submissionNoteToken` falls the meta back to the kind's own short label when no note was given, and `submissionSubjectToken` falls `{subjectLabel}` back to the per-kind phrase the sentence is written around. A declined outcome is written plainly, with no apology and no hint that it might yet change. No string here says anything is on its way, is being emailed, or will arrive in an inbox. `review_replied` has no textNamed key on purpose: `review_replied` is not in NAMED_KINDS in notifications.adapters.ts (a file this agent does not own), so the personalised variant would be dead copy until that one-line edit lands.

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // LEAK-02 — LEAK-02 task 4 - copy for `listing_public_question_answered`, the row that goes to the MEMBER WHO ASKED a public question on a business page. The type has been written since AddListingPublicQuestionNotificationTypes1794300000000 and was absent from KIND_CATEGORY in formatNotification.ts, so until now it rendered the `unknown` fallback: a member got generic platform copy as the answer to a question they personally typed. All three keys are NEW; nothing here overwrites an existing key. THE SENTENCE IS WRITTEN FOR NO ACTOR, deliberately, because that is the common case rather than the edge one: the public Q&A attributes an answer by ROLE only, a co-manager is invisible on the page by design, and an owner who is anonymous or withheld linkToProfile has told the platform not to tie their name to the business, so the backend spreads payload.actorId only where the page already links that owner's profile. The asker is owed the ANSWER, never the name of whoever wrote it, and the copy therefore never names or implies a person. There is also no `textNamed` key on purpose: `listing_public_question_answered` is not in PERSONALIZED_KINDS in notifications.adapters.ts (a file LEAK-02 does not own), so a personalised variant would be dead copy. `subjectFallback` covers a malformed payload with no `listingName`, so a brace token can never reach the screen. The row deep-links to the business page the answer is published on, so the answer TEXT is not in the copy and must never be added to it. Nothing here says anything is emailed or on its way: QueerPulse sends no email.
  // W0-NOTIF-B — PRD-47 - the personalised variant of the review-reply row. `review_replied` is now in PERSONALIZED_KINDS in notifications.adapters.ts (the set W0-NOTIF's note called NAMED_KINDS; PERSONALIZED_KINDS is its real name), so an actor-bearing row can read as a sentence with the replier's name in it instead of saying 'Someone replied' next to their face and profile link. It DEGRADES CORRECTLY WITH NO ACTOR and needs no extra key for that: NotificationItem only reaches `actor.textKey` inside its `if (dto.actor)` branch, so a moderator-written reply, a co-manager's reply, and a reply from a business owner whose public page does not name them all keep the generic type.review_replied.text, which already carries {subjectLabel}. The named string does NOT carry the business name, and cannot: NotificationItem passes {name} and nothing else into a textNamed string, the same constraint type.barter_proposal_received.textNamed hit. The reviewed thing is still one click away through sourceHref, which resolves 'listing' + listingSlug to the business page the reply is published on. COORDINATOR NOTE: if you want the business name back on a named row, the place for it is type.review_replied.meta (currently 'Reply to your review'), which formatNotification does interpolate {subjectLabel} into. That key belongs to W0-NOTIF's manifest, so it is deliberately not redefined here rather than clobbered. Nothing here says anything is emailed or on its way: QueerPulse sends no email.
  // W0-NOTIF — PRD-48 - the two shared rows behind the intake primitive. `submission_decided` branches on payload.kind AND payload.outcome, laid out exactly like type.volunteer_application_decided.* (a key set per outcome plus a flat fallback), with one extra step because it has two discriminators: `<kind>.<outcome>` when both are known, `<kind>` when only the kind is, and flat when neither is. Every .meta is `{reviewNote}`, the same shape type.moderation_outcome.*.meta uses: these intakes have no member-facing tracker page and QueerPulse sends NO email, so the bell is the only place the reviewer's reason can be read at all. `submissionNoteToken` falls the meta back to the kind's own short label when no note was given, and `submissionSubjectToken` falls `{subjectLabel}` back to the per-kind phrase the sentence is written around. A declined outcome is written plainly, with no apology and no hint that it might yet change. No string here says anything is on its way, is being emailed, or will arrive in an inbox. `review_replied` has no textNamed key on purpose: `review_replied` is not in NAMED_KINDS in notifications.adapters.ts (a file this agent does not own), so the personalised variant would be dead copy until that one-line edit lands.
  "type.listing_public_question_answered.text":
    "Your question about {listingName} was answered.",
  "type.listing_public_question_answered.meta": "Answer to your question",
  "type.listing_public_question_answered.subjectFallback":
    "a place in the directory",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // COORD — COORD - the OWNER's half of a listing's public Q&A. It was missing from the frontend's known-kind list, so a business owner's 'somebody asked you a question' row rendered the unknown-kind fallback. Copy is written to work with or without a named asker, and never carries the question text: that is published on the listing page this row opens.
  // LEAK-02 — LEAK-02 task 4 - copy for `listing_public_question_answered`, the row that goes to the MEMBER WHO ASKED a public question on a business page. The type has been written since AddListingPublicQuestionNotificationTypes1794300000000 and was absent from KIND_CATEGORY in formatNotification.ts, so until now it rendered the `unknown` fallback: a member got generic platform copy as the answer to a question they personally typed. All three keys are NEW; nothing here overwrites an existing key. THE SENTENCE IS WRITTEN FOR NO ACTOR, deliberately, because that is the common case rather than the edge one: the public Q&A attributes an answer by ROLE only, a co-manager is invisible on the page by design, and an owner who is anonymous or withheld linkToProfile has told the platform not to tie their name to the business, so the backend spreads payload.actorId only where the page already links that owner's profile. The asker is owed the ANSWER, never the name of whoever wrote it, and the copy therefore never names or implies a person. There is also no `textNamed` key on purpose: `listing_public_question_answered` is not in PERSONALIZED_KINDS in notifications.adapters.ts (a file LEAK-02 does not own), so a personalised variant would be dead copy. `subjectFallback` covers a malformed payload with no `listingName`, so a brace token can never reach the screen. The row deep-links to the business page the answer is published on, so the answer TEXT is not in the copy and must never be added to it. Nothing here says anything is emailed or on its way: QueerPulse sends no email.
  // W0-NOTIF-B — PRD-47 - the personalised variant of the review-reply row. `review_replied` is now in PERSONALIZED_KINDS in notifications.adapters.ts (the set W0-NOTIF's note called NAMED_KINDS; PERSONALIZED_KINDS is its real name), so an actor-bearing row can read as a sentence with the replier's name in it instead of saying 'Someone replied' next to their face and profile link. It DEGRADES CORRECTLY WITH NO ACTOR and needs no extra key for that: NotificationItem only reaches `actor.textKey` inside its `if (dto.actor)` branch, so a moderator-written reply, a co-manager's reply, and a reply from a business owner whose public page does not name them all keep the generic type.review_replied.text, which already carries {subjectLabel}. The named string does NOT carry the business name, and cannot: NotificationItem passes {name} and nothing else into a textNamed string, the same constraint type.barter_proposal_received.textNamed hit. The reviewed thing is still one click away through sourceHref, which resolves 'listing' + listingSlug to the business page the reply is published on. COORDINATOR NOTE: if you want the business name back on a named row, the place for it is type.review_replied.meta (currently 'Reply to your review'), which formatNotification does interpolate {subjectLabel} into. That key belongs to W0-NOTIF's manifest, so it is deliberately not redefined here rather than clobbered. Nothing here says anything is emailed or on its way: QueerPulse sends no email.
  // W0-NOTIF — PRD-48 - the two shared rows behind the intake primitive. `submission_decided` branches on payload.kind AND payload.outcome, laid out exactly like type.volunteer_application_decided.* (a key set per outcome plus a flat fallback), with one extra step because it has two discriminators: `<kind>.<outcome>` when both are known, `<kind>` when only the kind is, and flat when neither is. Every .meta is `{reviewNote}`, the same shape type.moderation_outcome.*.meta uses: these intakes have no member-facing tracker page and QueerPulse sends NO email, so the bell is the only place the reviewer's reason can be read at all. `submissionNoteToken` falls the meta back to the kind's own short label when no note was given, and `submissionSubjectToken` falls `{subjectLabel}` back to the per-kind phrase the sentence is written around. A declined outcome is written plainly, with no apology and no hint that it might yet change. No string here says anything is on its way, is being emailed, or will arrive in an inbox. `review_replied` has no textNamed key on purpose: `review_replied` is not in NAMED_KINDS in notifications.adapters.ts (a file this agent does not own), so the personalised variant would be dead copy until that one-line edit lands.
  "type.listing_public_question.text":
    "Someone asked a question on {listingName}.",
  "type.listing_public_question.meta": "Question on your listing",
  "type.listing_public_question.subjectFallback": "your listing",
};
