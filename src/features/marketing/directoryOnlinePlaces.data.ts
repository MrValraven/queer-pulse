import type { DirectoryPlace } from "./directoryPlaces";
import {
  normalizeOnlineDetails,
  summaryFromDetails,
  toPublicOnlineDetails,
} from "./listBusiness/listingOnline.data";

/** A demo online block in its public shape, built through the same
 *  normaliser a live payload goes through. */
function demoOnlineBlock(raw: unknown) {
  const details = toPublicOnlineDetails(normalizeOnlineDetails(raw));
  return { onlineDetails: details, onlineSummary: summaryFromDetails(details) };
}

/**
 * Demo-only: queer-owned businesses that live online, with no door to pin.
 *
 * Live mode serves these from the same `GET /directory` feed as every other
 * listing, flagged `online: true` by the listing wizard's "online only"
 * setting. The demo registry had none, which left the directory's Online tab
 * with nothing to show, so these fill it. They join `DIRECTORY_PLACES` at its
 * tail, so the curated order of the physical places is untouched.
 *
 * Every field an online listing leaves empty in the wizard (address, hours,
 * coordinates, neighbourhood) is left empty here too, so demo exercises the
 * same "nothing to show" paths a real online listing does. Each one carries
 * a "Based in" city (Código Arco leaves it blank, as a migrated listing
 * does) and an online block, so the card's status slot, Visit and the
 * detail page's "Ordering & delivery" all run in demo.
 */
