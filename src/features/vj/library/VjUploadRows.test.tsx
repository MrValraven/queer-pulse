import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { TestProviders } from "../../../test/TestProviders";
import type { VjClipUploads } from "../upload/useVjClipUploads";
import { VjUploadFailure } from "../upload/vjUploadFailure";
import type { VjUploadRow as VjUploadRowState } from "../upload/vjUploadQueue";
import { VjUploadRow } from "./VjUploadRow";
import { VjUploadRows } from "./VjUploadRows";
import { VjUploadZone } from "./VjUploadZone";

const CLOSING_PACK_ID = "00000000-0000-4000-8000-0000000000a3";
const BYTES_PER_MEGABYTE = 1024 * 1024;

function rowOf(changes: Partial<VjUploadRowState> = {}): VjUploadRowState {
  return {
    rowId: "row-1",
    fileName: "clip.mp4",
    byteSize: 4 * BYTES_PER_MEGABYTE,
    packId: null,
    stage: "queued",
    percent: 0,
    failure: null,
    clipId: null,
    retryCount: 0,
    previewFailure: null,
    ...changes,
  };
}

function uploadsWith(rows: VjUploadRowState[]): VjClipUploads {
  return {
    rows,
    isBusy: false,
    addFiles: vi.fn(),
    cancel: vi.fn(),
    retry: vi.fn(),
    dismiss: vi.fn(),
    clearFinished: vi.fn(),
  };
}

function packNameOf(packId: string | null): string | null {
  return packId === CLOSING_PACK_ID ? "Closing" : null;
}

function renderWithProviders(ui: ReactNode) {
  return render(
    <TestProviders>
      <LazyMotion features={domMax}>{ui}</LazyMotion>
    </TestProviders>,
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe("VjUploadRows", () => {
  it("shows each stage in words", async () => {
    const uploads = uploadsWith([
      rowOf({ rowId: "row-queued", fileName: "first.mp4" }),
      rowOf({
        rowId: "row-uploading",
        fileName: "second.webm",
        stage: "uploading",
        percent: 42,
      }),
      rowOf({
        rowId: "row-done",
        fileName: "third.gif",
        stage: "done",
        percent: 100,
        packId: CLOSING_PACK_ID,
        clipId: "clip-3",
      }),
    ]);
    renderWithProviders(
      <VjUploadRows uploads={uploads} packNameOf={packNameOf} />,
    );

    expect(await screen.findByText("Waiting to upload")).toBeInTheDocument();
    expect(screen.getByText("Uploading, 42%")).toBeInTheDocument();
    expect(screen.getByText("Added to Closing")).toBeInTheDocument();
    const progressBar = screen.getByRole("progressbar", {
      name: "Upload progress for second.webm",
    });
    expect(progressBar).toHaveAttribute("aria-valuenow", "42");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    expect(
      screen.getByRole("heading", { name: "Uploads", level: 3 }),
    ).toBeInTheDocument();
  });

  it("announces the stage once and keeps the percent out of the live region", () => {
    const { rerender } = renderWithProviders(
      <VjUploadRow
        row={rowOf({ stage: "uploading", percent: 42 })}
        packName={null}
        onCancel={vi.fn()}
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    // The toast region is a status region too, so the row's own is read by text.
    const liveRegion = screen.getByText("Uploading");
    expect(liveRegion).toHaveAttribute("role", "status");
    expect(liveRegion.textContent).not.toContain("%");
    expect(screen.getByText("Uploading, 42%")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    rerender(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjUploadRow
            row={rowOf({ stage: "uploading", percent: 43 })}
            packName={null}
            onCancel={vi.fn()}
            onRetry={vi.fn()}
            onDismiss={vi.fn()}
          />
        </LazyMotion>
      </TestProviders>,
    );
    expect(screen.getByText("Uploading")).toHaveAttribute("role", "status");
    expect(screen.getByText("Uploading, 43%")).toBeInTheDocument();
  });

  it("names the cause on a failed row with Retry upload", async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <VjUploadRow
        row={rowOf({
          stage: "failed",
          failure: new VjUploadFailure("VJ_UPLOAD_HEVC"),
        })}
        packName={null}
        onCancel={vi.fn()}
        onRetry={onRetry}
        onDismiss={vi.fn()}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This MP4 uses HEVC, which browsers can't play. Export it as H.264",
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry upload" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: "Cancel upload" }),
    ).not.toBeInTheDocument();
  });

  it("names a big file's size", async () => {
    const uploads = uploadsWith([
      rowOf({
        fileName: "long-set.mp4",
        byteSize: 140 * BYTES_PER_MEGABYTE,
        stage: "failed",
        failure: new VjUploadFailure("VJ_UPLOAD_TOO_LARGE"),
      }),
    ]);
    renderWithProviders(
      <VjUploadRows uploads={uploads} packNameOf={packNameOf} />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This file is 140 MB. Clips can be up to 100 MB",
    );
  });

  it("names the file's size when the server refuses it as too large", async () => {
    const uploads = uploadsWith([
      rowOf({
        fileName: "encore.mp4",
        byteSize: 150 * BYTES_PER_MEGABYTE,
        stage: "failed",
        failure: new ApiError(413, "VJ_UPLOAD_TOO_LARGE", {
          code: "VJ_UPLOAD_TOO_LARGE",
        }),
      }),
    ]);
    renderWithProviders(
      <VjUploadRows uploads={uploads} packNameOf={packNameOf} />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This file is 150 MB. Clips can be up to 100 MB",
    );
  });

  it("cancels a running row and removes a finished one", async () => {
    const uploads = uploadsWith([
      rowOf({
        rowId: "row-running",
        fileName: "opening.mp4",
        stage: "uploading",
        percent: 10,
      }),
      rowOf({
        rowId: "row-finished",
        fileName: "clip.mp4",
        stage: "done",
        percent: 100,
        clipId: "clip-1",
      }),
    ]);
    renderWithProviders(
      <VjUploadRows uploads={uploads} packNameOf={packNameOf} />,
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "Cancel upload" }),
    );
    expect(uploads.cancel).toHaveBeenCalledWith("row-running");

    await userEvent.click(
      screen.getByRole("button", { name: "Remove clip.mp4 from the list" }),
    );
    expect(uploads.dismiss).toHaveBeenCalledWith("row-finished");
    expect(screen.getByText("Added to the library")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Clear finished uploads" }),
    );
    expect(uploads.clearFinished).toHaveBeenCalledTimes(1);
  });

  it("offers no clear button while nothing has finished", async () => {
    const uploads = uploadsWith([rowOf({ stage: "checking" })]);
    renderWithProviders(
      <VjUploadRows uploads={uploads} packNameOf={packNameOf} />,
    );

    expect(await screen.findByText("Checking the file")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Clear finished uploads" }),
    ).not.toBeInTheDocument();
  });
});

