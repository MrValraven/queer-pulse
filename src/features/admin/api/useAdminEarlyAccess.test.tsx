import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoEarlyAccessRoster } from "../earlyAccess/adminEarlyAccess.data";
import {
  getEarlyAccessFeatures,
  getEarlyAccessRoster,
  getMemberEarlyAccess,
  grantMemberEarlyAccess,
  revokeMemberEarlyAccess,
} from "./adminEarlyAccess.api";
import type {
  EarlyAccessGrantDTO,
  EarlyAccessRosterDTO,
  MemberEarlyAccessDTO,
} from "./adminEarlyAccess.types";
import {
  useEarlyAccessFeatures,
  useEarlyAccessRoster,
  useMemberEarlyAccess,
  useRevokeEarlyAccessFromRoster,
  useSetMemberEarlyAccess,
} from "./useAdminEarlyAccess";

/**
 * Admin early access hooks. Demo runs read the fixtures and synthesise every
 * write; live runs mock the API module, so the optimistic flip, the server's
 * answer replacing it, and the rollback on failure are each observable.
 */

const mockDemoMode = vi.hoisted(() => ({ current: true }));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode.current }),
}));
// The demo session's signed-in staff member, whom a new demo grant credits.
const SIGNED_IN_STAFF = vi.hoisted(() => ({
  id: "demo",
  firstName: "Tiago",
  lastName: "Costa",
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({
    user: {
      id: SIGNED_IN_STAFF.id,
      profile: {
        firstName: SIGNED_IN_STAFF.firstName,
        lastName: SIGNED_IN_STAFF.lastName,
      },
    },
  }),
}));
vi.mock("./adminEarlyAccess.api", () => ({
  getMemberEarlyAccess: vi.fn(),
  grantMemberEarlyAccess: vi.fn(),
  revokeMemberEarlyAccess: vi.fn(),
  getEarlyAccessFeatures: vi.fn(),
  getEarlyAccessRoster: vi.fn(),
}));

beforeEach(() => {
  mockDemoMode.current = true;
  vi.resetAllMocks();
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
}

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const SERVER_GRANT: EarlyAccessGrantDTO = {
  featureKey: "quizshow",
  userId: "member-1",
  grantedAt: "2026-10-20T09:00:00.000Z",
  grantedBy: { id: "admin-1", displayName: "Sam" },
};

const recordWith = (
  grant: EarlyAccessGrantDTO | null,
): MemberEarlyAccessDTO => ({
  features: [{ featureKey: "quizshow", grant }],
});

const liveRoster: EarlyAccessRosterDTO = {
  featureKey: "quizshow",
  total: 2,
  limit: 200,
  items: [
    {
      member: {
        userId: "member-1",
        slug: "river",
        displayName: "River",
        avatarUrl: null,
      },
      grantedAt: "2026-10-19T09:00:00.000Z",
      grantedBy: null,
    },
    {
      member: {
        userId: "member-2",
        slug: "noor",
        displayName: "Noor",
        avatarUrl: null,
      },
      grantedAt: "2026-10-18T09:00:00.000Z",
      grantedBy: null,
    },
  ],
};

const quizshowGrant = (record: MemberEarlyAccessDTO | undefined) =>
  record?.features.find((feature) => feature.featureKey === "quizshow")
    ?.grant ?? null;

describe("early access hooks (demo)", () => {
  it("turns a feature on, and the count and roster follow", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        member: useMemberEarlyAccess("ines"),
        features: useEarlyAccessFeatures(),
        roster: useEarlyAccessRoster("quizshow"),
        toggle: useSetMemberEarlyAccess(),
      }),
      { wrapper },
    );
    await waitFor(() => {
      expect(result.current.member.data).toBeDefined();
      expect(result.current.features.data).toBeDefined();
      expect(result.current.roster.data).toBeDefined();
    });
    expect(quizshowGrant(result.current.member.data)).toBeNull();
    const startingTotal = demoEarlyAccessRoster("quizshow").total;

    await act(() =>
      result.current.toggle.mutateAsync({
        memberId: "ines",
        featureKey: "quizshow",
        isGranted: true,
      }),
    );

    await waitFor(() =>
      expect(quizshowGrant(result.current.member.data)).toMatchObject({
        userId: "ines",
        grantedBy: {
          id: SIGNED_IN_STAFF.id,
          displayName: `${SIGNED_IN_STAFF.firstName} ${SIGNED_IN_STAFF.lastName}`,
        },
      }),
    );
    expect(result.current.features.data?.features[0]?.grantCount).toBe(
      startingTotal + 1,
    );
    expect(result.current.roster.data?.total).toBe(startingTotal + 1);
    expect(result.current.roster.data?.items[0]?.member.userId).toBe("ines");
    // The fixtures stay as they were for the next reader.
    expect(demoEarlyAccessRoster("quizshow").total).toBe(startingTotal);
    expect(getMemberEarlyAccess).not.toHaveBeenCalled();
    expect(grantMemberEarlyAccess).not.toHaveBeenCalled();
  });

  it("revokes from the roster and clears the member's record", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        member: useMemberEarlyAccess("devon"),
        features: useEarlyAccessFeatures(),
        roster: useEarlyAccessRoster("quizshow"),
        revoke: useRevokeEarlyAccessFromRoster(),
      }),
      { wrapper },
    );
    await waitFor(() => {
      expect(result.current.member.data).toBeDefined();
      expect(result.current.features.data).toBeDefined();
      expect(result.current.roster.data).toBeDefined();
    });
    expect(quizshowGrant(result.current.member.data)).not.toBeNull();
    const startingTotal = demoEarlyAccessRoster("quizshow").total;

    await act(() =>
      result.current.revoke.mutateAsync({
        memberId: "devon",
        featureKey: "quizshow",
      }),
    );

    await waitFor(() =>
      expect(result.current.roster.data?.total).toBe(startingTotal - 1),
    );
    expect(
      result.current.roster.data?.items.map((row) => row.member.userId),
    ).not.toContain("devon");
    expect(result.current.features.data?.features[0]?.grantCount).toBe(
      startingTotal - 1,
    );
    expect(quizshowGrant(result.current.member.data)).toBeNull();
    expect(revokeMemberEarlyAccess).not.toHaveBeenCalled();
  });
});

