import type { Catalog } from "../../types";

/**
 * Gatherings — the events/meetups domain: the landing page, the events board
 * and calendar, event + RSVP pages, the host guide, the create wizard, the
 * host's manage/day-of dashboards, the photo album, and ticket checkout.
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
    "Supper clubs, mixers, studio visits, screenings, and skill swaps — real-world gatherings across Lisbon, hosted by members for members. This is where the platform stops being a screen.",

  "landing.ways.title": "Find your way <em>in.</em>",
  "landing.ways.lead":
    "Whether you're turning up for the first time or hosting your tenth supper club, start here.",
  "landing.ways.browse.title": "Browse what's on",
  "landing.ways.browse.body":
    "Supper clubs, mixers, studio visits, screenings, and skill swaps — filter by neighbourhood, type, and date.",
  "landing.ways.browse.cta": "See all events",
  "landing.ways.calendar.title": "The calendar view",
  "landing.ways.calendar.body":
    "The whole month at a glance, with RSVPs you've made and the gatherings near you highlighted.",
  "landing.ways.calendar.cta": "Open the calendar",
  "landing.ways.host.title": "Host your own",
  "landing.ways.host.body":
    "A step-by-step guide to running a supper club, workshop, or screening — with partner spaces and member support.",
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
    "Every gathering started with one member deciding to host. The platform handles the rest — tickets, sliding scale, and a listing on the board.",
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
  "common.backToGatherings": "← Gatherings",
  "common.hostedBy": "Hosted by",

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
    "The sliding scale is not a suggestion — if you can pay the higher tier, please do. It directly subsidises someone else's ticket.",
  "event.hero.viewProfileCta": "View profile",
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
    "Join the waitlist — we'll email you if a spot opens.",
  "event.rsvp.headSub": "Pay what you can. All tiers include everything.",
  "event.rsvp.spotsRemaining_one": "<strong>{count} spot</strong> remaining",
  "event.rsvp.spotsRemaining_other": "<strong>{count} spots</strong> remaining",
  "event.rsvp.filledOfCapacity": "{filled} of {capacity} filled",
  "event.rsvp.namePlaceholder": "Your name *",
  "event.rsvp.emailPlaceholder": "Your email *",
  "event.rsvp.dietaryPlaceholder": "Dietary requirements (optional)",
  "event.rsvp.requiredHintFull":
    "Name and email are required — we send your waitlist update there.",
  "event.rsvp.requiredHint":
    "Name and email are required — we send your confirmation there.",
  "event.rsvp.joinWaitlistCta": "Join the waitlist",
  "event.rsvp.reserveCta": "Reserve my place",
  "event.rsvp.disabledHint": "Enter your name and a valid email to continue",
  "event.rsvp.noteFull":
    "We'll email you the moment a spot opens. Leaving the waitlist is one click.",
  "event.rsvp.confirmationEmailNote": "You'll receive a confirmation email.",
  "event.rsvp.cancelPolicy": "You can cancel up to 48 hours before the event.",
  "event.rsvp.waitlistTitle": "You're <em>#{position}</em> on the waitlist.",
  "event.rsvp.waitlistBody":
    "This gathering is full, but we'll <strong>email {email}</strong> the moment a spot opens — usually within a day or two of someone cancelling.",
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
  "rsvp.host.roleLabel": "Reading group organiser",
  "rsvp.calendar.label": "Add to calendar",
  "rsvp.calendar.googleCta": "Google Calendar",
  "rsvp.calendar.appleCta": "Apple / .ics",
  "rsvp.calendar.downloadedToast": "Calendar file downloaded.",
  "rsvp.viewDetailsCta": "View gathering details",
  "rsvp.inviteCta": "Tell a friend — copy invite link",
  "rsvp.inviteCopiedToast":
    "Invite link copied. Share it with someone who should come.",
  "rsvp.coc.title": "What to <em>expect</em>",
  "rsvp.coc.affirming.strong": "This is an affirming space.",
  "rsvp.coc.affirming.rest":
    "Bring your whole self — including the parts you usually have to leave at the door. Queer identity, trans experience, neurodivergence, disability: you're welcome as you are.",
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
  "rsvp.footer.privacyCta": "Privacy policy",

  // CoHostInvitePage
  "cohostInvite.back": "← Notifications",
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
  "cohostInvite.snoozedToast": "Snoozed — will remind you tomorrow",
  "cohostInvite.declineCta": "Decline politely",
  "cohostInvite.acceptCta": "Yes — co-host with {host}",
  "cohostInvite.acceptedToast":
    "You're co-hosting with {host} — host tools unlocked",
  "cohostInvite.declinedToast":
    "Polite no sent to {host}. She'll find another second pair of hands.",
  "cohostInvite.actionMeta":
    "Either choice messages {host} directly. She'll see your decision but not be notified by push — <b>this is meant to be relaxed</b>.",
  "cohostInvite.openMessagesCta": "Open messages",

  // GatheringCancelledPage
  "cancelled.back": "← Back to calendar",
  "cancelled.stampTitle": "This event has been cancelled.",
  "cancelled.stampBody":
    "You were on the list — here's everything that happens next.",
  "cancelled.explainerTitle": "Why it was cancelled",
  "cancelled.hostSentLabel": "host · sent the cancellation",
  "cancelled.sendWellWishesCta": "Send well-wishes",
  "cancelled.infoTitle": "What happens <em>for you</em>",
  "cancelled.refundTitle": "Your {price} ticket is refunded — automatically",
  "cancelled.headcountTitle": "You've been removed from the headcount",
  "cancelled.headcountBody":
    "The studio knew exactly who was coming. Nothing else to do.",
  "cancelled.rescheduleTitle": "{date} visit is open for RSVPs",
  "cancelled.rescheduleBody":
    "You can lock in {date} right now — {host} usually opens it later, but we're early because of this. <a>Skip to it ↓</a>",
  "cancelled.concernTitle": "Something feels off?",
  "cancelled.concernBody":
    "If you have concerns about the cancellation or want to flag a pattern, talk to the team →",
  "cancelled.noteEyebrow": "A short note · from {host}",
  "cancelled.noteSentVia": "sent {time} via the host tools",
  "cancelled.altHeading": "Next visit, or — something else this weekend",
  "cancelled.altRsvpsOpen": "RSVPs open",
  "cancelled.calendarCta": "Calendar",
  "cancelled.rsvpCta": "RSVP to {date}",

  // ── Calendar, events board, recap, photo album ────────────────────────────
  // Calendar
  "calendar.eyebrow": "Community Calendar",
  "calendar.heroTitle": "Everything happening <em>in one place.</em>",
  "calendar.heroSub":
    "Every QueerPulse gathering and community-run event across Lisbon — dinners, workshops, support circles, screenings, and more — in one shared calendar.",
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
    "Every event here is hosted by QueerPulse or by people in the community — browse the season and find your people.",
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
    "No events are scheduled right now. New gatherings and partner events land here all the time — check back soon.",
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
    "Thanks for sharing — your photo is now in the gallery for everyone who was there.",
  "recap.upload.doneCta": "Done",
  "recap.upload.defaultCaption": "A moment from the day",

  // Photos (gathering photo album)
  "photos.chipAll": "All",
  "photos.backToRecap": "Back to recap",
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
    "Every photo here was taken by an attending member with consent from the people in the frame. <b>Faces are blurred by default</b> unless the person specifically opted in by name. This isn't a privacy nicety — it's how we make sure people show up next time.",
  "photos.policyBody2":
    'If you see yourself in a photo and want it removed (or unblurred), email <mailLink>photos@queerpulse.app</mailLink> — we\'ll handle it within 24 hours, no questions. <em>You can also untick "appear in event photos" globally</em> in <privLink>Privacy settings</privLink>.',
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
  "create.pill.capacity": "Capacity",
  "create.pill.pricing": "Pricing",
  "create.pill.review": "Review",

  // createGathering.data.ts — sidebar tips (per step)
  "create.tip.type":
    "Choose the format that comes most naturally to you. The best gatherings are the ones hosts actually enjoy running.",
  "create.tip.datePlace":
    "The neighbourhood is shown on the listing. The full address is only shared with confirmed attendees.",
  "create.tip.capacity":
    "Be honest about accessibility. Attendees plan around it. Only tick what you can genuinely confirm.",
  "create.tip.pricing":
    "QueerPulse takes 0% of ticket revenue. Every euro goes to you. The sliding scale is required — it makes the community more accessible.",
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
    "The sliding scale (if ticketed) is genuine — the free tier will be honoured.",
  "create.confirm.accessibility":
    "The accessibility information I've provided is accurate to the best of my knowledge.",

  // CreateGatheringPage.tsx
  "create.eyebrow": "List your event",
  "create.title": "Create your <em>gathering.</em>",
  "create.lead":
    "Fill in the details below and your event will be live on the QueerPulse gatherings board immediately.",
  "create.toast.publishError": "Couldn't publish your gathering — try again.",
  "create.toast.published": "Your gathering is live",
  "create.success.title": "Your gathering <em>is live.</em>",
  "create.success.body":
    "It's now visible on the QueerPulse gatherings board. Members can see it and RSVP. You'll get an email notification for each new attendee.",
  "create.success.accessLabel": "Accessibility shown to attendees",
  "create.success.viewCta": "View on board",
  "create.success.eventCta": "See your event page",
  "create.nav.cancel": "Cancel",
  "create.nav.back": "Back",
  "create.nav.publishHint": "Confirm all three boxes above to publish",
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
  "create.step1.titleLabel": "Event title",
  "create.step1.titlePlaceholder":
    "A clear, specific title — not a pun, not a mystery",
  "create.step1.descLabel": "Short description",
  "create.step1.descPlaceholder":
    "What will people do? What should they expect? What makes this gathering worth attending?",

  // CreateGatheringSteps.tsx — step 2: date & place
  "create.step2.title": "When and <em>where?</em>",
  "create.step2.sub":
    "The location is only shared with confirmed attendees — not shown on the public listing.",
  "create.step2.dateLabel": "Date",
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

  // CreateGatheringSteps.tsx — step 3: capacity
  "create.step3.title": "Who and <em>how many?</em>",
  "create.step3.sub":
    "Set a realistic cap. It's easier to open more spots than to turn people away at the door.",
  "create.step3.capLabel": "Capacity",
  "create.step3.capPlaceholder": "Max attendees",
  "create.step3.langLabel": "Language",
  "create.step3.accessLabel": "Accessibility — what can you confirm?",
  "create.step3.accessHint":
    "Only tick what you can genuinely confirm. Attendees will rely on this information.",
  "create.step3.notesLabel": "Accessibility notes (optional)",
  "create.step3.notesPlaceholder":
    "Anything else attendees should know — steps, parking, sound level…",

  // CreateGatheringSteps.tsx — step 4: pricing
  "create.step4.title": "Tickets and <em>pricing.</em>",
  "create.step4.sub":
    "QueerPulse takes 0% of ticket revenue. All money goes directly to you. Sliding scale is mandatory for any paid event.",
  "create.step4.freeLabel": "Free event — no tickets needed",
  "create.step4.tiersHint":
    "Set three tiers. The sliding scale is not optional — if your event is paid, all three tiers must be offered. Members choose their tier privately.",
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
    "Optional — e.g. Bring something to share, wear comfortable shoes",

  // CreateGatheringSteps.tsx — step 5: review
  "create.step5.title": "Review and <em>publish.</em>",
  "create.step5.sub": "Check the details before your gathering goes live.",
  "create.step5.accessEmpty": "None specified yet — add what you can confirm",
  "create.step5.dateTimeValue": "{date} at {time}",
  "create.step5.locationValue": "{venue}, {hood}",
  "create.step5.capacityValue": "{cap} people · {lang}",
  "create.step5.row.type": "Type",
  "create.step5.row.title": "Title",
  "create.step5.row.dateTime": "Date & time",
  "create.step5.row.location": "Location",
  "create.step5.row.capacity": "Capacity",
  "create.step5.row.pricing": "Pricing",
  "create.step5.row.accessibility": "Accessibility",
  "create.step5.pricingFree": "Free event",
  "create.step5.pricingSliding": "Sliding scale · Free / {std} / {sup}",
  "create.step5.confirmHeading": "Before you publish — confirm all three",
  "create.step5.confirmIntro":
    "Tick each box to confirm. The <strong>Publish gathering</strong> button stays disabled until all three are checked.",
  "create.step5.allSet": "All set — you can publish now.",
  "create.step5.progress_one":
    "<num>{checkedCount}</num> of 3 confirmed — tick the last box to publish.",
  "create.step5.progress_other":
    "<num>{checkedCount}</num> of 3 confirmed — tick the remaining <remaining>{count}</remaining> boxes to publish.",

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
    "Intimate, hosted in your home or borrowed kitchen. 8–14 people. The model Tomás uses — and it works because it's personal.",
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
    "Your home is usually the best option for small gatherings — it's free, flexible, and signals that this is a community event, not a commercial one. For larger events, the network has access to several partner spaces across the city.",
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
    'Gatherings work because the room is curated, not because it\'s large. Think about who you\'re inviting and why — not "who do I owe" but "who would get something from being in this room together."',
  "host.step3.list.clear":
    "Be clear about what the event is, how long, and what people should bring or expect.",
  "host.step3.list.location":
    "Share the location only with confirmed attendees — not in the public listing.",
  "host.step3.list.cap":
    "Set a realistic cap and stick to it. Turning people away is fine. Overcrowding isn't.",

  // HostSteps.tsx — step 4
  "host.step4.title": "On the <em>day</em>",
  "host.step4.body":
    "The most important thing is not the logistics — it's the atmosphere when people arrive. The first ten minutes determine whether someone feels welcome or like they've walked into the wrong room.",
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
    "Write a brief note on the gathering listing — what happened, how it went. This helps people who couldn't make it and gives future hosts a sense of what works.",
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
  "dashboard.guestList.waitlistToggle_one": "{count} on waitlist — promote",
  "dashboard.guestList.waitlistToggle_other": "{count} on waitlist — promote",
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
  "dashboard.stats.startingSentToast": "We're starting — sent to all guests",
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
  "dashboard.stats.followUpToast": "Follow-up sent — check-in closed",

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
  "manage.attendees.moreAttendees_one": "+ {count} more attendee",
  "manage.attendees.moreAttendees_other": "+ {count} more attendees",
  "manage.attendees.removeAria": "Remove {name} from guest list",
  "manage.attendees.removeCta": "Remove",
  "manage.attendees.removedToast": "Removed from guest list",
  "manage.attendees.promoteAria": "Promote {name} to guest list",
  "manage.attendees.promoteCta": "Promote",
  "manage.attendees.promotedToast": "{name} promoted to guest list",

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
  "manage.sidebar.coverPhotoLine1": "gathering",
  "manage.sidebar.coverPhotoLine2": "cover photo",
  "manage.sidebar.copyCta": "Copy",
  "manage.sidebar.viewListingCta": "View public listing",
  "manage.sidebar.supportText":
    "Need help with your gathering? <a>Message the QueerPulse team →</a>",

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

  // ── Manage: message-attendees modal ───────────────────────────────────────────
  "manage.messageModal.eyebrow": "Message attendees",
  "manage.messageModal.title": "Write to your guests",
  "manage.messageModal.sub":
    "This reaches everyone who's confirmed for this gathering. Keep it short — a venue note, a schedule change, or a warm hello.",
  "manage.messageModal.subjectLabel": "Subject",
  "manage.messageModal.subjectPlaceholder":
    "e.g. One small change to the start time",
  "manage.messageModal.bodyLabel": "Message",
  "manage.messageModal.sendCta_one": "Send to {count} attendee",
  "manage.messageModal.sendCta_other": "Send to {count} attendees",
  "manage.messageModal.successTitle": "Message <em>sent.</em>",
  "manage.messageModal.successSub_one":
    '"{subject}" went out to all <b>{count} confirmed attendee</b>. They\'ll get it by email and in their QueerPulse notifications.',
  "manage.messageModal.successSub_other":
    '"{subject}" went out to all <b>{count} confirmed attendees</b>. They\'ll get it by email and in their QueerPulse notifications.',
  "manage.messageModal.successMeta_one": "Sent just now · {count} recipient",
  "manage.messageModal.successMeta_other": "Sent just now · {count} recipients",

  // ── Manage: invite-members modal ──────────────────────────────────────────────
  "manage.invite.eyebrow": "Invite members",
  "manage.invite.title": "Bring the <em>right people</em> in",
  "manage.invite.sub":
    "Pick the members you'd like at this gathering. They'll get a warm invite they can accept or pass on — no pressure either way.",
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
    "<b>{count} member</b> just got an invite to this gathering, by email and in their QueerPulse notifications. You'll see them appear as they RSVP.",
  "manage.invite.successSub_other":
    "<b>{count} members</b> just got an invite to this gathering, by email and in their QueerPulse notifications. You'll see them appear as they RSVP.",
  "manage.invite.successMeta_one": "Sent just now · {count} invited",
  "manage.invite.successMeta_other": "Sent just now · {count} invited",

  // ── Manage: inline-edit modal ──────────────────────────────────────────────────
  "manage.inlineEdit.eyebrow": "Edit",
  "manage.inlineEdit.title": "Edit {label}",
  "manage.inlineEdit.saveCta": "Save",

  // ── Cohosts (CohostManager / AddCohostModal / MemberPicker) ─────────────────────
  "cohost.panelTitle": "Cohosts",
  "cohost.addCta": "Add cohost",
  "cohost.panelDesc":
    "Cohosts can edit this gathering, message guests and manage RSVPs. You stay the lead host — cancelling and the host fund stay with you.",
  "cohost.emptyState":
    "No cohosts yet. Adding one means you're not carrying the night alone.",
  "cohost.addedToast": "{name} added as a cohost",
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
    "A cohost can edit the page, message guests and manage RSVPs alongside you. Pick someone you trust — they'll be asked to accept.",
  "cohost.addModal.searchLabel": "Search members to add as cohost",
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
  "qr.demoNote": "Demo mode — no real camera is used.",
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
    "We've zipped all <b>{count} photo</b> into <b>album.zip</b> and started the download. Faces stay blurred unless the person opted in by name — that's baked into the export.",
  "album.success.sub_other":
    "We've zipped all <b>{count} photos</b> into <b>album.zip</b> and started the download. Faces stay blurred unless the person opted in by name — that's baked into the export.",
  "album.success.meta_one": "album.zip · {count} photo",
  "album.success.meta_other": "album.zip · {count} photos",
  "album.success.doneCta": "Done",

  // ── Checkout — payment, summary, hold ─────────────────────────────────────
  // Progress
  "checkout.progress.ariaLabel": "Checkout progress",
  "checkout.progress.review": "Review",
  "checkout.progress.payment": "Payment",
  "checkout.progress.confirm": "Confirm",

  // Summary (sidebar + price summary + mobile bar)
  "checkout.summary.tier.solidarity": "Solidarity",
  "checkout.summary.tier.standard": "Standard",
  "checkout.summary.tier.supporter": "Supporter",
  "checkout.summary.lineItem_one": "{count} × {tier} seat",
  "checkout.summary.lineItem_other": "{count} × {tier} seats",
  "checkout.summary.memberDiscount": "Member discount",
  "checkout.summary.percentOff": "{percent} off",
  "checkout.summary.promoLabel": "Promo · {code}",
  "checkout.summary.total": "Total",
  "checkout.summary.feesNote":
    "Includes all fees. Processed securely by Stripe.",
  "checkout.summary.priceNote":
    "Includes all fees. No booking surcharge. Secure payment via Stripe.",
  "checkout.summary.paidLabel": "Paid · {amount}",
  "checkout.summary.editOrderCta": "Edit order",
  "checkout.summary.hostingLine": "<name>{hostName}</name> is hosting",
  "checkout.summary.guestsConfirmed_one": "{count} guest confirmed so far",
  "checkout.summary.guestsConfirmed_other": "{count} guests confirmed so far",
  "checkout.summary.safetyNote":
    "Invite-only · every member is verified before they can book.",
  "checkout.summary.visibilityPrivateToast":
    "You'll attend privately — hidden from the guest list.",
  "checkout.summary.visibilityPublicToast": "You'll appear on the guest list.",

  // Mobile bar
  "checkout.mobileBar.continueCta": "Continue →",
  "checkout.mobileBar.payCta": "Pay {amount} →",

  // Payment step + tabs + express/alt-pay copy
  "checkout.payment.title": "Payment <em>details</em>",
  "checkout.payment.lede":
    "Encrypted and processed by Stripe. QueerPulse never sees or stores your card number.",
  "checkout.payment.methodTabsAriaLabel": "Payment method",
  "checkout.payment.tabCardTitle": "Card",
  "checkout.payment.tabCardSub": "Visa, Mastercard, Amex",
  "checkout.payment.tabMbwayTitle": "MB WAY",
  "checkout.payment.tabMbwaySub": "Approve in your app",
  "checkout.payment.tabMultibancoTitle": "Multibanco",
  "checkout.payment.tabMultibancoSub": "Reference / ATM",
  "checkout.payment.payCtaCard": "Pay {amount} →",
  "checkout.payment.payCtaMbway": "Send request for {amount} →",
  "checkout.payment.payCtaMultibanco": "Confirm booking · {amount} →",
  "checkout.payment.processingLabel": "Processing…",
  "checkout.payment.trustLock": "256-bit encrypted",
  "checkout.payment.viaStripe": "via <strong>Stripe</strong>",
  "checkout.payment.termsNotice":
    "By paying you agree to our <terms>terms of service</terms> and <privacy>privacy policy</privacy>. You can cancel for a full refund up to 48h before.",
  "checkout.payment.demoHint":
    "Demo: use card <strong>4000 0000 0000 0002</strong> to see a declined-payment flow.",
  "checkout.payment.backToReviewCta": "← Back to review",
  "checkout.payment.mbwayPhoneLabel": "MB WAY phone number",
  "checkout.payment.mbwayError": "Enter your 9-digit MB WAY number.",
  "checkout.payment.mbwayNote":
    "Tap pay and we'll send a request to your MB WAY app. You have 4 minutes to approve it — your seat is held until then.",
  "checkout.payment.multibancoEntityLabel": "Entity",
  "checkout.payment.multibancoReferenceLabel": "Reference",
  "checkout.payment.multibancoAmountLabel": "Amount",
  "checkout.payment.multibancoHint":
    "Pay this reference at any ATM or through home banking within <strong>3 days</strong>. We'll hold your seat and email your ticket the moment it clears.",
  "checkout.payment.confirmedToast": "Payment confirmed — see you on {date}!",

  // Card
  "checkout.card.savedHeading": "Saved card",
  "checkout.card.savedExpiry": "Expires {expiry}",
  "checkout.card.removeSavedCta": "Remove",
  "checkout.card.orNewCard": "or use a new card",
  "checkout.card.numberLabel": "Card number",
  "checkout.card.numberPlaceholder": "1234 5678 9012 3456",
  "checkout.card.numberError": "Enter a valid 16-digit card number.",
  "checkout.card.expiryLabel": "Expiry",
  "checkout.card.expiryPlaceholder": "MM / YY",
  "checkout.card.expiryError": "Check the expiry date.",
  "checkout.card.cvcLabel": "CVC",
  "checkout.card.cvcError": "3 or 4 digits.",
  "checkout.card.nameLabel": "Name on card",
  "checkout.card.namePlaceholder": "Full name",
  "checkout.card.nameError": "Enter the name on the card.",
  "checkout.card.saveCardLabel": "Save this card securely for next time",
  "checkout.card.removedToast": "Saved card removed.",

  // Billing
  "checkout.billing.heading": "Billing",
  "checkout.billing.countryLabel": "Country",
  "checkout.billing.postalLabel": "Postal code",
  "checkout.billing.postalError": "Enter your postal code.",
  "checkout.billing.vatCheckbox":
    "I need a <strong>VAT invoice</strong> for a business",
  "checkout.billing.companyLabel": "Company name",
  "checkout.billing.companyPlaceholder": "Company, Lda.",
  "checkout.billing.vatNumberLabel": "VAT / NIF number",
  "checkout.billing.vatNumberPlaceholder": "PT123456789",
  "checkout.billing.country.pt": "Portugal",
  "checkout.billing.country.es": "Spain",
  "checkout.billing.country.fr": "France",
  "checkout.billing.country.de": "Germany",
  "checkout.billing.country.it": "Italy",
  "checkout.billing.country.nl": "Netherlands",
  "checkout.billing.country.ie": "Ireland",
  "checkout.billing.country.gb": "United Kingdom",
  "checkout.billing.country.us": "United States",
  "checkout.billing.country.other": "Somewhere else",

  // Express checkout
  "checkout.express.heading": "Express checkout",
  "checkout.express.orPayByCard": "or pay by card",
  "checkout.express.confirmingToast": "Confirming with {label}…",

  // Promo code
  "checkout.promo.invalidError": "That code isn't valid or has expired.",
  "checkout.promo.appliedLabel": "Code <code>{code}</code> applied",
  "checkout.promo.removeCta": "Remove",
  "checkout.promo.inputPlaceholder": "Enter code",
  "checkout.promo.inputAriaLabel": "Promo code",
  "checkout.promo.applyCta": "Apply",
  "checkout.promo.appliedToast": "Code applied — extra {percent} off.",

  // Offline banner
  "checkout.offline.backOnlineToast": "Back online — you're all set.",
  "checkout.offline.bannerText":
    "You're offline — your progress is saved. We'll reconnect automatically.",

  // Seat hold
  "checkout.hold.expiredText":
    "Your seat hold expired — <retry>hold it again</retry>",
  "checkout.hold.activeText": "Seat held for you · <time>{clock}</time>",
  "checkout.hold.spotsLeft_one": "Only <strong>{count}</strong> seat left",
  "checkout.hold.spotsLeft_other": "Only <strong>{count}</strong> seats left",

  // Validation / payment-form toasts
  "checkout.validation.cocRequired":
    "Please agree to the Code of Care to continue.",
  "checkout.validation.declinedError":
    "Your card was declined. No money has left your account. Try another card or an express option above.",
  "checkout.validation.paymentDeclinedToast":
    "Payment declined — please try again.",
  "checkout.validation.fieldsError":
    "Please check the highlighted fields and try again.",
  "checkout.validation.guestEmailRequired":
    "Add an email so we can send your ticket.",

  // ── Checkout — review, confirmation, table, code of care ──────────────────
  // ReviewStep
  "checkout.review.title": "Reserve your <em>seat</em>",
  "checkout.review.lede":
    "Pick what works for your budget — every seat at the table is the same welcome.",
  "checkout.review.hostedBy_one": "Hosted by {host} · {count} seat total",
  "checkout.review.hostedBy_other": "Hosted by {host} · {count} seats total",
  "checkout.review.promoLabel": "Promo code",
  "checkout.review.promoOptional": "optional",
  "checkout.review.policySummary": "Cancellation & refund policy",
  "checkout.review.policyBody":
    "Full refund if you cancel up to <strong>48 hours</strong> before the gathering. Within 48 hours we can transfer your seat to a future supper, since ingredients are already bought. Life happens — if something urgent comes up, <strong>just message the host</strong> and we'll sort it out.",
  "checkout.review.continueCta": "Continue to payment",

  // TierSelect
  "checkout.tiers.sectionTitle": "Choose your ticket",
  "checkout.tiers.fieldsetAria": "Ticket type",
  "checkout.tiers.solidarity.name": "Solidarity",
  "checkout.tiers.solidarity.desc":
    "If money's tight right now. No questions, no proof — same seat, same welcome.",
  "checkout.tiers.standard.name": "Standard",
  "checkout.tiers.standard.desc":
    "Covers your meal, ingredients, and the host's time.",
  "checkout.tiers.standard.tag": "Most pick this",
  "checkout.tiers.supporter.name": "Supporter",
  "checkout.tiers.supporter.desc":
    "Pays it forward — you quietly cover a solidarity seat for someone else.",

  // SeatQuantity
  "checkout.seats.sectionTitle": "How many seats?",
  "checkout.seats.label": "Seats",
  "checkout.seats.sub_one": "Bringing a +1? Add their details below.",
  "checkout.seats.sub_other":
    "You'll add each guest's name & dietary needs below.",
  "checkout.seats.stepperAria": "Number of seats",
  "checkout.seats.removeAria": "Remove a seat",
  "checkout.seats.addAria": "Add a seat",
  "checkout.seats.waitlistPrompt":
    "Want more than {maxSeats} seats, or a future date?",
  "checkout.seats.joinWaitlistCta": "Join the waitlist",
  "checkout.seats.waitlistHeading": "Join the waitlist",
  "checkout.seats.waitlistBody":
    "We'll email you the moment a seat opens here — or when {host} schedules the next supper. No payment now.",
  "checkout.seats.emailLabel": "Email",
  "checkout.seats.emailPlaceholder": "you@example.com",
  "checkout.seats.partySizeLabel": "Party size",
  "checkout.seats.partySizeOption_one": "{count} seat",
  "checkout.seats.partySizeOption_other": "{count} seats",
  "checkout.seats.waitlistSubmitCta": "Add me to the list",
  "checkout.seats.waitlistSuccessToast":
    "You're on the waitlist — we'll email you the moment a seat opens.",

  // TableSeat / MeetTheTable / AttendeeCard
  "checkout.table.title": "Meet the table",
  "checkout.table.atTableCount_one": "{count} at the table",
  "checkout.table.atTableCount_other": "{count} at the table",
  "checkout.table.youCount_one": "you",
  "checkout.table.youCount_other": "you +{extra}",
  "checkout.table.openCount_one": "{count} open",
  "checkout.table.openCount_other": "{count} open",
  "checkout.table.visibilityGroupAria": "Your visibility",
  "checkout.table.onListLabel": "On the list",
  "checkout.table.attendPrivatelyLabel": "Attend privately",
  "checkout.table.chooseSeatAria": "Choose this seat",
  "checkout.table.aboutSeatAria": "About {name}",
  "checkout.table.yourSeatAria": "Your seat",
  "checkout.table.sitHereLabel": "Sit here",
  "checkout.table.guestNumberFallback": "Guest {number}",
  "checkout.table.youLabel": "You",
  "checkout.table.emptySeatLabel": "Empty",
  "checkout.table.youPrivateLabel": "You (private)",
  "checkout.table.privateLabel": "Private",
  "checkout.table.giftLabel": "Gift",
  "checkout.table.legendBetween":
    "You're sitting between {left} and {right} — tap another empty place to move.",
  "checkout.table.legendDefault": "Tap an empty place to choose your seat.",

  // GuestDetails
  "checkout.guest.sectionTitle": "Who's joining you",
  "checkout.guest.guestNumberLabel": "Guest {number}",
  "checkout.guest.giftToggleLabel": "Gift this seat",
  "checkout.guest.emailLabel": "Their email",
  "checkout.guest.emailPlaceholder": "they@example.com",
  "checkout.guest.noteLabel": "A note",
  "checkout.guest.optionalTag": "optional",
  "checkout.guest.notePlaceholder": "See you Saturday!",
  "checkout.guest.giftNote":
    "We'll email a claimable ticket — they add their own name & dietary needs.",
  "checkout.guest.nameLabel": "Name",
  "checkout.guest.namePlaceholder": "Their name",
  "checkout.guest.pronounsLabel": "Pronouns",
  "checkout.guest.pronounsPlaceholder": "Select…",
  "checkout.guest.dietaryLabel": "Dietary needs",
  "checkout.guest.dietaryPlaceholder": "e.g. vegan, no shellfish",

  // AttendeeDetails
  "checkout.attendee.sectionTitle": "Your details",
  "checkout.attendee.emailLabel": "Email for your ticket & receipt",
  "checkout.attendee.emailPlaceholder": "you@example.com",
  "checkout.attendee.emailError":
    "Enter a valid email so we can send your ticket.",
  "checkout.attendee.dietaryLabel":
    "Dietary needs or allergies <opt>— it's a shared meal</opt>",
  "checkout.attendee.dietaryPlaceholder": "e.g. vegetarian, no nuts, coeliac…",
  "checkout.attendee.accessLabel": "Access needs",
  "checkout.attendee.optionalTag": "optional",
  "checkout.attendee.accessPlaceholder":
    "Anything the host should know to make the space work for you (steps, quiet space, etc.)",

  // WhoAmI
  "checkout.whoami.guestTitle": "Checking out as a <strong>guest</strong>",
  "checkout.whoami.memberTitle": "Signed in as <strong>{name}</strong>",
  "checkout.whoami.memberDiscountNote":
    "Members get {rate}% off — sign in to save it",
  "checkout.whoami.memberEmailLine": "{email} · Member",
  "checkout.whoami.signBackInCta": "Sign back in",
  "checkout.whoami.asNameCta": "as {name}",
  "checkout.whoami.notYouCta": "Not you?",
  "checkout.whoami.checkoutAsGuestCta": "Check out as guest",

  // HostCard
  "checkout.host.verifiedBadge": "Verified host",
  "checkout.host.statsLineBeforeStar_one":
    "Hosting since {year} · {count} supper · {rating}",
  "checkout.host.statsLineBeforeStar_other":
    "Hosting since {year} · {count} suppers · {rating}",
  "checkout.host.statsLineAfterStar": "from {guestCount} guests",
  "checkout.host.askQuestionCta": "Ask a question",
  "checkout.host.messageLabel": "Message {host} before you book",
  "checkout.host.messagePlaceholder":
    "e.g. Is the space step-free? Can I come solo?",
  "checkout.host.sendCta": "Send to host",
  "checkout.host.messageSentToast":
    "Sent to {host} — you'll get a reply by email.",

  // FirstTimerCard
  "checkout.firstTimer.dismissAria": "Dismiss",
  "checkout.firstTimer.badge": "First supper?",
  "checkout.firstTimer.heading": "Here's how the night flows",
  "checkout.firstTimer.seeLess": "See less",
  "checkout.firstTimer.seeMore": "See more",
  "checkout.firstTimer.step1.title": "You arrive",
  "checkout.firstTimer.step1.body":
    "Doors at {time}. Come as you are — no dress code, no small-talk pressure.",
  "checkout.firstTimer.step2.title": "We share a meal",
  "checkout.firstTimer.step2.body":
    "A home-cooked dinner around one table, eight of us, three unhurried hours.",
  "checkout.firstTimer.step3.title": "You leave full",
  "checkout.firstTimer.step3.body":
    "Of food, and usually a few new numbers in your phone. Leave whenever you like.",

  // CodeOfCare
  "checkout.coc.agreementLabel":
    "I've read the <strong>Code of Care</strong> and I'm coming ready to look out for the people at this table.",
  "checkout.coc.whatsThat": "What's that?",
  "checkout.coc.hide": "Hide",
  "checkout.coc.item1":
    "Consent first — ask before photos, and take a no gracefully.",
  "checkout.coc.item2": "What's shared at the table stays at the table.",
  "checkout.coc.item3": "Respect names and pronouns, always.",
  "checkout.coc.item4":
    "If something feels off, tell the host — we've got you.",

  // ConfirmationStep
  "checkout.confirm.refCopiedToast": "Booking reference copied.",
  "checkout.confirm.copyRefAria": "Copy booking reference",
  "checkout.confirm.title": "You're <em>confirmed.</em>",
  "checkout.confirm.subtitle_one":
    "A confirmation and ticket is on the way to {email}. See you on {date}.",
  "checkout.confirm.subtitle_other":
    "A confirmation and {count} tickets are on the way to {email}. See you on {date}.",
  "checkout.confirm.inboxFallback": "your inbox",
  "checkout.confirm.bookingRefLabel": "Booking ref",
  "checkout.confirm.dateLabel": "Date",
  "checkout.confirm.locationLabel": "Location",
  "checkout.confirm.locationValue":
    "{neighbourhood} — exact address shared on the day",
  "checkout.confirm.hostGuestsLabel": "Host · Guests",
  "checkout.confirm.seatsCount_one": "{count} seat",
  "checkout.confirm.seatsCount_other": "{count} seats",
  "checkout.confirm.hostNotesHeading": "The host has your notes",
  "checkout.confirm.dietaryLabel": "Dietary:",
  "checkout.confirm.accessLabel": "Access:",

  // ConfirmationNext
  "checkout.confirm.mapSectionTitle": "Roughly where",
  "checkout.confirm.mapAriaLabel": "Approximate location in {place}",
  "checkout.confirm.mapNote": "Exact spot revealed morning of the supper",
  "checkout.confirm.mapLabel": "{neighbourhood} · 5 min from {landmark}",
  "checkout.confirm.addressCardTitle": "How you'll get the address",
  "checkout.confirm.addressCardBody":
    "We keep supper spots private for safety. The exact door, buzzer code and directions land in your inbox at <strong>{time} on {date}</strong>.",
  "checkout.confirm.bringCardTitle": "What to bring",
  "checkout.confirm.bringCardBody":
    "Just yourself. If you'd like, a bottle to share is always welcome — the host cooks everything else.",
  "checkout.confirm.remindSectionTitle": "Remind me",
  "checkout.confirm.reminderGroupAria": "Reminder preferences",
  "checkout.confirm.reminderEmail": "Email",
  "checkout.confirm.reminderSms": "SMS",
  "checkout.confirm.reminderNone": "No reminders",
  "checkout.confirm.calendarSectionTitle": "Add to your calendar",
  "checkout.confirm.googleCalendarCta": "Google Calendar",
  "checkout.confirm.appleIcsCta": "Apple / .ics",
  "checkout.confirm.addToWalletCta": "Add to Wallet",
  "checkout.confirm.icsDescription":
    "QueerPulse gathering. Hosted by {host}. Ref {ref}",
  "checkout.confirm.calendarDownloadedToast": "Calendar file downloaded.",
  "checkout.confirm.walletAddedToast": "Ticket added to your wallet.",
  "checkout.confirm.viewGatheringCta": "View gathering details",
  "checkout.confirm.tellFriendCta": "Tell a friend",
  "checkout.confirm.shareLinkToast": "Link copied — share it with a friend.",
  "checkout.confirm.transferSeatCta": "Transfer my seat",
  "checkout.confirm.transferSentToast": "Transfer link sent to your email.",
  "checkout.confirm.addGuestCta": "Add a guest",
  "checkout.confirm.addGuestSentToast": "Add-a-guest link sent to your email.",

  // Timeline (Pattern B — buildTimeline)
  "checkout.timeline.sectionTitle": "What happens next",
  "checkout.timeline.now": "Right now",
  "checkout.timeline.ticket.title": "Ticket in your inbox",
  "checkout.timeline.ticket.body":
    "Your confirmation and QR ticket are already on their way.",
  "checkout.timeline.address.title": "The address unlocks",
  "checkout.timeline.address.body":
    "Exact door, buzzer code and directions to {neighbourhood} arrive the morning of.",
  "checkout.timeline.arrive.title": "You arrive & we eat",
  "checkout.timeline.arrive.body":
    "Come as you are. {host} handles the rest — three unhurried hours together.",
};
