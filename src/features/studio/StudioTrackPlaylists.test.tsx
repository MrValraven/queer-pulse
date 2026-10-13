import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { StudioTrackPlaylists } from "./StudioTrackPlaylists";

beforeEach(() => resetDemoPlaylists());

describe("StudioTrackPlaylists", () => {
  it("lists the public playlists holding the track", async () => {
    render(
      <TestProviders>
        <StudioTrackPlaylists trackId="demo-track-home-2-01" />
      </TestProviders>,
    );
    const region = await screen.findByRole("region", {
      name: /in these playlists/i,
    });
    expect(
      within(region).getByRole("link", { name: "Lisbon dyke-bar standards" }),
    ).toBeInTheDocument();
    // The card links its credit: a member to their profile, a persona to Studio.
    expect(
      within(region).getByRole("link", { name: "Sara Marques" }),
    ).toHaveAttribute("href", "/members/sara-marques");
    expect(
      within(region).getByRole("link", { name: "NIGHTFORM" }),
    ).toHaveAttribute("href", "/studio/artist?id=sp-diogo-nightform");
    expect(
      within(region).queryByRole("link", { name: "For the group chat" }),
    ).not.toBeInTheDocument();
  });

  it("shows nothing for a track in no public playlist", async () => {
    render(
      <TestProviders>
        <StudioTrackPlaylists trackId="demo-track-mariana-3-02" />
      </TestProviders>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(
      screen.queryByRole("region", { name: /in these playlists/i }),
    ).not.toBeInTheDocument();
  });
});
