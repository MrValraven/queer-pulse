import {
  FiAtSign,
  FiCalendar,
  FiCamera,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiImage,
  FiInbox,
  FiLayout,
  FiMessageCircle,
  FiPenTool,
  FiScissors,
  FiShield,
  FiTag,
  FiUserCheck,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type {
  AudienceFaqItem,
  AudienceListItem,
  AudiencePoint,
} from "../shared/audiences.data";

/** The practices the "Try it" switch moves between, in tab order. */
export const PRACTITIONER_TRY_KINDS = [
  "tattoo_artist",
  "therapist",
  "hair_stylist",
  "photographer",
] as const;

export type PractitionerTryKind = (typeof PRACTITIONER_TRY_KINDS)[number];

/** The kind the page opens on, and the one "Create a persona" starts with. */
export const DEFAULT_PRACTITIONER_KIND: PractitionerTryKind = "tattoo_artist";

/** Each practice's tab icon. */
export const PRACTITIONER_KIND_ICONS: Record<PractitionerTryKind, IconType> = {
  tattoo_artist: FiPenTool,
  therapist: FiMessageCircle,
  hair_stylist: FiScissors,
  photographer: FiCamera,
};

/** "Where it all lives today": the scatter, in general terms. */
export const PRACTITIONER_SCATTER: readonly AudienceListItem[] = [
  { itemId: "feed", labelKey: "forPractitioners:scatter.feed", Icon: FiImage },
  {
    itemId: "prices",
    labelKey: "forPractitioners:scatter.prices",
    Icon: FiTag,
  },
  {
    itemId: "questions",
    labelKey: "forPractitioners:scatter.questions",
    Icon: FiInbox,
  },
  {
    itemId: "calendar",
    labelKey: "forPractitioners:scatter.calendar",
    Icon: FiCalendar,
  },
];

/** "All in one place": what they juggle, beside the one page. */
export const PRACTITIONER_BEFORE_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "feed",
    labelKey: "forPractitioners:allInOne.before.feed",
    Icon: FiImage,
  },
  {
    itemId: "pinned",
    labelKey: "forPractitioners:allInOne.before.pinned",
    Icon: FiFileText,
  },
  {
    itemId: "dms",
    labelKey: "forPractitioners:allInOne.before.dms",
    Icon: FiAtSign,
  },
  {
    itemId: "repeat",
    labelKey: "forPractitioners:allInOne.before.repeat",
    Icon: FiCopy,
  },
];

export const PRACTITIONER_AFTER_ITEMS: readonly AudienceListItem[] = [
  {
    itemId: "page",
    labelKey: "forPractitioners:allInOne.after.page",
    Icon: FiLayout,
  },
  {
    itemId: "work",
    labelKey: "forPractitioners:allInOne.after.work",
    Icon: FiImage,
  },
  {
    itemId: "status",
    labelKey: "forPractitioners:allInOne.after.status",
    Icon: FiCalendar,
  },
  {
    itemId: "messages",
    labelKey: "forPractitioners:allInOne.after.messages",
    Icon: FiMessageCircle,
  },
];

/** "Safe by design": only what the persona code does. */
export const PRACTITIONER_SAFETY_POINTS: readonly AudiencePoint[] = [
  {
    pointId: "visibility",
    titleKey: "forPractitioners:safety.visibility.title",
    bodyKey: "forPractitioners:safety.visibility.body",
    Icon: FiEye,
  },
  {
    pointId: "standalone",
    titleKey: "forPractitioners:safety.standalone.title",
    bodyKey: "forPractitioners:safety.standalone.body",
    Icon: FiEyeOff,
  },
  {
    pointId: "messages",
    titleKey: "forPractitioners:safety.messages.title",
    bodyKey: "forPractitioners:safety.messages.body",
    Icon: FiShield,
  },
  {
    pointId: "registration",
    titleKey: "forPractitioners:safety.registration.title",
    bodyKey: "forPractitioners:safety.registration.body",
    Icon: FiUserCheck,
  },
];

export const PRACTITIONER_FAQ: readonly AudienceFaqItem[] = [
  {
    faqId: "who-sees",
    questionKey: "forPractitioners:faq.whoSees.question",
    answerKey: "forPractitioners:faq.whoSees.answer",
  },
  {
    faqId: "pause",
    questionKey: "forPractitioners:faq.pause.question",
    answerKey: "forPractitioners:faq.pause.answer",
  },
  {
    faqId: "separate",
    questionKey: "forPractitioners:faq.separate.question",
    answerKey: "forPractitioners:faq.separate.answer",
  },
];
