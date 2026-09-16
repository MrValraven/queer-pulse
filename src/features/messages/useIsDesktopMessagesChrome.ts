// src/features/messages/useIsDesktopMessagesChrome.ts
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { mediaMax } from "../../shared/theme/breakpoints";

/** Which way back does the panel carry right now? `chromeless` hides the top
 *  bar everywhere, but the bottom tab bar only gives way above the mobile
 *  breakpoint (`AppChrome` gates the Navbar on the same named query). So the
 *  panel's replacement chrome answers to THAT width, and `useMessagesController`'s
 *  own `isMobile` is the wrong signal: the controller splits one pane from
 *  two at 768, while the bottom tab bar swaps in at 860. Gated on the
 *  controller's value, the 92px between the two would get the account footer
 *  stacked above the tab bar and no back chevron. */
export function useIsDesktopMessagesChrome(): boolean {
  return !useMediaQuery(mediaMax("mobile"));
}
