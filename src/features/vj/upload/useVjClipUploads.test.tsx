import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjClipDTO, VjPackDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { vjKeys } from "../api/vjKeys";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjClips,
  demoGetVjPackClips,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { useVjClipUploads, vjPreviewingClipIdsOf } from "./useVjClipUploads";
import type { VjUploadRow } from "./vjUploadQueue";
import { makeAndAttachVjPreview } from "./vjPreviewUpload";
import { VjUploadFailure } from "./vjUploadFailure";

vi.mock("./vjPreviewUpload", () => ({ makeAndAttachVjPreview: vi.fn() }));

const makePreviewMock = vi.mocked(makeAndAttachVjPreview);

vi.mock("./vjDecode", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./vjDecode")>()),
  decodeVjClip: vi.fn(() =>
    Promise.resolve({
      width: 320,
      height: 180,
      durationMs: null,
      frame: {} as CanvasImageSource,
      release: () => undefined,
    }),
  ),
}));
vi.mock("./vjThumbnail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./vjThumbnail")>()),
  drawVjThumbnail: vi.fn(() =>
    Promise.resolve(new Blob(["webp"], { type: "image/webp" })),
  ),
}));

const CLOSING_PACK_ID = "00000000-0000-4000-8000-0000000000a3";
const UPLOAD_TIMEOUT = { timeout: 4000 };

function asciiBytes(text: string): number[] {
  return Array.from(text, (letter) => letter.charCodeAt(0));
}

/** A valid 1x1 GIF89a, so the real GIF clean runs over it. */
const TINY_GIF_BYTES = [
  ...asciiBytes("GIF89a"),
  0x01,
  0x00,
  0x01,
  0x00,
  0x80,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xff,
  0xff,
  0x2c,
  0x00,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x01,
  0x00,
  0x00,
  0x02,
  0x02,
  0x44,
  0x01,
  0x00,
  0x3b,
];
const MOV_BYTES = [0, 0, 0, 0x14, ...asciiBytes("ftypqt  "), 0, 0, 0, 0];

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

/** A preview run that only ends when its signal aborts (Skip preview, unmount). */
function previewHeldUntilAbort(options: {
  signal: AbortSignal;
}): Promise<VjClipDTO> {
  return new Promise<VjClipDTO>((_resolve, reject) => {
    options.signal.addEventListener(
      "abort",
      () => reject(new DOMException("Aborted", "AbortError")),
      { once: true },
    );
  });
}

function gifFileNamed(fileName: string): File {
  return new File([new Uint8Array(TINY_GIF_BYTES)], fileName);
}

const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:vj-test"),
  });
  configureVjDemoStore({
    storage: createMemoryStorage(),
    channel: createVjDemoChannelHub().open(),
  });
  resetVjDemoLibrary();
  makePreviewMock.mockReset();
  makePreviewMock.mockResolvedValue({} as VjClipDTO);
});

afterEach(() => {
  if (originalCreateObjectUrl) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
});

