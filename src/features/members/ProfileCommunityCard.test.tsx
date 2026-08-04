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
  it("renders name, tagline, count, role badge, and links to the community", async () => {
    render(
      <TestProviders>
        <ProfileCommunityCard community={FEATURED_COMMUNITY_REF} />
      </TestProviders>,
    );
    // The role badge is the one translated string here; the `members` namespace
    // loads lazily (catalogs/index.ts), so await it rather than reading the raw
    // key. The rest are data fields, already present on first render.
    expect(await screen.findByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Queer Runners")).toBeInTheDocument();
    expect(screen.getByText("Weekly runs")).toBeInTheDocument();
    expect(screen.getByText("128 members")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/community/queer-runners",
    );
  });
});
