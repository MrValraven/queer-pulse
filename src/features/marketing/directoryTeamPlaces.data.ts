import type { DirectoryPlace } from "./directoryPlaces";

// Demo business with a team: Tinta Viva, a tattoo studio whose artists show on
// its page as "Meet the team". The team rows come from the demo store
// (`listBusiness/api/listingTeam.demo.ts`); this fixture carries the listing.
// Modelled field for field on the `studio-cabelo` fixture.

export const TEAM_DIRECTORY_PLACES: DirectoryPlace[] = [
  {
    slug: "tinta-viva",
    name: "Tinta Viva",
    cat: "grooming",
    hood: "Anjos",
    owned: true,
    ownedBy: ["trans"],
    av: "TV",
    tint: "jade",
    desc: "A tattoo studio where every artist is queer. Custom pieces, flash days and a private space for placements you'd rather keep off the street.",
    tagline: "Pick the artist first. Every one of them is queer.",
    price: "€€",
    attributes: ["priced-by-service", "private-room"],
    highlights: ["private-room"],
    entryMode: "bookingRecommended",
    payments: ["card", "mbway"],
    issuesNifInvoices: true,
    langs: ["pt", "en"],
    rating: { score: "4.8", count: 21 },
    gallery: [
      "The flash wall",
      "Artist stations",
      "The private space",
      "Anjos doorway",
    ],
    whatItIs: [
      "Tinta Viva opened with one rule for the whole team: every artist in the chair is queer. You choose the artist first, look through their work, and book the person whose lines speak to you.",
      "Custom pieces fill most weeks and flash days fill the rest. Placements you would like to keep private get their own quiet space at the back, with the door closed and the music low.",
    ],
    hoursType: "shop",
    hoursNote: "Tue to Sat. Booking advised.",
    owner: {
      name: "Joana Prates",
      initials: "JP",
      tint: "jade",
      role: "Owner",
      bio: "Opened the studio so every artist in the chair is queer.",
      inQueerPulse: false,
      first: "Joana",
    },
    address: "R. dos Anjos 61 · Anjos",
    social: { instagram: "@tintaviva.lx" },
    reviews: [],
  },
];
