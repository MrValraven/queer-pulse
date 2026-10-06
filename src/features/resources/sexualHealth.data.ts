import type { IconType } from "react-icons";
import {
  FiActivity,
  FiClock,
  FiDollarSign,
  FiHeart,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
import { FaSyringe, FaVirus } from "react-icons/fa6";
import { LuDna, LuLeaf, LuMicroscope, LuScale } from "react-icons/lu";
import { routes } from "../../app/routeMap";

export type TabId = "testing" | "prep" | "hiv" | "guides";
export type ClinicType = "public" | "ngo" | "private" | "pharmacy";

/** i18n Pattern A — `id` is the stored tab value; `labelKey` resolves via `t()`. */
export const TABS: { id: TabId; labelKey: string }[] = [
  { id: "testing", labelKey: "resources:sexualHealth.tab.testing" },
  { id: "prep", labelKey: "resources:sexualHealth.tab.prep" },
  { id: "hiv", labelKey: "resources:sexualHealth.tab.hiv" },
  { id: "guides", labelKey: "resources:sexualHealth.tab.guides" },
];

export interface ClinicMeta {
  icon: IconType;
  text: string;
}
export interface ClinicDetail {
  tests: string;
  bring: string;
  access: string;
  note: string;
}
export interface Clinic {
  type: ClinicType;
  typeLabel: string;
  name: string;
  description: string;
  meta: ClinicMeta[];
  verified?: boolean;
  button: string;
  review?: string;
  details: ClinicDetail;
}
export const CLINICS: Clinic[] = [
  {
    type: "ngo",
    typeLabel: "NGO · Free",
    name: "CheckpointLx",
    description:
      "Lisbon's leading queer-specific sexual health service. Free, anonymous testing for HIV, syphilis, hepatitis B & C, and gonorrhoea. PrEP counselling. Staff are experienced with queer and trans clients. No appointment needed on drop-in days.",
    meta: [
      { icon: FiMapPin, text: "Rua de São Lázaro, Intendente" },
      { icon: FiClock, text: "Tue & Thu 18:00–21:00, Sat 14:00–18:00" },
    ],
    verified: true,
    button: "View details",
    review: "4.9 · 84 member reviews",
    details: {
      tests:
        "HIV, syphilis, hepatitis B & C, gonorrhoea. Rapid results the same evening.",
      bring:
        "Nothing required. No ID, no SNS number, no appointment on drop-in days.",
      access:
        "Ground-floor entrance, step-free. Trans-experienced staff. Service available in PT and EN.",
      note: "Busiest in the first hour. Arriving later in the session usually means a shorter wait.",
    },
  },
  {
    type: "ngo",
    typeLabel: "NGO · Free",
    name: "GAT Lisboa",
    description:
      "Community-based harm reduction and sexual health. Free HIV rapid tests, peer counselling, PrEP navigation support, and an anonymous STI referral service. Particularly strong on outreach to migrants and people in sex work.",
    meta: [
      { icon: FiMapPin, text: "Rua do Século, Bairro Alto" },
      { icon: FiClock, text: "Mon–Fri 10:00–18:00" },
    ],
    verified: true,
    button: "View details",
    review: "4.8 · 61 member reviews",
    details: {
      tests:
        "HIV rapid test on site; referrals for the full STI panel. PrEP navigation support.",
      bring:
        "Nothing required for a rapid test. For referrals, an SNS number helps but staff can advise without one.",
      access:
        "Peer counsellors who speak PT, EN, and FR. Especially experienced with migrants and people in sex work.",
      note: "Walk-in for rapid tests; PrEP navigation is best booked by phone first.",
    },
  },
  {
    type: "public",
    typeLabel: "SNS · Free",
    name: "CAD: Centro de Aconselhamento e Deteção",
    description:
      "The public SNS HIV testing and counselling service. Free, confidential, with a counsellor present. Also provides hepatitis B vaccination and referrals to PrEP. You need to register with the SNS but no insurance required.",
    meta: [
      { icon: FiMapPin, text: "Multiple locations across Lisbon" },
      { icon: FiClock, text: "By appointment" },
    ],
    button: "View details",
    review: "4.3 · 29 member reviews",
    details: {
      tests:
        "HIV testing with a counsellor, hepatitis B vaccination, and PrEP referrals.",
      bring:
        "Your SNS number. No private insurance needed; EU citizens can use an EHIC card.",
      access:
        "Multiple SNS sites across the city. Pick the one nearest you when booking.",
      note: "Confidential: results are never shared without your consent, including with your GP.",
    },
  },
  {
    type: "pharmacy",
    typeLabel: "Pharmacy · €15–25",
    name: "Rapid HIV test: any pharmacy",
    description:
      "Available over the counter at most pharmacies. Result in 15 minutes. Detects HIV from 3 months after potential exposure. Ask for a teste rápido de VIH. No prescription needed, no record kept.",
    meta: [
      { icon: FiMapPin, text: "Any farmácia" },
      { icon: FiClock, text: "Walk-in, no appointment" },
    ],
    button: "View details",
    details: {
      tests: "Rapid finger-prick HIV test, result in about 15 minutes.",
      bring: "€15–25 in cash or card. No prescription, no ID, no record kept.",
      access:
        "Available at most pharmacies. Larger ones are more likely to stock it.",
      note: "Detects HIV from roughly 3 months after a potential exposure; test again if it was more recent.",
    },
  },
  {
    type: "private",
    typeLabel: "Private · Paid",
    name: "Clínica da Travessa: Sexual Health",
    description:
      "Private clinic with queer-affirming staff. Full STI panel (HIV, syphilis, gonorrhoea, chlamydia, HSV, hepatitis B & C, HPV). Results within 48 hours. Offers PrEP prescription outside the SNS pathway for those who prefer it.",
    meta: [
      { icon: FiMapPin, text: "Príncipe Real" },
      { icon: FiClock, text: "Mon–Sat, by appointment" },
    ],
    verified: true,
    button: "View details",
    review: "4.7 · 38 member reviews",
    details: {
      tests:
        "Full STI panel: HIV, syphilis, gonorrhoea, chlamydia, HSV, hepatitis B & C, HPV. Results within 48 hours.",
      bring:
        "A booking and a payment method. PrEP prescriptions available outside the SNS pathway.",
      access:
        "Queer-affirming staff; private, discreet setting. Appointments PT and EN.",
      note: "Paid service, useful when you want a fast, comprehensive panel without the SNS wait.",
    },
  },
];
export const TYPE_CLASS: Record<ClinicType, string> = {
  public: "typePublic",
  ngo: "typeNgo",
  private: "typePrivate",
  pharmacy: "typePharmacy",
};
/** i18n Pattern A — `id` is the stored filter value; `labelKey` resolves via `t()`. */
export const CLINIC_FILTERS: { id: ClinicType | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "resources:sexualHealth.testing.filter.all" },
  { id: "public", labelKey: "resources:sexualHealth.testing.filter.public" },
  { id: "ngo", labelKey: "resources:sexualHealth.testing.filter.ngo" },
  {
    id: "pharmacy",
    labelKey: "resources:sexualHealth.testing.filter.pharmacy",
  },
  { id: "private", labelKey: "resources:sexualHealth.testing.filter.private" },
];

