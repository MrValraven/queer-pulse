import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiFeather,
  FiFilm,
  FiHeart,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiLayers,
  FiMail,
  FiMessageSquare,
  FiMusic,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";

/** One tile in the mobile "More" sheet. */
export interface MobileNavTile {
  /** Catalog key for the visible label, resolve with `t()`. */
  labelKey: string;
  href: string;
  icon: IconType;
  /** Catalog key for the one-line description under the label. */
  descriptionKey: string;
}

export interface MobileNavSection {
  /** Catalog key for the section heading, resolve with `t()`. */
  headKey: string;
  /**
   * Catalog key for the muted line beside the heading. Defaults to the mega
   * nav's `.subtitle` twin of `headKey`; set it when that line promises pages
   * the sheet leaves out.
   */
  subtitleKey?: string;
  tiles: MobileNavTile[];
}

/**
 * The short list the phone sheet shows. Deliberately a subset of `NAV_MENUS`
 * (which still drives the desktop mega nav and the left rail): the sheet is a
 * short list of rows, so it keeps the everyday destinations and leaves the
 * long tail to the footer. Labels reuse the keys `NAV_MENUS` owns, except
 * Studio and Cinema, whose desktop labels repeat their sheet description.
 * Order matters in the first section: `MoreSheetRows` lifts its first two
 * tiles (Communities, then the Local Business directory) into the coral and
 * plum shortcut cards above the list.
 */
export const MOBILE_NAV_SECTIONS: MobileNavSection[] = [
  {
    headKey: "shared:megaNav.community.title",
    tiles: [
      {
        labelKey: "nav:communities",
        href: routes.communities,
        icon: FiLayers,
        descriptionKey: "shared:mobileNav.desc.communities",
      },
      {
        labelKey: "shared:megaNav.community.col.discover.businessDirectory",
        href: routes.directory,
        icon: FiShoppingBag,
        descriptionKey: "shared:mobileNav.desc.businesses",
      },
      {
        labelKey: "shared:megaNav.community.col.people.membersDirectory",
        href: routes.members,
        icon: FiUsers,
        descriptionKey: "shared:mobileNav.desc.members",
      },
      {
        labelKey: "shared:megaNav.community.col.people.professionalDirectory",
        href: routes.subprofiles,
        icon: FiBriefcase,
        descriptionKey: "shared:mobileNav.desc.professionals",
      },
      {
        labelKey: "nav:forum",
        href: routes.forum,
        icon: FiMessageSquare,
        descriptionKey: "shared:mobileNav.desc.forum",
      },
      {
        labelKey: "nav:events",
        href: routes.events,
        icon: FiCalendar,
        descriptionKey: "shared:mobileNav.desc.events",
      },
      {
        labelKey: "shared:megaNav.community.col.organise.activismVolunteering",
        href: routes.volunteer,
        icon: FiHeart,
        descriptionKey: "shared:mobileNav.desc.activism",
      },
      {
        labelKey: "shared:megaNav.community.col.discover.housing",
        href: routes.housing,
        icon: FiHome,
        descriptionKey: "shared:mobileNav.desc.housing",
      },
    ],
  },
  {
    headKey: "shared:megaNav.resources.title",
    tiles: [
      {
        labelKey: "shared:megaNav.resources.col.learn.resourceLibrary",
        href: routes.resources,
        icon: FiBookOpen,
        descriptionKey: "shared:mobileNav.desc.resources",
      },
    ],
  },
  {
    headKey: "shared:megaNav.culture.title",
    tiles: [
      {
        labelKey: "magazine:masthead.brandMagazine",
        href: routes.magazine,
        icon: FiFeather,
        descriptionKey: "shared:mobileNav.desc.magazine",
      },
      {
        labelKey: "shared:mobileNav.label.studio",
        href: routes.studio,
        icon: FiMusic,
        descriptionKey: "shared:mobileNav.desc.studio",
      },
      {
        labelKey: "shared:mobileNav.label.cinema",
        href: routes.cinema,
        icon: FiFilm,
        descriptionKey: "shared:mobileNav.desc.cinema",
      },
    ],
  },
  {
    headKey: "shared:megaNav.about.title",
    subtitleKey: "shared:mobileNav.subtitle.about",
    tiles: [
      {
        labelKey: "shared:megaNav.about.col.mission.aboutQueerPulse",
        href: routes.about,
        icon: FiInfo,
        descriptionKey: "shared:mobileNav.desc.about",
      },
      {
        labelKey: "shared:megaNav.about.col.using.helpFaq",
        href: routes.help,
        icon: FiHelpCircle,
        descriptionKey: "shared:mobileNav.desc.help",
      },
      {
        labelKey: "shared:megaNav.about.col.legal.contact",
        href: routes.contact,
        icon: FiMail,
        descriptionKey: "shared:mobileNav.desc.contact",
      },
    ],
  },
];
