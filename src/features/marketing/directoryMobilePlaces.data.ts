import { MEMBERS, memberName } from "../members/data/members";
import { WALKING_TOUR_MEETING_POINT } from "./businessCoords";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  emptyHours,
  normalizeHours,
  type HoursInterval,
} from "./listBusiness/listBusiness.data";
import { emptyMobileDetails } from "./listBusiness/listingMobile.data";
import {
  normalizeOnlineDetails,
  summaryFromDetails,
  toPublicOnlineDetails,
} from "./listBusiness/listingOnline.data";

/** A week open on the given days, closed on the rest. */
function weekOpenOn(openDays: Record<string, HoursInterval>) {
  return normalizeHours(
    Object.fromEntries(
      Object.entries(openDays).map(([day, interval]) => [
        day,
        { open: true, intervals: [interval] },
      ]),
    ),
  );
}

/** A demo online block in its public shape, through the live normaliser. */
function demoOnlineBlock(raw: unknown) {
  const details = toPublicOnlineDetails(normalizeOnlineDetails(raw));
  return { onlineDetails: details, onlineSummary: summaryFromDetails(details) };
}

/**
 * Demo only: businesses with no premises, "out and about". Live mode serves
 * them from the same `GET /directory` feed, flagged `mobile: true`. They join
 * `DIRECTORY_PLACES` at its tail, so the curated order is untouched.
 *
 * One of each case the directory renders: a walking tour with a public
 * meeting point (pinned, with hours, selling tickets online, and running a
 * demo gathering), a hairdresser narrowed to three parishes with hours, and
 * movers across the city who also go to Almada and Oeiras, by appointment
 * only. The two that go to people store no address, neighbourhood or pin,
 * exactly as a live listing without a meeting point does.
 */
