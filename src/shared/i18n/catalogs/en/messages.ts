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
    "When you start a chat, it'll live here — a quiet, private space just for you and the people you reach out to.",
  "thread.newMessage": "New message",
  "thread.presenceOnline": "Online now",
  "thread.menuAria": "Conversation options",
  "thread.deleteChat": "Delete chat",
  "deleteChat.confirmTitle": "Delete this chat?",
  "deleteChat.confirmBody":
    "It disappears from your inbox and clears your copy. {name} keeps theirs — and if they message you again, the chat comes back with only the new messages.",
  "deleteChat.confirmBodyGeneric":
    "It disappears from your inbox and clears your copy. The other member keeps theirs — and if they message you again, the chat comes back with only the new messages.",
  "deleteChat.confirmCta": "Delete chat",
  "deleteChat.cancelCta": "Cancel",

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

  // Conversation panel (ConversationPanel)
  "conversation.activeNow": "Active now",
  "conversation.officialMeta": "Official · Cannot reply to this thread",
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
    "This is an automated thread — replies aren't monitored.",
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
    "Pick a conversation on the left, or start a new one — a quiet, private space just for you and the people you reach out to.",
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
  "forward.sub": "Pick a connection to forward this message to.",

  // Starred messages view (StarredMessagesModal)
  "starred.title": "Starred messages",
  "starred.open": "Starred messages",
  "starred.close": "Close",
  "starred.sub": "Messages you've saved — only you can see these.",
  "starred.loading": "Loading your starred messages…",
  "starred.empty":
    "Nothing starred yet. Star a message to keep it here for later.",

  // New-message recipient picker (NewMessageModal)
  "newMessage.title": "New message",
  "newMessage.close": "Close",
  "newMessage.sub": "Pick a connection to start a conversation.",
  "newMessage.searchPlaceholder": "Search connections…",
  "newMessage.searchAria": "Search connections",
  "newMessage.loading": "Loading your connections…",
  "newMessage.none": "You haven't connected with anyone yet.",
  "newMessage.empty": "No connections match “{query}”.",

  // Group chat (#17) — create-group picker (NewGroupModal), group header +
  // info (ConversationHeader / GroupInfoModal), and the composer's left-notice.
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
  "group.avatarPlaceholder": "Group photo URL (optional)",
  "group.avatarAria": "Group photo URL",
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
};