/**
 * The guide's own prose below renders in both modes, so every string is an
 * i18n key (DES-421). This guide is a metadata-only row in the database
 * (`sections: []` in the CON-08 backfill), so its words live in the
 * `resources` catalogs, like every other hardcoded guide page.
 */
export interface TestingInfoCard {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
  color: string;
  background: string;
  border: string;
}

export const TESTING_INFO: TestingInfoCard[] = [
  {
    icon: FiClock,
    titleKey: "resources:sexualHealth.testing.info.frequency.title",
    bodyKey: "resources:sexualHealth.testing.info.frequency.body",
    color: "var(--jade)",
    background: "rgba(var(--jade-rgb), 0.06)",
    border: "rgba(var(--jade-rgb), 0.18)",
  },
  {
    icon: FiLock,
    titleKey: "resources:sexualHealth.testing.info.confidential.title",
    bodyKey: "resources:sexualHealth.testing.info.confidential.body",
    color: "var(--accent-ink)",
    background: "rgba(var(--accent-rgb), 0.05)",
    border: "rgba(var(--accent-rgb), 0.18)",
  },
  {
    icon: FiDollarSign,
    titleKey: "resources:sexualHealth.testing.info.cost.title",
    bodyKey: "resources:sexualHealth.testing.info.cost.body",
    // --text-strong and --line-rgb are plum in light mode and flip in dark.
    color: "var(--text-strong)",
    background: "rgba(var(--line-rgb), 0.04)",
    border: "rgba(var(--line-rgb), 0.12)",
  },
];

export interface PrepStep {
  titleKey: string;
  descriptionKey: string;
  noteKey?: string;
}

export const PREP_STEPS: PrepStep[] = [
  {
    titleKey: "resources:sexualHealth.prep.step1.title",
    descriptionKey: "resources:sexualHealth.prep.step1.description",
    // Points to the clinic's own site for times, which change without a deploy.
    noteKey: "resources:sexualHealth.prep.step1.note",
  },
  {
    titleKey: "resources:sexualHealth.prep.step2.title",
    descriptionKey: "resources:sexualHealth.prep.step2.description",
    noteKey: "resources:sexualHealth.prep.step2.note",
  },
  {
    titleKey: "resources:sexualHealth.prep.step3.title",
    descriptionKey: "resources:sexualHealth.prep.step3.description",
    noteKey: "resources:sexualHealth.prep.step3.note",
  },
  {
    titleKey: "resources:sexualHealth.prep.step4.title",
    descriptionKey: "resources:sexualHealth.prep.step4.description",
  },
];