describe("early access hooks (live)", () => {
  beforeEach(() => {
    mockDemoMode.current = false;
    vi.mocked(getEarlyAccessFeatures).mockResolvedValue({
      features: [{ featureKey: "quizshow", grantCount: 2 }],
    });
    vi.mocked(getEarlyAccessRoster).mockResolvedValue(liveRoster);
  });

  it("flips the toggle at once, then keeps the server's grant", async () => {
    vi.mocked(getMemberEarlyAccess).mockResolvedValue(recordWith(null));
    const pendingGrant = deferred<EarlyAccessGrantDTO>();
    vi.mocked(grantMemberEarlyAccess).mockReturnValue(pendingGrant.promise);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        member: useMemberEarlyAccess("member-1"),
        toggle: useSetMemberEarlyAccess(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.member.data).toBeDefined());

    act(() =>
      result.current.toggle.mutate({
        memberId: "member-1",
        featureKey: "quizshow",
        isGranted: true,
      }),
    );

    await waitFor(() =>
      expect(quizshowGrant(result.current.member.data)).toMatchObject({
        userId: "member-1",
        grantedBy: null,
      }),
    );
    expect(grantMemberEarlyAccess).toHaveBeenCalledWith("member-1", "quizshow");

    vi.mocked(getMemberEarlyAccess).mockResolvedValue(recordWith(SERVER_GRANT));
    act(() => pendingGrant.resolve(SERVER_GRANT));

    await waitFor(() =>
      expect(quizshowGrant(result.current.member.data)).toEqual(SERVER_GRANT),
    );
  });

  it("rolls the toggle back when the revoke fails", async () => {
    vi.mocked(getMemberEarlyAccess).mockResolvedValue(recordWith(SERVER_GRANT));
    const pendingRevoke = deferred<void>();
    vi.mocked(revokeMemberEarlyAccess).mockReturnValue(pendingRevoke.promise);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        member: useMemberEarlyAccess("member-1"),
        toggle: useSetMemberEarlyAccess(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(quizshowGrant(result.current.member.data)).toEqual(SERVER_GRANT),
    );

    act(() =>
      result.current.toggle.mutate({
        memberId: "member-1",
        featureKey: "quizshow",
        isGranted: false,
      }),
    );
    await waitFor(() =>
      expect(quizshowGrant(result.current.member.data)).toBeNull(),
    );

    act(() => pendingRevoke.reject(new Error("offline")));

    await waitFor(() => expect(result.current.toggle.isError).toBe(true));
    expect(quizshowGrant(result.current.member.data)).toEqual(SERVER_GRANT);
  });

  it("drops the roster row at once and restores it when the revoke fails", async () => {
    const pendingRevoke = deferred<void>();
    vi.mocked(revokeMemberEarlyAccess).mockReturnValue(pendingRevoke.promise);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({
        roster: useEarlyAccessRoster("quizshow"),
        revoke: useRevokeEarlyAccessFromRoster(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.roster.data).toBeDefined());

    act(() =>
      result.current.revoke.mutate({
        memberId: "member-1",
        featureKey: "quizshow",
      }),
    );

    await waitFor(() => expect(result.current.roster.data?.total).toBe(1));
    expect(
      result.current.roster.data?.items.map((row) => row.member.userId),
    ).toEqual(["member-2"]);

    act(() => pendingRevoke.reject(new Error("offline")));

    await waitFor(() => expect(result.current.revoke.isError).toBe(true));
    expect(result.current.roster.data).toEqual(liveRoster);
  });
});
