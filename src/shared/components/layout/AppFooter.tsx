import { useShellFrame } from "../../../app/providers/shellFrame";
import { Footer } from "./Footer";

/**
 * The site Footer, rendered once at app level but — unlike the fixed Navbar and
 * BottomTabBar in <AppChrome/> — placed AFTER the routed content in App.tsx. The
 * Footer is in-flow, so its DOM position is what puts it at the bottom of the
 * page; rendered before <main> (e.g. bundled into AppChrome) it lands at the top.
 *
 * Visibility mirrors AppChrome: shown only when a standard frame (AppShell/
 * PageShell) is active, and dropped for full-height routes (currently Messages),
 * which own their single end-to-end scrolling surface and would otherwise stack
 * a second, competing scroll region below their fixed-height content.
 */
export function AppFooter() {
  const { active, fullHeight } = useShellFrame();
  if (!active || fullHeight) return null;
  return <Footer />;
}
