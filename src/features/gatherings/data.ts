import { routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../shared/i18n/types";
import type {
  EventHostDTO,
  EventSeriesDTO,
  EventVisibility,
  RsvpDetailsDTO,
} from "./api/events.api";

/**
 * The "spots" line on an event card — "8 seats left", "32 going", "Open to all".
 *
 * i18n note: the *phrase* is platform chrome (the live adapter composes it in
 * source code too — see `api/events.adapters.ts`), while the *number* comes
 * over the wire. So the record holds a catalog key plus its interpolation
 * values, and `spotsText()` resolves the pair at render time.
 */
export interface SpotsLabel {
  key: string;
  /** `count` drives CLDR plurals; `priceEur` is formatted via `useFormat()`. */
  values?: TranslateOptions & { priceEur?: number };
}

/**
 * Resolve a {@link SpotsLabel} against the active language. `priceEur` is run
 * through `fmt.currency` first so PT gets its `6,00 €` suffix rather than a
 * hardcoded `€6`.
 */
export function spotsText(
  spots: SpotsLabel,
  t: TFunction,
  fmt: Formatters,
): string {
  const { priceEur, ...rest } = spots.values ?? {};
  return t(
    spots.key,
    priceEur === undefined ? rest : { ...rest, price: fmt.currency(priceEur) },
  );
}

export interface GatheringDetail {
  slug: string;
  /** Organizer-authored category, e.g. "Supper Club" — fetched in live mode. */
  type: string;
  date: Date;
  /** IANA zone the host scheduled this in, when the API carries one. The
   *  detail surfaces format `date` through it (see `eventZoneFormat`) and
   *  label the clock when it differs from the reader's own. Absent in the demo
   *  registry, which falls back to the reader's zone as it always did. */
  timezone?: string;
  title: string;
  hood: string;
  host: string;
  hostSlug: string;
  /** Host display fields carried from the event DTO in live mode, so the page
   *  renders the host avatar without reading the demo `memberProfiles` registry.
   *  Absent in the demo registry (demo resolves the host from `hostSlug`). */
  hostFirst?: string;
  hostLast?: string;
  hostAvatarUrl?: string | null;
  spots: SpotsLabel;
  /** Catalog key for the RSVP button — chrome, varies by event kind. */
  ctaKey: string;
  body: string;
  /** Live mode only: true when the viewer is the host or a cohost. Drives
   *  organizer-only affordances (e.g. the photo-album upload control). */
  viewerIsOrganizer?: boolean;
  /** Live mode only: whether the viewer has bookmarked ("saved") this event.
   *  Seeds the detail's Save toggle; absent (undefined) in the demo registry,
   *  where the toggle starts un-saved and lives purely in local state. */
  bookmarked?: boolean;
  /** Live mode only: the event's end instant, when the organizer set one.
   *  Absent in the demo registry (every mock gathering is a single `date`
   *  with no separate end). `GatheringPerformerNudge` treats "has the
   *  gathering ended" as `endAt ?? date` in the past, so a demo gathering
   *  with a past `date` still counts as ended. */
  endAt?: Date;
  /** Live mode only: the viewer's own RSVP standing, so the in-event RSVP
   *  control shows the confirmed "you're going" / waitlist state on load (and
   *  after a reload). `null`/absent = no active RSVP. Absent in the demo
   *  registry, where it reads as `null` and the plain RSVP action shows. */
  myRsvpStatus?: "going" | "maybe" | "waitlisted" | null;
  /** Live mode only: true when the event is at capacity — the control offers
   *  "Join the waitlist" instead of "I'm going". Absent in the demo registry. */
  isFull?: boolean;
  /** Live mode only: the event's capacity, or null when unlimited. */
  capacity?: number | null;
  /** Live mode only: the viewer's place in the waitlist queue, when waitlisted. */
  waitlistPosition?: number | null;
  /** Live mode only: who can find and RSVP to this gathering — the audience-
   *  scope the host chose in the wizard (or later, in the edit modal).
   *  Absent in the demo registry, where the manage dashboard defaults it to
   *  "members" (Public), matching the wizard's own default. */
  visibility?: EventVisibility;
  /** Live mode only: the community this gathering is filed to, if any —
   *  settable at creation and changeable afterwards via the edit modal's
   *  community picker. Absent in the demo registry (the demo gathering isn't
   *  filed to a community), which is fine: the manage dashboard's
   *  "Community members" audience-scope tier simply stays unoffered there,
   *  same as any other event with no community. */
  communitySlug?: string;
  /** Live mode only: the directory listing this gathering's venue is linked
   *  to, or null/absent for a free-text venue. Settable via the manage
   *  dashboard's venue picker. Absent in the demo registry (no demo
   *  gathering is linked to a real listing). */
  venueListingId?: string | null;
  /** Live mode only: the linked listing's display name + public slug, when
   *  `venueListingId` is set. Absent/null otherwise. */
  venueListing?: { slug: string; name: string } | null;
  /** Live mode only: the gathering's accepted co-hosts, so the manage
   *  dashboard's Settings tab can show who's co-hosting without a second
   *  request. Absent in the demo registry, where `CohostManager` keeps its
   *  own seeded mock roster. */
  cohosts?: EventHostDTO[];
  /** Live mode only: the viewer's own RSVP details ("Anything we should
   *  know?"), or `null` with no active RSVP. Seeds `RsvpDetailsModal` on
   *  open. Absent in the demo registry, where the modal keeps its own local
   *  starting state. */
  myRsvpDetails?: RsvpDetailsDTO | null;
  /** Live mode only: the manage dashboard's "Options" toggles' real current
   *  values (`SettingsTab`). Absent in the demo registry, where the tab
   *  keeps its own local-only starting state (`GATHERING_SETTINGS.on`). */
  showAttendeeCount?: boolean;
  allowWaitlist?: boolean;
  /** Live mode only (MSG-10): the recurring series this gathering belongs
   *  to, or `null`/absent for a standalone gathering. Drives the manage
   *  dashboard's this-vs-future edit/cancel prompt. Absent in the demo
   *  registry — no demo gathering is part of a series. */
  series?: EventSeriesDTO | null;
  /** Live mode only (MSG-12): a small pre-RSVP "who else is going" preview,
   *  already privacy- and block-filtered server-side — see
   *  `EventsService.buildGoingAttendeesPreview` (backend). Absent in the demo
   *  registry; `GoingAttendeesPreview` derives its own small preview from the
   *  member registry there instead, keyed off `spots.values.count`. */
  goingAttendeesPreview?: EventHostDTO[];
  /** The filtered total behind `goingAttendeesPreview` (NOT the raw
   *  `spots`/`goingCount` number) — drives the "+N more" line. */
  goingAttendeesPreviewTotal?: number;
}

export const gatheringDetails: Record<string, GatheringDetail> = {
  "supper-club-12": {
    slug: "supper-club-12",
    type: "Supper Club",
    date: new Date(2026, 5, 6),
    title: "Queer Supper Club №12",
    hood: "Mouraria",
    host: memberName("tomas"),
    hostSlug: "tomas",
    spots: { key: "gatherings:spots.seatsLeft", values: { count: 8 } },
    ctaKey: "gatherings:cta.reserveSeat",
    body: "Twelve seats, no menu, whatever came in that week. Tomás cooks with whatever is seasonal and beautiful. Guests bring wine. The conversation takes care of itself. Doors open at 7:30pm, dinner at 8. The address is shared on the morning of the event.",
  },
  "portfolio-night": {
    slug: "portfolio-night",
    type: "Mixer",
    date: new Date(2026, 5, 14),
    title: "Portfolio Night: Designers & Photographers",
    hood: "Príncipe Real",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 32 } },
    ctaKey: "gatherings:cta.illBeThere",
    body: "Bring a portfolio, a laptop, a phone, whatever your work lives on. This is an informal evening for designers and photographers in the network to share work-in-progress and meet each other without an agenda. Drinks from 7pm at a borrowed space in Príncipe Real.",
  },
  "studio-visit": {
    slug: "studio-visit",
    type: "Studio Visit",
    date: new Date(2026, 5, 21),
    title: "Inside Beatriz's Ceramics Studio",
    hood: "Graça",
    host: memberName("beatriz"),
    hostSlug: "beatriz",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 3 } },
    ctaKey: "gatherings:cta.requestSpot",
    body: "A slow Sunday afternoon in Beatriz's studio in Graça. She'll talk through her practice, show the kiln, and there will be clay to touch. Limited to 10 people. Tea provided. The studio is at the top of a steep hill and worth every step.",
  },
  "founders-breakfast": {
    slug: "founders-breakfast",
    type: "Breakfast",
    date: new Date(2026, 6, 2),
    title: "Founders & Builders Breakfast",
    hood: "Marvila",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.casual" },
    ctaKey: "gatherings:cta.rsvp",
    body: "An early-morning gathering for people building things: companies, studios, projects, community organisations. No pitching. No networking. Just good coffee, bread from a bakery in Mouraria, and honest conversation about what it's actually like to build something.",
  },
  "trans-hub-meetup": {
    slug: "trans-hub-meetup",
    type: "Meetup",
    date: new Date(2026, 5, 10),
    title: "Trans & NB Hub: Monthly Meetup",
    hood: "Arroios",
    host: "Trans & NB Hub",
    hostSlug: "",
    spots: { key: "gatherings:spots.openToAll" },
    ctaKey: "gatherings:cta.rsvp",
    body: "A relaxed monthly evening for trans and non-binary folks to land, breathe, and be among people who get it. No agenda beyond company: tea, snacks, and whatever the room wants to talk about. New faces are always welcome; you can sit quietly until you feel like talking.",
  },
  "skills-exchange-intro": {
    slug: "skills-exchange-intro",
    type: "Workshop",
    date: new Date(2026, 5, 12),
    title: "Skills Exchange: Intro Session",
    hood: "Príncipe Real",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.spotsLeft", values: { count: 12 } },
    ctaKey: "gatherings:cta.reserveSpot",
    body: "An introduction to the QueerPulse skills barter: how to offer what you know, ask for what you need, and trade without money changing hands. We'll walk through real examples from the network and help you post your first offer by the end of the hour.",
  },
  "queer-parent-network": {
    slug: "queer-parent-network",
    type: "Meetup",
    date: new Date(2026, 5, 17),
    title: "Queer Parent Network: First Meetup",
    hood: "Estrela",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.familyFriendly" },
    ctaKey: "gatherings:cta.rsvp",
    body: "The first gathering of the Queer Parent Network: for LGBTQ+ parents, carers, and those thinking about it. Kids welcome; there's a corner of the park with shade and space to run. Come swap notes on schools, doctors, and the small daily logistics of raising a family here.",
  },
  "trans-mutual-aid": {
    slug: "trans-mutual-aid",
    type: "Mutual Aid",
    date: new Date(2026, 5, 20),
    title: "Trans Mutual Aid: Open Meeting",
    hood: "Mouraria",
    host: "Trans Mutual Aid Lisboa",
    hostSlug: "",
    spots: { key: "gatherings:spots.openToAll" },
    ctaKey: "gatherings:cta.rsvp",
    body: "An open organising meeting for the trans mutual aid fund: where requests are reviewed, money is pooled, and the next month's priorities get set together. Everyone has a voice. If you need support or want to give it, this is the room where both happen.",
  },
  "queer-elders-social": {
    slug: "queer-elders-social",
    type: "Social",
    date: new Date(2026, 5, 24),
    title: "Queer Elders: Monthly Social",
    hood: "Chiado",
    host: "Queer Elders Lisboa",
    hostSlug: "",
    spots: { key: "gatherings:spots.openToAll" },
    ctaKey: "gatherings:cta.rsvp",
    body: "An unhurried afternoon for queer elders and the friends who love them: coffee, cake, and the kind of stories that don't get told often enough. Intergenerational guests welcome. Step-free venue with seating throughout.",
  },
  "wellbeing-ama": {
    slug: "wellbeing-ama",
    type: "Q&A",
    date: new Date(2026, 5, 26),
    title: "Wellbeing Q&A: Therapist AMA",
    hood: "Online",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.online" },
    ctaKey: "gatherings:cta.joinOnline",
    body: "A live, anonymous Q&A with a queer-affirming therapist from the QueerPulse wellbeing network. Bring your questions about burnout, anxiety, identity, relationships, or just listen. Submit questions ahead of time or in the chat; nothing is named or recorded.",
  },
  "queer-runners-run": {
    slug: "queer-runners-run",
    type: "Run Club",
    date: new Date(2026, 5, 28),
    title: "Queer Runners: End-of-Month Run",
    hood: "Tejo path",
    host: "Queer Runners",
    hostSlug: "",
    spots: { key: "gatherings:spots.allPaces" },
    ctaKey: "gatherings:cta.rsvp",
    body: "A flat, friendly 5K along the river to close out the month: all paces, walkers included, no one left behind. We meet by the water, run loose, and finish with coffee. First-timers, say hi when you arrive and we'll pair you up.",
  },
  "queer-youth-gathering": {
    slug: "queer-youth-gathering",
    type: "Meetup",
    date: new Date(2026, 6, 5),
    title: "Queer Youth Network: First Gathering",
    hood: "Arroios",
    host: "Queer Youth Network",
    hostSlug: "",
    spots: { key: "gatherings:spots.ages1625" },
    ctaKey: "gatherings:cta.rsvp",
    body: "The opening gathering of the Queer Youth Network, for LGBTQ+ people aged 16–25. A safe, low-key space to meet others, share what you're into, and shape what the group becomes. Facilitated by trained volunteers. Snacks provided.",
  },
  "disability-access-talk": {
    slug: "disability-access-talk",
    type: "Open Conversation",
    date: new Date(2026, 6, 9),
    title: "Disability & Access: Open Conversation",
    hood: "Online",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.online" },
    ctaKey: "gatherings:cta.joinOnline",
    body: "An open conversation about disability, access, and chronic illness in queer community: what works, what doesn't, and what we want QueerPulse to do better. Live captions provided. Your input shapes the network's access commitments for the year.",
  },
  "legal-clinic": {
    slug: "legal-clinic",
    type: "Legal Clinic",
    date: new Date(2026, 6, 11),
    title: "Free Legal Clinic",
    hood: "Intendente",
    host: "Community legal volunteers",
    hostSlug: "",
    spots: { key: "gatherings:spots.byAppointment" },
    ctaKey: "gatherings:cta.bookSlot",
    body: "Free, confidential one-to-one sessions with volunteer lawyers from the queer community: name changes, residency, discrimination, housing, and more. Twenty-minute slots, booked in advance. Bring any relevant paperwork; everything discussed stays private.",
  },
  "queer-choir-rehearsal": {
    slug: "queer-choir-rehearsal",
    type: "Rehearsal",
    date: new Date(2026, 6, 14),
    title: "Queer Choir: Monthly Rehearsal",
    hood: "Príncipe Real",
    host: "Lisbon Queer Choir",
    hostSlug: "",
    spots: { key: "gatherings:spots.noAudition" },
    ctaKey: "gatherings:cta.rsvp",
    body: "Monthly rehearsal of the Lisbon Queer Choir: no audition, no sheet-music required, every voice welcome. We warm up together, learn by ear, and build toward the season's performances. Come for one song or stay for all of them.",
  },
  "resource-library-launch": {
    slug: "resource-library-launch",
    type: "Launch",
    date: new Date(2026, 6, 16),
    title: "Resource Library Launch: Live Q&A",
    hood: "Online",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.online" },
    ctaKey: "gatherings:cta.joinOnline",
    body: "A live walkthrough of the new QueerPulse Resource Library (health, legal, housing, and community guides gathered in one place) followed by an open Q&A. Tell us what's missing; the first round of additions comes straight from this call.",
  },
  "micro-grants-office-hours": {
    slug: "micro-grants-office-hours",
    type: "Office Hours",
    date: new Date(2026, 6, 22),
    title: "Micro-Grants: Q3 Open Office Hours",
    hood: "Online",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.dropIn" },
    ctaKey: "gatherings:cta.joinOnline",
    body: "Drop-in office hours for the Q3 micro-grants round. Bring a half-formed idea or a nearly-finished application and we'll help you shape it. No project is too small. The grants fund community projects up to €500, no strings, quick turnaround.",
  },
  "queer-of-colour-gathering": {
    slug: "queer-of-colour-gathering",
    type: "Gathering",
    date: new Date(2026, 6, 26),
    title: "Queer & of Colour: Monthly Gathering",
    hood: "Intendente",
    host: "Queer & of Colour Collective",
    hostSlug: "",
    spots: { key: "gatherings:spots.openToAll" },
    ctaKey: "gatherings:cta.rsvp",
    body: "A monthly gathering centring QTIBIPOC experiences: food, music, and conversation in a space made by and for queer and trans people of colour. Allies who are invited by a member are welcome. Come as you are; this is a place to exhale.",
  },
  "queer-night-swim": {
    slug: "queer-night-swim",
    type: "Swim",
    date: new Date(2026, 5, 22),
    title: "Queer Night Swim",
    hood: "Piscina Municipal, Anjos",
    host: "Queer Swimmers Lisboa",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 12 } },
    ctaKey: "gatherings:cta.illBeThere",
    body: "A laid-back evening swim for the queer community: lengths if you want them, floating and chatting if you don't. The lifeguarded municipal pool is ours for the hour after closing. Bring a suit and a towel; everything else is optional. New swimmers and nervous ones especially welcome.",
  },
  "queer-book-club": {
    slug: "queer-book-club",
    type: "Book Club",
    date: new Date(2026, 6, 19),
    title: "Queer Book Club: July",
    hood: "LX Factory, Alcântara",
    host: "QueerPulse",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 12 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "This month we're reading a queer classic and meeting in the courtyard at LX Factory to talk it over. You don't need to have finished the book, or even started it, to come along. Wine, snacks, and an easy conversation from 6pm. The next read gets picked together at the end.",
  },
  // ── Detail pages for the member's own "My Events" dashboard ──
  // Each card in /account/events links here via its `slug`.
  "stone-butch-blues": {
    slug: "stone-butch-blues",
    type: "Book Club",
    date: new Date(2026, 5, 29),
    title: "Queer Book Club: “Stone Butch Blues”",
    hood: "Mouraria",
    host: "Lisbon Queer Reads",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 11 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "We're sitting with Leslie Feinberg's “Stone Butch Blues” this month: chapter ten through the end. Come whether you've finished or fallen behind; the conversation makes room for both. Tea from 6:45pm, discussion at 7. Room 2 on the first floor, step-free and sober throughout.",
  },
  "trans-joy-picnic": {
    slug: "trans-joy-picnic",
    type: "Picnic",
    date: new Date(2026, 5, 30),
    title: "Trans Joy Picnic",
    hood: "Jardim da Estrela",
    host: "Trans Lisbon",
    hostSlug: "",
    spots: {
      key: "gatherings:spots.goingWithWaitlist",
      values: { count: 18, waitlist: 4 },
    },
    ctaKey: "gatherings:cta.rsvp",
    body: "A slow afternoon in the shade at Jardim da Estrela: blankets, snacks to share, and the easy company of trans and non-binary folks and the people who love them. There's a quiet corner away from the crowd if you need it. Step-free paths throughout. Bring what you can; there's always plenty to go round.",
  },
  "sober-queers-supper": {
    slug: "sober-queers-supper",
    type: "Supper Club",
    date: new Date(2026, 6, 5),
    title: "Sober Queers Supper Club",
    hood: "Príncipe Real",
    host: "Sober Queers",
    hostSlug: "",
    spots: { key: "gatherings:spots.waitlistOpen" },
    ctaKey: "gatherings:cta.joinWaitlist",
    body: "A shared dinner for sober and sober-curious queers: no pressure, no explaining yourself, just a good table and people who get it. Content note: open talk about recovery and addiction. The room is full this month, but the waitlist moves; we'll be in touch the moment a seat opens.",
  },
  "queer-karaoke-night": {
    slug: "queer-karaoke-night",
    type: "Nightlife",
    date: new Date(2026, 6, 3),
    title: "Queer Karaoke Night",
    hood: "Bairro Alto",
    host: "QueerPulse Nightlife",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 28 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "Bring a power ballad, a guilty pleasure, or just your loudest cheering voice. A warm, no-judgement night of queer karaoke at Purex in Bairro Alto: every voice welcome, every key forgiven. Songbook opens at 9. Stay for one number or close the place down.",
  },
  "queer-film-tangerine": {
    slug: "queer-film-tangerine",
    type: "Film Night",
    date: new Date(2026, 6, 2),
    title: "Queer Film Night: “Tangerine”",
    hood: "Avenida da Liberdade",
    host: "QueerPulse Cinema",
    hostSlug: "",
    spots: {
      key: "gatherings:spots.goingWithPrice",
      values: { count: 24, priceEur: 6 },
    },
    ctaKey: "gatherings:cta.reserveSeat",
    body: "A big-screen evening with Sean Baker's “Tangerine” at Cinema São Jorge, followed by an unhurried conversation in the foyer. Content note: brief scenes of transphobic violence. Doors at 7:30, film at 8. Tickets are €6 on the door or in advance; no one turned away for lack of funds.",
  },
  "drag-brunch-tia-maria": {
    slug: "drag-brunch-tia-maria",
    type: "Brunch",
    date: new Date(2026, 6, 4),
    title: "Drag Brunch with Tia Maria",
    hood: "Santa Apolónia",
    host: "QueerPulse Nightlife",
    hostSlug: "",
    spots: {
      key: "gatherings:spots.goingPayWhatYouCan",
      values: { count: 32 },
    },
    ctaKey: "gatherings:cta.rsvp",
    body: "Bottomless eggs, a riverside view, and Tia Maria holding court from noon. A loud, loving daytime drag brunch at Lux Frágil: pay what you can, tip if you're flush, dance if the spirit moves you. Step-free access and a safer-space policy in place.",
  },
  "queer-craft-market": {
    slug: "queer-craft-market",
    type: "Market",
    date: new Date(2026, 6, 4),
    title: "Queer Craft Market",
    hood: "Alcântara",
    host: "QueerPulse Makers",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 40 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "Forty makers, one sunny courtyard at LX Factory: ceramics, zines, prints, jewellery, and a fair amount of impulse buying. Come meet the queer artists behind the work, swap notes, and find something made by hand. Step-free throughout; bring cash and a tote.",
  },
  "mutual-aid-groceries": {
    slug: "mutual-aid-groceries",
    type: "Mutual Aid",
    date: new Date(2026, 6, 11),
    title: "Mutual Aid Circle: groceries run",
    hood: "Anjos",
    host: "Mutual Aid Lisbon",
    hostSlug: "",
    spots: { key: "gatherings:spots.going", values: { count: 9 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "We pool what we have and sort it into bags for neighbours who asked this month: a couple of hours of easy, practical solidarity at Casa do Comum. No experience needed; we'll show you the ropes. Step-free venue, masks encouraged. Many hands make it quick.",
  },
  "poly-open-discussion": {
    slug: "poly-open-discussion",
    type: "Discussion Circle",
    date: new Date(2026, 6, 18),
    title: "Poly & Open Relationships Discussion Circle",
    hood: "Online",
    host: "Sober Queers",
    hostSlug: "",
    spots: { key: "gatherings:spots.goingOnline", values: { count: 7 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "A facilitated, gentle conversation about polyamory, open relationships, and everything that doesn't fit a tidy script. Co-hosted on Zoom, cameras optional, safer-space norms read at the top. Bring a question or just listen. The join link arrives the morning of.",
  },
  "newcomers-mixer-july": {
    slug: "newcomers-mixer-july",
    type: "Mixer",
    date: new Date(2026, 6, 20),
    title: "Newcomers Mixer: July",
    hood: "Mouraria",
    host: "Newcomers",
    hostSlug: "",
    spots: { key: "gatherings:spots.goingSoFar", values: { count: 5 } },
    ctaKey: "gatherings:cta.rsvp",
    body: "New to the city, new to the network, or just ready to meet some people. This one's for you. A low-key evening at A Tasca in Mouraria with a host who'll actually introduce you around. Step-free and sober-friendly. Arrive whenever; we'll be the warm table in the corner.",
  },
};

export const defaultGatheringSlug = "supper-club-12";

// ── Gathering detail routing: /gatherings/<slug>-<shortId> ──
// Canonical convention. The shortId stands in for a real per-event id and is
// derived deterministically from the slug so links stay stable.

/** Stable 5-char short id derived from a slug. */
export function gatheringShortId(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 5).padStart(5, "0");
}

/** Canonical path for a gathering detail page. */
export function gatheringPath(slug: string): string {
  return `/gatherings/${slug}-${gatheringShortId(slug)}`;
}

/**
 * Query parameter the create-gathering wizard reads to preselect the community
 * a new gathering is filed to (`useGatheringForm`'s `communitySlug`). Kept next
 * to the path helper below so callers never hardcode the name.
 */
export const CREATE_GATHERING_COMMUNITY_PARAM = "community";

/**
 * Deep link into the create-gathering wizard. Pass a `communitySlug` to land
 * with that community already picked in the wizard's community field, which is
 * how a community's Events tab offers "host a gathering here". The wizard still
 * lets the host change or clear it, and the backend re-checks membership on
 * publish.
 */
export function createGatheringPath(communitySlug?: string): string {
  if (!communitySlug) return routes.createGathering;
  const query = new URLSearchParams({
    [CREATE_GATHERING_COMMUNITY_PARAM]: communitySlug,
  });
  return `${routes.createGathering}?${query.toString()}`;
}

/** Lifecycle sub-pages of one gathering (all under `/gatherings/:slug/...`). */
export const gatheringRecapPath = (slug: string): string =>
  `${gatheringPath(slug)}/recap`;
export const gatheringCancelledPath = (slug: string): string =>
  `${gatheringPath(slug)}/cancelled`;
export const gatheringDashboardPath = (slug: string): string =>
  `${gatheringPath(slug)}/dashboard`;
export const manageGatheringPath = (slug: string): string =>
  `${gatheringPath(slug)}/manage`;
export const gatheringPhotosPath = (slug: string): string =>
  `${gatheringPath(slug)}/photos`;
export const coHostInvitePath = (slug: string, inviteId: string): string =>
  `${gatheringPath(slug)}/co-host-invite/${inviteId}`;

/**
 * The concrete gathering each lifecycle page renders in demo mode. The pages
 * keep static data, so links to them build a real subject slug from here rather
 * than resolving the URL param (they don't read it yet).
 */
export const DEMO_GATHERING_SLUGS = {
  manage: "pride-brunch-jun",
  dashboard: "pride-brunch-jun",
  recap: "pride-brunch-jun",
  cancelled: "atelier-pulso-jul",
  photos: "open-clinic-night",
  coHostInvite: "open-clinic-night",
} as const;

/** Resolve a `:slug` route param (`<slug>-<shortId>`) back to a gathering. */
export function resolveGathering(param: string | undefined): GatheringDetail {
  if (param) {
    for (const slug of Object.keys(gatheringDetails)) {
      if (`${slug}-${gatheringShortId(slug)}` === param)
        return gatheringDetails[slug]!;
    }
    const base = param.replace(/-[a-z0-9]+$/i, "");
    if (gatheringDetails[base]) return gatheringDetails[base];
  }
  return gatheringDetails[defaultGatheringSlug]!;
}

/** Official QueerPulse event vs member/community-created gathering. */
export function gatheringKind(g: GatheringDetail): "event" | "gathering" {
  return g.host === "QueerPulse" ? "event" : "gathering";
}

/** Has this gathering ended? Prefers the real end instant when the live API
 *  provided one, falling back to the start `date` — every demo mock only has
 *  a `date`, so a past-dated demo gathering still counts as ended. Backs
 *  `GatheringPerformerNudge` (Personas Phase 5, Moment 5). */
export function gatheringHasEnded(g: GatheringDetail, now: Date = new Date()): boolean {
  return (g.endAt ?? g.date).getTime() < now.getTime();
}

// ── Community calendar events (month is 0-indexed) ──
export interface CalendarEvent {
  /** Start instant, including the clock time — rendered via `useFormat()`. */
  date: Date;
  /** IANA zone the host scheduled this in, when the API carries one. Cards
   *  format `date` through it (see `eventZoneFormat`) so a gathering abroad
   *  reads in its own clock. Absent in the demo registry, where every mock
   *  gathering is already in the reader's own zone. */
  timezone?: string;
  org: string;
  orgColor: string;
  title: string;
  hood: string;
  to: string;
  /** Official QueerPulse event vs member/community-created gathering. */
  kind: "event" | "gathering";
  /** Paid events surface a sliding-scale / price pill. */
  ticketed?: boolean;
  /** Sliding-scale floor, in euros. Formatted at render, never baked. */
  priceMin?: number;
  /** Sliding-scale ceiling. Absent = a single fixed `priceMin`. */
  priceMax?: number;
  /** Cover artwork; when absent the card shows a tinted placeholder. */
  coverImageUrl?: string;
  /** Going/RSVP count, used only to weight highlight curation. */
  attendeeCount?: number;
}

const ACCENT = "var(--accent)";
const COMMUNITY = "var(--violet)";

/**
 * Org category colours shared between the calendar and the events list.
 * QueerPulse shows two kinds of things: gatherings we host, and gatherings
 * run by people in the community. Nothing here implies a formal partnership
 * with an outside organisation.
 */
export const orgColors = {
  queerpulse: ACCENT,
  community: COMMUNITY,
};

export const calendarEvents: CalendarEvent[] = [
  {
    date: new Date(2026, 5, 6, 19, 30),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Queer Supper Club №12",
    hood: "Mouraria",
    to: gatheringPath("supper-club-12"),
    kind: "gathering",
    ticketed: true,
    priceMin: 6,
    priceMax: 18,
    coverImageUrl:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 42,
  },
  {
    date: new Date(2026, 5, 10, 18, 30),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Trans & NB Hub: Monthly Meetup",
    hood: "Arroios",
    to: gatheringPath("trans-hub-meetup"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 28,
  },
  {
    date: new Date(2026, 5, 12, 18, 0),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Skills Exchange: Intro Session",
    hood: "Príncipe Real",
    to: gatheringPath("skills-exchange-intro"),
    kind: "event",
    coverImageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 19,
  },
  {
    date: new Date(2026, 5, 14, 19, 0),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Portfolio Night: Designers & Photogs",
    hood: "Príncipe Real",
    to: gatheringPath("portfolio-night"),
    kind: "event",
    ticketed: true,
    priceMin: 10,
    coverImageUrl:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 61,
  },
  {
    date: new Date(2026, 5, 17, 10, 30),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Queer Parent Network: First Meetup",
    hood: "Estrela",
    to: gatheringPath("queer-parent-network"),
    kind: "event",
    coverImageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 15,
  },
  {
    date: new Date(2026, 5, 18, 18, 30),
    org: "Community",
    orgColor: COMMUNITY,
    title: "LGBTQ+ Support Circle",
    hood: "Intendente",
    to: "/event",
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 5, 20, 18, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Trans Mutual Aid Open Meeting",
    hood: "Mouraria",
    to: gatheringPath("trans-mutual-aid"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 24,
  },
  {
    date: new Date(2026, 5, 21, 15, 0),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Inside Beatriz's Ceramics Studio",
    hood: "Graça",
    to: gatheringPath("studio-visit"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 12,
  },
  {
    date: new Date(2026, 5, 24, 17, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer Elders: Monthly Social",
    hood: "Chiado",
    to: gatheringPath("queer-elders-social"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 20,
  },
  {
    date: new Date(2026, 5, 25, 20, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer Film Screening: Moonlight",
    hood: "Príncipe Real",
    to: "/event",
    kind: "gathering",
    ticketed: true,
    priceMin: 8,
    coverImageUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 55,
  },
  {
    date: new Date(2026, 5, 26, 19, 0),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Wellbeing Q&A: Therapist AMA",
    hood: "Online",
    to: gatheringPath("wellbeing-ama"),
    kind: "event",
    coverImageUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 5, 28, 9, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer Runners: End-of-Month Run",
    hood: "Tejo path",
    to: gatheringPath("queer-runners-run"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 33,
  },
  {
    date: new Date(2026, 6, 2, 8, 30),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Founders & Builders Breakfast",
    hood: "Marvila",
    to: gatheringPath("founders-breakfast"),
    kind: "event",
    ticketed: true,
    priceMin: 15,
    coverImageUrl:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 38,
  },
  {
    date: new Date(2026, 6, 5, 17, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer Youth Network: First Gathering",
    hood: "Arroios",
    to: gatheringPath("queer-youth-gathering"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 26,
  },
  {
    date: new Date(2026, 6, 7, 18, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer Youth: Monthly Gathering",
    hood: "Lisbon",
    to: "/event",
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 6, 9, 18, 30),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Disability & Access: Open Conversation",
    hood: "Online",
    to: gatheringPath("disability-access-talk"),
    kind: "event",
    coverImageUrl:
      "https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 6, 11, 14, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Free Legal Clinic",
    hood: "Intendente",
    to: gatheringPath("legal-clinic"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 6, 14, 19, 0),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer Choir Monthly Rehearsal",
    hood: "Príncipe Real",
    to: gatheringPath("queer-choir-rehearsal"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 22,
  },
  {
    date: new Date(2026, 6, 16, 19, 0),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Resource Library Launch: Live Q&A",
    hood: "Online",
    to: gatheringPath("resource-library-launch"),
    kind: "event",
    coverImageUrl:
      "https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 6, 19, 18, 30),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Peer Support Circle: Open Session",
    hood: "Estrela",
    to: "/event",
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 6, 22, 12, 0),
    org: "QueerPulse",
    orgColor: ACCENT,
    title: "Micro-Grants: Q3 Open Office Hours",
    hood: "Online",
    to: gatheringPath("micro-grants-office-hours"),
    kind: "event",
    coverImageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    date: new Date(2026, 6, 26, 17, 30),
    org: "Community",
    orgColor: COMMUNITY,
    title: "Queer & of Colour: Monthly Gathering",
    hood: "Intendente",
    to: gatheringPath("queer-of-colour-gathering"),
    kind: "gathering",
    coverImageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
    attendeeCount: 31,
  },
];

export const calendarLegend = [
  { labelKey: "gatherings:calendar.legend.queerpulse", color: ACCENT },
  { labelKey: "gatherings:calendar.legend.community", color: COMMUNITY },
];
