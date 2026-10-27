import { createRef, type RefObject } from "react";
import { QueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toArtistView, type StudioArtistView } from "./api/studio.adapters";
import type { StudioArtistDTO } from "./api/studio.types";
import { StudioPlayerContext } from "./player/studioPlayerContext";
import { StudioArtistHero } from "./StudioArtistHero";

vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));

const AVATAR_SRC = "/files/persona-avatar.jpg";
const COVER_SRC = "/files/persona-cover.jpg";

/** A stored studioHero as the server or old demo data may hold it: the
 *  current choices, the first two layouts' values, or nothing. */
type StoredStudioHero =
  StudioArtistDTO["artist"]["studioHero"] | "full-bleed" | "avatar";

function artistWith(
  coverUrl: string | null,
  studioHero: StoredStudioHero,
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
      // Legacy values reach the adapter untyped, as old stored data would.
      studioHero: studioHero as StudioArtistDTO["artist"]["studioHero"],
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

/** The hero draws the photo band (full-bleed) or the portrait beside the
 *  copy (no data-variant). */
function heroVariantOf(container: HTMLElement) {
  return container.querySelector("section")?.getAttribute("data-variant");
}

describe("StudioArtistHero layouts", () => {
  it("banner: shows the cover and the name, with no avatar", () => {
    const view = artistWith(COVER_SRC, "banner");
    expect(view.heroLayout).toBe("banner");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(COVER_SRC);
    expect(imageSources).not.toContain(AVATAR_SRC);
    expect(heroVariantOf(container)).toBe("full-bleed");
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("both: shows the cover and the avatar on it", () => {
    const view = artistWith(COVER_SRC, "both");
    expect(view.heroLayout).toBe("both");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(COVER_SRC);
    expect(imageSources).toContain(AVATAR_SRC);
    expect(heroVariantOf(container)).toBe("full-bleed");
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("a cover with no stored choice shows both", () => {
    const view = artistWith(COVER_SRC, null);
    expect(view.heroLayout).toBe("both");
    const { imageSources } = renderHero(view);
    expect(imageSources).toContain(COVER_SRC);
    expect(imageSources).toContain(AVATAR_SRC);
  });

  it("portrait: shows the avatar and no cover photo", () => {
    const view = artistWith(COVER_SRC, "portrait");
    expect(view.heroLayout).toBe("portrait");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(AVATAR_SRC);
    expect(imageSources).not.toContain(COVER_SRC);
    expect(heroVariantOf(container)).toBeNull();
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("no cover with a stored banner resolves to portrait and draws no photo band", () => {
    const view = artistWith(null, "banner");
    expect(view.heroLayout).toBe("portrait");
    const { container, titleRef, imageSources } = renderHero(view);
    expect(imageSources).toContain(AVATAR_SRC);
    expect(imageSources).not.toContain(COVER_SRC);
    expect(heroVariantOf(container)).toBeNull();
    expectSingleHeadingWithTitleRef(titleRef);
  });

  it("a legacy full-bleed choice reads as banner", () => {
    const view = artistWith(COVER_SRC, "full-bleed");
    expect(view.heroLayout).toBe("banner");
    const { container, imageSources } = renderHero(view);
    expect(imageSources).toContain(COVER_SRC);
    expect(imageSources).not.toContain(AVATAR_SRC);
    expect(heroVariantOf(container)).toBe("full-bleed");
  });

  it("a legacy avatar choice reads as both", () => {
    const view = artistWith(COVER_SRC, "avatar");
    expect(view.heroLayout).toBe("both");
    const { container, imageSources } = renderHero(view);
    expect(imageSources).toContain(COVER_SRC);
    expect(imageSources).toContain(AVATAR_SRC);
    expect(heroVariantOf(container)).toBe("full-bleed");
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
