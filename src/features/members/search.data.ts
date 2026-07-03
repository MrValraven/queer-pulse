import type { IconType } from "react-icons";
import {
  FiUser,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiHash,
} from "react-icons/fi";
import { routes, topicPath } from "../../app/routeMap";
import { memberName } from "./data/members";
import { TOPICS } from "../topics/topics.data";
export type ResultType =
  "member" | "gathering" | "community" | "board" | "topic";

export interface SearchItem {
  t: ResultType;
  name: string;
  sub: string;
  href: string;
  kw: string;
  /** Member slug, so the palette can show the member's avatar (member rows only). */
  slug?: string;
}

/** Topic (hashtag) rows, derived from the topics feature's source of truth. */
const TOPIC_SEARCH_ITEMS: SearchItem[] = Object.values(TOPICS).map((topic) => ({
  t: "topic",
  name: `#${topic.tag}`,
  sub: `${topic.totalPosts} posts · curated`,
  href: topicPath(topic.tag),
  kw: [
    topic.tag,
    ...topic.relatedTopics.map((r) => r.tag),
    "hashtag",
    "topic",
  ].join(" "),
}));

export const SEARCH_DATA: SearchItem[] = [
  ...TOPIC_SEARCH_ITEMS,
  {
    t: "member",
    name: memberName("ines"),
    sub: "Graphic Designer · Príncipe Real",
    href: "/members/ines",
    kw: "design branding type editorial",
    slug: "ines",
  },
  {
    t: "member",
    name: memberName("rui"),
    sub: "Software Engineer · Marvila",
    href: "/members/rui",
    kw: "tech backend rust engineering",
    slug: "rui",
  },
  {
    t: "member",
    name: memberName("sofia"),
    sub: "Documentary Filmmaker · Alfama",
    href: "/members/sofia",
    kw: "film directing editing documentary",
    slug: "sofia",
  },
  {
    t: "member",
    name: memberName("tomas"),
    sub: "Chef · Supper Club Host · Mouraria",
    href: "/members/tomas",
    kw: "food supper club fermentation chef",
    slug: "tomas",
  },
  {
    t: "member",
    name: memberName("mariana"),
    sub: "Clinical Psychologist · Estrela",
    href: "/members/mariana",
    kw: "care therapy lgbtq psychologist",
    slug: "mariana",
  },
  {
    t: "member",
    name: memberName("andre"),
    sub: "Portrait Photographer · Cais do Sodré",
    href: "/members/andre",
    kw: "photography analog portrait darkroom",
    slug: "andre",
  },
  {
    t: "member",
    name: memberName("carla"),
    sub: "Product Manager · Arroios",
    href: "/members/carla",
    kw: "tech product fintech strategy",
    slug: "carla",
  },
  {
    t: "member",
    name: memberName("beatriz"),
    sub: "Ceramicist · Graça",
    href: "/members/beatriz",
    kw: "craft ceramics studio glazing",
    slug: "beatriz",
  },
  {
    t: "member",
    name: memberName("diogo"),
    sub: "Music Producer · Bairro Alto",
    href: "/members/diogo",
    kw: "music electronic dj producing",
    slug: "diogo",
  },
  {
    t: "gathering",
    name: "Queer Supper Club №12",
    sub: "Mouraria · 6 Jun — 8 seats left",
    href: "/gathering/supper-club-12",
    kw: "food social supper dinner",
  },
  {
    t: "gathering",
    name: "Portfolio Night: Designers & Photographers",
    sub: "Príncipe Real · 14 Jun — 32 going",
    href: "/gathering/portfolio-night",
    kw: "design photography portfolio mixer",
  },
  {
    t: "gathering",
    name: "Inside Beatriz's Ceramics Studio",
    sub: "Graça · 21 Jun — 3 spots left",
    href: "/gathering/studio-visit",
    kw: "craft ceramics studio visit",
  },
  {
    t: "gathering",
    name: "Founders & Builders Breakfast",
    sub: "Marvila · 2 Jul",
    href: "/gathering/founders-breakfast",
    kw: "founders tech breakfast networking",
  },
  {
    t: "community",
    name: "Queer Social Lisbon",
    sub: "Social · 340 members · Monthly",
    href: "/community/queer-social",
    kw: "social casual meetup monthly",
  },
  {
    t: "community",
    name: "Rainbow Arts Collective",
    sub: "Arts · 128 members · Monthly",
    href: "/community/rainbow-arts",
    kw: "arts visual collective studio",
  },
  {
    t: "community",
    name: "Trans Mutual Aid Network",
    sub: "Support · 89 members · Ongoing",
    href: "/community/trans-mutual-aid",
    kw: "trans support mutual aid peer",
  },
  {
    t: "community",
    name: "Queer Runners Lisboa",
    sub: "Sports · 214 members · Weekly",
    href: "/community/queer-runners",
    kw: "running sports outdoors weekly",
  },
  {
    t: "community",
    name: "Trans & Non-Binary Hub",
    sub: "Support · 147 members · Ongoing",
    href: "/community/trans-hub",
    kw: "trans nonbinary healthcare legal peer support",
  },
  {
    t: "community",
    name: "Queer Youth Network",
    sub: "Youth 18–25 · 93 members · Monthly",
    href: "/community/queer-youth",
    kw: "youth young career peer mentorship",
  },
  {
    t: "community",
    name: "Queer & of Colour",
    sub: "Activism · 76 members · Monthly",
    href: "/community/queer-poc",
    kw: "poc colour intersectional race activism",
  },
  {
    t: "board",
    name: "Free portrait sessions for trans & nonbinary members",
    sub: `Offering · ${memberName("andre")} · 2 days ago`,
    href: routes.offer,
    kw: "portrait free trans nonbinary",
  },
  {
    t: "board",
    name: "A collaborator for a queer zine launching in September",
    sub: `Looking for · ${memberName("ines")} · 3 days ago`,
    href: routes.offer,
    kw: "zine collab writing illustration design",
  },
  {
    t: "board",
    name: "Monthly mentoring for junior engineers",
    sub: `Offering · ${memberName("rui")} · 4 days ago`,
    href: routes.offer,
    kw: "mentoring tech engineering backend",
  },
  {
    t: "board",
    name: "A sublet in Arroios, June through August",
    sub: `Looking for · ${memberName("carla")} · 1 week ago`,
    href: routes.offer,
    kw: "housing sublet arroios rent",
  },
  {
    t: "board",
    name: "Two desks to share in a bright Graça studio",
    sub: `Offering · ${memberName("beatriz")} · 1 week ago`,
    href: routes.offer,
    kw: "desk studio workspace graça",
  },
  {
    t: "board",
    name: "A composer for a short documentary, paid",
    sub: `Looking for · ${memberName("sofia")} · 2 weeks ago`,
    href: routes.offer,
    kw: "music composer documentary film paid",
  },
];

export const TYPE_BG: Record<ResultType, string> = {
  member: "rgba(45,27,61,.08)",
  gathering: "rgba(74,140,111,.1)",
  community: "rgba(232,119,90,.1)",
  board: "rgba(122,82,184,.1)",
  topic: "rgba(232,119,90,.1)",
};
export const TYPE_ICON: Record<ResultType, IconType> = {
  member: FiUser,
  gathering: FiCalendar,
  community: FiUsers,
  board: FiClipboard,
  topic: FiHash,
};
export const TYPE_LABEL: Record<ResultType, string> = {
  member: "Members",
  gathering: "Gatherings",
  community: "Communities",
  board: "Board",
  topic: "Topics",
};
export const RECENTS = [
  "portrait sessions",
  "supper club",
  "ceramics studio",
  "mentoring engineers",
  "sublet arroios",
  "documentary composer",
];
export const TABS: { id: ResultType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "topic", label: "Topics" },
  { id: "member", label: "Members" },
  { id: "gathering", label: "Gatherings" },
  { id: "community", label: "Communities" },
  { id: "board", label: "Board" },
];
