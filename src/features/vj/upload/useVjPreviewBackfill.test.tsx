import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  VjClipDTO,
  VjClipMediaDTO,
  VjClipMediaListDTO,
  VjLibraryChange,
} from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { useVjPreviewBackfill } from "./useVjPreviewBackfill";
import type { VjPreviewStage } from "./vjPreviewUpload";
import type { VjPreviewInput } from "./vjPreview";
import { VjUploadFailure } from "./vjUploadFailure";

interface MakeAndAttachOptions {
  clipId: string;
  input: VjPreviewInput;
  isDemoMode: boolean;
  signal: AbortSignal;
  onStage: (stage: VjPreviewStage) => void;
}

const mocks = vi.hoisted(() => ({
  makeAndAttach: vi.fn<(options: MakeAndAttachOptions) => Promise<VjClipDTO>>(),
  fetchClipsMedia:
    vi.fn<
      (clipIds: string[], signal?: AbortSignal) => Promise<VjClipMediaListDTO>
    >(),
  invalidate: vi.fn<(change: VjLibraryChange | null) => void>(),
  pickRecorder: vi.fn(),
  isSupported: vi.fn<(mediaKind: "video" | "gif") => boolean>(),
  waitVisible: vi.fn<(signal: AbortSignal) => Promise<void>>(),
}));

vi.mock("./vjPreviewUpload", () => ({
  makeAndAttachVjPreview: mocks.makeAndAttach,
}));
vi.mock("./vjPreviewFormat", () => ({
  pickVjPreviewRecorderType: mocks.pickRecorder,
  isVjPreviewSupported: mocks.isSupported,
}));
vi.mock("./vjPreviewRecorder", () => ({
  waitVjPageVisible: mocks.waitVisible,
}));
vi.mock("../api/useVjClipsMediaFetcher", () => ({
  useVjClipsMediaFetcher: () => mocks.fetchClipsMedia,
}));
vi.mock("../api/useInvalidateVjLibrary", () => ({
  useInvalidateVjLibrary: () => mocks.invalidate,
}));

const PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const OLD_CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const NEW_CLIP_ID = "00000000-0000-4000-8000-0000000000c2";
const GIF_CLIP_ID = "00000000-0000-4000-8000-0000000000c3";
const READY_CLIP_ID = "00000000-0000-4000-8000-0000000000c4";
const RUN_TIMEOUT = { timeout: 2000 };

function buildClip(
  clipId: string,
  overrides: Partial<VjClipDTO> = {},
): VjClipDTO {
  return {
    id: clipId,
    title: `Clip ${clipId}`,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 4096,
    width: 1280,
    height: 720,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: `/files/thumbnails/${clipId}.webp`,
    mediaUrl: `/files/clips/${clipId}.mp4`,
    packIds: [PACK_ID],
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
    setlistItemCount: 0,
    ...overrides,
  };
}

const OLD_CLIP = buildClip(OLD_CLIP_ID, {
  createdAt: "2026-11-01T20:00:00.000Z",
});
const NEW_CLIP = buildClip(NEW_CLIP_ID, {
  createdAt: "2026-11-05T20:00:00.000Z",
});
const GIF_CLIP = buildClip(GIF_CLIP_ID, {
  mediaKind: "gif",
  mimeType: "image/gif",
  durationMs: null,
});
const READY_CLIP = buildClip(READY_CLIP_ID, {
  createdAt: "2026-11-06T20:00:00.000Z",
  previewUrl: `/files/previews/${READY_CLIP_ID}.webm`,
});

function presignedUrlOf(clipId: string): string {
  return `https://media.example.test/${clipId}?signature=fresh`;
}

function mediaItemOf(clipId: string): VjClipMediaDTO {
  return {
    clipId,
    url: presignedUrlOf(clipId),
    expiresAt: "2026-11-06T21:00:00.000Z",
    mimeType: "video/mp4",
    byteSize: 4096,
  };
}

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<Value>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

