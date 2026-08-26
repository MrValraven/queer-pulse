import { Suspense, type ComponentType, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/queryClient";
import { ThemeProvider } from "./providers/ThemeProvider";
import { MotionProvider } from "./providers/MotionProvider";
import { ShellFrameProvider } from "./providers/ShellFrameProvider";
import { AppChrome } from "../shared/components/layout/AppChrome";
import { AppFooter } from "../shared/components/layout/AppFooter";
import { RouteTransition } from "../shared/components/layout/RouteTransition";
import { SwipeBackShell } from "../shared/components/layout/SwipeBackShell";
import { NavDirectionProvider } from "./providers/NavDirectionProvider";
import { NavHistoryProvider } from "./providers/NavHistoryProvider";
import { AccessibilityProvider } from "./providers/AccessibilityProvider";
import { DisplayModeProvider } from "./providers/DisplayModeProvider";
import { NavModeProvider } from "./providers/NavModeProvider";
import { NavDrawerProvider } from "./providers/NavDrawerProvider";
import { DemoModeProvider } from "./providers/DemoModeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ConsentProvider } from "./providers/ConsentProvider";
import { NudgesProvider } from "./providers/NudgesProvider";
import { RealtimeProvider } from "../shared/api/realtime";
import { I18nProvider } from "./providers/I18nProvider";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { ReauthCompletionProvider } from "./providers/ReauthCompletionProvider";
import { PlatformLockProvider } from "./providers/PlatformLockProvider";
import { ConnectProvider } from "./providers/ConnectProvider";
import { ConnectionsProvider } from "./providers/ConnectionsProvider";
import { ProfileProvider } from "./providers/ProfileProvider";
import { PublicProfileProvider } from "./providers/PublicProfileProvider";
import { ProfileThemeProvider } from "./providers/ProfileThemeProvider";
import { VouchProvider } from "./providers/VouchProvider";
import { SessionBootstrapProvider } from "./providers/SessionBootstrapProvider";
import { PushPreviewMirrorProvider } from "../features/push/PushPreviewMirrorProvider";
import { WorkProfileProvider } from "./providers/WorkProfileProvider";
import { EmployerAffiliationProvider } from "./providers/EmployerAffiliationProvider";
import { PostedJobsProvider } from "./providers/PostedJobsProvider";
import { SavedProvider } from "./providers/SavedProvider";
import { DraftsProvider } from "./providers/DraftsProvider";
import { SocialProvider } from "./providers/SocialProvider";
import { CommunityMembershipProvider } from "./providers/CommunityMembershipProvider";
import { CommunityEditsProvider } from "./providers/CommunityEditsProvider";
import { DeletedConversationsProvider } from "./providers/DeletedConversationsProvider";
import { DirectoryListingsProvider } from "./providers/DirectoryListingsProvider";
import { lazyNamed } from "./routeHelpers";
import { RoomLoader } from "../shared/components/feedback/RoomLoader";
import { AuthErrorToast } from "../shared/components/feedback/AuthErrorToast";
import { QueryErrorToastBridge } from "../shared/components/feedback/QueryErrorToastBridge";
import { ErrorBoundary } from "../shared/components/feedback/ErrorBoundary";
import { ConsentBanner } from "../shared/components/consent/ConsentBanner";
import { ConsentPreferencesGate } from "../shared/components/consent/ConsentPreferencesGate";
import { PolicyReacceptanceGate } from "../features/auth/PolicyReacceptanceGate";
import { PwaUpdatePrompt } from "../shared/components/system/PwaUpdatePrompt";
import { OfflineGate } from "../features/system/OfflineGate";
import { ScrollManager } from "./ScrollManager";
import { AppRoutes } from "./routes";
import { useVisualViewportKeyboard } from "../shared/hooks";

// Lazy so the demo mock corpus its search data hook pulls in (members +
// gatherings mock data, thousands of lines) leaves the entry chunk; it
// self-fetches its data once opened, so deferring the chunk doesn't change
// when results appear.
const CommandPalette = lazyNamed(
  () => import("../features/members/CommandPalette"),
  "CommandPalette",
);

type ProviderComponent = ComponentType<{ children: ReactNode }>;

/** Nest a flat list of providers (outer → inner) without the staircase. */
function composeProviders(providers: ProviderComponent[]): ProviderComponent {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return (
      <>
        {providers.reduceRight<ReactNode>(
          (acc, Provider) => (
            <Provider>{acc}</Provider>
          ),
          children,
        )}
      </>
    );
  };
}

