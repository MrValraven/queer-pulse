import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A — `issueNumber`/`date` are data (formatted through
 * `issueLabelText()` / `useFormat()` in the component); `taglineKey` is
 * platform chrome.
 */
export const MASTHEAD_META = {
  issueNumber: 18,
  date: new Date(2026, 5, 1),
  taglineKey: "magazine:masthead.tagline",
};

export interface MastheadNavItem {
  key: string;
  labelKey: string;
  href: string;
  /** Only surfaced in demo mode — its destination is fabricated content. */
  demoOnly?: boolean;
}

export const MASTHEAD_NAV: MastheadNavItem[] = [
  {
    key: "current",
    labelKey: "magazine:masthead.nav.current",
    href: routes.magazine,
  },
  {
    key: "issues",
    labelKey: "magazine:masthead.nav.issues",
    href: routes.issues,
  },
  {
    key: "stories",
    labelKey: "magazine:masthead.nav.stories",
    href: routes.story,
    demoOnly: true,
  },
  {
    key: "authors",
    labelKey: "magazine:masthead.nav.authors",
    href: routes.magazineAuthors,
  },
  {
    key: "write",
    labelKey: "magazine:masthead.nav.write",
    href: routes.submitStory,
  },
  {
    key: "sections",
    labelKey: "magazine:masthead.nav.sections",
    href: routes.magazineSections,
  },
];
