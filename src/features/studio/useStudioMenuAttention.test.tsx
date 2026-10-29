import { render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../app/routeMap";
import { TestProviders } from "../../test/TestProviders";
import { STUDIO_MENU_CREATOR_ITEMS } from "./studioAccountMenu.data";
import { StudioAccountMenuLink } from "./StudioAccountMenuRows";
import { useStudioMenuAttention } from "./useStudioMenuAttention";

const mocks: {
  salesPending: number | null;
  creditRequests: number;
  claimReplies: number;
  counterWindows: number;
  claimsWaiting: number;
  disputesWaiting: number;
  isStaff: boolean;
} = vi.hoisted(() => ({
  salesPending: null,
  creditRequests: 0,
  claimReplies: 0,
  counterWindows: 0,
  claimsWaiting: 0,
  disputesWaiting: 0,
  isStaff: false,
}));

vi.mock("./api/useStudioSalesPendingCount", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioSalesPendingCount")>();
  return {
    useStudioSalesPendingCount: () =>
      mocks.salesPending === null
        ? original.useStudioSalesPendingCount()
        : { count: mocks.salesPending, countFor: () => mocks.salesPending },
  };
});
vi.mock("./api/useStudioCreditPendingCount", () => ({
  useStudioCreditPendingCount: () => ({ count: mocks.creditRequests }),
}));
vi.mock("./api/useStudioMyClaimsReplyCount", () => ({
  useStudioMyClaimsReplyCount: () => ({ count: mocks.claimReplies }),
}));
vi.mock("./api/useStudioMenuCounts", () => ({
  useStudioCounterWindows: () => ({
    count: mocks.counterWindows,
    href: null,
  }),
}));
vi.mock("./api/useStudioClaimReview", () => ({
  useStudioClaimCounts: () => ({
    waitingCount: mocks.claimsWaiting,
    disputesWaitingCount: mocks.disputesWaiting,
  }),
}));
vi.mock("./useIsStudioStaff", () => ({
  useIsStudioStaff: () => mocks.isStaff,
}));

beforeEach(() => {
  mocks.salesPending = 0;
  mocks.creditRequests = 0;
  mocks.claimReplies = 0;
  mocks.counterWindows = 0;
  mocks.claimsWaiting = 0;
  mocks.disputesWaiting = 0;
  mocks.isStaff = false;
});

describe("useStudioMenuAttention", () => {
  it("answers false while every count is zero", () => {
    const { result } = renderHook(() => useStudioMenuAttention());
    expect(result.current.hasAttention).toBe(false);
  });

  it("answers true when only the payments to confirm count is 2", () => {
    mocks.salesPending = 2;
    const { result } = renderHook(() => useStudioMenuAttention());
    expect(result.current.hasAttention).toBe(true);
  });
});

describe("Payments to confirm menu row", () => {
  it("names the waiting payments in the link name in demo", async () => {
    mocks.salesPending = null;
    const paymentsItem = STUDIO_MENU_CREATOR_ITEMS.find(
      (item) => item.badge === "salesPending",
    );
    expect(paymentsItem?.to).toBe(routes.studioPayments);
    render(
      <TestProviders>
        <StudioAccountMenuLink item={paymentsItem!} onNavigate={() => {}} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", {
        name: "Payments to confirm, 3 payments to confirm",
      }),
    ).toBeInTheDocument();
  });
});
