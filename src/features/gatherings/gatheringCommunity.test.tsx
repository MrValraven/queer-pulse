import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { EventCommunityDTO } from "./api/events.api";
import type { GatheringDetail } from "./data";
import { useDropUnhostableCommunity } from "./useHostableCommunities";
import { useVisibleGatheringCommunity } from "./useVisibleGatheringCommunity";

// Demo mode is on in tests, and the demo viewer mods `queer-runners` and
// `trans-hub` (CommunityMembershipProvider's seed) and belongs nowhere else.
const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

function gatheringWith(
  community: EventCommunityDTO | undefined,
  viewerIsOrganizer = false,
): GatheringDetail {
  return { community, viewerIsOrganizer } as unknown as GatheringDetail;
}

function visibleCommunity(gathering: GatheringDetail) {
  return renderHook(() => useVisibleGatheringCommunity(gathering), { wrapper })
    .result.current;
}

describe("useVisibleGatheringCommunity", () => {
  it("shows nothing for a gathering with no community", () => {
    expect(visibleCommunity(gatheringWith(undefined))).toBeNull();
  });

  it("names a listed community to a viewer who is not in it", () => {
    for (const accessTier of ["public", "request", "invite"] as const) {
      const community = { slug: "elsewhere", name: "Elsewhere", accessTier };
      expect(visibleCommunity(gatheringWith(community))).toEqual(community);
    }
  });

  it("keeps a private community from a viewer outside it", () => {
    const community = {
      slug: "secret-circle",
      name: "Secret Circle",
      accessTier: "private" as const,
    };
    expect(visibleCommunity(gatheringWith(community))).toBeNull();
  });

  it("names a private community to its own members and to the organizers", () => {
    const ownCommunity = {
      slug: "trans-hub",
      name: "Trans & Non-Binary Hub",
      accessTier: "private" as const,
    };
    expect(visibleCommunity(gatheringWith(ownCommunity))).toEqual(ownCommunity);

    const otherCommunity = { ...ownCommunity, slug: "secret-circle" };
    expect(visibleCommunity(gatheringWith(otherCommunity, true))).toEqual(
      otherCommunity,
    );
  });
});

describe("useDropUnhostableCommunity", () => {
  function run(communitySlug: string) {
    const setCommunitySlug = vi.fn();
    renderHook(
      () => useDropUnhostableCommunity({ communitySlug, setCommunitySlug }),
      { wrapper },
    );
    return setCommunitySlug;
  }

  it("keeps a community the host moderates", () => {
    expect(run("queer-runners")).not.toHaveBeenCalled();
  });

  it("clears a community the host cannot speak for", () => {
    expect(run("not-my-community")).toHaveBeenCalledWith("");
  });

  it("leaves an empty pick alone", () => {
    expect(run("")).not.toHaveBeenCalled();
  });
});
