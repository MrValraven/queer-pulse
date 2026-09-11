import type { Catalog } from "../../types";

/** Site-wide navigation chrome (top bar + mobile drawer). */
export const nav: Catalog = {
  // Controls + actions
  notifications: "Notifications",
  toggleTheme: "Toggle colour theme",
  search: "Search (⌘K)",
  searchShort: "Search",
  signIn: "Sign in",
  requestInvite: "Request an invite",
  signOut: "Sign out",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  back: "Back",
  menu: "Menu",
  more: "More",
  you: "You",
  account: "Your account",
  primary: "Primary",
  updateAvailable: "A new version of QueerPulse is ready.",
  updateReload: "Reload",
  updating: "Updating…",
  updateDismiss: "Dismiss update",

  // Landing page bar (LandingNav). Short labels: they sit in one row inside the
  // nav pill, so each has to survive next to five siblings.
  "landing.label": "Landing page sections",
  "landing.about": "The idea",
  "landing.communities": "Communities",
  "landing.gatherings": "Gatherings",
  "landing.housing": "Housing",
  "landing.personas": "Personas",
  "landing.why": "Why we built this",
  "landing.stories": "Stories",

  // Primary destinations
  members: "Members",
  forum: "Forum",
  calendar: "Calendar",
  communities: "Communities & Collectives",
  // Mobile bottom tab label (bottomTabs.ts). The full name above cannot fit a
  // fifth of a phone's width without wrapping, so the tab gets the short form.
  "tab.communities": "Communities",
  arriving: "New to Lisbon?",
  skills: "Skills",
  feed: "Home",
  events: "Events",
  messages: "Messages",
  places: "Places",
  resources: "Resources",
  about: "About",
};
