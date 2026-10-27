import type { TFunction } from "../../../../shared/i18n/types";
import type { DirectoryPlace, Review } from "../../directoryPlaces";
import type { ListingCoManagerDTO } from "../../listBusiness/api/listingCoManagers.api";
import type { ListingKind } from "../../listBusiness/listingMobile.data";
import { sampleDateTime } from "../shared/sampleDates";

/**
 * The sample business the businesses page shows in the real directory
 * components. Fictional through and through: the name, the people and the
 * street are made up for this page, and the photos are stock images the demo
 * fixtures already use. Every sentence goes through `t()`, so a pt visitor
 * reads the sample in pt. No price band, no hours (a card would print "Closed
 * now" at night), no social links. The detail-only fields (tagline, the
 * owner's role and bio) stay empty: the card never shows them.
 */

/** The sample business's name. A grep of the repo found no other use. */
export const SAMPLE_BUSINESS_NAME = "Café Andorinha";

const SAMPLE_SLUG = "sample-cafe-andorinha";

const CAFE_INTERIOR_PHOTO =
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=1200&auto=format&fit=crop";
const COFFEE_CUP_PHOTO =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop";

/** What changes with the shape of the business; the rest stays the same. */
function kindFields(t: TFunction, kind: ListingKind): Partial<DirectoryPlace> {
  if (kind === "online") {
    return {
      online: true,
      hood: "",
      city: "Lisboa",
      desc: t("forBusinesses:sample.online.desc"),
      highlights: ["local-makers", "gift-wrapping"],
      onlineSummary: {
        mainLink: null,
        fulfilment: ["shipsPortugal"],
        sessionFormats: [],
      },
      photos: { wide: COFFEE_CUP_PHOTO, d1: null, d2: null, vibe: null },
      alt: {
        wide: t("forBusinesses:sample.online.photoAlt"),
        d1: "",
        d2: "",
        vibe: "",
      },
    };
  }
  if (kind === "mobile") {
    return {
      mobile: true,
      hood: "",
      desc: t("forBusinesses:sample.mobile.desc"),
      highlights: ["vegan-options", "made-to-order"],
      mobileDetails: {
        allOfCity: true,
        parishes: [],
        alsoTravelsTo: ["Almada", "Oeiras"],
        byAppointment: true,
      },
      photos: { wide: COFFEE_CUP_PHOTO, d1: null, d2: null, vibe: null },
      alt: {
        wide: t("forBusinesses:sample.mobile.photoAlt"),
        d1: "",
        d2: "",
        vibe: "",
      },
    };
  }
  return {
    hood: "Arroios",
    address: t("forBusinesses:sample.place.street"),
    desc: t("forBusinesses:sample.place.desc"),
    highlights: ["vegan-options", "laptop-friendly", "quiet-corner"],
    hostsGatherings: true,
    photos: { wide: CAFE_INTERIOR_PHOTO, d1: null, d2: null, vibe: null },
    alt: {
      wide: t("forBusinesses:sample.place.photoAlt"),
      d1: "",
      d2: "",
      vibe: "",
    },
  };
}

/** The one review the page shows, with the owner's reply under it, dated
 *  a week or so before `today`. */
export function buildSampleReview(t: TFunction, today: Date): Review {
  return {
    id: `${SAMPLE_SLUG}-review-1`,
    initials: "MC",
    name: "Marisa C.",
    tint: "jade",
    byline: t("forBusinesses:sample.review.byline"),
    stars: 5,
    text: t("forBusinesses:sample.review.text"),
    helpful: 3,
    createdAt: sampleDateTime(today, -9, 16).toISOString(),
    ownerReply: {
      text: t("forBusinesses:sample.review.reply"),
      at: sampleDateTime(today, -8, 10).toISOString(),
    },
  };
}

/**
 * The sample business in one of its three shapes: a café people visit, an
 * online roaster, or a coffee bike that comes to you. `today` keeps the
 * review dates recent whenever the page is opened.
 */
