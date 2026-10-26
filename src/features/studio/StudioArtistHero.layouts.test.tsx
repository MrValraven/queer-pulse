import { createRef, type RefObject } from "react";
import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toArtistView, type StudioArtistView } from "./api/studio.adapters";
import { StudioPlayerContext } from "./player/studioPlayerContext";
import { StudioArtistHero } from "./StudioArtistHero";

vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));

const AVATAR_SRC = "/files/persona-avatar.jpg";
const COVER_SRC = "/files/persona-cover.jpg";

function artistWith(
  coverUrl: string | null,
  studioHero: "full-bleed" | "avatar" | null,
): StudioArtistView {
  return toArtistView({
    artist: {
      id: "sp-mariana",
      handle: "mariana",
      name: "Mariana",
      kind: "musician",
      avatarUrl: AVATAR_SRC,
      bio: null,
      city: null,
      coverUrl,
      studioHero,
    },
    releases: [],
    ownerReleases: null,
    followerCount: 12,
    isFollowing: false,
    playlists: [],
  });
}

function renderHero(view: StudioArtistView) {
  const titleRef = createRef<HTMLSpanElement>();
  const { container } = render(
    <TestProviders queryClient={new QueryClient()}>
      <StudioPlayerContext.Provider value={createStudioPlayerTestValue()}>
        <StudioArtistHero artist={view} onTip={vi.fn()} titleRef={titleRef} />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  const imageSources = Array.from(container.querySelectorAll("img")).map(
    (image) => image.getAttribute("src"),
  );
  return { container, titleRef, imageSources };
}

/** The page's one h1 holds the name, and titleRef reaches it. */
function expectSingleHeadingWithTitleRef(
  titleRef: RefObject<HTMLSpanElement | null>,
) {
  const headings = screen.getAllByRole("heading", { level: 1 });
  expect(headings).toHaveLength(1);
  expect(headings[0]).toHaveTextContent("Mariana");
  expect(titleRef.current?.closest("h1")).toBe(headings[0]);
}

describe("StudioArtistHero layouts", () => {
  it("classic: shows the avatar art and no cover backdrop", () => {
    const view = artistWith(null, null);
    expect(view.heroLayout).toBe("classic");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(AVATAR_SRC);
    expect(imageSources).not.toContain(COVER_SRC);
    expect(container.querySelector("section")).not.toHaveAttribute(
      "data-variant",
    );
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("classic: a stored full-bleed choice without a cover draws no photo", () => {
    const { container, imageSources } = renderHero(
      artistWith(null, "full-bleed"),
    );
    expect(imageSources).not.toContain(COVER_SRC);
    expect(container.querySelector("section")).not.toHaveAttribute(
      "data-variant",
    );
  });

  it("full-bleed: shows the cover and the name, with no avatar art", () => {
    const view = artistWith(COVER_SRC, null);
    expect(view.heroLayout).toBe("full-bleed");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(COVER_SRC);
    expect(imageSources).not.toContain(AVATAR_SRC);
    expect(container.querySelector("section")).toHaveAttribute(
      "data-variant",
      "full-bleed",
    );
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("avatar: shows both the avatar art and the cover backdrop", () => {
    const view = artistWith(COVER_SRC, "avatar");
    expect(view.heroLayout).toBe("avatar");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(AVATAR_SRC);
    expect(imageSources).toContain(COVER_SRC);
    expect(container.querySelector("section")).toHaveAttribute(
      "data-variant",
      "avatar-backdrop",
    );
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("the cover is decorative and fades in once loaded", () => {
    const { container } = renderHero(artistWith(COVER_SRC, null));
    const cover = container.querySelector<HTMLImageElement>(
      `img[src="${COVER_SRC}"]`,
    );
    expect(cover).toHaveAttribute("alt", "");
    expect(cover).not.toHaveAttribute("data-loaded");
    fireEvent.load(cover!);
    expect(cover).toHaveAttribute("data-loaded");
  });

  it("a cover that fails to load leaves the name readable", () => {
    const { container, titleRef } = renderHero(artistWith(COVER_SRC, null));
    const cover = container.querySelector<HTMLImageElement>(
      `img[src="${COVER_SRC}"]`,
    );
    fireEvent.error(cover!);
    expect(
      container.querySelector(`img[src="${COVER_SRC}"]`),
    ).not.toBeInTheDocument();
    expectSingleHeadingWithTitleRef(titleRef);
  });
});
