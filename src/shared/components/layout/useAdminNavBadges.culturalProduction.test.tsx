import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { resetDemoCulturalProduction } from "../../../features/admin/culturalProduction/culturalProductionDemoStore";
import { useAdminNavBadgeStatus } from "./useAdminNavBadges";

interface BadgeTestMocks {
  isDemo: boolean;
  staffRoles: string[];
  apiGet: Mock<(path: string) => Promise<unknown>>;
}

const mocks: BadgeTestMocks = vi.hoisted(() => ({
  isDemo: false,
  staffRoles: [],
  apiGet: vi.fn<(path: string) => Promise<unknown>>(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ role: mocks.isDemo ? "admin" : "member" }),
}));
vi.mock("../../../features/auth/api/useMyStaffRoles", () => ({
  useMyStaffRoles: () => mocks.staffRoles,
}));
vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  apiGet: (path: string) => mocks.apiGet(path),
}));

// The other queues are not under test; each stands in as an empty queue.
vi.mock("../../../features/admin/api/useAdminOverview", () => ({
  useAdminOverview: () => ({ data: undefined }),
}));
vi.mock("../../../features/admin/api/useModReports", () => ({
  useModReports: () => ({ data: undefined }),
}));
vi.mock("../../../features/admin/api/useJoinRequests", () => ({
  useJoinRequests: () => ({ data: undefined }),
}));
vi.mock("../../../features/marketing/api/usePartnerApplications", () => ({
  usePartnerApplications: () => ({ data: undefined }),
}));
vi.mock("../../../features/admin/api/useAdminVerifications", () => ({
  useVerificationRequests: () => ({ counts: {} }),
}));
vi.mock("../../../features/admin/api/useAdminHousingCoops", () => ({
  useAdminJoinRequests: () => ({ total: 0 }),
}));
vi.mock("../../../features/admin/api/useListingClaims", () => ({
  useListingClaims: () => ({ total: 0 }),
}));

const DUE_COUNT_PATH = "/admin/cultural-production/tasks/due-count";

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
}

function dueCountCalls(): string[][] {
  return mocks.apiGet.mock.calls.filter(([path]) =>
    path.includes(DUE_COUNT_PATH),
  );
}

beforeEach(() => {
  resetDemoCulturalProduction();
  mocks.apiGet.mockReset();
  mocks.apiGet.mockImplementation((path: string) =>
    Promise.resolve(path.includes(DUE_COUNT_PATH) ? { count: 3 } : {}),
  );
  mocks.isDemo = false;
  mocks.staffRoles = [];
});

describe("useAdminNavBadges cultural production", () => {
  it("counts the cultural production badge for a grant holder only", async () => {
    mocks.staffRoles = ["cultural_producer"];
    const holder = setup();
    const { result: holderResult } = renderHook(
      () => useAdminNavBadgeStatus(),
      { wrapper: holder.wrapper },
    );
    await waitFor(() =>
      expect(holderResult.current.counts.culturalProduction).toBe(3),
    );

    mocks.staffRoles = ["partnerships"];
    const other = setup();
    const { result: otherResult } = renderHook(() => useAdminNavBadgeStatus(), {
      wrapper: other.wrapper,
    });
    expect(otherResult.current.counts.culturalProduction).toBe(0);
    expect(otherResult.current.unavailable.culturalProduction).toBe(false);
  });

  it("reads 2 in demo", async () => {
    mocks.isDemo = true;
    mocks.staffRoles = ["cultural_producer", "music_manager_producer"];
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminNavBadgeStatus(), {
      wrapper,
    });
    // The seed has two of the viewer's open tasks due today or earlier.
    await waitFor(() =>
      expect(result.current.counts.culturalProduction).toBe(2),
    );
    expect(dueCountCalls()).toHaveLength(0);
  });

  it("marks the count unavailable when the read fails", async () => {
    mocks.staffRoles = ["music_manager_producer"];
    mocks.apiGet.mockImplementation((path: string) =>
      path.includes(DUE_COUNT_PATH)
        ? Promise.reject(new Error("due count read failed"))
        : Promise.resolve({}),
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminNavBadgeStatus(), {
      wrapper,
    });
    await waitFor(() =>
      expect(result.current.unavailable.culturalProduction).toBe(true),
    );
    expect(result.current.counts.culturalProduction).toBe(0);
  });

  it("sends no request for a member without access", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminNavBadgeStatus(), {
      wrapper,
    });
    expect(result.current.counts.culturalProduction).toBe(0);
    await Promise.resolve();
    expect(dueCountCalls()).toHaveLength(0);
  });
});
