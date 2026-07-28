import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfileCommunityCard } from "./ProfileCommunityCard";
import { TestProviders } from "../../test/TestProviders";
import type { FeaturedCommunityRef } from "./profileCommunities.types";

const FEATURED_COMMUNITY_REF: FeaturedCommunityRef = {
  slug: "queer-runners",
  name: "Queer Runners",
  tagline: "Weekly runs",
  type: "sports",
  typeLabel: "Sports",
  countLabel: "128 members",
  role: "owner",
};

describe("ProfileCommunityCard", () => {
  it("renders name, tagline, count, role badge, and links to the community", () => {
    render(
      <TestProviders>
        <ProfileCommunityCard community={FEATURED_COMMUNITY_REF} />
      </TestProviders>,
    );
    expect(screen.getByText("Queer Runners")).toBeInTheDocument();
    expect(screen.getByText("Weekly runs")).toBeInTheDocument();
    expect(screen.getByText("128 members")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/community/queer-runners",
    );
  });
});
