import type { ReactNode } from "react";
import { useRegisterShellFrame } from "../../../app/providers/ShellFrameProvider";
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
 */
export function AppShell({
  children,
  fullHeight,
}: {
  children: ReactNode;
  fullHeight?: boolean;
}) {
  useRegisterShellFrame({ fullHeight });
  return (
    <>
      <SkipToContentLink />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        data-page-main
        data-shell={fullHeight ? "full-height" : undefined}
      >
        {children}
      </main>
    </>
  );
}
