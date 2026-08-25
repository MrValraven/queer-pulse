import { type ComponentType, type ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../app/providers/ThemeProvider";
import { AccessibilityProvider } from "../app/providers/AccessibilityProvider";
import { DemoModeProvider } from "../app/providers/DemoModeProvider";
import { AuthProvider } from "../app/providers/AuthProvider";
import { ConsentProvider } from "../app/providers/ConsentProvider";
import { NavModeProvider } from "../app/providers/NavModeProvider";
import { ShellFrameProvider } from "../app/providers/ShellFrameProvider";
import { I18nProvider } from "../app/providers/I18nProvider";
import { ToastProvider } from "../shared/components/feedback/ToastProvider";
import { SessionBootstrapProvider } from "../app/providers/SessionBootstrapProvider";
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
import { CommunityEditsProvider } from "../app/providers/CommunityEditsProvider";
import { DeletedConversationsProvider } from "../app/providers/DeletedConversationsProvider";
import { DirectoryListingsProvider } from "../app/providers/DirectoryListingsProvider";
import { WorkshopsProvider } from "../app/providers/WorkshopsProvider";
import {
  PublicProfileContext,
  type PublicProfileContextValue,
} from "../app/providers/usePublicProfile";
import { type PublicEligibility } from "../features/members/publicFigure";

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
  AccessibilityProvider,
  DemoModeProvider,
  AuthProvider,
  ConsentProvider,
  NavModeProvider,
  // Mirrors App.tsx, where ShellFrameProvider wraps the app above DataProviders;
  // pages that call useRegisterShellFrame throw without it.
  ShellFrameProvider,
  I18nProvider,
  ToastProvider,
  SessionBootstrapProvider,
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
  CommunityEditsProvider,
  DeletedConversationsProvider,
  DirectoryListingsProvider,
  WorkshopsProvider,
];

function nest(providers: ProviderComponent[], children: ReactNode): ReactNode {
  return providers.reduceRight<ReactNode>(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children,
  );
}

/** A neutral, always-locked eligibility used only as a filler for fields a test's override omits. */
const NOOP_ELIGIBILITY: PublicEligibility = {
  gates: [],
  score: { total: 0, target: 100, families: [] },
  standingOk: true,
  eligible: false,
  nextActions: [],
};

const NOOP_PUBLIC_PROFILE_CONTEXT: PublicProfileContextValue = {
  enabled: false,
  setEnabled: () => Promise.resolve(true),
  toggle: () => Promise.resolve(true),
  saving: false,
  eligibility: NOOP_ELIGIBILITY,
  eligibilityStatus: "ready",
  retryEligibility: () => {},
  // No-op demand registration: an override supplies eligibility directly, so
  // nothing has to be fetched for it.
  requestEligibility: () => () => {},
  hydrate: () => {},
};

export interface TestProvidersProps {
  children: ReactNode;
  /** Router history to start on (route smoke tests pass one URL). */
  initialEntries?: string[];
  /**
   * Escape hatch for the one class of test that needs different QueryClient
   * defaults: a request-budget test asserting exactly which network calls a
   * route fires. Seeded caches (e.g. the session bootstrap seeding
   * `["blocks", false]` / `["mutes", false]` / `["profile", false, slug]`
   * before gated consumers turn `enabled` on — see
   * `src/shared/api/useSessionBootstrap.ts`) only suppress the consumer's own
   * redundant fetch when react-query still considers that seeded data FRESH.
   * Freshness is `staleTime`-gated, and this file's default client below sets
   * none (defaults to 0), which makes react-query's `isStaleByTime` treat data
   * seeded microseconds ago as already stale — see
   * `@tanstack/query-core`'s `shouldFetchOptionally`/`isStaleByTime`. That's
   * deliberately fine for almost every test here (no test but a request-budget
   * one cares whether a *suppressed* fetch happened), but it means a test
   * built on the default client cannot observe the seeding actually working —
   * only that a route renders correctly regardless of how many times each
   * endpoint was hit. Pass a client mirroring `src/shared/api/queryClient.ts`
   * (importantly its `staleTime: 30_000`) to make that suppression observable.
   * Omit it and every existing test is byte-for-byte unaffected: still a
   * fresh, `staleTime: 0`, retry-free client minted per render.
   */
  queryClient?: QueryClient;
  /**
   * Escape hatch for tests that need a specific `usePublicProfile()` value
   * (e.g. a fixed `PublicEligibility`) instead of the one the real
   * `PublicProfileProvider` derives from profile/demo-mode signals. When
   * given, an extra `PublicProfileContext.Provider` is nested just inside the
   * real provider so it wins for every descendant; fields left out of the
   * override fall back to inert no-ops.
   */
  publicProfile?: Partial<PublicProfileContextValue>;
}

export function TestProviders({
  children,
  initialEntries = ["/"],
  queryClient,
  publicProfile,
}: TestProvidersProps) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  const content = publicProfile ? (
    <PublicProfileContext.Provider
      value={{ ...NOOP_PUBLIC_PROFILE_CONTEXT, ...publicProfile }}
    >
      {children}
    </PublicProfileContext.Provider>
  ) : (
    children
  );
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        {nest(PROVIDERS, content)}
      </MemoryRouter>
    </QueryClientProvider>
  );
}
