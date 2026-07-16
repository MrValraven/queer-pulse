import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";

/**
 * Logged-in page frame: the single site-wide Navbar (which reflects auth state)
 * + main content + the full site Footer. `unreadCount` feeds the nav's
 * notifications bell.
 *
 * `tabIndex={-1}` on `<main>` is what makes the skip link actually work: without
 * it the fragment jump scrolls but leaves focus stranded back in the nav, so the
 * keyboard user is no further forward than before they used it.
 */
export function AppShell({
  children,
  unreadCount,
}: {
  children: ReactNode;
  unreadCount?: number;
}) {
  return (
    <>
      <SkipToContentLink />
      <Navbar unreadCount={unreadCount} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} data-page-main>
        {children}
      </main>
      <Footer />
    </>
  );
}
