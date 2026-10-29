import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileHero } from "../subprofiles/SubprofileHero";
import type { PublicSubprofileView } from "../subprofiles/api/subprofiles.adapters";
import {
  toArtistRefView,
  toArtistView,
  type StudioArtistRefView,
  type StudioArtistView,
} from "./api/studio.adapters";
import type { StudioArtistRefDTO } from "./api/studio.types";
import type { StudioFoundingArtistsView } from "./api/useStudioFoundingArtists";
import { StudioArtistCard } from "./StudioArtistCard";
import { StudioArtistHero } from "./StudioArtistHero";
import { StudioFoundingShelf } from "./StudioFoundingShelf";

const mocks: { founding: StudioFoundingArtistsView | null } = vi.hoisted(
  () => ({ founding: null }),
);

vi.mock("./api/useStudioFoundingArtists", () => ({
  useStudioFoundingArtists: () => ({
    founding: mocks.founding,
    loadState: { isLoading: false },
  }),
  useStudioFoundingArtistIds: () =>
    new Set((mocks.founding?.artists ?? []).map((artist) => artist.id)),
}));
vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));

function artistRefOf(id: string, name: string): StudioArtistRefDTO {
  return {
    id,
    handle: id,
    name,
    kind: "musician",
    avatarUrl: null,
  };
}

function refViewOf(id: string, name: string): StudioArtistRefView {
  return toArtistRefView(artistRefOf(id, name));
}

function artistViewOf(isFoundingArtist: boolean): StudioArtistView {
  const view = toArtistView({
    artist: {
      ...artistRefOf("sp-hero", "Hero Artist"),
      bio: null,
      city: null,
      coverUrl: null,
      studioHero: null,
    },
    releases: [],
    ownerReleases: null,
    followerCount: 0,
    isFollowing: false,
    playlists: [],
  });
  return { ...view, isFoundingArtist };
}

function personaViewOf(
  overrides: Partial<PublicSubprofileView>,
): PublicSubprofileView {
  return {
    id: "sp-test",
    kind: "musician",
    displayName: "Afterhours",
    slug: "afterhours",
    handle: "afterhours",
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    socialLinks: [],
    endorsementCount: 0,
    followerCount: 0,
    viewerEndorsed: false,
    viewerFollowing: false,
    viewerIsMember: false,
    ...overrides,
  } as PublicSubprofileView;
}

beforeEach(() => {
  mocks.founding = null;
});

describe("founding badge on artist cards", () => {
  it("shows Founding artist only on a card whose id is in the founding set", () => {
    mocks.founding = {
      isShelfVisible: true,
      artists: [refViewOf("sp-one", "One")],
    };
    render(
      <TestProviders>
        <StudioArtistCard artist={refViewOf("sp-one", "One")} />
        <StudioArtistCard artist={refViewOf("sp-two", "Two")} />
      </TestProviders>,
    );
    expect(screen.getAllByText("Founding artist")).toHaveLength(1);
  });
});

describe("founding badge on the artist hero", () => {
  it("shows the badge in the kind line when the artist is a founding artist", () => {
    render(
      <TestProviders>
        <StudioArtistHero artist={artistViewOf(true)} />
      </TestProviders>,
    );
    expect(screen.getByText("Founding artist")).toBeInTheDocument();
  });

  it("shows no badge when the artist is not a founding artist", () => {
    render(
      <TestProviders>
        <StudioArtistHero artist={artistViewOf(false)} />
      </TestProviders>,
    );
    expect(screen.queryByText("Founding artist")).not.toBeInTheDocument();
  });
});

describe("StudioFoundingShelf", () => {
  const artists = [
    refViewOf("sp-a", "Artist A"),
    refViewOf("sp-b", "Artist B"),
    refViewOf("sp-c", "Artist C"),
  ];

  it("renders its title and every founding artist while the shelf is on", () => {
    mocks.founding = { isShelfVisible: true, artists };
    render(
      <TestProviders>
        <StudioFoundingShelf />
      </TestProviders>,
    );
    expect(
      screen.getByRole("heading", { name: /founding artists/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Artist A")).toBeInTheDocument();
    expect(screen.getByText("Artist B")).toBeInTheDocument();
    expect(screen.getByText("Artist C")).toBeInTheDocument();
  });

  it("renders nothing while the shelf switch is off", () => {
    mocks.founding = { isShelfVisible: false, artists };
    render(
      <TestProviders>
        <StudioFoundingShelf />
      </TestProviders>,
    );
    expect(screen.queryByText("Artist A")).not.toBeInTheDocument();
  });

  it("renders nothing when the list is empty", () => {
    mocks.founding = { isShelfVisible: true, artists: [] };
    render(
      <TestProviders>
        <StudioFoundingShelf />
      </TestProviders>,
    );
    expect(
      screen.queryByRole("heading", { name: /founding artists/i }),
    ).not.toBeInTheDocument();
  });
});

describe("founding badge on persona pages", () => {
  it("shows the persona badge in the tagline row of a founding artist", () => {
    const { container } = render(
      <TestProviders>
        <SubprofileHero
          view={personaViewOf({ isFoundingArtist: true })}
          mode="preview"
          onAction={() => {}}
        />
      </TestProviders>,
    );
    const row = container.querySelector(".pp-taglineRow");
    expect(row?.textContent).toContain("Founding artist");
  });

  it("shows the badge on the owner's own view from the founding id set when the flag is absent", () => {
    mocks.founding = {
      isShelfVisible: false,
      artists: [refViewOf("sp-test", "Afterhours")],
    };
    render(
      <TestProviders>
        <SubprofileHero
          view={personaViewOf({ id: "sp-test" })}
          mode="preview"
          onAction={() => {}}
        />
      </TestProviders>,
    );
    expect(screen.getByText("Founding artist")).toBeInTheDocument();
  });

  it("shows no badge on a podcaster persona without the flag", () => {
    render(
      <TestProviders>
        <SubprofileHero
          view={personaViewOf({ kind: "podcast_producer" })}
          mode="preview"
          onAction={() => {}}
        />
      </TestProviders>,
    );
    expect(screen.queryByText("Founding artist")).not.toBeInTheDocument();
  });
});
