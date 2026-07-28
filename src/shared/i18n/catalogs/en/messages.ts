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
  "thread.searchPlaceholder": "Search conversations…",
  "thread.searchAria": "Search conversations",
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

  // Conversation panel (ConversationPanel)
  "conversation.activeNow": "Active now",
  "conversation.officialMeta": "Official · Cannot reply to this thread",
  "conversation.connectedSinceSuffix": " · Connected since {date}",
  "conversation.viewProfile": "View profile",
  "conversation.you": "You",
  "conversation.newMessages": "New messages",
  "conversation.unreadDivider": "New messages",
  "conversation.loadingOlder": "Loading earlier messages…",
  "conversation.typing": "{name} is typing…",
  "conversation.officialNotice":
    "This is an automated thread — replies aren't monitored.",
  "conversation.blockedNotice":
    "You blocked {name}. Unblock them from their profile to send a message.",
  "conversation.composerPlaceholder": "Message {name}…",
  "conversation.send": "Send",
  "conversation.backToList": "Back to conversations",
  "conversation.emptyPanelTitle": "Your messages live here",
  "conversation.emptyPanelBody":
    "Pick a conversation on the left, or start a new one — a quiet, private space just for you and the people you reach out to.",
  "day.today": "Today",
  "day.yesterday": "Yesterday",
  "time.justNow": "Just now",
  "status.sending": "Sending…",
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

  // New-message recipient picker (NewMessageModal)
  "newMessage.title": "New message",
  "newMessage.close": "Close",
  "newMessage.sub": "Pick a connection to start a conversation.",
  "newMessage.searchPlaceholder": "Search connections…",
  "newMessage.searchAria": "Search connections",
  "newMessage.loading": "Loading your connections…",
  "newMessage.none": "You haven't connected with anyone yet.",
  "newMessage.empty": "No connections match “{query}”.",
};
