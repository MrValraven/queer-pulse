import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A — `issueNumber`/`date` are data (formatted through
 * `issueLabelText()` / `useFormat()` in the component); `taglineKey` is
 * platform chrome.
 *
 * DEMO ONLY since CON-13: live mode names the real current issue from
 * `GET /magazine/current-issue` (`useCurrentIssueLabel`). `taglineKey` is the
 * one entry both modes still share.
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
  // PRD-105 — the decks index. Sits with sections/authors/issues: it is part
  // of the magazine's contents, above the search tool that ends the row. This
  // is also the only way into the index from the DEMO front, whose sections
  // component is separate from the live one.
  {
    key: "decks",
    labelKey: "magazine:masthead.nav.decks",
    href: routes.magazineDecks,
  },
  // CON-12 — search the whole published archive, and browse by tag. Last in
  // the row on purpose: it is a tool, and the sections/authors/issues entries
  // before it are the magazine's actual contents.
  {
    key: "search",
    labelKey: "magazine:masthead.nav.search",
    href: routes.magazineSearch,
  },
];
