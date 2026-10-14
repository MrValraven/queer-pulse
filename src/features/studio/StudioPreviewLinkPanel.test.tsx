import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView, type StudioReleaseView } from "./api/studio.adapters";
import { StudioPreviewLinkDialog } from "./StudioPreviewLinkDialog";
import { StudioPreviewLinkPanel } from "./StudioPreviewLinkPanel";

const mint = vi.fn(() =>
  Promise.resolve({
    token: "a".repeat(64),
    createdAt: "2026-10-13T09:00:00.000Z",
  }),
);
const revoke = vi.fn(() => Promise.resolve());
vi.mock("./api/useStudioArtistToolsMutations", () => ({
  useMintStudioPreviewLink: () => ({ mutateAsync: mint, isPending: false }),
  useRevokeStudioPreviewLink: () => ({ mutateAsync: revoke, isPending: false }),
}));

// The dialog's read, answered as a withdrawn release (410).
vi.mock("./api/useStudioRelease", () => ({
  useStudioRelease: () => ({
    release: null,
    loadState: {
      isLoading: false,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: true,
      retry: () => {},
    },
  }),
}));

const base = toReleaseView({
  id: "r1",
  title: "Cartas ao mar",
  type: "ep",
  coverUrl: null,
  releasedOn: null,
  trackCount: 3,
  totalDurationSeconds: 600,
  artist: {
    id: "p1",
    handle: "",
    name: "Mariana Sol",
    kind: "musician",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  mood: null,
  scene: null,
  sceneId: null,
  personaCredits: [],
  status: "draft",
  publishedAt: null,
  tracks: [],
  isOwner: true,
  rightsConfirmedAt: null,
  takedownReason: null,
});

const withLink = (release: StudioReleaseView): StudioReleaseView => ({
  ...release,
  previewToken: "b".repeat(64),
  previewLinkCreatedAt: "2026-10-10T09:00:00.000Z",
});

describe("StudioPreviewLinkPanel", () => {
  it("explains the link before one exists and makes one", async () => {
    render(
      <TestProviders>
        <StudioPreviewLinkPanel release={base} />
      </TestProviders>,
    );
    expect(
      await screen.findByText(
        "Share this release before it's out. Only members with Studio access can open the link",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Make preview link" }));
    await waitFor(() => expect(mint).toHaveBeenCalledWith({ releaseId: "r1" }));
  });

  it("shows the link, and asks before replacing it", async () => {
    mint.mockClear();
    render(
      <TestProviders>
        <StudioPreviewLinkPanel release={withLink(base)} />
      </TestProviders>,
    );
    const field = await screen.findByRole("textbox", { name: "Preview link" });
    expect((field as HTMLInputElement).value).toMatch(
      new RegExp(`/studio/preview/${"b".repeat(64)}$`),
    );
    fireEvent.click(screen.getByRole("button", { name: "Make new link" }));
    expect(
      await screen.findByText("The old link stops working"),
    ).toBeInTheDocument();
    expect(mint).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Make new link" }).at(-1)!,
    );
    await waitFor(() => expect(mint).toHaveBeenCalledWith({ releaseId: "r1" }));
  });

  it("turns the link off in one press", async () => {
    render(
      <TestProviders>
        <StudioPreviewLinkPanel release={withLink(base)} />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Turn off link" }),
    );
    await waitFor(() =>
      expect(revoke).toHaveBeenCalledWith({ releaseId: "r1" }),
    );
    expect(
      screen.queryByText("The old link stops working"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing for a published release or a viewer", () => {
    const { container } = render(
      <TestProviders>
        <StudioPreviewLinkPanel release={{ ...base, status: "published" }} />
        <StudioPreviewLinkPanel release={{ ...base, isOwner: false }} />
      </TestProviders>,
    );
    expect(container.querySelector("section")).toBeNull();
  });
});

describe("StudioPreviewLinkDialog", () => {
  it("says a withdrawn release is unavailable in place of a skeleton", async () => {
    render(
      <TestProviders>
        <StudioPreviewLinkDialog
          releaseId="r1"
          releaseTitle="Cartas ao mar"
          onClose={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText("This release was withdrawn"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Loading" })).toBeNull();
  });
});
