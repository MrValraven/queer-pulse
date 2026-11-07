import { fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalog } from "../../../../test/awaitCatalog";
import { VjClipFailureSummary } from "./VjClipFailureSummary";
import { VjClipFailuresSheet } from "./VjClipFailuresSheet";
import { vjFailedClipsOf, type VjFailedClip } from "./vjClipFailures";

function clipNamed(id: string, title: string): VjClipDTO {
  return {
    id,
    title,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1_000_000,
    width: 1280,
    height: 720,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: `/files/${id}.jpg`,
    mediaUrl: `/files/${id}.mp4`,
    packIds: ["pack-1"],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-01T20:00:00.000Z",
    updatedAt: "2026-11-01T20:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
  };
}

const NEON = clipNamed("clip-neon", "Neon rain");
const TIDE = clipNamed("clip-tide", "Glitter tide");

const FAILED_CLIPS: VjFailedClip[] = [
  { clip: NEON, failure: "decode_failed" },
  { clip: TIDE, failure: null },
];

async function renderSheet(focusClipId: string | null, onClose = vi.fn()) {
  const view = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjClipFailuresSheet
          failedClips={FAILED_CLIPS}
          focusClipId={focusClipId}
          onClose={onClose}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return { ...view, onClose };
}

describe("vjFailedClipsOf", () => {
  it("keeps the failed clips in pack order with their reasons", () => {
    const failedClips = vjFailedClipsOf([NEON, TIDE], (clipId) =>
      clipId === TIDE.id
        ? { state: "failed", progress: 0, failure: "storage_full" }
        : { state: "ready", progress: 1, failure: null },
    );
    expect(failedClips).toEqual([{ clip: TIDE, failure: "storage_full" }]);
  });
});

describe("VjClipFailuresSheet", () => {
  it("lists each failed clip with its reason and next step", async () => {
    await renderSheet(null);
    const dialog = screen.getByRole("dialog", {
      name: "Clips that couldn't load",
    });
    const rows = within(dialog).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Neon rain");
    expect(rows[0]).toHaveTextContent(
      "The screen's browser can't play this file. Upload it again in the VJ library as MP4 (H.264)",
    );
    expect(rows[1]).toHaveTextContent("Glitter tide");
    expect(rows[1]).toHaveTextContent(
      "The screen didn't say why. Reload the screen to try again",
    );
    expect(within(dialog).queryByText(/^vj:/)).toBeNull();
  });

  it("lands on the row of the badge that opened it", async () => {
    await renderSheet(TIDE.id);
    const focusedRow = document.querySelector(
      `[data-vj-failed-clip="${TIDE.id}"]`,
    );
    expect(focusedRow).toHaveAttribute("data-focused", "true");
    expect(document.activeElement).toBe(focusedRow);
  });

  it("closes from its footer button", async () => {
    const { onClose } = await renderSheet(null);
    fireEvent.click(screen.getByRole("button", { name: "Close the list" }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("VjClipFailureSummary", () => {
  async function renderSummary(failedCount: number, isShown = true) {
    const onSeeWhy = vi.fn();
    render(
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjClipFailureSummary
            failedCount={failedCount}
            isShown={isShown}
            onSeeWhy={onSeeWhy}
          />
        </LazyMotion>
      </TestProviders>,
    );
    await awaitCatalog("vj");
    return onSeeWhy;
  }

  it("counts the clips and opens the sheet from See why", async () => {
    const onSeeWhy = await renderSummary(6);
    expect(
      screen.getByText("6 clips couldn't load on the screen"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "See why" }));
    expect(onSeeWhy).toHaveBeenCalled();
  });

  it("uses the singular for one clip", async () => {
    await renderSummary(1);
    expect(
      screen.getByText("1 clip couldn't load on the screen"),
    ).toBeInTheDocument();
  });

  it("shows nothing while every clip loads", async () => {
    await renderSummary(0);
    expect(document.querySelector("[data-vj-failure-summary]")).toBeNull();
  });

  it("shows nothing over the generators", async () => {
    await renderSummary(3, false);
    expect(document.querySelector("[data-vj-failure-summary]")).toBeNull();
  });
});
