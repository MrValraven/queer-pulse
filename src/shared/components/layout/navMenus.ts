import type { IconType } from "react-icons";
import {
  FiUsers,
  FiMapPin,
  FiLifeBuoy,
  FiBookOpen,
  FiBriefcase,
  FiInfo,
} from "react-icons/fi";
import { linkToPath, routes } from "../../../app/routeMap";
export interface MegaLink {
  /** Catalog key for the visible label — resolve with `t()`. */
  labelKey: string;
  href: string;
  featured?: boolean;
  /**
   * Stamped by `filterMenus`, never written by hand in `NAV_MENUS`: this link
   * keeps its place in the nav on purpose while its destination still resolves
   * to a not-launched page, so the row renders a quiet "being built" marker
   * (`NavBuildBadge`) after the label. Without the marker a featured link into
   * an unlaunched surface reads as a broken link rather than a preview.
   */
  isBeingBuilt?: boolean;
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
 * Surfaces that deliberately KEEP their nav entry while every one of their
 * routes resolves to a not-launched page in live mode.
 *
 * Derived, not a second hand-kept list of names: these are exactly the two
 * features whose `routes.tsx` swaps its whole subtree for a coming-soon page
 * when `demoMode === false` (`cinemaRoutes` → `CinemaComingSoon`,
 * `studioRoutes` → `StudioComingSoonPage`), and the prefixes below are the same
 * `routes.*` constants those files branch on, so renaming a path moves both
 * together instead of drifting them apart.
 *
 * Everything else that is unlaunched is DROPPED from the nav rather than
 * badged, and that stays `authGate.ts`'s call: its `COMING_SOON_PATTERNS` (the
 * whole Work & Economy surface, hidden in shipped builds) and
 * `DEMO_ONLY_NAV_PATTERNS` (Culture) are both filtered out by
 * `useIsLinkVisible` before `filterMenus` ever inspects a link, so no link can
 * be dropped and badged at once. `authGate.ts` names Cinema and Studio as the
 * two deliberate exceptions to those lists; this is the other half of that
 * decision, the part that makes the signal visible.
 */
const BEING_BUILT_LIVE_PREFIXES: string[] = [routes.cinema, routes.studio];

/**
 * True when a nav link points into a surface that is still being built. Always
 * false in demo mode, where both surfaces render their full mock experience.
 */
export function isBeingBuiltLink(href: string, demoMode: boolean): boolean {
  if (demoMode) return false;
  const path = linkToPath(href).split(/[?#]/)[0] || "/";
  if (!path.startsWith("/")) return false; // external / mailto / tel
  return BEING_BUILT_LIVE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Stamp the "being built" marker on a link whose destination is not launched,
 * and take its `featured` emphasis away.
 *
 * Featuring is a column's one piece of emphasis, spent on the destination that
 * pays off today. Cinema and Studio were both `featured: true` while landing on
 * a coming-soon page, which is the actual defect the badge alone would not fix:
 * a bold, promoted row that goes nowhere reads as broken, and no amount of
 * marker copy beside it undoes the promise the emphasis already made. So the
 * link stays (that is the honest "this is being built" signal) and the emphasis
 * goes. In demo mode both surfaces are fully built, so nothing is demoted there
 * and the demo nav keeps its original hierarchy.
 */
function markBeingBuilt(link: MegaLink, demoMode: boolean): MegaLink {
  if (!isBeingBuiltLink(link.href, demoMode)) return link;
  return { ...link, featured: false, isBeingBuilt: true };
}

/**
 * Filter a menu list down to the links a visitor may see. `isVisible(href)`
 * comes from `useIsLinkVisible()`. Gated links are dropped, columns that end up
 * empty are removed, and a menu with no remaining columns is omitted entirely so
 * its top-level trigger disappears too.
 *
 * Surviving links are then run through `markBeingBuilt`, which is why
 * `demoMode` is a parameter: a link that is kept on purpose but lands on a
 * not-launched page comes back carrying `isBeingBuilt`, and the three link
 * renderers (`MegaNavColumns`, `MegaNavDrawer`, `SidebarGroup`) draw the marker
 * from that one flag.
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
  demoMode: boolean,
): MegaMenu[] {
  return menus
    .map((menu) => {
      const columns = menu.columns
        .map((column) => ({
          ...column,
          links: column.links
            .filter((link) => isVisible(link.href))
            .map((link) => markBeingBuilt(link, demoMode)),
          cta:
            column.cta && isVisible(column.cta.href)
              ? markBeingBuilt(column.cta, demoMode)
              : undefined,
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
            // DISC-4 — the topics directory, sitting next to Forum (its main
            // source of content once a tagged thread links into a topic —
            // see `TopicPostLinkService` on the backend).
            labelKey: "shared:megaNav.community.col.people.topics",
            href: routes.topics,
          },
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
            labelKey:
              "shared:megaNav.community.col.organise.activismVolunteering",
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
          // CON-10: the index of every guide route. Seventeen guides had no
          // link anywhere in the app; this is one of the two places that
          // reach them (the library page is the other).
          {
            labelKey: "shared:megaNav.resources.col.learn.guideIndex",
            href: routes.guideIndex,
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
          // Ordered first + featured: the Culture page is this whole menu's
          // namesake (club picks, commission board, art showcase, community
          // radio) but was sitting last and unfeatured in this column, below
          // links that all belong to other features. CNT-15.
          {
            labelKey: "shared:megaNav.culture.col.makers.lisbonScene",
            href: routes.culture,
            featured: true,
          },
          // Cinema and Studio are `featured` for the DEMO build, where both are
          // complete surfaces. In a live build every `/cinema/*` and `/studio/*`
          // route resolves to a coming-soon page, so `filterMenus` strips the
          // emphasis and stamps `isBeingBuilt` instead: the rows stay visible as
          // an honest "being built" signal, quietly marked, without a bold link
          // promising a destination that is not there yet. PRD-49.
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
        ],
      },
    ],
  },
  {
    key: "Work",
    titleKey: "shared:megaNav.work.title",
    subtitleKey: "shared:megaNav.work.subtitle",
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
            // Data Subject Access Request — same route/label already used
            // from PrivacyPage's "Request your data" related link.
            labelKey: "shared:megaNav.about.col.legal.dataRequest",
            href: routes.dsar,
          },
          {
            labelKey: "shared:footerData.base.cookies",
            href: routes.cookies,
          },
          {
            labelKey: "shared:footerData.base.guidelines",
            href: routes.guidelines,
          },
          {
            labelKey: "shared:footerData.base.imprint",
            href: routes.imprint,
          },
          {
            // LG-01: the published accessibility statement. Reachable from the
            // main navigation as well as the footer legal row, because a person
            // who needs it should not have to hunt for it.
            labelKey: "shared:megaNav.about.col.legal.accessibility",
            href: routes.policiesAccessibility,
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
