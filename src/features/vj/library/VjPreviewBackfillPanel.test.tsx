import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type { VjPreviewBackfill } from "../upload/useVjPreviewBackfill";
import type {
  VjBackfillRow,
  VjBackfillState,
} from "../upload/vjPreviewBackfillQueue";
import { VjUploadFailure } from "../upload/vjUploadFailure";
import { VjPreviewBackfillPanel } from "./VjPreviewBackfillPanel";

function clipOf(clipId: string, title: string): VjClipDTO {
  return {
    id: clipId,
    title,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1024,
    width: 640,
    height: 360,
    durationMs: 4000,
    fitMode: "fill",
    thumbnailUrl: `blob:thumb-${clipId}`,
    mediaUrl: `blob:media-${clipId}`,
    packIds: [],
    packCount: 0,
    createdBy: null,
    createdAt: "2026-11-06T10:00:00.000Z",
    updatedAt: "2026-11-06T10:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
  };
}

const CLIPS = [
  clipOf("clip-1", "Glitter tunnel"),
  clipOf("clip-2", "Neon rain"),
  clipOf("clip-3", "Disco floor"),
];
const CLIPS_BY_ID: ReadonlyMap<string, VjClipDTO> = new Map(
  CLIPS.map((clip) => [clip.id, clip]),
);

function rowOf(
  clipId: string,
  stage: VjBackfillRow["stage"],
  failure: unknown = null,
): VjBackfillRow {
  return { clipId, stage, failure };
}

function backfillWith(
  changes: Partial<VjPreviewBackfill> & { state?: VjBackfillState } = {},
): VjPreviewBackfill {
  const state = changes.state ?? { rows: [], isRunning: false };
  return {
    missingClipIds: ["clip-1", "clip-2", "clip-3"],
    isSupported: true,
    start: vi.fn(),
    stop: vi.fn(),
    retryFailed: vi.fn(),
    clear: vi.fn(),
    ...changes,
    state,
    isRunning: state.isRunning,
  };
}

function renderPanel(backfill: VjPreviewBackfill) {
  const wrap = (ui: ReactNode) => (
    <TestProviders>
      <LazyMotion features={domMax}>{ui}</LazyMotion>
    </TestProviders>
  );
  const result = render(
    wrap(
      <VjPreviewBackfillPanel backfill={backfill} clipsById={CLIPS_BY_ID} />,
    ),
  );
  return {
    ...result,
    rerenderPanel: (next: VjPreviewBackfill) =>
      result.rerender(
        wrap(
          <VjPreviewBackfillPanel backfill={next} clipsById={CLIPS_BY_ID} />,
        ),
      ),
  };
}

/** The panel's own alert: the toast region around it is an alert region too. */
async function findPanelAlert(): Promise<HTMLElement> {
  const panel = await screen.findByRole("region", { name: "Previews" });
  return within(panel).findByRole("alert");
}

afterEach(() => {
  window.localStorage.clear();
});

