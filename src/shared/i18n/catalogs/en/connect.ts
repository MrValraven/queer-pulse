import type { Catalog } from "../../types";

/**
 * Connections — the connections page (tabs, cards, more-menu), the connect
 * modal (reach-out form + sent panel). Member names, tags/interests, and
 * relationship timestamps ("since"/"sentAgo") are member data (in live mode
 * they arrive from GET /connections) and stay in English regardless of
 * language — only the chrome words around them are translated.
 */
export const connect: Catalog = {
  // Tabs (ConnectionsPage / ConnectionsTabs)
  "tabs.all": "All connections",
  "tabs.incoming": "Incoming requests",
  "tabs.sent": "Sent",
  "tabs.blocked": "Blocked",
  "tabs.vouched": "Vouched-for",

  // Page header (ConnectionsPage)
  "page.eyebrow": "Your network",
  "page.title": "People you've <em>actually met.</em>",
  "page.lead":
    "QueerPulse doesn't do followers. You connect with people once you've met them — at a gathering, through someone, or because they vouched for you. Quality over count.",
  "page.inviteCta": "Invite a friend",
  "page.note":
    "<b>No follower counts on purpose.</b> If you're looking to “follow a member's posts” without connecting first, use the Communities feed instead. Connections are a two-way thing — they unlock messaging and tagged updates.",
  "page.loadMoreLoading": "Loading…",
  "page.loadMore": "Load more",

  // Toasts fired from ConnectionsPage actions
  "toast.connected": "Connected with {name}",
  "toast.declined": "Politely declined",
  "toast.withdrawn": "Request withdrawn",
  "toast.unblocked": "Unblocked {name}",

  // Per-card "more" menu (ConnectionCards)
  "moreMenu.ariaMore": "More options for {name}",
  "moreMenu.message": "Message",
  "moreMenu.mute": "Mute {name}",
  "moreMenu.unmute": "Unmute {name}",
  "moreMenu.block": "Block {name}",
  "moreMenu.unblock": "Unblock {name}",
  "moreMenu.report": "Report",
  "moreMenu.toastMuted": "Muted {name}",
  "moreMenu.toastUnmuted": "Unmuted {name}",
  "moreMenu.toastBlocked": "Blocked {name}",
  "moreMenu.toastUnblocked": "Unblocked {name}",
  "moreMenu.toastReportSent": "Report sent for {name}",

  // Card chrome (ConnectionCards)
  "card.profileAria": "{name}'s profile",
  "card.blockedBadge": "Blocked",
  "card.message": "Message",
  "card.viewProfile": "View profile",
  "card.mutuals_one": "<b>{count}</b> mutual",
  "card.mutuals_other": "<b>{count}</b> mutuals",
  "card.connectedSince": "Connected <b>{since}</b>",
  "card.tagsMoreTitle": "Also: {list}",
  "card.noMutuals": "No mutuals — review carefully",
  "card.sentAgo": "Sent <b>{sentAgo}</b>",
  "card.decline": "Decline",
  "card.accept": "Accept",
  "card.awaitingReply": "Awaiting reply",
  "card.awaitingReplySince": "Awaiting reply · sent <b>{sentAgo}</b>",
  "card.withdraw": "Withdraw",
  "card.unblock": "Unblock",
  "card.cantMessage": "They can't message you or see your updates.",

  // Vouch badge + note (connections.data.ts, resolved by the component)
  "vouch.forYou": "Vouched for you",
  "vouch.byYou": "You vouched",
  "vouch.mutual": "Mutual vouch",
  "vouch.bothWays": "Vouched both ways",

  // Vouched-for tab intro (ConnectionsPanels)
  "panelIntro.vouched":
    "People you've vouched for, or who've vouched for you. <em>Vouching is a small but meaningful act</em> — it stays attached to that member's profile.",

  // All-connections tab (ConnectionsAllTab)
  "allTab.searchPlaceholder": "Search by name, role, or community",
  "allTab.searchAria": "Search connections",
  "allTab.sortRecentlyConnected": "Recently connected",
  "allTab.sortAToZ": "A to Z",
  "allTab.sortClosestMutuals": "Closest mutuals",
  "allTab.emptyTitle": "No connections yet",
  "allTab.emptyDescription":
    "Your network starts with a single hello. Meet people at a gathering, or find members you already know and connect once you've met.",
  "allTab.findMembers": "Find members",
  "allTab.emptySearchTitle": "Nothing matches your search",
  "allTab.emptySearchDescription":
    "No one in your network fits that search just yet. Clear it to see everyone again.",
  "allTab.clearSearch": "Clear search",
  "allTab.loadMore": "Load more connections",

  // Incoming / sent / blocked empty states (ConnectionsPanels)
  "panels.requestsEmptyTitle": "No requests right now",
  "panels.incomingEmptyDescription":
    "When someone you've met asks to connect, they'll land here for you to accept or politely decline.",
  "panels.sentEmptyDescription":
    "Requests you send sit here until they're accepted. Browse members and reach out to someone you've crossed paths with.",
  "panels.blockedEmptyTitle": "You haven't blocked anyone",
  "panels.blockedEmptyDescription":
    "If someone makes the room feel unsafe, blocking them stops their messages and hides your updates. They'll show up here if you ever need to undo it.",

  // Connect modal shell (ConnectModal)
  "modal.close": "Close",
  "modal.loading": "Loading…",

  // Reach-out form (ConnectForm)
  "form.title": "Say <em>hello.</em>",
  "form.sub":
    "Your message goes directly. No notifications, no read receipts, no algorithm watching. Just a real message.",
  "form.nameLabel": "Your name",
  "form.namePlaceholder": "How you'd like to be known",
  "form.emailLabel": "Your email",
  "form.emailPlaceholder": "So they can write back",
  "form.reasonLabel": "What's this about?",
  "form.reasonPlaceholder": "Pick a reason, or leave it open",
  "form.reasonOpenToGroup": "What {first} is open to",
  "form.reasonGenericGroup": "Something else",
  "form.reasonCollaborate": "I'd love to collaborate",
  "form.reasonAdvice": "I'd like some advice",
  "form.reasonSawPost": "I saw your board post",
  "form.reasonShouldMeet": "I think we should meet",
  "form.reasonSomethingElse": "Something else entirely",
  "form.messageLabel": "Your message",
  "form.messagePlaceholder": "Write naturally. There's no template.",
  "form.note":
    "Messages from people not yet in the network are held briefly and reviewed by the team before delivery. This keeps the room safe.",
  "form.cancel": "Cancel",
  "form.sendingLabel": "Sending…",
  "form.send": "Send",

  // Success panel after sending (ConnectSentPanel)
  "sent.title": "Message <em>sent.</em>",
  "sent.body":
    "Your message to {name} is on its way. If they'd like to continue the conversation, they'll write back directly to your email.",
  "sent.close": "Close",
  "sent.autoClose": "Closing automatically in {seconds}s",
};