/** QueryClientProvider needs a `client` prop, so wrap it to fit ProviderComponent. */
function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// App-wide context, available everywhere including outside the router.
const RootProviders = composeProviders([
  ThemeProvider,
  // motion's LazyMotion (domAnimation feature bundle) + the shared
  // reduced-motion flag consumed by useMotionPrefs(). A display/prefs
  // concern like ThemeProvider/AccessibilityProvider, needs nothing above
  // it, and must be above the router so route-level transitions and
  // gestures (later tasks) can read it.
  MotionProvider,
  // Reflects the "Reduce motion" preference onto <html>; independent of the
  // others, kept next to ThemeProvider since both drive DOM-attribute display state.
  AccessibilityProvider,
  // Same family: stamps `data-display-mode` on <html> so standalone.css can
  // restyle the shell when running as an installed PWA. Needs nothing above it.
  DisplayModeProvider,
  DemoModeProvider,
  QueryProvider,
  AuthProvider,
  // Realtime socket lifecycle: connects on sign-in (live mode), inert in demo /
  // logged-out / no-backend. Needs Auth + DemoMode above it.
  RealtimeProvider,
  // Consent gate: governs whether analytics/error-monitoring may run. Needs the
  // auth + demo state above it; wraps everything below so the banner/preferences
  // are reachable app-wide.
  ConsentProvider,
  // Persona-discovery dismissal store (personas Phase 5): same needs as
  // ConsentProvider above it (auth + demo state, to read/reconcile the
  // signed-in member's session) and used by nudges mounted across many
  // features (profile, directory, account menu, onboarding, gatherings,
  // notifications), so it belongs app-wide rather than scoped to one feature.
  NudgesProvider,
  // Inside AuthProvider: the sidebar is a signed-in-only affordance, so nav mode
  // is derived from the auth state (signed-out visitors always get the MegaNav).
  NavModeProvider,
  // Mobile drawer open state, lifted above both of its triggers (Navbar
  // hamburger, BottomTabBar "More"). Must sit above the routed UI that renders
  // the shells.
  NavDrawerProvider,
  I18nProvider,
  ToastProvider,
  // Picks up a completed step-up reauth OAuth round trip (see
  // useReauthToken.ts) and toasts the outcome. Needs I18nProvider (t()) and
  // ToastProvider (useToast()) above it, both satisfied here.
  ReauthCompletionProvider,
  // Platform-lockdown render gate: needs AuthProvider above it (reads `role`,
  // to never trap the one admin who could lift the lockdown) and I18nProvider
  // above it (the maintenance screen calls `t()`). Placed last so it only
  // gates what RootProviders wraps — the ErrorBoundary/BrowserRouter/routed
  // app passed in as `children` below — while everything above it (toasts,
  // consent, realtime, nav mode) keeps working normally and is ready
  // immediately if the lockdown lifts.
  PlatformLockProvider,
]);

// Member/session state that only needs to wrap the routed UI (inside the router).
const DataProviders = composeProviders([
  SessionBootstrapProvider,
  // Syncs the server-side "hide notification previews" setting into the
  // IndexedDB mirror the service worker reads, so the choice follows the
  // member onto this device (ID-13). Renders nothing and, on a browser with no
  // service worker, fetches nothing.
  PushPreviewMirrorProvider,
  WorkProfileProvider,
  EmployerAffiliationProvider,
  PostedJobsProvider,
  ProfileProvider,
  // Live eligibility now comes from GET /me/public-eligibility, not the live
  // self profile — this provider no longer reads useProfileData().
  PublicProfileProvider,
  ProfileThemeProvider,
  ConnectionsProvider,
  VouchProvider,
  SavedProvider,
  DraftsProvider,
  SocialProvider,
  CommunityMembershipProvider,
  CommunityEditsProvider,
  DeletedConversationsProvider,
  DirectoryListingsProvider,
  // Innermost on purpose: ConnectProvider renders <ConnectModal> as a sibling
  // of its children, so the modal only sees contexts provided ABOVE it. It
  // calls useConnectionActions → useSocial/useConnections, so it must sit below
  // SocialProvider and ConnectionsProvider. Keep any provider whose state the
  // modal consumes above this line.
  ConnectProvider,
]);

