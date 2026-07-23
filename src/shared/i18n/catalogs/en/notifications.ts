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

  "type.promoted_to_member.text": "You're a full member now. Welcome in.",
  "type.promoted_to_member.meta": "Membership",

  "type.new_message.text": "You have a new message.",
  "type.new_message.meta": "Private message",

  "type.introduction_made.text": "An introduction you made went through.",
  "type.introduction_made.textNamed":
    "An introduction you made for <profile>{name}</profile> went through.",
  "type.introduction_made.meta": "Introduction",

  "type.event_invite.text": "You have an invitation to a gathering.",
  "type.event_invite.textNamed":
    "<profile>{name}</profile> invited you to a gathering.",
  "type.event_invite.meta": "Gathering invitation",

  "type.event_reminder.text": "A gathering you're going to is coming up.",
  "type.event_reminder.meta": "Gathering reminder",

  "type.waitlist_promoted.text": "A spot opened up — you're off the waitlist.",
  "type.waitlist_promoted.meta": "Gathering waitlist",

  "type.event_cancelled.text":
    "A gathering you're going to has been cancelled.",
  "type.event_cancelled.meta": "Gathering update",

  "type.unknown.text": "You have a new notification.",
  "type.unknown.meta": "Notification",

  // Notifications page chrome
  "page.title": "Notifications",
  "page.markAllRead": "Mark all as read",
  "page.dayRecent": "Today & recent",
  "page.dayEarlier": "Earlier",
  "page.empty.title": "All caught up",
  "page.empty.description": "No notifications in this category.",

  // Filter tabs (data.tsx's notificationTabs + the link-style Mentions tab)
  "tabs.all": "All",
  "tabs.messages": "Messages",
  "tabs.events": "Events",
  "tabs.community": "Community",
  "tabs.platform": "Platform",
  "tabs.mentions": "Mentions",

  // Shared action-button labels across the demo notification list
  "actions.reply": "Reply",
  "actions.viewThread": "View thread",
  "actions.viewEvent": "View event",
  "actions.accept": "Accept",
  "actions.decline": "Decline",
  "actions.readNow": "Read now",
  "actions.seeDetails": "See details",
  "actions.seeBarterBoard": "See barter board",
  "actions.readMessage": "Read message",
  "actions.viewReplies": "View replies",
  "actions.readReport": "Read report",

  // Demo notification list (notificationsList.data.tsx) — mirrors, per row,
  // what `formatNotification` produces for the analogous live `type`, but with
  // richer flavour text. Proper nouns (event/community/feature names, quoted
  // post titles) stay as `{token}` values, never translated.
  "list.1.text":
    "<strong>{name}</strong> replied to your message about the Sunday table gathering.",
  "list.1.meta": "Private message",
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
  "list.10.text":
    "<strong>{name}</strong> sent you a message regarding the {event} on {day}.",
  "list.10.meta": "Private message",
  "list.11.text_one":
    'Your post in the Forum ("{postTitle}") received {count} reply.',
  "list.11.text_other":
    'Your post in the Forum ("{postTitle}") received {count} replies.',
  "list.11.meta": "Forum · Activity",
  "list.12.text":
    "The <strong>{report}</strong> has been published. Moderation stats and finances are now live.",
  "list.12.meta": "Governance · Quarterly report",

  // Mentions thread (MentionsPage.tsx / mentions.data.tsx)
  "mentions.day.today": "Today",
  "mentions.day.yesterday": "Yesterday",
  "mentions.day.thisWeek": "This week",
  "mentions.eyebrow": "Mentions · {handle}",
  "mentions.heading": "When somebody <em>tagged you in.</em>",
  "mentions.lead":
    "Posts, replies, and articles that @-mention you. Distinct from Notifications — this is just the mentions thread.",
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
    "Nothing in this view right now. When someone tags you, it’ll show up here — no need to go looking.",
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

  // Notification deep-link preview (NotificationDeepLinkPage.tsx / Cards.tsx)
  "deepLink.back": "← Notifications",
  "deepLink.types.connection": "Connection",
  "deepLink.types.gathering": "Gathering",
  "deepLink.types.reply": "Reply",
  "deepLink.types.mention": "Mention",
  "deepLink.types.moderation": "Moderation",
  "deepLink.summary.connection": "{name} wants to connect with you",
  "deepLink.summary.gathering": "Your RSVP to {event} was accepted",
  "deepLink.summary.reply": "{name} replied to your post",
  "deepLink.summary.mention": "{name} mentioned you in a post",
  "deepLink.summary.moderation": "An update on your account — appeal {ref}",
  "deepLink.connection.toastConnected": "Connected with {name}",
  "deepLink.connection.toastDeclined": "Request declined",
  "deepLink.connection.connectedTitle": "You’re <em>connected</em>",
  "deepLink.connection.connectedBody":
    "{name} is now part of your network. Messaging and tagged updates are open between you.",
  "deepLink.connection.viewConnections": "View your connections",
  "deepLink.connection.wantsToConnect": "{name} wants to <em>connect</em>",
  "deepLink.connection.noteIntro": "They sent you a note with their request:",
  "deepLink.connection.mutualConnections_one": "{count} mutual connection →",
  "deepLink.connection.mutualConnections_other": "{count} mutual connections →",
  "deepLink.connection.accept": "Accept",
  "deepLink.connection.decline": "Decline",
  "deepLink.connection.notNow": "Not now — decide later",
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
