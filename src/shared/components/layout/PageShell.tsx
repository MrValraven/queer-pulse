import type { ReactNode } from "react";
import { useRegisterShellFrame } from "../../../app/providers/ShellFrameProvider";
import { AnnouncementBanner } from "../system/AnnouncementBanner";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";

/**
 * Standard page frame. The Navbar/Footer/BottomTabBar are now rendered once by
 * the persistent AppChrome (mounted in App.tsx); this component only owns the
 * <main> content region and registers itself with ShellFrameProvider so AppChrome
 * knows a standard frame is on screen.
 *
 * `tabIndex={-1}` on `<main>` is what makes the skip link actually work: without
 * it the fragment jump scrolls but leaves focus stranded back in the nav.
 */
export function PageShell({ children }: { children: ReactNode }) {
  useRegisterShellFrame();
  return (
    <>
      <SkipToContentLink />
      <AnnouncementBanner />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} data-page-main>
        {children}
      </main>
    </>
  );
}
