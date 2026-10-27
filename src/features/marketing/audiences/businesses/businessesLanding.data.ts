import type { IconType } from "react-icons";
import {
  FiAtSign,
  FiCalendar,
  FiCheckCircle,
  FiEdit3,
  FiGlobe,
  FiInbox,
  FiKey,
  FiMapPin,
  FiMessageCircle,
  FiMessageSquare,
  FiNavigation,
  FiShield,
  FiStar,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import type { ListingKind } from "../../listBusiness/listingMobile.data";
import type {
  AudienceFaqItem,
  AudienceListItem,
  AudiencePoint,
} from "../shared/audiences.data";

/**
 * The static content of the businesses page: which walkthrough steps it
 * tells, the scatter it starts from, the before/after rows, the safety
 * points, the questions and the "Try it" kinds. Every claim here was checked
 * against the code (see the report that shipped with this page).
 */

/** The three shapes of a listing, in the wizard's own order, with the
 *  wizard's own titles. */
export interface BusinessKindOption {
  id: ListingKind;
  labelKey: string;
  Icon: IconType;
}

export const BUSINESS_KIND_OPTIONS: readonly BusinessKindOption[] = [
  {
    id: "place",
    labelKey: "marketing:listBusiness.step0.whereFound.place.title",
    Icon: FiMapPin,
  },
  {
    id: "online",
    labelKey: "marketing:listBusiness.step0.whereFound.online.title",
    Icon: FiGlobe,
  },
  {
    id: "mobile",
    labelKey: "marketing:listBusiness.step0.whereFound.mobile.title",
    Icon: FiNavigation,
  },
];

/** The wizard's first question, as the walkthrough's first step shows it. */
export const WHERE_FOUND_DESC_KEYS: Record<ListingKind, string> = {
  place: "marketing:listBusiness.step0.whereFound.place.desc",
  online: "marketing:listBusiness.step0.whereFound.online.desc",
  mobile: "marketing:listBusiness.step0.whereFound.mobile.desc",
};

/** One scrap of "where it all lives today". */
export interface BusinessScatterItem {
  itemId: string;
  titleKey: string;
  bodyKey: string;
  Icon: IconType;
}

export const BUSINESS_SCATTER_ITEMS: readonly BusinessScatterItem[] = [
  {
    itemId: "social",
    titleKey: "forBusinesses:scatter.social.title",
    bodyKey: "forBusinesses:scatter.social.body",
    Icon: FiAtSign,
  },
  {
    itemId: "pin",
    titleKey: "forBusinesses:scatter.pin.title",
    bodyKey: "forBusinesses:scatter.pin.body",
    Icon: FiMapPin,
  },
  {
    itemId: "messages",
    titleKey: "forBusinesses:scatter.messages.title",
    bodyKey: "forBusinesses:scatter.messages.body",
    Icon: FiMessageCircle,
  },
  {
    itemId: "reviews",
    titleKey: "forBusinesses:scatter.reviews.title",
    bodyKey: "forBusinesses:scatter.reviews.body",
    Icon: FiStar,
  },
];

export const BUSINESS_BEFORE_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "details",
    labelKey: "forBusinesses:allInOne.before.details",
    Icon: FiEdit3,
  },
  {
    itemId: "password",
    labelKey: "forBusinesses:allInOne.before.password",
    Icon: FiKey,
  },
  {
    itemId: "apps",
    labelKey: "forBusinesses:allInOne.before.apps",
    Icon: FiMessageSquare,
  },
  {
    itemId: "reviews",
    labelKey: "forBusinesses:allInOne.before.reviews",
    Icon: FiStar,
  },
];

export const BUSINESS_AFTER_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "listing",
    labelKey: "forBusinesses:allInOne.after.listing",
    Icon: FiTag,
  },
  {
    itemId: "team",
    labelKey: "forBusinesses:allInOne.after.team",
    Icon: FiUsers,
  },
  {
    itemId: "inbox",
    labelKey: "forBusinesses:allInOne.after.inbox",
    Icon: FiInbox,
  },
  {
    itemId: "replies",
    labelKey: "forBusinesses:allInOne.after.replies",
    Icon: FiCheckCircle,
  },
  {
    itemId: "events",
    labelKey: "forBusinesses:allInOne.after.events",
    Icon: FiCalendar,
  },
];

export const BUSINESS_SAFETY_POINTS: readonly AudiencePoint[] = [
  {
    pointId: "claims",
    titleKey: "forBusinesses:safety.claims.title",
    bodyKey: "forBusinesses:safety.claims.body",
    Icon: FiShield,
  },
  {
    pointId: "replies",
    titleKey: "forBusinesses:safety.replies.title",
    bodyKey: "forBusinesses:safety.replies.body",
    Icon: FiMessageSquare,
  },
];

export const BUSINESS_FAQ_ITEMS: readonly AudienceFaqItem[] = [
  {
    faqId: "who-sees",
    questionKey: "forBusinesses:faq.whoSees.question",
    answerKey: "forBusinesses:faq.whoSees.answer",
  },
  {
    faqId: "team",
    questionKey: "forBusinesses:faq.team.question",
    answerKey: "forBusinesses:faq.team.answer",
  },
  {
    faqId: "no-premises",
    questionKey: "forBusinesses:faq.noPremises.question",
    answerKey: "forBusinesses:faq.noPremises.answer",
  },
  {
    faqId: "already-listed",
    questionKey: "forBusinesses:faq.alreadyListed.question",
    answerKey: "forBusinesses:faq.alreadyListed.answer",
  },
];
