import type { Catalog } from "../../types";

/**
 * My Events — the "your events" dashboard (pills/toolbar/agenda/calendar,
 * event-card chrome, notifications, and the RSVP/settings/report/block
 * modals). Scope: platform chrome only. Mock event titles, venues, community
 * names, organiser/attendee names, and notification copy about a specific
 * event stay in English in the data files — in live mode those arrive over
 * the wire as the organizer's/member's own authored text. See
 * `docs/i18n/extraction-brief.md` §1.
 */
export const myevents: Catalog = {
  // ── Page shell (MyEventsPage / MyEventsHeader) ────────────────────────────
  "page.eyebrow": "Your account · Events",
  "page.title": "Your <em>events</em>",
  "page.sub":
    "Everything you're going to, everything you're running: gathered in one warm place.",
  "header.settingsAria": "Event preferences",
  "header.notifAria": "Notifications",
  "header.createCta": "Create a gathering",

  // ── Global events header (EventsHeader) ───────────────────────────────────
  "eventsHeader.title": "Events",
  "eventsHeader.searchAria": "Search events",
  "eventsHeader.hostCta": "Host a gathering",

  // ── Top-level My events | Discover switch (EventsTopTabs) ─────────────────
  "topTabs.mine": "My events",
  "topTabs.discover": "Discover",
  "topTabs.ariaLabel": "Events views",

  // ── Primary bucket pills (EventPills) ─────────────────────────────────────
  "pills.upcoming": "All upcoming",
  "pills.going": "Going",
  "pills.hosting": "Hosting",
  "pills.waitlisted": "Waitlisted",
  "pills.past": "Past",
  "pills.saved": "Saved & invites",

  // ── Toolbar (EventToolbar) ─────────────────────────────────────────────────
  "toolbar.searchPlaceholder": "Search your events by name or place…",
  "toolbar.searchAria": "Search your events",
  "toolbar.filter.inperson": "In person",
  "toolbar.filter.online": "Online",
  "toolbar.filter.free": "Free",
  "toolbar.filter.paid": "Ticketed",
  "toolbar.filter.month": "This calendar month",
  "toolbar.sortAria": "Sort events",
  "toolbar.sort.date": "Sort: by date",
  "toolbar.sort.community": "Sort: by community",
  "toolbar.sort.status": "Sort: by status",
  "toolbar.density.compact": "Compact",
  "toolbar.density.comfortable": "Comfortable",
  "toolbar.select.select": "Select",
  "toolbar.select.done": "Done",
  "toolbar.tzNote": "Times shown in Lisbon (WEST)",

  // ── Day filter chip (DayFilterChip) ────────────────────────────────────────
  "dayFilter.showing": "Showing <strong>{label}</strong>",
  "dayFilter.showAll": "Show all",

  // ── Mobile list/calendar toggle (MobileViewToggle) ────────────────────────
  "mobileView.list": "List",
  "mobileView.calendar": "Calendar",

  // ── Offline banner ─────────────────────────────────────────────────────────
  "offline.banner":
    "You're offline. Showing your saved events. We'll sync any changes when you're back.",

  // ── Agenda grouping (myEvents.agenda.ts → EventAgenda) ────────────────────
  "agenda.today": "Today",
  "agenda.thisWeek": "This week",
  "agenda.later": "Later",
  "agenda.hosting": "Hosting",
  "agenda.going": "Going",
  "agenda.waitlisted": "Waitlisted",
  "agenda.recentlyAttended": "Recently attended",
  "agenda.invitesWaiting": "Invites waiting on you",
  "agenda.savedForLater": "Saved for later",
  "agenda.invitesSent": "Invites you've sent",
  "agenda.otherCommunity": "Other",
  "agenda.showMore_one": "Show {count} more",
  "agenda.showMore_other": "Show {count} more",
  // Distinct error/retry state when the live events fetch fails (never a false
  // "no events" — see EventAgenda).
  "agenda.error.title": "We couldn't load your <em>events</em>",
  "agenda.error.description":
    "Something went wrong reaching your calendar. Your events are safe. This is just a hiccup on our side.",
  "agenda.error.retry": "Try again",

  // ── Empty states (empties.data.tsx, Pattern B) ────────────────────────────
  "empties.upcoming.title": "Nothing on the calendar <em>yet</em>",
  "empties.upcoming.sub":
    "When you say yes to a gathering or host one of your own, it'll land right here. There's always something on. Have a look when you're ready.",
  "empties.upcoming.browseCta": "Browse gatherings",
  "empties.upcoming.hostCta": "Host your own",
  "empties.going.title": "No RSVPs <em>right now</em>",
  "empties.going.sub":
    "You haven't said yes to anything coming up. Browse what's on (a film night, a picnic, a quiet book club) and say yes to one.",
  "empties.going.cta": "See what's on",
  "empties.hosting.title": "You're not hosting <em>anything</em>",
  "empties.hosting.sub":
    "The best gatherings start with one person deciding to make space. Yours could be a small dinner or a whole picnic. We'll help you run it.",
  "empties.hosting.cta": "Create a gathering",
  "empties.waitlisted.title": "No waitlists <em>right now</em>",
  "empties.waitlisted.sub":
    "When a gathering you want is full, join its waitlist and we'll keep your place. We'll let you know if a spot opens.",
  "empties.waitlisted.cta": "Browse gatherings",
  "empties.past.title": "No history <em>here</em>, but you're early",
  "empties.past.sub":
    "Once you've been to your first gathering, it'll live here as a quiet record of where you've been and who you met.",
  "empties.past.cta": "Find your first one",
  "empties.saved.title": "Nothing saved or <em>pending</em>",
  "empties.saved.sub":
    "Bookmark gatherings you're not sure about yet, and any invites from other members will wait for you here. No rush, no pressure.",
  "empties.saved.cta": "Browse gatherings",
  "empties.day.title": "Nothing on <em>this day</em>",
  "empties.day.sub":
    "You've nothing planned here. Pick another day with a dot, or clear the filter to see everything coming up.",
  "empties.day.cta": "Show everything",
  "empties.search.title": "No events <em>match</em>",
  "empties.search.sub":
    "Nothing here fits your search and filters right now. Try a different word, or loosen a filter.",
  "empties.search.cta": "Clear search & filters",

  // ── Event card: select checkbox + meta line (EventCard, EventCardParts) ───
  "card.selectAria": "Select {title}",
  "card.joinLinkCta": "Join link",
  "card.directionsCta": "Directions",
  "card.joinLinkToast": "Opening the join link…",
  "card.directionsToast": "Opening directions to {venue}",

  // ── Live-data labels (api/myEvents.adapters.ts) ───────────────────────────
  // Platform chrome the live adapter fills in where the API sends a flag
  // rather than authored text: an online gathering has no venue string, and a
  // pending invite row can arrive without its event summary.
  "card.online": "Online",
  "invite.defaultTitle": "Event invitation",

  // ── Urgency / friends chips (EventCardParts) ──────────────────────────────
  "card.soldOut": "Sold out",
  "card.spotsOpen_one": "{count} spot open",
  "card.spotsOpen_other": "{count} spots open",
  "card.friendsGoing_one": "{count} of your connections are going",
  "card.friendsGoing_other": "{count} of your connections are going",
  "card.friendsToast": "Showing connections who are going…",

  // ── "Happening now / starts in" bar (myEvents.helpers.ts soonLabel) ───────
  "soon.happeningNow": "Happening now",
  "soon.startsInMins_one": "Starts in {mins}m",
  "soon.startsInMins_other": "Starts in {mins}m",
  "soon.startsInHours": "Starts in {hours}h",
  "soon.startsInHoursMins": "Starts in {hours}h {mins}m",
  "soon.checkInCta": "Check in",
  "soon.checkedInToast": "Checked in. Have a lovely time",
  "soon.ticketCta": "Ticket",

  // ── Status badges (EventCardBadges) ───────────────────────────────────────
  "badges.maybe": "Maybe",
  "badges.going": "Going",
  "badges.hosting": "Hosting",
  "badges.coHosting": "Co-hosting",
  "badges.waitlistedPosition": "Waitlisted · #{position}",
  "badges.goingCount_one": "{count} going",
  "badges.goingCount_other": "{count} going",
  "badges.goingFull": "{count} going · full",
  "badges.didntMakeIt": "Didn't make it",
  "badges.attended": "Attended",
  "badges.inPhotos_one": "You're in {count} photo",
  "badges.inPhotos_other": "You're in {count} photos",
  "badges.saved": "Saved",
  "badges.invitedTakeYourTime": "Invited. Take your time",
  "badges.youInvited": "You invited {invitee}",
  "badges.waitlistSuffix_one": " · {count} waitlist",
  "badges.waitlistSuffix_other": " · {count} waitlist",

  // ── Attendee footer line (EventCardBadges EventFoot) ──────────────────────
  "foot.coHostingWith": "Co-hosting with {name}",
  "foot.aheadOfYou":
    "<strong>{count} people before you.</strong> We'll let you know if a spot opens.",
  "foot.invitedYou": "<strong>{from}</strong> invited you",
  "foot.waitingOnReply": "Waiting on <strong>{invitee}</strong> to reply",

  // ── Right-hand action column (EventCardActions EventSide) ────────────────
  "side.findSimilar": "Find similar",
  "side.viewTicket": "View ticket",
  "side.eventDetailsCta": "Event details",
  "side.manageCta": "Manage",
  "side.viewListingCta": "View listing",
  "side.seePhotosCta": "See photos",
  "side.leaveNoteCta": "Leave a note",
  "side.leaveNoteToast": "Opening your note…",
  "side.receiptCta": "Receipt",
  "side.joinWaitlistCta": "Join waitlist",
  "side.joinWaitlistToast": "Added to the waitlist. We'll be in touch",
  "side.rsvpCta": "RSVP",
  "side.removeCta": "Remove",
  "side.removedFromSavedToast": "Removed from saved",
  "side.acceptCta": "Accept",
  "side.declineCta": "Decline",
  "side.manageInviteCta": "Manage",

  // ── Bookmark / save toggle (gathering detail — GatheringBookmarkButton) ────
  "bookmark.save": "Save",
  "bookmark.saved": "Saved",
  "bookmark.saveAria": "Save this event",
  "bookmark.savedAria": "Saved. Remove from your events",
  "bookmark.savedToast": "Saved to your events",
  "bookmark.removedToast": "Removed from saved",

  // ── Card tools row (EventCardActions EventTools) ──────────────────────────
  "tools.reminderOn": "Reminder on",
  "tools.remindMe": "Remind me",
  "tools.reminderInfoTooltip":
    "You'll get a reminder before this starts, based on your reminder-lead setting in Preferences",
  "tools.addToCalendar": "Add to calendar",
  "tools.addedToCalendarToast": "Added to your calendar",
  "tools.addToCalendarModalTitle": "Add to calendar",
  "tools.addToCalendarGoogle": "Google Calendar",
  "tools.addToCalendarOutlook": "Outlook",
  "tools.addToCalendarYahoo": "Yahoo Calendar",
  "tools.addToCalendarApple": "Apple Calendar",
  "tools.addToCalendarIcs": "Using another calendar app? Download the file (.ics)",
  "tools.addToCalendarToastGoogle": "Opened in Google Calendar",
  "tools.addToCalendarToastOutlook": "Opened in Outlook",
  "tools.addToCalendarToastYahoo": "Opened in Yahoo Calendar",
  "tools.addToCalendarToastApple": "Downloaded. Open it to add to Apple Calendar",
  "tools.addToCalendarToastIcs": "Downloaded. Open it in your calendar app",
  "tools.moreOptionsAria": "More options",
  "tools.more": "More",
  "tools.switchToGoing": "Switch to going",
  "tools.yourDetails": "Your details",
  "tools.cantMakeIt": "Can't make it",
  "tools.inviteCoHost": "Invite a co-host",
  "tools.dayOfDetails": "Day-of details",
  "tools.leaveWaitlist": "Leave waitlist",
  "tools.tellHostWhy": "Tell the host why",
  "tools.tellHostToast": "Opening a note to the host…",
  "tools.thankHost": "Thank the host",
  "tools.thankedToast": "Thank-you sent to the host",
  "tools.connectWithMet": "Connect with who you met",
  "tools.connectWithMetToast": "Showing people you met here…",
  "tools.sendNudge": "Send a nudge",
  "tools.nudgeSentToast": "Nudge sent to {invitee}",
  "tools.withdraw": "Withdraw",
  "tools.withdrawnToast": "Invitation withdrawn",
  "tools.askQuestion": "Ask a question",
  "tools.askQuestionToast": "Opening a message to the host…",

  // ── Access + safety chip labels (myEvents.data.ts ACCESS_LABEL_KEYS) ──────
  "access.label.sober": "Sober space",
  "access.label.stepfree": "Step-free access",
  "access.label.quiet": "Quiet corner",
  "access.label.interpret": "PT / EN",
  "access.label.bsl": "BSL interpreted",
  "access.label.masks": "Masks encouraged",

  // ── Access + edge-case notes (EventCardExtras) ────────────────────────────
  "access.contentNote": "Content note",
  "access.contentNoteFallbackToast": "This event carries a content note",
  "access.saferSpacePolicy": "Safer-space policy",
  "access.saferSpaceToast":
    "This gathering follows the QueerPulse safer-space policy",
  "alert.plansChanged": "Plans changed.",
  "alert.seeWhatChanged": "See what changed",
  "alert.seeWhatChangedToast": "Showing the full change history",
  "conflict.clashesWith": "Clashes with {title}",
  "conflict.body":
    "at the same time. You can only be in one place. You might want to let one go.",
  "edge.cancelledTitle": "The host cancelled this gathering.",
  "edge.cancelledBody": "Your RSVP was released.",
  "edge.findSomethingSimilar": "find something similar",
  "edge.findingSimilarToast": "Finding similar gatherings…",
  "edge.reviewTitle": "Under review.",
  "edge.reviewBody":
    "A report came in, so this gathering is being checked by our team. It stays up while we look.",
  "edge.seeStatus": "see status",
  "edge.seeStatusToast": "Opening the review status…",
  "edge.blockedBody":
    "Someone you've blocked is going to this. They won't see you, and you won't see them on the night.",
  "series.upcomingDatesToast": "Upcoming dates · {dates}",
  // MSG-16 — live recurring-series line (SeriesLine), populated from the
  // real backend series instead of only the demo mock.
  "series.cadenceWeekly": "Repeats weekly",
  "series.cadenceBiweekly": "Repeats every 2 weeks",
  "series.cadenceMonthly": "Repeats monthly",
  "series.position": "{position} of {total}",
  "series.positionToast": "{label} · {position}",
  "dayof.runOfShow": "Run of show",
  "dayof.whatToBring": "What to bring",
  "dayof.gettingIn": "Getting in",
  "dayof.meetingPoint": "Meeting point:",
  "dayof.doorCode": "Door code:",
  "dayof.doorCodeNote": "(shown because it starts soon)",

  // ── Calendar aside (CalendarCard, CalendarGrid) ───────────────────────────
  "calendar.today": "Today",
  "calendar.prevAria": "Previous",
  "calendar.nextAria": "Next",
  "calendar.view.month": "Month",
  "calendar.view.week": "Week",
  "calendar.view.year": "Year",
  "calendar.legend.hosting": "Hosting",
  "calendar.legend.going": "Going",
  "calendar.legend.pending": "Saved · waitlist · invite",
  "calendar.gridAria": "Event calendar",
  "calendar.nothingPlanned": "Nothing planned",
  "calendar.cellEventCount_one": "{count} event",
  "calendar.cellEventCount_other": "{count} events",
  "calendar.cellNoEvents": "no events",
  "calendar.cellAriaToday": ", today",

  // ── Subscribe / export (CalendarSubscribe) ────────────────────────────────
  "calSubscribe.feedTitle": "Subscribe to your feed",
  "calSubscribe.feedSub": "Auto-syncs with Google or Apple Calendar",
  "calSubscribe.feedToast":
    "Feed link copied. Add it in Google or Apple Calendar",
  "calSubscribe.feedCopyFailToast":
    "Couldn't copy automatically. Try again from a supported browser.",
  "calSubscribe.feedErrorToast": "Couldn't create your feed link. Try again.",
  "calSubscribe.exportTitle": "Export this month",
  "calSubscribe.exportSub": "Download a one-time .ics file",
  "calSubscribe.exportToast": "{month} events downloaded as .ics",

  // ── .ics export (myEvents.ics.ts) ─────────────────────────────────────────
  // The DESCRIPTION line every exported VEVENT carries, so the calendar entry
  // links back to the event page for details and changes.
  "ics.description": "See the details and any updates on QueerPulse: {url}",

  // ── Recommendations strip (Discovery) ─────────────────────────────────────
  "discovery.title": "You might <em>like</em>",
  "discovery.imGoingCta": "I'm going",
  "discovery.imGoingToast": "You're going. Added to your events",
  "discovery.saveCta": "Save",
  "discovery.saveToast": "Saved for later",
  "discovery.hideCta": "Hide",

  // ── "Your year so far" (InsightsCard) ─────────────────────────────────────
  "insights.eyebrow": "Your year so far",
  "insights.emptyStat": "Your year <em>starts</em> here",
  "insights.emptySub":
    "Once you go to your first gathering, it'll gather here: a quiet count of where you've been this year.",
  "insights.emptyCta": "Find your first one",
  "insights.stat_one": "<em>{count}</em> gathering",
  "insights.stat_other": "<em>{count}</em> gatherings",
  "insights.sub": "Every gathering you've shown up for this year.",
  "insights.streak_one": "month in a row",
  "insights.streak_other": "months in a row",
  "insights.topCircle": "your top circle",
  "insights.hosted": "you hosted",

  // ── Overflow menu (MoreMenu) ───────────────────────────────────────────────
  "moreMenu.share": "Share this event",
  "moreMenu.shareToast": "Event link copied. Share it anywhere",
  "moreMenu.shareCopyFailToast": "Couldn't copy the link. Try again",
  "moreMenu.inviteFriend": "Invite a friend",
  "moreMenu.invitePickerTitle": "Invite a friend",
  "moreMenu.invitePickerSub": "Send them the event so they can join you",
  "moreMenu.inviteMessageText": "Come to {title} with me: {link}",
  "moreMenu.messageHost": "Message the host",
  "moreMenu.openGroupChat": "Open group chat",
  "moreMenu.changeToGoing": "Change to going",
  "moreMenu.markAsMaybe": "Mark as maybe",
  "moreMenu.transferTicket": "Transfer ticket",
  "moreMenu.transferToast": "Choose who to transfer your ticket to…",
  "moreMenu.requestRefund": "Request a refund",
  "moreMenu.refundToast": "Refund requested: 3–5 days back to your card",
  "moreMenu.connectWithMet": "Connect with who you met",
  "moreMenu.connectWithMetToast": "Showing people you met here…",
  "moreMenu.reportEvent": "Report this event",
  "moreMenu.blockHost": "Block the host",

  // ── Bulk-select bar (BulkBar) ──────────────────────────────────────────────
  "bulk.selected_one": "{count} selected",
  "bulk.selected_other": "{count} selected",
  "bulk.addToCalendar": "Add to calendar",
  "bulk.export": "Export",
  "bulk.cancelRsvps": "Cancel RSVPs",
  "bulk.doneAria": "Done selecting",
  "bulk.addedToCalendarToast_one": "{count} event added to your calendar",
  "bulk.addedToCalendarToast_other": "{count} events added to your calendar",
  "bulk.exportedToast_one": "{count} event exported as .ics",
  "bulk.exportedToast_other": "{count} events exported as .ics",
  "bulk.needsCommittedToast":
    "Select events you're going to or waitlisted for first",
  "bulk.droppedToast_one": "Dropped {count} event",
  "bulk.droppedToast_other": "Dropped {count} events",
  "bulk.undoCta": "Undo",
  "bulk.broughtBackToast": "Brought it back",

  // ── Notifications panel (NotifPanel) ──────────────────────────────────────
  "notif.panelAria": "Notifications",
  "notif.title": "What's changed",
  "notif.markAllRead": "Mark all read",
  "notif.empty": "You're all caught up.",

  // ── Modal aria-labels (MyEventsBody → ModalShell) ─────────────────────────
  "modal.rsvpDetailsLabel": "Your RSVP details",
  "modal.preferencesLabel": "Event preferences",
  "modal.cancelRsvpLabel": "Cancel RSVP",
  "modal.reportLabel": "Report this event",
  "modal.blockLabel": "Block this host",

  // ── Accept-invite confirmation panel (AcceptInviteConfirm) ────────────────
  "acceptConfirm.ariaLabel": "You're going",
  "acceptConfirm.eyebrow": "You're going",
  "acceptConfirm.title": "You said <em>yes.</em>",
  "acceptConfirm.addToCalendarCta": "Add to calendar",
  "acceptConfirm.doneCta": "Done",

  // ── RSVP details modal (RsvpDetailsModal) ─────────────────────────────────
  "rsvpModal.eyebrow": "Your RSVP",
  "rsvpModal.title": "Anything we should <em>know?</em>",
  "rsvpModal.whosComing": "Who's coming",
  "rsvpModal.bringingGuest": "Bringing a +1",
  "rsvpModal.guestHint": "Add a name so the host can welcome them too",
  "rsvpModal.guestNamePlaceholder": "Your guest's name (optional)",
  "rsvpModal.contributionLabel": "Your contribution",
  "rsvpModal.slidingHint":
    "This one's pay-what-you-can. Choose what works for you, no questions asked.",
  "rsvpModal.contribution.free": "€0: I need this to be free right now",
  "rsvpModal.contribution.supported": "€5: supported rate",
  "rsvpModal.contribution.standard": "€10: standard",
  "rsvpModal.contribution.payItForward": "€15: pay it forward",
  "rsvpModal.accessNeeds": "Access needs",
  "rsvpModal.accessPlaceholder":
    "Step-free route, a quiet spot, BSL, anything that helps you be there comfortably…",
  "rsvpModal.dietaryNeeds": "Dietary needs",
  "rsvpModal.dietaryPlaceholder":
    "Allergies, vegan, halal, kosher, for events where food is shared…",
  "rsvpModal.whoSees": "Who can see you're going?",
  "rsvpModal.visibility.everyone": "Everyone",
  "rsvpModal.visibility.connections": "Connections",
  "rsvpModal.visibility.justMe": "Just me",
  "rsvpModal.attendQuietly": "Attend quietly",
  "rsvpModal.attendQuietlyDesc":
    "Come along without your name showing on the guest list.",
  "rsvpModal.privacyNote":
    "Only the host sees your access & dietary notes. You can change all of this any time.",
  "rsvpModal.cancelCta": "Cancel",
  "rsvpModal.saveCta": "Save",
  "rsvpModal.savedToast": "Saved. Only the host can see this",
  "rsvpModal.saveErrorToast": "That didn't save. Try again.",

  // ── Ticket modal (EventTicketModal) ───────────────────────────────────────
  "ticketModal.eyebrow": "Your ticket",
  "ticketModal.statusLabel": "Status",
  "ticketModal.whereLabel": "Where",
  "ticketModal.online": "Online",
  "ticketModal.priceLabel": "Price",
  "ticketModal.withLabel": "Who's coming",
  "ticketModal.addToCalendarCta": "Add to calendar",
  "ticketModal.addedToCalendarToast": "Added to your calendar",

  // ── Event preferences modal (EventSettingsModal) ──────────────────────────
  "settingsModal.eyebrow": "Preferences",
  "settingsModal.title": "How your events <em>reach you</em>",
  "settingsModal.comingSoonNote":
    "Calendar sync and tickets are still on the way. You'll be able to connect them once they're live.",
  "settingsModal.pushLiveNote":
    "Reminder timing, phone push, your default visibility, and email are all live. Calendar sync and tickets are a preview of what's coming.",
  "settingsModal.pushLiveDesc":
    "On this device: a notification when an event you're going to is about to start.",
  "settingsModal.pushUnsupported":
    "This browser doesn't support push notifications.",
  "settingsModal.pushBlocked":
    "Notifications are blocked in your browser settings.",
  "settingsModal.remindBefore": "Remind me before an event",
  "settingsModal.lead.hour": "1 hour",
  "settingsModal.lead.day": "1 day",
  "settingsModal.lead.week": "1 week",
  "settingsModal.byDefaultWhoSees": "By default, who sees what I'm attending",
  "settingsModal.howWeReachYou": "How we reach you",
  "settingsModal.email": "Email",
  "settingsModal.emailDesc": "Reminders, changes, and invites by email.",
  "settingsModal.emailToggleLabel": "Email reminders",
  "settingsModal.push": "Push notifications",
  "settingsModal.pushDesc": "On your phone, for time-sensitive changes.",
  "settingsModal.pushToggleLabel": "Push notifications",
  "settingsModal.syncTickets": "Sync & tickets",
  "settingsModal.connectCalendar": "Connect your calendar",
  "settingsModal.connectCalendarSub": "Two-way sync with Google or Apple",
  "settingsModal.ticketsReceipts": "Tickets & receipts",
  "settingsModal.ticketsReceiptsSub": "All your tickets and payment records",
  "settingsModal.privacyNote":
    "QueerPulse never sells your data. Visibility is always your choice.",
  "settingsModal.closeCta": "Close",

  // ── Series-scope modal (SeriesScopeModal) ─────────────────────────────────
  "seriesModal.eyebrow": "Stepping out",
  "seriesModal.title": "Just this one, or the <em>whole series?</em>",
  "seriesModal.justThisDate": "Just this date",
  "seriesModal.justThisDateSub": "You'll stay in the series for future dates",
  "seriesModal.leaveWholeSeries": "Leave the whole series",
  "seriesModal.leaveWholeSeriesSub": "Drop out of every upcoming date",
  "seriesModal.neverMindCta": "Never mind",

  // ── Report modal (ReportEventModal) ───────────────────────────────────────
  "reportModal.eyebrow": "Report",
  "reportModal.title": "What's <em>wrong?</em>",
  "reportModal.whyReporting": "Why are you reporting this?",
  "reportModal.reason.hate": "Hate speech or harassment",
  "reportModal.reason.unsafe": "Unsafe or threatening behaviour",
  "reportModal.reason.spam": "Spam, scam, or misleading",
  "reportModal.reason.shouldntBeHere": "This event shouldn't be here",
  "reportModal.reason.somethingElse": "Something else",
  "reportModal.noteLabel": "Anything we should know?",
  "reportModal.noteOptional": "(optional)",
  "reportModal.notePlaceholder":
    "Share what happened in your own words. Only the safety team sees this.",
  "reportModal.privacyNote":
    "Reports are confidential. The host is never told who reported them.",
  "reportModal.cancelCta": "Cancel",
  "reportModal.sendCta": "Send report",
  "reportModal.sentToast": "Report sent. Our safety team takes it from here",

  // ── Block-host confirm (BlockHostConfirm) ─────────────────────────────────
  "blockModal.eyebrow": "Block",
  "blockModal.titleNamed": "Block <em>{host}?</em>",
  "blockModal.titleFallback": "Block <em>this host?</em>",
  "blockModal.bodyNamed":
    "You won't see events from everyone from {host} again, and they won't be able to invite you. You can undo this any time in your settings.",
  "blockModal.bodyFallback":
    "You won't see events from this host again, and they won't be able to invite you. You can undo this any time in your settings.",
  "blockModal.cancelCta": "Cancel",
  "blockModal.confirmCta": "Block",
  "blockModal.blockedToast": "Blocked. You won't see their events again",
  "blockModal.alreadyBlockedToast":
    "You already have this host blocked. Nothing changed.",

  // ── Toasts from RSVP/notification lifecycle (useMyEventsState.ts) ────────
  "toast.reminderSet": "Reminder set: {lead} before",
  "toast.reminderOff": "Reminder off",
  "toast.markedMaybe": "Marked as maybe. The host can see you're tentative",
  "toast.fullyIn": "You're fully in. See you there",
  "toast.rsvpGoing": "You're going. See you there",
  "toast.invitationDeclined": "Invitation declined. That's okay.",
  "toast.placeReleased":
    "Your place was released. The next person on the waitlist will hear from us.",
  "toast.leftWaitlist": "You've left the waitlist.",
  "toast.skippedThisOne": "Skipped this one. You're still in the series.",
  "toast.leftWholeSeries": "Left the whole series.",
  "toast.preferencesSaved": "Preferences saved",
};