export const MOBILE_DIRECTORY_PLACES: DirectoryPlace[] = [
  {
    slug: "lisboa-arco-iris-walks",
    ref: "QPL-DEMO-0101",
    name: "Lisboa Arco-Íris Walks",
    cat: "tours",
    hood: "Mouraria",
    owned: true,
    queerOwnedVerified: true,
    ownedBy: ["women"],
    member: "Inês",
    av: "LA",
    tint: "plum",
    desc: "Queer history on foot through Mouraria and Alfama, from the fado houses to the corner where the first Pride march gathered.",
    tagline: "Two hours, ten streets, a hundred years of queer Lisbon.",
    pills: ["Walking tours", "PT / EN", "€€"],
    rating: { score: "4.8", count: 27 },
    gallery: [
      "Largo da Severa at dusk",
      "The group on the stairs of Mouraria",
      "Old Pride posters",
      "Inês with the map",
    ],
    whatItIs: [
      "Small walking tours of queer Lisbon, led by a historian who grew up in Mouraria. Every walk starts at Largo da Severa and keeps a slow pace, with stops to sit.",
      "Weekend mornings in Portuguese and English, and a Thursday evening walk in summer. Private walks for groups by arrangement.",
    ],
    goodFor: [
      { label: "A first week in Lisbon", yes: true },
      { label: "Groups up to 15", yes: true },
    ],
    hoursType: "appointment",
    hoursNote: "",
    hours: weekOpenOn({
      Thu: { from: "18:00", to: "20:00" },
      Sat: { from: "10:00", to: "12:30" },
      Sun: { from: "10:00", to: "12:30" },
    }),
    langs: ["pt", "en"],
    // The four out-and-about questions show on the page. A tour has no
    // toilets of its own, so those two stay unanswered.
    accessibility: {
      answers: {
        "step-free-entrance": "no",
        "wheelchair-accessible-interior": "no",
        "accessible-toilet": "unknown",
        "gender-neutral-toilet": "unknown",
        "quiet-hours": "yes",
        "assistance-animals-welcome": "yes",
      },
      note: "The route climbs two hills with steps near the castle. The meeting spot by the square is step-free.",
    },
    owner: {
      name: memberName("ines"),
      initials: MEMBERS.ines!.initials,
      tint: "plum",
      role: "Guide · founder",
      bio: "Historian, born two streets from the meeting point. Knows which doors to knock on.",
      inQueerPulse: true,
      first: "Inês",
      slug: "ines",
    },
    social: {
      instagram: "@arcoiris.walks",
      website: "arcoiriswalks.pt",
      email: "ola@arcoiriswalks.pt",
    },
    address: "Largo da Severa, 1100-588 Lisboa",
    latitude: WALKING_TOUR_MEETING_POINT.latitude,
    longitude: WALKING_TOUR_MEETING_POINT.longitude,
    mobile: true,
    mobileDetails: emptyMobileDetails(),
    hasOnlineShop: true,
    ...demoOnlineBlock({
      mainLink: { url: "arcoiriswalks.pt/bilhetes", kind: "booking" },
      payments: ["mbway", "card"],
      replyNote: "Ticket questions answered within a day.",
    }),
    upcoming: [
      {
        when: "Sat 10 Oct · 10:00",
        startAt: "2026-10-10T10:00:00",
        title: "Queer history walk: Mouraria",
        // The demo gathering this tour runs (gatherings/data.ts).
        slug: "queer-history-walk",
        role: "runBy",
      },
    ],
    reviews: [],
  },
  {
    slug: "corte-movel",
    name: "Corte Móvel",
    cat: "grooming",
    hood: "",
    owned: true,
    ownedBy: ["trans"],
    av: "CM",
    tint: "coral",
    desc: "Haircuts and colour at home, for anyone who would rather skip the salon. Gender-neutral pricing.",
    tagline: "The salon comes to you.",
    pills: ["Haircuts at home", "Gender-neutral pricing", "€€"],
    rating: { score: "4.9", count: 18 },
    gallery: [
      "Kit laid out on a towel",
      "A fade in a kitchen",
      "Colour mixing",
      "Alex at work",
    ],
    whatItIs: [
      "Alex cuts and colours hair in your home, with everything brought along and a sheet down before the first snip.",
      "Prices follow the time a cut takes.",
    ],
    goodFor: [
      { label: "First haircut after transition", yes: true },
      { label: "Kids", yes: true },
    ],
    hoursType: "shop",
    hoursNote: "",
    hours: weekOpenOn({
      Tue: { from: "10:00", to: "19:00" },
      Wed: { from: "10:00", to: "19:00" },
      Thu: { from: "10:00", to: "19:00" },
      Fri: { from: "10:00", to: "19:00" },
      Sat: { from: "10:00", to: "19:00" },
    }),
    owner: {
      name: "Alex Moura",
      initials: "AM",
      tint: "coral",
      role: "Hairdresser",
      bio: "Ten years behind a salon chair, three on the road.",
      inQueerPulse: false,
      first: "Alex",
    },
    social: { instagram: "@cortemovel", phone: "+351 912 000 102" },
    address: "",
    latitude: null,
    longitude: null,
    mobile: true,
    mobileDetails: {
      ...emptyMobileDetails(),
      allOfCity: false,
      parishes: ["Arroios", "Estrela", "Penha de França"],
    },
    reviews: [],
  },
  {
    slug: "muda-comigo",
    name: "Muda Comigo",
    cat: "home-services",
    hood: "",
    owned: false,
    av: "MC",
    tint: "jade",
    desc: "Small moves and van hire with two careful movers. Flat-pack built, plants wrapped, stairs no problem.",
    tagline: "Moving day, without the drama.",
    pills: ["Moves and van hire", "€€"],
    rating: { score: "4.7", count: 12 },
    gallery: [
      "The van",
      "Boxes stacked by room",
      "A sofa on the stairs",
      "Plants wrapped for the trip",
    ],
    whatItIs: [
      "A queer-friendly two-person moving crew for flats and studios across Lisbon, and over the river to Almada.",
      "Every move is quoted after a short call, so there are no opening hours: get in touch to book.",
    ],
    goodFor: [
      { label: "Studio and one-bedroom moves", yes: true },
      { label: "Pianos", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "",
    hours: emptyHours(),
    owner: {
      name: "Rui e Kai",
      initials: "RK",
      tint: "jade",
      role: "Movers",
      bio: "Two friends, one van, a lot of boxes.",
      inQueerPulse: false,
      first: "Rui",
    },
    social: { email: "ola@mudacomigo.pt", phone: "+351 913 000 103" },
    address: "",
    latitude: null,
    longitude: null,
    mobile: true,
    mobileDetails: {
      ...emptyMobileDetails(),
      alsoTravelsTo: ["Almada", "Oeiras"],
      byAppointment: true,
    },
    reviews: [],
  },
];
