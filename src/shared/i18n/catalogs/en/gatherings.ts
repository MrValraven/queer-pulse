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
  "calendar.legend.ilga": "ILGA Portugal",
  "calendar.legend.community": "Community",
  "calendar.legend.partners": "Partner orgs",
};
