import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ProfileCommunitiesSection } from "./ProfileCommunitiesSection";
import type { FeaturedCommunityRef } from "./profileCommunities.types";

const FEATURED_COMMUNITIES: FeaturedCommunityRef[] = [
  {
    slug: "queer-runners",
    name: "Queer Runners",
    tagline: "runs",
    type: "sports",
    typeLabel: "Sports",
    countLabel: "128 members",
    role: "owner",
  },
];
let mockFeaturedCommunities: FeaturedCommunityRef[] = FEATURED_COMMUNITIES;
vi.mock("./useProfileFeaturedCommunities", () => ({
  useProfileFeaturedCommunities: () => mockFeaturedCommunities,
}));

function renderSection(props: { isSelf: boolean; previewing?: boolean }) {
  return render(
    <TestProviders>
      <ProfileCommunitiesSection
        isSelf={props.isSelf}
        previewing={props.previewing}
        otherMember={null}
        firstName="Sam"
      />
    </TestProviders>,
  );
}

describe("ProfileCommunitiesSection", () => {
  it("renders cards when there are featured communities", () => {
    mockFeaturedCommunities = FEATURED_COMMUNITIES;
    renderSection({ isSelf: false });
    expect(screen.getByText("Queer Runners")).toBeInTheDocument();
  });

  it("renders nothing for a public viewer when empty", () => {
    mockFeaturedCommunities = [];
    renderSection({ isSelf: false });
    expect(screen.queryByText("Communities")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Feature your communities"),
    ).not.toBeInTheDocument();
  });

  it("renders a prompt for self when empty", async () => {
    mockFeaturedCommunities = [];
    renderSection({ isSelf: true });
    // The `members` namespace loads lazily (catalogs/index.ts), so the empty
    // prompt's title resolves after the post-commit fetch — await it rather
    // than reading the raw key.
    expect(
      await screen.findByText("Feature your communities"),
    ).toBeInTheDocument();
  });

  it("renders cards for an owner previewing (resolves from draft, public presentation)", () => {
    mockFeaturedCommunities = FEATURED_COMMUNITIES;
    renderSection({ isSelf: true, previewing: true });
    expect(screen.getByText("Queer Runners")).toBeInTheDocument();
  });

  it("renders nothing for an owner previewing when empty (mirrors public, not the self prompt)", () => {
    mockFeaturedCommunities = [];
    renderSection({ isSelf: true, previewing: true });
    expect(screen.queryByText("Communities")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Feature your communities"),
    ).not.toBeInTheDocument();
  });
});
