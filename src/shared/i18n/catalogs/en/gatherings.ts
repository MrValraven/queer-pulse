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
  "landing.hero.title": "The community, <em>in the same room.</em>",

  "landing.ways.title": "Find your way <em>in.</em>",
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
  "rsvpControl.waitlistNote":
    "A QueerPulse notification reaches you the moment a spot opens.",
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
  "common.hostRemoved": "A former member",
  "common.connectCta": "Connect",
  "common.timeRangeTo": "to",

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
  "cohostInvite.hostedCount_one": "Hosted {count} gathering",
  "cohostInvite.hostedCount_other": "Hosted {count} gatherings",
  "cohostInvite.mutualsCount_one": "{count} mutual",
  "cohostInvite.mutualsCount_other": "{count} mutuals",
  "cohostInvite.replyBy": "Reply by {date}",
  "cohostInvite.rsvpsAndWaitlist": "{rsvps} RSVPs · {waitlist} waitlist",
  "cohostInvite.rolesTitle": "What being <em>co-host</em> would mean",
  "cohostInvite.declineCta": "Decline politely",
  "cohostInvite.acceptCta": "Yes, co-host with {host}",
  "cohostInvite.acceptedToast":
    "You're co-hosting with {host}. Host tools unlocked",
  "cohostInvite.declinedToast":
    "Polite no sent to {host}. She'll find another second pair of hands.",
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
    "You can lock in {date} right now. {host} usually opens it later, but we're early because of this. <a>Skip to it</a>",
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
    "A feed you can subscribe to from Google Calendar, Apple Calendar or Outlook is still being built. Until it lands, open any gathering and add that one to your calendar from its page.",
  "calendar.hostCta": "Host your own gathering",

  // Events
  "events.eyebrow": "What's on",
  "events.subtitle":
    "Every event here is hosted by QueerPulse or by people in the community. Browse the season and find your people.",
  "events.kindEvent": "Event",
  "events.kindGathering": "Gathering",
  "events.ticketedTag": "Ticketed",
  "events.priceSingle": "{price}",
  "events.priceRange": "{min}–{max}",

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

  // createGathering.data.ts — gathering languages
  "create.lang.bilingual": "PT / EN bilingual",
  "create.lang.ptOnly": "Portuguese only",
  "create.lang.enOnly": "English only",
  "create.lang.other": "Other",

  // createGathering.data.ts — accessibility options

  // createGathering.data.ts — publish confirmation checklist
  "create.confirm.codeOfCare":
    "This gathering follows the QueerPulse Code of Care.",
  "create.confirm.accessibility":
    "The accessibility information I've provided is accurate to the best of my knowledge.",

  // CreateGatheringPage.tsx
  "create.eyebrow": "List your gathering",
  "create.title": "Create your <em>gathering.</em>",
  "create.lead":
    "Fill in the details below and your gathering will be live on the QueerPulse gatherings board immediately.",
  "create.toast.publishError": "Couldn't publish your gathering. Try again.",
  "create.toast.published": "Your gathering is live",
  "create.success.title": "Your gathering <em>is live.</em>",
  "create.success.body":
    "It's now visible on the QueerPulse gatherings board. Members can see it and RSVP. Each new attendee shows up in your gathering's guest list.",
  "create.success.accessLabel": "Accessibility shown to attendees",
  "create.success.viewCta": "View on board",
  "create.success.eventCta": "See your gathering page",
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
  "create.step1.titleLabel": "Gathering title",
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
  "create.step2.addressLabel":
    "Full address (shared only with confirmed attendees)",
  "create.step2.addressPlaceholder": "Street address",
  "create.step2.directionsLabel": "Getting there (optional)",
  "create.step2.directionsPlaceholder":
    "e.g. Ring the bell on the left, 5 min walk from Intendente metro",

  // RepeatsStep.tsx — step 2b: repeats (MSG-10)
  "create.step2b.title": "Does this <em>repeat?</em>",
  "create.step2b.sub":
    "A standing meetup that comes back every week or every month. Each date publishes as its own gathering, RSVPable and editable on its own.",
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
  "create.step5.row.accessibility": "Accessibility",
  "create.step5.row.repeats": "Repeats",
  "create.step5.repeatsOff": "No, just this once",
  "create.step5.repeatsUntilCount": "{occurrences} dates",
  "create.step5.repeatsUntilDate": "until {date}",
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

  // ── Prototype pages: live-mode coming-soon (demo-only, no live gathering) ─────
  "prototypeComingSoon.browseCta": "Browse gatherings",

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

  // ── Manage: settings tab ─────────────────────────────────────────────────────
  "manage.settings.optionsHeading": "Gathering options",
  "manage.settings.allowWaitlist.title": "Allow waitlist",
  "manage.settings.allowWaitlist.desc":
    "Members can join a waitlist if the gathering is full",
  "manage.settings.showAttendeeCount.title": "Show attendee count publicly",
  "manage.settings.showAttendeeCount.desc":
    "Visitors can see how many people are going",
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
  "manage.invite.loadingPeople": "Finding the people you are connected to.",
  "manage.invite.noConnections":
    "You can invite the people you are connected to. Once you have connections, they show up here.",
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
  "cohost.inviteSentToast": "Co-host invite sent to {name}",
  "cohost.removedToast": "{name} removed as a cohost",
  "cohost.confirmPrompt": "Remove?",
  "cohost.confirmYes": "Yes, remove",
  "cohost.confirmKeep": "Keep",
  "cohost.removeCta": "Remove",
  "cohost.removeAria": "Remove {name} as a cohost",
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
  "hub.tabs.ariaLabel": "Discover views",
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
  "hub.browse.searchLabel": "Search events",
  "hub.browse.searchPlaceholder": "Search by name or neighbourhood",
  "hub.browse.noMatch.title": "Nothing matches those filters.",
  "hub.browse.noMatch.body":
    "Try a wider stretch of dates, another neighbourhood, or any kind of gathering.",
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
  // ── LOC-18: what a gathering costs (display only, no payment anywhere) ────
  "create.step3.costLabel": "What it costs",
  "create.step3.costHint":
    "Say it in your own words. Nobody pays through QueerPulse, so whatever you write here is what people should expect at the door.",
  "create.step3.costPlaceholder":
    "Free, pay what you can, 5 to 15 EUR sliding scale…",
  "create.step5.row.cost": "Cost",
  "create.step5.costFree": "Free",
  "create.step5.accessAnswer": "{question}: {answer}",
  "create.step5.accessUnanswered_one": "1 question you haven't answered yet",
  "create.step5.accessUnanswered_other":
    "{count} questions you haven't answered yet",
  "events.freeTag": "Free",

  // ── LOC-03: the door ──────────────────────────────────────────────────────
  "door.expectedSeats": "Seats expected",
  "door.checkInCta": "Check in",
  "door.checkInAria": "Check in {name}",
  "door.arrivedAt": "Arrived {time}",
  "door.undoCta": "Undo",
  "door.undoAria": "Undo check-in for {name}",
  "door.undoneToast": "Check-in undone",
  "door.failedToast": "That didn't go through. Try again in a moment.",
  "door.emptyTitle": "Nobody on the list yet",
  "door.emptyDescription":
    "As people RSVP they show up here, ready to check in at the door.",
  "door.notYoursTitle": "This door isn't yours to open",
  "door.notYoursDescription":
    "Only the host and co-hosts of a gathering can see who's coming to it.",
  // Shown in place of the arrived count once a gathering is past its
  // attendance retention window. A deliberate privacy choice, so it reads as
  // something the platform does rather than something that went wrong. Zero
  // still means zero, and never uses these.
  "door.checkInsNotKept": "No longer kept",
  "door.checkInsNotKeptNote":
    "Check-ins are no longer kept for past gatherings. We clear them 30 days after a gathering ends.",
  // The same absence, said once more where the guest list's arrival filters
  // used to be. Deliberately different wording from the note above it: the
  // two sit on one screen, so repeating that sentence verbatim would read as
  // a rendering fault rather than an explanation.
  "door.checkInsNotKeptFilters":
    "The arrival filters are gone because we cleared this gathering's check-ins, so everyone on the list shows below.",
  // Shown in place when the server refuses a check-in on a gathering past its
  // attendance window. The host did nothing wrong, so it states what the
  // platform did rather than reading as a failure, and it offers no retry.
  "door.checkInClosedNotice":
    "Check-in is closed for this gathering. We cleared its arrival records once the check-in window passed, so no new ones can be added.",
  "door.scan.heading": "At the door",
  "door.scan.lead":
    "Read someone's membership card, or find them on the list below.",
  "door.scan.openCta": "Read a card",
  "door.scan.eyebrow": "Check in",
  "door.scan.title": "Read a membership card",
  "door.scan.viewfinderAria": "Camera view for reading a membership card",
  "door.scan.startingHint": "Waking the camera up…",
  "door.scan.pointHint": "Hold the card's code in the frame",
  "door.scan.deniedHint":
    "This browser hasn't been given the camera. Type the code from the card instead.",
  "door.scan.unsupportedHint":
    "This browser can't read a code from the camera. Type the code from the card instead.",
  "door.scan.failedHint":
    "The camera didn't start. Type the code from the card instead.",
  "door.scan.codeLabel": "Code from the card",
  "door.scan.codeHelper":
    "Every membership card carries this under its code. Paste or type it and it works the same way.",
  "door.scan.codePlaceholder": "Paste or type the code",
  "door.scan.checkInCta": "Check in",
  "door.scan.checkingCta": "Checking in…",
  "door.scan.doneCta": "Done",

  // ── LOC-04: where it is, and who can get in ───────────────────────────────
  "gathering.where.heading": "Getting there",
  "gathering.where.placeLabel": "Where",
  "gathering.where.addressLabel": "Address",
  "gathering.where.addressWithheld":
    "The exact address is shared with the people who are going. RSVP and it appears here.",
  "gathering.where.arrivalLabel": "Finding the door",
  "gathering.where.languageLabel": "Language",
  "gathering.where.costLabel": "Cost",
  "gathering.where.costFree": "Free",
  "gathering.where.costNote":
    "Whatever you pay happens between you and the host. QueerPulse takes no money.",
  "gathering.access.heading": "Access",
  "gathering.access.lead":
    "What the host has told us about getting in and being comfortable. An unanswered question means nobody has said, so ask if you need to know.",

  // ── LOC-06: what the organisers have said ─────────────────────────────────
  "gathering.announcements.heading": "From the hosts",
  "gathering.announcements.lead":
    "Updates the organisers sent to everyone coming.",
  "gathering.announcements.from": "{name}",
  "gathering.announcements.fromOrganiser": "One of the organisers",
  "manage.announcements.composerLabel": "Tell everyone who's coming",
  "manage.announcements.placeholder":
    "We've moved to the back room. The door code is 4471, come up the stairs on the left.",
  "manage.announcements.deliveryHint":
    "Lands as a notification and a push for everyone holding an RSVP or an invite.",
  "manage.announcements.sendCta": "Send it",
  "manage.announcements.sendingCta": "Sending…",
  "manage.announcements.sentToast": "Sent to everyone coming",
  "manage.announcements.errorToast": "That didn't send. Try again in a moment.",
  "manage.announcements.previousHeading": "What you've sent",
  "manage.announcements.emptyTitle": "Nothing sent yet",
  "manage.announcements.emptyDescription":
    "Anything you send lands here too, so people can find it again at the door.",
  "manage.announcements.reached_one": "Reached 1 person",
  "manage.announcements.reached_other": "Reached {count} people",
  "manage.messageModal.bodyHelper":
    "Everyone holding an RSVP or an invite gets this as a notification and a push.",
  "manage.messageModal.sendingCta": "Sending…",
  "manage.messageModal.errorToast": "That didn't send. Try again in a moment.",

  // ── LOC-07: what attendees told the host, and how many seats that is ──────
  "manage.attendees.seatsFilled": "{seats} of {capacity} seats taken",
  "manage.attendees.seatsFromGuests_one": "1 person going, guests included",
  "manage.attendees.seatsFromGuests_other":
    "{count} people going, guests included",
  "manage.attendees.needs.privateLabel": "Private to the organisers",
  "manage.attendees.needs.guests_one": "Bringing 1 guest",
  "manage.attendees.needs.guests_other": "Bringing {count} guests",
  "manage.attendees.needs.accessLabel": "Access:",
  "manage.attendees.needs.dietaryLabel": "Food:",
  "manage.attendees.needs.withheld": "They chose to keep their answers private",

  // ── LOC-08: the host's own door ───────────────────────────────────────────
  "manage.bans.eyebrow": "This gathering only",
  "manage.bans.title": "Bar {name} from this gathering",
  "manage.bans.sub":
    "They won't be told, and they won't be able to RSVP again.",
  "manage.bans.explainer":
    "This covers this gathering and nothing else. It says nothing about them anywhere else on QueerPulse. If you want them out of your whole space, block them from their profile instead.",
  "manage.bans.reasonLabel": "A note for you",
  "manage.bans.reasonHelper":
    "Only the organisers ever see this. It is never sent to them.",
  "manage.bans.reasonPlaceholder": "What happened, in your own words",
  "manage.bans.barCta": "Bar them",
  "manage.bans.barringCta": "Barring…",
  "manage.bans.barShortCta": "Bar",
  "manage.bans.barAria": "Bar {name} from this gathering",
  "manage.bans.barredToast": "{name} is barred from this gathering",
  "manage.bans.errorToast": "That didn't go through. Try again in a moment.",
  "manage.bans.listHeading_one": "Barred (1)",
  "manage.bans.listHeading_other": "Barred ({count})",
  "manage.bans.emptyTitle": "Nobody is barred",
  "manage.bans.emptyDescription":
    "If you ever need to keep someone away from this one gathering, you can do it from their row above.",
  "manage.bans.barredOn": "Barred {date}",
  "manage.bans.liftCta": "Lift",
  "manage.bans.liftAria": "Lift the bar on {name}",
  "manage.bans.liftedToast": "{name} can RSVP again",
  "rsvpControl.refusedToast": "The host has removed you from this gathering.",
  "rsvpControl.goneToast": "This gathering isn't there any more.",
  "rsvpControl.errorToast": "That didn't go through. Try again in a moment.",
  "sharePlans.panelHeading": "Tell someone where you'll be",
  "sharePlans.panelLead":
    "Send one person you trust the time and the place. It goes as an ordinary message, and only they see it.",
  "sharePlans.openCta": "Share my plans",
  "sharePlans.eyebrow": "Just between you two",
  "sharePlans.title": "Tell someone <em>where you'll be</em>",
  "sharePlans.sub":
    "Pick one of your connections. They get it as a normal message you can both read back later.",
  "sharePlans.searchLabel": "Search your connections",
  "sharePlans.loadingConnections": "Finding your connections…",
  "sharePlans.noConnections":
    "You have no connections yet. Connect with someone first and they'll show up here.",
  "sharePlans.messageLabel": "What they'll get",
  "sharePlans.messageHint": "Edit this however you like before it goes.",
  "sharePlans.sendCta": "Send it",
  "sharePlans.sendingCta": "Sending…",
  "sharePlans.errorToast": "That didn't send. Try again in a moment.",
  "sharePlans.successTitle": "They <em>know</em>",
  "sharePlans.successSub": "{name} has your plans for this one.",
  "sharePlans.successMeta":
    "It's in your messages if you want to add anything.",
  "sharePlans.template.opening": "I'm going to {title} on {when}.",
  "sharePlans.template.place": "It's at {place}.",
  "sharePlans.template.link": "Details: {link}",

  // ── LOC-17: browse filters ────────────────────────────────────────────────
  "hub.browse.when.groupLabel": "When",
  "hub.browse.when.any": "Any time",
  "hub.browse.when.today": "Today",
  "hub.browse.when.weekend": "This weekend",
  "hub.browse.when.week": "Next 7 days",
  "hub.browse.when.month": "Next 30 days",
  "hub.browse.hoodLabel": "Neighbourhood",
  "hub.browse.hoodAny": "Anywhere in Lisbon",
  "hub.browse.typeLabel": "Kind of gathering",
  "hub.browse.typeAny": "Any kind",
  "hub.browse.cost.groupLabel": "Cost",
  "hub.browse.cost.any": "Any cost",
  "hub.browse.cost.free": "Free",
  "hub.browse.cost.paid": "Has a door price",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-38 — PRD-38 - taking a photo down from a gathering album (live mode). The control, its confirmation, and the two outcomes. Also two accessible names for the album tile link, which had none when a photo carried no caption.
  "photos.removeAriaLabel": "Remove this photo from the album",
  "photos.removeConfirmTitle": "Remove this photo?",
  "photos.removeConfirmBody":
    "This takes the photo out of the album for everyone who can see it. It cannot be undone.",
  "photos.removeConfirmCta": "Remove photo",
  "photos.removedToast": "Photo removed from the album.",
  "photos.removeError":
    "We could not remove that photo. It is still in the album, so try again.",
  "photos.openPhotoAriaLabel": "Open this photo in a new tab",
  "photos.openCaptionedPhotoAriaLabel":
    "Open this photo in a new tab: {caption}",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-38 — PRD-38 - taking a photo down from a gathering album (live mode). The control, its confirmation, and the two outcomes. Also two accessible names for the album tile link, which had none when a photo carried no caption.

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PHOTO-REPORT — PHOTO-REPORT - the per-photo report control on a gathering album tile (live mode only). Sits beside the existing photos.removeAriaLabel take-down control. The captioned variant gives each tile a distinct accessible name; the plain one covers a photo with no caption. reportSubjectName is what the report modal calls the subject when the photo carries no caption of its own.
  // PRD-38 — PRD-38 - taking a photo down from a gathering album (live mode). The control, its confirmation, and the two outcomes. Also two accessible names for the album tile link, which had none when a photo carried no caption.
  "photos.reportCta": "Report",
  "photos.reportAriaLabel": "Report this photo",
  "photos.reportCaptionedAriaLabel": "Report the photo captioned {caption}",
  "photos.reportSubjectName": "Photo from {gathering}",

  // ── Deep-scan section 6 (Gatherings), built 2026-09-06 ────────────────────

  // DES-130 — the "Online" neighbourhood label. The card and detail adapters
  // used to emit the English literal while the My Events adapter translated
  // the identical fact, so one gathering read in two languages on two screens.
  "common.online": "Online",

  // PRD-182 — the join link for an online gathering. It rides the same server
  // gate as a street address (organisers and confirmed attendees), so its
  // absence is a fact to state, never a blank line. Two different absences,
  // said differently: the host never added one, or the reader has not earned
  // it yet.
  "gathering.where.joinLinkLabel": "Join link",
  "gathering.where.joinLinkMissing":
    "You haven't added a join link yet. Attendees will look for it here.",
  "gathering.where.joinLinkWithheld":
    "The join link is shared with the people who are going.",
  "gathering.joinLinkNote":
    "Join link shared with confirmed guests after you RSVP.",

  // PRD-181 / PRD-183 — a gathering nobody can still join. The page used to
  // render an ordinary RSVP button in both states and the server answered it
  // with a 400 the member had no way to read.
  "gathering.cancelledBanner":
    "This gathering was cancelled. Nothing is happening on this date.",
  "gathering.endedBanner":
    "This gathering has already happened. RSVPs are closed.",
  "gathering.reportCta": "Report this gathering",
  "gathering.reportAriaLabel": "Report the gathering {title}",

  // PRD-188 — "Maybe" on the detail page. The API and My Events both supported
  // it while this surface offered only a seat, so a member could not mark
  // interest without committing one.
  "rsvpControl.maybeCta": "Maybe",
  "rsvpControl.maybeTitle": "You're a <em>maybe</em>",
  "rsvpControl.maybeNote":
    "You haven't taken a seat. Switch to going when you know.",
  "rsvpControl.maybeToast": "Marked as maybe",
  "rsvpControl.switchToGoingCta": "I'm going",

  // ENG-140 — the host turned "Show attendee count" off, so the server sends
  // no roster and no numbers to anyone but an organiser. Said plainly rather
  // than rendered as a zero, which would read as "nobody is coming".
  "rsvpControl.goingCountHidden": "The host keeps the guest list private.",

  // PRD-187 — the plus-one and access needs, reachable from the gathering
  // itself instead of only from a My Events card on another page.
  "rsvpControl.yourDetailsCta": "Your details",

  // PRD-181 / PRD-183 — the sidebar panel for a closed gathering. Someone who
  // was coming is told their plan has changed; someone who was not is simply
  // told the state.
  "rsvpControl.cancelledTitle": "This gathering was <em>cancelled</em>",
  "rsvpControl.cancelledNote": "The host called it off.",
  "rsvpControl.cancelledAttendingNote":
    "The host called it off, so your place is gone. Nothing else to do.",
  "rsvpControl.endedTitle": "This gathering has <em>ended</em>",
  "rsvpControl.endedNote": "It already happened.",
  "rsvpControl.endedAttendingNote": "Hope it was good.",

  // PRD-187 — "Anything we should know?" on the gathering detail
  // (GatheringRsvpDetailsModal). Capacity counts declared guests, so an
  // undeclared plus-one is a place the host never laid.
  "rsvpDetails.eyebrow": "Your RSVP",
  "rsvpDetails.title": "Anything we should <em>know</em>?",
  "rsvpDetails.sub": "The host reads this. Nobody else has to.",
  "rsvpDetails.guestsLabel": "Who's coming",
  "rsvpDetails.guestOption_one": "Me and {count} other",
  "rsvpDetails.guestOption_other": "Me and {count} others",
  "rsvpDetails.guestsHint":
    "Seats are counted per person, so this is how many places the host lays.",
  "rsvpDetails.accessLabel": "Access needs",
  "rsvpDetails.accessPlaceholder":
    "Step-free entry, a seat near the door, a quiet corner…",
  "rsvpDetails.dietaryLabel": "Food and drink",
  "rsvpDetails.dietaryPlaceholder": "Vegan, no alcohol, an allergy…",
  "rsvpDetails.whoSeesLabel": "Who can see this",
  "rsvpDetails.visibility.everyone": "Everyone going",
  "rsvpDetails.visibility.connections": "My connections",
  "rsvpDetails.visibility.justMe": "Just the host",
  "rsvpDetails.privacyNote":
    "The host always sees what you write here, whatever you choose above.",
  "rsvpDetails.cancelCta": "Cancel",
  "rsvpDetails.saveCta": "Save",
  "rsvpDetails.savedToast": "Saved",
  "rsvpDetails.saveErrorToast": "That didn't save. Try again in a moment.",

  // PRD-182 — the join link in the create wizard, asked only for an online
  // gathering (which has no door to describe instead).
  "create.step2.joinLinkLabel": "Join link",
  "create.step2.joinLinkPlaceholder": "https://…",
  "create.step2.joinLinkHint":
    "Shared with the people who are going, never on the public page. You can add it later.",
  "create.step2.joinLinkInvalid":
    "That doesn't look like a link. It needs to start with https://",

  // PRD-184 — the upcoming list used to stop at the soonest 20 with no way to
  // ask for the rest, so a busy season simply ended.
  "calendar.loadMore": "Show more",
  "calendar.loadingMore": "Loading…",

  // PRD-190 — host tooling: run a gathering again, and take the door list
  // offline. The export button used to raise a toast and produce no file.
  "manage.overview.duplicateCta": "Run this again",
  "manage.attendees.exportingCta": "Exporting…",
  "manage.attendees.exportDemoToast":
    "There's no real guest list to export in the demo.",
  "manage.attendees.exportFailedToast":
    "The export didn't come through. Try again in a moment.",
};
