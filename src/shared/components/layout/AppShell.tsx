import type { ReactNode } from "react";
import { useRegisterShellFrame } from "../../../app/providers/shellFrame";
import { AnnouncementBanner } from "../system/AnnouncementBanner";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";

/**
 * Logged-in page frame. The Navbar/Footer/BottomTabBar are now rendered once by
 * the persistent AppChrome (mounted in App.tsx); this component only owns the
 * <main> content region and registers itself with ShellFrameProvider so AppChrome
 * knows a standard frame is on screen.
 *
 * `fullHeight` (currently only Messages) drops the footer via the registry and
 * stamps `data-shell="full-height"` so that route's CSS sizes off the nav/tab
 * tokens directly.
 *
 * `chromeless` (also only Messages) tells AppChrome to show no top bar on any
 * viewport and no left rail on desktop, for a route that carries its own brand
 * row, back button and account footer instead. It stamps `data-chromeless` so
 * nav-mode.css can drop the left-rail offsets that reconcile against a rail
 * which is no longer on screen. The bottom tab bar still mounts on mobile, so
 * this never strands a phone without navigation.
 */
export function AppShell({
  children,
  fullHeight,
  chromeless,
}: {
  children: ReactNode;
  fullHeight?: boolean;
  chromeless?: boolean;
}) {
  useRegisterShellFrame({ fullHeight, chromeless });
  return (
    <>
      <SkipToContentLink />
      <AnnouncementBanner />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        data-page-main
        data-shell={fullHeight ? "full-height" : undefined}
        data-chromeless={chromeless ? "true" : undefined}
      >
        {children}
      </main>
    </>
  );
}
