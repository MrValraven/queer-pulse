import type { Catalog } from "../../types";

/**
 * Simulations, the dev-only `/simulations/` sandbox gallery and player.
 * Pane title/intro copy, the start-simulation call to action, and the
 * device-frame player chrome (back link, not-found state, device toggle).
 */
export const simulations: Catalog = {
  "home.title": "Flow simulations",
  "home.intro":
    "Preview key member journeys end to end. Each simulation runs in an isolated sandbox with no live data, so you can walk through it exactly as someone else would.",
  "home.start": "Start simulation",
  "home.backToApp": "Back to app",
  "home.searchPlaceholder": "Filter simulations",
  "home.noResults": "No simulations match your filter.",
  "player.back": "Simulations",
  "player.notFound":
    "We couldn’t find that simulation. It may have been renamed.",
  "player.backToGallery": "Back to simulations",
  "player.deviceGroupAriaLabel": "Preview device",
  "player.mobile": "Mobile",
  "player.desktop": "Desktop",
  "player.replay": "Replay",
  "player.openFullScreen": "Open in new tab",
  "player.loading": "Loading simulation…",
  "player.loadError": "This simulation could not load.",
  insideSandbox: "Simulations are not available inside a running simulation.",
};
