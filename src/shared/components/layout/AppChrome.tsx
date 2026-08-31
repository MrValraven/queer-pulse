import { useShellFrame } from "../../../app/providers/shellFrame";
import { useRealtimeConnection } from "../../api/realtime";
import { InstallNudge } from "../../../features/system/InstallNudge";
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
  // Hold the realtime socket open for the whole signed-in session rather than
  // for one route. AppChrome is mounted once, above the route switch, which
  // makes it the only place where the socket's lifetime follows the SESSION
  // instead of whichever page happens to be open. Without this the notification
  // bell only updates on the Messages page, since that controller used to be
  // the single caller. Inert in demo / logged-out / no-backend runs.
  //
  // RealtimeProvider is NOT what pins this component's position: it sits in
  // RootProviders, above the router, and useRealtime() falls back to an inert
  // default context anyway. What forces AppChrome to render INSIDE
  // DataProviders (see App.tsx) is the Navbar it returns below: its DM unread
  // badge calls useUnreadMessages -> useDeletedConversations, which throws
  // "must be used within DeletedConversationsProvider", and that provider is in
  // DataProviders. Rendered above it, every page load throws on render.
  useRealtimeConnection();
  const { active } = useShellFrame();
  if (!active) return null;
  return (
    <>
      <Navbar />
      <BottomTabBar />
      {/* ID-17. Mounted here so the install nudge inherits the same gating as
          the rest of the fixed chrome: standard-frame pages only, never on the
          admin/system/auth surfaces (including PwaPromptPage itself, which is
          where it points). It is position:fixed, so its place in the flow is
          irrelevant. */}
      <InstallNudge />
    </>
  );
}
