import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadTrackDetails } from "./StudioUploadTrackDetails";

const mutateAsync = vi.fn(() => Promise.resolve());

vi.mock("./api/useStudioTrack", () => ({
  useStudioTrack: () => ({
    track: {
      id: "t1",
      title: "Song",
      isExplicit: false,
      lyricStanzas: [],
      credits: [],
      syncedLyrics: null,
      chapters: null,
      durationSeconds: 200,
      hasAudio: true,
      notes: null,
      sources: [],
      contentWarnings: [],
      release: { format: "music" },
    },
    loadState: { isLoading: false, isError: false },
  }),
}));
vi.mock("./api/useStudioTrackMutations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/useStudioTrackMutations")>()),
  useUpdateStudioTrack: () => ({ mutateAsync, isPending: false }),
}));
vi.mock("./api/useStudioOwnerTrackSafety", () => ({
  useStudioOwnerTrackSafety: () => ({
    artistContentWarnings: ["medical"],
    staffContentWarnings: ["violence"],
    isExplicitLocked: true,
  }),
}));

beforeEach(() => mutateAsync.mockClear());

describe("StudioUploadTrackDetails, Studio safety", () => {
  it("shows our team's lock and warnings, and saves the artist's warnings", async () => {
    render(
      <TestProviders>
        <StudioUploadTrackDetails
          trackId="t1"
          releaseId="r1"
          releaseType="ep"
          localFile={null}
          onDone={() => {}}
        />
      </TestProviders>,
    );
    const box = screen.getByRole("checkbox", { name: /explicit/i });
    expect((box as HTMLInputElement).disabled).toBe(true);
    expect((box as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/added by our team/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /police/i }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          isExplicit: true,
          contentWarnings: ["medical", "police"],
        }),
      }),
    );
  });
});
