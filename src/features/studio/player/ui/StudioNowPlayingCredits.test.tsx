import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioTrackView } from "../../api/studio.adapters";
import type { StudioLoadState } from "../../api/studioLoadState";
import {
  StudioNowPlayingCredits,
  StudioSidePanelCredits,
} from "./StudioNowPlayingCredits";
import {
  queueItem,
  renderWithPlayer,
  trackFixture,
} from "./studioPlayerTestHarness";

/** What the track detail hook answers, and every id it was asked for. */
const trackRead = vi.hoisted(() => ({
  track: null as StudioTrackView | null,
  isLoading: false,
  calls: [] as (string | null)[],
}));
vi.mock("../../api/useStudioTrack", () => ({
  useStudioTrack: (trackId: string | null) => {
    trackRead.calls.push(trackId);
    const loadState: StudioLoadState = {
      isLoading: trackRead.isLoading,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => undefined,
    };
    return { track: trackRead.track, loadState };
  },
}));

const FIVE_CREDITS = [
  { name: "Ana", role: "Vocals" },
  { name: "Bea", role: "Producer" },
  { name: "Caro", role: "Mixing" },
  { name: "Dani", role: "Mastering" },
  { name: "Eli", role: "Cover art" },
];

function creditRoles(): string[] {
  return Array.from(document.querySelectorAll("dt")).map(
    (term) => term.textContent ?? "",
  );
}

describe("Now playing credits", () => {
  beforeEach(() => {
    trackRead.track = null;
    trackRead.isLoading = false;
    trackRead.calls = [];
  });

  it("keeps the pane's full list with its loading and empty lines", () => {
    trackRead.track = trackFixture({ credits: FIVE_CREDITS });
    const { unmount } = renderWithPlayer(
      <StudioNowPlayingCredits trackId="t1" />,
    );
    expect(creditRoles()).toHaveLength(5);
    unmount();

    trackRead.track = null;
    trackRead.isLoading = true;
    const loading = renderWithPlayer(<StudioNowPlayingCredits trackId="t1" />);
    expect(screen.getByText("Loading the credits")).toBeTruthy();
    loading.unmount();

    trackRead.isLoading = false;
    trackRead.track = trackFixture({ credits: [] });
    renderWithPlayer(<StudioNowPlayingCredits trackId="t1" />);
    expect(screen.getByText("No credits for this track yet")).toBeTruthy();
  });

  it("shows the first three credits in the side panel and expands in place", () => {
    trackRead.track = trackFixture({ credits: FIVE_CREDITS });
    renderWithPlayer(<StudioSidePanelCredits item={queueItem()} />);
    const heading = screen.getByRole("heading", { name: "Credits" });
    expect(creditRoles()).toEqual(["Vocals", "Producer", "Mixing"]);

    // The toggle sits in the section's head row, beside the title.
    const toggle = within(heading.parentElement as HTMLElement).getByRole(
      "button",
      { name: "Show all credits" },
    );
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);

    expect(creditRoles()).toHaveLength(5);
    const expanded = screen.getByRole("button", { name: "Show fewer credits" });
    expect(expanded.getAttribute("aria-expanded")).toBe("true");
  });

  it("offers no toggle when every credit already shows", () => {
    trackRead.track = trackFixture({ credits: FIVE_CREDITS.slice(0, 3) });
    renderWithPlayer(<StudioSidePanelCredits item={queueItem()} />);
    expect(creditRoles()).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Show all credits" })).toBe(
      null,
    );
  });

  it("folds the side panel section when there are no credits", () => {
    trackRead.track = trackFixture({ credits: [] });
    renderWithPlayer(<StudioSidePanelCredits item={queueItem()} />);
    expect(screen.queryByRole("heading", { name: "Credits" })).toBeNull();
  });

  it("folds the side panel section while the credits load", () => {
    trackRead.isLoading = true;
    renderWithPlayer(<StudioSidePanelCredits item={queueItem()} />);
    expect(screen.queryByRole("heading", { name: "Credits" })).toBeNull();
    expect(screen.queryByText("Loading the credits")).toBeNull();
  });

  it("leaves Credits out for a private preview", () => {
    trackRead.track = trackFixture({ credits: FIVE_CREDITS });
    renderWithPlayer(
      <StudioSidePanelCredits item={queueItem({ previewToken: "pv-1" })} />,
    );
    expect(screen.queryByRole("heading", { name: "Credits" })).toBeNull();
    expect(creditRoles()).toEqual([]);
    expect(trackRead.calls).toEqual([]);
  });
});
