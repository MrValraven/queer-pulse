import type { IconType } from "react-icons";
import {
  FiUser,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiHash,
  FiLayers,
  FiMessageSquare,
  FiShoppingBag,
  FiMapPin,
  FiBell,
  FiSettings,
  FiBookmark,
  FiLink,
  FiBookOpen,
  FiLifeBuoy,
  FiFilm,
  FiMusic,
  FiHome,
  FiInfo,
  FiMap,
  FiFileText,
  FiShield,
  FiBriefcase,
  FiTool,
} from "react-icons/fi";
import { personaPath, routes, topicPath } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import { memberName } from "./data/members";
import { TOPICS } from "../topics/topics.data";
export type ResultType =
  | "member"
  | "community"
  | "event"
  | "forum"
  | "business"
  | "magazine"
  | "job"
  | "housing"
  | "resource"
  | "workshop"
  | "subprofile"
  | "topic"
  | "page"
  | "board";

export interface SearchItem {
  t: ResultType;
  name: string;
  sub: string;
  href: string;
  kw: string;
  /** Per-row icon override (page rows only), so each destination reads at a
   *  glance instead of every page sharing the generic `TYPE_ICON.page`. Falls
   *  back to the type icon when unset. */
  icon?: IconType;
  /** Member slug, so the palette can show the member's avatar (member rows only). */
  slug?: string;
  /** Live member avatar URL (member rows only). Demo rows resolve avatars from the local registry. */
  avatarUrl?: string;
}

/**
 * Build a topic (hashtag) search row from a topic's tag + post count. Shared by
 * the demo corpus (mock `TOPICS`) and the live palette, which feeds real
 * `GET /topics` rows through the same shape — so live search shows real post
 * counts instead of the mock ones.
 */
export function topicResponseToSearchItem(topic: {
  tag: string;
  totalPosts: number;
}): SearchItem {
  return {
    t: "topic",
    name: `#${topic.tag}`,
    sub: `${topic.totalPosts} posts · curated`,
    href: topicPath(topic.tag),
    kw: [topic.tag, "hashtag", "topic"].join(" "),
  };
}

/** Topic (hashtag) rows for DEMO mode, derived from the mock topics registry. */
const TOPIC_SEARCH_ITEMS: SearchItem[] = Object.values(TOPICS).map((topic) => ({
  ...topicResponseToSearchItem(topic),
  // Demo rows also match on related-topic tags for richer local filtering.
  kw: [
    topic.tag,
    ...topic.relatedTopics.map((r) => r.tag),
    "hashtag",
    "topic",
  ].join(" "),
}));