function renderBackfill(clips: readonly VjClipDTO[] | undefined) {
  return renderHook(
    ({ libraryClips }: { libraryClips: readonly VjClipDTO[] | undefined }) =>
      useVjPreviewBackfill(libraryClips),
    { wrapper, initialProps: { libraryClips: clips } },
  );
}

function abortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}

beforeEach(() => {
  mocks.makeAndAttach.mockReset();
  mocks.fetchClipsMedia.mockReset();
  mocks.invalidate.mockReset();
  mocks.pickRecorder.mockReset();
  mocks.isSupported.mockReset();
  mocks.waitVisible.mockReset();
  mocks.pickRecorder.mockReturnValue({
    mimeType: "video/webm;codecs=vp9",
    contentType: "video/webm",
  });
  mocks.isSupported.mockReturnValue(true);
  mocks.waitVisible.mockResolvedValue(undefined);
  mocks.fetchClipsMedia.mockImplementation((clipIds) =>
    Promise.resolve({ items: clipIds.map(mediaItemOf) }),
  );
  mocks.makeAndAttach.mockImplementation((options) => {
    options.onStage("recording");
    options.onStage("uploading");
    options.onStage("saving");
    return Promise.resolve(
      buildClip(options.clipId, {
        previewUrl: `/files/previews/${options.clipId}.webm`,
      }),
    );
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useVjPreviewBackfill", () => {
  it("lists clips without a preview, newest first", () => {
    const { result } = renderBackfill([OLD_CLIP, READY_CLIP, NEW_CLIP]);
    expect(result.current.missingClipIds).toEqual([NEW_CLIP_ID, OLD_CLIP_ID]);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.state.rows).toEqual([]);
  });

  it("leaves out a clip its upload row is still previewing", async () => {
    const { result } = renderHook(
      () => useVjPreviewBackfill([OLD_CLIP, NEW_CLIP], [NEW_CLIP_ID]),
      { wrapper },
    );
    expect(result.current.missingClipIds).toEqual([OLD_CLIP_ID]);

    act(() => {
      result.current.start();
    });
    await waitFor(() => {
      expect(mocks.makeAndAttach).toHaveBeenCalledTimes(1);
    }, RUN_TIMEOUT);
    expect(
      mocks.makeAndAttach.mock.calls.map(([options]) => options.clipId),
    ).toEqual([OLD_CLIP_ID]);
  });

  it("names a browser with no recorder type as unsupported", () => {
    mocks.pickRecorder.mockReturnValue(null);
    const { result } = renderBackfill([OLD_CLIP]);
    expect(result.current.isSupported).toBe(false);
  });

  it("makes previews one after another and refreshes the clip list after each", async () => {
    const pending = new Map<string, ReturnType<typeof deferred<VjClipDTO>>>();
    mocks.makeAndAttach.mockImplementation((options) => {
      options.onStage("recording");
      const take = deferred<VjClipDTO>();
      pending.set(options.clipId, take);
      return take.promise;
    });
    const { result } = renderBackfill([OLD_CLIP, NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(mocks.makeAndAttach).toHaveBeenCalledTimes(1),
      RUN_TIMEOUT,
    );
    expect(mocks.makeAndAttach.mock.calls[0]?.[0].clipId).toBe(NEW_CLIP_ID);
    await waitFor(() =>
      expect(result.current.state.rows.map((row) => row.stage)).toEqual([
        "recording",
        "waiting",
      ]),
    );

    act(() => pending.get(NEW_CLIP_ID)?.resolve(NEW_CLIP));
    await waitFor(
      () => expect(mocks.makeAndAttach).toHaveBeenCalledTimes(2),
      RUN_TIMEOUT,
    );
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);
    expect(mocks.invalidate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        kind: "clip_preview_changed",
        clipId: NEW_CLIP_ID,
        packIds: [PACK_ID],
      }),
    );

    act(() => pending.get(OLD_CLIP_ID)?.resolve(OLD_CLIP));
    await waitFor(
      () => expect(result.current.isRunning).toBe(false),
      RUN_TIMEOUT,
    );
    expect(result.current.state.rows.map((row) => row.stage)).toEqual([
      "done",
      "done",
    ]);
    expect(mocks.invalidate).toHaveBeenCalledTimes(2);
    expect(mocks.invalidate).toHaveBeenLastCalledWith(
      expect.objectContaining({ clipId: OLD_CLIP_ID }),
    );
  });

  it("streams a video from its media URL", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderBackfill([NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.isRunning).toBe(false),
      RUN_TIMEOUT,
    );
    expect(mocks.fetchClipsMedia).toHaveBeenCalledWith(
      [NEW_CLIP_ID],
      expect.any(AbortSignal),
    );
    expect(mocks.makeAndAttach).toHaveBeenCalledWith(
      expect.objectContaining({
        clipId: NEW_CLIP_ID,
        input: {
          kind: "videoUrl",
          url: presignedUrlOf(NEW_CLIP_ID),
          durationMs: 8000,
        },
        isDemoMode: true,
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("asks for each clip's media URL right before that clip", async () => {
    const { result } = renderBackfill([OLD_CLIP, NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.isRunning).toBe(false),
      RUN_TIMEOUT,
    );
    expect(mocks.fetchClipsMedia.mock.calls.map((call) => call[0])).toEqual([
      [NEW_CLIP_ID],
      [OLD_CLIP_ID],
    ]);
  });

  it("fetches a GIF's bytes before decoding", async () => {
    const gifBytes = new Blob(["GIF89a"], { type: "image/gif" });
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        blob: () => Promise.resolve(gifBytes),
      } as unknown as Response),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderBackfill([GIF_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.isRunning).toBe(false),
      RUN_TIMEOUT,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      presignedUrlOf(GIF_CLIP_ID),
      expect.objectContaining({
        credentials: "omit",
        signal: expect.any(AbortSignal) as AbortSignal,
      }),
    );
    expect(mocks.makeAndAttach).toHaveBeenCalledWith(
      expect.objectContaining({
        clipId: GIF_CLIP_ID,
        input: { kind: "gif", bytes: gifBytes },
      }),
    );
    expect(result.current.state.rows[0]?.stage).toBe("done");
  });
});

describe("useVjPreviewBackfill failures and stops", () => {
  it("names a refused GIF download as a failed preview", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 403 } as unknown as Response),
      ),
    );
    const { result } = renderBackfill([GIF_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.state.rows[0]?.stage).toBe("failed"),
      RUN_TIMEOUT,
    );
    const failure = result.current.state.rows[0]?.failure;
    expect(failure).toBeInstanceOf(VjUploadFailure);
    expect((failure as VjUploadFailure).code).toBe("VJ_PREVIEW_FAILED");
    expect(mocks.makeAndAttach).not.toHaveBeenCalled();
  });

  it("names a GIF this browser cannot decode before downloading it", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    mocks.isSupported.mockImplementation((mediaKind) => mediaKind === "video");
    const { result } = renderBackfill([GIF_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.state.rows[0]?.stage).toBe("failed"),
      RUN_TIMEOUT,
    );
    const failure = result.current.state.rows[0]?.failure;
    expect((failure as VjUploadFailure).code).toBe("VJ_PREVIEW_UNSUPPORTED");
    expect(mocks.fetchClipsMedia).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("names a clip that left the library", async () => {
    const visible = deferred<undefined>();
    mocks.waitVisible.mockReturnValueOnce(visible.promise);
    mocks.fetchClipsMedia.mockResolvedValue({ items: [] });
    const { result, rerender } = renderBackfill([OLD_CLIP, NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(() => expect(mocks.waitVisible).toHaveBeenCalledTimes(1));
    // The newest clip is deleted from the cached list before its turn starts;
    // the server no longer has media for the other one.
    rerender({ libraryClips: [OLD_CLIP] });
    act(() => visible.resolve(undefined));
    await waitFor(
      () => expect(result.current.isRunning).toBe(false),
      RUN_TIMEOUT,
    );
    for (const row of result.current.state.rows) {
      expect(row.stage).toBe("failed");
      expect(row.failure).toBeInstanceOf(ApiError);
      expect((row.failure as ApiError).status).toBe(404);
      expect((row.failure as ApiError).message).toBe("VJ_CLIP_NOT_FOUND");
      expect((row.failure as ApiError).data).toEqual({
        statusCode: 404,
        code: "VJ_CLIP_NOT_FOUND",
      });
    }
    expect(mocks.fetchClipsMedia).toHaveBeenCalledTimes(1);
    expect(mocks.makeAndAttach).not.toHaveBeenCalled();
  });

  it("waits for a hidden tab to show again before reading the clip", async () => {
    const visible = deferred<undefined>();
    mocks.waitVisible.mockReturnValueOnce(visible.promise);
    const { result } = renderBackfill([NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(() => expect(mocks.waitVisible).toHaveBeenCalledTimes(1));
    expect(mocks.fetchClipsMedia).not.toHaveBeenCalled();
    expect(result.current.state.rows[0]?.stage).toBe("waiting");

    act(() => visible.resolve(undefined));
    await waitFor(
      () => expect(result.current.state.rows[0]?.stage).toBe("done"),
      RUN_TIMEOUT,
    );
    expect(mocks.fetchClipsMedia).toHaveBeenCalledTimes(1);
  });

  it("stop aborts the clip under way", async () => {
    let recordingSignal: AbortSignal | null = null;
    mocks.makeAndAttach.mockImplementation((options) => {
      recordingSignal = options.signal;
      options.onStage("recording");
      return new Promise<VjClipDTO>((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(abortError()), {
          once: true,
        });
      });
    });
    const { result } = renderBackfill([OLD_CLIP, NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.state.rows[0]?.stage).toBe("recording"),
      RUN_TIMEOUT,
    );
    act(() => result.current.stop());

    expect((recordingSignal as AbortSignal | null)?.aborted).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.state.rows.map((row) => row.stage)).toEqual([
      "stopped",
      "stopped",
    ]);
    // The aborted take settles quietly and the next clip never starts.
    await act(() => Promise.resolve());
    expect(mocks.makeAndAttach).toHaveBeenCalledTimes(1);
    expect(result.current.state.rows.every((row) => row.failure === null)).toBe(
      true,
    );
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });

  it("keeps going after one clip fails", async () => {
    mocks.makeAndAttach.mockImplementationOnce(() =>
      Promise.reject(new VjUploadFailure("VJ_PREVIEW_FAILED")),
    );
    const { result } = renderBackfill([OLD_CLIP, NEW_CLIP]);

    act(() => result.current.start());
    await waitFor(
      () => expect(result.current.isRunning).toBe(false),
      RUN_TIMEOUT,
    );
    const [failedRow, doneRow] = result.current.state.rows;
    expect(failedRow?.clipId).toBe(NEW_CLIP_ID);
    expect(failedRow?.stage).toBe("failed");
    expect((failedRow?.failure as VjUploadFailure).code).toBe(
      "VJ_PREVIEW_FAILED",
    );
    expect(doneRow?.clipId).toBe(OLD_CLIP_ID);
    expect(doneRow?.stage).toBe("done");
    expect(mocks.invalidate).toHaveBeenCalledTimes(1);

    act(() => result.current.retryFailed());
    await waitFor(
      () => expect(result.current.state.rows[0]?.stage).toBe("done"),
      RUN_TIMEOUT,
    );
    expect(mocks.makeAndAttach).toHaveBeenCalledTimes(3);
  });
});
