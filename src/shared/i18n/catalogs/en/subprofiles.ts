import type { Catalog } from "../../types";

/**
 * Subprofiles — the persona directory, the main-profile "Also as…" block, and
 * the nav/command entries. Headlines that carry a coral `<em>` stay as JSX
 * literals in their components; the plain supporting copy lives here.
 */
export const subprofiles: Catalog = {
  // Directory (SubprofileDirectoryPage)
  "directory.eyebrow": "Directory · personas",
  "directory.subtitle":
    "Pseudonymous professional personas from across the community. No ranking, no algorithm — just the work.",
  "directory.searchPlaceholder": "Search personas",
  "directory.searchAria": "Search personas",
  "directory.filterLabel": "Filter by craft",
  "directory.filterAll": "All",
  "directory.loading": "Loading personas…",
  "directory.empty.title": "No personas here yet",
  "directory.empty.description":
    "Nothing matches this just now. Try another craft, or clear your search and see everyone.",
  "directory.empty.clear": "Clear filters",

  // Main-profile "Also as…" block (ProfileSubprofilesSection)
  "alsoAs.title": "Also working as",
  "alsoAs.subtitlePublic": "Professional personas linked to this profile.",
  "alsoAs.subtitleSelf": "The professional personas you've linked here.",
  "alsoAs.subtitleEmpty": "Another side of your work can live here.",
  "alsoAs.manage": "Manage subprofiles →",
  "alsoAs.empty.title": "Add a professional subprofile",
  "alsoAs.empty.description":
    "Show another side of your work — your music, your code, your writing — linked here or standing on its own.",
  "alsoAs.empty.cta": "Create a subprofile",

  // Nav + command palette
  "nav.browse": "Subprofiles",
  "nav.mine": "Subprofiles",
  "command.mine.name": "My subprofiles",
  "command.mine.sub": "Your professional personas",
  "command.browse.name": "Browse subprofiles",
  "command.browse.sub": "The persona directory",
};
