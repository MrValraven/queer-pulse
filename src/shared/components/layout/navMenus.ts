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
  /** Catalog key for the visible label — resolve with `t()`. */
  labelKey: string;
  href: string;
  featured?: boolean;
}

export interface MegaColumn {
  /** Catalog key for the column heading — resolve with `t()`. */
  headKey: string;
  links: MegaLink[];
  /**
   * Optional call-to-action rendered as a `<Button>` beneath the column's
   * links, foregrounding the column's primary "do" action (e.g. hosting a
   * gathering) instead of burying it as one more plain text link.
   */
  cta?: MegaLink;
}

/** Promo cell shown on the left of each mega panel, foregrounding the menu's hero destination. */
export interface MegaFeature {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  href: string;
  ctaKey: string;
}

export interface MegaMenu {
  /**
   * Stable English identifier — used for React keys, DOM ids, and internal
   * comparisons (open/trigger tracking). Never rendered directly; the visible
   * name is `titleKey`, resolved via `t()`.
   */
  key: string;
  /** Catalog key for the menu's visible name (button text, aria-labels). */
  titleKey: string;
  /** Catalog key for the rail subtitle shown under the title in the new mega panel. */
  subtitleKey: string;
  /** Catalog key for the ImageSlot placeholder caption in the panel's preview card. */
  previewCaptionKey: string;
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
          cta:
            column.cta && isVisible(column.cta.href) ? column.cta : undefined,
        }))
        .filter((column) => column.links.length > 0 || column.cta);
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
    titleKey: "shared:megaNav.community.title",
    subtitleKey: "shared:megaNav.community.subtitle",
    previewCaptionKey: "shared:megaNav.community.previewCaption",
    icon: FiUsers,
    feature: {
      eyebrowKey: "shared:megaNav.community.feature.eyebrow",
      titleKey: "shared:megaNav.community.feature.title",
      bodyKey: "shared:megaNav.community.feature.body",
      href: routes.members,
      ctaKey: "shared:megaNav.community.feature.cta",
    },
    featurePublic: {
      eyebrowKey: "shared:megaNav.community.featurePublic.eyebrow",
      titleKey: "shared:megaNav.community.featurePublic.title",
      bodyKey: "shared:megaNav.community.featurePublic.body",
      href: routes.volunteer,
      ctaKey: "shared:megaNav.community.featurePublic.cta",
    },
    columns: [
      {
        headKey: "shared:megaNav.community.col.people.head",
        links: [
          {
            labelKey: "shared:megaNav.community.col.people.membersDirectory",
            href: routes.members,
          },
          { labelKey: "nav:forum", href: routes.forum },
          {
            labelKey: "shared:megaNav.community.col.organise.changeMakers",
            href: routes.changemakers,
          },
        ],
      },
      {
        headKey: "shared:megaNav.community.col.gather.head",
        links: [
          {
            labelKey: "shared:megaNav.community.col.gather.events",
            href: routes.events,
          },
          { labelKey: "nav:communities", href: routes.communities },
          {
            // Activism folded into Volunteering: one entry, the Volunteer page
            // is the entry point; the activism guide is reached from there.
            labelKey: "shared:megaNav.community.col.organise.activismVolunteering",
            href: routes.volunteer,
          },
        ],
      },
    ],
  },
  {
    key: "Lisbon",
    titleKey: "shared:megaNav.lisbon.title",
    subtitleKey: "shared:megaNav.lisbon.subtitle",
    previewCaptionKey: "shared:megaNav.lisbon.previewCaption",
    icon: FiMapPin,
    feature: {
      eyebrowKey: "shared:megaNav.lisbon.feature.eyebrow",
      titleKey: "shared:megaNav.lisbon.feature.title",
      bodyKey: "shared:megaNav.lisbon.feature.body",
      href: routes.directory,
      ctaKey: "shared:megaNav.lisbon.feature.cta",
    },
    featurePublic: {
      eyebrowKey: "shared:megaNav.lisbon.featurePublic.eyebrow",
      titleKey: "shared:megaNav.lisbon.featurePublic.title",
      bodyKey: "shared:megaNav.lisbon.featurePublic.body",
      href: routes.safeSpaces,
      ctaKey: "shared:megaNav.lisbon.featurePublic.cta",
    },
    columns: [
      {
        headKey: "shared:megaNav.lisbon.col.discover.head",
        // The directory (featured) is the single browse surface for local
        // spaces — it now carries the verified badge + `?safe=verified` filter
        // directly. "How verification works" is deliberately NOT a nav link:
        // the safe-spaces hub is a trust *destination* reached in context —
        // from the explainer section on the directory page and from the line
        // inside each verified listing's trust block — not a top-level entry.
        // The logged-out `featurePublic` promo still spotlights it. See the
        // copy in `shared:megaNav.lisbon.{feature,featurePublic,col.discover}.*`.
        links: [
          {
            labelKey: "shared:megaNav.lisbon.col.discover.businessDirectory",
            href: routes.directory,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.lisbon.col.discover.partners",
            href: routes.partners,
          },
        ],
      },
      {
        headKey: "shared:megaNav.lisbon.col.livingHere.head",
        links: [
          { labelKey: "nav:arriving", href: routes.arriving },
          {
            labelKey: "shared:megaNav.lisbon.col.livingHere.housing",
            href: routes.housing,
          },
          {
            labelKey: "shared:megaNav.lisbon.col.livingHere.visasResidency",
            href: routes.visas,
          },
        ],
      },
    ],
  },
  {
    key: "Resources",
    titleKey: "shared:megaNav.resources.title",
    subtitleKey: "shared:megaNav.resources.subtitle",
    previewCaptionKey: "shared:megaNav.resources.previewCaption",
    icon: FiLifeBuoy,
    feature: {
      eyebrowKey: "shared:megaNav.resources.feature.eyebrow",
      titleKey: "shared:megaNav.resources.feature.title",
      bodyKey: "shared:megaNav.resources.feature.body",
      href: routes.resources,
      ctaKey: "shared:megaNav.resources.feature.cta",
    },
    columns: [
      {
        headKey: "shared:megaNav.resources.col.health.head",
        links: [
          {
            labelKey: "shared:megaNav.resources.col.health.mentalHealth",
            href: routes.mentalHealth,
          },
          {
            labelKey: "shared:megaNav.resources.col.health.sexualHealth",
            href: routes.sexualHealth,
          },
          {
            labelKey: "shared:megaNav.resources.col.health.transHealthcare",
            href: routes.transHealthcare,
          },
          {
            labelKey: "shared:megaNav.resources.col.health.wellbeingHub",
            href: routes.wellbeing,
          },
          {
            labelKey: "shared:megaNav.resources.col.safety.safetyGuide",
            href: routes.safety,
          },
        ],
      },
      {
        headKey: "shared:megaNav.resources.col.learn.head",
        links: [
          {
            labelKey: "shared:megaNav.resources.col.learn.resourceLibrary",
            href: routes.resources,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.resources.col.learn.transNbHub",
            href: routes.transHub,
          },
          {
            labelKey: "shared:megaNav.resources.col.learn.comingOut",
            href: routes.comingOut,
          },
          {
            labelKey: "shared:megaNav.resources.col.learn.familyParenting",
            href: routes.family,
          },
          {
            labelKey: "shared:megaNav.resources.col.learn.forCaregivers",
            href: routes.caregivers,
          },
          {
            labelKey: "shared:megaNav.community.col.people.dating",
            href: routes.dating,
          },
        ],
      },
    ],
  },
  {
    key: "Culture",
    titleKey: "shared:megaNav.culture.title",
    subtitleKey: "shared:megaNav.culture.subtitle",
    previewCaptionKey: "shared:megaNav.culture.previewCaption",
    icon: FiBookOpen,
    feature: {
      eyebrowKey: "shared:megaNav.culture.feature.eyebrow",
      titleKey: "shared:megaNav.culture.feature.title",
      bodyKey: "shared:megaNav.culture.feature.body",
      href: routes.magazine,
      ctaKey: "shared:megaNav.culture.feature.cta",
    },
    columns: [
      {
        headKey: "shared:megaNav.culture.col.magazine.head",
        links: [
          {
            labelKey: "shared:megaNav.culture.col.magazine.currentIssue",
            href: routes.magazine,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.culture.col.magazine.allIssues",
            href: routes.issues,
          },
          {
            labelKey: "shared:megaNav.culture.col.magazine.stories",
            href: routes.story,
          },
          {
            labelKey: "shared:megaNav.culture.col.magazine.writeForUs",
            href: routes.submitStory,
          },
        ],
      },
      {
        headKey: "shared:megaNav.culture.col.makers.head",
        links: [
          {
            labelKey: "shared:megaNav.culture.col.screenSound.cinema",
            href: routes.cinema,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.culture.col.makers.studio",
            href: routes.studio,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.culture.col.makers.platforms",
            href: routes.platforms,
          },
          {
            labelKey: "shared:megaNav.culture.col.makers.readingGroups",
            href: routes.readingGroups,
          },
          {
            labelKey: "shared:megaNav.culture.col.makers.lisbonScene",
            href: routes.culture,
          },
        ],
      },
    ],
  },
  {
    key: "Work",
    titleKey: "shared:megaNav.work.title",
    subtitleKey: "shared:megaNav.work.subtitle",
    previewCaptionKey: "shared:megaNav.work.previewCaption",
    icon: FiBriefcase,
    feature: {
      eyebrowKey: "shared:megaNav.work.feature.eyebrow",
      titleKey: "shared:megaNav.work.feature.title",
      bodyKey: "shared:megaNav.work.feature.body",
      href: routes.work,
      ctaKey: "shared:megaNav.work.feature.cta",
    },
    columns: [
      {
        headKey: "shared:megaNav.work.col.career.head",
        links: [
          {
            labelKey: "shared:megaNav.work.col.career.yourWork",
            href: routes.work,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.work.col.career.jobBoard",
            href: routes.jobs,
          },
          {
            labelKey: "shared:megaNav.work.col.career.skillsLearning",
            href: routes.skills,
          },
          {
            labelKey: "shared:megaNav.work.col.career.mentorship",
            href: routes.mentorship,
          },
          {
            labelKey: "shared:megaNav.work.col.career.employerReviews",
            href: routes.employerReviews,
          },
        ],
      },
      {
        headKey: "shared:megaNav.work.col.economy.head",
        links: [
          {
            labelKey: "shared:megaNav.work.col.economy.skillsExchange",
            href: routes.barter,
            featured: true,
          },
          {
            labelKey: "shared:megaNav.work.col.economy.solidarityPricing",
            href: routes.solidarity,
          },
          {
            labelKey: "shared:megaNav.work.col.economy.grants",
            href: routes.grants,
          },
          {
            labelKey: "shared:megaNav.work.col.economy.howItWorks",
            href: routes.economy,
          },
          {
            labelKey: "shared:megaNav.work.col.economy.offerSkill",
            href: routes.offer,
          },
        ],
      },
    ],
  },
  {
    key: "About",
    titleKey: "shared:megaNav.about.title",
    subtitleKey: "shared:megaNav.about.subtitle",
    previewCaptionKey: "shared:megaNav.about.previewCaption",
    icon: FiInfo,
    feature: {
      eyebrowKey: "shared:megaNav.about.feature.eyebrow",
      titleKey: "shared:megaNav.about.feature.title",
      bodyKey: "shared:megaNav.about.feature.body",
      href: routes.about,
      ctaKey: "shared:megaNav.about.feature.cta",
    },
    columns: [
      {
        headKey: "shared:megaNav.about.col.mission.head",
        links: [
          {
            labelKey: "shared:megaNav.about.col.mission.aboutQueerPulse",
            href: routes.about,
            featured: true,
          },
          {
            labelKey: "shared:adminNav.items.governance",
            href: routes.governance,
          },
        ],
      },
      {
        headKey: "shared:megaNav.about.col.using.head",
        links: [
          {
            labelKey: "shared:megaNav.about.col.using.helpFaq",
            href: routes.help,
          },
          {
            labelKey: "shared:megaNav.about.col.using.roadmap",
            href: routes.roadmap,
          },
          {
            labelKey: "shared:megaNav.about.col.using.forOrganisations",
            href: routes.forOrganisations,
          },
        ],
      },
      {
        headKey: "shared:megaNav.about.col.legal.head",
        links: [
          {
            labelKey: "shared:megaNav.about.col.legal.privacyPolicy",
            href: routes.privacy,
          },
          {
            labelKey: "shared:megaNav.about.col.legal.termsOfUse",
            href: routes.terms,
          },
          {
            labelKey: "shared:megaNav.about.col.legal.pressKit",
            href: routes.pressKit,
          },
          {
            labelKey: "shared:megaNav.about.col.legal.contact",
            href: routes.contact,
          },
        ],
      },
    ],
  },
];
