import { Suspense, type ComponentType, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/queryClient";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AccessibilityProvider } from "./providers/AccessibilityProvider";
import { DisplayModeProvider } from "./providers/DisplayModeProvider";
import { NavModeProvider } from "./providers/NavModeProvider";
import { NavDrawerProvider } from "./providers/NavDrawerProvider";
import { DemoModeProvider } from "./providers/DemoModeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ConsentProvider } from "./providers/ConsentProvider";
import { RealtimeProvider } from "../shared/api/realtime";
import { I18nProvider } from "./providers/I18nProvider";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { PlatformLockProvider } from "./providers/PlatformLockProvider";
import { ConnectProvider } from "./providers/ConnectProvider";
import { ConnectionsProvider } from "./providers/ConnectionsProvider";
import { ProfileProvider } from "./providers/ProfileProvider";
import { PublicProfileProvider } from "./providers/PublicProfileProvider";
import { ProfileThemeProvider } from "./providers/ProfileThemeProvider";
import { VouchProvider } from "./providers/VouchProvider";
import { SessionBootstrapProvider } from "./providers/SessionBootstrapProvider";
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
import { WorkshopsProvider } from "./providers/WorkshopsProvider";
import { lazyNamed } from "./routeHelpers";
import { RoomLoader } from "../shared/components/feedback/RoomLoader";
import { AuthErrorToast } from "../shared/components/feedback/AuthErrorToast";
import { QueryErrorToastBridge } from "../shared/components/feedback/QueryErrorToastBridge";
import { ErrorBoundary } from "../shared/components/feedback/ErrorBoundary";
import { ConsentBanner } from "../shared/components/consent/ConsentBanner";
import { PwaUpdatePrompt } from "../shared/components/system/PwaUpdatePrompt";
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
  // Inside AuthProvider: the sidebar is a signed-in-only affordance, so nav mode
  // is derived from the auth state (signed-out visitors always get the MegaNav).
  NavModeProvider,
  // Mobile drawer open state, lifted above both of its triggers (Navbar
  // hamburger, BottomTabBar "More"). Must sit above the routed UI that renders
  // the shells.
  NavDrawerProvider,
  I18nProvider,
  ToastProvider,
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
  WorkProfileProvider,
  EmployerAffiliationProvider,
  PostedJobsProvider,
  ProfileProvider,
  // Inside ProfileProvider: eligibility is derived from the live self profile.
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
  WorkshopsProvider,
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
          <DataProviders>
            <AppRoutes />
            <Suspense fallback={null}>
              <CommandPalette />
            </Suspense>
          </DataProviders>
          <RoomLoader />
          <ConsentBanner />
          <AuthErrorToast />
          <PwaUpdatePrompt />
          <QueryErrorToastBridge />
        </BrowserRouter>
      </ErrorBoundary>
    </RootProviders>
  );
}
