import { useHoldShellFrame } from "../../../app/providers/shellFrame";
import { PageLoader } from "./PageLoader";

/**
 * Suspense fallback for lazy route chunks. It is the full-screen PageLoader,
 * kept under this name because app/routes.tsx and the route docs point here;
 * the 200ms reveal hold and the live region live in PageLoader itself. It
 * renders with no shell around it, so it takes the "screen" size, which
 * centres the mark in the whole viewport.
 *
 * It also holds the previous page's shell frame while the chunk loads. The
 * page being left is removed from the screen at once on desktop, and with it
 * goes the only shell keeping AppChrome's nav mounted, so without the hold
 * the nav would vanish for the whole load and pop back with the new page.
 * The hold copies whatever the previous page had, so leaving a page with no
 * nav (admin, system, auth) keeps it absent. See `useHoldShellFrame`.
 */
export function RouteFallback() {
  useHoldShellFrame();
  return <PageLoader size="screen" />;
}
