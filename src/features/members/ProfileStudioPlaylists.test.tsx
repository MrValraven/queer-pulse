import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "../studio/api/studioDemoPlaylists";
import { ProfileStudioPlaylists } from "./ProfileStudioPlaylists";

beforeEach(() => resetDemoPlaylists());

describe("ProfileStudioPlaylists (demo)", () => {
  it("shows the member their own member-credited playlists, private ones included", async () => {
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
    expect(within(list).getByText("Private")).toBeInTheDocument();
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