export const ONLINE_DIRECTORY_PLACES: DirectoryPlace[] = [
  {
    slug: "fio-solto",
    name: "Fio Solto",
    cat: "books-music",
    hood: "",
    city: "Lisbon",
    owned: true,
    queerOwnedVerified: true,
    ownedBy: ["nonbinary"],
    av: "FS",
    tint: "coral",
    desc: "A risograph zine shop run from a spare room. Queer comics, poetry and Portuguese-language small press, posted anywhere in Portugal.",
    tagline:
      "Small-press queer zines, printed by hand and posted to your door.",
    pills: ["Zines & small press", "Ships across Portugal", "€"],
    rating: { score: "4.9", count: 31 },
    gallery: [
      "Riso drum, mid-print",
      "Zine wall",
      "Packing table",
      "Stack of first editions",
    ],
    whatItIs: [
      "Fio Solto is a one-person zine shop and riso press. Everything in the catalogue is made by queer artists, most of them working in Portuguese, many of them printing for the first time.",
      "Orders are packed by hand twice a week. If you make zines yourself, there is a standing open call: send a PDF and a note, and every submission gets a reply.",
    ],
    goodFor: [
      { label: "Queer comics in Portuguese", yes: true },
      { label: "A gift that someone actually made", yes: true },
      { label: "First-time zine makers", yes: true },
      { label: "Same-day delivery", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "Sam Ferreira",
      initials: "SF",
      tint: "coral",
      role: "Founder · printer",
      bio: "Prints other people's zines more than their own. Will talk about riso ink for hours.",
      inQueerPulse: true,
      first: "Sam",
    },
    social: {
      instagram: "@fiosolto.zines",
      website: "fiosolto.pt",
      email: "ola@fiosolto.pt",
    },
    address: "",
    online: true,
    ...demoOnlineBlock({
      mainLink: { url: "fiosolto.pt", kind: "shop" },
      moreLinks: [
        { url: "etsy.com/shop/fiosolto", platform: "etsy" },
        { url: "ko-fi.com/fiosolto", platform: "kofi" },
      ],
      fulfilment: ["shipsPortugal", "pickupLisbon"],
      pickupNote: "At Livraria Rosa, Intendente, on Saturdays",
      shipsFrom: "portugal",
      payments: ["mbway", "multibanco", "paypal"],
      replyNote:
        "Orders packed Tuesdays and Fridays. Messages answered within a day.",
    }),
    pricingMode: "shop",
    shopItems: [
      {
        id: "fio-solto-item-1",
        name: "Trans poetry anthology",
        price: "9 EUR",
        link: "fiosolto.pt/loja/antologia",
        photo: {
          image:
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
          alt: "A slim printed book lying open on a table",
          caption: "",
        },
      },
      {
        id: "fio-solto-item-2",
        name: "Riso comic, first edition",
        price: "6 EUR",
        link: "",
        photo: null,
      },
      {
        id: "fio-solto-item-3",
        name: "Five-zine sampler",
        price: "20 EUR",
        link: "fiosolto.pt/loja/sampler",
        photo: null,
      },
    ],
    reviews: [
      {
        id: "fio-solto-review-1",
        initials: "MR",
        name: "Marta R.",
        tint: "jade",
        byline: "she/her · reader",
        stars: 5,
        text: "Ordered three zines and got a handwritten note with each. The trans poetry anthology made me cry on the 28.",
        helpful: 9,
      },
    ],
  },
  {
    slug: "corpo-inteiro-terapia",
    name: "Corpo Inteiro",
    cat: "therapy",
    hood: "",
    city: "Lisbon",
    owned: true,
    queerOwnedVerified: true,
    ownedBy: ["trans"],
    av: "CI",
    tint: "jade",
    desc: "Queer and trans-affirming therapy by video, in Portuguese and English. Sliding-scale places held every month for newcomers.",
    tagline: "Therapy where you don't have to explain yourself first.",
    pills: ["Therapy", "PT & EN", "Sliding scale", "€€"],
    rating: { score: "5.0", count: 18 },
    gallery: [
      "Consulting room, on screen",
      "Reading corner",
      "Window light",
      "Notebook and tea",
    ],
    whatItIs: [
      "Corpo Inteiro is a small online practice of two psychologists, both registered with the Ordem, both queer, one of them trans. Sessions run by video, so it works from Porto, the Algarve, or a flat share in Arroios, and in person in Lisbon for anyone who prefers to meet.",
      "A handful of sliding-scale places open every month, prioritised for people who have just arrived in Portugal or are mid-transition and waiting on the public system.",
    ],
    goodFor: [
      { label: "Gender-affirming support", yes: true },
      { label: "Newcomers to Portugal", yes: true },
      { label: "Couples & polycules", yes: true },
      { label: "Crisis or emergency care", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "Rafa Lopes",
      initials: "RL",
      tint: "jade",
      role: "Psychologist · co-founder",
      bio: "Trans psychologist. Started the practice after waiting eleven months for an appointment of their own.",
      inQueerPulse: true,
      first: "Rafa",
    },
    social: {
      website: "corpointeiro.pt",
      email: "consultas@corpointeiro.pt",
    },
    address: "",
    online: true,
    // The six place answers stay unknown: an online practice is never asked
    // them. The four online ones are mixed, so "Online access" runs in demo.
    accessibility: {
      answers: {
        "step-free-entrance": "unknown",
        "wheelchair-accessible-interior": "unknown",
        "accessible-toilet": "unknown",
        "gender-neutral-toilet": "unknown",
        "quiet-hours": "unknown",
        "assistance-animals-welcome": "unknown",
        "image-descriptions": "no",
        "video-captions": "yes",
        "size-inclusive": "unknown",
        "plain-language": "yes",
      },
      note: "Video sessions can run with live captions in Portuguese or English. Mention it when you book.",
    },
    ...demoOnlineBlock({
      mainLink: { url: "corpointeiro.pt/marcar", kind: "booking" },
      sessionFormats: ["video", "inPerson"],
      registration: { body: "opp", number: "26741" },
      payments: ["mbway", "bankTransfer"],
      replyNote: "Sessions by appointment, weekdays and two evenings a week.",
    }),
    reviews: [
      {
        id: "corpo-inteiro-terapia-review-1",
        initials: "JT",
        name: "Jo T.",
        tint: "plum",
        byline: "they/them · client",
        stars: 5,
        text: "First therapist I didn't have to give a gender studies lecture to. The sliding scale is real, and nobody made me justify it.",
        helpful: 14,
      },
    ],
  },
  {
    slug: "peito-livre",
    name: "Peito Livre",
    cat: "apparel",
    hood: "",
    city: "Guimarães",
    owned: true,
    ownedBy: ["trans", "nonbinary"],
    av: "PL",
    tint: "plum",
    desc: "Binders, tucking wear and swimwear designed and sewn in Portugal, in sizes that start where the big brands stop.",
    tagline:
      "Gender-affirming clothes, cut for real bodies and sewn close to home.",
    pills: [
      "Gender-affirming wear",
      "Made in Portugal",
      "Discreet packaging",
      "€€",
    ],
    rating: { score: "4.8", count: 57 },
    gallery: [
      "Cutting table",
      "Swimwear range",
      "Fit guide",
      "Discreet parcel",
    ],
    whatItIs: [
      "Peito Livre designs binders, tucking underwear and swimwear, and has them sewn by a family workshop in Guimarães. The size range runs well past where imported brands give up.",
      "Every parcel ships in plain packaging with a neutral sender name, and the fit team answers questions by message, so nobody has to guess their size alone.",
    ],
    goodFor: [
      { label: "A first binder", yes: true },
      { label: "Plus sizes", yes: true },
      { label: "Discreet delivery", yes: true },
      { label: "Trying on in person", yes: false },
    ],
    hoursType: "shop",
    hoursNote: "",
    owner: {
      name: "Alex & Noa",
      initials: "PL",
      tint: "plum",
      role: "Co-founders",
      bio: "A trans man and a non-binary seamstress who got tired of binders that didn't fit and swimwear that didn't exist.",
      inQueerPulse: true,
      first: "Alex",
    },
    social: {
      instagram: "@peitolivre",
      website: "peitolivre.pt",
      email: "ajuda@peitolivre.pt",
    },
    address: "",
    online: true,
    ...demoOnlineBlock({
      mainLink: { url: "peitolivre.pt", kind: "shop" },
      moreLinks: [{ url: "vinted.pt/member/peitolivre", platform: "vinted" }],
      fulfilment: ["shipsPortugal", "shipsEu"],
      shipsFrom: "portugal",
      payments: ["card", "paypal", "mbway"],
      replyNote:
        "Orders ship within two working days. Fit questions answered by message.",
    }),
    reviews: [
      {
        id: "peito-livre-review-1",
        initials: "DV",
        name: "Duarte V.",
        tint: "coral",
        byline: "he/him · customer",
        stars: 5,
        text: "Messaged them my measurements, got a size recommendation in an hour, and the binder fits like it was made for me. Because it sort of was.",
        helpful: 22,
      },
    ],
  },
  {
    slug: "codigo-arco",
    name: "Código Arco",
    cat: "digital",
    hood: "",
    city: "",
    owned: true,
    queerOwnedVerified: true,
    ownedBy: ["women"],
    av: "CA",
    tint: "jade",
    desc: "A remote web studio building accessible, bilingual sites for queer collectives, NGOs and the small businesses in this directory.",
    tagline: "Websites that work for everyone, built by people who get it.",
    pills: ["Web studio", "Accessibility audits", "Bilingual PT/EN", "€€"],
    rating: { score: "4.9", count: 12 },
    gallery: [
      "Wireframes on the wall",
      "Screen reader test",
      "Design system",
      "Launch day",
    ],
    whatItIs: [
      "Código Arco is three developers and a designer, working remotely from Lisbon, Porto and Coimbra. They build sites for collectives, associations and queer-owned businesses, with accessibility built into every job from the first sketch.",
      "Collectives with no budget can apply for one pro-bono build a quarter. Everything else is quoted up front, in plain language.",
    ],
    goodFor: [
      { label: "A site for a collective", yes: true },
      { label: "Accessibility audits", yes: true },
      { label: "Bilingual PT/EN content", yes: true },
      { label: "Crypto or ad-tech projects", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "Helena Matos",
      initials: "HM",
      tint: "jade",
      role: "Founder · developer",
      bio: "Builds websites that screen readers can actually use. Ran the tech for two Lisbon Prides.",
      inQueerPulse: true,
      first: "Helena",
    },
    social: {
      website: "codigoarco.pt",
      email: "projetos@codigoarco.pt",
    },
    address: "",
    online: true,
    ...demoOnlineBlock({
      mainLink: { url: "codigoarco.pt", kind: "website" },
      fulfilment: ["digital"],
      payments: ["bankTransfer", "card"],
      replyNote: "Calls by appointment, Monday to Thursday.",
    }),
    reviews: [
      {
        id: "codigo-arco-review-1",
        initials: "CQ",
        name: "Coletivo Quarto",
        tint: "plum",
        byline: "collective · client",
        stars: 5,
        text: "They rebuilt our site for free through the pro-bono round and it's the first one our blind members could use on their own.",
        helpful: 11,
      },
    ],
  },
  {
    slug: "molho-bravo",
    name: "Molho Bravo",
    cat: "food",
    hood: "",
    city: "Setúbal",
    owned: true,
    av: "MB",
    tint: "coral",
    desc: "Small-batch piri-piri and fermented hot sauces, bottled in a shared kitchen and posted across Portugal and the EU.",
    tagline: "Hot sauce with a grudge and a family recipe.",
    pills: ["Hot sauce", "Ships to the EU", "Vegan", "€"],
    rating: { score: "4.7", count: 44 },
    gallery: [
      "Chillies drying",
      "Fermentation jars",
      "Labelling day",
      "The full range",
    ],
    whatItIs: [
      "Molho Bravo started as a grandmother's piri-piri recipe and a queer kitchen's refusal to keep it to themselves. It now runs to six sauces, all fermented for at least a month, all vegan.",
      "Bottled in a shared kitchen in Setúbal and posted twice a week. A cut of every bottle goes to a Lisbon queer food bank.",
    ],
    goodFor: [
      { label: "Gifts that travel well", yes: true },
      { label: "Vegan kitchens", yes: true },
      { label: "Supporting a food bank", yes: true },
      { label: "People who can't take heat", yes: false },
    ],
    hoursType: "shop",
    hoursNote: "",
    owner: {
      name: "André Sousa",
      initials: "AS",
      tint: "coral",
      role: "Founder · cook",
      bio: "Ferments things. Runs the hot sauce, a supper club, and his grandmother's legacy, in roughly that order.",
      inQueerPulse: true,
      first: "André",
    },
    social: {
      instagram: "@molhobravo",
      website: "molhobravo.pt",
    },
    address: "",
    online: true,
    ...demoOnlineBlock({
      mainLink: { url: "molhobravo.pt", kind: "shop" },
      fulfilment: ["shipsPortugal", "shipsEu"],
      shipsFrom: "portugal",
      payments: ["mbway", "card"],
      replyNote: "Orders posted Mondays and Thursdays.",
    }),
    reviews: [
      {
        id: "molho-bravo-review-1",
        initials: "IN",
        name: "Ivo N.",
        tint: "jade",
        byline: "he/him · customer",
        stars: 4,
        text: "The fermented one is ridiculous on eggs. Only docking a star because the 'medium' is a lie, in the best way.",
        helpful: 6,
      },
    ],
  },
  {
    slug: "aulas-kiki",
    name: "Aulas Kiki",
    cat: "classes",
    hood: "",
    city: "Lisbon",
    owned: true,
    queerOwnedVerified: true,
    ownedBy: ["women", "trans"],
    av: "AK",
    tint: "plum",
    desc: "Portuguese lessons by video for queer newcomers, with vocabulary the textbooks leave out: the SNS, the AIMA queue and a night out.",
    tagline: "Portuguese for the life you actually live here.",
    pills: ["Language lessons", "Small groups", "A1 to B2", "€"],
    rating: { score: "4.9", count: 39 },
    gallery: [
      "Group class on screen",
      "Flashcards",
      "Conversation night",
      "Lesson notes",
    ],
    whatItIs: [
      "Aulas Kiki teaches European Portuguese online, in small groups of queer and trans newcomers. Lessons cover the things you need first: talking to a GP, filling in forms with the right pronouns, and holding your own at a bar.",
      "Groups cap at six. Questions between lessons are answered by chat, and a monthly free conversation night is open to anyone, whatever their level.",
    ],
    goodFor: [
      { label: "Newcomers to Lisbon", yes: true },
      { label: "Learning with people like you", yes: true },
      { label: "Exam preparation", yes: true },
      { label: "Brazilian Portuguese", yes: false },
    ],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "Beatriz Nunes",
      initials: "BN",
      tint: "plum",
      role: "Teacher · founder",
      bio: "Trans woman, language teacher, former newcomer herself (to Lisbon, from Viseu). Patient with verbs and people.",
      inQueerPulse: true,
      first: "Beatriz",
    },
    social: {
      instagram: "@aulaskiki",
      website: "aulaskiki.pt",
      email: "ola@aulaskiki.pt",
    },
    address: "",
    online: true,
    ...demoOnlineBlock({
      mainLink: { url: "aulaskiki.pt/marcar", kind: "booking" },
      moreLinks: [{ url: "aulaskiki.substack.com", platform: "substack" }],
      sessionFormats: ["video", "chat"],
      payments: ["mbway", "paypal"],
      replyNote:
        "Group classes on weekday evenings. Private lessons by appointment.",
    }),
    reviews: [
      {
        id: "aulas-kiki-review-1",
        initials: "LK",
        name: "Lee K.",
        tint: "coral",
        byline: "she/they · student",
        stars: 5,
        text: "Three months in and I booked my own doctor's appointment in Portuguese. Beatriz made the grammar feel survivable.",
        helpful: 17,
      },
    ],
  },
];

/**
 * Demo-only: one 18+ listing, so the "Show 18+ shops" chip, the 18+ detail
 * page and its `noindex` all run in demo. Kept out of `DIRECTORY_PLACES` (and
 * so out of every whole-catalogue reader) because no public read ever returns
 * one; `useAdultDirectoryPlaces` and the signed-in detail read are its only
 * ways in. Its copy is safe for work, as the category's rules require.
 */
export const ADULT_ONLINE_DIRECTORY_PLACES: DirectoryPlace[] = [
  {
    slug: "toque-macio",
    name: "Toque Macio",
    cat: "intimacy",
    hood: "",
    city: "London",
    owned: true,
    isAdultsOnly: true,
    av: "TM",
    tint: "plum",
    desc: "Body-safe intimacy products and small-press zines about pleasure and consent, posted in plain packaging.",
    tagline: "Pleasure, consent and good materials, posted discreetly.",
    pills: ["Plain packaging", "€€"],
    // No reviews yet, so no score: a rating with nothing behind it would
    // claim feedback the page cannot show.
    rating: { score: "0", count: 0 },
    gallery: ["Product shelf", "Zine stack", "Packing table", "Plain parcel"],
    whatItIs: [
      "Toque Macio stocks body-safe products from small makers and publishes zines on pleasure, consent and bodies that rarely get written about.",
      "Everything ships in plain packaging with a neutral sender name. Questions about materials and sizes are answered by message.",
    ],
    goodFor: [
      { label: "Body-safe materials", yes: true },
      { label: "Discreet delivery", yes: true },
    ],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "Toque Macio",
      initials: "TM",
      tint: "plum",
      role: "Founder",
      bio: "",
      inQueerPulse: false,
      first: "",
    },
    social: { website: "toquemacio.example" },
    address: "",
    online: true,
    ...demoOnlineBlock({
      mainLink: { url: "toquemacio.example/shop", kind: "shop" },
      fulfilment: ["shipsPortugal", "shipsEu"],
      shipsFrom: "outsideEu",
      isVatIncluded: false,
      payments: ["card", "paypal"],
      replyNote: "Orders posted within two working days.",
    }),
    reviews: [],
  },
];