export function App() {
  // Publish the on-screen-keyboard overlap as --keyboard-inset app-wide, so any
  // bottom-anchored composer or sheet can lift above the keyboard on iOS.
  useVisualViewportKeyboard();
  return (
    <RootProviders>
      {/* App-level boundary: inside ToastProvider/Theme (RootProviders) so the
          fallback themes correctly, but around the router so any page/provider
          throw is contained instead of blanking the whole app. */}
      <ErrorBoundary level="app">
        <BrowserRouter>
          <ScrollManager />
          <ShellFrameProvider>
            <DataProviders>
              {/* The one full-height frame the whole routed app lives in.
                  It is `min-height: 100dvh` and a flex column (base.css
                  `.app-frame`), which is what lets the in-flow <AppFooter/>
                  below pin itself to the bottom of the window on pages whose
                  content is shorter than the viewport, instead of stopping
                  mid-screen with page canvas showing beneath it. Wraps the
                  fixed chrome too, harmlessly: fixed elements are out of flow,
                  so they are not flex items and do not move. */}
              <div className="app-frame">
                {/* Chrome lives INSIDE DataProviders (but above the route switch, so
                    still mounted once and never remounting on navigation): its
                    Navbar/BottomTabBar read member/session state — e.g. the DM
                    unread badge transitively calls useDeletedConversations, whose
                    provider is in DataProviders. Rendered outside it, AppChrome
                    throws "must be used within DeletedConversationsProvider". */}
                <AppChrome />
                {/* Tracks a short tail of visited entries so a page can offer a
                    way back to where the visitor actually came from (the
                    member-profile back link). Router context only, like
                    NavDirectionProvider below, so it wraps the routed content. */}
                <NavHistoryProvider>
                  {/* Nav-direction classification (push/pop/tab-switch/replace)
                      for RouteTransition below; needs react-router context
                      (inside BrowserRouter) but not member/session state, so it
                      only needs to wrap the routed content, not AppChrome. */}
                  <NavDirectionProvider>
                    {/* Offline fallback: in live mode a dead network swaps the routed
                      UI for the branded OfflinePage (paired with the SW navigation
                      catch handler). No-op in demo mode, which needs no network. */}
                    <OfflineGate>
                      {/* Edge-swipe-to-go-back (mobile only; inert/unwrapped on
                        desktop) wraps the transition so a committed swipe's
                        navigate(-1) plays the same pop animation as the Back
                        button. Inside OfflineGate so the offline fallback isn't
                        draggable; around RouteTransition so it tracks the whole
                        content plane, not just its animated inner div. */}
                      <SwipeBackShell>
                        {/* Animates only the routed content (transform/opacity) on
                          navigation; chrome (AppChrome, above) stays fixed. */}
                        <RouteTransition>
                          <AppRoutes />
                        </RouteTransition>
                      </SwipeBackShell>
                    </OfflineGate>
                    <Suspense fallback={null}>
                      <CommandPalette />
                    </Suspense>
                  </NavDirectionProvider>
                </NavHistoryProvider>
                {/* The Footer is in-flow, so — unlike the fixed Navbar/BottomTabBar
                    in AppChrome above — it is rendered AFTER the routed content so
                    it lands at the bottom of the page, not the top. Kept inside
                    DataProviders so it still sees member/session context. */}
                <AppFooter />
              </div>
            </DataProviders>
          </ShellFrameProvider>
          <RoomLoader />
          <ConsentBanner />
          <ConsentPreferencesGate />
          {/* ID-14: blocks the member surface when someone's agreement to the
              Terms or Community Guidelines has fallen behind the revision in
              effect. App-level and session-scoped like the consent banner above
              it, and inert in demo mode / signed out / on the policy pages
              themselves — see usePolicyReacceptanceRequired in app/authGate.ts. */}
          <PolicyReacceptanceGate />
          <AuthErrorToast />
          <PwaUpdatePrompt />
          <QueryErrorToastBridge />
        </BrowserRouter>
      </ErrorBoundary>
    </RootProviders>
  );
}