describe("useVjClipUploads", () => {
  it("adds a GIF to the chosen pack", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    const gifFile = new File(
      [new Uint8Array(TINY_GIF_BYTES)],
      "Sunset loop.gif",
    );
    act(() => {
      result.current.addFiles([gifFile], CLOSING_PACK_ID);
    });
    expect(result.current.isBusy).toBe(true);
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("done"),
      UPLOAD_TIMEOUT,
    );
    expect(result.current.isBusy).toBe(false);
    const closingClips = demoGetVjPackClips(CLOSING_PACK_ID).items;
    const addedClip = closingClips[closingClips.length - 1];
    expect(addedClip?.title).toBe("Sunset loop");
    expect(addedClip?.durationMs).toBeNull();
    expect(addedClip?.byteSize).toBe(TINY_GIF_BYTES.length);
    expect(result.current.rows[0]?.clipId).toBe(addedClip?.id);
  });

  it("fails a MOV row and finishes the GIF row beside it", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    const movFile = new File([new Uint8Array(MOV_BYTES)], "phone.mov");
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "Dots.gif");
    act(() => {
      result.current.addFiles([movFile, gifFile], null);
    });
    await waitFor(
      () => expect(result.current.rows[1]?.stage).toBe("done"),
      UPLOAD_TIMEOUT,
    );
    const movRow = result.current.rows[0];
    expect(movRow?.stage).toBe("failed");
    expect(movRow?.failure).toBeInstanceOf(VjUploadFailure);
    expect((movRow?.failure as VjUploadFailure).code).toBe(
      "VJ_UPLOAD_FORMAT_MOV",
    );
    expect(result.current.rows[1]?.failure).toBeNull();
  });

  it("fails a file past the pack cap before any request", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const fullPack = {
      id: CLOSING_PACK_ID,
      name: "Closing",
      position: 0,
      clipCount: 200,
      totalByteSize: 0,
      coverThumbnailUrl: null,
      createdBy: null,
      createdAt: "2026-11-05T00:00:00.000Z",
      updatedAt: "2026-11-05T00:00:00.000Z",
      event: null,
    } satisfies VjPackDTO;
    queryClient.setQueryData(vjKeys.packs(true), [fullPack]);
    queryClient.setQueryData(vjKeys.clips(true), []);
    const { result } = renderHook(() => useVjClipUploads(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestProviders queryClient={queryClient}>{children}</TestProviders>
      ),
    });
    const clipCountBefore = demoGetVjPackClips(CLOSING_PACK_ID).items.length;
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "Extra.gif");
    act(() => {
      result.current.addFiles([gifFile], CLOSING_PACK_ID);
    });
    const row = result.current.rows[0];
    expect(row?.stage).toBe("failed");
    expect((row?.failure as VjUploadFailure).code).toBe("VJ_PACK_FULL");
    expect(result.current.isBusy).toBe(false);
    expect(demoGetVjPackClips(CLOSING_PACK_ID).items).toHaveLength(
      clipCountBefore,
    );
  });

  it("cancels a row while it uploads", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "Halt.gif");
    act(() => {
      result.current.addFiles([gifFile], null);
    });
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("uploading"),
      UPLOAD_TIMEOUT,
    );
    const rowId = result.current.rows[0]?.rowId ?? "";
    act(() => {
      result.current.cancel(rowId);
    });
    expect(result.current.rows[0]?.stage).toBe("cancelled");
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(result.current.rows[0]?.stage).toBe("cancelled");
    expect(demoGetVjClips().items.some((clip) => clip.title === "Halt")).toBe(
      false,
    );
  });
});

