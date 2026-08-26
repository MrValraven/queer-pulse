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
    "Your main profile doesn't do followers. You connect with people once you've met them: at a gathering, through someone, or because they vouched for you. Quality over count.",
  "page.inviteCta": "Invite a friend",
  "page.note":
    "<b>No follower counts here, on purpose.</b> Looking to follow a persona's updates without connecting first? That's what personas are for. Connections are a two-way thing: they unlock messaging and tagged updates.",
  "page.loadMoreLoading": "Loading…",
  "page.loadMore": "Load more",

  // Toasts fired from ConnectionsPage actions
  "toast.connected": "Connected with {name}",
  "toast.declined": "Politely declined",
  "toast.withdrawn": "Request withdrawn",
  "toast.unblocked": "Unblocked {name}",
  "toast.actionFailed": "That didn't go through. Please try again.",

  // Per-card "more" menu (ConnectionCards)
  "moreMenu.ariaMore": "More options for {name}",
  "moreMenu.message": "Message",
  "moreMenu.mute": "Mute {name}",
  "moreMenu.unmute": "Unmute {name}",
  "moreMenu.block": "Block {name}",
  "moreMenu.unblock": "Unblock {name}",
  "moreMenu.report": "Report",
  "moreMenu.reportTitle": "Report {name}?",
  "moreMenu.toastMuted": "Muted {name}",
  "moreMenu.toastUnmuted": "Unmuted {name}",
  "moreMenu.toastBlocked": "Blocked {name}",
  "moreMenu.toastUnblocked": "Unblocked {name}",
  "moreMenu.blockConfirm.title": "Block {name}?",
  "moreMenu.blockConfirm.body":
    "Blocking removes your connection, stops {name} messaging you, and hides your updates from them. You can undo it any time from the Blocked tab.",
  "moreMenu.blockConfirm.action": "Block",

  // Card chrome (ConnectionCards)
  "card.profileAria": "{name}'s profile",
  "card.blockedBadge": "Blocked",
  "card.message": "Message",
  "card.viewProfile": "View profile",
  "card.mutuals_one": "<b>{count}</b> mutual",
  "card.mutuals_other": "<b>{count}</b> mutuals",
  "card.connectedSince": "Connected <b>{since}</b>",
  "card.tagsMoreTitle": "Also: {list}",
  "card.noMutuals": "No mutuals: review carefully",
  "card.sentAgo": "Sent <b>{sentAgo}</b>",
  "card.introducedBy": "Introduced by <a>{name}</a>",
  "card.reason": "About <b>{reason}</b>",
  // Why an accepted connection started, shown back on the connection it
  // became. Which of the two reads depends on who sent the request.
  "card.reasonTheyAsked": "{name} reached out about <b>{reason}</b>",
  "card.reasonYouAsked": "You reached out about <b>{reason}</b>",
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
    "People you've vouched for, or who've vouched for you. <em>Vouching is a small but meaningful act</em>. It stays attached to that member's profile.",

  // All-connections tab (ConnectionsAllTab)
  "allTab.searchPlaceholder": "Search by name, handle, or what they do",
  "allTab.searchAria": "Search connections",
  "allTab.sortLabel": "Sort",
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

  // Private per-connection note (ConnectionNoteEditor). Only its author ever
  // sees it: the server reads a note back solely under the author's own id.
  "note.add": "Add a private note",
  "note.addAria": "Add a private note about {name}",
  "note.editAria": "Edit your private note about {name}",
  "note.inputAria": "Your private note about {name}",
  "note.placeholder":
    "Where you met, what you talked about, anything you'd rather not forget.",
  "note.privacy": "Only you can see this. It is never shown to them.",
  "note.save": "Save note",
  "note.saving": "Saving…",
  "note.cancel": "Cancel",
  "note.saveFailed": "That note didn't save. Please try again.",

  // Relative age of a request (connections.adapters), for the two idioms the
  // shared localized helper can't derive from Intl.RelativeTimeFormat.
  "ago.justNow": "just now",
  "ago.unknown": "recently",

  // Connect modal shell (ConnectModal)
  "modal.ariaLabel": "Reach out",
  "modal.close": "Close",
  "modal.loading": "Loading…",
  "modal.error":
    "We couldn't load this member right now. Close this and try again in a moment.",

  // Reach-out form (ConnectForm)
  "form.title": "Say <em>hello.</em>",
  "form.sub":
    "Your message goes directly. No notifications, no read receipts, no algorithm watching. Just a real message.",
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
    "If you're not connected yet, this arrives as a request: they decide whether to open the conversation. Either way, it stays between the two of you.",
  "form.cancel": "Cancel",
  "form.sendingLabel": "Sending…",
  "form.send": "Send",
  "form.sendError":
    "That didn't go through. Check your connection and try again.",
  "form.rateLimitError":
    "You're reaching out to a lot of people right now. Give it a minute, then try again.",

  // Success panel after sending (ConnectSentPanel)
  "sent.title": "Message <em>sent.</em>",
  "sent.body":
    "Your message to {name} is on its way. If they'd like to continue, they'll reply right here in your inbox.",
  "sent.close": "Close",
  "sent.autoClose": "Closing automatically in {seconds}s",

  // Terminal notice panels (ConnectNoticePanel) — shown when a reach-out can't
  // go through and retrying won't help. Copy stays warm and never reveals a
  // block we weren't explicitly told about (see cannotConnect).
  "notice.close": "Close",
  "notice.alreadyPending.title": "You've already <em>reached out.</em>",
  "notice.alreadyPending.body":
    "Your message is already waiting with {name}. They'll open the conversation when they're ready. No need to send it again.",
  "notice.alreadyConnected.title": "You're already <em>connected.</em>",
  "notice.alreadyConnected.body":
    "You and {name} are already connected. Open your messages to pick the conversation back up.",
  "notice.youBlocked.title": "You <em>blocked</em> {name}.",
  "notice.youBlocked.body":
    "You'll need to unblock them before you can say hello. You can do that from their profile.",
  "notice.notAccepting.title":
    "{name} isn't taking new <em>hellos</em> right now.",
  "notice.notAccepting.body":
    "They've paused new connection requests. You're welcome to try again another time.",
  "notice.needsIntro.title": "{name} connects through <em>introductions.</em>",
  "notice.needsIntro.body":
    "They reach out through people they already know. Ask a mutual connection to introduce you.",
  "notice.cannotConnect.title": "You can't reach {name} <em>right now.</em>",
  "notice.cannotConnect.body": "This connection isn't available right now.",
  // People you might know (SOC-05). Every suggestion carries the FACT behind
  // it, so these lines are the whole point of the card: there is deliberately
  // no "recommended for you" string here, because the server never sends a
  // suggestion it cannot explain. Community names, interest tags and custom
  // availability phrases are member data and stay in the language they were
  // written in.
  "suggested.heading": "People you might know",
  "suggested.blurb":
    "Each one shares a room, a connection or an interest with you.",
  "suggested.reasonCommunity": "You are both in {name}",
  "suggested.reasonMutuals_one": "{count} mutual connection",
  "suggested.reasonMutuals_other": "{count} mutual connections",
  "suggested.reasonOpenTo": "You are both open to {label}",
  "suggested.reasonTag": "You both listed {label}",
  "suggested.reasonProfession": "You both work in {label}",
  "suggested.sayHello": "Say hello",
  "suggested.dismissAria": "Stop suggesting {name}",
  "suggested.hideStripAria": "Hide people you might know",
  "suggested.browseMembers": "Browse all members",
  "contact.message": "Message",
};
