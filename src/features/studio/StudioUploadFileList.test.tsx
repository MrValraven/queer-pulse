import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { FileList } from "./StudioUploadFileList";
import type { StudioUploadAnalysis } from "./upload/useStudioUploadAnalysis";
import type { StudioTrackUploads, UploadRow } from "./useStudioTrackUploads";

const NO_ANALYSIS: StudioUploadAnalysis = {
  statusOf: () => null,
  analysisOf: () => null,
  fileOf: () => null,
  measuredTrackIds: new Set(),
  hasPendingAnalysis: false,
};

/** The Listening props FileList needs: a single, nothing measured. */
const LISTENING_PROPS = {
  analysis: NO_ANALYSIS,
  storedLoudness: new Map(),
  backfillCount: 0,
  releaseType: "single" as const,
  format: "music" as const,
};

const row = (localId: string, title: string): UploadRow => ({
  localId,
  trackId: `track-${localId}`,
  title,
  fileName: null,
  stage: "ready",
  progress: 100,
  errorKey: null,
  durationLabel: "3:20",
  isRetryable: false,
});

function uploadsWith(remove = vi.fn()): StudioTrackUploads {
  return {
    rows: [row("a", "Tide"), row("b", "Pier")],
    rejections: [],
    addFiles: vi.fn(),
    retry: vi.fn(),
    retryAll: vi.fn(),
    cancel: vi.fn(),
    attachAudio: vi.fn(),
    remove,
    move: vi.fn(),
    moveTo: vi.fn(),
    rename: vi.fn(),
    canReorder: true,
    hasPendingUploads: false,
    hasActiveUploads: false,
    hasHeldFiles: false,
    orderErrorKey: null,
  };
}

describe("FileList removal", () => {
  it("asks first on a published release, naming the track and the release", async () => {
    const remove = vi.fn();
    render(
      <TestProviders>
        <FileList
          uploads={uploadsWith(remove)}
          releaseId="r1"
          releaseTitle="Salt water"
          {...LISTENING_PROPS}
          isPublished
        />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /remove track 1, tide/i }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: "Remove Tide from Salt water?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "People who saved it will see it as no longer available",
      ),
    ).toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove track" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("a"));
  });

  it("removes at once on a draft", async () => {
    const remove = vi.fn();
    render(
      <TestProviders>
        <FileList
          uploads={uploadsWith(remove)}
          releaseId="r1"
          releaseTitle="Salt water"
          {...LISTENING_PROPS}
          isPublished={false}
        />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /remove track 2, pier/i }),
    );
    expect(remove).toHaveBeenCalledWith("b");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows move controls on a published release", async () => {
    render(
      <TestProviders>
        <FileList
          uploads={uploadsWith()}
          releaseId="r1"
          releaseTitle="Salt water"
          {...LISTENING_PROPS}
          isPublished
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: /move track 2, pier, up/i }),
    ).toBeInTheDocument();
  });
});

describe("FileList rejections", () => {
  it("names the 250 MB cap for a podcast file over the limit", async () => {
    render(
      <TestProviders>
        <FileList
          uploads={{
            ...uploadsWith(),
            rejections: [{ fileName: "episode.mp3", reason: "size" }],
          }}
          releaseId="r1"
          releaseTitle="Late Bloomers"
          {...LISTENING_PROPS}
          format="podcast"
          isPublished={false}
        />
      </TestProviders>,
    );
    expect(await screen.findByText(/episode\.mp3/)).toHaveTextContent(/250/);
  });
});
