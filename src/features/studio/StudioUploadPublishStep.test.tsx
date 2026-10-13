import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView } from "./api/studio.adapters";
import { PublishStep } from "./StudioUploadPublishStep";
import type { StudioTrackUploads } from "./useStudioTrackUploads";

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

const updateRelease = vi.fn();
const publishRelease = vi.fn();
vi.mock("./api/useStudioReleaseMutations", () => ({
  useUpdateStudioRelease: () => ({
    mutateAsync: updateRelease,
    isPending: false,
  }),
  usePublishStudioRelease: () => ({
    mutateAsync: publishRelease,
    isPending: false,
  }),
}));

const release = toReleaseView({
  id: "r1",
  title: "Night bus",
  type: "mix",
  coverUrl: "https://files.example/cover.webp",
  releasedOn: null,
  trackCount: 1,
  totalDurationSeconds: 200,
  artist: {
    id: "p1",
    handle: "lechat",
    name: "LeChat",
    kind: "dj",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  status: "draft",
  publishedAt: null,
  tracks: [
    {
      id: "t1",
      position: 1,
      title: "Side A",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
    },
  ],
  isOwner: true,
  rightsConfirmedAt: null,
  takedownReason: null,
});

const uploads = {
  rows: [],
  hasPendingUploads: false,
} as unknown as StudioTrackUploads;

describe("PublishStep", () => {
  it("holds Publish until the rights are confirmed, then confirms and publishes", async () => {
    updateRelease.mockResolvedValue({
      ...release,
      rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
    });
    publishRelease.mockResolvedValue({ ...release, status: "published" });
    const onPublished = vi.fn();
    render(
      <TestProviders>
        <PublishStep
          release={release}
          uploads={uploads}
          onBack={() => {}}
          onPublished={onPublished}
        />
      </TestProviders>,
    );
    const publish = await screen.findByRole("button", {
      name: /publish release/i,
    });
    expect(publish).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText(/confirm you hold the rights/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/add a cover image/i)).not.toBeInTheDocument();
    fireEvent.click(publish);
    expect(publishRelease).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("checkbox", { name: /own or control the rights/i }),
    );
    fireEvent.click(publish);
    await waitFor(() => expect(onPublished).toHaveBeenCalled());
    expect(updateRelease).toHaveBeenCalledWith({
      releaseId: "r1",
      body: { rightsConfirmed: true },
    });
    expect(publishRelease).toHaveBeenCalledWith({ releaseId: "r1" });
  });

  it("shows the server's reason when publish is refused", async () => {
    const refused = new ApiError(409, "refused", {
      code: "studio_publish_missing_cover",
    });
    updateRelease.mockResolvedValue({
      ...release,
      rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
    });
    publishRelease.mockRejectedValue(refused);
    render(
      <TestProviders>
        <PublishStep
          release={release}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: /own or control the rights/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /publish release/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/cover/i);
  });
  it("lists the pending gap and keeps Publish disabled while uploads run", async () => {
    const pendingUploads = {
      rows: [],
      hasPendingUploads: true,
    } as unknown as StudioTrackUploads;
    render(
      <TestProviders>
        <PublishStep
          release={{
            ...release,
            rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
          }}
          uploads={pendingUploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/wait for every track to finish uploading/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publish release/i }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("reloads the release after a refusal and shows the refreshed checklist", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    updateRelease.mockResolvedValue(release);
    publishRelease.mockRejectedValue(
      new ApiError(409, "refused", { code: "studio_publish_missing_cover" }),
    );
    const confirmed = {
      ...release,
      rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
    };
    const view = (shown: typeof release) => (
      <TestProviders queryClient={queryClient}>
        <PublishStep
          release={shown}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>
    );
    const { rerender } = render(view(confirmed));
    fireEvent.click(
      await screen.findByRole("button", { name: /publish release/i }),
    );
    await screen.findByRole("alert");
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "release", false, "r1"],
    });
    rerender(view({ ...confirmed, coverUrl: null }));
    expect(screen.getByText(/add a cover image/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publish release/i }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});
