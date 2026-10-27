import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { StudioLoadState } from "../../api/studioLoadState";
import { StudioSidePanelTrackHeader } from "./StudioSidePanelTrackHeader";
import {
  createStudioPlayerValue,
  queueItem,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

/** The track's detail never answers here, so the menu keeps the queue
 *  item's own track. */
vi.mock("../../api/useStudioTrack", () => ({
  useStudioTrack: () => {
    const loadState: StudioLoadState = {
      isLoading: true,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => undefined,
    };
    return { track: null, loadState };
  },
}));

function expectLinksLikeAndMenu(title: string, artistName: string) {
  const titleLink = screen.getByRole("link", { name: title });
  expect(titleLink.getAttribute("href")).toBe("/studio/track?id=t1");
  const artistLink = screen.getByRole("link", { name: artistName });
  expect(artistLink.getAttribute("href")).toBe("/studio/artist?id=p1");
  expect(screen.getByRole("button", { name: `Like ${title}` })).toBeTruthy();
  expect(
    screen.getByRole("button", { name: `More actions for ${title}` }),
  ).toBeTruthy();
}

describe("Side panel track header", () => {
  it("links the title and the artist and offers Like and the track menu", () => {
    renderWithPlayer(<StudioSidePanelTrackHeader item={queueItem()} />);
    expectLinksLikeAndMenu("Tide", "NIGHTFORM");
  });

  it("shows a private preview as plain text with no Like and no menu", () => {
    const preview = queueItem({ previewToken: "pv-1" });
    renderWithPlayer(<StudioSidePanelTrackHeader item={preview} />, {
      player: createStudioPlayerValue({ currentItem: preview }),
    });
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Like Tide" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "More actions for Tide" }),
    ).toBeNull();
    expect(screen.getByText("Tide")).toBeTruthy();
    expect(screen.getByText("NIGHTFORM")).toBeTruthy();
  });

  it("shows a warned track the way the bar does", () => {
    const warned = queueItem({ contentWarnings: ["self-harm"] });
    renderWithPlayer(<StudioSidePanelTrackHeader item={warned} />, {
      player: createStudioPlayerValue({
        currentItem: warned,
        pendingWarning: warned,
      }),
    });
    expectLinksLikeAndMenu("Tide", "NIGHTFORM");
  });

  it("uses the tint fallback cover when the item has no art", () => {
    const { container } = renderWithPlayer(
      <StudioSidePanelTrackHeader
        item={queueItem({ coverUrl: null, tint: "jade" })}
      />,
    );
    expect(container.querySelector('[data-tint="jade"]')).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
});
