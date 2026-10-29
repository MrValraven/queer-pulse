import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import {
  SPOTIFY_ROYALTY_SOURCE_URL,
  STUDIO_LANDING_FOR_ARTISTS_POINTS,
} from "./studioLanding.data";
import { StudioLandingForArtists } from "./StudioLandingForArtists";
import { StudioLandingSpotifyFact } from "./StudioLandingSpotifyFact";

afterEach(() => {
  localStorage.clear();
});

function renderSection() {
  return render(
    <TestProviders>
      <StudioLandingForArtists />
    </TestProviders>,
  );
}

describe("StudioLandingForArtists", () => {
  it("is the #artists section, labelled by its heading", () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    const { container } = renderSection();
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "artists");
    expect(
      screen.getByRole("heading", { level: 2, name: /Release on Studio/ }),
    ).toBeInTheDocument();
    expect(section).toHaveAccessibleName(/Release on Studio/);
  });

  it("lists the five things artists get, each with an h3 title", () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderSection();
    expect(STUDIO_LANDING_FOR_ARTISTS_POINTS).toHaveLength(5);
    const pointList = screen.getAllByRole("list")[0]!;
    const pointItems = within(pointList).getAllByRole("listitem");
    expect(pointItems).toHaveLength(5);
    for (const pointItem of pointItems) {
      expect(
        within(pointItem).getByRole("heading", { level: 3 }),
      ).toBeInTheDocument();
    }
  });

  it("shows the founding block with its title, body and priority line", () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderSection();
    expect(
      screen.getByRole("heading", { level: 3, name: "Be a founding artist" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The first artists in are featured at launch/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/our team looks at your request first/),
    ).toBeInTheDocument();
  });

  it("signed out offers Apply as an artist, tagged studio_artist", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderSection();
    const applyLink = await screen.findByRole("link", {
      name: "Apply as an artist",
    });
    expect(applyLink).toHaveAttribute(
      "href",
      "/auth/request-invite?from=studio_artist",
    );
  });

  it("a member sees Request Studio access with I make music ticked", async () => {
    renderSection();
    expect(
      await screen.findByRole("button", { name: "Request Studio access" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "I make music and want to release it on Studio",
      }),
    ).toBeChecked();
  });
});

describe("StudioLandingSpotifyFact", () => {
  it("states the 1,000 streams fact beside the Studio line", () => {
    render(
      <TestProviders>
        <StudioLandingSpotifyFact />
      </TestProviders>,
    );
    const callout = screen.getByRole("complementary", {
      name: "Worth knowing",
    });
    expect(within(callout).getByText(/1,000 streams/)).toBeInTheDocument();
    expect(
      within(callout).getByText(/On Studio a new track has its own page/),
    ).toBeInTheDocument();
  });

  it("links the source in a new tab and says so in its name", () => {
    render(
      <TestProviders>
        <StudioLandingSpotifyFact />
      </TestProviders>,
    );
    const sourceLink = screen.getByRole("link", {
      name: /Spotify's announcement, November 2023/,
    });
    expect(sourceLink).toHaveAttribute("href", SPOTIFY_ROYALTY_SOURCE_URL);
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      sourceLink.textContent?.trim().endsWith("(opens in a new tab)"),
    ).toBe(true);
    expect(sourceLink).toHaveAccessibleName(/\(opens in a new tab\)$/);
  });
});