describe("useVjClipUploads preview step", () => {
  it("makes a preview after the clip is saved", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    act(() => {
      result.current.addFiles([gifFileNamed("Glow.gif")], CLOSING_PACK_ID);
    });
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("done"),
      UPLOAD_TIMEOUT,
    );
    const row = result.current.rows[0];
    expect(makePreviewMock).toHaveBeenCalledTimes(1);
    expect(makePreviewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clipId: row?.clipId,
        isDemoMode: true,
        input: { kind: "gif", bytes: expect.any(Blob) as Blob },
      }),
    );
    expect(row?.previewFailure).toBeNull();
    expect(result.current.isBusy).toBe(false);
  });

  it("keeps the clip and names the preview failure on its row", async () => {
    makePreviewMock.mockRejectedValue(new VjUploadFailure("VJ_PREVIEW_FAILED"));
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    act(() => {
      result.current.addFiles([gifFileNamed("Haze.gif")], null);
    });
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("done"),
      UPLOAD_TIMEOUT,
    );
    const row = result.current.rows[0];
    expect(row?.failure).toBeNull();
    expect(row?.previewFailure).toBeInstanceOf(VjUploadFailure);
    expect((row?.previewFailure as VjUploadFailure).code).toBe(
      "VJ_PREVIEW_FAILED",
    );
    const savedClip = demoGetVjClips().items.find(
      (clip) => clip.title === "Haze",
    );
    expect(savedClip?.id).toBe(row?.clipId);
    expect(result.current.isBusy).toBe(false);
  });

  it("starts the next file while the first one makes its preview", async () => {
    let releaseFirstPreview: () => void = () => undefined;
    makePreviewMock.mockImplementationOnce(
      () =>
        new Promise<VjClipDTO>((resolve) => {
          releaseFirstPreview = () => resolve({} as VjClipDTO);
        }),
    );
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    act(() => {
      result.current.addFiles(
        [
          gifFileNamed("One.gif"),
          gifFileNamed("Two.gif"),
          gifFileNamed("Three.gif"),
        ],
        null,
      );
    });
    await waitFor(
      () => {
        const stages = result.current.rows.map((row) => row.stage).sort();
        expect(stages).toEqual(["done", "done", "previewing"]);
      },
      { timeout: 10000 },
    );
    expect(result.current.isBusy).toBe(true);
    act(() => {
      releaseFirstPreview();
    });
    await waitFor(
      () =>
        expect(result.current.rows.every((row) => row.stage === "done")).toBe(
          true,
        ),
      UPLOAD_TIMEOUT,
    );
    expect(makePreviewMock).toHaveBeenCalledTimes(3);
    expect(result.current.isBusy).toBe(false);
  }, 20000);

  it("shows the clip in the grid before its preview is ready", async () => {
    makePreviewMock.mockImplementation(previewHeldUntilAbort);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useVjClipUploads(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestProviders queryClient={queryClient}>{children}</TestProviders>
      ),
    });
    act(() => {
      result.current.addFiles([gifFileNamed("Early.gif")], null);
    });
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("previewing"),
      UPLOAD_TIMEOUT,
    );
    const row = result.current.rows[0];
    expect(row?.clipId).not.toBeNull();
    expect(demoGetVjClips().items.some((clip) => clip.id === row?.clipId)).toBe(
      true,
    );
    // A new clip outside a pack reads the whole library again.
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: vjKeys.root });
    const firstInvalidation = invalidateSpy.mock.invocationCallOrder[0] ?? 0;
    const firstPreview = makePreviewMock.mock.invocationCallOrder[0] ?? 0;
    expect(firstInvalidation).toBeGreaterThan(0);
    expect(firstInvalidation).toBeLessThan(firstPreview);
  });

  it("skipping the preview ends the row as done", async () => {
    makePreviewMock.mockImplementation(previewHeldUntilAbort);
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    act(() => {
      result.current.addFiles([gifFileNamed("Skip.gif")], CLOSING_PACK_ID);
    });
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("previewing"),
      UPLOAD_TIMEOUT,
    );
    const rowId = result.current.rows[0]?.rowId ?? "";
    const clipId = result.current.rows[0]?.clipId;
    act(() => {
      result.current.cancel(rowId);
    });
    const previewSignal = makePreviewMock.mock.calls[0]?.[0].signal;
    expect(previewSignal?.aborted).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.rows[0]).toMatchObject({
      stage: "done",
      percent: 100,
      clipId,
      failure: null,
      previewFailure: null,
    });
    expect(result.current.isBusy).toBe(false);
    const packClips = demoGetVjPackClips(CLOSING_PACK_ID).items;
    expect(packClips.some((clip) => clip.id === clipId)).toBe(true);
  });
});

describe("vjPreviewingClipIdsOf", () => {
  function rowAt(
    stage: VjUploadRow["stage"],
    clipId: string | null,
  ): VjUploadRow {
    return {
      rowId: `row-${stage}-${clipId ?? "none"}`,
      fileName: "Clip.mp4",
      byteSize: 1024,
      packId: null,
      stage,
      percent: 100,
      failure: null,
      clipId,
      retryCount: 0,
      previewFailure: null,
    };
  }

  it("names only the clips whose row is on its preview step", () => {
    expect(
      vjPreviewingClipIdsOf([
        rowAt("previewing", "clip-previewing"),
        rowAt("done", "clip-done"),
        rowAt("uploading", null),
        rowAt("previewing", null),
      ]),
    ).toEqual(["clip-previewing"]);
  });
});
