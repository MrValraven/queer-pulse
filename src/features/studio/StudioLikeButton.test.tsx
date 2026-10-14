import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SavedContext,
  type SavedContextValue,
  type SavedItem,
} from "../../app/providers/useSaved";
import { TestProviders } from "../../test/TestProviders";
import { StudioLikeButton } from "./StudioLikeButton";
import type { StudioLikeSubject } from "./useStudioLike";

const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

const subject: StudioLikeSubject = {
  trackId: "t1",
  title: "Tide",
  href: "/studio/track?id=t1",
  artistName: "NIGHTFORM",
};

/** A stub saved store holding the given saved ids. */
function savedValue(savedIds: string[]): SavedContextValue {
  const savedIdSet = new Set(savedIds);
  return {
    items: [],
    isSaved: (id) => savedIdSet.has(id),
    toggleSave: vi.fn((item: SavedItem) => !savedIdSet.has(item.id)),
    save: vi.fn(),
    unsave: vi.fn(),
    byKind: () => [],
    remember: vi.fn(),
    readSaveScope: () => 0,
  };
}

function renderWithSaved(saved: SavedContextValue, children: ReactNode) {
  render(
    <TestProviders>
      <SavedContext.Provider value={saved}>{children}</SavedContext.Provider>
    </TestProviders>,
  );
}

describe("StudioLikeButton", () => {
  beforeEach(() => {
    showToast.mockClear();
  });

  it("likes a track as a studio_track save and confirms it", async () => {
    const saved = savedValue([]);
    const onToggled = vi.fn();
    renderWithSaved(
      saved,
      <StudioLikeButton subject={subject} onToggled={onToggled} />,
    );
    const heart = await screen.findByRole("button", { name: "Like Tide" });
    expect(heart).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(heart);
    expect(saved.toggleSave).toHaveBeenCalledWith({
      id: "studio_track:t1",
      kind: "studio_track",
      title: "Tide",
      href: "/studio/track?id=t1",
      meta: "NIGHTFORM",
    });
    expect(showToast).toHaveBeenCalledWith("Added to Liked songs", "success");
    expect(onToggled).toHaveBeenCalledWith(true);
  });

  it("keeps one name once liked, presses and unlikes", async () => {
    const saved = savedValue(["studio_track:t1"]);
    const onToggled = vi.fn();
    renderWithSaved(
      saved,
      <StudioLikeButton subject={subject} onToggled={onToggled} />,
    );
    const heart = await screen.findByRole("button", { name: "Like Tide" });
    expect(heart).toHaveAttribute("aria-pressed", "true");
    expect(heart.querySelector("svg")).toHaveAttribute("fill", "currentColor");
    fireEvent.click(heart);
    expect(showToast).toHaveBeenCalledWith("Removed from Liked songs", "info");
    expect(onToggled).toHaveBeenCalledWith(false);
  });

  it("unlikes without a toast when quiet", async () => {
    const saved = savedValue(["studio_track:t1"]);
    const onToggled = vi.fn();
    renderWithSaved(
      saved,
      <StudioLikeButton subject={subject} isQuiet onToggled={onToggled} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Like Tide" }));
    expect(saved.toggleSave).toHaveBeenCalledTimes(1);
    expect(onToggled).toHaveBeenCalledWith(false);
    expect(showToast).not.toHaveBeenCalled();
  });

  it("draws the empty heart as an outline with an explicit none fill", async () => {
    renderWithSaved(savedValue([]), <StudioLikeButton subject={subject} />);
    const heart = await screen.findByRole("button", { name: "Like Tide" });
    const icon = heart.querySelector("svg");
    expect(icon).toHaveAttribute("fill", "none");
    expect(icon).toHaveAttribute("stroke", "currentColor");
  });

  it("shows Like in the labelled variant, inside its accessible name", async () => {
    renderWithSaved(
      savedValue([]),
      <StudioLikeButton subject={subject} variant="labelled" />,
    );
    const heart = await screen.findByRole("button", { name: "Like Tide" });
    expect(heart).toHaveTextContent("Like");
    expect(heart.getAttribute("aria-label")).toContain(
      heart.textContent?.trim() ?? "",
    );
  });
});
