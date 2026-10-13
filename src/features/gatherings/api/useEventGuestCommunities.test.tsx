import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  useApplyGuestCommunityChanges,
  useEventGuestCommunities,
} from "./useEventGuestCommunities";

// Demo mode is on in tests, and the demo viewer mods `queer-runners` and
// `trans-hub` (CommunityMembershipProvider's seed).
const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

describe("useEventGuestCommunities in demo mode", () => {
  it("lists the demo manage gathering's guests in every status", async () => {
    const { result } = renderHook(
      () => useEventGuestCommunities("pride-brunch-jun"),
      { wrapper },
    );
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.map((view) => view.status)).toEqual([
      "accepted",
      "pending",
      "declined",
    ]);
  });

  it("applies a save to the cached list with no request", async () => {
    const { result } = renderHook(
      () => ({
        list: useEventGuestCommunities("pride-brunch-jun"),
        apply: useApplyGuestCommunityChanges("pride-brunch-jun"),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.data).toBeDefined());
    let failedCount = -1;
    await act(async () => {
      ({ failedCount } = await result.current.apply({
        invites: [
          {
            slug: "queer-runners",
            name: "Queer Runners Lisboa",
            accessTier: "public",
            status: "unsent",
          },
        ],
        removeSlugs: ["rainbow-arts"],
      }));
    });
    expect(failedCount).toBe(0);
    await waitFor(() =>
      expect(
        result.current.list.data?.map((view) => [
          view.community.slug,
          view.status,
        ]),
      ).toEqual([
        ["trans-hub", "accepted"],
        ["queer-elders", "declined"],
        ["queer-runners", "accepted"],
      ]),
    );
  });
});