// Quick destinations — real navigation targets, so they're safe (and identical)
// in demo and live. With no query typed these become a jump-to launcher; each
// carries its own `icon` so the "Pages" group reads at a glance. Grouped by
// intent below (core places → your account → discovery), but one flat list.
export const PAGE_SEARCH_ITEMS: SearchItem[] = [
  // — Core destinations —
  {
    t: "page",
    name: "Members",
    sub: "Find people in the community",
    href: routes.members,
    icon: FiUsers,
    kw: "members people directory find profiles neighbours",
  },
  {
    t: "page",
    name: "Communities",
    sub: "Groups to join and belong to",
    href: routes.communities,
    icon: FiUsers,
    kw: "communities groups circles join belong collectives",
  },
  {
    t: "page",
    name: "Events",
    sub: "What's coming up near you",
    href: routes.events,
    icon: FiCalendar,
    kw: "events gatherings calendar rsvp meetups happenings",
  },
  {
    t: "page",
    name: "Forum",
    sub: "Conversations across the community",
    href: routes.forum,
    icon: FiMessageSquare,
    kw: "forum discussions threads talk conversations posts",
  },
  {
    t: "page",
    name: "Local Business directory",
    sub: "Queer-friendly places and businesses",
    href: routes.directory,
    icon: FiMapPin,
    kw: "local business directory businesses places venues shops map spaces",
  },
  {
    t: "page",
    name: "Verified safe spaces",
    sub: "Places reviewed and vouched for by the community",
    href: `${routes.directory}?safe=verified`,
    icon: FiShield,
    kw: "safe spaces verified trust badge",
  },
  {
    t: "page",
    name: "Messages",
    sub: "Your direct conversations",
    href: routes.messages,
    icon: FiMessageSquare,
    kw: "messages dms chat inbox conversations",
  },
  {
    t: "page",
    name: "Notifications",
    sub: "What you've missed",
    href: routes.notifications,
    icon: FiBell,
    kw: "notifications alerts activity updates mentions",
  },
  // — Your account —
  {
    t: "page",
    name: "My profile",
    sub: "How others see you",
    href: routes.accountProfile,
    icon: FiUser,
    kw: "profile me account my page bio avatar",
  },
  {
    t: "page",
    name: "Settings",
    sub: "Account, privacy and preferences",
    href: routes.settings,
    icon: FiSettings,
    kw: "settings preferences privacy account notifications options",
  },
  {
    t: "page",
    name: "Saved",
    sub: "Everything you've bookmarked",
    href: routes.collections,
    icon: FiBookmark,
    kw: "saved bookmarks collections favourites starred",
  },
  {
    t: "page",
    name: "My events",
    sub: "What you're going to",
    href: routes.events,
    icon: FiCalendar,
    kw: "my events rsvps going tickets attending",
  },
  {
    t: "page",
    name: "Connections",
    sub: "The people you're linked with",
    href: routes.connections,
    icon: FiLink,
    kw: "connections friends network links followers contacts",
  },
  {
    t: "page",
    name: "Browse subprofiles",
    sub: "The persona directory",
    href: routes.subprofiles,
    icon: FiLayers,
    kw: "subprofiles personas directory professional developer musician writer",
  },
  {
    t: "page",
    name: "My subprofiles",
    sub: "Your professional personas",
    href: routes.subprofilesDashboard,
    icon: FiLayers,
    kw: "subprofiles personas manage dashboard professional",
  },
  // — Discovery —
  {
    t: "page",
    name: "Magazine",
    sub: "Stories, culture and voices",
    href: routes.magazine,
    icon: FiBookOpen,
    kw: "magazine articles stories culture reading zine essays",
  },
  {
    t: "page",
    name: "Resources",
    sub: "Guides, support and care",
    href: routes.resources,
    icon: FiLifeBuoy,
    kw: "resources guides support help care health library",
  },
  {
    t: "page",
    name: "Cinema",
    sub: "Queer film, watched together",
    href: routes.cinema,
    icon: FiFilm,
    kw: "cinema film movies watch screenings shorts",
  },
  {
    t: "page",
    name: "Studio",
    sub: "Music from the community",
    href: routes.studio,
    icon: FiMusic,
    kw: "studio music sound tracks artists albums",
  },
  {
    t: "page",
    name: "Housing",
    sub: "Homes, flatmates and co-ops",
    href: routes.housing,
    icon: FiHome,
    kw: "housing homes flatmates rooms rent coop landlords",
  },
  {
    t: "page",
    name: "About",
    sub: "What QueerPulse is and who's behind it",
    href: routes.about,
    icon: FiInfo,
    kw: "about mission story team info what is queerpulse",
  },
  {
    t: "page",
    name: "Roadmap",
    sub: "What we're building next",
    href: routes.roadmap,
    icon: FiMap,
    kw: "roadmap upcoming plans features vote ideas future",
  },
  {
    t: "page",
    name: "Changelog",
    sub: "What's new lately",
    href: routes.changelog,
    icon: FiFileText,
    kw: "changelog updates releases new shipped history whats new",
  },
  {
    t: "page",
    name: "Governance",
    sub: "How decisions get made",
    href: routes.governance,
    icon: FiShield,
    kw: "governance policy transparency finances decisions constitution",
  },
];

