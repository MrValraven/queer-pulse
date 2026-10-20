import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithPlayer } from "./studioPlayerTestHarness";
import { StudioTrackMenu } from "./StudioTrackMenu";

const accessState = vi.hoisted(() => ({ isPending: false }));

vi.mock("../../api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: accessState.isPending ? "pending" : "granted",
    hasAccess: !accessState.isPending,
    isPending: accessState.isPending,
    uploadablePersonas: accessState.isPending ? [] : [{ id: "own-persona" }],
  }),
}));

const track = {
  id: "t1",
  title: "Vela acesa",
  href: "/studio/track?id=t1",
  hasAudio: true,
  isExplicit: false,
};

function openMenu() {
  fireEvent.click(screen.getByRole("button", { expanded: false }));
}

describe("StudioTrackMenu, Report track (spec 8)", () => {
  it("offers Report track on someone else's published track and opens the report modal", () => {
    accessState.isPending = false;
    renderWithPlayer(
      <StudioTrackMenu
        track={{ ...track, artistId: "other-persona", isPublished: true }}
      />,
    );
    openMenu();
    const items = screen.getAllByRole("menuitem");
    expect(items[items.length - 1]?.textContent).toMatch(/report track/i);
    fireEvent.click(screen.getByRole("menuitem", { name: /report track/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("leaves it off an own track, a withheld track, an unpublished track and a row without an artist", () => {
    accessState.isPending = false;
    for (const variant of [
      { ...track, artistId: "own-persona", isPublished: true },
      {
        ...track,
        artistId: "other-persona",
        isPublished: true,
        isWithheld: true,
      },
      { ...track, artistId: "other-persona", isPublished: false },
      { ...track, artistId: "other-persona" },
      track,
    ]) {
      const { unmount } = renderWithPlayer(<StudioTrackMenu track={variant} />);
      openMenu();
      expect(
        screen.queryByRole("menuitem", { name: /report track/i }),
      ).toBeNull();
      unmount();
    }
  });

  it("waits for the member's Studio access to load", () => {
    accessState.isPending = true;
    renderWithPlayer(
      <StudioTrackMenu
        track={{ ...track, artistId: "other-persona", isPublished: true }}
      />,
    );
    openMenu();
    expect(
      screen.queryByRole("menuitem", { name: /report track/i }),
    ).toBeNull();
  });
});
