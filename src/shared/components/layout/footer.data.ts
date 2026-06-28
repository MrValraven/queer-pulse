import { routes } from "../../../app/routeMap";

/** A single footer link. `icon` (when present) renders a leading glyph. */
export interface FooterLink {
  label: string;
  href: string;
  icon?: "emergency" | "accessibility";
}
export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

/**
 * Four balanced columns (5–6 links each). The long tail of routes is reachable
 * via the nav / sitemap and deliberately kept out of the footer for scannability.
 */
export const COLUMNS: FooterColumn[] = [
  {
    heading: "Community",
    links: [
      { label: "Gatherings", href: "#gather" },
      { label: "Calendar", href: routes.calendar },
      { label: "Forum", href: routes.forum },
      { label: "Communities", href: routes.communities },
      { label: "Change Makers", href: routes.changemakers },
      { label: "Activism", href: routes.activism },
    ],
  },
  {
    heading: "Lisbon Life",
    links: [
      { label: "Spaces Map", href: routes.map },
      { label: "Business Directory", href: routes.directory },
      { label: "Housing Board", href: routes.housing },
      { label: "Job Board", href: routes.jobs },
      { label: "New to Lisbon?", href: routes.arriving },
      { label: "Skills Exchange", href: routes.barter },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Wellbeing Hub", href: routes.wellbeing },
      { label: "Therapist Directory", href: `${routes.wellbeing}#therapists` },
      { label: "Legal Aid", href: routes.legal },
      { label: "Trans & NB Hub", href: routes.transHub },
      { label: "Grants", href: routes.grants },
      { label: "Report & Safety", href: routes.report },
    ],
  },
  {
    heading: "Members",
    links: [
      { label: "Members", href: "#discovery" },
      { label: "Messages", href: routes.messages },
      { label: "Guide Library", href: routes.library },
      { label: "Mentorship", href: routes.mentorship },
      { label: "Request an invite", href: routes.requestInvite },
    ],
  },
];

/** Quiet legal / utility row in the bottom bar of the full footer. */
export const BASE_LINKS: FooterLink[] = [
  { label: "Emergency", href: routes.emergency, icon: "emergency" },
  { label: "Privacy", href: routes.privacy },
  { label: "Cookies", href: routes.cookies },
  { label: "Community guidelines", href: routes.guidelines },
  { label: "Accessibility", href: routes.accessibility, icon: "accessibility" },
  { label: "Security", href: routes.security },
  { label: "Governance", href: routes.governance },
  { label: "Contact", href: routes.contact },
];

export interface SocialLink {
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
