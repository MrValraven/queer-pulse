import type { IconType } from "react-icons";
import {
  FiActivity,
  FiUsers,
  FiHome,
  FiFlag,
  FiHeart,
  FiGlobe,
} from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";
import { routes } from "../../app/routeMap";
import { memberName } from "../members/data/members";

/**
 * i18n Pattern A. Labels/notes/titles/intros/details are platform-authored
 * chrome resolved via `t()` in `EmergencyPage.tsx`. Organisation and person
 * names (`name`, and each `link`'s bare-URL label like "↗ opusdiversus.org")
 * are content — proper nouns that read identically in both catalogs, so they
 * stay plain strings. Phone numbers are never translated.
 */
export interface CrisisNum {
  labelKey: string;
  num: string;
  noteKey: string;
}

export const CRISIS_NUMS: CrisisNum[] = [
  {
    labelKey: "safety:emergency.crisis.emergencyServices.label",
    num: "112",
    noteKey: "safety:emergency.crisis.emergencyServices.note",
  },
  {
    labelKey: "safety:emergency.crisis.sns24.label",
    num: "808 24 24 24",
    noteKey: "safety:emergency.crisis.sns24.note",
  },
  {
    labelKey: "safety:emergency.crisis.sosVozAmiga.label",
    num: "213 544 545",
    noteKey: "safety:emergency.crisis.sosVozAmiga.note",
  },
  {
    labelKey: "safety:emergency.crisis.ilga.label",
    num: "707 200 220",
    noteKey: "safety:emergency.crisis.ilga.note",
  },
  {
    labelKey: "safety:emergency.crisis.apav.label",
    num: "116 006",
    noteKey: "safety:emergency.crisis.apav.note",
  },
  {
    labelKey: "safety:emergency.crisis.linhaCrianca.label",
    num: "116 111",
    noteKey: "safety:emergency.crisis.linhaCrianca.note",
  },
];

interface ItemLink {
  labelKey?: string;
  /** Bare-URL link text (e.g. "↗ opusdiversus.org") — content, not chrome. */
  label?: string;
  href: string;
  external?: boolean;
}
interface Item {
  name: string;
  detailKey: string;
  link?: ItemLink;
}
interface Section {
  icon: IconType;
  iconBg: string;
  titleKey: string;
  introKey: string;
  items: Item[];
}

export const SECTIONS: Section[] = [
  {
    icon: FiActivity,
    iconBg: "rgba(122,82,184,.1)",
    titleKey: "safety:emergency.section.mentalHealth.title",
    introKey: "safety:emergency.section.mentalHealth.intro",
    items: [
      {
        name: "Opus Diversus",
        detailKey: "safety:emergency.section.mentalHealth.item.opusDiversus.detail",
        link: {
          label: "↗ opusdiversus.org",
          href: "https://opusdiversus.org",
          external: true,
        },
      },
      {
        name: `${memberName("mariana")} (QueerPulse)`,
        detailKey: "safety:emergency.section.mentalHealth.item.clinician.detail",
        link: {
          labelKey: "safety:emergency.common.viewProfileCta",
          href: routes.members,
        },
      },
      {
        name: "SNS mental health services",
        detailKey: "safety:emergency.section.mentalHealth.item.sns.detail",
      },
    ],
  },
  {
    icon: FiUsers,
    iconBg: "rgba(74,140,111,.1)",
    titleKey: "safety:emergency.section.transSupport.title",
    introKey: "safety:emergency.section.transSupport.intro",
    items: [
      {
        name: "ILGA Portugal — Trans rights team",
        detailKey: "safety:emergency.section.transSupport.item.ilga.detail",
        link: {
          label: "↗ ilga-portugal.pt",
          href: "https://ilga-portugal.pt",
          external: true,
        },
      },
      {
        name: "Panteras Rosa",
        detailKey:
          "safety:emergency.section.transSupport.item.pantherasRosa.detail",
        link: {
          labelKey: "safety:emergency.common.moreInfoCta",
          href: routes.platforms,
        },
      },
      {
        name: "Trans Mutual Aid Network (QueerPulse)",
        detailKey:
          "safety:emergency.section.transSupport.item.mutualAid.detail",
        link: {
          labelKey: "safety:emergency.common.joinNetworkCta",
          href: routes.communities,
        },
      },
    ],
  },
  {
    icon: FiHome,
    iconBg: "rgba(var(--danger-rgb),.08)",
    titleKey: "safety:emergency.section.housing.title",
    introKey: "safety:emergency.section.housing.intro",
    items: [
      {
        name: "APAV — Domestic violence support",
        detailKey: "safety:emergency.section.housing.item.apav.detail",
      },
      {
        name: "Queer Housing Justice Network",
        detailKey: "safety:emergency.section.housing.item.queerHousing.detail",
        link: {
          labelKey: "safety:emergency.common.housingResourcesCta",
          href: routes.housing,
        },
      },
      {
        name: "Santa Casa da Misericórdia",
        detailKey: "safety:emergency.section.housing.item.santaCasa.detail",
      },
    ],
  },
  {
    icon: FaScaleBalanced,
    iconBg: "rgba(45,27,61,.08)",
    titleKey: "safety:emergency.section.legal.title",
    introKey: "safety:emergency.section.legal.intro",
    items: [
      {
        name: "ILGA Portugal — Legal team",
        detailKey: "safety:emergency.section.legal.item.ilga.detail",
      },
      {
        name: `${memberName("raquel-baptista")} (QueerPulse)`,
        detailKey: "safety:emergency.section.legal.item.lawyer.detail",
        link: {
          labelKey: "safety:emergency.common.viewProfileCta",
          href: "/members/raquel-baptista",
        },
      },
      {
        name: "Ordem dos Advogados — Legal aid",
        detailKey: "safety:emergency.section.legal.item.ordemAdvogados.detail",
      },
    ],
  },
];

export const ONLINE: {
  icon: IconType;
  name: string;
  subKey: string;
  href: string;
}[] = [
  {
    icon: FiFlag,
    name: "ILGA Portugal",
    subKey: "safety:emergency.online.ilga.sub",
    href: "https://ilga-portugal.pt",
  },
  {
    icon: FiHeart,
    name: "The Trevor Project",
    subKey: "safety:emergency.online.trevor.sub",
    href: "https://thetrevorproject.org",
  },
  {
    icon: FiUsers,
    name: "Trans Lifeline",
    subKey: "safety:emergency.online.transLifeline.sub",
    href: "https://translifeline.org",
  },
  {
    icon: FiActivity,
    name: "Opus Diversus",
    subKey: "safety:emergency.online.opusDiversus.sub",
    href: "https://opusdiversus.org",
  },
  {
    icon: FiGlobe,
    name: "Rainbow Railroad",
    subKey: "safety:emergency.online.rainbowRailroad.sub",
    href: "https://rainbowrailroad.org",
  },
];
