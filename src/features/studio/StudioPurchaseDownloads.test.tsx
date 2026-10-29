import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type {
  StudioBuyerPurchaseView,
  StudioPurchaseDownloadTrackView,
} from "./api/studioPurchases.adapters";
import type { StudioErrorCode } from "./api/studio.types";
import type { useStudioPurchaseDownload } from "./api/useStudioPurchaseMutations";
import { StudioPurchaseDownloads } from "./StudioPurchaseDownloads";

const mocks: {
  download: ReturnType<typeof useStudioPurchaseDownload> | null;
} = vi.hoisted(() => ({ download: null }));

vi.mock("./api/useStudioPurchaseMutations", () => ({
  useStudioPurchaseDownload: () => mocks.download,
}));

function track(
  trackId: string,
  title: string,
  format: "mp3" | "m4a",
  durationSeconds: number | null,
  unavailableReason: StudioErrorCode | null,
): StudioPurchaseDownloadTrackView {
  const minutes =
    durationSeconds === null ? 0 : Math.floor(durationSeconds / 60);
  const seconds = durationSeconds === null ? 0 : durationSeconds % 60;
  return {
    trackId,
    position: 1,
    title,
    durationLabel:
      durationSeconds === null
        ? null
        : `${minutes}:${String(seconds).padStart(2, "0")}`,
    format,
    unavailableReason,
  };
}

function confirmedPurchase(
  downloads: StudioPurchaseDownloadTrackView[],
): StudioBuyerPurchaseView {
  return {
    id: "p1",
    status: "confirmed",
    item: {
      kind: "release",
      title: "Cidade dos santos",
      releaseId: "rel-1",
      trackId: null,
      formatLabelKey: "studio:purchase.format.album",
      coverUrl: null,
      href: "/studio/releases/rel-1",
      isAvailable: true,
    },
    artist: { name: "Lua Cardoso", href: null, subprofileId: "sp-lua" },
    amountCents: 800,
    referenceCode: "K7M2QX",
    payerName: null,
    declineReason: null,
    declineNote: null,
    createdAt: new Date("2026-10-20T10:00:00.000Z"),
    decidedAt: new Date("2026-10-21T10:00:00.000Z"),
    wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
    downloads,
  };
}

function renderDownloads(purchase: StudioBuyerPurchaseView) {
  return render(
    <TestProviders>
      <StudioPurchaseDownloads purchase={purchase} />
    </TestProviders>,
  );
}

function downloadRejecting(error: Error) {
  return vi.fn((_purchaseId: string, trackId: string) =>
    trackId === "t1" ? Promise.reject(error) : Promise.resolve(),
  );
}

beforeEach(() => {
  mocks.download = {
    download: vi.fn(() => Promise.resolve()),
    busyTrackKey: null,
    busyTrackKeys: new Set(),
  };
});

describe("StudioPurchaseDownloads", () => {
  it("lists each track with its format, length and a named Download button", () => {
    renderDownloads(
      confirmedPurchase([track("t1", "Planície", "mp3", 238, null)]),
    );
    expect(
      screen.getByRole("list", {
        name: "Tracks of Cidade dos santos to download",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("MP3 or M4A, as the artist uploaded it"),
    ).toBeInTheDocument();
    expect(screen.getByText("3:58")).toBeInTheDocument();
    expect(screen.getByText("MP3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download Planície" }));
    expect(mocks.download!.download).toHaveBeenCalledWith("p1", "t1");
  });

  it("names a file still being prepared after an unlink, with no Download button on that row", () => {
    renderDownloads(
      confirmedPurchase([
        track("kept-1", "Lado A", "mp3", 200, null),
        track(
          "kept-2",
          "Lado B",
          "m4a",
          null,
          "studio_download_track_preparing",
        ),
      ]),
    );
    const rows = screen.getAllByRole("listitem");
    expect(
      within(rows[1]!).getByText(
        "We are preparing this file for you. Try again in a few minutes",
      ),
    ).toBeInTheDocument();
    expect(within(rows[1]!).queryByRole("button")).toBeNull();
    expect(
      within(rows[0]!).getByRole("button", { name: "Download Lado A" }),
    ).toBeInTheDocument();
  });

  it("names each other refusal by its code", () => {
    const refusals: [StudioErrorCode, string][] = [
      [
        "studio_download_track_withheld",
        "A copyright claim holds this track offline, so it cannot be downloaded",
      ],
      [
        "studio_download_release_taken_down",
        "Our team took this release down, so it cannot be downloaded",
      ],
      [
        "studio_download_artist_unavailable",
        "This artist page was removed, so its music cannot be downloaded",
      ],
      ["studio_download_track_not_ready", "This track has no audio yet"],
    ];
    renderDownloads(
      confirmedPurchase(
        refusals.map(([code], index) =>
          track(`t${index}`, `Faixa ${index}`, "mp3", 100, code),
        ),
      ),
    );
    const rows = screen.getAllByRole("listitem");
    refusals.forEach(([, line], index) => {
      expect(within(rows[index]!).getByText(line)).toBeInTheDocument();
      expect(within(rows[index]!).queryByRole("button")).toBeNull();
    });
  });

  it("names a failed download under its row and keeps the others", async () => {
    mocks.download = {
      download: downloadRejecting(
        new ApiError(410, "studio_download_track_removed", {
          statusCode: 410,
          code: "studio_download_track_removed",
        }),
      ),
      busyTrackKey: null,
      busyTrackKeys: new Set(),
    };
    renderDownloads(
      confirmedPurchase([
        track("t1", "Planície", "mp3", 238, null),
        track("t2", "Maré", "mp3", 190, null),
      ]),
    );
    fireEvent.click(screen.getByRole("button", { name: "Download Planície" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "We couldn't start this download. This track is no longer on the release",
    );
    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]!).getByRole("alert")).toBe(alert);
    expect(within(rows[1]!).queryByRole("alert")).toBeNull();
    expect(
      within(rows[1]!).getByRole("button", { name: "Download Maré" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(1));
  });

  it("says there is nothing to download for a confirmed purchase without tracks", () => {
    renderDownloads(confirmedPurchase([]));
    expect(screen.getByText("Nothing to download yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
