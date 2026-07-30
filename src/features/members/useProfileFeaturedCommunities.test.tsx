import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useProfileFeaturedCommunities } from "./useProfileFeaturedCommunities";
import type { FeaturedCommunityRef } from "./profileCommunities.types";
import type { Member } from "./data/members";

const ELIGIBLE_COMMUNITY_CARDS: FeaturedCommunityRef[] = [
  {
    slug: "queer-runners",
    name: "Queer Runners",
    tagline: "runs",
    type: "sports",
    typeLabel: "Sports",
    countLabel: "128 members",
    role: "mod",
  },
  {
    slug: "trans-hub",
    name: "Trans Hub",
    tagline: "hub",
    type: "support",
    typeLabel: "Support",
    countLabel: "300 members",
    role: "member",
  },
];
vi.mock("./useMyCommunityCards", () => ({
  useMyCommunityCards: () => ELIGIBLE_COMMUNITY_CARDS,
}));
vi.mock("../../app/providers/useProfile", () => ({
  useProfile: () => ({
    draft: { featuredCommunities: ["trans-hub", "queer-runners", "ghost"] },
  }),
}));

describe("useProfileFeaturedCommunities", () => {
  it("self: resolves draft slugs in draft order, dropping unknown slugs", () => {
    const { result } = renderHook(() =>
      useProfileFeaturedCommunities({ isSelf: true, otherMember: null }),
    );
    expect(result.current.map((communityRef) => communityRef.slug)).toEqual([
      "trans-hub",
      "queer-runners",
    ]);
  });

  it("public: returns the other member's resolved refs", () => {
    const otherMember = {
      featuredCommunities: [ELIGIBLE_COMMUNITY_CARDS[0]],
    } as unknown as Member;
    const { result } = renderHook(() =>
      useProfileFeaturedCommunities({ isSelf: false, otherMember }),
    );
    expect(result.current.map((communityRef) => communityRef.slug)).toEqual([
      "queer-runners",
    ]);
  });

  it("public: drops refs missing a valid role or slug (defensive filter)", () => {
    const otherMember = {
      featuredCommunities: [
        ELIGIBLE_COMMUNITY_CARDS[0],
        { ...ELIGIBLE_COMMUNITY_CARDS[1], slug: "" },
        {
          ...ELIGIBLE_COMMUNITY_CARDS[1],
          role: "banned" as unknown as FeaturedCommunityRef["role"],
        },
      ],
    } as unknown as Member;
    const { result } = renderHook(() =>
      useProfileFeaturedCommunities({ isSelf: false, otherMember }),
    );
    expect(result.current.map((communityRef) => communityRef.slug)).toEqual([
      "queer-runners",
    ]);
  });

  it("public: returns an empty list when otherMember is null", () => {
    const { result } = renderHook(() =>
      useProfileFeaturedCommunities({ isSelf: false, otherMember: null }),
    );
    expect(result.current).toEqual([]);
  });
});