/** Curated, non-user items safe to show in BOTH demo and live (no persona leak). */
export const STATIC_SEARCH_ITEMS: SearchItem[] = [
  ...PAGE_SEARCH_ITEMS,
  ...TOPIC_SEARCH_ITEMS,
];

export const SEARCH_DATA: SearchItem[] = [
  ...STATIC_SEARCH_ITEMS,
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
    kw: "photography analog portrait studio",
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
    t: "event",
    name: "Queer Supper Club №12",
    sub: "Mouraria · 6 Jun, 8 seats left",
    href: gatheringPath("supper-club-12"),
    kw: "food social supper dinner",
  },
  {
    t: "event",
    name: "Portfolio Night: Designers & Photographers",
    sub: "Príncipe Real · 14 Jun, 32 going",
    href: gatheringPath("portfolio-night"),
    kw: "design photography portfolio mixer",
  },
  {
    t: "event",
    name: "Inside Beatriz's Ceramics Studio",
    sub: "Graça · 21 Jun, 3 spots left",
    href: gatheringPath("studio-visit"),
    kw: "craft ceramics studio visit",
  },
  {
    t: "event",
    name: "Founders & Builders Breakfast",
    sub: "Marvila · 2 Jul",
    href: gatheringPath("founders-breakfast"),
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
  {
    t: "magazine",
    name: "The Kitchen as Sanctuary",
    sub: "Food, memory and queer belonging",
    href: `${routes.article}?id=kitchen-sanctuary`,
    kw: "magazine article food essay culture kitchen story",
  },
  {
    t: "magazine",
    name: "Notes on Chosen Family",
    sub: "First-person · Community",
    href: `${routes.article}?id=chosen-family`,
    kw: "magazine article chosen family essay belonging",
  },
  {
    t: "job",
    name: "Community Manager",
    sub: "Full-time · Lisbon",
    href: `${routes.jobs}/community-manager`,
    kw: "job work role hiring community manager",
  },
  {
    t: "job",
    name: "Freelance Illustrator for a queer zine",
    sub: "Contract · Remote",
    href: `${routes.jobs}/zine-illustrator`,
    kw: "job work freelance illustrator zine design",
  },
  {
    t: "housing",
    name: "Sunny room in a queer flatshare",
    sub: "Arroios · €520/mo",
    href: `${routes.housing}/sunny-room-arroios`,
    kw: "housing room flatshare arroios rent home",
  },
  {
    t: "housing",
    name: "Studio near Marvila, trans-friendly",
    sub: "Marvila · €780/mo",
    href: `${routes.housing}/studio-marvila`,
    kw: "housing studio marvila rent home trans friendly",
  },
  {
    t: "resource",
    name: "Trans healthcare in Portugal",
    sub: "Guide · Health & care",
    href: `${routes.resources}/trans-healthcare`,
    kw: "resource guide trans healthcare support health",
  },
  {
    t: "resource",
    name: "Coming out at work",
    sub: "Guide · Rights & workplace",
    href: `${routes.resources}/coming-out-at-work`,
    kw: "resource guide coming out work rights workplace",
  },
  {
    t: "workshop",
    name: "Intro to Film Photography",
    sub: "6 weeks · In person",
    href: `${routes.skills}/film-photography`,
    kw: "workshop skills class film photography learn course",
  },
  {
    t: "workshop",
    name: "Ceramics for Beginners",
    sub: "4 weeks · Graça studio",
    href: `${routes.skills}/ceramics-beginners`,
    kw: "workshop skills class ceramics pottery learn course",
  },
  {
    t: "subprofile",
    name: "Rui builds things",
    sub: "Persona · Software & hardware",
    href: personaPath("rui-builds"),
    kw: "subprofile persona developer engineer maker hardware",
  },
  {
    t: "subprofile",
    name: "Inês / studio work",
    sub: "Persona · Design & branding",
    href: personaPath("ines-studio"),
    kw: "subprofile persona designer branding studio",
  },
];

