import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiClipboard,
  FiDollarSign,
  FiEye,
  FiFileText,
  FiFolder,
  FiGrid,
  FiHeart,
  FiImage,
  FiLink,
  FiLock,
  FiLogIn,
  FiMessageCircle,
  FiMessageSquare,
  FiMusic,
  FiShield,
  FiTag,
  FiUserCheck,
  FiUsers,
  FiVolume2,
  FiZap,
} from "react-icons/fi";
import type { AccessTier } from "../../../communities/membership.types";
import type {
  AudienceFaqItem,
  AudienceListItem,
  AudiencePoint,
} from "../shared/audiences.data";

/** The four moments of an event's life the "Try it" switch steps through. */
export type EventLifecycleState = "announce" | "lineup" | "doors" | "photos";

export const EVENT_LIFECYCLE_STATES: readonly EventLifecycleState[] = [
  "announce",
  "lineup",
  "doors",
  "photos",
];

export const LIFECYCLE_ICONS: Record<EventLifecycleState, IconType> = {
  announce: FiVolume2,
  lineup: FiMusic,
  doors: FiLogIn,
  photos: FiImage,
};

/** One scrap on the "where it all lives today" wall. */
export interface ScatterScrap {
  scrapId: string;
  Icon: IconType;
  labelKey: string;
  quoteKey: string;
}

export const SCATTER_SCRAPS: readonly ScatterScrap[] = [
  {
    scrapId: "chat",
    Icon: FiMessageCircle,
    labelKey: "forCommunities:scatter.chat.label",
    quoteKey: "forCommunities:scatter.chat.quote",
  },
  {
    scrapId: "sheet",
    Icon: FiGrid,
    labelKey: "forCommunities:scatter.sheet.label",
    quoteKey: "forCommunities:scatter.sheet.quote",
  },
  {
    scrapId: "tickets",
    Icon: FiTag,
    labelKey: "forCommunities:scatter.tickets.label",
    quoteKey: "forCommunities:scatter.tickets.quote",
  },
  {
    scrapId: "form",
    Icon: FiClipboard,
    labelKey: "forCommunities:scatter.form.label",
    quoteKey: "forCommunities:scatter.form.quote",
  },
  {
    scrapId: "photos",
    Icon: FiFolder,
    labelKey: "forCommunities:scatter.photos.label",
    quoteKey: "forCommunities:scatter.photos.quote",
  },
  {
    scrapId: "bio",
    Icon: FiLink,
    labelKey: "forCommunities:scatter.bio.label",
    quoteKey: "forCommunities:scatter.bio.quote",
  },
];

/** The access tiers the first walkthrough step lays out, in order. */
export const STEP_TIERS: readonly AccessTier[] = [
  "public",
  "request",
  "invite",
  "private",
];

export const BEFORE_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "chat",
    labelKey: "forCommunities:allInOne.before.chat",
    Icon: FiMessageCircle,
  },
  {
    itemId: "sheet",
    labelKey: "forCommunities:allInOne.before.sheet",
    Icon: FiGrid,
  },
  {
    itemId: "tickets",
    labelKey: "forCommunities:allInOne.before.tickets",
    Icon: FiTag,
  },
  {
    itemId: "photos",
    labelKey: "forCommunities:allInOne.before.photos",
    Icon: FiFolder,
  },
  {
    itemId: "money",
    labelKey: "forCommunities:allInOne.before.money",
    Icon: FiDollarSign,
  },
];

export const AFTER_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "page",
    labelKey: "forCommunities:allInOne.after.page",
    Icon: FiUsers,
  },
  {
    itemId: "events",
    labelKey: "forCommunities:allInOne.after.events",
    Icon: FiCalendar,
  },
  {
    itemId: "door",
    labelKey: "forCommunities:allInOne.after.door",
    Icon: FiLogIn,
  },
  {
    itemId: "support",
    labelKey: "forCommunities:allInOne.after.support",
    Icon: FiHeart,
  },
  {
    itemId: "quiz",
    labelKey: "forCommunities:allInOne.after.quiz",
    Icon: FiZap,
  },
  {
    itemId: "together",
    labelKey: "forCommunities:allInOne.after.together",
    Icon: FiMessageSquare,
  },
];

export const SAFETY_POINTS: readonly AudiencePoint[] = [
  {
    pointId: "review",
    titleKey: "forCommunities:safety.review.title",
    bodyKey: "forCommunities:safety.review.body",
    Icon: FiUserCheck,
  },
  {
    pointId: "bans",
    titleKey: "forCommunities:safety.bans.title",
    bodyKey: "forCommunities:safety.bans.body",
    Icon: FiShield,
  },
  {
    pointId: "log",
    titleKey: "forCommunities:safety.log.title",
    bodyKey: "forCommunities:safety.log.body",
    Icon: FiFileText,
  },
  {
    pointId: "private",
    titleKey: "forCommunities:safety.private.title",
    bodyKey: "forCommunities:safety.private.body",
    Icon: FiLock,
  },
  {
    pointId: "photos",
    titleKey: "forCommunities:safety.photos.title",
    bodyKey: "forCommunities:safety.photos.body",
    Icon: FiEye,
  },
];

export const FAQ_ITEMS: readonly AudienceFaqItem[] = [
  {
    faqId: "who-sees",
    questionKey: "forCommunities:faq.whoSees.question",
    answerKey: "forCommunities:faq.whoSees.answer",
  },
  {
    faqId: "private",
    questionKey: "forCommunities:faq.private.question",
    answerKey: "forCommunities:faq.private.answer",
  },
  {
    faqId: "team",
    questionKey: "forCommunities:faq.team.question",
    answerKey: "forCommunities:faq.team.answer",
  },
  {
    faqId: "together",
    questionKey: "forCommunities:faq.together.question",
    answerKey: "forCommunities:faq.together.answer",
  },
  {
    faqId: "support",
    questionKey: "forCommunities:faq.support.question",
    answerKey: "forCommunities:faq.support.answer",
  },
];
