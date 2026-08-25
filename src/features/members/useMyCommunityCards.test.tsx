import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useMyCommunityCards } from "./useMyCommunityCards";
import type { Community } from "../homepage/data/types";

vi.mock("../communities/api/useMyCommunities", () => ({
  useMyCommunities: () => ({
    "queer-runners": { role: "mod", joinedAt: "March 2025" },
    "coming-out": { role: "member", joinedAt: "Jan 2025" },
    "orphan-slug": { role: "member", joinedAt: "just now" },
  }),
}));

const REGISTRY: Community[] = [
  {
    href: "#",
    slug: "queer-runners",
    name: "Queer Runners",
    description: "Weekly runs",
    type: "sports",
    typeLabel: "Sport",
    count: "128 members",
    joinLabel: "Join",
  },
  {
    href: "#",
    slug: "coming-out",
    name: "Coming Out Circle",
    description: "A safe space",
    type: "support",
    typeLabel: "Support",
    count: "40 members",
    joinLabel: "Request",
    privateBadge: true,
  },
];
vi.mock("../communities/api/useCommunities", () => ({
  useCommunities: () => ({
    items: REGISTRY,
    total: REGISTRY.length,
    hasNextPage: false,
    fetchNextPage: () => {},
    isFetchingNextPage: false,
    isLoading: false,
  }),
}));

describe("useMyCommunityCards", () => {
  it("returns non-private communities I'm in, with my role, dropping private and orphan slugs", () => {
    const { result } = renderHook(() => useMyCommunityCards());
    expect(result.current.map((communityRef) => communityRef.slug)).toEqual([
      "queer-runners",
    ]);
    expect(result.current[0]).toMatchObject({
      name: "Queer Runners",
      tagline: "Weekly runs",
      countLabel: "128 members",
      role: "mod",
    });
  });
});
