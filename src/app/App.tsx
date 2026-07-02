import { type ComponentType, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/queryClient";
import { ThemeProvider } from "./providers/ThemeProvider";
import { DemoModeProvider } from "./providers/DemoModeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { I18nProvider } from "./providers/I18nProvider";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { AdminRoleProvider } from "./providers/AdminRoleProvider";
import { ConnectProvider } from "./providers/ConnectProvider";
import { ConnectionsProvider } from "./providers/ConnectionsProvider";
import { ProfileProvider } from "./providers/ProfileProvider";
import { ProfileThemeProvider } from "./providers/ProfileThemeProvider";
import { VouchProvider } from "./providers/VouchProvider";
import { WorkProfileProvider } from "./providers/WorkProfileProvider";
import { SavedProvider } from "./providers/SavedProvider";
import { DraftsProvider } from "./providers/DraftsProvider";
import { SocialProvider } from "./providers/SocialProvider";
import { CommunityMembershipProvider } from "./providers/CommunityMembershipProvider";
import { CreatedCommunitiesProvider } from "./providers/CreatedCommunitiesProvider";
import { DirectoryListingsProvider } from "./providers/DirectoryListingsProvider";
import { CommandPalette } from "../features/members/CommandPalette";
import { RoomLoader } from "../shared/components/feedback/RoomLoader";
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
  DemoModeProvider,
  QueryProvider,
  AuthProvider,
  I18nProvider,
  ToastProvider,
  AdminRoleProvider,
]);

// Member/session state that only needs to wrap the routed UI (inside the router).
const DataProviders = composeProviders([
  WorkProfileProvider,
  ProfileProvider,
  ProfileThemeProvider,
  ConnectionsProvider,
  ConnectProvider,
  VouchProvider,
  SavedProvider,
  DraftsProvider,
  SocialProvider,
  CommunityMembershipProvider,
  CreatedCommunitiesProvider,
  DirectoryListingsProvider,
]);

export function App() {
  return (
    <RootProviders>
      <BrowserRouter>
        <ScrollManager />
        <DataProviders>
          <AppRoutes />
          <CommandPalette />
        </DataProviders>
        <RoomLoader />
      </BrowserRouter>
    </RootProviders>
  );
}
