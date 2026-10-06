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

/**
 * The guide's `resources.slug`. Each tab reads the managed section whose
 * anchor is its `TabId` ("testing", "prep", "hiv", "guides"), so an editor can
 * rewrite one tab's prose in the guide workspace while the other tabs keep
 * their catalog copy (RES-F5). `SECTION_COMPOSED_GUIDE_ANCHORS` in
 * `sectionComposedGuides.ts` lists the same four for the admin workspace.
 */
export const SEXUAL_HEALTH_GUIDE_SLUG = "sexual-health";
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
  textKey: string;
}
export interface ClinicDetail {
  testsKey: string;
  bringKey: string;
  accessKey: string;
  noteKey: string;
}
/** A member rating, formatted per locale on the card. */
export interface ClinicReview {
  rating: number;
  count: number;
}
/**
 * One demo-mode clinic. `name` is the clinic's own name and stays as written;
 * every other line is an i18n key, so the directory reads in Portuguese too.
 */
export interface Clinic {
  type: ClinicType;
  typeLabelKey: string;
  name: string;
  descriptionKey: string;
  meta: ClinicMeta[];
  verified?: boolean;
  review?: ClinicReview;
  details: ClinicDetail;
}
export const CLINICS: Clinic[] = [
  {
    type: "ngo",
    typeLabelKey: "resources:sexualHealth.testing.clinic.typeLabel.ngoFree",
    name: "CheckpointLx",
    descriptionKey:
      "resources:sexualHealth.testing.clinic.checkpointLx.description",
    meta: [
      {
        icon: FiMapPin,
        textKey: "resources:sexualHealth.testing.clinic.checkpointLx.location",
      },
      {
        icon: FiClock,
        textKey: "resources:sexualHealth.testing.clinic.checkpointLx.hours",
      },
    ],
    verified: true,
    review: { rating: 4.9, count: 84 },
    details: {
      testsKey:
        "resources:sexualHealth.testing.clinic.checkpointLx.details.tests",
      bringKey:
        "resources:sexualHealth.testing.clinic.checkpointLx.details.bring",
      accessKey:
        "resources:sexualHealth.testing.clinic.checkpointLx.details.access",
      noteKey:
        "resources:sexualHealth.testing.clinic.checkpointLx.details.note",
    },
  },
  {
    type: "ngo",
    typeLabelKey: "resources:sexualHealth.testing.clinic.typeLabel.ngoFree",
    name: "GAT Lisboa",
    descriptionKey:
      "resources:sexualHealth.testing.clinic.gatLisboa.description",
    meta: [
      {
        icon: FiMapPin,
        textKey: "resources:sexualHealth.testing.clinic.gatLisboa.location",
      },
      {
        icon: FiClock,
        textKey: "resources:sexualHealth.testing.clinic.gatLisboa.hours",
      },
    ],
    verified: true,
    review: { rating: 4.8, count: 61 },
    details: {
      testsKey: "resources:sexualHealth.testing.clinic.gatLisboa.details.tests",
      bringKey: "resources:sexualHealth.testing.clinic.gatLisboa.details.bring",
      accessKey:
        "resources:sexualHealth.testing.clinic.gatLisboa.details.access",
      noteKey: "resources:sexualHealth.testing.clinic.gatLisboa.details.note",
    },
  },
  {
    type: "public",
    typeLabelKey: "resources:sexualHealth.testing.clinic.typeLabel.snsFree",
    name: "CAD: Centro de Aconselhamento e Deteção",
    descriptionKey: "resources:sexualHealth.testing.clinic.cad.description",
    meta: [
      {
        icon: FiMapPin,
        textKey: "resources:sexualHealth.testing.clinic.cad.location",
      },
      {
        icon: FiClock,
        textKey: "resources:sexualHealth.testing.clinic.cad.hours",
      },
    ],
    review: { rating: 4.3, count: 29 },
    details: {
      testsKey: "resources:sexualHealth.testing.clinic.cad.details.tests",
      bringKey: "resources:sexualHealth.testing.clinic.cad.details.bring",
      accessKey: "resources:sexualHealth.testing.clinic.cad.details.access",
      noteKey: "resources:sexualHealth.testing.clinic.cad.details.note",
    },
  },
  {
    type: "pharmacy",
    typeLabelKey:
      "resources:sexualHealth.testing.clinic.typeLabel.pharmacyPaid",
    name: "Rapid HIV test: any pharmacy",
    descriptionKey:
      "resources:sexualHealth.testing.clinic.pharmacyRapidTest.description",
    meta: [
      {
        icon: FiMapPin,
        textKey:
          "resources:sexualHealth.testing.clinic.pharmacyRapidTest.location",
      },
      {
        icon: FiClock,
        textKey:
          "resources:sexualHealth.testing.clinic.pharmacyRapidTest.hours",
      },
    ],
    details: {
      testsKey:
        "resources:sexualHealth.testing.clinic.pharmacyRapidTest.details.tests",
      bringKey:
        "resources:sexualHealth.testing.clinic.pharmacyRapidTest.details.bring",
      accessKey:
        "resources:sexualHealth.testing.clinic.pharmacyRapidTest.details.access",
      noteKey:
        "resources:sexualHealth.testing.clinic.pharmacyRapidTest.details.note",
    },
  },
  {
    type: "private",
    typeLabelKey: "resources:sexualHealth.testing.clinic.typeLabel.privatePaid",
    name: "Clínica da Travessa: Sexual Health",
    descriptionKey:
      "resources:sexualHealth.testing.clinic.clinicaDaTravessa.description",
    meta: [
      {
        icon: FiMapPin,
        textKey:
          "resources:sexualHealth.testing.clinic.clinicaDaTravessa.location",
      },
      {
        icon: FiClock,
        textKey:
          "resources:sexualHealth.testing.clinic.clinicaDaTravessa.hours",
      },
    ],
    verified: true,
    review: { rating: 4.7, count: 38 },
    details: {
      testsKey:
        "resources:sexualHealth.testing.clinic.clinicaDaTravessa.details.tests",
      bringKey:
        "resources:sexualHealth.testing.clinic.clinicaDaTravessa.details.bring",
      accessKey:
        "resources:sexualHealth.testing.clinic.clinicaDaTravessa.details.access",
      noteKey:
        "resources:sexualHealth.testing.clinic.clinicaDaTravessa.details.note",
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
 * i18n key (DES-421). It is the catalog copy for each tab: a managed section
 * at that tab's anchor replaces it in live mode (see
 * `SEXUAL_HEALTH_GUIDE_SLUG`), and demo mode always reads it.
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
