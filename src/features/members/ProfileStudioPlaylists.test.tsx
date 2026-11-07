import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  demoSetProfilePlaylists,
  resetDemoPlaylists,
} from "../studio/api/studioDemoPlaylists";
import { ProfileStudioPlaylists } from "./ProfileStudioPlaylists";

beforeEach(() => resetDemoPlaylists());

describe("ProfileStudioPlaylists (demo)", () => {
  it("shows the member the playlists they featured, a private one included", async () => {
    // The owner's profile reads their own profile-playlists setting: with
    // nothing featured it shows only public playlists, and every playlist the
    // demo viewer credits to themselves is private or connections-only. So
    // the owner features one here, the way the settings screen does.
    demoSetProfilePlaylists({
      isShown: true,
      featuredIds: ["demo-playlist-kitchen-tapes"],
    });
    render(
      <TestProviders>
        <ProfileStudioPlaylists memberSlug="tiago" isSelf firstName="Tiago" />
      </TestProviders>,
    );
    const list = await screen.findByRole("list", {
      name: "Playlists in Studio",
    });
    expect(
      within(list).getByRole("link", { name: /kitchen tapes/i }),
    ).toBeInTheDocument();
    expect(
      within(list).queryByRole("link", { name: /cartas que voltam/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your playlists" }),
    ).toBeInTheDocument();
    // The visibility chip's label lives in the lazy `studio` namespace.
    expect(await within(list).findByText("Private")).toBeInTheDocument();
  });

  it("names another member's block after them", async () => {
    render(
      <TestProviders>
        <ProfileStudioPlaylists
          memberSlug="sara-marques"
          isSelf={false}
          firstName="Sara"
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Sara's playlists" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /lisbon dyke-bar standards/i }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Playlists in Studio" });
    expect(within(list).queryByText("Private")).not.toBeInTheDocument();
    expect(
      within(list).queryByText("Connections only"),
    ).not.toBeInTheDocument();
    expect(within(list).queryByText("Public")).not.toBeInTheDocument();
  });

  it("renders nothing for a member with no playlists", async () => {
    render(
      <TestProviders>
        <ProfileStudioPlaylists
          memberSlug="nobody-here"
          isSelf={false}
          firstName="Nobody"
        />
      </TestProviders>,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(
      screen.queryByRole("list", { name: "Playlists in Studio" }),
    ).not.toBeInTheDocument();
  });
});
