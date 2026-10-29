import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DEMO_INVITE_REQUESTS } from "../../../features/gatherings/api/inviteRequests.data";
import { useAdminNavBadges } from "./useAdminNavBadges";

const mocks: {
  isDemo: boolean;
  staffRoles: string[];
  apiGet: Mock<(path: string) => Promise<unknown>>;
} = vi.hoisted(() => ({
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

// The other five queues are not under test; each stands in as an empty queue.
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

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
}

beforeEach(() => {
  mocks.apiGet.mockReset();
  mocks.isDemo = false;
  mocks.staffRoles = [];
});

describe("useAdminNavBadges music events", () => {
  it("counts pending invite requests for a holder", async () => {
    mocks.isDemo = true;
    mocks.staffRoles = ["music_manager_producer"];
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminNavBadges(), { wrapper });
    // Both upcoming demo events carry the demo invite requests.
    await waitFor(() =>
      expect(result.current.musicEvents).toBe(DEMO_INVITE_REQUESTS.length * 2),
    );
  });

  it("stays at zero and fires no request without the grant", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAdminNavBadges(), { wrapper });
    expect(result.current.musicEvents).toBe(0);
    await Promise.resolve();
    expect(
      mocks.apiGet.mock.calls.filter(([path]) =>
        path.includes("/admin/music-events"),
      ),
    ).toHaveLength(0);
  });
});
