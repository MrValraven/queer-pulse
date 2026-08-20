import { routes } from "../../../app/routeMap";

/** A single footer link. `icon` (when present) renders a leading glyph. */
export interface FooterLink {
  /** Catalog key for the visible label — resolve with `t()`. */
  labelKey: string;
  href: string;
  icon?: "accessibility";
}
export interface FooterColumn {
  /** Catalog key for the column heading — resolve with `t()`. */
  headingKey: string;
  links: FooterLink[];
}

/**
 * Four balanced columns (5–6 links each). The long tail of routes is reachable
 * via the nav / sitemap and deliberately kept out of the footer for scannability.
 */
export const COLUMNS: FooterColumn[] = [
  {
    headingKey: "shared:megaNav.community.title",
    links: [
      // People
      { labelKey: "nav:forum", href: routes.forum },
      {
        labelKey: "shared:megaNav.community.col.organise.changeMakers",
        href: routes.changemakers,
      },
      // Gather
      { labelKey: "nav:gatherings", href: routes.events },
      { labelKey: "nav:communities", href: routes.communities },
      {
        labelKey: "shared:megaNav.community.col.organise.activismVolunteering",
        href: routes.volunteer,
      },
    ],
  },
  {
    headingKey: "shared:footerData.col.lisbonLife.head",
    links: [
      {
        labelKey: "shared:megaNav.lisbon.col.discover.businessDirectory",
        href: routes.directory,
      },
      {
        labelKey: "shared:footerData.col.lisbonLife.housingBoard",
        href: routes.housing,
      },
      {
        labelKey: "shared:megaNav.work.col.career.jobBoard",
        href: routes.jobs,
      },
      { labelKey: "nav:arriving", href: routes.arriving },
      {
        labelKey: "shared:megaNav.work.col.economy.skillsExchange",
        href: routes.barter,
      },
    ],
  },
  {
    headingKey: "shared:footerData.col.support.head",
    links: [
      {
        labelKey: "shared:megaNav.resources.col.health.wellbeingHub",
        href: routes.wellbeing,
      },
      {
        labelKey: "shared:footerData.col.support.therapistDirectory",
        href: `${routes.wellbeing}#therapists`,
      },
      {
        labelKey: "shared:footerData.col.support.legalAid",
        href: routes.legal,
      },
      {
        labelKey: "shared:megaNav.resources.col.learn.transNbHub",
        href: routes.transHub,
      },
      {
        labelKey: "shared:megaNav.work.col.economy.grants",
        href: routes.grants,
      },
      {
        labelKey: "shared:footerData.col.support.reportSafety",
        href: routes.report,
      },
      {
        labelKey: "shared:footerData.col.support.hateCrimeGuide",
        href: routes.hateCrime,
      },
    ],
  },
  {
    headingKey: "nav:members",
    links: [
      { labelKey: "nav:members", href: "#discovery" },
      { labelKey: "shared:accountMenu.items.messages", href: routes.messages },
      {
        labelKey: "shared:footerData.col.members.guideLibrary",
        href: routes.library,
      },
      {
        labelKey: "shared:megaNav.work.col.career.mentorship",
        href: routes.mentorship,
      },
      { labelKey: "common:cta.requestInvite", href: routes.requestInvite },
    ],
  },
];

/** Quiet legal / utility row in the bottom bar of the full footer. */
export const BASE_LINKS: FooterLink[] = [
  {
    labelKey: "shared:megaNav.about.col.legal.termsOfUse",
    href: routes.terms,
  },
  { labelKey: "shared:footerData.base.privacy", href: routes.privacy },
  { labelKey: "shared:footerData.base.cookies", href: routes.cookies },
  { labelKey: "shared:footerData.base.imprint", href: routes.imprint },
  { labelKey: "shared:footerData.base.guidelines", href: routes.guidelines },
  { labelKey: "shared:footerData.base.security", href: routes.security },
  { labelKey: "shared:adminNav.items.governance", href: routes.governance },
  {
    labelKey: "marketing:roadmap.subpageIndex.changelog.label",
    href: routes.changelog,
  },
  { labelKey: "shared:megaNav.about.col.legal.contact", href: routes.contact },
];

export interface SocialLink {
  /** Kept in English (brand names / a common borrowed term) — no catalog key. */
  label: string;
  href: string;
  icon: "instagram" | "youtube" | "mastodon" | "newsletter";
}
/** Prototype: links point at `#`; real handles would replace them. */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "YouTube", href: "#", icon: "youtube" },
  { label: "Mastodon", href: "#", icon: "mastodon" },
  { label: "Newsletter", href: "#", icon: "newsletter" },
];