export interface PrepQuestion {
  questionKey: string;
  answerKey: string;
}

export const PREP_FAQ: PrepQuestion[] = [
  {
    questionKey: "resources:sexualHealth.prep.faq.snsNumber.question",
    answerKey: "resources:sexualHealth.prep.faq.snsNumber.answer",
  },
  {
    questionKey: "resources:sexualHealth.prep.faq.onDemand.question",
    answerKey: "resources:sexualHealth.prep.faq.onDemand.answer",
  },
  {
    questionKey: "resources:sexualHealth.prep.faq.otherStis.question",
    answerKey: "resources:sexualHealth.prep.faq.otherStis.answer",
  },
  {
    questionKey: "resources:sexualHealth.prep.faq.transHormones.question",
    answerKey: "resources:sexualHealth.prep.faq.transHormones.answer",
  },
];

export interface InfoCard {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
  link?: { labelKey: string; href: string; external?: boolean };
}

export const HIV_INFO: InfoCard[] = [
  {
    icon: FiHeart,
    titleKey: "resources:sexualHealth.hiv.info.positive.title",
    bodyKey: "resources:sexualHealth.hiv.info.positive.body",
    link: {
      labelKey: "resources:sexualHealth.hiv.info.positive.link",
      // SNS 24, the national health line (sns.gov.pt, "Linhas de
      // Atendimento Gerais"). The old Linha SIDA number has closed.
      href: "tel:808242424",
      external: true,
    },
  },
  {
    icon: FiActivity,
    titleKey: "resources:sexualHealth.hiv.info.pep.title",
    bodyKey: "resources:sexualHealth.hiv.info.pep.body",
  },
  {
    icon: FiUsers,
    titleKey: "resources:sexualHealth.hiv.info.peerSupport.title",
    bodyKey: "resources:sexualHealth.hiv.info.peerSupport.body",
    link: {
      labelKey: "resources:sexualHealth.hiv.info.peerSupport.link",
      href: routes.communities,
    },
  },
  {
    icon: LuScale,
    titleKey: "resources:sexualHealth.hiv.info.rights.title",
    bodyKey: "resources:sexualHealth.hiv.info.rights.body",
    link: {
      labelKey: "resources:sexualHealth.hiv.info.rights.link",
      href: routes.legal,
    },
  },
];

export const GUIDES: (InfoCard & { contentKey: string })[] = [
  {
    icon: FaSyringe,
    contentKey: "sexualHealth.guides.vaccination",
    titleKey: "resources:sexualHealth.guides.card.vaccination.title",
    bodyKey: "resources:sexualHealth.guides.card.vaccination.body",
  },
  {
    icon: FaVirus,
    contentKey: "sexualHealth.guides.mpox",
    titleKey: "resources:sexualHealth.guides.card.mpox.title",
    bodyKey: "resources:sexualHealth.guides.card.mpox.body",
  },
  {
    icon: LuMicroscope,
    contentKey: "sexualHealth.guides.bacterialStis",
    titleKey: "resources:sexualHealth.guides.card.bacterialStis.title",
    bodyKey: "resources:sexualHealth.guides.card.bacterialStis.body",
  },
  {
    icon: FiMessageCircle,
    contentKey: "sexualHealth.guides.talkingToPartners",
    titleKey: "resources:sexualHealth.guides.card.talkingToPartners.title",
    bodyKey: "resources:sexualHealth.guides.card.talkingToPartners.body",
    // No standalone guide page exists yet, so this card renders without a
    // CTA. Add a `link` here once the guide has a real route.
  },
  {
    icon: LuLeaf,
    contentKey: "sexualHealth.guides.substanceUse",
    titleKey: "resources:sexualHealth.guides.card.substanceUse.title",
    bodyKey: "resources:sexualHealth.guides.card.substanceUse.body",
    link: {
      labelKey: "resources:sexualHealth.guides.card.substanceUse.link",
      href: routes.harmReduction,
    },
  },
  {
    icon: LuDna,
    contentKey: "sexualHealth.guides.transNonbinary",
    titleKey: "resources:sexualHealth.guides.card.transNonbinary.title",
    bodyKey: "resources:sexualHealth.guides.card.transNonbinary.body",
    link: {
      labelKey: "resources:sexualHealth.guides.card.transNonbinary.link",
      href: routes.transHub,
    },
  },
];
