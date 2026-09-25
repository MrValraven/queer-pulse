import type { Catalog } from "../../types";

/**
 * Messages: the inbox thread list, the conversation panel, and the new-message
 * picker. Member names, pronouns, message bodies and previews are member
 * content (in live mode they arrive from GET /conversations and
 * GET /conversations/:id/messages) and stay as written; the surrounding chrome
 * is translated.
 *
 * `day.today` / `day.yesterday` are the two day-bucket headings computed
 * client-side from a message timestamp. They count as chrome, so they resolve
 * through this catalog (see `dayHeading.ts`). Every other day heading, and
 * every weekday and month name, is formatted with `activeLocale()`, so it
 * follows the app's language toggle in both demo and live mode.
 */
export const messages: Catalog = {
  // Thread list (MessagesThreadList)
  "thread.composeTooltip": "New message",
  "thread.searchPlaceholder": "Search messages and people…",
  "thread.searchAria": "Search messages and conversations",
  "thread.clearSearch": "Clear search",
  // DES-194: announced while the inbox's first load is in flight, since the
  // skeleton rows underneath are all `aria-hidden`.
  "thread.loadingInbox": "Loading your conversations…",
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
  "thread.archiveChat": "Archive chat",
  "thread.unarchiveChat": "Unarchive chat",
  "thread.archivedIndicator": "Archived chat",
  // PRD-225. One row-menu entry that flips on the thread's current state, the
  // way every pair above it does. "Mark as read" reuses the ordinary read
  // mutation, so it advances the real watermark and clears the manual flag in
  // one request.
  "thread.markUnread": "Mark as unread",
  "thread.markRead": "Mark as read",
  "thread.deleteChat": "Delete chat",
  // Inbox filter tabs
  "thread.tabAll": "All",
  "thread.tabUnread": "Unread",
  "thread.tabFavorites": "Favorites",
  "thread.tabGroups": "Groups",
  "thread.tabArchived": "Archived",
  "thread.tabEmptyUnread": "No unread chats",
  "thread.tabEmptyFavorites": "No favorite chats yet",
  "thread.tabEmptyGroups": "No group chats yet",
  "thread.tabEmptyArchived": "No archived chats",
  "thread.tabEmptyAllArchived":
    "Every chat is archived. Check the Archived tab to find them.",
  "deleteChat.confirmTitle": "Delete this chat?",
  "deleteChat.confirmBody":
    "It disappears from your inbox and clears your copy. {name} keeps theirs, and if they message you again, the chat comes back with only the new messages.",
  "deleteChat.confirmBodyGeneric":
    "It disappears from your inbox and clears your copy. The other member keeps theirs, and if they message you again, the chat comes back with only the new messages.",
  "deleteChat.confirmCta": "Delete chat",
  "deleteChat.cancelCta": "Cancel",
  // PRD-357: "delete chat" on a GROUP only ever clears the caller's own copy
  // (there is no "delete for everyone" on a group), so the confirm is
  // group-shaped rather than reusing the DM copy above, which promises the
  // chat "comes back" from the other member, a promise a group can't make.
  "deleteChat.confirmTitleGroup": "Clear this group chat?",
  "deleteChat.confirmBodyGroup":
    "This clears the group chat for you only. Other members keep theirs, and you can still send messages if you're an active member.",
  "deleteChat.confirmCtaGroup": "Clear chat",

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
  "gif.comingSoonHint":
    "We're wiring up GIF search. Check back soon to add a little motion to your messages.",

  // Emoji picker (EmojiComposerButton + EmojiPicker) — desktop only, the
  // "smile" affordance inside the composer pill. Category names double as
  // each rail tab's accessible name (icon-only buttons).
  "emoji.trigger": "Emoji",
  "emoji.panelLabel": "Emoji picker",
  "emoji.searchPlaceholder": "Search emoji",
  "emoji.loading": "Loading emoji…",
  "emoji.loadError": "Couldn't load emoji. Try again",
  "emoji.empty": "No emoji found",
  "emoji.railLabel": "Emoji categories",
  "emoji.recentsLabel": "Recently used",
  "emoji.categorySmileys": "Smileys & emotion",
  "emoji.categoryPeople": "People & body",
  "emoji.categoryAnimals": "Animals & nature",
  "emoji.categoryFood": "Food & drink",
  "emoji.categoryActivities": "Activities",
  "emoji.categoryTravel": "Travel & places",
  "emoji.categoryObjects": "Objects",
  "emoji.categorySymbols": "Symbols",
  "emoji.categoryFlags": "Flags",

  // Sticker picker (StickerPicker + EmojiPicker's segmented rail, ComposerAttachButton)
  "sticker.open": "Send a sticker",
  "sticker.panelLabel": "Sticker picker",
  "sticker.packsLabel": "Sticker packs",
  "sticker.recentsLabel": "Recently used",
  "sticker.loading": "Loading stickers…",
  "sticker.loadError": "Couldn't load stickers. Try again",
  "sticker.empty": "No stickers yet",
  "sticker.imageAlt": "{label} sticker",
  "sticker.attachmentLabel": "Sticker",
  // Segmented rail inside the emoji popover; keep these in the emoji.* family,
  // since they label that rail rather than the standalone sticker picker.
  "emoji.tabsLabel": "Emoji and stickers",
  "emoji.tabEmoji": "Emoji",
  "emoji.tabStickers": "Stickers",

  // Attach menu (ComposerAttachButton) — the paperclip inside the composer
  // pill and the Photo / File / GIF menu it opens. The rows themselves reuse
  // attachments.open, attachments.openDocument and gif.open below as their
  // VISIBLE labels, so a row can never say one thing and announce another.
  "attachments.menuOpen": "Attach",
  "attachments.menuLabel": "Attach to this message",

  // Image attachments (Composer's ImageComposerButton, MessageBubbleBody)
  "attachments.open": "Send a photo",
  "attachments.imageAlt": "Photo message",
  "attachments.fallbackText": "Photo",
  "attachments.previewUnavailable": "Photo preview unavailable",

  // WhatsApp Web-style caption screen (AttachmentCaptionScreen), opened after
  // picking a photo or GIF, before it sends as a message.
  "attachments.captionScreenLabel": "Add a caption before sending",
  "attachments.captionPlaceholder": "Add a caption",
  "attachments.captionSend": "Send",
  "attachments.captionDiscard": "Discard",

  // Full-screen photo viewer (ChatImageViewer + its chrome), opened by tapping
  // a photo or GIF bubble. Reply/Forward/Star reuse the actions.* keys above,
  // so the viewer and the long-press overlay can never drift apart in wording.
  "viewer.open": "Open photo from {sender}",
  "viewer.dialogLabel": "Photo from {sender}, {time}",
  "viewer.close": "Close photo",
  "viewer.counter": "{index} / {total}",
  "viewer.counterAnnouncement": "Photo {index} of {total}, from {sender}",
  "viewer.you": "You",
  "viewer.save": "Save",
  "viewer.saved": "Photo saved",
  "viewer.saveFallback":
    "We couldn't save that photo, so it opened in a new tab.",
  "viewer.saveFailed": "We couldn't save that photo. Try again.",
  "viewer.prev": "Previous photo",
  "viewer.next": "Next photo",

  // Thumbnail filmstrip along the bottom of the full-screen photo viewer
  "viewer.filmstripLabel": "Photos in this conversation",
  "viewer.filmstripItem": "Photo {index} of {total}, from {sender}",
  "viewer.gifBadge": "GIF",

  // Document attachments (DocumentComposerButton, MessageDocumentAttachment,
  // MessageBubbleBody, documentUploadProcessing)
  "attachments.openDocument": "Send a file",
  "attachments.documentFallbackText": "File",
  "attachments.documentPreviewUnavailable": "File preview unavailable",
  "attachments.documentMeta": "{format} · {size}",
  "attachments.download": "Download {fileName}",
  "attachments.documentError.unsupportedType":
    "That file type isn't supported. Use a PDF, TXT, CSV or XLSX file.",
  "attachments.documentError.tooLarge":
    "That file is too large. Keep it under {maxLabel}.",
  "attachments.documentError.retry": "We couldn't send that file. Try again.",
  // Scan section 9: the confirm step before a received file opens
  // (MessageDocumentAttachment, ConversationMediaDocumentList).
  "attachments.confirmOpenTitle": "Open this file?",
  "attachments.confirmOpenBody":
    "Only open files from people you trust. PDFs and spreadsheets can carry harmful content.",
  "attachments.confirmOpenFileLabel": "{fileName} ({format}, {size})",

  // Links inside a message bubble (linkify.tsx). Screen-reader-only gloss for
  // the external-link icon that marks a link leaving QueerPulse.
  "link.opensExternally": "opens an external site",
  // Scan section 9: the confirm step a link opens through when it looks unsafe
  // (LinkPreview, ConversationMediaLinkList, linkify.tsx). `{host}` is the
  // domain the link really resolves to.
  "link.confirmTitle": "Check this link before you open it",
  "link.confirmDestination": "It actually leads to {host}.",
  "link.suspiciousReason.shortener":
    "This is a shortened link, so it hides where it actually leads.",
  "link.suspiciousReason.punycode":
    "This address uses lookalike characters to disguise where it leads.",
  "link.suspiciousReason.ipAddress":
    "This link points straight at a numeric address instead of an ordinary website.",
  "link.suspiciousReason.credentialsInUrl":
    "This link hides its real destination behind another address.",
  "link.suspiciousReason.lookalike":
    "This address imitates a well-known brand's domain.",

  // Connection status strip (ConnectionStatusBanner) at the top of the open
  // thread — surfaces when the member is offline or the socket is reconnecting.
  "connection.offline":
    "You're offline. Messages will send when you reconnect.",
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
  // Shown for a query too short to have actually searched — distinct from
  // `emptyTitle`, which claims a real search came back with zero hits.
  "search.tooShortTitle": "Keep typing",
  "search.tooShortDescription":
    "Type at least two letters and we'll look through your inbox.",

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
  // DES-227: the removed/dissolved severed-composer siblings of the left
  // notice above, so all three severed states read as one family of copy.
  "conversation.removedGroupNotice":
    "You were removed from this group. Its history stays here, but you can't send new messages.",
  "conversation.dissolvedGroupNotice":
    "This group has ended. Its history stays here, but you can't send new messages.",
  // PRD-220: a cold enquiry (housing, flatmates) opens a 1:1 thread between two
  // members who aren't connected, and every reply from either side is refused
  // until they are. Shown instead of the composer, with the action that fixes
  // it. Which of the three states shows depends on the connection so far.
  "conversation.connectionRequiredNotice":
    "Replying here needs a connection with {name} first.",
  "conversation.connectionRequiredSendCta": "Send a connection request",
  "conversation.connectionRequiredPendingNotice":
    "Your connection request to {name} is still waiting for a reply.",
  "conversation.connectionRequiredIncomingNotice":
    "{name} would like to connect. Accept to keep this conversation going.",
  "conversation.connectionRequiredAcceptCta": "Accept and reply",
  "conversation.connectionRequiredDeclineCta": "Not now",
  "conversation.send": "Send",
  "conversation.composeAria": "Write a message",
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
  // A send the server refused because a moderation restriction is on the
  // sender's account. `status.retryAction` is the bare verb, used beside this
  // line where `status.retry` already carries its own "Not delivered" prefix.
  "status.restricted": "Not delivered · Blocked by a moderation restriction",
  "status.retryAction": "Retry",

  // Per-message action bar (MessageActions/ReactionPicker)
  "actions.react": "React",
  "actions.more": "More",
  "actions.report": "Report",
  "actions.delete": "Delete",
  // PRD-227. Offered to every participant on every message, unlike
  // `actions.delete` above, which only the author or staff can reach: hiding a
  // message on your own side is always yours to do.
  "actions.deleteForMe": "Delete for me",

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
  replyDeleted: "Message deleted",
  tombstone: "This message was deleted",
  "delete.confirmTitle": "Delete this message?",
  "delete.confirmBody": "It will be removed for everyone in this chat.",
  "delete.confirmCta": "Delete",
  // PRD-227 "delete for me": a SECOND, per-viewer thing beside the tombstone
  // above, never a replacement for it. The body has to be unambiguous about
  // who still sees the message, because the two options sit side by side and
  // choosing the wrong one is not undoable.
  "delete.confirmForMeTitle": "Delete this message for you?",
  "delete.confirmForMeBody":
    "This message will be removed from your side of the chat only. The other person will still see it.",
  "delete.confirmForMeCta": "Delete for me",
  "delete.cancelCta": "Cancel",
  "report.title": "Report this message",

  // Link preview / unfurl card (LinkPreview) — the card body (site/title/
  // description) is remote page content and stays as fetched; only the
  // screen-reader label is chrome, translated here.
  "linkPreview.aria": "Link preview: {title}",
  "linkPreview.ariaGeneric": "Link preview from {site}",
  // MessageLinkCard's place branch (a shared directory link): the card body
  // reuses the directory grid's own copy; only this accessible name is new.
  "linkPreview.placeAria": "Open {name} on QueerPulse",

  // Pinned-messages banner (ConversationPinnedBanner) + in-bubble indicators
  "pinned.bannerLabel": "Pinned message",
  // Multiple pins: shows position in the stack, e.g. "Pinned · 1/3".
  "pinned.bannerCounted": "Pinned · {index}/{total}",
  "pinned.jumpAria": "Jump to pinned message: {snippet}",
  // Jump-to-message status over the log (MessageJumpStatus): paging older
  // history until a quoted, pinned or searched message is found.
  "jump.finding": "Finding that message…",
  "jump.notFound":
    "We couldn't find that message. It may have been deleted or is no longer available.",
  "jump.tooFar":
    "That message is further back than we can reach right now. Scroll up to keep looking.",
  "jump.loadFailed":
    "We couldn't load earlier messages to find it. Check your connection and try again.",
  "pinned.indicator": "Pinned",
  "starred.indicator": "Starred",
  // PRD-332: in-app banner for a new message in a chat that is not on screen
  // (useIncomingMessageBanner). {preview} is already a kind word for photos,
  // GIFs and documents.
  "incomingBanner.message": "{name}: {preview}",
  "incomingBanner.groupMessage": "{name} in {group}: {preview}",
  "incomingBanner.open": "Open",

  // Forward picker (NewMessageModal, forward mode)
  "forward.title": "Forward to…",
  "forward.sectionPeople": "People",
  "forward.sectionGroups": "Groups",

  // Starred messages view (StarredMessagesModal)
  "starred.title": "Starred messages",
  "starred.open": "Starred messages",
  "starred.sub": "Messages you've saved. Only you can see these.",
  "starred.loading": "Loading your starred messages…",
  "starred.empty":
    "Nothing starred yet. Star a message to keep it here for later.",
  "starred.searchPlaceholder": "Search starred messages",
  "starred.searchAria": "Search starred messages by text, sender, or chat",
  "starred.filter.all": "All",
  "starred.filter.photos": "Photos",
  "starred.filter.documents": "Documents",
  "starred.filter.links": "Links",
  "starred.filter.groupLabel": "Filter starred messages by type",
  "starred.resultsCount_one": "{count} result",
  "starred.resultsCount_other": "{count} results",
  "starred.resultsCountAtLeast_one": "{count}+ result",
  "starred.resultsCountAtLeast_other": "{count}+ results",
  "starred.noMatchesTitle": "No starred messages match",
  "starred.noMatchesDescription": "Try a different search or filter.",
  "starred.clearFilters": "Clear filters",
  "starred.loadMore": "Load more",
  "starred.loadingMore": "Loading more…",
  "starred.loadError": "Couldn't load your starred messages.",
  "starred.moreLoaded_one": "{count} more message loaded",
  "starred.moreLoaded_other": "{count} more messages loaded",

  // New-message recipient picker (NewMessageModal)
  "newMessage.title": "New message",
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

  // Shared first-contact composer (FirstContactComposer, PRD-340): the ONE
  // compose surface every "message someone new" door renders: ConnectForm
  // (Connections > Say hello), MessageRequestComposer (Messages > New
  // message), and MessagesInboundRequestCard's Reply (answering a stranger's
  // request, where sending IS the accept). "notConnectedYet"/"composeIntro"
  // are shared by the two SENDING doors; "replyAccepts" etc. are the
  // recipient-side reply door's own honest framing.
  "firstContact.notConnectedYet": "You're not connected yet",
  "firstContact.composeIntro":
    "Introduce yourself. If {name} accepts, you'll be connected and this becomes your first conversation.",
  "firstContact.composePlaceholder": "Say hello to {name}…",
  "firstContact.composeAria": "Your message",
  "firstContact.sendCta": "Send request",
  "firstContact.sendingLabel": "Sending…",
  "firstContact.charactersLeft": "Characters left: {remaining}",
  "firstContact.replyAccepts":
    "Sending a reply accepts {name}'s request to connect.",
  "firstContact.replyPlaceholder": "Write your reply to {name}…",
  "firstContact.replyAria": "Your reply",
  "firstContact.replySendCta": "Send & accept",
  "firstContact.cancelReply": "Cancel",

  // "Requests" inbox tab (incoming message requests with accept/decline)
  "requests.tabLabel": "Requests",
  "requests.emptyTitle": "No message requests",
  "requests.loadErrorBody":
    "We couldn't load your message requests. Any waiting for you are still there. Try again in a moment.",
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
  // PRD-357: ends the group for everyone (GroupInfoModal footer, owner only).
  "group.dissolveAction": "End group",
  // Group management (#17 Phase 2) — roster actions, edit, add-members picker.
  "group.edit": "Edit group",
  "group.add": "Add members",
  "group.addTitle": "Add members",
  "group.addCta": "Add ({count})",
  // DES-229: MAX_GROUP_MEMBERS cap, shown in the create-group and
  // add-members pickers and mapped from the server's coded GROUP_FULL refusal.
  "group.selectedOfCap": "{selected} of {max} selected",
  "group.capReachedExtra": "That is the most you can add at once.",
  "group.full": "This group is full",
  "group.fullBody":
    "This group has reached its {max}-member limit. No one else can be added right now.",
  "group.fullToast": "This group can have up to {max} members",
  // DES-228: offered on an owner's own roster row.
  "group.makeOwner": "Make owner",
  "group.promote": "Make admin",
  "group.demote": "Remove admin",
  "group.remove": "Remove",
  // PRD-354: per-roster-row Block/Report kebab (GroupMemberRowSafetyMenu).
  "group.memberSafetyMenuAriaLabel": "More options for {name}",
  // Confirm step before removing a member (UX polish — no destructive action
  // without a confirm). Warm, non-blaming; the cancel keeps them in the group.
  "group.removeConfirm.title": "Remove {name}?",
  "group.removeConfirm.body":
    "{name} will lose access to this group and its messages. You can always add them back later.",
  "group.removeConfirm.cancel": "Keep in group",
  "group.removeConfirm.confirm": "Remove member",
  // DES-228: leave, with an owner-specific successor/ends variant and a
  // "Transfer ownership instead" escape hatch.
  "group.leaveConfirm.title": "Leave group?",
  "group.leaveConfirm.body":
    'You\'ll stop receiving messages from "{name}" unless someone adds you back.',
  "group.leaveConfirm.ownerBodySuccessor":
    'If you leave "{name}", {successor} becomes the new owner.',
  "group.leaveConfirm.ownerBodyEnds":
    'Nobody else is left in "{name}". Leaving will end the group for everyone.',
  "group.leaveConfirm.cancel": "Cancel",
  "group.leaveConfirm.confirm": "Leave",
  "group.leaveConfirm.transferInstead": "Transfer ownership instead",
  // DES-228: hand ownership to another member.
  "group.transferConfirm.title": "Make {name} the owner?",
  "group.transferConfirm.body":
    "{name} becomes the owner and you become an admin. Only the new owner can transfer ownership or end the group after this.",
  "group.transferConfirm.cancel": "Cancel",
  "group.transferConfirm.confirm": "Make owner",
  // PRD-357: ends the group for everyone (GroupDissolveConfirm).
  "group.dissolveConfirm.title": 'End "{name}" for everyone?',
  "group.dissolveConfirm.body":
    "Every member leaves, the chat history stays readable for everyone who was in it, and nobody can post again. This can't be undone.",
  "group.dissolveConfirm.cancel": "Cancel",
  "group.dissolveConfirm.confirm": "End group",
  "group.avatarLabel": "Group photo",
  // PRD-358: the group description (GroupInfoEditPanel / GroupInfoIdentityView).
  "group.descriptionLabel": "Description",
  "group.descriptionPlaceholder": "Add a description",
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

  // ENG-238: once the caller has left/been removed/the group has dissolved,
  // the roster is hidden (server sends `members: []`) and this notice stands
  // in for it (GroupInfoLeftNotice), keyed off `leftReason`.
  "group.leftNotice.left":
    "You left this group. You can still read past messages here.",
  "group.leftNotice.removed":
    "You were removed from this group. You can still read past messages here.",
  "group.leftNotice.dissolved":
    "This group has ended. You can still read past messages here.",

  // PRD-358: the group's revocable invite link (GroupInviteLinkSection) and
  // the invites it, or a direct add, left pending (GroupPendingInvitesList).
  "group.inviteLink.title": "Invite link",
  "group.inviteLink.copiedToast": "Invite link copied",
  "group.inviteLink.copy": "Copy",
  "group.inviteLink.reset": "Reset link",
  "group.inviteLink.turnOff": "Turn off",
  "group.inviteLink.create": "Create invite link",
  "group.inviteLink.resetConfirmTitle": "Reset the invite link?",
  "group.inviteLink.resetConfirmBody":
    "The old link stops working right away. Anyone who still has it won't be able to join with it.",
  // Pending-invites count heading (CLDR plural: _one / _other).
  "group.pendingInvites.title_one": "{count} pending invite",
  "group.pendingInvites.title_other": "{count} pending invites",
  "group.pendingInvites.revoke": "Revoke",
  "group.pendingInvites.revokeAriaLabel": "Revoke invite to {name}",

  // Coded group-error toasts (api/groupErrorMessages.ts): one bilingual
  // sentence per server refusal code, shared by every add/invite/join/pin
  // caller so the same refusal always reads the same way.
  "group.error.groupDissolved": "This group has ended.",
  "group.error.addRefused": "This person can't be added right now.",
  "group.error.inviteNotFound": "That invite is no longer available.",
  "group.error.inviteLinkInvalid": "This invite link isn't valid anymore.",
  "group.error.removedFromGroup":
    "You were removed from this group and can't rejoin this way.",
  "group.error.pinLimitReached":
    "This chat already has the maximum number of pinned messages.",
  "group.error.generic":
    "Something went wrong with that group action. Please try again.",

  // System messages (centred event pills — SystemMessagePill). Bilingual;
  // actor/target names arrive resolved from the server (or the demo mock).
  "system.groupCreatedYou": "You created the group",
  "system.groupCreated": "{actor} created the group",
  "system.memberAddedYou": "You added {target}",
  "system.memberAdded": "{actor} added {target}",
  // Viewer-is-target variant (DES-227's `targetIsMe`) on the existing
  // member_added/member_removed events, which previously only had a
  // viewer-is-actor variant.
  "system.memberAddedTarget": "{actor} added you",
  "system.memberRemovedYou": "You removed {target}",
  "system.memberRemoved": "{actor} removed {target}",
  "system.memberRemovedTarget": "{actor} removed you",
  "system.memberLeftYou": "You left",
  "system.memberLeft": "{actor} left",
  "system.groupRenamedYou": "You renamed the group to “{value}”",
  "system.groupRenamed": "{actor} renamed the group to “{value}”",
  // PRD-355/DES-227: role, ownership, photo, description, join and dissolve
  // event pills. "Admin" stays untranslated in PT (matches `group.roleAdmin`)
  // to sidestep gendered agreement.
  "system.memberPromotedYou": "You made {target} an admin",
  "system.memberPromotedTarget": "{actor} made you an admin",
  "system.memberPromoted": "{actor} made {target} an admin",
  "system.memberDemotedYou": "You removed {target} as admin",
  "system.memberDemotedTarget": "{actor} removed you as admin",
  "system.memberDemoted": "{actor} removed {target} as admin",
  // The previous owner (the event's actor) is never named in this copy, only
  // the new owner (the target), so there is no actor-is-me variant.
  "system.ownerChangedYou": "You are now the owner",
  "system.ownerChanged": "{target} is now the owner",
  "system.groupPhotoChangedYou": "You changed the group photo",
  "system.groupPhotoChanged": "{actor} changed the group photo",
  "system.groupDescriptionChangedYou": "You changed the group description",
  "system.groupDescriptionChanged": "{actor} changed the group description",
  "system.memberJoinedYou": "You joined",
  "system.memberJoined": "{actor} joined",
  "system.groupDissolvedYou": "You ended this group",
  "system.groupDissolved": "{actor} ended this group",
  // Business mailboxes: the migration note a moved enquiry thread gets.
  // Neutral and actor-free by design: the migration writes this row with a
  // NULL sender and names no actor, so it reads the same for every viewer,
  // owner included.
  "system.movedToBusinessMailbox":
    "This conversation moved to the business mailbox",
  // Same note, once the server resolves the business's name. The unnamed
  // key above stays the fallback when it cannot.
  "system.movedToNamedBusinessMailbox":
    "This conversation moved to {business}'s mailbox",
  // Neutral fallback for a system event type this client has never heard of
  // (e.g. a migration that starts writing a new event before the client that
  // renders it ships). Never a departure sentence.
  "system.unknownEvent": "This conversation was updated",

  // PRD-376: Business mailboxes (spec 2026-09-20, section 10): the mailbox
  // switcher, shared-mailbox claiming, staff attribution, reply-only
  // mailboxes, identity blocks and reports, and persona and company
  // contact. PT is informal tu. A mailbox is a caixa de mensagens, a
  // listing is a ficha, the business is negócio.
  "mailbox.switcher.buttonAria": "Mailbox: {name}. Switch mailbox",
  "mailbox.switcher.buttonAriaWithUnread":
    "Mailbox: {name}. Switch mailbox. New messages in your other mailboxes",
  "mailbox.switcher.title": "Your mailboxes",
  "mailbox.switcher.unreadCount": "{count} unread",
  "mailbox.switcher.current": "Current mailbox",
  "mailbox.switcher.settings": "Mailbox settings",
  "mailbox.switcher.back": "Back to your mailboxes",
  "mailbox.kind.profile": "Personal",
  "mailbox.kind.listing": "Directory listing",
  "mailbox.kind.subprofile": "Persona",
  "mailbox.kind.company": "Company",
  "mailbox.role.owner": "Owner",
  "mailbox.role.team": "Team",
  "mailbox.readOnly.tag": "Read only",
  "mailbox.untitled": "Unnamed mailbox",
  "mailbox.lostAccess":
    "You no longer answer for that mailbox, so your own messages are showing.",
  "mailbox.replyOnly.emptyTitle": "Nothing to answer yet",
  "mailbox.replyOnly.emptyBody":
    "Members write to {name} from its page. Every reply you send here goes out as {name}.",
  "mailbox.replyOnly.composeHint":
    "{name} answers conversations members start. Switch to your own mailbox to write to someone.",
  "mailbox.composer.replyingAs": "Replying as {name}",
  "mailbox.composer.readOnly":
    "Moderation removed {name}. Its conversations stay here to read, and replies are switched off.",
  "mailbox.claim.unclaimed": "Unclaimed",
  "mailbox.claim.mine": "You're handling this",
  "mailbox.claim.theirs": "{name} is handling this",
  "mailbox.claim.tookOverFrom": "{name} took over from {previous}",
  "mailbox.claim.rowMine": "Yours",
  "mailbox.claim.rowTheirs": "With {name}",
  "mailbox.claim.claim": "Claim",
  "mailbox.claim.release": "Release",
  "mailbox.claim.takeOver": "Take over",
  "mailbox.claim.takeOverTitle": "Take over from {name}?",
  "mailbox.claim.takeOverBody":
    "{name} is handling this conversation. Taking over moves it to you, and your team will see it with you.",
  "mailbox.claim.takeOverConfirm": "Take over",
  "mailbox.claim.claimedToast": "You're handling this conversation",
  "mailbox.claim.releasedToast": "Released for your team",
  "mailbox.claim.lostRaceToast": "Someone on your team got there first",
  "mailbox.claim.tookOverToast": "You took over from {name}",
  "mailbox.claim.error": "That didn't go through. Try again.",
  "mailbox.tab.unclaimed": "Unclaimed",
  "mailbox.tab.mine": "Mine",
  "mailbox.tab.unclaimedEmpty": "Every conversation has someone handling it",
  "mailbox.tab.mineEmpty": "You're not handling any conversations yet",
  "mailbox.attribution.customerLine": "{name} from {business}",
  "mailbox.attribution.staffLine": "Sent by {name}",
  "mailbox.formerBusiness": "Former business",
  "mailbox.failure.notStaff":
    "Not sent. You no longer answer for this mailbox.",
  "mailbox.failure.removed": "Not sent. Moderation removed this persona.",
  "mailbox.failure.wrongMailbox":
    "Not sent. This message belongs to another mailbox.",
  "mailbox.failure.cannotStart":
    "A business, persona or company mailbox can only reply.",
  "mailbox.settings.title": "Mailbox settings for {name}",
  "mailbox.settings.showStaffNames": "Show who replied",
  "mailbox.settings.showStaffNamesHelp":
    "Customers see a first name beside each reply, like “{firstName} from {name}”. Surnames and profiles stay hidden.",
  "mailbox.settings.exampleFirstName": "Ana",
  "mailbox.settings.ownerOnly": "Only the owner can change this.",
  "mailbox.settings.readOnly":
    "Moderation removed {name}, so these settings can't change.",
  "mailbox.settings.allowMyName": "Include my first name",
  "mailbox.settings.allowMyNameHelp":
    "Takes effect while “Show who replied” is on.",
  "mailbox.settings.saved": "Saved",
  "mailbox.settings.error": "That didn't save. Try again.",
  "mailbox.settings.loadError": "These settings didn't load. Try again.",
  "mailbox.block.action": "Block {name}",
  "mailbox.block.unblockAction": "Unblock {name}",
  "mailbox.block.confirmTitle": "Block {name}?",
  "mailbox.block.confirmBody":
    "Your conversations with {name} close for you. Whoever answers for {name} stays reachable on their own profile.",
  "mailbox.block.confirm": "Block",
  "mailbox.block.done": "You blocked {name}",
  "mailbox.block.undo": "Undo",
  "mailbox.block.error": "The block didn't go through. Try again.",
  "mailbox.report.action": "Report {name}",
  "mailbox.blocked.title": "Businesses, personas and companies",
  "mailbox.blocked.description":
    "Blocking one closes your conversations with it. Whoever answers for it stays reachable as themselves.",
  "mailbox.blocked.empty":
    "You haven't blocked any business, persona or company.",
  "mailbox.blocked.since": "Blocked {date}",
  "mailbox.blocked.unblocked": "You unblocked {name}",
  "mailbox.blocked.loadErrorTitle": "This list didn't load",
  "mailbox.blocked.loadErrorBody": "Check your connection and try again.",
  "mailbox.contact.cta": "Send a message",
  "mailbox.contact.note":
    "It lands in {name}'s mailbox, and only whoever answers for {name} can read it.",
  "mailbox.contact.replyNote":
    "They can reply straight away. You can send more once they do.",
  "mailbox.contact.existingThreadCta": "Open your conversation",
  "mailbox.contact.signInPrompt":
    "Sign in to write to {name} without sharing a phone number or an email address.",
  "mailbox.contact.signInCta": "Sign in",
  "mailbox.contact.loadErrorTitle": "Messaging options didn't load",
  "mailbox.contact.loadErrorBody": "Try again in a moment.",
  "mailbox.contact.unavailable.ownMailbox":
    "You answer for {name}. Its messages reach you through your mailbox switcher.",
  "mailbox.contact.unavailable.unstaffed": "Nobody answers for {name} yet.",
  "mailbox.contact.unavailable.removed":
    "{name} was removed and can't receive messages.",
  "mailbox.contact.unavailable.unavailable":
    "You can't message {name} from your account.",
  "mailbox.contact.limit.thisMailbox":
    "You've already written to {name} today. Give them a chance to reply first.",
  "mailbox.contact.limit.acrossMailboxes":
    "You've written to a lot of businesses and personas today, so this is paused for now.",
  "mailbox.contact.limit.clearsIn": "You can write again {when}.",
  "mailbox.contact.eyebrow": "Private message",
  "mailbox.contact.title": "Write to <em>{name}</em>",
  "mailbox.contact.sub":
    "This goes to {name}'s mailbox, and whoever answers replies as {name}. Nothing is published.",
  "mailbox.contact.bodyLabel": "Your message",
  "mailbox.contact.bodyPlaceholder": "What would you like to ask?",
  "mailbox.contact.bodyHint": "At least {min} characters.",
  "mailbox.contact.charactersLeft": "Characters left: {remaining}",
  "mailbox.contact.cancel": "Cancel",
  "mailbox.contact.submit": "Send message",
  "mailbox.contact.submitting": "Sending",
  "mailbox.contact.error.generic":
    "Your message didn't send. Try again in a moment.",
  "mailbox.contact.error.rateLimited":
    "You've already written here today. Give them a chance to reply first.",
  "mailbox.contact.error.unavailable":
    "{name} can't receive messages right now.",
  "mailbox.contact.successAria": "Your message to {name} was sent",
  "mailbox.contact.successTitle": "Message",
  "mailbox.contact.successEm": "sent",
  "mailbox.contact.successBody": "It's in {name}'s mailbox.",
  "mailbox.contact.openThreadCta": "Open the conversation",
  "mailbox.contact.doneCta": "Done",

  // ── Safety — block/report a member + share-carefully notice (Wave A) ──
  "conversation.reportMemberAction": "Report {name}",
  // PRD-354: the group conversation menu's own "Report group" item.
  "conversation.reportGroupAction": "Report group",
  "report.memberTitle": "Report {name}?",
  // PRD-356: reports the whole group, not one person in it.
  "report.groupTitle": "Report {name}?",
  "report.anonymousLabel": "Report anonymously",
  "report.alsoBlockLabel": "Also block {name}",
  // Stands in for {name} when the sender has no display name left: a group
  // message whose author erased their account still carries a handle.
  "report.genericPersonLabel": "this person",
  "report.success.combinedTitle":
    "Your report is <em>with a moderator,</em> and {name} is blocked.",
  "report.success.combinedBody":
    "Someone on the moderation team reads every report, and {name} can no longer view your profile, message you, or find you in search.",
  "report.success.blockFailedNote":
    "The report went through, but blocking {name} didn't. You can try blocking them again from their profile.",
  "conversation.contactSafetyNotice":
    "Keep the conversation here until you trust someone. Never send money, and never share bank details. Real listings don't ask for that.",

  // ── Panel chrome (MessagesRailChrome) ──
  // Desktop only. This route hides the site nav (AppShell `chromeless`),
  // so the inbox panel carries its own way back out.
  "rail.backToPlatform": "Back to QueerPulse",
  // ── Chat wallpaper (ConversationMenu → WallpaperModal) ──
  // The pattern names are the caption under each miniature swatch, so they
  // double as the swatch button's accessible name. Keep them plain pattern
  // names rather than poetic ones: someone comparing captions needs to know
  // what they are picking.
  "conversation.menuAriaLabel": "More options for this chat",
  "wallpaper.menuAction": "Wallpaper",
  "wallpaper.title": "Wallpaper",
  "wallpaper.sub": "Choose the background for {name}.",
  "wallpaper.patternLegend": "Pattern",
  "wallpaper.pattern.plain": "Plain",
  "wallpaper.pattern.doodles": "Doodles",
  "wallpaper.pattern.botanical": "Botanical",
  "wallpaper.pattern.sky": "Night sky",
  "wallpaper.pattern.confetti": "Confetti",
  "wallpaper.pattern.waves": "Waves",
  "wallpaper.pattern.terrazzo": "Terrazzo",
  "wallpaper.everyChatTitle": "Use for every chat",
  "wallpaper.everyChatSub":
    "Applies to chats that don't have a wallpaper of their own.",
  "wallpaper.previewReceived": "Love this one.",
  "wallpaper.previewSent": "Same. Keeping it.",
  "wallpaper.reset": "Reset",
  "wallpaper.cancel": "Cancel",
  "wallpaper.save": "Save",

  // Messaging inbox and entry points (scan section 5, 2026-09-15)
  "share.cta": "Send in a message",
  "share.ariaLabel": 'Send "{title}" in a message',
  "share.modalTitle": "Send in a message",
  "share.modalSub": "Pick up to {cap} conversations to send this to.",
  "share.searchPlaceholder": "Search conversations",
  "share.searchAriaLabel": "Filter conversations",
  "share.capReached": "You can send to up to {cap} conversations at a time.",
  "share.noteLabel": "Add a note (optional)",
  "share.notePlaceholder": "Say something about this {kind}",
  "share.noteCounter": "{count}/{max}",
  "share.sendCta": "Send",
  "share.sendingCta": "Sending…",
  "share.cancelCta": "Cancel",
  "share.emptyTitle": "No conversations yet",
  "share.emptyDescription":
    "Start a conversation first, then you can send things straight into it.",
  "share.emptyCta": "Go to Messages",
  "share.successToast_one": "Sent to {count} conversation",
  "share.successToast_other": "Sent to {count} conversations",
  "share.partialToast":
    "Sent to {sentCount} of {totalCount}. Didn't reach {failedNames}.",
  "share.errorToast": "That didn't send. Try again in a moment.",
  "share.openThreadCta": "Open",
  "share.selectedCount_one": "{count} conversation selected",
  "share.selectedCount_other": "{count} conversations selected",
  "share.kind.article": "article",
  "share.kind.listing": "listing",
  "share.kind.community": "community",
  "share.kind.directory": "place",
  "share.kind.gathering": "gathering",
  "share.kind.generic": "thing",
  "share.previewLabel": "Preview",
  "share.previewTo": "To",
  "share.previewEmptyRecipients": "Pick someone to send this to",
  "share.previewTime": "now",
  "search.loadErrorBody":
    "The search didn't come back. This one is on us. Try again in a moment.",
  "newMessage.strangersSearching": "Looking for that member…",
  "newMessage.strangersError":
    "We couldn't search for other members right now.",
  "thread.previewYou": "You:",
  "thread.draftLabel": "Draft:",
  "thread.mentionIndicator": "Mentioned you",
  "thread.mutedUntilIndicator": "Muted until {time}",
  "thread.unreadCountAria_one": "{count} unread message",
  "thread.unreadCountAria_other": "{count} unread messages",
  "thread.unreadAria": "Unread",
  "thread.loadErrorBody":
    "We couldn't load your conversations. They're still there, try again in a moment.",
  "thread.loadErrorInline": "Couldn't refresh your conversations.",
  "thread.muteFor8Hours": "Mute for 8 hours",
  "thread.muteFor1Week": "Mute for 1 week",
  "thread.muteAlways": "Mute always",
  "thread.muteMentionsOnly": "Mentions only",
  "thread.mutedUntil": "Muted until {time}",
  "thread.mutedAlways": "Muted",
  "thread.mutedMentionsOnly": "Mentions only",
  "thread.archivedToast": "You archived this chat.",
  "thread.archiveUndoCta": "Undo",
  "thread.offlineUnsaved":
    "This chat isn't saved on this device yet. Connect to load it.",
  "deleteChat.deletedToast": "You deleted this chat.",
  "deleteChat.undoCta": "Undo",
  "conversation.awaitingReplyNotice":
    "You reached out to {name}. Once they reply, you'll both be able to keep this conversation going.",
  "conversation.formerMemberNotice":
    "This person closed their QueerPulse account, so replies here can't reach them. You can still read the conversation.",
  "request.charactersLeft": "Characters left: {remaining}",
  "request.error.dailyLimit":
    "You've reached out to a lot of new people today. You can send more requests tomorrow.",
  "request.error.pendingLimit":
    "You have lots of requests still waiting for an answer. Once some are answered or you withdraw a few, you can send more.",
  "request.error.paused":
    "New message requests are paused on your account for now while our moderators look into something. Your conversations with your connections carry on as usual.",
  "request.error.recipientConnectionsOnly":
    "{name} is only accepting messages from their connections right now.",
  "requests.replyCta": "Reply",
  "requests.inboundHeading": "New requests",
  "requests.outboundHeading": "Your sent requests",
  // PRD-344: whether the addressee has read a sent request, shown on the
  // outbound card. Absent entirely (not rendered) when the signal is
  // withheld by either side's read-receipts preference.
  "requests.readStatusRead": "Read",
  "requests.readStatusUnread": "Not read yet",

  // PRD-353: pending group invites in the Requests tab (GroupInviteRequestRow,
  // MessagesRequestsPanel), a near-twin of the message-request cards above,
  // for a GROUP rather than a person.
  "requests.groupInvite.sectionHeading": "Group invites",
  "requests.groupInvite.invitedBy": "{inviter} invited you",
  "requests.groupInvite.accept": "Accept",
  "requests.groupInvite.decline": "Decline",
  "requests.groupInvite.acceptedDemo":
    "Joining groups is simulated in demo mode.",
  "requests.groupInvite.declined": "Invite declined.",
  "requests.groupInvite.untitledGroup": "This group",

  // Scan section 6: composer, attachments and actions (DES-198..214, PRD-350).
  "attachments.openCamera": "Camera",
  "attachments.cameraSheetLabel": "Take a photo",
  "attachments.cameraClose": "Close camera",
  "attachments.cameraFlip": "Flip camera",
  "attachments.cameraShutter": "Take photo",
  "attachments.cameraDenied": "Camera access was denied.",
  "attachments.cameraFailed": "We couldn't start the camera.",
  "attachments.cameraUseSystem": "Use system camera",
  "attachments.removePhoto": "Remove photo",
  "attachments.removeGif": "Remove GIF",
  "attachments.removeDocument": "Remove {fileName}",
  "attachments.cancelPhotoUpload": "Cancel photo upload",
  "attachments.cancelDocumentUpload": "Cancel upload of {fileName}",
  "attachments.uploadingProgress": "Uploading, {percent} percent",
  "attachments.pendingStripLabel_one": "Uploading {count} attachment",
  "attachments.pendingStripLabel_other": "Uploading {count} attachments",
  "attachments.pendingPhotoLabel": "Photo",
  "attachments.thumbnailsLabel": "Attachments to send",
  "attachments.thumbnailPhoto": "Photo, {index} of {count}",
  "attachments.thumbnailGif": "GIF, {index} of {count}",
  "attachments.thumbnailDocument": "{fileName}, {index} of {count}",
  "attachments.notSentPhoto": "Your photo wasn't sent.",
  "attachments.notSentGif": "Your GIF wasn't sent.",
  "attachments.notSentDocument": "{fileName} wasn't sent.",
  "actions.replyCancel": "Cancel reply",
  "actions.editCounter": "{count}/{max} characters",
  "actions.editOverLimitAnnouncement":
    "Message is over the {max}-character limit.",
  "actions.editWithinLimitAnnouncement":
    "Message is back within the character limit.",
  "actions.editEmptyHint": "Type something to save your edit.",
  "reactions.name.love": "Love",
  "reactions.name.laugh": "Laugh",
  "reactions.name.like": "Like",
  "reactions.name.wow": "Wow",
  "reactions.name.sad": "Sad",
  "reactions.name.thanks": "Thanks",
  "reactions.chipLabel_one": "{name}, {count} reaction",
  "reactions.chipLabel_other": "{name}, {count} reactions",
  "reactions.chipLabelMine_one": "{name}, {count} reaction, including yours",
  "reactions.chipLabelMine_other": "{name}, {count} reactions, including yours",
  "pinned.toastPinned": "Message pinned",
  "pinned.toastUnpinned": "Message unpinned",
  "starred.toastStarred": "Message starred",
  "starred.toastUnstarred": "Message unstarred",
  "forward.pickerSub": "Pick up to {max} chats to forward this message to.",
  "forward.sendCtaEmpty": "Send",
  "forward.sendCta_one": "Send to {count} chat",
  "forward.sendCta_other": "Send to {count} chats",
  "forward.selectedAria_one": "{count} chat selected",
  "forward.selectedAria_other": "{count} chats selected",
  "forward.removeRecipient": "Remove {name}",
  "forward.capReached": "You can forward to up to {max} chats at a time.",
  "forward.sentToast_one": "Forwarded to {count} chat",
  "forward.sentToast_other": "Forwarded to {count} chats",
  "forward.failedToast":
    "Couldn't forward to {names}. They're still selected, so you can try again.",
  "gif.gridLabel": "GIF results",
  "conversation.contactSafetyNoticeDismiss": "Dismiss safety notice",
  "conversation.dropFilesHint": "Drop files to send",
  "composer.lengthCounter": "{count}/{max} characters",
  "composer.overLimitAnnouncement":
    "Message is over the {max}-character limit.",
  "composer.withinLimitAnnouncement":
    "Message is back within the character limit.",
  "status.tooLongToSend": "Not delivered · Too long to send",
  // Scan section 7: conversation pane and accessibility
  "conversation.announcementSenderFallback": "Someone",
  "conversation.announcementMediaWithCaption": "{kind}, {caption}",
  "attachments.photoLoadFailed": "Photo unavailable",
  "attachments.photoRetry": "Try again",
  "bubble.roleDescription": "Message",
  "album.label_one": "Album, {count} photo",
  "album.label_other": "Album, {count} photos",
  "actions.info": "Info",
  "actions.reactions": "Reactions",
  "info.title": "Message info",
  "info.read": "Read",
  "info.notYet": "Not yet",
  "reactors.title": "Reactions",
  "reactors.tablistLabel": "Filter reactions",
  "reactors.tabAll": "All {total}",
  "reactors.tapToRemove": "Tap to remove",
  "reactors.removeLabel": "Tap to remove your {name} reaction",
  "reactors.loading": "Loading reactions…",
  "reactors.error": "We couldn't load the reactions.",
  "reactors.empty": "No reactions yet.",
  // Scan section 12: media, links and docs gallery (ConversationMediaGallery)
  "mediaGallery.title": "Media, links and docs",
  "mediaGallery.tabsLabel": "Shared in this chat",
  "mediaGallery.tabMedia": "Media",
  "mediaGallery.tabLinks": "Links",
  "mediaGallery.tabDocuments": "Docs",
  "mediaGallery.loading": "Loading what's been shared…",
  "mediaGallery.error": "We couldn't load this right now.",
  "mediaGallery.loadMore": "Load more",
  "mediaGallery.loadingMore": "Loading more…",
  "mediaGallery.loadMoreError": "We couldn't load more right now.",
  "mediaGallery.emptyMediaTitle": "No photos yet",
  "mediaGallery.emptyMediaBody":
    "Photos and GIFs shared in this chat will gather here.",
  "mediaGallery.emptyLinksTitle": "No links yet",
  "mediaGallery.emptyLinksBody": "Links shared in this chat will gather here.",
  "mediaGallery.emptyDocumentsTitle": "No documents yet",
  "mediaGallery.emptyDocumentsBody":
    "Files shared in this chat, like a lease or a flyer, will gather here so they're easy to find again.",
  "mediaGallery.photoLabel": "Photo from {name}, {date}",
  "mediaGallery.photoLabelUndated": "Photo from {name}",
  "mediaGallery.photoLabelOwn": "Your photo, {date}",
  "mediaGallery.photoLabelOwnUndated": "Your photo",
  "mediaGallery.undatedHeading": "Earlier",
  "mediaGallery.entryMeta": "{name} · {date}",
  "mediaGallery.documentMeta": "{size} · {date}",
  "mediaGallery.showInChat": "Show in chat",
  // Scan section 9: safety, moderation and privacy
  formerMember: "Former member",
  "blockThenReport.title": "Report messages before you block?",
  "blockThenReport.lead":
    "These are {name}'s most recent messages in this chat. Pick any you'd like the moderation team to see before you block them.",
  "blockThenReport.skipCta": "Skip",
  "blockThenReport.continueCta": "Report and continue",
  "blockThenReport.continuingCta": "Reporting…",
  "blockThenReport.partialFailureToast":
    "{failed} of {total} reports couldn't be sent. You can still continue.",
  // Shown instead when the shared report throttle stops the batch part way,
  // so the rest are worth trying again rather than lost.
  "blockThenReport.throttledToast":
    "{succeeded} of {total} reports went through. The rest can be sent again in a minute or two.",
  // The caution strip above an inbound message that reads like a scam
  // (InboundSafetyCaution), and the two buttons shared by the link confirm
  // dialog and the file confirm dialog (OpenExternalConfirmDialog).
  "safety.inboundCaution":
    "Moving to another app or paying outside QueerPulse is how most scams start. Take your time, and you can report this message from its menu.",
  "safety.confirmGoBack": "Go back",
  "safety.confirmOpenAnyway": "Open anyway",

  // PRD-358: the group invite-link landing route (JoinGroupPage, /messages/join/:token).
  "join.loading": "Loading invite…",
  "join.title": "Join {group}?",
  "join.joinCta": "Join group",
  "join.openChatCta": "Open chat",
  "join.alreadyMember": "You're already in this group.",
  "join.joinedDemo": "Joining groups is simulated in demo mode.",
  "join.invalidLinkTitle": "This invite link isn't valid",
  "join.invalidLinkBody":
    "It may have been rotated, disabled, or the group may no longer exist.",
  "join.errorTitle": "Something went wrong",
  "join.errorBody": "We couldn't load this invite. Try again.",
  "join.backToMessages": "Back to messages",
};
