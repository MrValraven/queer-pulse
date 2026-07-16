import type { IconType } from "react-icons";
import {
  FiUsers,
  FiMapPin,
  FiLifeBuoy,
  FiBookOpen,
  FiBriefcase,
  FiInfo,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
export interface MegaLink {
  label: string;
  href: string;
  featured?: boolean;
}

export interface MegaColumn {
  head: string;
  links: MegaLink[];
}

/** Promo cell shown on the left of each mega panel, foregrounding the menu's hero destination. */
export interface MegaFeature {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

export interface MegaMenu {
  key: string;
  /** Rail icon for the sidebar nav; the top MegaNav ignores it. */
  icon?: IconType;
  feature?: MegaFeature;
  /**
   * Public stand-in for `feature`, used when the primary promo points into the
   * gated member surface and the visitor is logged out. Lets public-facing
   * menus (Community, Lisbon) keep a highlighted main link that actually leads
   * somewhere a signed-out visitor can go, instead of dropping the promo.
   */
  featurePublic?: MegaFeature;
  columns: MegaColumn[];
}

/**
 * Filter a menu list down to the links a visitor may see. `isVisible(href)`
 * comes from `useIsLinkVisible()`. Gated links are dropped, columns that end up
 * empty are removed, and a menu with no remaining columns is omitted entirely so
 * its top-level trigger disappears too.
 *
 * The feature promo is the menu's highlighted "main link". When its destination
 * is gated (Community → members, Lisbon → directory), a logged-out visitor gets
 * the menu's `featurePublic` stand-in instead — a promo that leads somewhere
 * they can actually go — so the highlight never disappears. Only when neither is
 * reachable is the promo dropped, and that menu is usually omitted anyway once
 * all its columns are gated.
 */
export function filterMenus(
  menus: MegaMenu[],
  isVisible: (href: string) => boolean,
): MegaMenu[] {
  return menus
    .map((menu) => {
      const columns = menu.columns
        .map((column) => ({
          ...column,
          links: column.links.filter((link) => isVisible(link.href)),
        }))
        .filter((column) => column.links.length > 0);
      const feature =
        menu.feature && isVisible(menu.feature.href)
          ? menu.feature
          : menu.featurePublic && isVisible(menu.featurePublic.href)
            ? menu.featurePublic
            : undefined;
      return { ...menu, columns, feature };
    })
    .filter((menu) => menu.columns.length > 0);
}

export const NAV_MENUS: MegaMenu[] = [
  {
    key: "Community",
    icon: FiUsers,
    feature: {
      eyebrow: "Community",
      title: "Find your people.",
      body: "A member directory, forums, and gatherings — the everyday connective tissue of the network.",
      href: routes.members,
      cta: "Browse members",
    },
    featurePublic: {
      eyebrow: "Community",
      title: "Organise together.",
      body: "Campaigns, mutual aid, and volunteer crews — work you can show up for, no invite needed.",
      href: routes.activism,
      cta: "Get involved",
    },
    columns: [
      {
        head: "People",
        links: [
          { label: "Members directory", href: routes.members },
          { label: "Forum", href: routes.forum },
          { label: "Dating", href: routes.dating },
        ],
      },
      {
        head: "Gather",
        links: [
          { label: "Events", href: routes.events },
          { label: "Calendar", href: routes.calendar },
          { label: "Host a gathering", href: routes.host },
          { label: "Communities", href: routes.communities },
        ],
      },
      {
        head: "Organise",
        links: [
          { label: "Volunteer", href: routes.volunteer },
          { label: "Activism", href: routes.activism },
          { label: "Change Makers", href: routes.changemakers },
        ],
      },
    ],
  },
  {
    key: "Lisbon",
    icon: FiMapPin,
    feature: {
      eyebrow: "Lisbon",
      title: "Queer-owned Lisbon.",
      body: "Bars, clinics, salons, and shops that welcome you — found and vouched for by the community.",
      href: routes.directory,
      cta: "Browse the directory",
    },
    featurePublic: {
      eyebrow: "Lisbon",
      title: "Places that welcome you.",
      body: "Bars, clinics, and community spaces vouched for as safe by the people who go there.",
      href: routes.safeSpaces,
      cta: "Find safe spaces",
    },
    columns: [
      {
        head: "Discover",
        links: [
          {
            label: "Business Directory",
            href: routes.directory,
            featured: true,
          },
          { label: "Spaces Map", href: routes.map },
          { label: "Safe Spaces", href: routes.safeSpaces },
          { label: "Partners", href: routes.partners },
        ],
      },
      {
        head: "Living here",
        links: [
          { label: "New to Lisbon?", href: routes.arriving },
          { label: "Housing", href: routes.housing },
          { label: "Visas & Residency", href: routes.visas },
        ],
      },
    ],
  },
  {
    key: "Resources",
    icon: FiLifeBuoy,
    feature: {
      eyebrow: "Support",
      title: "Help when you need it.",
      body: "Health, safety, and rights — plus a library to learn at your own pace.",
      href: routes.resources,
      cta: "Open the library",
    },
    columns: [
      {
        head: "Health & wellbeing",
        links: [
          { label: "Mental Health", href: routes.mentalHealth },
          { label: "Sexual Health", href: routes.sexualHealth },
          { label: "Trans Healthcare", href: routes.transHealthcare },
          { label: "Wellbeing Hub", href: routes.wellbeing },
        ],
      },
      {
        head: "Safety & rights",
        links: [
          { label: "Emergency", href: routes.emergency, featured: true },
          { label: "Safety Guide", href: routes.safety },
        ],
      },
      {
        head: "Learn & belong",
        links: [
          {
            label: "Resource Library",
            href: routes.resources,
            featured: true,
          },
          { label: "Trans & NB Hub", href: routes.transHub },
          { label: "Coming Out", href: routes.comingOut },
          { label: "Family & parenting", href: routes.family },
          { label: "For caregivers", href: routes.caregivers },
        ],
      },
    ],
  },
  {
    key: "Culture",
    icon: FiBookOpen,
    feature: {
      eyebrow: "The Magazine",
      title: "Read the new issue.",
      body: "Essays, interviews, reviews and reportage from the community — published the first of every month.",
      href: routes.magazine,
      cta: "Open Issue 18",
    },
    columns: [
      {
        head: "The Magazine",
        links: [
          { label: "Current issue", href: routes.magazine, featured: true },
          { label: "All issues", href: routes.issues },
          { label: "Stories", href: routes.story },
          { label: "Write for us", href: routes.submitStory },
        ],
      },
      {
        head: "Screen & Sound",
        links: [
          { label: "Cinema · queer film", href: routes.cinema, featured: true },
          { label: "The Back Room (podcast)", href: routes.podcastShow },
          { label: "Radio · Now playing", href: routes.audioPlayer },
        ],
      },
      {
        head: "Makers & Scene",
        links: [
          {
            label: "Studio · queer music",
            href: routes.studio,
            featured: true,
          },
          { label: "Creatives", href: routes.creatives },
          { label: "Platforms", href: routes.platforms },
          { label: "Reading Groups", href: routes.readingGroups },
          { label: "Lisbon scene & radio", href: routes.culture },
        ],
      },
    ],
  },
  {
    key: "Work",
    icon: FiBriefcase,
    feature: {
      eyebrow: "Your workspace",
      title: "Your Work, in one place.",
      body: "Track applications, mentors, and grants — and show up to work exactly as yourself.",
      href: routes.work,
      cta: "Open your workspace",
    },
    columns: [
      {
        head: "Career",
        links: [
          { label: "Your Work", href: routes.work, featured: true },
          { label: "Job Board", href: routes.jobs },
          { label: "Skills & Learning", href: routes.skills },
          { label: "Mentorship", href: routes.mentorship },
          { label: "Employer Reviews", href: routes.employerReviews },
          { label: "Work profile", href: routes.workProfile },
        ],
      },
      {
        head: "Economy",
        links: [
          {
            label: "Skills Exchange",
            href: routes.barter,
            featured: true,
          },
          { label: "Solidarity Pricing", href: routes.solidarity },
          { label: "Grants", href: routes.grants },
          { label: "How our economy works", href: routes.economy },
          { label: "Offer a skill", href: routes.offer },
        ],
      },
    ],
  },
  {
    key: "About",
    icon: FiInfo,
    feature: {
      eyebrow: "About",
      title: "What QueerPulse is.",
      body: "Our mission, how we're governed, and the legal small print.",
      href: routes.about,
      cta: "About QueerPulse",
    },
    columns: [
      {
        head: "Mission & governance",
        links: [
          {
            label: "About QueerPulse",
            href: routes.about,
            featured: true,
          },
          { label: "The Manifesto", href: routes.manifesto },
          { label: "Governance", href: routes.governance },
          { label: "Cities", href: routes.cities },
        ],
      },
      {
        head: "Using QueerPulse",
        links: [
          { label: "Help & FAQ", href: routes.help },
          { label: "Roadmap", href: routes.roadmap },
          { label: "Get the app", href: routes.getTheApp },
          {
            label: "For organisations",
            href: routes.forOrganisations,
          },
        ],
      },
      {
        head: "Legal & press",
        links: [
          { label: "Privacy Policy", href: routes.privacy },
          { label: "Terms of Use", href: routes.terms },
          { label: "Press Kit", href: routes.pressKit },
          { label: "Contact", href: routes.contact },
        ],
      },
    ],
  },
];
