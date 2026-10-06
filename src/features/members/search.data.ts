import type { IconType } from "react-icons";
import {
  FiUser,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiHash,
  FiLayers,
  FiMessageSquare,
  FiMessageCircle,
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
  | "forumPost"
  | "business"
  | "magazine"
  | "job"
  | "housing"
  | "resource"
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
 * `GET /topics` rows through the same shape, so live search shows the real post
 * counts. `describePosts` turns the count into the
 * row's translated sub line (PRD-327), so the caller owns the language.
 */
export function topicResponseToSearchItem(
  topic: {
    tag: string;
    totalPosts: number;
  },
  describePosts: (totalPosts: number) => string,
): SearchItem {
  return {
    t: "topic",
    name: `#${topic.tag}`,
    sub: describePosts(topic.totalPosts),
    href: topicPath(topic.tag),
    kw: [topic.tag, "hashtag", "topic"].join(" "),
  };
}

/** Topic (hashtag) rows for DEMO mode, derived from the mock topics registry. */
export function demoTopicSearchItems(
  describePosts: (totalPosts: number) => string,
): SearchItem[] {
  return Object.values(TOPICS).map((topic) => ({
    ...topicResponseToSearchItem(topic, describePosts),
    // Demo rows also match on related-topic tags for richer local filtering.
    kw: [
      topic.tag,
      ...topic.relatedTopics.map((relatedTopic) => relatedTopic.tag),
      "hashtag",
      "topic",
    ].join(" "),
  }));
}

/**
 * A quick destination before translation. Its name and sub are catalog keys
 * that `useSearchData` resolves in the member's language (PRD-327); `kw` stays
 * a fixed English keyword list so a member can also find a page by its
 * English name in either language.
 */
export interface PageSearchEntry {
  nameKey: string;
  subKey: string;
  href: string;
  icon: IconType;
  kw: string;
}

// Quick destinations — real navigation targets, so they're safe (and identical)
// in demo and live. With no query typed these become a jump-to launcher; each
// carries its own `icon` so the "Pages" group reads at a glance. Grouped by
// intent below (core places → your account → discovery), but one flat list.
// An entry whose target is not launched in the current mode (Work & Economy,
// Culture, and Cinema and Studio in live mode) is filtered out by
// `useSearchData` through the same helpers the nav uses, so a launch brings
// its row back with no edit here.
export const PAGE_SEARCH_ENTRIES: PageSearchEntry[] = [
  // — Core destinations —
  {
    nameKey: "members:search.page.members.name",
    subKey: "members:search.page.members.sub",
    href: routes.members,
    icon: FiUsers,
    kw: "members people directory find profiles neighbours",
  },
  {
    nameKey: "members:search.page.communities.name",
    subKey: "members:search.page.communities.sub",
    href: routes.communities,
    icon: FiUsers,
    kw: "communities groups circles join belong collectives",
  },
  {
    nameKey: "members:search.page.events.name",
    subKey: "members:search.page.events.sub",
    href: routes.events,
    icon: FiCalendar,
    kw: "events gatherings calendar rsvp meetups happenings",
  },
  {
    nameKey: "members:search.page.forum.name",
    subKey: "members:search.page.forum.sub",
    href: routes.forum,
    icon: FiMessageSquare,
    kw: "forum discussions threads talk conversations posts",
  },
  {
    nameKey: "members:search.page.directory.name",
    subKey: "members:search.page.directory.sub",
    href: routes.directory,
    icon: FiMapPin,
    kw: "local business directory businesses places venues shops map spaces",
  },
  {
    nameKey: "members:search.page.safeSpaces.name",
    subKey: "members:search.page.safeSpaces.sub",
    href: `${routes.directory}?safe=verified`,
    icon: FiShield,
    kw: "safe spaces verified trust badge",
  },
  {
    nameKey: "members:search.page.messages.name",
    subKey: "members:search.page.messages.sub",
    href: routes.messages,
    icon: FiMessageSquare,
    kw: "messages dms chat inbox conversations",
  },
  {
    nameKey: "members:search.page.notifications.name",
    subKey: "members:search.page.notifications.sub",
    href: routes.notifications,
    icon: FiBell,
    kw: "notifications alerts activity updates mentions",
  },
  // — Your account —
  {
    nameKey: "members:search.page.profile.name",
    subKey: "members:search.page.profile.sub",
    href: routes.accountProfile,
    icon: FiUser,
    kw: "profile me account my page bio avatar",
  },
  {
    nameKey: "members:search.page.settings.name",
    subKey: "members:search.page.settings.sub",
    href: routes.settings,
    icon: FiSettings,
    kw: "settings preferences privacy account notifications options",
  },
  {
    nameKey: "members:search.page.saved.name",
    subKey: "members:search.page.saved.sub",
    href: routes.collections,
    icon: FiBookmark,
    kw: "saved bookmarks collections favourites starred",
  },
  {
    nameKey: "members:search.page.myEvents.name",
    subKey: "members:search.page.myEvents.sub",
    // `/account/events` redirects to the bare board, which opens on Discover
    // for a member with no RSVPs; an explicit `?tab=mine` always wins there
    // (`useEventsTopTab`), so the row lands on the member's own events.
    href: `${routes.events}?tab=mine`,
    icon: FiCalendar,
    kw: "my events rsvps going tickets attending",
  },
  {
    nameKey: "members:search.page.connections.name",
    subKey: "members:search.page.connections.sub",
    href: routes.connections,
    icon: FiLink,
    kw: "connections friends network links followers contacts",
  },
  {
    nameKey: "members:search.page.subprofiles.name",
    subKey: "members:search.page.subprofiles.sub",
    href: routes.subprofiles,
    icon: FiLayers,
    kw: "subprofiles personas directory professional developer musician writer",
  },
  {
    nameKey: "members:search.page.mySubprofiles.name",
    subKey: "members:search.page.mySubprofiles.sub",
    href: routes.subprofilesDashboard,
    icon: FiLayers,
    kw: "subprofiles personas manage dashboard professional",
  },
  // — Discovery —
  {
    nameKey: "members:search.page.magazine.name",
    subKey: "members:search.page.magazine.sub",
    href: routes.magazine,
    icon: FiBookOpen,
    kw: "magazine articles stories culture reading zine essays",
  },
  {
    nameKey: "members:search.page.resources.name",
    subKey: "members:search.page.resources.sub",
    href: routes.resources,
    icon: FiLifeBuoy,
    kw: "resources guides support help care health library",
  },
  {
    nameKey: "members:search.page.cinema.name",
    subKey: "members:search.page.cinema.sub",
    href: routes.cinema,
    icon: FiFilm,
    kw: "cinema film movies watch screenings shorts",
  },
  {
    nameKey: "members:search.page.studio.name",
    subKey: "members:search.page.studio.sub",
    href: routes.studio,
    icon: FiMusic,
    kw: "studio music sound tracks artists albums",
  },
  {
    nameKey: "members:search.page.housing.name",
    subKey: "members:search.page.housing.sub",
    href: routes.housing,
    icon: FiHome,
    kw: "housing homes flatmates rooms rent coop landlords",
  },
  {
    nameKey: "members:search.page.about.name",
    subKey: "members:search.page.about.sub",
    href: routes.about,
    icon: FiInfo,
    kw: "about mission story team info what is queerpulse",
  },
  {
    nameKey: "members:search.page.roadmap.name",
    subKey: "members:search.page.roadmap.sub",
    href: routes.roadmap,
    icon: FiMap,
    kw: "roadmap upcoming plans features vote ideas future",
  },
  {
    nameKey: "members:search.page.changelog.name",
    subKey: "members:search.page.changelog.sub",
    href: routes.changelog,
    icon: FiFileText,
    kw: "changelog updates releases new shipped history whats new",
  },
  {
    nameKey: "members:search.page.governance.name",
    subKey: "members:search.page.governance.sub",
    href: routes.governance,
    icon: FiShield,
    kw: "governance policy transparency finances decisions constitution",
  },
];

/**
 * The DEMO mock corpus of user content (members, events, communities, posts…).
 * The translated page and topic rows are joined in front of it by
 * `useSearchData`, which knows the member's language.
 */
export const SEARCH_DATA: SearchItem[] = [
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
  forumPost: "rgba(122,82,184,.1)",
  business: "rgba(74,140,111,.1)",
  magazine: "rgba(232,119,90,.1)",
  job: "rgba(74,140,111,.1)",
  housing: "rgba(122,82,184,.1)",
  resource: "rgba(74,140,111,.1)",
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
  forumPost: FiMessageCircle,
  business: FiShoppingBag,
  magazine: FiBookOpen,
  job: FiBriefcase,
  housing: FiHome,
  resource: FiLifeBuoy,
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
  forumPost: "members:search.type.forumPost",
  business: "members:search.type.business",
  magazine: "members:search.type.magazine",
  job: "members:search.type.job",
  housing: "members:search.type.housing",
  resource: "members:search.type.resource",
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
export interface SearchTab {
  id: ResultType | "all";
  labelKey: string;
}

/** The full category taxonomy: one tab per result type, plus the merged "all"
 *  view. This is the DEMO tab strip verbatim, because the demo corpus fills
 *  every one of these. Live mode narrows it through `visibleSearchTabs`. */
export const TABS: SearchTab[] = [
  { id: "all", labelKey: "members:search.type.all" },
  { id: "member", labelKey: "members:search.type.member" },
  { id: "community", labelKey: "members:search.type.community" },
  { id: "event", labelKey: "members:search.type.event" },
  { id: "forum", labelKey: "members:search.type.forum" },
  { id: "forumPost", labelKey: "members:search.type.forumPost" },
  { id: "business", labelKey: "members:search.type.business" },
  { id: "magazine", labelKey: "members:search.type.magazine" },
  { id: "job", labelKey: "members:search.type.job" },
  { id: "housing", labelKey: "members:search.type.housing" },
  { id: "resource", labelKey: "members:search.type.resource" },
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

/**
 * The tab strip live search should show, given the result types the backend
 * says it can currently answer with (`GET /search/types`, via
 * `api/useSearchTypes.ts`).
 *
 * A result type whose feature is closed is queried for nothing and returns
 * nothing, so its tab could only ever show the empty state. To a member that
 * reads as "your query found nothing" when the truth is "this surface is not
 * open", which is the same silent failure as an outage dressed up as zero
 * results. Rather than keep a hand-written list of what is closed beside the
 * taxonomy it mirrors, and let the two drift, the answer comes from the
 * backend and this filters against it.
 *
 * `launchedTypes` is `null` when that answer is not known yet: still in
 * flight, or the request failed. The strip then keeps only the tabs that
 * stand on no backend feature at all, so nothing it shows can be wrong:
 * "all" is a view rather than a type, and `NO_LIVE_SEARCH_TYPES` are the
 * client-side rows (static navigation shortcuts) that no flag governs.
 *
 * Demo mode does not call this: its corpus fills every tab, so it renders
 * `TABS` whole.
 */
export function visibleSearchTabs(
  launchedTypes: readonly ResultType[] | null,
): SearchTab[] {
  return TABS.filter((tabOption) => {
    if (tabOption.id === "all") return true;
    if (NO_LIVE_SEARCH_TYPES.has(tabOption.id)) return true;
    return launchedTypes !== null && launchedTypes.includes(tabOption.id);
  });
}

/** Mirrors the backend's `PER_TYPE_LIMIT` (`search.service.ts`) — the number
 *  of hits a type returns before it's "at cap" on the unfiltered, all-types
 *  view. Used to show a "see all in [category]" affordance instead of
 *  silently truncating (DISC-10). */
export const SEARCH_PER_TYPE_CAP = 6;

/** Mirrors `useSearchData`'s `SEE_ALL_LIMIT` — how many hits of one type a
 *  category tab asks the backend for in one go. A tab that comes back exactly
 *  this full has a next page, which `SearchLoadMore` fetches by `offset`
 *  (SOC-08). */
export const SEARCH_TAB_PAGE_SIZE = 50;
