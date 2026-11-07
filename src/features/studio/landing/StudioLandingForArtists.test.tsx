import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import {
  SPOTIFY_ROYALTY_SOURCE_URL,
  STUDIO_LANDING_FOR_ARTISTS_POINTS,
} from "./studioLanding.data";
import { StudioLandingForArtists } from "./StudioLandingForArtists";
import { StudioLandingSpotifyFact } from "./StudioLandingSpotifyFact";

afterEach(() => {
  localStorage.clear();
});

async function renderSection() {
  const view = render(
    <TestProviders>
      <StudioLandingForArtists />
    </TestProviders>,
  );
  await awaitCatalog("studio");
  return view;
}

async function renderSpotifyFact() {
  render(
    <TestProviders>
      <StudioLandingSpotifyFact />
    </TestProviders>,
  );
  await awaitCatalog("studio");
}

describe("StudioLandingForArtists", () => {
  it("is the #artists section, labelled by its heading", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    const { container } = await renderSection();
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "artists");
    expect(
      screen.getByRole("heading", { level: 2, name: /Release on Studio/ }),
    ).toBeInTheDocument();
    expect(section).toHaveAccessibleName(/Release on Studio/);
  });

  it("lists the five things artists get, each with an h3 title", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    await renderSection();
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

  it("shows the founding block with its title, body and priority line", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    await renderSection();
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
    await renderSection();
    const applyLink = await screen.findByRole("link", {
      name: "Apply as an artist",
    });
    expect(applyLink).toHaveAttribute(
      "href",
      "/auth/request-invite?from=studio_artist",
    );
  });

  it("a member sees the compact Request Studio access button alone", async () => {
    await renderSection();
    expect(
      await screen.findByRole("button", { name: "Request Studio access" }),
    ).toBeInTheDocument();
    // The "I make music" choice lives in the hero; this section always asks
    // as an artist (StudioLandingAccessRequestCompact).
    expect(
      screen.queryByRole("checkbox", {
        name: "I make music and want to release it on Studio",
      }),
    ).toBeNull();
  });
});

describe("StudioLandingSpotifyFact", () => {
  it("states the 1,000 streams fact beside the Studio line", async () => {
    await renderSpotifyFact();
    const callout = screen.getByRole("complementary", {
      name: "Worth knowing",
    });
    expect(within(callout).getByText(/1,000 streams/)).toBeInTheDocument();
    expect(
      within(callout).getByText(/On Studio a new track has its own page/),
    ).toBeInTheDocument();
  });

  it("links the source in a new tab and says so in its name", async () => {
    await renderSpotifyFact();
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
