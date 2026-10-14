import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView } from "./api/studio.adapters";
import { StudioVersionNotePanel } from "./StudioVersionNotePanel";

const { addVersion } = vi.hoisted(() => ({ addVersion: vi.fn() }));
vi.mock("./api/useStudioArtistToolsMutations", () => ({
  useAddStudioReleaseVersion: () => ({
    mutateAsync: addVersion,
    isPending: false,
  }),
}));

const release = toReleaseView({
  id: "r1",
  title: "Salt water",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 1,
  totalDurationSeconds: 200,
  artist: {
    id: "p1",
    handle: "",
    name: "NIGHTFORM",
    kind: "musician",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  mood: null,
  scene: null,
  sceneId: null,
  personaCredits: [],
  status: "published",
  publishedAt: "2026-04-12T10:00:00.000Z",
  tracks: [],
  isOwner: true,
  rightsConfirmedAt: "2026-04-01T10:00:00.000Z",
  takedownReason: null,
  hasUnnotedChanges: true,
});

describe("StudioVersionNotePanel", () => {
  it("asks for a note before saving", async () => {
    render(
      <TestProviders>
        <StudioVersionNotePanel release={release} onSaved={() => {}} />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Save version note" }),
    );
    expect(addVersion).not.toHaveBeenCalled();
    expect(screen.getByText("Write what changed first")).toBeInTheDocument();
  });

  it("saves a trimmed note and tells the page", async () => {
    addVersion.mockResolvedValue({
      ...release,
      version: 2,
      hasUnnotedChanges: false,
    });
    const onSaved = vi.fn();
    render(
      <TestProviders>
        <StudioVersionNotePanel release={release} onSaved={onSaved} />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText("Version note"), {
      target: { value: "  Remastered track 2  " },
    });
    expect(screen.getByText("22 of 280")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save version note" }));
    await waitFor(() =>
      expect(addVersion).toHaveBeenCalledWith({
        releaseId: "r1",
        note: "Remastered track 2",
      }),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it("sends one version for a double press", async () => {
    addVersion.mockReset();
    addVersion.mockReturnValue(new Promise(() => {}));
    render(
      <TestProviders>
        <StudioVersionNotePanel release={release} onSaved={() => {}} />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText("Version note"), {
      target: { value: "New mix" },
    });
    const save = screen.getByRole("button", { name: "Save version note" });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(addVersion).toHaveBeenCalledTimes(1);
  });

  it("shows the server's line when nothing changed after all", async () => {
    addVersion.mockRejectedValue(
      new ApiError(409, "none", { code: "studio_release_no_changes" }),
    );
    render(
      <TestProviders>
        <StudioVersionNotePanel release={release} onSaved={() => {}} />
      </TestProviders>,
    );
    fireEvent.change(await screen.findByLabelText("Version note"), {
      target: { value: "New mix" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save version note" }));
    expect(
      await screen.findByText(
        "There's no track change to note since the last version",
      ),
    ).toBeInTheDocument();
  });
});
