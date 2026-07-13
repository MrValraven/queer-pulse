import { type ComponentType, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../app/providers/ThemeProvider";
import { DemoModeProvider } from "../app/providers/DemoModeProvider";
import { AuthProvider } from "../app/providers/AuthProvider";
import { ConsentProvider } from "../app/providers/ConsentProvider";
import { NavModeProvider } from "../app/providers/NavModeProvider";
import { I18nProvider } from "../app/providers/I18nProvider";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { AdminRoleProvider } from "../app/providers/AdminRoleProvider";
import { WorkProfileProvider } from "../app/providers/WorkProfileProvider";
import { EmployerAffiliationProvider } from "../app/providers/EmployerAffiliationProvider";
import { PostedJobsProvider } from "../app/providers/PostedJobsProvider";
import { ProfileProvider } from "../app/providers/ProfileProvider";
import { PublicProfileProvider } from "../app/providers/PublicProfileProvider";
import { ProfileThemeProvider } from "../app/providers/ProfileThemeProvider";
import { ConnectionsProvider } from "../app/providers/ConnectionsProvider";
import { ConnectProvider } from "../app/providers/ConnectProvider";
import { VouchProvider } from "../app/providers/VouchProvider";
import { SavedProvider } from "../app/providers/SavedProvider";
import { DraftsProvider } from "../app/providers/DraftsProvider";
import { SocialProvider } from "../app/providers/SocialProvider";
import { CommunityMembershipProvider } from "../app/providers/CommunityMembershipProvider";
import { CreatedCommunitiesProvider } from "../app/providers/CreatedCommunitiesProvider";
import { DirectoryListingsProvider } from "../app/providers/DirectoryListingsProvider";
import { WorkshopsProvider } from "../app/providers/WorkshopsProvider";

type ProviderComponent = ComponentType<{ children: ReactNode }>;

/**
 * The full provider set a routed page can rely on, mirroring App.tsx's Root +
 * Data providers — minus BrowserRouter (we supply MemoryRouter) and the shared
 * QueryClient (we mint a fresh, retry-free one per render so cache never bleeds
 * between tests). Deliberately inclusive: a route smoke test should never fail
 * merely because a page reads a context the wrapper forgot. Demo mode is forced
 * on via the empty VITE_API_URL in vitest.config, so auth is a logged-in mock
 * user and every data hook short-circuits to mock data (no network).
 */
const PROVIDERS: ProviderComponent[] = [
  ThemeProvider,
  DemoModeProvider,
  AuthProvider,
  ConsentProvider,
  NavModeProvider,
  I18nProvider,
  ToastProvider,
  AdminRoleProvider,
  WorkProfileProvider,
  EmployerAffiliationProvider,
  PostedJobsProvider,
  ProfileProvider,
  PublicProfileProvider,
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
  WorkshopsProvider,
];

function nest(providers: ProviderComponent[], children: ReactNode): ReactNode {
  return providers.reduceRight<ReactNode>(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children,
  );
}

export interface TestProvidersProps {
  children: ReactNode;
  /** Router history to start on (route smoke tests pass one URL). */
  initialEntries?: string[];
}

export function TestProviders({
  children,
  initialEntries = ["/"],
}: TestProvidersProps) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        {nest(PROVIDERS, children)}
      </MemoryRouter>
    </QueryClientProvider>
  );
}
