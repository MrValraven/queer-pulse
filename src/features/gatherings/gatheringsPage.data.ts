import type { IconType } from "react-icons";
import { FiCalendar, FiCamera, FiHeart, FiTag } from "react-icons/fi";

export const WAYS: {
  icon: IconType;
  title: string;
  body: string;
  to: string;
  cta: string;
}[] = [
  {
    icon: FiTag,
    title: "Browse what's on",
    body: "Supper clubs, mixers, studio visits, screenings, and skill swaps — filter by neighbourhood, type, and date.",
    to: "/events",
    cta: "See all events",
  },
  {
    icon: FiCalendar,
    title: "The calendar view",
    body: "The whole month at a glance, with RSVPs you've made and the gatherings near you highlighted.",
    to: "/calendar",
    cta: "Open the calendar",
  },
  {
    icon: FiHeart,
    title: "Host your own",
    body: "A step-by-step guide to running a supper club, workshop, or screening — with partner spaces and member support.",
    to: "/host",
    cta: "Host a gathering",
  },
  {
    icon: FiCamera,
    title: "Relive the last one",
    body: "Photos, notes, and the headcount from gatherings that have already happened.",
    to: "/gathering-recap",
    cta: "See recaps",
  },
];

export const FEATURED = [
  {
    dd: "06",
    mm: "Jun",
    type: "Supper Club",
    title: "Queer Supper Club №12",
    hood: "Mouraria",
    spots: "8 seats left",
    to: "/gathering",
  },
  {
    dd: "14",
    mm: "Jun",
    type: "Mixer",
    title: "Portfolio Night: Designers & Photographers",
    hood: "Príncipe Real",
    spots: "32 going",
    to: "/event",
  },
  {
    dd: "21",
    mm: "Jun",
    type: "Workshop",
    title: "Riso printing for beginners",
    hood: "Marvila",
    spots: "4 spots left",
    to: "/event",
  },
];

export const HOODS = [
  "Príncipe Real",
  "Alfama",
  "Marvila",
  "Mouraria",
  "Graça",
  "Cais do Sodré",
  "Arroios",
  "Bairro Alto",
];