describe("VjUploadRow preview step", () => {
  it("says it is making the preview and offers Skip preview", async () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <VjUploadRow
        row={rowOf({ stage: "previewing", percent: 100, clipId: "clip-1" })}
        packName={null}
        onCancel={onCancel}
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(
      await screen.findByText("Making the preview", {
        selector: "[role='status']",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel upload" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove clip.mp4 from the list" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Skip preview" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("keeps an uploaded row done and names the preview failure under it", async () => {
    renderWithProviders(
      <VjUploadRow
        row={rowOf({
          stage: "done",
          percent: 100,
          clipId: "clip-1",
          previewFailure: new VjUploadFailure("VJ_PREVIEW_FAILED"),
        })}
        packName={null}
        onCancel={vi.fn()}
        onRetry={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The preview for this clip could not be made",
    );
    expect(
      screen.getByText("Make previews in the library tries this clip again"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Added to the library", { selector: "[role='status']" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Retry upload" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove clip.mp4 from the list" }),
    ).toBeInTheDocument();
  });
});

describe("VjUploadZone", () => {
  it("hands picked files to the queue with the pack", async () => {
    const uploads = uploadsWith([]);
    renderWithProviders(
      <VjUploadZone
        uploads={uploads}
        packId={CLOSING_PACK_ID}
        packName="Closing"
      />,
    );
    const firstFile = new File(["first"], "first.mp4", { type: "video/mp4" });
    const secondFile = new File(["second"], "second.gif", {
      type: "image/gif",
    });

    expect(
      await screen.findByText("New clips go into Closing"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("MP4 (H.264), WebM or GIF, up to 100 MB each"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload clips" }),
    ).toBeInTheDocument();

    await userEvent.upload(
      screen.getByLabelText("Upload clips", { selector: "input" }),
      [firstFile, secondFile],
    );
    expect(uploads.addFiles).toHaveBeenCalledWith(
      [firstFile, secondFile],
      CLOSING_PACK_ID,
    );
  });

  it("takes dropped files into the library when no pack is open", async () => {
    const uploads = uploadsWith([]);
    renderWithProviders(
      <VjUploadZone uploads={uploads} packId={null} packName={null} />,
    );
    const droppedFile = new File(["mov"], "take.mov", {
      type: "video/quicktime",
    });

    const title = await screen.findByText("Drop clips here");
    expect(
      screen.getByText("New clips go into the library, outside every pack"),
    ).toBeInTheDocument();
    const zone = title.closest("[data-vj-drop-zone]");
    expect(zone).not.toBeNull();
    fireEvent.drop(zone as Element, {
      dataTransfer: { files: [droppedFile], types: ["Files"] },
    });
    expect(uploads.addFiles).toHaveBeenCalledWith([droppedFile], null);
  });
});
