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

  // Conversation panel (ConversationPanel)
  "conversation.officialMeta": "Official · Cannot reply to this thread",
  "conversation.connectedSinceSuffix": " · Connected since {date}",
  "conversation.viewProfile": "View profile",
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