export function buildSampleBusiness(
  t: TFunction,
  kind: ListingKind,
  today: Date,
): DirectoryPlace {
  return {
    slug: SAMPLE_SLUG,
    name: SAMPLE_BUSINESS_NAME,
    cat: "food",
    hood: "",
    owned: true,
    ownedBy: ["trans", "migrant"],
    av: "CA",
    tint: "coral",
    desc: "",
    tagline: "",
    rating: { score: "4.8", count: 12 },
    gallery: [],
    whatItIs: [],
    price: "",
    accessibility: {
      answers: {
        "step-free-entrance": "yes",
        "wheelchair-accessible-interior": "yes",
        "accessible-toilet": "unknown",
        "gender-neutral-toilet": "yes",
        "quiet-hours": "no",
        "assistance-animals-welcome": "yes",
      },
      note: null,
    },
    affirmingBaseline: {
      isAccepted: true,
      acceptedAt: sampleDateTime(today, -60, 9).toISOString(),
    },
    hoursType: "cafe",
    hoursNote: "",
    owner: {
      name: "Leonor Brás",
      initials: "LB",
      tint: "coral",
      role: "",
      bio: "",
      inQueerPulse: true,
      first: "Leonor",
    },
    social: {},
    address: "",
    reviews: [buildSampleReview(t, today)],
    ...kindFields(t, kind),
  };
}

/** One message of a sample business-inbox thread. `side` is the reader's:
 *  "me" is the person holding the phone, "them" the other end. */
export interface SampleThreadMessage {
  messageId: string;
  side: "me" | "them";
  text: string;
  /** The staff member who wrote a business reply, when attribution names
   *  them. Absent on the customer's own messages and on the reader's own. */
  staffFirstName?: string;
}

/** The customer's view: they ask, the business answers, a first name beside
 *  the reply. */
export function buildSampleThread(
  t: TFunction,
): readonly SampleThreadMessage[] {
  return [
    {
      messageId: "customer-1",
      side: "me",
      text: t("forBusinesses:sample.thread.ask"),
    },
    {
      messageId: "business-1",
      side: "them",
      text: t("forBusinesses:sample.thread.answer"),
      staffFirstName: "Duarte",
    },
    {
      messageId: "customer-2",
      side: "me",
      text: t("forBusinesses:sample.thread.thanks"),
    },
  ];
}

/** The team's view of the same inbox: a customer asks, a colleague has
 *  answered (with "Sent by" over it), and the reader follows up themselves. */
export function buildSampleTeamThread(
  t: TFunction,
): readonly SampleThreadMessage[] {
  return [
    {
      messageId: "team-1",
      side: "them",
      text: t("forBusinesses:sample.team.ask"),
    },
    {
      messageId: "team-2",
      side: "me",
      text: t("forBusinesses:sample.team.colleague"),
      staffFirstName: "Leonor",
    },
    {
      messageId: "team-3",
      side: "me",
      text: t("forBusinesses:sample.team.own"),
    },
  ];
}

/** Two people on the listing's co-manager roster: one who already edits, one
 *  invitation still waiting. Fictional members with initials avatars. */
export function buildSampleCoManagers(
  today: Date,
): readonly ListingCoManagerDTO[] {
  return [
    {
      id: "sample-co-manager-1",
      member: { slug: "sample-duarte", firstName: "Duarte", lastName: "Melo" },
      status: "active",
      invitedBy: null,
      invitedAt: sampleDateTime(today, -50, 11).toISOString(),
      acceptedAt: sampleDateTime(today, -49, 18).toISOString(),
      endedAt: null,
    },
    {
      id: "sample-co-manager-2",
      member: { slug: "sample-tome", firstName: "Tomé", lastName: "Abreu" },
      status: "invited",
      invitedBy: null,
      invitedAt: sampleDateTime(today, -2, 15).toISOString(),
      acceptedAt: null,
      endedAt: null,
    },
  ];
}
