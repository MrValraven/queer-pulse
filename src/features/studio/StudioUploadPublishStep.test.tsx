import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView } from "./api/studio.adapters";
import type { StudioReleaseDTO } from "./api/studio.types";
import { PublishStep } from "./StudioUploadPublishStep";
import type { StudioTrackUploads } from "./useStudioTrackUploads";

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

const trackSources = vi.hoisted(() => ({
  value: { t1: [{ title: "Side A source", artist: "Someone" }] },
}));
vi.mock("./api/useStudioReleaseTrackSources", () => ({
  useStudioReleaseTrackSources: () => trackSources.value,
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

const scheduleRelease = vi.fn();
const unscheduleRelease = vi.fn();
vi.mock("./api/useStudioArtistToolsMutations", () => ({
  useScheduleStudioRelease: () => ({
    mutateAsync: scheduleRelease,
    isPending: false,
  }),
  useUnscheduleStudioRelease: () => ({
    mutateAsync: unscheduleRelease,
    isPending: false,
  }),
}));

const releaseDto: StudioReleaseDTO = {
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
  mood: null,
  scene: null,
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
  sceneId: null,
  personaCredits: [],
};
const release = toReleaseView(releaseDto);

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

  it("schedules the release when the member picks a date, and publishes nothing", async () => {
    updateRelease.mockResolvedValue({
      ...release,
      rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
    });
    scheduleRelease.mockResolvedValue({ ...release, status: "scheduled" });
    publishRelease.mockClear();
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
    fireEvent.click(
      await screen.findByRole("checkbox", {
        name: /own or control the rights/i,
      }),
    );
    fireEvent.click(screen.getByRole("radio", { name: /schedule release/i }));
    const inTwoDays = new Date(Date.now() + 2 * 86_400_000);
    const pad = (value: number) => String(value).padStart(2, "0");
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: {
        value: `${inTwoDays.getFullYear()}-${pad(inTwoDays.getMonth() + 1)}-${pad(inTwoDays.getDate())}`,
      },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "18:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Schedule release" }));
    await waitFor(() => expect(scheduleRelease).toHaveBeenCalled());
    expect(updateRelease).toHaveBeenCalledWith({
      releaseId: "r1",
      body: { rightsConfirmed: true },
    });
    expect(publishRelease).not.toHaveBeenCalled();
    expect(onPublished).not.toHaveBeenCalled();
  });

  it("shows the scheduled panel for a scheduled release", async () => {
    render(
      <TestProviders>
        <PublishStep
          release={{
            ...release,
            status: "scheduled",
            isUpcoming: true,
            publishAt: new Date(2026, 9, 20, 18, 0).toISOString(),
          }}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Change date" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancel schedule" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /publish release/i }),
    ).toBeNull();
  });
});

describe("PublishStep on a scheduled release", () => {
  const scheduled = {
    ...release,
    status: "scheduled" as const,
    isUpcoming: true,
    publishAt: new Date(2026, 9, 20, 18, 0).toISOString(),
  };
  const wentLive = new ApiError(409, "refused", {
    code: "studio_release_not_schedulable",
  });

  it("reloads the release when Cancel schedule finds it already live", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    unscheduleRelease.mockRejectedValue(wentLive);
    render(
      <TestProviders queryClient={queryClient}>
        <PublishStep
          release={scheduled}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Cancel schedule" }),
    );
    expect(await screen.findByText(/only a draft/i)).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "release", false, "r1"],
    });
  });

  it("reloads the release when Change date finds it already live", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    scheduleRelease.mockRejectedValue(wentLive);
    render(
      <TestProviders queryClient={queryClient}>
        <PublishStep
          release={scheduled}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Change date" }));
    const inTwoDays = new Date(Date.now() + 2 * 86_400_000);
    const pad = (value: number) => String(value).padStart(2, "0");
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: {
        value: `${inTwoDays.getFullYear()}-${pad(inTwoDays.getMonth() + 1)}-${pad(inTwoDays.getDate())}`,
      },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "18:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save new date" }));
    expect(await screen.findByText(/only a draft/i)).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["studio", "release", false, "r1"],
    });
  });

  it("moves focus to the entering heading while the leaving side folds away inert", async () => {
    const confirmed = {
      ...release,
      rightsConfirmedAt: "2026-10-08T10:00:00.000Z",
    };
    scheduleRelease.mockResolvedValue({ ...confirmed, ...scheduled });
    unscheduleRelease.mockResolvedValue(confirmed);
    const view = (shown: typeof release) => (
      <TestProviders>
        <PublishStep
          release={shown}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>
    );
    const headingOf = (text: RegExp) =>
      screen
        .getAllByRole("heading", { level: 3, hidden: true })
        .find((heading) => text.test(heading.textContent ?? ""));
    const { rerender } = render(view(confirmed));
    fireEvent.click(
      await screen.findByRole("radio", { name: /schedule release/i }),
    );
    const inTwoDays = new Date(Date.now() + 2 * 86_400_000);
    const pad = (value: number) => String(value).padStart(2, "0");
    fireEvent.change(await screen.findByLabelText("Date"), {
      target: {
        value: `${inTwoDays.getFullYear()}-${pad(inTwoDays.getMonth() + 1)}-${pad(inTwoDays.getDate())}`,
      },
    });
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "18:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Schedule release" }));
    await waitFor(() => expect(scheduleRelease).toHaveBeenCalled());

    rerender(view({ ...confirmed, ...scheduled }));
    await waitFor(() => expect(headingOf(/scheduled for/i)).toHaveFocus());
    expect(headingOf(/ready to publish/i)?.closest("[inert]")).not.toBeNull();
    expect(headingOf(/scheduled for/i)?.closest("[inert]")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cancel schedule" }));
    await waitFor(() => expect(unscheduleRelease).toHaveBeenCalled());
    rerender(view(confirmed));
    await waitFor(() => expect(headingOf(/ready to publish/i)).toHaveFocus());
    expect(headingOf(/scheduled for/i)?.closest("[inert]")).not.toBeNull();
    expect(headingOf(/ready to publish/i)?.closest("[inert]")).toBeNull();
  });
});

describe("PublishStep sources and rights (artist kinds)", () => {
  afterEach(() => {
    trackSources.value = {
      t1: [{ title: "Side A source", artist: "Someone" }],
    };
  });

  it("names the tracks that still need a source and blocks Publish", async () => {
    trackSources.value = { t1: [] };
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
    expect(
      await screen.findByText("Credit every source: Side A"),
    ).toBeInTheDocument();
  });

  it("reads the edit wording on a mix and the recording wording on an EP", async () => {
    const { unmount } = render(
      <TestProviders>
        <PublishStep
          release={release}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/I have permission to share this edit/),
    ).toBeInTheDocument();
    unmount();
    render(
      <TestProviders>
        <PublishStep
          release={toReleaseView({
            ...releaseDto,
            type: "ep",
            artist: { ...releaseDto.artist, kind: "musician" },
          })}
          uploads={uploads}
          onBack={() => {}}
          onPublished={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/rights to this recording and the cover/),
    ).toBeInTheDocument();
  });
});
