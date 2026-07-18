import { type ComponentType, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/queryClient";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AccessibilityProvider } from "./providers/AccessibilityProvider";
import { NavModeProvider } from "./providers/NavModeProvider";
import { DemoModeProvider } from "./providers/DemoModeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ConsentProvider } from "./providers/ConsentProvider";
import { RealtimeProvider } from "../shared/api/realtime";
import { I18nProvider } from "./providers/I18nProvider";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { ConnectProvider } from "./providers/ConnectProvider";
import { ConnectionsProvider } from "./providers/ConnectionsProvider";
import { ProfileProvider } from "./providers/ProfileProvider";
import { PublicProfileProvider } from "./providers/PublicProfileProvider";
import { ProfileThemeProvider } from "./providers/ProfileThemeProvider";
import { VouchProvider } from "./providers/VouchProvider";
import { WorkProfileProvider } from "./providers/WorkProfileProvider";
import { EmployerAffiliationProvider } from "./providers/EmployerAffiliationProvider";
import { PostedJobsProvider } from "./providers/PostedJobsProvider";
import { SavedProvider } from "./providers/SavedProvider";
import { DraftsProvider } from "./providers/DraftsProvider";
import { SocialProvider } from "./providers/SocialProvider";
import { CommunityMembershipProvider } from "./providers/CommunityMembershipProvider";
import { DirectoryListingsProvider } from "./providers/DirectoryListingsProvider";
import { WorkshopsProvider } from "./providers/WorkshopsProvider";
import { CommandPalette } from "../features/members/CommandPalette";
import { RoomLoader } from "../shared/components/feedback/RoomLoader";
import { AuthErrorToast } from "../shared/components/feedback/AuthErrorToast";
import { QueryErrorToastBridge } from "../shared/components/feedback/QueryErrorToastBridge";
import { ErrorBoundary } from "../shared/components/feedback/ErrorBoundary";
import { ConsentBanner } from "../shared/components/consent/ConsentBanner";
import { QuickExit } from "../shared/components/safety/QuickExit";
import { ScrollManager } from "./ScrollManager";
import { AppRoutes } from "./routes";

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
  I18nProvider,
  ToastProvider,
]);

// Member/session state that only needs to wrap the routed UI (inside the router).
const DataProviders = composeProviders([
  WorkProfileProvider,
  EmployerAffiliationProvider,
  PostedJobsProvider,
  ProfileProvider,
  // Inside ProfileProvider: eligibility is derived from the live self profile.
  PublicProfileProvider,
  ProfileThemeProvider,
  ConnectionsProvider,
  ConnectProvider,
  VouchProvider,
  SavedProvider,
  DraftsProvider,
  SocialProvider,
  CommunityMembershipProvider,
  DirectoryListingsProvider,
  WorkshopsProvider,
]);

export function App() {
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
            <CommandPalette />
            <QuickExit />
          </DataProviders>
          <RoomLoader />
          <ConsentBanner />
          <AuthErrorToast />
          <QueryErrorToastBridge />
        </BrowserRouter>
      </ErrorBoundary>
    </RootProviders>
  );
}
