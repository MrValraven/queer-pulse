import type { SubprofileItemDTO } from "../api/subprofiles.api";
import { gatheringDetails } from "../../gatherings/data";
import { localIsoDate } from "../skins/tattoo/tattooView.helpers";

// ── Items of the demo tattoo persona (Inkwell) ───────────────────────────────
// Twelve sections, every one filled. Body photos carry explicit consent and
// blur flags, as the public DTO would. Guest spot and flash day dates are
// relative to the day the demo loads, so "past", "running now" and "later"
// hold whatever day it runs.

const DEMO_CREATED_AT = "2026-10-01T10:00:00.000Z";
const DAY_IN_MILLISECONDS = 86_400_000;

function isoDayFromToday(dayOffset: number): string {
  return localIsoDate(new Date(Date.now() + dayOffset * DAY_IN_MILLISECONDS));
}

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?q=80&w=800&auto=format&fit=crop`;
}

const PHOTO_INK_PAPER = unsplash("1513364776144-60967b0f800f");
const PHOTO_ABSTRACT = unsplash("1541961017774-22349e4a1262");
const PHOTO_LEAVES = unsplash("1518609878373-06d740f60d8b");
const PHOTO_TEXTURE = unsplash("1544716278-ca5e3f4abd8c");
const PHOTO_STUDIO = unsplash("1503951914875-452162b0f3f1");
const PHOTO_PRINTS = unsplash("1586023492125-27b2c045efd7");
const PHOTO_DESK = unsplash("1516450360452-9312f5e86fc7");

function item(
  id: string,
  section: SubprofileItemDTO["section"],
  title: string,
  rest: Partial<SubprofileItemDTO> = {},
): SubprofileItemDTO {
  return {
    id: `itm-inkwell-${id}`,
    section,
    title,
    createdAt: DEMO_CREATED_AT,
    tags: [],
    isFeatured: false,
    collaborators: [],
    ...rest,
  };
}

const FLASH_ITEMS: SubprofileItemDTO[] = [
  item("flash-moth", "flash", "Moth with a small moon", {
    imageUrl: PHOTO_INK_PAPER,
    isFeatured: true,
    description: "my favourite sheet this year and i keep redrawing the wings",
    structured: {
      flash: {
        availability: "available",
        size: "8 cm",
        price: "120",
        placements: ["forearm", "calf"],
      },
    },
  }),
  item("flash-snake", "flash", "Snake around a candle", {
    imageUrl: PHOTO_ABSTRACT,
    structured: {
      flash: {
        availability: "claimed",
        size: "12 cm",
        price: "180",
        placements: ["thigh"],
      },
    },
  }),
  item("flash-fern", "flash", "Fern pair", {
    imageUrl: PHOTO_LEAVES,
    structured: {
      flash: {
        availability: "repeatable",
        size: "6 cm",
        price: "90",
        placements: ["ankle", "forearm"],
      },
    },
  }),
];

const HEALED_ITEMS: SubprofileItemDTO[] = [
  item("healed-fern", "healed", "Fern on the inner arm", {
    imageUrl: PHOTO_LEAVES,
    structured: {
      healed: {
        healedFor: "2 years",
        placement: "inner arm",
        skinTone: "deep",
      },
      photo: { hasClientConsent: true, isBlurred: false },
    },
  }),
  item("healed-moon", "healed", "Moon phases on the shoulder", {
    imageUrl: PHOTO_TEXTURE,
    structured: {
      healed: { healedFor: "8 months", placement: "shoulder" },
      photo: { hasClientConsent: true, isBlurred: false },
    },
  }),
];

const WANNA_DO_ITEMS: SubprofileItemDTO[] = [
  item("wanna-do-bees", "wanna_dos", "A swarm of small bees", {
    description: "tiny and a bit chaotic and i would love a ribcage for it",
    structured: { flash: { size: "3 cm each", placements: ["ribs", "back"] } },
  }),
  item("wanna-do-tarot", "wanna_dos", "Tarot cards in a fan", {
    description: "fine line and a little gold feeling even in black ink",
    structured: { flash: { size: "15 cm", placements: ["thigh"] } },
  }),
];

const PROJECT_ITEMS: SubprofileItemDTO[] = [
  item("project-garden", "in_progress", "Garden sleeve, three sittings in", {
    imageUrl: PHOTO_LEAVES,
    description:
      "outline first and then the shading and then a quiet day for the details",
    structured: {
      sessions: [
        { imageUrl: PHOTO_INK_PAPER, date: "2026-07-12", note: "outline" },
        { imageUrl: PHOTO_TEXTURE, date: "2026-08-23", note: "shading" },
        { imageUrl: PHOTO_LEAVES, date: "2026-09-27", note: "details" },
      ],
      photo: { hasClientConsent: true, isBlurred: false },
    },
  }),
];

const COVER_UP_ITEMS: SubprofileItemDTO[] = [
  item("cover-up-koi", "cover_ups", "An old name turned into a koi", {
    imageUrl: PHOTO_ABSTRACT,
    structured: {
      coverUp: { type: "cover_up", beforeImageUrl: PHOTO_TEXTURE },
      photo: { hasClientConsent: true, isBlurred: false },
    },
  }),
];

const SCAR_WORK_ITEMS: SubprofileItemDTO[] = [
  item("scar-work-vines", "scar_work", "Vines over a surgery scar", {
    imageUrl: PHOTO_LEAVES,
    description: "soft lines that follow the scar and nothing that fights it",
    structured: {
      scarWork: { type: "top_surgery" },
      photo: { hasClientConsent: true, isBlurred: true },
    },
  }),
  item("scar-work-stars", "scar_work", "Stars across stretch marks", {
    imageUrl: PHOTO_TEXTURE,
    structured: {
      scarWork: { type: "stretch_marks" },
      photo: { hasClientConsent: true, isBlurred: false },
    },
  }),
];

const AFTERCARE_ITEMS: SubprofileItemDTO[] = [
  item("aftercare-wrap", "aftercare", "Leave the wrap on for 3 hours", {
    description: "then wash with lukewarm water and unscented soap and pat dry",
  }),
  item("aftercare-balm", "aftercare", "A thin layer of balm", {
    description: "twice a day for the first week and less is more",
  }),
  item("aftercare-sun", "aftercare", "No sun and no pool for 3 weeks", {
    description: "and no scratching even when it itches like crazy",
  }),
  item("aftercare-message", "aftercare", "Message me if something feels off", {
    description: "send me a photo on day 5 and i will tell you what i see",
  }),
];

const CREDENTIAL_ITEMS: SubprofileItemDTO[] = [
  item(
    "credential-licence",
    "credentials",
    "Licensed tattoo artist, Portugal",
    {
      subtitle: "Direção-Geral da Saúde",
      date: "2019",
    },
  ),
  item("credential-pathogens", "credentials", "Bloodborne pathogens course", {
    subtitle: "Renewed every year",
    date: "2026",
  }),
];

const GUEST_SPOT_ITEMS: SubprofileItemDTO[] = [
  item("guest-spot-porto", "guest_spots", "Casa Corvo", {
    subtitle: "Porto",
    date: isoDayFromToday(-40),
    structured: {
      spot: { type: "guest_spot", endDate: isoDayFromToday(-36) },
    },
  }),
  item("guest-spot-lisbon", "guest_spots", "Tinta Viva", {
    subtitle: "Lisbon",
    date: isoDayFromToday(-1),
    structured: {
      spot: { type: "guest_spot", endDate: isoDayFromToday(3) },
    },
  }),
  item("guest-spot-berlin", "guest_spots", "Ink and Iris convention", {
    subtitle: "Berlin",
    date: isoDayFromToday(60),
    structured: {
      spot: { type: "convention", endDate: isoDayFromToday(62) },
    },
  }),
];

const LINKED_EVENT_SLUG = "portfolio-night";
const linkedEventDetail = gatheringDetails[LINKED_EVENT_SLUG];
if (!linkedEventDetail) {
  throw new Error(
    `Demo event "${LINKED_EVENT_SLUG}" is missing from gatheringDetails`,
  );
}

const FLASH_DAY_ITEMS: SubprofileItemDTO[] = [
  item("flash-day-portfolio", "flash_days", "Flash day at Portfolio Night", {
    subtitle: "Príncipe Real",
    date: localIsoDate(linkedEventDetail.date),
    description:
      "ten small pieces and first come first served and tea for everyone waiting",
    structured: {
      flashDay: {
        eventSlug: LINKED_EVENT_SLUG,
        cause: "Proceeds go to a trans mutual aid fund",
      },
    },
    linkedEvent: {
      slug: LINKED_EVENT_SLUG,
      title: linkedEventDetail.title,
      startsAt: linkedEventDetail.date.toISOString(),
      endsAt: new Date(
        linkedEventDetail.date.getTime() + 3 * 60 * 60 * 1000,
      ).toISOString(),
      venue: null,
      neighbourhood: linkedEventDetail.hood,
      isOnline: false,
      imageUrl: linkedEventDetail.coverImageUrl ?? null,
    },
  }),
  item("flash-day-plain", "flash_days", "Friday the 13th flash", {
    subtitle: "Estúdio Fio, Alvalade",
    date: "2027-08-13",
    url: "https://example.com/inkwell/friday-13th",
    description: "classic sheet and cheap prices and a long line so come early",
    structured: { flashDay: {} },
  }),
];

const SHOP_ITEMS: SubprofileItemDTO[] = [
  item("shop-print", "shop", "Moth print, A4", {
    imageUrl: PHOTO_PRINTS,
    url: "https://example.com/inkwell/shop/moth-print",
    structured: { shop: { type: "print", price: "25" } },
  }),
  item("shop-flash-sheet", "shop", "Flash sheet, autumn", {
    imageUrl: PHOTO_INK_PAPER,
    url: "https://example.com/inkwell/shop/flash-sheet",
    structured: { shop: { type: "flash_sheet", price: "15" } },
  }),
  item("shop-stickers", "shop", "Sticker pack", {
    imageUrl: PHOTO_DESK,
    url: "https://example.com/inkwell/shop/stickers",
    structured: { shop: { type: "sticker", price: "6" } },
  }),
];

const GALLERY_ITEMS: SubprofileItemDTO[] = [
  item("gallery-studio", "gallery", "The studio in the morning", {
    imageUrl: PHOTO_STUDIO,
  }),
  item("gallery-desk", "gallery", "Drawing desk", { imageUrl: PHOTO_DESK }),
  item("gallery-paper", "gallery", "Sketches before they become flash", {
    imageUrl: PHOTO_INK_PAPER,
  }),
];

export const TATTOO_ARTIST_DEMO_ITEMS: SubprofileItemDTO[] = [
  ...FLASH_ITEMS,
  ...HEALED_ITEMS,
  ...WANNA_DO_ITEMS,
  ...PROJECT_ITEMS,
  ...COVER_UP_ITEMS,
  ...SCAR_WORK_ITEMS,
  ...AFTERCARE_ITEMS,
  ...CREDENTIAL_ITEMS,
  ...GUEST_SPOT_ITEMS,
  ...FLASH_DAY_ITEMS,
  ...SHOP_ITEMS,
  ...GALLERY_ITEMS,
];