describe("VjPreviewBackfillPanel", () => {
  it("counts the clips that have no preview", async () => {
    renderPanel(backfillWith());

    expect(
      await screen.findByText(
        "3 clips in your library have no animated preview yet",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Previews" }),
    ).toBeInTheDocument();
  });

  it("starts making previews", async () => {
    const backfill = backfillWith();
    renderPanel(backfill);

    await userEvent.click(
      await screen.findByRole("button", { name: "Make previews" }),
    );
    expect(backfill.start).toHaveBeenCalledTimes(1);
  });

  it("shows which preview is being made out of how many", async () => {
    const backfill = backfillWith({
      state: {
        isRunning: true,
        rows: [
          rowOf("clip-1", "done"),
          rowOf("clip-2", "recording"),
          rowOf("clip-3", "waiting"),
        ],
      },
    });
    renderPanel(backfill);

    expect(
      await screen.findByText("Making preview 2 of 3", {
        selector: "[role='status']",
      }),
    ).toBeInTheDocument();
    const progressBar = screen.getByRole("progressbar", {
      name: "Previews made",
    });
    expect(progressBar).toHaveAttribute("aria-valuenow", "1");
    expect(progressBar).toHaveAttribute("aria-valuemax", "3");
    expect(screen.getByText("Recording the preview")).toBeInTheDocument();
    expect(screen.getByText("Neon rain")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Stop making previews" }),
    );
    expect(backfill.stop).toHaveBeenCalledTimes(1);
  });

  it("names the reason a preview failed on its row", async () => {
    renderPanel(
      backfillWith({
        state: {
          isRunning: false,
          rows: [
            rowOf("clip-1", "done"),
            rowOf("clip-2", "failed", new VjUploadFailure("VJ_PREVIEW_FAILED")),
          ],
        },
      }),
    );

    expect(await findPanelAlert()).toHaveTextContent(
      "The preview for this clip could not be made",
    );
    expect(screen.getByText("Could not be made")).toBeInTheDocument();
  });

  it("offers to make failed previews again", async () => {
    const backfill = backfillWith({
      state: {
        isRunning: false,
        rows: [
          rowOf("clip-1", "done"),
          rowOf("clip-2", "done"),
          rowOf("clip-3", "failed", new VjUploadFailure("VJ_PREVIEW_FAILED")),
        ],
      },
    });
    renderPanel(backfill);

    expect(
      await screen.findByRole("heading", { name: "Made 2 previews" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 could not be made")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Make failed previews again" }),
    );
    expect(backfill.retryFailed).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(backfill.clear).toHaveBeenCalledTimes(1);
  });

  it("ends a clean run on the plum success panel", async () => {
    const backfill = backfillWith({
      missingClipIds: [],
      state: {
        isRunning: false,
        rows: [rowOf("clip-1", "done"), rowOf("clip-2", "done")],
      },
    });
    renderPanel(backfill);

    const heading = await screen.findByRole("heading", {
      name: "Made 2 previews",
    });
    expect(heading.querySelector("em")).toHaveTextContent("2 previews");
    expect(
      screen.getByText(
        "Each clip now shows its moving preview in the library and on the remote",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Previews" })).toHaveAttribute(
      "data-view",
      "finished",
    );
    expect(
      screen.queryByRole("button", { name: "Make failed previews again" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(backfill.clear).toHaveBeenCalledTimes(1);
  });

  it("keeps the progress bar in the title column while running", async () => {
    renderPanel(
      backfillWith({
        state: {
          isRunning: true,
          rows: [rowOf("clip-1", "recording"), rowOf("clip-2", "waiting")],
        },
      }),
    );

    const progressBar = await screen.findByRole("progressbar", {
      name: "Previews made",
    });
    const stopButton = screen.getByRole("button", {
      name: "Stop making previews",
    });
    expect(progressBar.parentElement?.contains(stopButton)).toBe(false);
    expect(progressBar.parentElement?.textContent).toContain(
      "Making preview 1 of 2",
    );
  });

  it("names an unsupported browser and blocks the button", async () => {
    const backfill = backfillWith({ isSupported: false });
    renderPanel(backfill);

    expect(await findPanelAlert()).toHaveTextContent(
      "This browser can't make previews. Try Chrome or Edge",
    );
    const startButton = screen.getByRole("button", { name: "Make previews" });
    expect(startButton).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(startButton);
    expect(backfill.start).not.toHaveBeenCalled();
  });

  it("folds away when every clip has a preview", async () => {
    const { rerenderPanel } = renderPanel(backfillWith());
    expect(
      await screen.findByRole("button", { name: "Make previews" }),
    ).toBeInTheDocument();

    rerenderPanel(backfillWith({ missingClipIds: [] }));

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Make previews" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("region", { name: "Previews" }),
    ).not.toBeInTheDocument();
  });
});
