import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminCommunitySpaces } from "./AdminCommunitySpaces";
import { COMMUNITIES, type Community } from "./adminCommunities.data";

function renderSpaces(
  subcommunities: Community["subcommunities"],
  onOpen = vi.fn(),
) {
  const community: Community = { ...COMMUNITIES[0]!, subcommunities };
  render(
    <TestProviders>
      <AdminCommunitySpaces community={community} onOpen={onOpen} />
    </TestProviders>,
  );
  return { onOpen };
}

describe("AdminCommunitySpaces", () => {
  it("renders a row per space, with its name, tier and member count", async () => {
    renderSpaces([
      {
        slug: "trans-friends-parents",
        name: "Parents Circle",
        accessTier: "public",
        memberCount: 42,
      },
      {
        slug: "trans-friends-flinta",
        name: "FLINTA Meetups",
        accessTier: "request",
        memberCount: 18,
      },
    ]);

    expect(await screen.findByText("Parents Circle")).toBeInTheDocument();
    expect(screen.getByText("FLINTA Meetups")).toBeInTheDocument();
    expect(screen.getByText("Open to all")).toBeInTheDocument();
    expect(screen.getByText("Request to join")).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });

  it("renders the empty line when the community hosts no spaces", async () => {
    renderSpaces([]);
    expect(await screen.findByText("No spaces")).toBeInTheDocument();
  });

  it("renders the empty line when subcommunities is missing entirely", async () => {
    renderSpaces(undefined);
    expect(await screen.findByText("No spaces")).toBeInTheDocument();
  });

  it("opens the clicked space by its slug", async () => {
    const { onOpen } = renderSpaces([
      {
        slug: "trans-friends-parents",
        name: "Parents Circle",
        accessTier: "public",
        memberCount: 42,
      },
    ]);
    const row = await screen.findByText("Parents Circle");
    row.closest("button")?.click();
    expect(onOpen).toHaveBeenCalledWith("trans-friends-parents");
  });
});
