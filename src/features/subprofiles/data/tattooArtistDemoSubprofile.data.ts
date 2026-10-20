import { memberName } from "../../members/data/members";
import type { DemoSubprofile } from "./subprofiles.data";
import { TATTOO_ARTIST_DEMO_ITEMS } from "./tattooArtistDemoItems.data";

// ── Demo tattoo artist persona ───────────────────────────────────────────────
// Inkwell, every block of the tattoo page filled (`/p/inkwell-mariana`). Linked
// to its owner so the flash day may link an event. The four Tinta Viva artists
// in `tattooDemoSubprofiles.data.ts` stay empty on purpose.

export const TATTOO_ARTIST_DEMO_SUBPROFILE: DemoSubprofile = {
  ownerSlug: "mariana",
  ownerName: memberName("mariana"),
  id: "sp-mariana-inkwell",
  kind: "tattoo_artist",
  slug: "inkwell-mariana",
  handle: "inkwell-mariana",
  displayName: "Inkwell",
  avatarUrl:
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
  tagline: "Fine line and botanical tattoos in a quiet Lisbon studio",
  bio: "i draw small plants and moths and whatever you bring me in your head and i tattoo them slow and gentle and you can take a break whenever you need it, i have been doing this since 2019 and i love scar work most of all",
  coverUrl:
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop",
  accent: "plum",
  availability: "booking",
  ctaLabel: "Ask about a tattoo",
  ctaUrl: null,
  socialLinks: [{ platform: "instagram", urlOrHandle: "@inkwell.mariana" }],
  linkVisibility: "linked",
  visibility: "open",
  status: "published",
  position: 3,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 27,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  skinData: {
    tattoo: {
      status: "waitlist",
      nextOpening: "2026-11-03",
      waitNote:
        "books reopen early november and the waitlist gets the first message",
    },
    tattooBooking: {
      route: "instagram",
      whatToSend: ["idea", "placement", "size", "references"],
      consultation: "both",
      replyTime: "within 3 days",
    },
    tattooStyles: {
      styles: [
        "fine_line",
        "ornamental",
        "illustrative",
        "handpoke",
        "tiny gardens",
      ],
      colour: "black_grey",
      minSize: "3 cm",
      doesNotDo: ["names and dates", "hands and faces"],
    },
    tattooPrices: {
      minimum: "80",
      hourly: "110",
      dayRate: "600",
      deposit: {
        amount: "50",
        isRefundable: false,
        note: "goes toward the final price and moves to a new date if you tell me a week before",
      },
      cancellation: "tell me 7 days before and we move it for free",
      touchUps: { isFree: true, months: "3" },
    },
    tattooComfort: {
      options: [
        "chosen_name_pronouns",
        "breaks_any_time",
        "bring_someone",
        "trauma_informed",
        "body_neutral_size_inclusive",
      ],
      note: "tell me what helps and i will do it and you can skip the explaining",
    },
    tattooHygiene: {
      practices: [
        "single_use_needles",
        "licensed_studio",
        "autoclave_sterilisation",
        "vegan_inks",
      ],
    },
    tattooScarWork: {
      intro:
        "scars are skin that went through something and i like working with that, the first chat is free and we go as slow as you want",
      hasFreeConsult: true,
      hasReducedPrice: true,
      reducedPriceNote: "30 percent off for top surgery and self harm scars",
    },
    tattooStudio: {
      city: "Lisbon",
      isPrivateStudio: true,
      isByAppointmentOnly: true,
    },
    tattooLineage: {
      trainedWith: "Teresa Bastos at Estúdio Fio in Lisbon",
      tattooingSince: "2019",
      isTakingApprentices: false,
      teaches: ["Fine line basics", "Aftercare for new artists"],
    },
    venue: {
      name: "Estúdio Fio",
      lines: ["Rua da Madalena 120", "1100-319 Lisbon"],
    },
    faq: [
      {
        question: "Can I bring a friend",
        answer: "yes please and they can hold your hand or your bag or both",
      },
      {
        question: "Do you tattoo over scars",
        answer:
          "i do and we talk first and i test a little line before the real thing",
      },
      {
        question: "How do I pay the deposit",
        answer: "i send a link after we pick a date and it takes a minute",
      },
    ],
  },
  items: TATTOO_ARTIST_DEMO_ITEMS,
};
