import type { IconType } from "react-icons";
import { FiCheck, FiRotateCcw } from "react-icons/fi";

export const CRITERIA: { icon: IconType; leadKey: string; restKey: string }[] =
  [
    {
      icon: FiCheck,
      leadKey: "safety:spaces.criteria.genderNeutral.lead",
      restKey: "safety:spaces.criteria.genderNeutral.rest",
    },
    {
      icon: FiCheck,
      leadKey: "safety:spaces.criteria.staffIntervene.lead",
      restKey: "safety:spaces.criteria.staffIntervene.rest",
    },
    {
      icon: FiCheck,
      leadKey: "safety:spaces.criteria.noIncidents.lead",
      restKey: "safety:spaces.criteria.noIncidents.rest",
    },
    {
      icon: FiCheck,
      leadKey: "safety:spaces.criteria.transWelcome.lead",
      restKey: "safety:spaces.criteria.transWelcome.rest",
    },
    {
      icon: FiCheck,
      leadKey: "safety:spaces.criteria.accessible.lead",
      restKey: "safety:spaces.criteria.accessible.rest",
    },
    {
      icon: FiCheck,
      leadKey: "safety:spaces.criteria.reviews.lead",
      restKey: "safety:spaces.criteria.reviews.rest",
    },
    {
      icon: FiRotateCcw,
      leadKey: "safety:spaces.criteria.annualReview.lead",
      restKey: "safety:spaces.criteria.annualReview.rest",
    },
  ];

export const HOW: {
  number: string;
  titleKey: string;
  descriptionKey: string;
}[] = [
  {
    number: "01",
    titleKey: "safety:spaces.how.step1.title",
    descriptionKey: "safety:spaces.how.step1.desc",
  },
  {
    number: "02",
    titleKey: "safety:spaces.how.step2.title",
    descriptionKey: "safety:spaces.how.step2.desc",
  },
  {
    number: "03",
    titleKey: "safety:spaces.how.step3.title",
    descriptionKey: "safety:spaces.how.step3.desc",
  },
  {
    number: "04",
    titleKey: "safety:spaces.how.step4.title",
    descriptionKey: "safety:spaces.how.step4.desc",
  },
  {
    number: "05",
    titleKey: "safety:spaces.how.step5.title",
    descriptionKey: "safety:spaces.how.step5.desc",
  },
  {
    number: "06",
    titleKey: "safety:spaces.how.step6.title",
    descriptionKey: "safety:spaces.how.step6.desc",
  },
];

/** i18n Pattern A — the nomination form's "Type of space" <select> options,
 * sole consumer is `NominateSection`. */
export const NOMINATE_TYPE_KEYS = [
  "safety:spaces.nominate.typeSelect.bar",
  "safety:spaces.nominate.typeSelect.club",
  "safety:spaces.nominate.typeSelect.cafe",
  "safety:spaces.nominate.typeSelect.healthcare",
  "safety:spaces.nominate.typeSelect.services",
  "safety:spaces.nominate.typeSelect.arts",
  "safety:spaces.nominate.typeSelect.gym",
  "safety:spaces.nominate.typeSelect.other",
];
