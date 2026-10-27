import type { IconType } from "react-icons";
import {
  FiActivity,
  FiCalendar,
  FiCamera,
  FiDisc,
  FiEyeOff,
  FiFileText,
  FiFolder,
  FiGlobe,
  FiInbox,
  FiLink,
  FiLink2,
  FiMessageCircle,
  FiMic,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import type { SubprofileKind } from "../../../subprofiles/api/subprofiles.api";
import { SKIN_OF } from "../../../subprofiles/subprofile-skins";
import type {
  AudienceFaqItem,
  AudienceListItem,
  AudiencePoint,
} from "../shared/audiences.data";
import type { PerformerTryKind } from "./performersSample.data";

/** The icon beside each craft in the "Try it" switch. */
export const TRY_KIND_ICONS: Record<PerformerTryKind, IconType> = {
  drag: FiStar,
  dj: FiDisc,
  comedian: FiMic,
  dancer: FiActivity,
};

/** The words that run along the marquee band: the product's own section
 *  labels for stage acts. */
export const MARQUEE_WORD_KEYS: readonly string[] = [
  "subprofiles:section.shows",
  "subprofiles:section.looks",
  "subprofiles:section.mixes",
  "subprofiles:section.sets",
  "subprofiles:section.performances",
  "subprofiles:section.gigs",
  "subprofiles:section.tour",
  "subprofiles:section.reel",
];

/** One scrap of the "where it all lives today" collage. */
export interface ScatterScrap {
  scrapId: string;
  labelKey: string;
  Icon: IconType;
}

export const SCATTER_SCRAPS: readonly ScatterScrap[] = [
  {
    scrapId: "link-in-bio",
    labelKey: "forPerformers:scatter.linkInBio",
    Icon: FiLink,
  },
  {
    scrapId: "stories",
    labelKey: "forPerformers:scatter.stories",
    Icon: FiCamera,
  },
  {
    scrapId: "messages",
    labelKey: "forPerformers:scatter.messages",
    Icon: FiMessageCircle,
  },
  {
    scrapId: "rider",
    labelKey: "forPerformers:scatter.rider",
    Icon: FiFolder,
  },
  {
    scrapId: "past-gigs",
    labelKey: "forPerformers:scatter.pastGigs",
    Icon: FiCalendar,
  },
  {
    scrapId: "website",
    labelKey: "forPerformers:scatter.website",
    Icon: FiGlobe,
  },
];

/** Every kind that wears the Stage skin, read from the real `SKIN_OF`. */
export const STAGE_SKIN_KINDS: readonly SubprofileKind[] = (
  Object.keys(SKIN_OF) as SubprofileKind[]
).filter((kind) => SKIN_OF[kind] === "stage");

/** How many Stage crafts the step 2 board lists on phones before a "+N
 *  more" pill counts the rest. */
export const SKIN_KINDS_SHOWN_ON_PHONES = 8;

/** The two ways a persona can sit beside a member's own profile. */
export interface LinkChoice {
  choiceId: "linked" | "unlinked";
  labelKey: string;
  bodyKey: string;
  Icon: IconType;
}

export const LINK_CHOICES: readonly LinkChoice[] = [
  {
    choiceId: "linked",
    labelKey: "subprofiles:link.linked",
    bodyKey: "forPerformers:walkthrough.persona.linkedBody",
    Icon: FiLink2,
  },
  {
    choiceId: "unlinked",
    labelKey: "subprofiles:link.standalone",
    bodyKey: "forPerformers:walkthrough.persona.standaloneBody",
    Icon: FiEyeOff,
  },
];

export const BEFORE_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "link-in-bio",
    labelKey: "forPerformers:allInOne.before.linkInBio",
    Icon: FiLink,
  },
  {
    itemId: "stories",
    labelKey: "forPerformers:allInOne.before.stories",
    Icon: FiCamera,
  },
  {
    itemId: "inboxes",
    labelKey: "forPerformers:allInOne.before.inboxes",
    Icon: FiInbox,
  },
  {
    itemId: "folder",
    labelKey: "forPerformers:allInOne.before.folder",
    Icon: FiFolder,
  },
];

export const AFTER_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "page",
    labelKey: "forPerformers:allInOne.after.page",
    Icon: FiGlobe,
  },
  {
    itemId: "next-up",
    labelKey: "forPerformers:allInOne.after.nextUp",
    Icon: FiCalendar,
  },
  {
    itemId: "booker",
    labelKey: "forPerformers:allInOne.after.booker",
    Icon: FiFileText,
  },
  {
    itemId: "work",
    labelKey: "forPerformers:allInOne.after.work",
    Icon: FiStar,
  },
  {
    itemId: "links",
    labelKey: "forPerformers:allInOne.after.links",
    Icon: FiLink,
  },
];

export const SAFETY_POINTS: readonly AudiencePoint[] = [
  {
    pointId: "visibility",
    titleKey: "forPerformers:safety.visibility.title",
    bodyKey: "forPerformers:safety.visibility.body",
    Icon: FiGlobe,
  },
  {
    pointId: "standalone",
    titleKey: "forPerformers:safety.standalone.title",
    bodyKey: "forPerformers:safety.standalone.body",
    Icon: FiEyeOff,
  },
  {
    pointId: "co-owners",
    titleKey: "forPerformers:safety.coOwners.title",
    bodyKey: "forPerformers:safety.coOwners.body",
    Icon: FiUsers,
  },
];

export const FAQ_ITEMS: readonly AudienceFaqItem[] = [
  {
    faqId: "who-sees",
    questionKey: "forPerformers:faq.whoSees.question",
    answerKey: "forPerformers:faq.whoSees.answer",
  },
  {
    faqId: "separate",
    questionKey: "forPerformers:faq.separate.question",
    answerKey: "forPerformers:faq.separate.answer",
  },
  {
    faqId: "co-owner",
    questionKey: "forPerformers:faq.coOwner.question",
    answerKey: "forPerformers:faq.coOwner.answer",
  },
];