export const TYPE_BG: Record<ResultType, string> = {
  member: "rgba(45,27,61,.08)",
  event: "rgba(74,140,111,.1)",
  community: "rgba(232,119,90,.1)",
  forum: "rgba(122,82,184,.1)",
  business: "rgba(74,140,111,.1)",
  magazine: "rgba(232,119,90,.1)",
  job: "rgba(74,140,111,.1)",
  housing: "rgba(122,82,184,.1)",
  resource: "rgba(74,140,111,.1)",
  workshop: "rgba(232,119,90,.1)",
  subprofile: "rgba(122,82,184,.1)",
  board: "rgba(122,82,184,.1)",
  topic: "rgba(232,119,90,.1)",
  page: "rgba(74,140,111,.1)",
};
export const TYPE_ICON: Record<ResultType, IconType> = {
  member: FiUser,
  event: FiCalendar,
  community: FiUsers,
  forum: FiMessageSquare,
  business: FiShoppingBag,
  magazine: FiBookOpen,
  job: FiBriefcase,
  housing: FiHome,
  resource: FiLifeBuoy,
  workshop: FiTool,
  subprofile: FiLayers,
  board: FiClipboard,
  topic: FiHash,
  page: FiLayers,
};
/** Category labels are catalog keys, not raw strings: a small, closed set of
 *  platform-defined result-type names (chrome), resolved through `t()` by the
 *  consuming component. */
export const TYPE_LABEL_KEY: Record<ResultType, string> = {
  member: "members:search.type.member",
  event: "members:search.type.event",
  community: "members:search.type.community",
  forum: "members:search.type.forum",
  business: "members:search.type.business",
  magazine: "members:search.type.magazine",
  job: "members:search.type.job",
  housing: "members:search.type.housing",
  resource: "members:search.type.resource",
  workshop: "members:search.type.workshop",
  subprofile: "members:search.type.subprofile",
  board: "members:search.type.board",
  topic: "members:search.type.topic",
  page: "members:search.type.page",
};
export const RECENTS = [
  "portrait sessions",
  "supper club",
  "ceramics studio",
  "mentoring engineers",
  "sublet arroios",
  "documentary composer",
];
export const TABS: { id: ResultType | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "members:search.type.all" },
  { id: "member", labelKey: "members:search.type.member" },
  { id: "community", labelKey: "members:search.type.community" },
  { id: "event", labelKey: "members:search.type.event" },
  { id: "forum", labelKey: "members:search.type.forum" },
  { id: "business", labelKey: "members:search.type.business" },
  { id: "magazine", labelKey: "members:search.type.magazine" },
  { id: "job", labelKey: "members:search.type.job" },
  { id: "housing", labelKey: "members:search.type.housing" },
  { id: "resource", labelKey: "members:search.type.resource" },
  { id: "workshop", labelKey: "members:search.type.workshop" },
  { id: "subprofile", labelKey: "members:search.type.subprofile" },
  { id: "topic", labelKey: "members:search.type.topic" },
  { id: "page", labelKey: "members:search.type.page" },
];

/** Result types with no backend search table: `page` (static navigation
 *  shortcuts) and `board` (no live equivalent yet). Every other `ResultType`,
 *  including `topic`, is a real `GET /search` `?type=` value — see
 *  `api/useSearchData.ts`'s `isLiveSearchType` and `api/search.api.ts`'s
 *  `LiveResultType`. */
export const NO_LIVE_SEARCH_TYPES = new Set<ResultType>(["page", "board"]);

/** Mirrors the backend's `PER_TYPE_LIMIT` (`search.service.ts`) — the number
 *  of hits a type returns before it's "at cap" on the unfiltered, all-types
 *  view. Used to show a "see all in [category]" affordance instead of
 *  silently truncating (DISC-10). */
export const SEARCH_PER_TYPE_CAP = 6;
