import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { SubprofileView } from "../subprofiles/api/subprofiles.adapters";
import { SubprofileEditorShell } from "../subprofiles/SubprofileEditorShell";
import { MetadataStep } from "../studio/StudioUploadMetadataStep";
import { StudioEpisodeForm } from "../studio/StudioEpisodeForm";
import type { StudioUploadDraft } from "../studio/useStudioUploadDraft";
import type { StudioReleaseView } from "../studio/api/studio.adapters";

vi.mock("../subprofiles/SubprofileEditorProvider", () => ({
  SubprofileEditorProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../subprofiles/EditorRail", () => ({ EditorRail: () => null }));
vi.mock("../subprofiles/EditorPaneSwitcher", () => ({
  EditorPaneSwitcher: () => null,
}));
vi.mock("../subprofiles/EditorPaneRouter", () => ({
  EditorPaneRouter: () => null,
}));
vi.mock("../subprofiles/EditorFieldDeepLink", () => ({
  EditorFieldDeepLink: () => null,
}));
vi.mock("../subprofiles/EditorSavebar", () => ({ EditorSavebar: () => null }));
vi.mock("../subprofiles/EditorPreview", () => ({ EditorPreview: () => null }));
vi.mock("../studio/StudioUploadReleaseFields", () => ({
  StudioUploadReleaseFields: () => null,
}));
vi.mock("../studio/StudioUploadCoverArt", () => ({ CoverArt: () => null }));
vi.mock("../studio/StudioUploadPersonaPicker", () => ({
  StudioUploadPersonaPicker: () => null,
}));
vi.mock("../studio/StudioEpisodeAudioStep", () => ({
  StudioEpisodeAudioAttach: () => null,
}));
vi.mock("../studio/StudioEpisodeChaptersField", () => ({
  StudioEpisodeChaptersField: () => null,
}));
vi.mock("../studio/StudioTrackSafetyFields", () => ({
  StudioTrackSafetyFields: () => null,
}));

const mockTrackRead = vi.hoisted(() => ({
  publishedAt: null as string | null,
}));
vi.mock("../studio/api/useStudioTrack", () => ({
  useStudioTrack: () => ({
    track: {
      id: "track-1",
      title: "Episode one",
      notes: "",
      lyricStanzas: [],
      chapters: [],
      isExplicit: false,
      isDraft: mockTrackRead.publishedAt === null,
      hasAudio: true,
      publishedAt: mockTrackRead.publishedAt,
    },
    loadState: { isNotFound: false, isError: false },
  }),
}));

const NOTE_PATTERN = /creatorDraftNote\.(body|episodeBody)|Our team/;

function personaView(
  status: "draft" | "published",
  visibility: SubprofileView["visibility"] = "open",
): SubprofileView {
  return {
    id: "persona-1",
    kind: "artist",
    status,
    visibility,
  } as unknown as SubprofileView;
}

function shell(subprofile: SubprofileView) {
  return (
    <TestProviders>
      <SubprofileEditorShell subprofile={subprofile} />
    </TestProviders>
  );
}

function releaseView(status: string): StudioReleaseView {
  return { id: "release-1", status } as unknown as StudioReleaseView;
}

function uploadDraftStub(release: StudioReleaseView | null): StudioUploadDraft {
  return {
    release,
    persona: null,
    hasLiveDetails: release?.status === "published",
    hasSavedChanges: false,
    hasUnsavedChanges: false,
    isSaving: false,
    saveErrorKey: null,
    form: { coverKey: null, genres: [] },
    setField: vi.fn(),
    saveChanges: vi.fn(),
    continueToTracks: vi.fn(),
  } as unknown as StudioUploadDraft;
}

function renderMetadataStep(release: StudioReleaseView | null) {
  return render(
    <TestProviders>
      <MetadataStep draft={uploadDraftStub(release)} />
    </TestProviders>,
  );
}

describe("creator draft notes in the persona and Studio editors", () => {
  it("shows the persona note while the persona is a draft and folds it once published", async () => {
    const { rerender } = render(shell(personaView("draft")));
    expect(screen.getByText(NOTE_PATTERN)).toBeInTheDocument();
    rerender(shell(personaView("published")));
    await waitFor(() => expect(screen.queryByText(NOTE_PATTERN)).toBeNull());
  });

  it("leaves the persona note out for a private draft persona", () => {
    render(shell(personaView("draft", "private")));
    expect(screen.queryByText(NOTE_PATTERN)).toBeNull();
  });

  it("shows the persona note for a draft persona shared with connections", () => {
    render(shell(personaView("draft", "network")));
    expect(screen.getByText(NOTE_PATTERN)).toBeInTheDocument();
  });

  it("shows the release note for a new, draft or scheduled release and hides it once published", async () => {
    for (const release of [
      null,
      releaseView("draft"),
      releaseView("scheduled"),
    ]) {
      const { unmount } = renderMetadataStep(release);
      expect(screen.getByText(NOTE_PATTERN)).toBeInTheDocument();
      unmount();
    }
    renderMetadataStep(releaseView("published"));
    await waitFor(() => expect(screen.queryByText(NOTE_PATTERN)).toBeNull());
  });

  it("shows the episode note while the episode is a draft and folds it once published", async () => {
    mockTrackRead.publishedAt = null;
    const episodeForm = (
      <TestProviders>
        <StudioEpisodeForm
          release={releaseView("published")}
          trackId="track-1"
          shouldFocusTitle={false}
          onPublished={vi.fn()}
        />
      </TestProviders>
    );
    const { rerender } = render(episodeForm);
    expect(screen.getByText(NOTE_PATTERN)).toBeInTheDocument();
    mockTrackRead.publishedAt = "2026-10-19T10:00:00.000Z";
    rerender(episodeForm);
    await waitFor(() => expect(screen.queryByText(NOTE_PATTERN)).toBeNull());
  });
});
