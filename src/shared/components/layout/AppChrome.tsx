import { useShellFrame } from "../../../app/providers/shellFrame";
import { Navbar } from "./Navbar";
import { BottomTabBar } from "./BottomTabBar";

/**
 * The persistent, position:fixed site chrome, mounted once at app level so the
 * Navbar and BottomTabBar never remount on navigation (Instagram-fixed bottom
 * bar, no flash). Renders only when a standard-frame page (AppShell/PageShell)
 * is active; admin/system/auth pages register no frame and keep their own chrome.
 *
 * Only the FIXED chrome lives here. Both bars are `position: fixed`, so their
 * position in the document flow is irrelevant and mounting them once — above the
 * route switch — is safe. The Footer, by contrast, is IN-FLOW: its DOM position
 * decides where it lands, so it is rendered separately by <AppFooter/> AFTER the
 * routed <main> (see App.tsx). Rendered here, before <main>, it would sit at the
 * top of every page.
 *
 * The routed <main> is rendered separately by the shells inside the transition
 * layer — this component is chrome only. SkipToContentLink stays with the shells
 * so it sits immediately before <main> in the DOM/tab order.
 */
export function AppChrome() {
  const { active } = useShellFrame();
  if (!active) return null;
  return (
    <>
      <Navbar />
      <BottomTabBar />
    </>
  );
}
