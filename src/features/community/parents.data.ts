import type { IconType } from "react-icons";
import { FiActivity, FiHome, FiHeart, FiMessageCircle } from "react-icons/fi";

export const STATS = [
  { n: "62", labelKey: "parentNetwork.stat.parents" },
  { n: "2×", labelKey: "parentNetwork.stat.meetups" },
  { n: "14", labelKey: "parentNetwork.stat.kids" },
];

export const OFFERS: { icon: IconType; titleKey: string; bodyKey: string }[] = [
  {
    icon: FiActivity,
    titleKey: "parentNetwork.offer.healthcare.title",
    bodyKey: "parentNetwork.offer.healthcare.body",
  },
  {
    icon: FiHome,
    titleKey: "parentNetwork.offer.schools.title",
    bodyKey: "parentNetwork.offer.schools.body",
  },
  {
    icon: FiHeart,
    titleKey: "parentNetwork.offer.playdates.title",
    bodyKey: "parentNetwork.offer.playdates.body",
  },
  {
    icon: FiMessageCircle,
    titleKey: "parentNetwork.offer.vent.title",
    bodyKey: "parentNetwork.offer.vent.body",
  },
];

/** title/meta: specific event listings — content, mirrors an events API in
 *  live mode, left in English per the scope rule. tagKey: the category tag
 *  is chrome, resolved through the catalog. */
export const MEETUPS = [
  {
    dd: "21",
    mm: "Jun",
    title: "Saturday playground morning",
    meta: "Jardim da Estrela · 10:30 · all ages",
    tagKey: "parentNetwork.tag.playdate",
  },
  {
    dd: "24",
    mm: "Jun",
    title: "Mothers & fathers night: chosen and biological",
    meta: "Trans Hub office · 18:00 · adults",
    tagKey: "parentNetwork.tag.social",
  },
  {
    dd: "02",
    mm: "Jul",
    title: "Navigating the school year ahead",
    meta: "Online · 20:00 · members only",
    tagKey: "parentNetwork.tag.workshop",
  },
];

/** Every entry must point at a page that is NOT this one: the Parent Network
 *  renders inside /family, so the old "Chosen-family & legal recognition" row
 *  linked to itself. It is dropped until a chosen-family guide exists; legal
 *  recognition is already covered by the row above. */
export const RESOURCES = [
  { titleKey: "parentNetwork.resource.legalRights", to: "/safety/legal" },
  {
    titleKey: "parentNetwork.resource.healthcareGuides",
    to: "/resources/library",
  },
];
