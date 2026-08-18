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

  "type.event_reminder.text": "A gathering you're going to is coming up.",
  "type.event_reminder.meta": "Gathering reminder",

  "type.waitlist_promoted.text": "A spot opened up. You're off the waitlist.",
  "type.waitlist_promoted.meta": "Gathering waitlist",

  "type.event_cancelled.text":
    "A gathering you're going to has been cancelled.",
  "type.event_cancelled.meta": "Gathering update",

  "type.event_updated.text":
    "Details changed for a gathering you're going to.",
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

  "type.appeal_resolved.text": "There's a decision on your appeal.",
  "type.appeal_resolved.meta": "Appeal update",

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
  "type.moderation_outcome.text": "There's a decision from the moderation team.",
  "type.moderation_outcome.meta": "{note}",
  "type.moderation_outcome.warn.text":
    "You've received a warning from the moderation team.",
  "type.moderation_outcome.warn.meta": "{note}",
  "type.moderation_outcome.suspend.text": "Your account has been suspended.",
  "type.moderation_outcome.suspend.meta": "{note}",
  "type.moderation_outcome.ban.text":
    "Your account has been permanently suspended.",
  "type.moderation_outcome.ban.meta": "{note}",

  // A fellow member credited a persona of yours as a collaborator on one of
  // their items (personas discovery Phase 5, Moment 6). The first live kind
  // whose `.actions` the adapter populates — see `notificationDtoToView`.
  "type.subprofile_credit.text": "{subprofileName} credited you on {itemTitle}.",
  "type.subprofile_credit.meta": "Persona credit",

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

  "type.unknown.text": "You have a new notification.",
  "type.unknown.meta": "Notification",

  // Notifications page chrome
  "page.title": "Notifications",
  "page.markAllRead": "Mark all as read",
  "page.dayRecent": "Today & recent",
  "page.dayEarlier": "Earlier",
  "page.empty.title": "All caught up",
  "page.empty.description": "No notifications in this category.",
  "page.error.title": "We couldn't load your notifications",
  "page.error.description":
    "Something went wrong reaching the server. This isn't an empty inbox. Try again in a moment.",
  "page.error.retry": "Try again",

  // Filter tabs (data.tsx's notificationTabs + the link-style Mentions tab)
  "tabs.all": "All",
  "tabs.events": "Events",
  "tabs.community": "Community",
  "tabs.platform": "Platform",
  "tabs.mentions": "Mentions",

  // Shared action-button labels across the demo notification list
  "actions.viewThread": "View thread",
  "actions.viewEvent": "View event",
  "actions.viewProfile": "View profile",
  "actions.accept": "Accept",
  "actions.decline": "Decline",
  "actions.readNow": "Read now",
  "actions.seeDetails": "See details",
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
  "mentions.eyebrow": "Mentions · {handle}",
  "mentions.heading": "When somebody <em>tagged you in.</em>",
  "mentions.lead":
    "Posts, replies, and articles that @-mention you. Distinct from Notifications. This is just the mentions thread.",
  "mentions.tabs.all": "All",
  "mentions.tabs.unread": "Unread",
  "mentions.tabs.posts": "In posts",
  "mentions.tabs.articles": "In articles",
  "mentions.tabs.events": "In events",
  "mentions.unreadSummary_one": "{count} unread",
  "mentions.unreadSummary_other": "{count} unread",
  "mentions.oldestFrom": "· oldest from {when}",
  "mentions.allCaughtUp": "All caught up",
  "mentions.markAllRead": "Mark all read",
  "mentions.markAllReadToast": "All marked as read",
  "mentions.empty.title": "No mentions here",
  "mentions.empty.description":
    "Nothing in this view right now. When someone tags you, it’ll show up here. No need to go looking.",
  // Live has no mentions inbox endpoint yet — shown instead of a silent empty
  // list so the surface reads as honestly unfinished, not broken (MentionsPanel).
  "mentions.comingSoon.title": "Mentions are on the way",
  "mentions.comingSoon.description":
    "We’re still building the place where every @-mention lands. Until then, you’ll still be told the moment someone tags you.",
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
  "deepLink.back": "Notifications",
  "deepLink.types.connection": "Connection",
  "deepLink.types.gathering": "Gathering",
  "deepLink.types.reply": "Reply",
  "deepLink.types.mention": "Mention",
  "deepLink.types.moderation": "Moderation",
  "deepLink.summary.connection": "{name} wants to connect with you",
  "deepLink.summary.gathering": "Your RSVP to {event} was accepted",
  "deepLink.summary.reply": "{name} replied to your post",
  "deepLink.summary.mention": "{name} mentioned you in a post",
  "deepLink.summary.moderation": "An update on your account: appeal {ref}",
  "deepLink.connection.toastConnected": "Connected with {name}",
  "deepLink.connection.toastDeclined": "Request declined",
  "deepLink.connection.connectedTitle": "You’re <em>connected</em>",
  "deepLink.connection.connectedBody":
    "{name} is now part of your network. Messaging and tagged updates are open between you.",
  "deepLink.connection.viewConnections": "View your connections",
  "deepLink.connection.wantsToConnect": "{name} wants to <em>connect</em>",
  "deepLink.connection.noteIntro": "They sent you a note with their request:",
  "deepLink.connection.mutualConnections_one": "{count} mutual connection",
  "deepLink.connection.mutualConnections_other": "{count} mutual connections",
  "deepLink.connection.accept": "Accept",
  "deepLink.connection.decline": "Decline",
  "deepLink.connection.notNow": "Not now, decide later",
  "deepLink.connection.remindLaterToast": "We’ll remind you later",
  "deepLink.gathering.badge": "You’re in",
  "deepLink.gathering.guestListConfirmed": "You’re on the guest list.",
  "deepLink.gathering.confirmedByHost":
    "Your RSVP has been confirmed by the host.",
  "deepLink.gathering.addToCalendar": "Add to calendar",
  "deepLink.gathering.addedToastCalendar": "Added to your calendar",
  "deepLink.gathering.viewDetails": "View event details",
  "deepLink.reply.yourPost": "Your post",
  "deepLink.reply.theirReply": "{name}’s reply",
  "deepLink.reply.meta": "Replied to your post · {when}",
  "deepLink.mention.theirPost": "{name}’s post",
  "deepLink.mention.meta": "Mentioned you in a post · {when}",
  "deepLink.composer.placeholder": "Reply to {name}…",
  "deepLink.composer.send": "Send",
  "deepLink.sentReply.you": "You",
  "deepLink.sentReply.justNow": "Just now",
  "deepLink.moderation.heading": "An update on your account",
  "deepLink.moderation.reference":
    "Reference <refNum>{ref}</refNum> · Updated {updated}",
  "deepLink.moderation.viewOutcome": "View appeal outcome",
  "deepLink.moderation.howItWorks": "How moderation works",
};
