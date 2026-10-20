import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioAudioUploadError } from "./api/studioAudioUpload";
import type {
  ConvertOptions,
  ConvertResult,
} from "./upload/convert/studioWavConverter";
import {
  useStudioTrackUploads,
  type AcceptedUpload,
} from "./useStudioTrackUploads";

const createTrack = vi.fn();
const confirmAudio = vi.fn();
const deleteTrack = vi.fn();
const reorder = vi.fn();
const uploadStudioAudio = vi.fn<
  (options: { file: File; contentType: string }) => {
    promise: Promise<string>;
    abort: () => void;
  }
>();
const convertToMp3 =
  vi.fn<
    (
      file: File,
      maxBytes: number,
      options: ConvertOptions,
    ) => Promise<ConvertResult>
  >();

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./api/useStudioTrackMutations", () => ({
  useCreateStudioTrack: () => ({ mutateAsync: createTrack }),
  useConfirmStudioTrackAudio: () => ({ mutateAsync: confirmAudio }),
  useDeleteStudioTrack: () => ({ mutateAsync: deleteTrack }),
  useUpdateStudioTrack: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("./api/useStudioReleaseMutations", () => ({
  useReorderStudioTracks: () => ({ mutateAsync: reorder }),
}));
vi.mock("./api/studioAudioUpload", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/studioAudioUpload")>()),
  uploadStudioAudio: (options: { file: File; contentType: string }) =>
    uploadStudioAudio(options),
}));
vi.mock("./upload/convert/studioWavConverter", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./upload/convert/studioWavConverter")
  >()),
  convertToMp3: (file: File, maxBytes: number, options: ConvertOptions) =>
    convertToMp3(file, maxBytes, options),
}));

const wav = (name: string) =>
  new File([new Uint8Array(64)], name, { type: "audio/wav" });
const mp3 = (name: string) =>
  new File([new Uint8Array(32)], name, { type: "audio/mpeg" });
const handle = (promise: Promise<string>) => ({ promise, abort: vi.fn() });
const signalOf = (callIndex: number) =>
  convertToMp3.mock.calls[callIndex]?.[2].signal;

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => {
  [
    createTrack,
    confirmAudio,
    deleteTrack,
    reorder,
    uploadStudioAudio,
    convertToMp3,
  ].forEach((mock) => mock.mockReset());
  let trackNumber = 0;
  createTrack.mockImplementation(({ title }: { title: string }) =>
    Promise.resolve({ id: `t${(trackNumber += 1)}`, title }),
  );
  confirmAudio.mockImplementation(({ trackId }: { trackId: string }) =>
    Promise.resolve({
      id: trackId,
      durationSeconds: 200,
      durationLabel: "3:20",
      hasAudio: true,
    }),
  );
  uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key-1")));
});

