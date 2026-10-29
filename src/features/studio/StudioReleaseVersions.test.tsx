import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView } from "./api/studio.adapters";
import { StudioReleaseVersions } from "./StudioReleaseVersions";

const base = {
  id: "r1",
  title: "Salt water",
  type: "ep" as const,
  coverUrl: null,
  mood: null,
  scene: null,
  sceneId: null,
  personaCredits: [],
  releasedOn: null,
  trackCount: 0,
  totalDurationSeconds: 0,
  artist: {
    id: "p1",
    handle: "",
    name: "NIGHTFORM",
    kind: "musician" as const,
    avatarUrl: null,
  },
  description: null,
  genre: null,
  genres: [],
  status: "published" as const,
  publishedAt: null,
  tracks: [],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
};

describe("StudioReleaseVersions", () => {
  it("shows nothing for version 1", () => {
    const { container } = render(
      <TestProviders>
        <StudioReleaseVersions release={toReleaseView(base)} />
      </TestProviders>,
    );
    expect(container.querySelector("section")).toBeNull();
  });

  it("shows the latest note and folds the earlier ones", async () => {
    render(
      <TestProviders>
        <StudioReleaseVersions
          release={toReleaseView({
            ...base,
            version: 3,
            versions: [
              {
                version: 3,
                note: "Mastered again",
                createdAt: "2026-10-12T10:00:00.000Z",
              },
              {
                version: 2,
                note: "Fixed track 2",
                createdAt: "2026-10-01T10:00:00.000Z",
              },
            ],
          })}
        />
      </TestProviders>,
    );
    expect(await screen.findByText(/Version 3 ·/)).toBeInTheDocument();
    expect(screen.getByText("Mastered again")).toBeInTheDocument();
    expect(screen.queryByText("Fixed track 2")).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "Earlier versions" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("Fixed track 2")).toBeInTheDocument();
    expect(
      document.getElementById(toggle.getAttribute("aria-controls") ?? ""),
    ).not.toBeNull();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await waitFor(() =>
      expect(screen.queryByText("Fixed track 2")).not.toBeInTheDocument(),
    );
  });
});
