import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomTabBar } from "./BottomTabBar";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";

/**
 * Standard page frame: fixed Navbar, main content, plum Footer, and — when
 * running as an installed PWA on mobile — the bottom tab bar. BottomTabBar
 * returns null in every other case, so this costs nothing in a browser tab.
 *
 * `tabIndex={-1}` on `<main>` is what makes the skip link actually work: without
 * it the fragment jump scrolls but leaves focus stranded back in the nav.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipToContentLink />
      <Navbar />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} data-page-main>
        {children}
      </main>
      <Footer />
      <BottomTabBar />
    </>
  );
}
