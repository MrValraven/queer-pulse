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
    key: "covers",
    labelKey: "magazine:masthead.nav.covers",
    href: routes.coverGallery,
  },
  {
    key: "longreads",
    labelKey: "magazine:masthead.nav.longreads",
    href: routes.tag,
  },
  {
    key: "stories",
    labelKey: "magazine:masthead.nav.stories",
    href: routes.story,
  },
  {
    key: "newsletter",
    labelKey: "magazine:masthead.nav.newsletter",
    href: routes.newsletterArchive,
  },
  {
    key: "write",
    labelKey: "magazine:masthead.nav.write",
    href: routes.submitStory,
  },
];
