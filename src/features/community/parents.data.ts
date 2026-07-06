import type { IconType } from "react-icons";
import { FiActivity, FiHome, FiHeart, FiMessageCircle } from "react-icons/fi";

export const STATS = [
  { n: "62", label: "parents & co-parents" },
  { n: "2×", label: "meetups a month" },
  { n: "14", label: "kids in the playdate group" },
];

export const OFFERS: { icon: IconType; title: string; body: string }[] = [
  {
    icon: FiActivity,
    title: "Affirming healthcare",
    body: "A shared, vetted list of paediatricians and GPs who treat two mums, two dads, and every family on the intake form as a matter of fact.",
  },
  {
    icon: FiHome,
    title: "Schools & paperwork",
    body: "Which schools get it right, how to handle forms that assume a mother and a father, and members who've been through the same admissions.",
  },
  {
    icon: FiHeart,
    title: "Playdates & childcare",
    body: "A standing playdate group, swap-sitting between trusted members, and weekend gatherings where no one has to explain their family.",
  },
  {
    icon: FiMessageCircle,
    title: "A place to vent",
    body: "Co-parenting logistics, surrogacy and adoption journeys, and the small daily things — with people who actually get it.",
  },
];

export const MEETUPS = [
  {
    dd: "21",
    mm: "Jun",
    title: "Saturday playground morning",
    meta: "Jardim da Estrela · 10:30 · all ages",
    tag: "Playdate",
  },
  {
    dd: "24",
    mm: "Jun",
    title: "Mothers & fathers night — chosen and biological",
    meta: "Trans Hub office · 18:00 · adults",
    tag: "Social",
  },
  {
    dd: "02",
    mm: "Jul",
    title: "Navigating the school year ahead",
    meta: "Online · 20:00 · members only",
    tag: "Workshop",
  },
];

export const RESOURCES = [
  { title: "Legal rights as a queer family", to: "/safety/legal" },
  { title: "Chosen-family & legal recognition", to: "/family" },
  { title: "Healthcare & document guides", to: "/resources/library" },
];
