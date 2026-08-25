import type { Catalog } from "../../types";

/**
 * Gatherings — the events/meetups domain: the landing page, the events board
 * and calendar, event + RSVP pages, the host guide, the create wizard, the
 * host's manage/day-of dashboards, the photo album, and the "meet the table" view.
 *
 * Scope: platform chrome only. Mock event titles/descriptions, fictional host
 * and guest bios, and people's names + pronouns stay in English — in live mode
 * those come over the wire as somebody's own words and are never translated.
 * See `docs/i18n/extraction-brief.md` §1.
 */
export const gatherings: Catalog = {
  // ── Landing page (GatheringsPage) ─────────────────────────────────────────
  "landing.hero.eyebrow": "Gatherings",
  "landing.hero.title": "The community, <em>in the same room.</em>",
  "landing.hero.lead":
    "Supper clubs, mixers, studio visits, screenings, and skill swaps: real-world gatherings across Lisbon, hosted by members for members. This is where the platform stops being a screen.",

  "landing.ways.title": "Find your way <em>in.</em>",
  "landing.ways.lead":
    "Whether you're turning up for the first time or hosting your tenth supper club, start here.",
  "landing.ways.browse.title": "Browse what's on",
  "landing.ways.browse.body":
    "Supper clubs, mixers, studio visits, screenings, and skill swaps: filter by neighbourhood, type, and date.",
  "landing.ways.browse.cta": "See all events",
  "landing.ways.calendar.title": "The calendar view",
  "landing.ways.calendar.body":
    "The whole month at a glance, with RSVPs you've made and the gatherings near you highlighted.",
  "landing.ways.calendar.cta": "Open the calendar",
  "landing.ways.host.title": "Host your own",
  "landing.ways.host.body":
    "A step-by-step guide to running a supper club, workshop, or screening, with partner spaces and member support.",
  "landing.ways.host.cta": "Host a gathering",
  "landing.ways.recap.title": "Relive the last one",
  "landing.ways.recap.body":
    "Photos, notes, and the headcount from gatherings that have already happened.",
  "landing.ways.recap.cta": "See recaps",

  "landing.featured.title": "Happening <em>soon.</em>",
  "landing.featured.lead":
    "A taste of the next few weeks. The full board lives on the events page.",

  "landing.outro.title": "Bring people <em>together.</em>",
  "landing.outro.sub":
    "Every gathering started with one member deciding to host. The platform handles the rest: tickets, sliding scale, and a listing on the board.",
  "landing.outro.browseCta": "Browse all events",
  "landing.outro.hostCta": "Host a gathering",

  // ── Lisbon neighbourhoods ─────────────────────────────────────────────────
  // Proper nouns: identical in both catalogs. Keyed anyway so the rail stays
  // uniform and the non-place options ("Online") have somewhere to live.
  "hood.principeReal": "Príncipe Real",
  "hood.alfama": "Alfama",
  "hood.marvila": "Marvila",
  "hood.mouraria": "Mouraria",
  "hood.graca": "Graça",
  "hood.caisDoSodre": "Cais do Sodré",
  "hood.arroios": "Arroios",
  "hood.bairroAlto": "Bairro Alto",

  // ── The "spots" line on an event card ─────────────────────────────────────
  // Chrome: the live adapter composes these in source too (see
  // `api/events.adapters.ts`); only the number comes over the wire.
  "spots.seatsLeft_one": "{count} seat left",
  "spots.seatsLeft_other": "{count} seats left",
  "spots.spotsLeft_one": "{count} spot left",
  "spots.spotsLeft_other": "{count} spots left",
  "spots.going_one": "{count} going",
  "spots.going_other": "{count} going",
  "spots.goingSoFar_one": "{count} going so far",
  "spots.goingSoFar_other": "{count} going so far",
  "spots.goingWithWaitlist_one": "{count} going · {waitlist} on the waitlist",
  "spots.goingWithWaitlist_other": "{count} going · {waitlist} on the waitlist",
  "spots.goingWithPrice_one": "{count} going · {price}",
  "spots.goingWithPrice_other": "{count} going · {price}",
  "spots.goingPayWhatYouCan_one": "{count} going · pay what you can",
  "spots.goingPayWhatYouCan_other": "{count} going · pay what you can",
  "spots.goingOnline_one": "{count} going · online",
  "spots.goingOnline_other": "{count} going · online",
  "spots.casual": "Casual",
  "spots.openToAll": "Open to all",
  "spots.familyFriendly": "Family-friendly",
  "spots.online": "Online",
  "spots.allPaces": "All paces",
  "spots.ages1625": "Ages 16–25",
  "spots.byAppointment": "By appointment",
  "spots.noAudition": "No audition",
  "spots.dropIn": "Drop in",
  "spots.waitlistOpen": "Waitlist open",

  // ── RSVP calls to action ──────────────────────────────────────────────────
  // Chrome that varies by event kind, not organizer-authored.
  "cta.reserveSeat": "Reserve a seat",
  "cta.reserveSpot": "Reserve a spot",
  "cta.requestSpot": "Request a spot",
  "cta.illBeThere": "I'll be there",
  "cta.rsvp": "RSVP",
  "cta.joinOnline": "Join online",
  "cta.bookSlot": "Book a slot",
  "cta.joinWaitlist": "Join the waitlist",

  // ── In-event RSVP control (GatheringRsvpControl) ──────────────────────────
  // RSVP is an action inside the gathering detail: the primary action, its
  // confirmed "you're going" / waitlist state, and cancellation.
  "rsvpControl.waitlistCta": "Join the waitlist",
  "rsvpControl.pendingCta": "One moment…",
  "rsvpControl.goingTitle": "You're <em>going</em>",
  "rsvpControl.waitlistTitle": "You're on the <em>waitlist</em>",
  "rsvpControl.goingCount_one": "{count} member going so far",
  "rsvpControl.goingCount_other": "{count} members going so far",
  "rsvpControl.waitlistPosition": "You're number {position} in line",
  "rsvpControl.waitlistNote": "We'll let you know the moment a spot opens.",
  "rsvpControl.cancelCta": "Cancel RSVP",
  "rsvpControl.goingToast": "You're going",
  "rsvpControl.waitlistToast": "You're on the waitlist",
  "rsvpControl.cancelledToast": "RSVP cancelled",

  // ── Attendee meta line (attendeeMeta in api/events.adapters.ts) ───────────
  // The pronouns beside these are the person's own words and stay untranslated.
  "attendee.rsvpdOn": "RSVP'd {date}",
  "attendee.waitlistedSince": "On waitlist since {date}",
  "attendee.waitlistPosition": "#{position}",

  // ── Calendar legend (calendarLegend in data.ts) ───────────────────────────
  "calendar.legend.queerpulse": "QueerPulse",
  "calendar.legend.community": "Community",

  // ── Event, RSVP, gathering detail, cancelled, cohost invite ───────────────
  // Shared/cross-page chrome
  "common.backToGatherings": "Gatherings",
  "common.hostedBy": "Hosted by",
  "common.connectCta": "Connect",
  "common.timeRangeTo": "to",

  // EventPage — About / Details / Guidelines / hero / members-only / pills
  "event.about.title": "About this gathering",
  "event.about.accessibilityLabel": "Accessibility",
  "event.details.title": "Event details",
  "event.details.dateTime": "Date & time",
  "event.details.location": "Location",
  "event.details.foodDrink": "Food & drink",
  "event.details.language": "Language",
  "event.details.locationNote":
    "The exact address and door details are shared with confirmed guests after you RSVP.",
  "event.guidelines.title": "Community guidelines for this event",
  "event.guidelines.body1":
    "This is a private QueerPulse event. Everyone here has been invited because someone vouched for them or because they are already a member. The Code of Care applies. Be warm. Be present. Don't take photos of people without asking.",
  "event.guidelines.body2":
    "The sliding scale is not a suggestion. If you can pay the higher tier, please do. It directly subsidises someone else's ticket.",
  "event.hero.viewProfileCta": "View profile",
  "event.save.cta": "Save event",
  "event.save.saved": "Saved",
  "event.save.savedToast": "Event saved to your gatherings.",
  "event.save.removedToast": "Event removed from saved.",
  "event.save.saveAriaLabel": "Save {title}",
  "event.save.unsaveAriaLabel": "Remove {title} from saved",
  "event.membersOnly.title": "QueerPulse members only",
  "event.membersOnly.body":
    "This event is private. If someone forwarded you this link, ask them to invite you to the network first.",
  "event.pills.slidingScale": "Sliding scale · €{min}–{max}",

  // EventPage — sliding-scale ticket tiers (fixed platform chrome)
  "event.tiers.free.name": "Free",
  "event.tiers.free.desc": "No barriers to attending",
  "event.tiers.standard.name": "Standard",
  "event.tiers.standard.desc": "Covers the cost of your dinner",
  "event.tiers.supporter.name": "Supporter",
  "event.tiers.supporter.desc": "Subsidises someone else's place",

  // EventRsvpCard + EventRsvpSuccess
  "event.rsvp.headTitleFull": "This gathering is full",
  "event.rsvp.headTitle": "Reserve your place",
  "event.rsvp.headSubFull":
    "Join the waitlist. We'll email you if a spot opens.",
  "event.rsvp.headSub": "Pay what you can. All tiers include everything.",
  "event.rsvp.spotsRemaining_one": "<strong>{count} spot</strong> remaining",
  "event.rsvp.spotsRemaining_other": "<strong>{count} spots</strong> remaining",
  "event.rsvp.filledOfCapacity": "{filled} of {capacity} filled",
  "event.rsvp.namePlaceholder": "Your name *",
  "event.rsvp.emailPlaceholder": "Your email *",
  "event.rsvp.dietaryPlaceholder": "Dietary requirements (optional)",
  "event.rsvp.requiredHintFull":
    "Name and email are required. We send your waitlist update there.",
  "event.rsvp.requiredHint":
    "Name and email are required. We send your confirmation there.",
  "event.rsvp.joinWaitlistCta": "Join the waitlist",
  "event.rsvp.reserveCta": "Reserve my place",
  "event.rsvp.disabledHint": "Enter your name and a valid email to continue",
  "event.rsvp.noteFull":
    "We'll email you the moment a spot opens. Leaving the waitlist is one click.",
  "event.rsvp.confirmationEmailNote":
    "Your place is saved. You'll find it under your gatherings.",
  "event.rsvp.cancelPolicy": "You can cancel up to 48 hours before the event.",
  "event.rsvp.waitlistTitle": "You're on the <em>waitlist.</em>",
  "event.rsvp.errorToast": "That didn't go through. Try again in a moment.",
  "event.rsvp.waitlistBody":
    "This gathering is full, but we'll <strong>email {email}</strong> the moment a spot opens, usually within a day or two of someone cancelling.",
  "event.rsvp.waitlistMeta": "You can leave the waitlist at any time.",
  "event.rsvp.leaveWaitlistCta": "Leave the waitlist",
  "event.rsvp.reservedTitle": "You're <em>going.</em>",
  "event.rsvp.reservedTier": "Reserved on the <strong>{tier}</strong> tier",
  "event.rsvp.confirmationOnWay":
    "A confirmation is on its way to <strong>{email}</strong>.",
  "event.rsvp.addToCalendarCta": "Add to calendar",
  "event.rsvp.messageHostCta": "Message host",
  "event.rsvp.cancelReservationCta": "Cancel my reservation",

  // GatheringPage
  "gathering.badge.event": "QueerPulse event",
  "gathering.badge.gathering": "Member gathering",
  "gathering.seeAllCta": "See all gatherings",
  "gathering.spotsRemainingLabel": "spots remaining",
  "gathering.spotsUrgencyNote": "Move quickly if this speaks to you",
  "gathering.locationNote":
    "Full location shared with confirmed guests after you RSVP.",
  "gathering.moreTitle": "More <em>gatherings</em>",
  "gathering.notFoundTitle": "We couldn't find this gathering",
  "gathering.notFoundDescription":
    "It may have been cancelled, or the link might be out of date.",

  // GoingAttendeesPreview (MSG-12)
  "gathering.attendeesPreview.heading": "Who's going",
  "gathering.attendeesPreview.moreLabel": "+{count} more",

  // JoinVouchCallout
  "vouchCallout.title": "New here? <em>Get vouched in.</em>",
  "vouchCallout.body":
    "QueerPulse gatherings are members-only. To join, someone in the network vouches for you, or you request an invite and a member follows up. It keeps every room safe.",
  "vouchCallout.requestInviteCta": "Request an invite",
  "vouchCallout.safetyCta": "How we keep it safe",

  // GatheringSuccessPanel
  "successPanel.ariaLabel": "Confirmation",
  "successPanel.closeAriaLabel": "Close",
  "successPanel.defaultCloseLabel": "Done",

  // RsvpPage (reading-group RSVP confirmation)
  "rsvp.eyebrow": "You're going",
  "rsvp.title": "You're <em>in.</em>",
  "rsvp.details.dateTime": "Date & time",
  "rsvp.details.location": "Location",
  "rsvp.details.host": "Host",
  "rsvp.withLabel": "You're going with",
  "rsvp.othersCount_one": "and {count} other member",
  "rsvp.othersCount_other": "and {count} other members",
  "rsvp.live.goingWith_one":
    "You're going, along with <strong>{count} other member</strong>.",
  "rsvp.live.goingWith_other":
    "You're going, along with <strong>{count} other members</strong>.",
  "rsvp.live.waitlistNote_one": "{count} more is on the waitlist.",
  "rsvp.live.waitlistNote_other": "{count} more are on the waitlist.",
  "rsvp.host.roleLabel": "Reading group organiser",
  "rsvp.calendar.label": "Add to calendar",
  "rsvp.calendar.googleCta": "Google Calendar",
  "rsvp.calendar.appleCta": "Apple / .ics",
  "rsvp.calendar.downloadedToast": "Calendar file downloaded.",
  "rsvp.viewDetailsCta": "View gathering details",
  "rsvp.inviteCta": "Tell a friend: copy invite link",
  "rsvp.inviteCopiedToast":
    "Invite link copied. Share it with someone who should come.",
  "rsvp.inviteCopyFailedToast":
    "We couldn't reach your clipboard. Copy the link from the address bar instead.",
  "rsvp.coc.title": "What to <em>expect</em>",
  "rsvp.coc.affirming.strong": "This is an affirming space.",
  "rsvp.coc.affirming.rest":
    "Bring your whole self, including the parts you usually have to leave at the door. Queer identity, trans experience, neurodivergence, disability: you're welcome as you are.",
  "rsvp.coc.consent.strong": "We practise active consent.",
  "rsvp.coc.consent.rest":
    "Ask before touching, check before sharing photos, and take cues from each other. When in doubt, ask.",
  "rsvp.coc.privacy.strong": "What happens here stays here.",
  "rsvp.coc.privacy.rest":
    "This is a private community. Please don't share personal information, stories, or photos from gatherings without consent.",
  "rsvp.coc.organiser.strong":
    "If something doesn't feel right, tell the organiser.",
  "rsvp.coc.organiser.rest":
    "{host} is there to make the space work for everyone. You don't need to manage it alone.",
  "rsvp.footer.membership": "You RSVPed as a QueerPulse member.",
  "rsvp.footer.cancelCta": "Cancel RSVP",
  "rsvp.footer.cancelledToast": "Your RSVP has been cancelled.",
  "rsvp.footer.cancelErrorToast":
    "We couldn't cancel that just now. Try again in a moment.",
  "rsvp.footer.privacyCta": "Privacy policy",

  // CoHostInvitePage
  "cohostInvite.back": "Notifications",
  // Co-host invite options. The ids are validated backend-side
  // (`cohost-invite-options.ts`); the copy is frontend-owned and lives here,
  // rendered both in the host's composer Select and on the invitee's page.
  "cohostInvite.role.greeter.label": "Greeter",
  "cohostInvite.role.greeter.description":
    "Welcome people at the door and help anyone arriving alone find their footing.",
  "cohostInvite.role.room_lead.label": "Room lead",
  "cohostInvite.role.room_lead.description":
    "Keep an eye on the space itself: setup, flow, and packing down at the end.",
  "cohostInvite.role.comoderator.label": "Co-moderator",
  "cohostInvite.role.comoderator.description":
    "Hold the room's boundaries with the host, and step in if something needs addressing.",
  "cohostInvite.role.page_editor.label": "Page editor",
  "cohostInvite.role.page_editor.description":
    "Keep the gathering's page accurate: details, photos, and the answers people ask for.",
  "cohostInvite.commitment.light.label": "Just the day of",
  "cohostInvite.commitment.light.description":
    "A hand on the day itself, with nothing to do beforehand.",
  "cohostInvite.commitment.half_event.label": "Half the gathering",
  "cohostInvite.commitment.half_event.description":
    "Around for a good chunk of it, with the rest covered by someone else.",
  "cohostInvite.commitment.full_event.label": "The whole gathering",
  "cohostInvite.commitment.full_event.description":
    "There from setup to packing down.",
  "cohostInvite.commitment.ongoing.label": "Ongoing",
  "cohostInvite.commitment.ongoing.description":
    "This one and the ones after it, as a regular co-host.",
  // Empty states for the two ways this page can open without a live invite:
  // the link is dead (deleted, or the gathering went), and the invite was
  // already answered on another device or in an earlier session.
  "cohostInvite.notFoundTitle": "This invite isn't here anymore",
  "cohostInvite.notFoundDescription":
    "It may have been withdrawn, or the gathering it belonged to has gone. Nothing you did.",
  "cohostInvite.alreadyRespondedTitle": "You've already answered this invite",
  "cohostInvite.alreadyAcceptedDescription":
    "You're co-hosting with {host}. Their host tools are open to you.",
  "cohostInvite.alreadyDeclinedDescription":
    "You declined this one. {host} can always invite you to the next.",
  "cohostInvite.eyebrow": "Co-host invitation",
  "cohostInvite.title": "{host} wants you to <em>co-host</em> with her.",
  "cohostInvite.readThroughHint":
    "Read it through, decide tomorrow if you'd rather sleep on it.",
  "cohostInvite.hostedCount_one": "Hosted {count} gathering",
  "cohostInvite.hostedCount_other": "Hosted {count} gatherings",
  "cohostInvite.ratingFromAttendees": "from attendees",
  "cohostInvite.attendedCount": "You've been to {count} of hers",
  "cohostInvite.mutualsCount_one": "{count} mutual",
  "cohostInvite.mutualsCount_other": "{count} mutuals",
  "cohostInvite.invitedAgo": "Invited {time}",
  "cohostInvite.replyBy": "Reply by {date}",
  "cohostInvite.rsvpsAndWaitlist": "{rsvps} RSVPs · {waitlist} waitlist",
  "cohostInvite.rolesTitle": "What being <em>co-host</em> would mean",
  "cohostInvite.permRequired": "Required",
  "cohostInvite.permGranted": "Granted",
  "cohostInvite.permHostOnly": "{host} only",
  "cohostInvite.commitTitle": "The honest <em>commitment</em>",
  "cohostInvite.commitSub":
    "What this actually costs you. We'd rather you say no than show up tired.",
  "cohostInvite.outclauseBold":
    "If something comes up, you can step back any time before the day-of",
  "cohostInvite.sleepCta": "Sleep on it",
  "cohostInvite.snoozedToast": "Snoozed. Will remind you tomorrow",
  "cohostInvite.declineCta": "Decline politely",
  "cohostInvite.acceptCta": "Yes, co-host with {host}",
  "cohostInvite.acceptedToast":
    "You're co-hosting with {host}. Host tools unlocked",
  "cohostInvite.declinedToast":
    "Polite no sent to {host}. She'll find another second pair of hands.",
  "cohostInvite.actionMeta":
    "Either choice messages {host} directly. She'll see your decision but not be notified by push. <b>This is meant to be relaxed</b>.",
  "cohostInvite.openMessagesCta": "Open messages",
  "cohostInvite.permissionsNote":
    "Accepting lets you edit the page, message guests and manage RSVPs. <b>Cancelling the gathering and the host fund stay with {host}.</b>",

  // GatheringCancelledPage
  "cancelled.back": "Back to calendar",
  "cancelled.stampTitle": "This event has been cancelled.",
  "cancelled.stampBody":
    "You were on the list. Here's everything that happens next.",
  // Live mode only: no fabricated "cancelled N hours ago" or reason line —
  // the backend doesn't record a cancellation reason, so this stays generic.
  "cancelled.stampBodyLive":
    "Here are the details, and where to find what's on next.",
  "cancelled.explainerTitle": "Why it was cancelled",
  "cancelled.hostSentLabel": "host · sent the cancellation",
  "cancelled.sendWellWishesCta": "Send well-wishes",
  "cancelled.infoTitle": "What happens <em>for you</em>",
  "cancelled.refundTitle": "Your {price} ticket is refunded, automatically",
  "cancelled.headcountTitle": "You've been removed from the headcount",
  "cancelled.headcountBody":
    "The studio knew exactly who was coming. Nothing else to do.",
  "cancelled.rescheduleTitle": "{date} visit is open for RSVPs",
  "cancelled.rescheduleBody":
    "You can lock in {date} right now. {host} usually opens it later, but we're early because of this. <a>Skip to it ↓</a>",
  "cancelled.concernTitle": "Something feels off?",
  "cancelled.concernBody":
    "If you have concerns about the cancellation or want to flag a pattern, talk to the team",
  "cancelled.noteEyebrow": "A short note · from {host}",
  "cancelled.noteSentVia": "sent {time} via the host tools",
  "cancelled.altHeading": "Next visit, or something else this weekend",
  "cancelled.altRsvpsOpen": "RSVPs open",
  "cancelled.calendarCta": "Calendar",
  "cancelled.rsvpCta": "RSVP to {date}",

  // ── Calendar, events board, recap, photo album ────────────────────────────
  // Calendar
  "calendar.eyebrow": "Community Calendar",
  "calendar.heroTitle": "Everything happening <em>in one place.</em>",
  "calendar.heroSub":
    "Every QueerPulse gathering and community-run event across Lisbon (dinners, workshops, support circles, screenings, and more) in one shared calendar.",
  "calendar.prevMonth": "Previous month",
  "calendar.nextMonth": "Next month",
  "calendar.upcomingTitle": "All upcoming events",
  "calendar.emptyTitle": "No upcoming gatherings",
  "calendar.emptyDescription":
    "The calendar's quiet for now. Browse what's happening across the community, or be the one to start something.",
  "calendar.browseEventsCta": "Browse events",
  "calendar.selectedDayLabel": "Selected day",
  "calendar.selectDayPrompt": "Click any day with events to see details",
  "calendar.noEventsDay": "No events on this day.",
  "calendar.subscribeTitle": "Subscribe to calendar",
  "calendar.subscribeBody":
    "Get all queer community events delivered to your calendar app. Works with Google Calendar, Apple Calendar, and Outlook.",
  "calendar.emailPlaceholder": "your@email.com",
  "calendar.subscribeCta": "Subscribe",
  "calendar.subscribedCta": "Subscribed",
  "calendar.hostCta": "Host your own gathering",

  // Events
  "events.eyebrow": "What's on",
  "events.subtitle":
    "Every event here is hosted by QueerPulse or by people in the community. Browse the season and find your people.",
  "events.categoryAll": "All events",
  "events.categoryQueerpulse": "QueerPulse",
  "events.categoryCommunity": "Community",
  "events.heroTitle": "Everything happening <em>this season</em>",
  "events.viewCalendarCta": "View as calendar",
  "events.filterAriaLabel": "Filter events",
  "events.kindEvent": "Event",
  "events.kindGathering": "Gathering",
  "events.ticketedTag": "Ticketed",
  "events.buyTicketCta": "Buy ticket",
  "events.priceSingle": "{price}",
  "events.priceRange": "{min}–{max}",
  "events.emptyTitle": "Nothing on just yet",
  "events.emptyDescription":
    "No events are scheduled right now. New gatherings and partner events land here all the time. Check back soon.",
  "events.emptyFilterTitle": "Nothing in this category yet",
  "events.emptyFilterDescription":
    "No events match this filter for the season. Try another category, or browse everything that's on.",
  "events.showAllCta": "Show all events",
  "events.loadingMore": "Loading…",
  "events.loadMoreCta": "Load more events",

  // Recap
  "recap.eyebrow": "Gathering recap",
  "recap.attendedCount_one": "{count} attended",
  "recap.attendedCount_other": "{count} attended",
  "recap.linkCopiedToast": "Link copied!",
  "recap.photoAddedToast": "Your photo was added to the recap.",
  "recap.uploadErrorToast": "We couldn't add that photo. Please try again.",
  "recap.writeupEyebrow": "The write-up",
  "recap.gatheringHeading": "The <em>gathering</em>",
  "recap.fromTheDayEyebrow": "From the day",
  "recap.photoPlaceholder": "photo from the gathering",
  "recap.photosByMembers": "Photos by community members",
  "recap.submitYoursCta": "Submit yours",
  "recap.whoWasThereEyebrow": "Who was there",
  "recap.attendedHeading_one": "{count} member <em>attended</em>",
  "recap.attendedHeading_other": "{count} members <em>attended</em>",
  "recap.moreAttended_one": "+ {count} more member attended",
  "recap.moreAttended_other": "+ {count} more members attended",
  "recap.eventDetailsLabel": "Event details",
  "recap.dateLabel": "Date",
  "recap.venueLabel": "Venue",
  "recap.attendedLabel": "Attended",
  "recap.hostLabel": "Host",
  "recap.comingUpNextEyebrow": "Coming up next",
  "recap.moreFromHostEyebrow": "More from {name}",
  "recap.moreFromHostCta": "See gathering",
  "recap.seriesNextUpEyebrow": "This gathering repeats",
  "recap.seriesNextUpCta": "See the next date",
  "recap.attendedThisGathering": "You attended this gathering",
  "recap.yearInReviewCta": "Add to your year in review",
  "recap.soonBadge": "Soon",
  "recap.shareThisRecap": "Share this recap",
  "recap.copyLinkCta": "Copy link",

  // Recap — photo upload modal
  "recap.upload.title": "Add a photo",
  "recap.upload.subtitle":
    "Share a moment from the gathering. Choose a photo and add a caption.",
  "recap.upload.choosePhotoLabel": "Choose a photo",
  "recap.upload.captionLabel": "Caption",
  "recap.upload.captionPlaceholder": "Say something about this moment…",
  "recap.upload.photoPlaceholder": "your photo",
  "recap.upload.cancelCta": "Cancel",
  "recap.upload.addPhotoCta": "Add photo",
  "recap.upload.confirmTitle": "Added to <em>the recap</em>",
  "recap.upload.confirmBody":
    "Thanks for sharing. Your photo is now in the gallery for everyone who was there.",
  "recap.upload.doneCta": "Done",
  "recap.upload.defaultCaption": "A moment from the day",

  // Photos (gathering photo album)
  "photos.chipAll": "All",
  "photos.backToRecap": "Back to recap",
  "photos.addCta": "Add photos",
  "photos.uploadingCta": "Uploading…",
  "photos.emptyLive": "No photos yet.",
  "photos.uploadError": "Couldn't upload that photo. Try again.",
  "photos.albumLabel_one": "Photo album · {count} photo",
  "photos.albumLabel_other": "Photo album · {count} photos",
  "photos.hostedBy": "Hosted by",
  "photos.photosByLabel": "Photos by",
  "photos.plusAttendees_one": "+ {count} attendee",
  "photos.plusAttendees_other": "+ {count} attendees",
  "photos.photosLabel_one": "photo",
  "photos.photosLabel_other": "photos",
  "photos.consentToPublish": "with consent to publish",
  "photos.downloadAllCta": "Download all",
  "photos.slideshowCta": "Slideshow",
  "photos.policyTitle": "How we handle <em>gathering photos</em>",
  "photos.policyBody1":
    "Every photo here was taken by an attending member with consent from the people in the frame. <b>Faces are blurred by default</b> unless the person specifically opted in by name. This isn't a privacy nicety. It's how we make sure people show up next time.",
  "photos.policyBody2":
    'If you see yourself in a photo and want it removed (or unblurred), email <mailLink>hello@queerpulse.com</mailLink>. We\'ll handle it within 24 hours, no questions. <em>You can also untick "appear in event photos" globally</em> in <privLink>Privacy settings</privLink>.',
  "photos.photographersTitle": "Photographers <em>this event</em>",
  "photos.readRecapCta": "Read the recap",
  "photos.nextClinicCta": "Next clinic · {date}",
  "photos.flagCta": "Flag a photo",
  "photos.viewerAriaLabel": "Photo viewer",
  "photos.pauseSlideshowAriaLabel": "Pause slideshow",
  "photos.playSlideshowAriaLabel": "Play slideshow",
  "photos.closeAriaLabel": "Close",
  "photos.prevPhotoAriaLabel": "Previous photo",
  "photos.nextPhotoAriaLabel": "Next photo",

  // ── Create-gathering wizard + host guide ──────────────────────────────────
  // createGathering.data.ts — step pills
  "create.pill.type": "Type",
  "create.pill.datePlace": "Date & place",
  "create.pill.repeats": "Repeats",
  "create.pill.capacity": "Capacity",
  "create.pill.pricing": "Pricing",
  "create.pill.review": "Review",

  // createGathering.data.ts — sidebar tips (per step)
  "create.tip.type":
    "Choose the format that comes most naturally to you. The best gatherings are the ones hosts actually enjoy running.",
  "create.tip.datePlace":
    "The neighbourhood is shown on the listing. The full address is only shared with confirmed attendees.",
  "create.tip.repeats":
    "A standing weekly or monthly meetup builds a real following. Each date is still its own gathering: attendees RSVP, and you can edit or cancel one date without touching the rest.",
  "create.tip.capacity":
    "Be honest about accessibility. Attendees plan around it. Only tick what you can genuinely confirm.",
  "create.tip.pricing":
    "QueerPulse takes 0% of ticket revenue. Every euro goes to you. The sliding scale is required: it makes the community more accessible.",
  "create.tip.review":
    "Once you publish, you can still edit the listing. You cannot reduce capacity below the number of existing RSVPs.",

  // createGathering.data.ts — gathering types
  "create.type.supperClub.name": "Supper club",
  "create.type.supperClub.sub": "Shared meal, hosted",
  "create.type.workshopTalk.name": "Workshop / talk",
  "create.type.workshopTalk.sub": "Teach or share something",
  "create.type.screening.name": "Screening",
  "create.type.screening.sub": "Film, music, performance",
  "create.type.studioVisit.name": "Studio visit",
  "create.type.studioVisit.sub": "Open your space",
  "create.type.walkOutdoor.name": "Walk or outdoor",
  "create.type.walkOutdoor.sub": "Movement, outdoor",
  "create.type.discussion.name": "Discussion",
  "create.type.discussion.sub": "Reading group, debate",
  "create.type.skillsExchange.name": "Skills exchange",
  "create.type.skillsExchange.sub": "Mutual learning",
  "create.type.other.name": "Other",
  "create.type.other.sub": "Something else entirely",

  // createGathering.data.ts — neighbourhoods not already in gatherings:hood.*
  "create.hood.intendente": "Intendente",
  "create.hood.santos": "Santos",
  "create.hood.online": "Online",
  "create.hood.otherInLisbon": "Other in Lisbon",

  // createGathering.data.ts — event languages
  "create.lang.bilingual": "PT / EN bilingual",
  "create.lang.ptOnly": "Portuguese only",
  "create.lang.enOnly": "English only",
  "create.lang.other": "Other",

  // createGathering.data.ts — accessibility options
  "create.access.stepFree": "Step-free access throughout",
  "create.access.toilet": "Accessible toilet",
  "create.access.seating": "Seating available throughout",
  "create.access.lowSensory": "Low sensory / quiet option available",
  "create.access.dietary": "Dietary requirements can be accommodated",

  // createGathering.data.ts — publish confirmation checklist
  "create.confirm.codeOfCare":
    "This gathering follows the QueerPulse Code of Care.",
  "create.confirm.slidingScale":
    "The sliding scale (if ticketed) is genuine. The free tier will be honoured.",
  "create.confirm.accessibility":
    "The accessibility information I've provided is accurate to the best of my knowledge.",

  // CreateGatheringPage.tsx
  "create.eyebrow": "List your event",
  "create.title": "Create your <em>gathering.</em>",
  "create.lead":
    "Fill in the details below and your event will be live on the QueerPulse gatherings board immediately.",
  "create.toast.publishError": "Couldn't publish your gathering. Try again.",
  "create.toast.published": "Your gathering is live",
  "create.success.title": "Your gathering <em>is live.</em>",
  "create.success.body":
    "It's now visible on the QueerPulse gatherings board. Members can see it and RSVP. Each new attendee shows up in your gathering's guest list.",
  "create.success.accessLabel": "Accessibility shown to attendees",
  "create.success.viewCta": "View on board",
  "create.success.eventCta": "See your event page",
  "create.nav.cancel": "Cancel",
  "create.nav.back": "Back",
  "create.nav.publishHint": "Confirm all three boxes above to publish",
  "create.nav.dateHint": "Pick a date and time in the future to continue",
  "create.nav.repeatsHint":
    "Enter a valid number of dates, or an end date after your gathering's start, to continue",
  "create.nav.detailsHint": "Pick a format and name your gathering to continue",
  "create.nav.leaveConfirm":
    "You have an unpublished gathering here. Leave without saving it?",
  "create.nav.publish": "Publish gathering",
  "create.nav.continue": "Continue",
  "create.sidebar.tipLabel": "Tip for this step",
  "create.sidebar.afterTitle": "What happens after you publish",
  "create.sidebar.afterBody":
    "Your gathering appears on the board immediately. RSVPs come to your QueerPulse inbox. Full addresses are shared only with confirmed attendees. You can edit or cancel at any time up to 48 hours before.",

  // CreateGatheringSteps.tsx — step 1: type
  "create.step1.title": "What kind of <em>gathering?</em>",
  "create.step1.sub":
    "Choose the format. This determines some of the fields that follow.",
  "create.step1.typeRequired": "Pick a format to get started.",
  "create.step1.titleLabel": "Event title",
  "create.step1.titlePlaceholder":
    "A clear, specific title that says exactly what it is",
  "create.step1.titleRequired":
    "Give your gathering a name so people know what they're coming to.",
  "create.step1.descLabel": "Short description",
  "create.step1.descPlaceholder":
    "What will people do? What should they expect? What makes this gathering worth attending?",

  // CreateGatheringSteps.tsx — step 2: date & place
  "create.step2.title": "When and <em>where?</em>",
  "create.step2.sub":
    "The location is only shared with confirmed attendees and stays off the public listing.",
  "create.step2.dateLabel": "Date",
  "create.step2.dateRequired":
    "Pick a date and start time in the future so people can plan to come.",
  "create.step2.timeLabel": "Time",
  "create.step2.endTimeLabel": "End time (optional)",
  "create.step2.hoodLabel": "Neighbourhood",
  "create.step2.hoodPlaceholder": "Select…",
  "create.step2.venueLabel": "Venue name",
  "create.step2.venuePlaceholder":
    "e.g. Casa da Mariquinhas, My studio, Jardim do Torel",
  "create.step2.addressLabel":
    "Full address (shared only with confirmed attendees)",
  "create.step2.addressPlaceholder": "Street address",
  "create.step2.directionsLabel": "Getting there (optional)",
  "create.step2.directionsPlaceholder":
    "e.g. Ring the bell on the left, 5 min walk from Intendente metro",

  // RepeatsStep.tsx — step 2b: repeats (MSG-10)
  "create.step2b.title": "Does this <em>repeat?</em>",
  "create.step2b.sub":
    "A standing weekly or monthly meetup, not a one-off. Each date publishes as its own gathering, RSVPable and editable on its own.",
  "create.step2b.toggle": "This gathering repeats",
  "create.step2b.cadenceLabel": "How often",
  "create.step2b.endTypeLabel": "Ends",
  "create.step2b.endType.count": "After a number of dates",
  "create.step2b.endType.date": "On a date",
  "create.step2b.endCountLabel": "Number of dates",
  "create.step2b.endCountHint": "Between 2 and {max} dates.",
  "create.step2b.endUntilLabel": "Last possible date",
  "create.step2b.invalidHint":
    "Pick a number of dates or an end date after your gathering's start.",
  "create.repeats.cadence.weekly": "Weekly",
  "create.repeats.cadence.biweekly": "Every 2 weeks",
  "create.repeats.cadence.monthly": "Monthly",

  // CreateGatheringSteps.tsx — step 3: capacity
  "create.step3.title": "Who and <em>how many?</em>",
  "create.step3.sub":
    "Set a realistic cap. It's easier to open more spots than to turn people away at the door.",
  "create.step3.capLabel": "Capacity",
  "create.step3.capPlaceholder": "Max attendees",
  "create.step3.langLabel": "Language",
  "create.step3.accessLabel": "Accessibility: what can you confirm?",
  "create.step3.accessHint":
    "Only tick what you can genuinely confirm. Attendees will rely on this information.",
  "create.step3.notesLabel": "Accessibility notes (optional)",
  "create.step3.notesPlaceholder":
    "Anything else attendees should know: steps, parking, sound level…",
  "create.step3.communityLabel": "Post to a community (optional)",
  "create.step3.communityNone": "None (public gathering)",

  // AudienceScopeField.tsx — shared by the create wizard (step 3) and the
  // manage-gathering edit modal.
  "audienceScope.label": "Who can see this gathering?",
  "audienceScope.hint":
    "Choose how wide this reaches. You can change it anytime.",
  "audienceScope.members.label": "Public",
  "audienceScope.members.helper":
    "Anyone on QueerPulse can find this and RSVP.",
  "audienceScope.extendedNetwork.label": "Connections of connections",
  "audienceScope.extendedNetwork.helper":
    "People your connections know can find this: friends of friends only.",
  "audienceScope.network.label": "Network only",
  "audienceScope.network.helper": "Only people you're connected to.",
  "audienceScope.community.label": "Community members",
  "audienceScope.community.helper":
    "Only members of the community you're posting to.",
  "audienceScope.inviteOnly.label": "Invite only",
  "audienceScope.inviteOnly.helper": "Only the people you invite.",

  // CreateGatheringSteps.tsx — step 4: pricing
  "create.step4.title": "Tickets and <em>pricing.</em>",
  "create.step4.sub":
    "QueerPulse takes 0% of ticket revenue. All money goes directly to you. Sliding scale is mandatory for any paid event.",
  "create.step4.freeLabel": "Free event, no tickets needed",
  "create.step4.tiersHint":
    "Set three tiers. The sliding scale is not optional. If your event is paid, all three tiers must be offered. Members choose their tier privately.",
  "create.step4.priceColHead": "Price / person",
  "create.step4.spotsColHead": "Spots",
  "create.step4.tier.solidarity.name": "Free / solidarity",
  "create.step4.tier.solidarity.priceAria": "Free / solidarity price in euros",
  "create.step4.tier.solidarity.spotsAria": "Free / solidarity number of spots",
  "create.step4.spotsSuffix": "ppl",
  "create.step4.tier.solidarity.note":
    "This tier is for members who cannot afford to pay. Set aside at least 2–3 spots.",
  "create.step4.tier.standard.name": "Standard",
  "create.step4.tier.standard.priceAria": "Standard price in euros",
  "create.step4.tier.standard.spotsAria": "Standard number of spots",
  "create.step4.tier.supporter.name": "Supporter",
  "create.step4.tier.supporter.priceAria": "Supporter price in euros",
  "create.step4.tier.supporter.spotsAria": "Supporter number of spots",
  "create.step4.tier.supporterHint":
    "Supporter tier income subsidises the free tier. Suggested: standard × 1.8.",
  "create.step4.includedLabel": "What's included in the ticket?",
  "create.step4.includedPlaceholder":
    "e.g. Shared dinner and wine, materials provided, just your time",
  "create.step4.bringLabel": "Anything to bring / prepare?",
  "create.step4.bringPlaceholder":
    "Optional: e.g. Bring something to share, wear comfortable shoes",

  // CreateGatheringSteps.tsx — step 5: review
  "create.step5.title": "Review and <em>publish.</em>",
  "create.step5.sub": "Check the details before your gathering goes live.",
  "create.step5.accessEmpty": "None specified yet. Add what you can confirm",
  "create.step5.dateTimeValue": "{date} at {time}",
  "create.step5.locationValue": "{venue}, {hood}",
  "create.step5.capacityValue": "{cap} people · {lang}",
  "create.step5.row.type": "Type",
  "create.step5.row.title": "Title",
  "create.step5.row.dateTime": "Date & time",
  "create.step5.row.location": "Location",
  "create.step5.row.capacity": "Capacity",
  "create.step5.row.audience": "Who can see this",
  "create.step5.row.pricing": "Pricing",
  "create.step5.row.accessibility": "Accessibility",
  "create.step5.row.repeats": "Repeats",
  "create.step5.repeatsOff": "No, just this once",
  "create.step5.repeatsUntilCount": "{occurrences} dates",
  "create.step5.repeatsUntilDate": "until {date}",
  "create.step5.pricingFree": "Free event",
  "create.step5.pricingSliding": "Sliding scale · Free / {std} / {sup}",
  "create.step5.confirmHeading": "Before you publish: confirm all three",
  "create.step5.confirmIntro":
    "Tick each box to confirm. The <strong>Publish gathering</strong> button stays disabled until all three are checked.",
  "create.step5.allSet": "All set. You can publish now.",
  "create.step5.progress_one":
    "<num>{checkedCount}</num> of 3 confirmed. Tick the last box to publish.",
  "create.step5.progress_other":
    "<num>{checkedCount}</num> of 3 confirmed. Tick the remaining <remaining>{count}</remaining> boxes to publish.",

  // hostPage.data.ts — hero type chips
  "host.hero.type.supperClub": "Supper club",
  "host.hero.type.studioVisit": "Studio visit",
  "host.hero.type.skillsWorkshop": "Skills workshop",
  "host.hero.type.filmScreening": "Film screening",
  "host.hero.type.morningWalk": "Morning walk",
  "host.hero.type.bookClub": "Book club",
  "host.hero.type.openStudio": "Open studio",

  // hostPage.data.ts — type cards (step 1)
  "host.typeCard.supperClub.title": "Supper club",
  "host.typeCard.supperClub.body":
    "Intimate, hosted in your home or borrowed kitchen. 8–14 people. The model Tomás uses, and it works because it's personal.",
  "host.typeCard.studioVisit.title": "Studio visit",
  "host.typeCard.studioVisit.body":
    "Open your workspace to people who'd genuinely want to see it. Low logistics, high value. Works especially well for makers.",
  "host.typeCard.skillsSession.title": "Skills session",
  "host.typeCard.skillsSession.body":
    "Teach something you know. An hour of practical knowledge shared is worth more than most workshops that cost money.",
  "host.typeCard.screeningTalk.title": "Screening or talk",
  "host.typeCard.screeningTalk.body":
    "A film, a documentary, a conversation with someone interesting. A projector and a living room is enough.",

  // HostPage.tsx
  "host.hero.eyebrow": "For members",
  "host.hero.title": "Host a gathering <em>for your people.</em>",
  "host.hero.lead":
    "You don't need a venue budget, a committee, or a plan. You need a date, a few chairs, and something worth gathering for. This guide walks you through the rest.",
  "host.outro.title": "The best gatherings are the ones <em>that happen.</em>",
  "host.outro.sub": "Start small, start soon. The community is here.",
  "host.createGatheringCta": "Create your gathering",

  // HostSteps.tsx — step 1
  "host.step1.title": "Decide what kind of <em>gathering</em> you want",
  "host.step1.body":
    "The format shapes everything else. A dinner for eight is a completely different project from a workshop for thirty. Start with what you're actually good at and what feels manageable without help.",
  "host.step1.tip.head": "Start smaller than you think",
  "host.step1.tip.body":
    "Every experienced host will tell you the same thing: your first event should be half the size you're imagining. Six people is plenty. Get the format right, then scale.",

  // HostSteps.tsx — step 2
  "host.step2.title": "Find the <em>right space</em>",
  "host.step2.body":
    "Your home is usually the best option for small gatherings. It's free, flexible, and signals that this is a community gathering rather than a commercial event. For larger events, the network has access to several partner spaces across the city.",
  "host.step2.list.small":
    "<b>Under 12 people:</b> home or studio is ideal. Ask the board if you need a kitchen or a projector you don't have.",
  "host.step2.list.medium":
    "<b>12–30 people:</b> partner spaces in Mouraria, Príncipe Real, and Marvila. Post on the board asking for leads.",
  "host.step2.list.large":
    "<b>Over 30:</b> talk to us first. We can help connect you with spaces and potentially co-host.",
  "host.step2.tip.head": "Post on the board",
  "host.step2.tip.body":
    "If you're looking for a space, post it as an Ask. Members regularly offer their studios, kitchens, and rooftops for community events.",

  // HostSteps.tsx — step 3
  "host.step3.title": "Invite people <em>thoughtfully</em>",
  "host.step3.body":
    'Gatherings work because the room is curated, whatever its size. Think about who you\'re inviting and why: focus on "who would get something from being in this room together" over "who do I owe."',
  "host.step3.list.clear":
    "Be clear about what the event is, how long, and what people should bring or expect.",
  "host.step3.list.location":
    "Share the location only with confirmed attendees, keeping it off the public listing.",
  "host.step3.list.cap":
    "Set a realistic cap and stick to it. Turning people away is fine. Overcrowding isn't.",

  // HostSteps.tsx — step 4
  "host.step4.title": "On the <em>day</em>",
  "host.step4.body":
    "What matters most is the atmosphere when people arrive, more than the logistics. The first ten minutes determine whether someone feels welcome or like they've walked into the wrong room.",
  "host.step4.list.greet":
    "Greet people at the door. Introduce people to each other by name and with a reason.",
  "host.step4.list.activity":
    "Have something for people to do or hold in the first five minutes.",
  "host.step4.list.dontManage":
    "Don't try to manage the conversation too much. Open the room; don't run a panel.",
  "host.step4.tip.head": "On safety at gatherings",
  "host.step4.tip.body":
    "If you're hosting at your home, you have the right to ask anyone to leave at any time, for any reason. The QueerPulse Code of Care applies.",

  // HostSteps.tsx — step 5
  "host.step5.title": "After it's <em>over</em>",
  "host.step5.body1":
    "Write a brief note on the gathering listing: what happened, how it went. This helps people who couldn't make it and gives future hosts a sense of what works.",
  "host.step5.body2":
    "If you want to make it recurring, list it on the QueerPulse gatherings board. We'll help you find attendees and build the kind of trusted event that becomes a fixture in the community's calendar.",
  "host.step5.cta": "Tell us how it went",

  // HostSidebar.tsx
  "host.sidebar.readyTitle": "Ready to list your gathering?",
  "host.sidebar.readyBody":
    "Once you have a date, a format, and a rough idea of who you're inviting, you can list it on the QueerPulse gatherings page.",
  "host.sidebar.spacesTitle": "Partner spaces",
  "host.sidebar.spacesBody":
    "Spaces that have hosted QueerPulse gatherings and are open to hosting more.",
  "host.sidebar.capacity": "up to {max}",

  // ── Host dashboard, manage, cohosts, QR, album ────────────────────────────
  // ── Day-of dashboard (GatheringDashboardPage / GatheringDashboardCards) ────
  "dashboard.backToManage": "Manage gathering",
  "dashboard.inProgress": "In progress",
  "dashboard.checkedIn": "Checked in",
  "dashboard.expected": "Expected",
  "dashboard.waitlist": "Waitlist",
  "dashboard.dataRetentionNotice":
    "Gathering data is deleted 30 days after the event",
  "dashboard.attendanceRecordsNotice":
    "Attendance records are never shared publicly",
  "dashboard.checkedInToast": "{name} checked in",

  // ── Dashboard: check-in column ─────────────────────────────────────────────
  "dashboard.checkin.heading": "Check-in",
  "dashboard.checkin.qrAreaLine1": "QR scanner area",
  "dashboard.checkin.qrAreaLine2": "tap to open camera",
  "dashboard.checkin.scanCta": "Scan member QR",
  "dashboard.checkin.orDivider": "or search by name",
  "dashboard.checkin.searchPlaceholder": "Search guest list…",
  "dashboard.checkin.matchCount_one": "{count} match",
  "dashboard.checkin.matchCount_other": "{count} matches",
  "dashboard.checkin.noMatch": "Not on guest list",
  "dashboard.checkin.recentHeading": "Recent check-ins",
  "dashboard.checkin.justNow": "Just now",

  // ── Dashboard: guest list card ─────────────────────────────────────────────
  "dashboard.guestList.heading": "Guests",
  "dashboard.guestList.filterAll_one": "All ({count})",
  "dashboard.guestList.filterAll_other": "All ({count})",
  "dashboard.guestList.filterCheckedIn_one": "Checked in ({count})",
  "dashboard.guestList.filterCheckedIn_other": "Checked in ({count})",
  "dashboard.guestList.filterPending_one": "Not yet ({count})",
  "dashboard.guestList.filterPending_other": "Not yet ({count})",
  "dashboard.guestList.searchPlaceholder": "Search guests…",
  "dashboard.guestList.emptyAllTitle": "No one's on the guest list yet",
  "dashboard.guestList.emptyAllDescription":
    "As people reserve their spot, they'll appear here ready to check in. Share your gathering to bring the first guests in.",
  "dashboard.guestList.emptyFilterTitle": "No guests in this view",
  "dashboard.guestList.emptyFilterDescription":
    "No one matches your current filter or search. Try widening it to see everyone expected.",
  "dashboard.guestList.clearFiltersCta": "Clear filters",
  "dashboard.guestList.checkInManuallyCta": "Check in manually",
  "dashboard.guestList.checkedInChip": "Checked in {time}",
  "dashboard.guestList.expectedChip": "Expected",
  "dashboard.guestList.waitlistToggle_one": "{count} on waitlist. Promote",
  "dashboard.guestList.waitlistToggle_other": "{count} on waitlist. Promote",
  "dashboard.guestList.promoteCta": "Promote",
  "dashboard.guestList.promotedToast": "{name} promoted to guest list",
  "dashboard.waitlist.position": "#{position} on waitlist",

  // ── Dashboard: stats column ─────────────────────────────────────────────────
  "dashboard.stats.arrivalRateHeading": "Arrival rate",
  "dashboard.stats.now": "Now",
  "dashboard.stats.attendanceRateLabel": "Attendance rate so far",
  "dashboard.stats.peakArrivalLabel": "Peak arrival",
  "dashboard.stats.quickActionsHeading": "Quick actions",
  "dashboard.stats.messageAllCta": "Message all attendees",
  "dashboard.stats.messageSentToast_one": "Message sent to {count} guest",
  "dashboard.stats.messageSentToast_other": "Message sent to {count} guests",
  "dashboard.stats.startingCta": 'Send "We\'re starting"',
  "dashboard.stats.startingSentToast": "We're starting. Sent to all guests",
  "dashboard.stats.wrappedTitle": "Event <em>wrapped</em>",
  "dashboard.stats.wrappedText_one":
    "Check-in is closed and a follow-up has been sent to all {count} attendee with the recap and photo link.",
  "dashboard.stats.wrappedText_other":
    "Check-in is closed and a follow-up has been sent to all {count} attendees with the recap and photo link.",
  "dashboard.stats.endOfEventLabel": "End of event",
  "dashboard.stats.endOfEventText":
    "When the gathering wraps up, send a follow-up and close the check-in window.",
  "dashboard.stats.wrappedCheckbox": "The gathering has wrapped up",
  "dashboard.stats.endEventCta": "End event & send follow-up",
  "dashboard.stats.readyNote": "Ready to send the follow-up",
  "dashboard.stats.notReadyNote": "Mark the gathering as wrapped to enable",
  "dashboard.stats.followUpToast": "Follow-up sent. Check-in closed",

  // ── Manage page header (ManageGatheringPage) ────────────────────────────────
  "manage.eyebrow": "Hosting",
  "manage.status.approvedDaysToGo_one": "Approved · {count} day to go",
  "manage.status.approvedDaysToGo_other": "Approved · {count} days to go",
  "manage.actions.editDetails": "Edit details",
  "manage.actions.messageAttendees": "Message attendees",
  "manage.actions.dayOfDashboard": "Day-of dashboard",
  "manage.cancelConfirm_one":
    "Cancel {title}? All {count} attendee will be notified.",
  "manage.cancelConfirm_other":
    "Cancel {title}? All {count} attendees will be notified.",
  "manage.linkCopiedToast": "Link copied!",
  "manage.linkCopyFailedToast":
    "We couldn't reach your clipboard. Copy the link from the share card instead.",

  // ── Manage: live-mode coming-soon (host tools not wired yet) ─────────────────
  "manageComingSoon.title": "Host tools are <em>coming soon</em>",
  "manageComingSoon.description":
    "Managing a gathering from here isn't live yet. You can still browse and RSVP to what's happening. The hosting dashboard lands soon.",
  "manageComingSoon.browseCta": "Browse gatherings",
  "manageComingSoon.backHome": "Back to home",

  // ── Prototype pages: live-mode coming-soon (demo-only, no live gathering) ─────
  "prototypeComingSoon.browseCta": "Browse gatherings",
  "prototypeComingSoon.backHome": "Back to home",
  "eventComingSoon.title": "This gathering is <em>coming soon</em>",
  "eventComingSoon.description":
    "This is a preview of how a gathering looks. It isn't a live event yet, so there's nothing here to RSVP to. Browse what's actually happening and reserve your spot there.",
  "rsvpComingSoon.title": "RSVPs are <em>coming soon</em>",
  "rsvpComingSoon.description":
    "This confirmation page is part of the prototype and isn't tied to a live RSVP yet. Browse what's on and reserve a real spot. Your confirmation will land here once hosting is live.",
  "cohostInviteComingSoon.title": "Co-hosting is <em>coming soon</em>",
  "cohostInviteComingSoon.description":
    "Inviting and accepting a co-host isn't live yet. Browse what's happening in the meantime. Co-hosting tools land alongside the hosting dashboard soon.",
  "recapComingSoon.title": "Recaps are <em>coming soon</em>",
  "recapComingSoon.description":
    "Sharing photos and notes from a gathering isn't live yet, so nothing you add here would be saved. Browse what's on. Recaps arrive with the hosting tools soon.",

  // ── Manage: overview tab ─────────────────────────────────────────────────────
  "manage.overview.stat.going": "Going",
  "manage.overview.stat.waitlist": "Waitlist",
  "manage.overview.stat.spotsLeft": "Spots left",
  "manage.details.date": "Date",
  "manage.details.time": "Time",
  "manage.details.venue": "Venue",
  "manage.details.capacity": "Capacity",
  "manage.overview.editCta": "Edit",
  "manage.overview.descriptionLabel": "Description",
  "manage.overview.descriptionNoun": "description",
  "manage.overview.lastEdited": "Last edited {time}",

  // ── Manage: attendees tab ────────────────────────────────────────────────────
  "manage.attendees.searchPlaceholder": "Search attendees…",
  "manage.attendees.exportCta": "Export list",
  "manage.attendees.exportedToast": "CSV exported",
  "manage.attendees.inviteCta": "Invite members",
  "manage.attendees.spotsFilled": "{going} of {capacity} spots filled",
  "manage.attendees.goingHeading_one": "Going ({count})",
  "manage.attendees.goingHeading_other": "Going ({count})",
  "manage.attendees.waitlistHeading_one": "Waitlist ({count})",
  "manage.attendees.waitlistHeading_other": "Waitlist ({count})",
  "manage.attendees.loadMoreCta": "Load more",
  "manage.attendees.loadingMore": "Loading…",
  "manage.attendees.removeAria": "Remove {name} from guest list",
  "manage.attendees.removeCta": "Remove",
  "manage.attendees.removedToast": "Removed from guest list",
  "manage.attendees.promoteAria": "Promote {name} to guest list",
  "manage.attendees.promoteCta": "Promote",
  "manage.attendees.promotedToast": "{name} promoted to guest list",
  "manage.attendees.actionErrorToast": "That didn't go through. Try again.",

  // ── Manage: messages tab ─────────────────────────────────────────────────────
  "manage.messages.composerLabel_one": "Message all attendees ({count} going)",
  "manage.messages.composerLabel_other":
    "Message all attendees ({count} going)",
  "manage.writeUpdatePlaceholder": "Write an update for your guests…",
  "manage.messages.sentHint_one": "Sent to all {count} confirmed attendee.",
  "manage.messages.sentHint_other": "Sent to all {count} confirmed attendees.",
  "manage.messages.sendCta": "Send update",
  "manage.messages.previousHeading": "Previous messages",
  "manage.messages.emptyTitle": "No messages sent yet",
  "manage.messages.emptyDescription":
    "When you send an update, it shows up here. A quick hello or a what-to-expect note helps your guests feel ready.",
  "manage.messages.justNow": "just now",
  "manage.messages.openedOf": "{opened} / {total} opened",
  "manage.messages.sentToast_one": "Update sent to {count} attendee",
  "manage.messages.sentToast_other": "Update sent to {count} attendees",
  "manage.messages.liveUnavailableTitle": "Messaging attendees is on the way",
  "manage.messages.liveUnavailableBody":
    "Sending updates to everyone who's coming isn't switched on yet. In the meantime, share news on the gathering page or message guests you're connected with.",

  // ── Manage: settings tab ─────────────────────────────────────────────────────
  "manage.settings.optionsHeading": "Gathering options",
  "manage.settings.allowWaitlist.title": "Allow waitlist",
  "manage.settings.allowWaitlist.desc":
    "Members can join a waitlist if the gathering is full",
  "manage.settings.showAttendeeCount.title": "Show attendee count publicly",
  "manage.settings.showAttendeeCount.desc":
    "Visitors can see how many people are going",
  "manage.settings.allowQuestions.title": "Allow questions from attendees",
  "manage.settings.allowQuestions.desc":
    "Guests can message you with questions before the event",
  "manage.settings.requireApproval.title": "Require approval for RSVPs",
  "manage.settings.requireApproval.desc":
    "You manually approve each RSVP before it's confirmed",
  "manage.settings.dangerZoneHeading": "Danger zone",
  "manage.settings.cancelLabel": "Cancel this gathering",
  "manage.settings.cancelText":
    "All attendees will be notified and RSVPs will be released. This cannot be undone. A cancellation message will be sent automatically.",
  "manage.settings.cancelCta": "Cancel gathering",

  // ── Manage: sidebar ───────────────────────────────────────────────────────────
  "manage.sidebar.coverAlt": "Cover photo for {title}",
  "manage.sidebar.coverPhotoLine1": "gathering",
  "manage.sidebar.coverPhotoLine2": "cover photo",
  "manage.sidebar.copyCta": "Copy",
  "manage.sidebar.viewListingCta": "View public listing",
  "manage.sidebar.supportText":
    "Need help with your gathering? <a>Message the QueerPulse team</a>",

  // ── Manage: tab bar ────────────────────────────────────────────────────────────
  "manage.tabs.overview": "Overview",
  "manage.tabs.attendees": "Attendees",
  "manage.tabs.messages": "Messages",
  "manage.tabs.settings": "Settings",

  // ── Manage: shared modal chrome ───────────────────────────────────────────────
  "manage.cancelCta": "Cancel",
  "manage.closeAria": "Close",

  // ── Manage: edit-details modal ────────────────────────────────────────────────
  "manage.editModal.eyebrow": "Edit details",
  "manage.editModal.title": "Update your gathering",
  "manage.editModal.sub":
    "Changes go live on the public listing. Attendees are notified of date or venue changes.",
  "manage.editModal.fieldTitle": "Title",
  "manage.editModal.fieldDateTime": "Date & time",
  "manage.editModal.fieldLocation": "Location",
  "manage.editModal.fieldDescription": "Description",
  "manage.editModal.saveCta": "Save changes",
  "manage.editModal.successTitle": "Details <em>updated.</em>",
  "manage.editModal.successSub":
    "Your changes to <b>{title}</b> are live on the listing. Anyone who's RSVP'd will see the update next time they open the gathering.",
  "manage.editModal.successMeta_one":
    "Saved just now · {count} attendee notified",
  "manage.editModal.successMeta_other":
    "Saved just now · {count} attendees notified",

  // ── Manage: this-vs-future series scope prompt (MSG-10) ────────────────────
  "manage.seriesScope.eyebrow": "Recurring gathering",
  "manage.seriesScope.edit.title": "Apply this <em>change</em> to…",
  "manage.seriesScope.edit.sub":
    "This gathering repeats. Choose whether your edit covers just this date or every date still to come.",
  "manage.seriesScope.edit.thisCta": "Just this date",
  "manage.seriesScope.edit.futureCta": "This and every future date",
  "manage.seriesScope.cancel.title": "Cancel <em>which dates?</em>",
  "manage.seriesScope.cancel.sub":
    "This gathering repeats. Choose whether to cancel just this date or the whole standing series.",
  "manage.seriesScope.cancel.thisCta": "Just this date",
  "manage.seriesScope.cancel.futureCta": "This and every future date",

  // ── Manage: message-attendees modal ───────────────────────────────────────────
  "manage.messageModal.eyebrow": "Message attendees",
  "manage.messageModal.title": "Write to your guests",
  "manage.messageModal.sub":
    "This reaches everyone who's confirmed for this gathering. Keep it short: a venue note, a schedule change, or a warm hello.",
  "manage.messageModal.subjectLabel": "Subject",
  "manage.messageModal.subjectPlaceholder":
    "e.g. One small change to the start time",
  "manage.messageModal.bodyLabel": "Message",
  "manage.messageModal.sendCta_one": "Send to {count} attendee",
  "manage.messageModal.sendCta_other": "Send to {count} attendees",
  "manage.messageModal.successTitle": "Message <em>sent.</em>",
  "manage.messageModal.successSub_one":
    '"{subject}" went out to all <b>{count} confirmed attendee</b>. They\'ll get it in their QueerPulse notifications.',
  "manage.messageModal.successSub_other":
    '"{subject}" went out to all <b>{count} confirmed attendees</b>. They\'ll get it in their QueerPulse notifications.',
  "manage.messageModal.successMeta_one": "Sent just now · {count} recipient",
  "manage.messageModal.successMeta_other": "Sent just now · {count} recipients",

  // ── Manage: invite-members modal ──────────────────────────────────────────────
  "manage.invite.eyebrow": "Invite members",
  "manage.invite.title": "Bring the <em>right people</em> in",
  "manage.invite.sub":
    "Pick the members you'd like at this gathering. They'll get a warm invite they can accept or pass on, no pressure either way.",
  "manage.invite.searchLabel": "Search members to invite",
  "manage.invite.noneSelected": "No one selected yet",
  "manage.invite.selectedCount_one": "<b>{count}</b> selected",
  "manage.invite.selectedCount_other": "<b>{count}</b> selected",
  "manage.invite.capWarning": " · that's the max ({max})",
  "manage.invite.sendDefaultCta": "Send invites",
  "manage.invite.sendCta_one": "Invite {count} member",
  "manage.invite.sendCta_other": "Invite {count} members",
  "manage.invite.sentToast_one": "Invitation sent to {count} member",
  "manage.invite.sentToast_other": "Invitation sent to {count} members",
  "manage.invite.successTitle": "Invitations <em>on their way.</em>",
  "manage.invite.successSub_one":
    "<b>{count} member</b> just got an invite to this gathering in their QueerPulse notifications. You'll see them appear as they RSVP.",
  "manage.invite.successSub_other":
    "<b>{count} members</b> just got an invite to this gathering in their QueerPulse notifications. You'll see them appear as they RSVP.",
  "manage.invite.successMeta_one": "Sent just now · {count} invited",
  "manage.invite.successMeta_other": "Sent just now · {count} invited",

  // ── Manage: inline-edit modal ──────────────────────────────────────────────────
  "manage.inlineEdit.eyebrow": "Edit",
  "manage.inlineEdit.title": "Edit {label}",
  "manage.inlineEdit.saveCta": "Save",

  // ── Venue picker (VenuePicker) — used by the manage venue modal and the
  //    create-gathering wizard's DatePlaceStep ──────────────────────────────
  "venuePicker.searchPlaceholder": "Search the local directory",
  "venuePicker.noResults": "No matches. Try a different search.",
  "venuePicker.enterManually": "Can't find it? Type it in instead",
  "venuePicker.searchInstead": "Search the directory instead",
  "venuePicker.freeTextPlaceholder": "Venue name",
  "venuePicker.fromDirectory": "From the local directory",
  "venuePicker.change": "Change",

  // ── Cohosts (CohostManager / AddCohostModal / MemberPicker) ─────────────────────
  "cohost.panelTitle": "Cohosts",
  "cohost.addCta": "Add cohost",
  "cohost.panelDesc":
    "Cohosts can edit this gathering, message guests and manage RSVPs. You stay the lead host. Cancelling and the host fund stay with you.",
  "cohost.emptyState":
    "No cohosts yet. Adding one means you're not carrying the night alone.",
  "cohost.roleCohost": "Cohost",
  "cohost.addedToast": "{name} added as a cohost",
  "cohost.inviteSentToast": "Co-host invite sent to {name}",
  "cohost.removedToast": "{name} removed as a cohost",
  "cohost.confirmPrompt": "Remove?",
  "cohost.confirmYes": "Yes, remove",
  "cohost.confirmKeep": "Keep",
  "cohost.removeCta": "Remove",
  "cohost.removeAria": "Remove {name} as a cohost",
  "cohost.closeAria": "Close",
  "cohost.addModal.eyebrow": "Add a cohost",
  "cohost.addModal.title": "Share the <em>load</em>",
  "cohost.addModal.sub":
    "A cohost can edit the page, message guests and manage RSVPs alongside you. Pick someone you trust. They'll be asked to accept.",
  "cohost.addModal.searchLabel": "Search members to add as cohost",
  "cohost.addModal.step2Eyebrow": "Co-host invite",
  "cohost.addModal.step2Title": "Invite <em>{name}</em>",
  "cohost.addModal.step2Sub":
    "Say what you'd like help with and how much time it takes. They can accept or decline, and nothing changes until they accept.",
  "cohost.addModal.roleLabel": "What they'd help with",
  "cohost.addModal.rolePlaceholder": "Choose a role",
  "cohost.addModal.commitmentLabel": "How much time it takes",
  "cohost.addModal.commitmentPlaceholder": "Choose a commitment",
  "cohost.addModal.messageLabel": "A note for them",
  "cohost.addModal.messageHelper":
    "Optional. It sits at the top of their invite.",
  "cohost.addModal.messagePlaceholder":
    "Why you're asking them, and anything they should know before saying yes.",
  "cohost.addModal.replyByLabel": "Reply by",
  "cohost.addModal.replyByHelper":
    "Optional. They see this date on the invite and can still answer sooner.",
  "cohost.addModal.sendCta": "Send invite",
  "cohost.addModal.backCta": "Pick someone else",
  "cohost.picker.searchLabelDefault": "Search members",
  "cohost.picker.placeholder": "Search by name or role…",
  "cohost.picker.noResults": 'No members match "{query}".',

  // ── QR check-in scanner (QrScanModal) ──────────────────────────────────────────
  "qr.eyebrow": "Check-in",
  "qr.title": "Scan member QR",
  "qr.readingHint": "Reading QR code…",
  "qr.pointHint": "Point the camera at a member QR code",
  "qr.scanningCta": "Scanning…",
  "qr.allCheckedInCta": "Everyone is checked in",
  "qr.simulateCta": "Simulate scan",
  "qr.demoNote": "Demo mode. No real camera is used.",
  "qr.closeAria": "Close",
  "qr.success.ariaLabel": "Checked in",
  "qr.success.title": "Checked <em>in.</em>",
  "qr.success.scannedMeta": "{pronouns} · QR scanned",
  "qr.success.scanNextCta": "Scan next",
  "qr.success.doneCta": "Done",

  // ── Photo album download (DownloadAlbumModal) ──────────────────────────────────
  "album.loading.title": "Preparing album…",
  "album.loading.sub_one":
    "Zipping {count} photo and applying consent-based blurring.",
  "album.loading.sub_other":
    "Zipping {count} photos and applying consent-based blurring.",
  "album.success.title": "Album <em>ready.</em>",
  "album.success.sub_one":
    "We've zipped all <b>{count} photo</b> into <b>album.zip</b> and started the download. Faces stay blurred unless the person opted in by name. That's baked into the export.",
  "album.success.sub_other":
    "We've zipped all <b>{count} photos</b> into <b>album.zip</b> and started the download. Faces stay blurred unless the person opted in by name. That's baked into the export.",
  "album.success.meta_one": "album.zip · {count} photo",
  "album.success.meta_other": "album.zip · {count} photos",
  "album.success.doneCta": "Done",

  // ── Meet the table (MeetTheTable / TableSeat / AttendeeCard) ──────────────
  "table.title": "Meet the table",
  "table.atTableCount_one": "{count} at the table",
  "table.atTableCount_other": "{count} at the table",
  "table.openCount_one": "{count} open",
  "table.openCount_other": "{count} open",
  "table.aboutSeatAria": "About {name}",
  "table.emptySeatLabel": "Empty",
  "table.emptySeatAria": "Empty seat",
  "table.legend": "Seats fill as more people reserve.",

  // ── Events Hub (EventsHubPage + hub/*) ────────────────────────────────────
  "hub.tabs.highlights": "Highlights",
  "hub.tabs.browse": "Browse",
  "hub.tabs.calendar": "Calendar",
  "hub.hero.rsvp": "Take a look",
  "hub.featured.eyebrow": "Next up",
  "hub.bucket.tonight": "Tonight",
  "hub.bucket.weekend": "This weekend",
  "hub.bucket.week": "This week",
  "hub.bucket.later": "Coming up",
  "hub.highlights.heading": "Worth showing up for",
  "hub.browse.heading": "Everything that's on",
  "hub.browse.loadMore": "Show more",
  "hub.browse.empty": "Nothing matches that filter. Try another.",
  "hub.browse.searchLabel": "Search events",
  "hub.browse.searchPlaceholder": "Search by name or neighbourhood",
  "hub.browse.searchEmpty": "No events match your search.",
  "hub.calendar.heading": "The month at a glance",
  "hub.host.title": "Hosting <em>something</em>?",
  "hub.host.body":
    "A supper, a reading, a protest, a party: whatever you're hosting, we'll help people find it.",
  "hub.host.cta": "Host a gathering",
  "hub.ways.heading": "Ways to gather",
  "hub.empty.title": "Nothing on the calendar yet.",
  "hub.empty.body":
    "New gatherings turn up here all the time. You could host the first.",
  "hub.card.cta": "See it",
  "hub.loading": "Finding what's on…",

  // ── Lineup editor (GatheringLineupEditor + GatheringLineupRow, on
  // GatheringPage) — host/co-host tagging who's on the bill, plus the
  // post-gathering persona nudge (GatheringPerformerNudge). Personas
  // discovery Phase 5, Moment 5.
  "lineup.title": "Lineup",
  "lineup.description":
    "Tag who's performing, hosting or working this gathering.",
  "lineup.empty": "Nobody's tagged yet.",
  "lineup.addCta": "Tag someone",
  "lineup.roleLabel": "Their role",
  "lineup.removeAria": "Remove {name} from the lineup",
  "lineup.pickerTitle": "Tag someone",
  "lineup.pickerSearchPlaceholder": "Search people who are going",
  "lineup.saveCta": "Save lineup",
  "lineup.saving": "Saving…",
  "lineup.savedToast": "Lineup saved",
  "lineup.errorToast": "We couldn't save that just now. Try again.",

  "performerNudge.body":
    "You performed as {name}, {craft}. Want a page for that?",
  "performerNudge.startCta": "Start it",
  "performerNudge.dismissCta": "Not now",
};
