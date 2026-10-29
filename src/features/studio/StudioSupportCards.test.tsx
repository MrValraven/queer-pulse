import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  toArtistView,
  toReleaseView,
  type StudioArtistView,
} from "./api/studio.adapters";
import type { StudioSupportLinkDTO } from "./api/studio.types";
import { StudioExternalLinkList } from "./StudioExternalLinkList";
import { StudioArtistSupportCard } from "./StudioArtistSupportCard";
import { StudioReleaseSupportCard } from "./StudioReleaseSupportCard";

const artistRef = {
  id: "p1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

function artistWith(
  links: StudioSupportLinkDTO[],
  isOwner: boolean,
): StudioArtistView {
  return toArtistView({
    artist: {
      ...artistRef,
      bio: null,
      city: null,
      coverUrl: null,
      studioHero: null,
    },
    releases: [],
    ownerReleases: isOwner ? [] : null,
    followerCount: 0,
    isFollowing: false,
    playlists: [],
    supportLinks: links,
    upcoming: [],
  });
}

function releaseWith(
  buyUrl: string | null,
  links: StudioSupportLinkDTO[] = [],
) {
  return toReleaseView({
    id: "r1",
    title: "Salt water",
    type: "ep",
    coverUrl: null,
    releasedOn: null,
    trackCount: 0,
    totalDurationSeconds: 0,
    artist: artistRef,
    description: null,
    genre: null,
    genres: [],
    mood: null,
    scene: null,
    status: "published",
    publishedAt: null,
    tracks: [],
    isOwner: false,
    rightsConfirmedAt: null,
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
    buyUrl,
    supportLinks: links,
  });
}

describe("StudioExternalLinkList", () => {
  it("opens an email link in place, without the new-tab cue", () => {
    render(
      <TestProviders>
        <StudioExternalLinkList
          label="Links"
          links={[
            {
              platform: "email",
              platformLabel: "Email",
              handleLabel: "press@nightform.pt",
              href: "mailto:press@nightform.pt",
            },
          ]}
        />
      </TestProviders>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "mailto:press@nightform.pt");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(link).not.toHaveAccessibleName(/opens in a new tab/i);
    expect(link.querySelector("svg:not(:first-child)")).toBeNull();
  });
});

describe("StudioArtistSupportCard", () => {
  it("lists the links, each opening in a new tab", async () => {
    render(
      <TestProviders>
        <StudioArtistSupportCard
          artist={artistWith(
            [
              {
                platform: "bandcamp",
                urlOrHandle: "https://nightform.bandcamp.com",
              },
              { platform: "patreon", urlOrHandle: "@nightform" },
            ],
            false,
          )}
        />
      </TestProviders>,
    );
    const card = await screen.findByRole("region", {
      name: "Support NIGHTFORM",
    });
    const links = within(card).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://nightform.bandcamp.com");
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    expect(links[1]).toHaveAccessibleName(/patreon.*opens in a new tab/i);
  });

  it("stays hidden from a visitor when the persona has none", () => {
    const { container } = render(
      <TestProviders>
        <StudioArtistSupportCard artist={artistWith([], false)} />
      </TestProviders>,
    );
    expect(container.querySelector("section")).toBeNull();
  });

  it("tells the owner where to add them", async () => {
    render(
      <TestProviders>
        <StudioArtistSupportCard artist={artistWith([], true)} />
      </TestProviders>,
    );
    expect(
      await screen.findByText(
        "Add Bandcamp, Ko-fi or Patreon to your persona's links",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Edit persona links" }),
    ).toHaveAttribute("href", "/account/subprofiles/p1/edit?pane=presence");
  });
});

describe("StudioReleaseSupportCard", () => {
  it("says Buy on Bandcamp for a Bandcamp link", async () => {
    render(
      <TestProviders>
        <StudioReleaseSupportCard
          release={releaseWith(
            "https://nightform.bandcamp.com/album/salt-water",
          )}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: /buy on bandcamp/i }),
    ).toHaveAttribute(
      "href",
      "https://nightform.bandcamp.com/album/salt-water",
    );
  });

  it("says Buy this release for any other shop", async () => {
    render(
      <TestProviders>
        <StudioReleaseSupportCard
          release={releaseWith("https://shop.example.org/cd")}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: /buy this release/i }),
    ).toBeInTheDocument();
  });

  it("treats a lookalike host as any other shop", async () => {
    render(
      <TestProviders>
        <StudioReleaseSupportCard
          release={releaseWith("https://evilbandcamp.com/x")}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: /buy this release/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/buy on bandcamp/i)).toBeNull();
  });

  it("opens the buy link in a new tab safely", async () => {
    render(
      <TestProviders>
        <StudioReleaseSupportCard
          release={releaseWith("https://shop.example.org/cd")}
        />
      </TestProviders>,
    );
    const link = await screen.findByRole("link", { name: /buy this release/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders nothing with no buy link and no support links", () => {
    const { container } = render(
      <TestProviders>
        <StudioReleaseSupportCard release={releaseWith(null)} />
      </TestProviders>,
    );
    expect(container.querySelector("section")).toBeNull();
  });
});

describe("StudioExternalLinkList", () => {
  it("reads a link without an href as plain text with no icon", () => {
    const { container } = render(
      <TestProviders>
        <StudioExternalLinkList
          label="Links"
          links={[
            {
              platform: "bandcamp",
              platformLabel: "Bandcamp",
              handleLabel: "nightform",
              href: null,
            },
          ]}
        />
      </TestProviders>,
    );
    expect(screen.getByText("nightform")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });
});
