import { act, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { GuestCommunityChanges } from "./api/eventCommunities.api";
import type { GuestCommunityChangesResult } from "./api/useEventGuestCommunities";
import { useSaveGuestCommunityChanges } from "./useSaveGuestCommunityChanges";

const mocks: { result: GuestCommunityChangesResult } = vi.hoisted(() => ({
  result: { failedCount: 0, firstRejection: null },
}));

vi.mock("./api/useEventGuestCommunities", () => ({
  useApplyGuestCommunityChanges: () => () => Promise.resolve(mocks.result),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const oneInvite: GuestCommunityChanges = {
  invites: [
    {
      slug: "queer-runners",
      name: "Queer Runners Lisboa",
      accessTier: "public",
      status: "unsent",
    },
  ],
  removeSlugs: [],
};

describe("useSaveGuestCommunityChanges", () => {
  afterEach(() => {
    mocks.result = { failedCount: 0, firstRejection: null };
  });

  it("names a coded refusal in place of the count", async () => {
    mocks.result = {
      failedCount: 1,
      firstRejection: new ApiError(400, "Bad request", {
        statusCode: 400,
        code: "music_event_community_unavailable",
      }),
    };
    const { result } = renderHook(() => useSaveGuestCommunityChanges("night"), {
      wrapper,
    });
    act(() => result.current(oneInvite));
    expect(
      await screen.findByText(
        "A QueerPulse music event can't be for one community only",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Open Edit details to try again/)).toBeNull();
  });

  it("keeps the count copy for an uncoded failure", async () => {
    mocks.result = { failedCount: 2, firstRejection: new Error("offline") };
    const { result } = renderHook(() => useSaveGuestCommunityChanges("night"), {
      wrapper,
    });
    act(() => result.current(oneInvite));
    expect(
      await screen.findByText(
        "2 guest community changes didn't save. Open Edit details to try again.",
      ),
    ).toBeInTheDocument();
  });
});