describe("useStudioTrackUploads with WAV and AIFF", () => {
  it("converts before making the track, then uploads and measures the MP3", async () => {
    const conversion = deferred<ConvertResult>();
    convertToMp3.mockImplementation((_file, _maxBytes, options) => {
      options.onProgress(0.42);
      return conversion.promise;
    });
    const onFilesAccepted = vi.fn<(accepted: AcceptedUpload[]) => void>();
    const pendingUpload = deferred<string>();
    uploadStudioAudio.mockReturnValue(handle(pendingUpload.promise));
    const { result } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", [], { onFilesAccepted }),
    );
    const source = wav("01 Tide.wav");
    act(() => result.current.addFiles([source]));
    await waitFor(() =>
      expect(result.current.rows[0]?.stage).toBe("converting"),
    );
    expect(result.current.rows[0]).toMatchObject({
      title: "Tide",
      fileName: "01 Tide.wav",
      progress: 21,
    });
    expect(result.current.hasPendingUploads).toBe(true);
    expect(createTrack).not.toHaveBeenCalled();
    expect(convertToMp3).toHaveBeenCalledWith(
      source,
      52428800,
      expect.anything(),
    );
    expect(onFilesAccepted).toHaveBeenCalledWith([]);
    const converted = mp3("01 Tide.mp3");
    act(() => conversion.resolve({ ok: true, file: converted, bitrate: 320 }));
    await waitFor(() =>
      expect(result.current.rows[0]?.stage).toBe("uploading"),
    );
    // One continuous bar: the upload carries on from where conversion ended.
    expect(result.current.rows[0]?.progress).toBe(50);
    act(() => pendingUpload.resolve("key-1"));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    const localId = result.current.rows[0]?.localId;
    expect(onFilesAccepted).toHaveBeenLastCalledWith([
      { localId, file: converted, contentType: "audio/mpeg" },
    ]);
    expect(uploadStudioAudio).toHaveBeenCalledWith(
      expect.objectContaining({ file: converted, contentType: "audio/mpeg" }),
    );
    expect(createTrack).toHaveBeenCalledWith({
      releaseId: "r1",
      title: "Tide",
    });
    expect(createTrack.mock.invocationCallOrder[0]).toBeGreaterThan(
      convertToMp3.mock.invocationCallOrder[0] ?? Infinity,
    );
  });

  it("converts at the release's own cap", async () => {
    convertToMp3.mockResolvedValue({
      ok: true,
      file: mp3("ep.mp3"),
      bitrate: 320,
    });
    const { result } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", [], { audioMaxBytes: 262144000 }),
    );
    act(() => result.current.addFiles([wav("ep.wav")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(convertToMp3).toHaveBeenCalledWith(
      expect.any(File),
      262144000,
      expect.anything(),
    );
  });

  it("leaves MP3 files out of the converter", async () => {
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(convertToMp3).not.toHaveBeenCalled();
  });

  it.each([
    {
      result: {
        ok: false,
        reason: "tooLong",
        maxMinutes: 53,
      } satisfies ConvertResult,
      errorKey: "studio:uploadFlow.files.errorTooLong",
      errorValues: { maxMinutes: 53 },
      isRetryable: false,
    },
    {
      result: { ok: false, reason: "unsupported" } satisfies ConvertResult,
      errorKey: "studio:uploadFlow.files.errorUnsupported",
      errorValues: null,
      isRetryable: false,
    },
    {
      result: { ok: false, reason: "failed" } satisfies ConvertResult,
      errorKey: "studio:uploadFlow.files.errorConvert",
      errorValues: null,
      isRetryable: true,
    },
  ])(
    "fails the row with $errorKey",
    async ({ result: conversion, errorKey, errorValues, isRetryable }) => {
      convertToMp3.mockResolvedValue(conversion);
      const { result } = renderHook(() =>
        useStudioTrackUploads("r1", "p1", []),
      );
      act(() => result.current.addFiles([wav("Tide.wav")]));
      await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
      expect(result.current.rows[0]).toMatchObject({
        errorKey,
        errorValues,
        isRetryable,
      });
      expect(createTrack).not.toHaveBeenCalled();
    },
  );
});

describe("useStudioTrackUploads WAV retries, removal and order", () => {
  it("converts again on Retry after a failed conversion", async () => {
    convertToMp3
      .mockResolvedValueOnce({ ok: false, reason: "failed" })
      .mockResolvedValueOnce({ ok: true, file: mp3("Tide.mp3"), bitrate: 320 });
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([wav("Tide.wav")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    act(() => result.current.retry(result.current.rows[0]?.localId ?? ""));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(convertToMp3).toHaveBeenCalledTimes(2);
    expect(createTrack).toHaveBeenCalledTimes(1);
  });

  it("does not convert again on Retry after a failed upload", async () => {
    const converted = mp3("Tide.mp3");
    convertToMp3.mockResolvedValue({ ok: true, file: converted, bitrate: 320 });
    uploadStudioAudio
      .mockReturnValueOnce(
        handle(Promise.reject(new StudioAudioUploadError("put", 500))),
      )
      .mockReturnValueOnce(handle(Promise.resolve("key-2")));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([wav("Tide.wav")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    expect(result.current.rows[0]?.errorKey).toBe(
      "studio:uploadFlow.files.errorUpload",
    );
    act(() => result.current.retry(result.current.rows[0]?.localId ?? ""));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(convertToMp3).toHaveBeenCalledTimes(1);
    expect(uploadStudioAudio).toHaveBeenCalledTimes(2);
    expect(uploadStudioAudio).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: converted }),
    );
  });

  it("aborts the conversion when the row is removed", async () => {
    convertToMp3.mockImplementation((_file, _maxBytes, options) => {
      options.onProgress(0);
      return new Promise<ConvertResult>(() => undefined);
    });
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([wav("Tide.wav"), wav("Pier.wav")]));
    await waitFor(() => expect(convertToMp3).toHaveBeenCalledTimes(2));
    act(() => result.current.remove(result.current.rows[1]?.localId ?? ""));
    expect(signalOf(1)?.aborted).toBe(true);
    expect(signalOf(0)?.aborted).toBe(false);
    expect(result.current.rows.map((row) => row.title)).toEqual(["Tide"]);
    expect(deleteTrack).not.toHaveBeenCalled();
  });

  it("aborts the conversion on unmount", async () => {
    convertToMp3.mockReturnValue(new Promise<ConvertResult>(() => undefined));
    const { result, unmount } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", []),
    );
    act(() => result.current.addFiles([wav("Tide.wav")]));
    await waitFor(() => expect(convertToMp3).toHaveBeenCalledTimes(1));
    unmount();
    expect(signalOf(0)?.aborted).toBe(true);
  });

  it("sends the shown order once a WAV ahead of an MP3 gets its track", async () => {
    const conversion = deferred<ConvertResult>();
    convertToMp3.mockReturnValue(conversion.promise);
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([wav("A.wav"), mp3("B.mp3")]));
    await waitFor(() => expect(result.current.rows[1]?.stage).toBe("ready"));
    expect(result.current.rows[0]?.stage).toBe("queued");
    act(() =>
      conversion.resolve({ ok: true, file: mp3("A.mp3"), bitrate: 320 }),
    );
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["t2", "t1"],
      }),
    );
  });
});
