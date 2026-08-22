import type { Catalog } from "../../types";

/**
 * Messages — the inbox thread list, the conversation panel, and the new-message
 * picker. Member names, pronouns, message bodies, previews and historical
 * timestamps are member/conversation content (in live mode they arrive from
 * GET /conversations and GET /conversations/:id/messages) and stay in English
 * regardless of language; only the surrounding chrome is translated.
 *
 * `day.today` / `day.yesterday` are the two day-bucket headings the live
 * adapter (`messages.adapters.ts`) computes client-side from a fetched
 * timestamp — chrome, not content — so they resolve through this catalog via
 * a small label lookup in `ConversationPanel.tsx` rather than being baked in
 * as English literals. Other day headings (weekday/month names) still come
 * from `toLocaleDateString(undefined, …)` bound to the browser's locale, not
 * the app's language toggle — a known gap, see the sweep report.
 */
export const messages: Catalog = {
  // Thread list (MessagesThreadList)
  "thread.title": "Messages",
  "thread.composeTooltip": "New message",
  "thread.searchPlaceholder": "Search messages and people…",
  "thread.searchAria": "Search messages and conversations",
  "thread.emptySearchTitle": "No conversations found",
  "thread.emptySearchDescription":
    "No one matches “{query}”. Try a different name.",
  "thread.clearSearch": "Clear search",
  "thread.emptyTitle": "No conversations yet",
  "thread.emptyDescription":
    "When you start a chat, it'll live here: a quiet, private space just for you and the people you reach out to.",
  "thread.newMessage": "New message",
  "thread.presenceOnline": "Online now",
  "thread.menuAria": "Conversation options",
  "thread.pinChat": "Pin chat",
  "thread.unpinChat": "Unpin chat",
  "thread.pinnedIndicator": "Pinned chat",
  "thread.pinCapReached": "You can pin up to 3 chats",
  "thread.favoriteChat": "Favorite chat",
  "thread.unfavoriteChat": "Unfavorite chat",
  "thread.favoriteIndicator": "Favorite chat",
  "thread.muteChat": "Mute notifications",
  "thread.unmuteChat": "Unmute notifications",
  "thread.mutedIndicator": "Notifications muted",
  "thread.deleteChat": "Delete chat",
  // Inbox filter tabs
  "thread.tabAll": "All",
  "thread.tabUnread": "Unread",
  "thread.tabFavorites": "Favorites",
  "thread.tabGroups": "Groups",
  "thread.tabEmptyUnread": "No unread chats",
  "thread.tabEmptyFavorites": "No favorite chats yet",
  "thread.tabEmptyGroups": "No group chats yet",
  "deleteChat.confirmTitle": "Delete this chat?",
  "deleteChat.confirmBody":
    "It disappears from your inbox and clears your copy. {name} keeps theirs, and if they message you again, the chat comes back with only the new messages.",
  "deleteChat.confirmBodyGeneric":
    "It disappears from your inbox and clears your copy. The other member keeps theirs, and if they message you again, the chat comes back with only the new messages.",
  "deleteChat.confirmCta": "Delete chat",
  "deleteChat.cancelCta": "Cancel",

  // GIF picker (Composer + GifPicker)
  "gif.open": "Send a GIF",
  "gif.panelLabel": "GIF picker",
  "gif.searchPlaceholder": "Search GIFs",
  "gif.loading": "Loading GIFs…",
  "gif.empty": "No GIFs found",
  "gif.error": "Couldn't load GIFs. Try again",
  "gif.loadMore": "Load more",
  "gif.poweredBy": "Powered by KLIPY",
  "gif.comingSoonTitle": "GIFs are coming soon",
  "gif.comingSoonHint": "We're wiring up GIF search. Check back soon to add a little motion to your messages.",

  // Image attachments (Composer's ImageComposerButton, MessageBubbleBody)
  "attachments.open": "Send a photo",
  "attachments.imageAlt": "Photo message",
  "attachments.fallbackText": "Photo",
  "attachments.uploading": "Sending photo…",
  "attachments.previewUnavailable": "Photo preview unavailable",

  // Connection status strip (ConnectionStatusBanner) at the top of the open
  // thread — surfaces when the member is offline or the socket is reconnecting.
  "connection.offline": "You're offline. Messages will send when you reconnect.",
  "connection.reconnecting": "Reconnecting…",

  // Shortcut hint — the "?" affordance in the composer that lists the mention
  // sigils. Tapping a row drops its sigil into the draft so typeahead opens.
  "shortcuts.open": "Shortcuts",
  "shortcuts.panelLabel": "Mention shortcuts",
  "shortcuts.title": "Shortcuts",
  "shortcuts.hint": "Type a sigil, then a name to link it.",
  "shortcuts.member": "Mention a member",
  "shortcuts.community": "Link a community",
  "shortcuts.topic": "Tag a topic",
  "shortcuts.business": "Link a business",
  "shortcuts.event": "Link an event",
  "shortcuts.thread": "Link a thread",

  // Inbox search (MessagesSearchResults) — one box, two kinds of match:
  // conversations by name and messages by body. `{query}` is the term typed.
  "search.conversationsLabel": "Conversations",
  "search.messagesLabel": "Messages",
  "search.searching": "Looking through your messages…",
  "search.keepTyping": "Keep typing to search your messages…",
  "search.noMessages": "No messages match “{query}”.",
  "search.emptyTitle": "Nothing matches yet",
  "search.emptyDescription":
    "Nothing in your inbox matches “{query}”. Try another word, or someone's name.",

  // "Search in this chat" (ThreadSearchModal), opened from the conversation
  // header — scoped to the open thread instead of the whole inbox.
  "search.inChatOpen": "Search in this chat",
  "search.inChatTitle": "Search in {name}",
  "search.inChatPlaceholder": "Search this conversation…",
  "search.inChatAria": "Search messages in this conversation",

  // Conversation panel (ConversationPanel)
  "conversation.activeNow": "Active now",
  "conversation.officialMeta": "Official · Cannot reply to this thread",
  // Fallback display name for an official/system DM whose DTO carries no
  // counterpart profile (messages.adapters.ts's conversationToView).
  "conversation.officialName": "QueerPulse Team",
  "conversation.connectedSinceSuffix": " · Connected since {date}",
  "conversation.viewProfile": "View profile",
  "conversation.you": "You",
  "conversation.newMessages": "New messages",
  // Counted jump-to-latest pill (CLDR plural: _one / _other).
  "conversation.newMessagesCount_one": "{count} new message",
  "conversation.newMessagesCount_other": "{count} new messages",
  "conversation.unreadDivider": "New messages",
  // Screen-reader-only boundary label for the unread separator.
  "conversation.unreadDividerAria": "New messages start here",
  // Screen-reader-only announcement for a newly-arrived incoming message
  // (polite live region). `snippet` is the message text, trimmed.
  "conversation.newMessageAnnouncement": "New message from {name}: {snippet}",
  "conversation.loadingOlder": "Loading earlier messages…",
  "conversation.typing": "{name} is typing…",
  "conversation.officialNotice":
    "This is an automated thread. Replies aren't monitored.",
  "conversation.blockedNotice":
    "You blocked {name}. Unblock them from their profile to send a message.",
  "conversation.composerPlaceholder": "Message {name}…",
  "conversation.composerGroupPlaceholder": "Message the group…",
  "conversation.leftGroupNotice":
    "You left this group. Its history stays here, but you can't send new messages.",
  "conversation.send": "Send",
  "conversation.backToList": "Back to conversations",
  "conversation.emptyPanelTitle": "Your messages live here",
  "conversation.emptyPanelBody":
    "Pick a conversation on the left, or start a new one: a quiet, private space just for you and the people you reach out to.",
  "day.today": "Today",
  "day.yesterday": "Yesterday",
  // Screen-reader-only boundary label for a day separator; `day` is the visible
  // heading (localized "Today"/"Yesterday" or a date string).
  "day.separatorLabel": "Messages from {day}",
  "time.justNow": "Just now",
  "status.sending": "Sending…",
  "status.sent": "Sent",
  "status.delivered": "Delivered",
  "status.retry": "Not delivered · Retry",
  "status.seen": "Seen",

  // Per-message action bar (MessageActions/ReactionPicker)
  "actions.react": "React",
  "actions.more": "More",
  "actions.report": "Report",
  "actions.delete": "Delete",

  // Long-press/right-click overlay (MessageActionOverlay) — reuses
  // actions.report/actions.delete above for its own menu items.
  "actions.menuLabel": "Message actions",
  "actions.overlayLabel": "Message options",
  "actions.reactionsLabel": "React to message",
  "actions.reply": "Reply",
  "actions.forward": "Forward",
  // Shown above a bubble whose content was forwarded from another chat.
  "actions.forwardedLabel": "Forwarded",
  "actions.pin": "Pin",
  "actions.unpin": "Unpin",
  "actions.star": "Star",
  "actions.unstar": "Unstar",
  "actions.edit": "Edit",
  "actions.copy": "Copy",
  "actions.edited": "edited",
  "actions.editing": "Editing message",
  "actions.editSave": "Save",
  "actions.editCancel": "Cancel",
  "actions.replyingTo": "Replying to {name}",
  replyDeleted: "Message deleted",
  tombstone: "This message was deleted",
  "delete.confirmTitle": "Delete this message?",
  "delete.confirmBody": "It will be removed for everyone in this chat.",
  "delete.confirmCta": "Delete",
  "delete.cancelCta": "Cancel",
  "report.title": "Report this message",

  // Link preview / unfurl card (LinkPreview) — the card body (site/title/
  // description) is remote page content and stays as fetched; only the
  // screen-reader label is chrome, translated here.
  "linkPreview.aria": "Link preview: {title}",
  "linkPreview.ariaGeneric": "Link preview from {site}",

  // Pinned-messages banner (ConversationPinnedBanner) + in-bubble indicators
  "pinned.bannerLabel": "Pinned message",
  // Multiple pins: shows position in the stack, e.g. "Pinned · 1/3".
  "pinned.bannerCounted": "Pinned · {index}/{total}",
  "pinned.jumpAria": "Jump to pinned message: {snippet}",
  "pinned.indicator": "Pinned",
  "starred.indicator": "Starred",

  // Forward picker (NewMessageModal, forward mode)
  "forward.title": "Forward to…",
  "forward.sub": "Pick a connection or group to forward this message to.",
  "forward.sectionPeople": "People",
  "forward.sectionGroups": "Groups",

  // Starred messages view (StarredMessagesModal)
  "starred.title": "Starred messages",
  "starred.open": "Starred messages",
  "starred.close": "Close",
  "starred.sub": "Messages you've saved. Only you can see these.",
  "starred.loading": "Loading your starred messages…",
  "starred.empty":
    "Nothing starred yet. Star a message to keep it here for later.",

  // New-message recipient picker (NewMessageModal)
  "newMessage.title": "New message",
  "newMessage.close": "Close",
  "newMessage.sub": "Pick a connection, or search for someone new to message.",
  "newMessage.searchPlaceholder": "Search connections or people…",
  "newMessage.searchAria": "Search connections and members",
  "newMessage.loading": "Loading your connections…",
  "newMessage.none": "You haven't connected with anyone yet.",
  "newMessage.empty": "No connections match “{query}”.",
  "newMessage.back": "Back",
  // Fall-through: members found who AREN'T an accepted connection yet — picking
  // one opens the message-request composer instead of an existing thread.
  "newMessage.sectionStrangers": "Message someone new",
  "newMessage.strangerSub": "Not connected yet",

  // Message-request composer (MessageRequestComposer), the compose step
  // NewMessageModal swaps in for a picked member who isn't a connection yet —
  // POST /messages/request, which delivers directly if they turn out to
  // already be connected, or seeds a connection request otherwise.
  "request.notConnectedYet": "You're not connected yet",
  "request.composeIntro":
    "Introduce yourself. If they accept, you'll be connected and this becomes your first conversation.",
  "request.composePlaceholder": "Say hello to {name}…",
  "request.composeAria": "Your message",
  "request.sendCta": "Send request",
  "request.sendingLabel": "Sending…",
  "request.sentToast": "Message request sent to {name}.",
  "request.sentDirectToast": "Message sent to {name}.",
  "request.errorToast": "Couldn't send your message. Try again.",

  // "Requests" inbox tab (incoming message requests with accept/decline)
  "requests.tabLabel": "Requests",
  "requests.emptyTitle": "No message requests",
  "requests.emptyDescription":
    "When someone who isn't connected with you sends a first message, it appears here to accept or decline.",

  // Group chat (#17) — create-group picker (NewGroupModal), group header +
  // info (ConversationHeader / GroupInfoModal), and the composer's left-notice.
  // Fallback display title for a group DTO with no title (messages.adapters.ts).
  "group.untitled": "Group",
  "group.newTooltip": "New group",
  "group.newTitle": "New group",
  "group.newSub": "Name your group and choose who's in it.",
  "group.namePlaceholder": "Group name",
  "group.nameAria": "Group name",
  "group.searchPlaceholder": "Search connections to add…",
  "group.searchAria": "Search connections to add",
  "group.createCta": "Create group ({count})",
  "group.info": "Group info",
  "group.infoTitle": "Group info",
  // Member-count subtitle (CLDR plural: _one / _other).
  "group.memberCount_one": "{count} member",
  "group.memberCount_other": "{count} members",
  "group.roleOwner": "Owner",
  "group.roleAdmin": "Admin",
  "group.leave": "Leave group",
  "group.leaving": "Leaving…",
  // Group management (#17 Phase 2) — roster actions, edit, add-members picker.
  "group.edit": "Edit group",
  "group.add": "Add members",
  "group.addTitle": "Add members",
  "group.addCta": "Add ({count})",
  "group.addNone": "No more connections to add.",
  "group.promote": "Make admin",
  "group.demote": "Remove admin",
  "group.remove": "Remove",
  // Confirm step before removing a member (UX polish — no destructive action
  // without a confirm). Warm, non-blaming; the cancel keeps them in the group.
  "group.removeConfirm.title": "Remove {name}?",
  "group.removeConfirm.body":
    "{name} will lose access to this group and its messages. You can always add them back later.",
  "group.removeConfirm.cancel": "Keep in group",
  "group.removeConfirm.confirm": "Remove member",
  "group.avatarLabel": "Group photo",
  // "Seen by N" group receipt (CLDR plural: _one / _other) — the receipt line
  // under an own message and the sheet heading.
  "group.seenByCount_one": "Seen by {count}",
  "group.seenByCount_other": "Seen by {count}",
  "group.seenByTitle_one": "Seen by {count} person",
  "group.seenByTitle_other": "Seen by {count} people",
  // Group typing labels (single-typer reuses conversation.typing).
  "group.typingTwo": "{first} and {second} are typing…",
  "group.typingMany": "Several people are typing…",
  "group.typingSomeone": "Someone is typing…",

  // System messages (centred event pills — SystemMessagePill). Bilingual;
  // actor/target names arrive resolved from the server (or the demo mock).
  "system.groupCreatedYou": "You created the group",
  "system.groupCreated": "{actor} created the group",
  "system.memberAddedYou": "You added {target}",
  "system.memberAdded": "{actor} added {target}",
  "system.memberRemovedYou": "You removed {target}",
  "system.memberRemoved": "{actor} removed {target}",
  "system.memberLeftYou": "You left",
  "system.memberLeft": "{actor} left",
  "system.groupRenamedYou": "You renamed the group to “{value}”",
  "system.groupRenamed": "{actor} renamed the group to “{value}”",

  // ── Safety — block/report a member + share-carefully notice (Wave A) ──
  "conversation.reportMemberAction": "Report {name}",
  "report.memberTitle": "Report {name}?",
  "conversation.contactSafetyNotice":
    "Keep the conversation here until you trust someone. Never send money, and never share bank details. Real listings don't ask for that.",
};
