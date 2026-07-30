import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomTabBar } from "./BottomTabBar";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";

/**
 * Logged-in page frame: the single site-wide Navbar (which reflects auth state)
 * + main content + the full site Footer + the installed-PWA bottom tab bar.
 * `unreadCount` feeds the nav's notifications bell.
 *
 * `tabIndex={-1}` on `<main>` is what makes the skip link actually work: without
 * it the fragment jump scrolls but leaves focus stranded back in the nav, so the
 * keyboard user is no further forward than before they used it.
 *
 * `fullHeight` is for a route that IS its own single scrolling surface end to
 * end (currently only Messages): it drops the marketing Footer — which would
 * otherwise stack below the route's own fixed-height content and give the page
 * a second, competing scroll surface on mobile — and stamps
 * `data-shell="full-height"` on `<main>` so that route's CSS can size itself
 * directly off the real nav/tab-bar tokens instead of the generic hero-band
 * margin `standalone.css` applies to every other page (see the opt-out there).
 * `BottomTabBar` still renders: an installed PWA still needs its nav.
 */
export function AppShell({
  children,
  unreadCount,
  fullHeight,
}: {
  children: ReactNode;
  unreadCount?: number;
  fullHeight?: boolean;
}) {
  return (
    <>
      <SkipToContentLink />
      <Navbar unreadCount={unreadCount} />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        data-page-main
        data-shell={fullHeight ? "full-height" : undefined}
      >
        {children}
      </main>
      {!fullHeight && <Footer />}
      <BottomTabBar />
    </>
  );
}
