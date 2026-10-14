import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView } from "./api/studio.adapters";
import type { StudioReleaseDTO } from "./api/studio.types";
import { StudioAlbumPage } from "./StudioAlbumPage";
import { StudioReleaseDisputePanel } from "./StudioReleaseDisputePanel";

const refusal = vi.hoisted(() => ({ code: null as string | null }));
vi.mock("./api/studioDemoDisputes", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoDisputes")>();
  return {
    ...original,
    demoFileDispute: (...args: Parameters<typeof original.demoFileDispute>) => {
      if (refusal.code)
        throw new ApiError(409, "Conflict", {
          statusCode: 409,
          code: refusal.code,
        });
      return original.demoFileDispute(...args);
    },
  };
});

beforeEach(() => {
  refusal.code = null;
});

function ownerRelease(overrides: Partial<StudioReleaseDTO> = {}) {
  return toReleaseView({
    id: "release-1",
    title: "Bairro antigo",
    type: "single",
    coverUrl: null,
    releasedOn: "2025-11-02",
    trackCount: 1,
    totalDurationSeconds: 213,
    artist: {
      id: "persona-1",
      handle: "mariana",
      name: "Mariana Sol",
      kind: "musician",
      avatarUrl: null,
    },
    description: null,
    genre: null,
    mood: null,
    scene: null,
    status: "taken_down",
    publishedAt: null,
    tracks: [],
    isOwner: true,
    rightsConfirmedAt: "2026-04-01T10:00:00.000Z",
    takedownReason: "A rights holder asked us to check the sample",
    dispute: null,
    canDispute: true,
    sceneId: null,
    personaCredits: [],
    ...overrides,
  });
}

const rejected = {
  id: "dispute-1",
  status: "rejected" as const,
  note: "The sample is cleared",
  staffReply: "The licence covers a different recording",
  createdAt: "2026-10-10T10:00:00.000Z",
  decidedAt: "2026-10-11T10:00:00.000Z",
};

function renderPanel(overrides: Partial<StudioReleaseDTO> = {}) {
  render(
    <TestProviders>
      <StudioReleaseDisputePanel release={ownerRelease(overrides)} />
    </TestProviders>,
  );
}

describe("dispute panel (demo album page)", () => {
  it("files a dispute from the owner's taken-down release and shows it as sent", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/album?id=demo-release-taken-down-bairro"]}
      >
        <StudioAlbumPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Write a dispute" }),
    );
    const send = await screen.findByRole("button", { name: "Send dispute" });
    fireEvent.click(send);
    expect(
      await screen.findByText("Write a note before you send it"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/your note to our team/i), {
      target: { value: "The sample is cleared, the licence is attached" },
    });
    fireEvent.click(send);
    expect(
      await screen.findByText("Dispute sent, our team will reply here"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Close the dispute form" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByText("The sample is cleared, the licence is attached"),
    ).toBeInTheDocument();
    expect(screen.getByText("Dispute sent to our team")).toBeInTheDocument();
  });

  it.each([
    [
      "studio_dispute_already_open",
      "A dispute is already waiting for our team",
    ],
    [
      "studio_dispute_limit_reached",
      "This release has used all three disputes",
    ],
  ])(
    "on a %s refusal, folds the form, toasts why and focuses the panel heading",
    async (code, message) => {
      refusal.code = code;
      render(
        <TestProviders
          initialEntries={["/studio/album?id=demo-release-taken-down-bairro"]}
        >
          <StudioAlbumPage />
        </TestProviders>,
      );
      fireEvent.click(
        await screen.findByRole("button", { name: "Write a dispute" }),
      );
      fireEvent.change(screen.getByLabelText(/your note to our team/i), {
        target: { value: "Please look again" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Send dispute" }));
      expect(await screen.findByText(message)).toBeInTheDocument();
      await waitFor(() =>
        expect(
          screen.getByRole("heading", { name: "Dispute this takedown" }),
        ).toHaveFocus(),
      );
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: "Send dispute" }),
        ).not.toBeInTheDocument(),
      );
    },
  );
});

describe("dispute panel states", () => {
  it("shows a rejected dispute's reply and offers another while one is left", async () => {
    renderPanel({ dispute: rejected, canDispute: true });
    expect(
      await screen.findByText("Our team kept this release down"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The licence covers a different recording"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Write another dispute" }),
    ).toBeInTheDocument();
  });

  it("says when all three disputes are used", async () => {
    renderPanel({ dispute: rejected, canDispute: false });
    expect(
      await screen.findByText("This release has used all three disputes."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dispute/i }),
    ).not.toBeInTheDocument();
  });

  it("tells the owner of a restored release that our team agreed", async () => {
    renderPanel({
      status: "published",
      takedownReason: null,
      canDispute: false,
      dispute: { ...rejected, status: "upheld", staffReply: "You're right" },
    });
    expect(
      await screen.findByText("Our team restored this release"),
    ).toBeInTheDocument();
  });

  it("puts the sent and decided dates under a decided dispute's state", async () => {
    renderPanel({ dispute: rejected, canDispute: true });
    expect(await screen.findByText(/^Sent /)).toBeInTheDocument();
    expect(screen.getByText(/^Decided /)).toBeInTheDocument();
  });

  it("drops a stale restored outcome once the release is taken down again", async () => {
    renderPanel({
      canDispute: true,
      dispute: { ...rejected, status: "upheld", staffReply: "You're right" },
    });
    expect(
      await screen.findByRole("heading", { name: "Dispute this takedown" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Our team restored this release"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("You're right")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Write another dispute" }),
    ).toBeInTheDocument();
  });

  it("says the cap is reached when a stale restored dispute was the last one", async () => {
    renderPanel({
      canDispute: false,
      dispute: { ...rejected, status: "upheld", staffReply: "You're right" },
    });
    expect(
      await screen.findByText("This release has used all three disputes."),
    ).toBeInTheDocument();
  });

  it("shows a listener nothing", () => {
    renderPanel({ isOwner: false });
    expect(
      screen.queryByRole("heading", { name: "Dispute this takedown" }),
    ).not.toBeInTheDocument();
  });
});
