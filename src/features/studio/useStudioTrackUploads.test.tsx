import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { StudioTrackRowView } from "./api/studio.adapters";
import { StudioAudioUploadError } from "./api/studioAudioUpload";
import { FileList } from "./StudioUploadFileList";
import type { StudioUploadAnalysis } from "./upload/useStudioUploadAnalysis";
import { useStudioTrackUploads } from "./useStudioTrackUploads";

const NO_ANALYSIS: StudioUploadAnalysis = {
  statusOf: () => null,
  analysisOf: () => null,
  fileOf: () => null,
  measuredTrackIds: new Set(),
  hasPendingAnalysis: false,
};

/** The Listening props FileList needs: a single, nothing measured. */
const LISTENING_PROPS = {
  analysis: NO_ANALYSIS,
  storedLoudness: new Map(),
  backfillCount: 0,
  releaseType: "single" as const,
  format: "music" as const,
};

const createTrack = vi.fn();
const confirmAudio = vi.fn();
const deleteTrack = vi.fn();
const reorder = vi.fn();
const uploadStudioAudio =
  vi.fn<
    (options: unknown) => { promise: Promise<string>; abort: () => void }
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
// Labels read as "key#position", so a test can find one row's button.
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { position?: number }) =>
      options?.position ? `${key}#${options.position}` : key,
  }),
}));
vi.mock("./api/useStudioReleaseMutations", () => ({
  useReorderStudioTracks: () => ({ mutateAsync: reorder }),
}));
vi.mock("./api/studioAudioUpload", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/studioAudioUpload")>()),
  uploadStudioAudio: (options: unknown) => uploadStudioAudio(options),
}));

const mp3 = (name: string) =>
  new File([new Uint8Array(16)], name, { type: "audio/mpeg" });
const handle = (promise: Promise<string>) => ({ promise, abort: vi.fn() });
const studioRefusal = (status: number, code: string) =>
  new ApiError(status, "refused", { statusCode: status, code, message: code });

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const trackRow = (id: string, title: string): StudioTrackRowView => ({
  id,
  position: 1,
  title,
  durationSeconds: 60,
  durationLabel: "1:00",
  isExplicit: false,
  hasAudio: true,
  href: "",
  savedId: "",
});

/** Lets queued promise callbacks run inside act. */
const settle = () =>
  act(async () => {
    await Promise.resolve();
  });

beforeEach(() => {
  [createTrack, confirmAudio, deleteTrack, reorder, uploadStudioAudio].forEach(
    (mock) => mock.mockReset(),
  );
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
});

describe("useStudioTrackUploads", () => {
  it("creates the track, uploads the file, confirms it and marks the row ready", async () => {
    uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key-1")));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("01 Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(createTrack).toHaveBeenCalledWith({
      releaseId: "r1",
      title: "Tide",
    });
    expect(confirmAudio).toHaveBeenCalledWith({
      trackId: "t1",
      releaseId: "r1",
      key: "key-1",
    });
    expect(result.current.rows[0]?.durationLabel).toBe("3:20");
  });

  it("retries a failed upload on the same track", async () => {
    uploadStudioAudio
      .mockReturnValueOnce(
        handle(Promise.reject(new StudioAudioUploadError("put", 500))),
      )
      .mockReturnValueOnce(handle(Promise.resolve("key-2")));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    expect(result.current.rows[0]?.errorKey).toBe(
      "studio:errors.upload.server",
    );
    act(() => result.current.retry(result.current.rows[0]!.localId));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(createTrack).toHaveBeenCalledTimes(1);
    expect(uploadStudioAudio).toHaveBeenCalledTimes(2);
  });

  it("retries a failed confirm without uploading the file again", async () => {
    uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key-3")));
    confirmAudio.mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    act(() => result.current.retry(result.current.rows[0]!.localId));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(uploadStudioAudio).toHaveBeenCalledTimes(1);
    expect(confirmAudio).toHaveBeenLastCalledWith({
      trackId: "t1",
      releaseId: "r1",
      key: "key-3",
    });
  });

  it("uploads the file again after the server finds it unreadable", async () => {
    uploadStudioAudio
      .mockReturnValueOnce(handle(Promise.resolve("key-5")))
      .mockReturnValueOnce(handle(Promise.resolve("key-6")));
    confirmAudio.mockRejectedValueOnce(
      studioRefusal(422, "studio_audio_unreadable"),
    );
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    expect(result.current.rows[0]?.errorKey).toBe(
      "studio:errors.audioUnreadable",
    );
    act(() => result.current.retry(result.current.rows[0]!.localId));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    expect(createTrack).toHaveBeenCalledTimes(1);
    expect(uploadStudioAudio).toHaveBeenCalledTimes(2);
    expect(confirmAudio).toHaveBeenLastCalledWith({
      trackId: "t1",
      releaseId: "r1",
      key: "key-6",
    });
  });

  it("offers no Retry for a file the server refuses as too large", async () => {
    uploadStudioAudio.mockReturnValue(
      handle(Promise.reject(new StudioAudioUploadError("presign", 413))),
    );
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    expect(result.current.rows[0]?.errorKey).toBe(
      "studio:uploadFlow.files.errorTooLarge",
    );
    expect(result.current.rows[0]?.isRetryable).toBe(false);
  });

  it("marks an object owned by someone else as a failure Retry cannot fix", async () => {
    uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key-7")));
    confirmAudio.mockRejectedValueOnce(
      studioRefusal(422, "studio_audio_wrong_owner"),
    );
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("failed"));
    expect(result.current.rows[0]?.errorKey).toBe(
      "studio:errors.audioWrongOwner",
    );
    expect(result.current.rows[0]?.isRetryable).toBe(false);
  });

  it("lists rejected files without sending anything for them", () => {
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() =>
      result.current.addFiles([
        new File(["x"], "take.flac", { type: "audio/flac" }),
      ]),
    );
    expect(result.current.rejections).toEqual([
      { fileName: "take.flac", reason: "type" },
    ]);
    expect(result.current.rows).toEqual([]);
    expect(createTrack).not.toHaveBeenCalled();
  });

  it("moves a row and sends every track id in the new order", async () => {
    const tracks = [
      {
        id: "a",
        position: 1,
        title: "A",
        durationSeconds: 60,
        durationLabel: "1:00",
        isExplicit: false,
        hasAudio: true,
        href: "",
        savedId: "",
      },
      {
        id: "b",
        position: 2,
        title: "B",
        durationSeconds: 60,
        durationLabel: "1:00",
        isExplicit: false,
        hasAudio: true,
        href: "",
        savedId: "",
      },
    ];
    const { result } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", tracks),
    );
    act(() => result.current.move(result.current.rows[1]!.localId, -1));
    expect(result.current.rows.map((row) => row.title)).toEqual(["B", "A"]);
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["b", "a"],
      }),
    );
  });

  it("removes a row and deletes its track", async () => {
    uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key-4")));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() => expect(result.current.rows[0]?.stage).toBe("ready"));
    act(() => result.current.remove(result.current.rows[0]!.localId));
    await waitFor(() => expect(result.current.rows).toEqual([]));
    expect(deleteTrack).toHaveBeenCalledWith({
      trackId: "t1",
      releaseId: "r1",
    });
  });
});

describe("useStudioTrackUploads queueing, order and focus", () => {
  it("runs at most three uploads at once; a fourth file waits for a free slot", async () => {
    const pendingUploads = [1, 2, 3, 4].map(() => deferred<string>());
    pendingUploads.forEach((upload) =>
      uploadStudioAudio.mockReturnValueOnce(handle(upload.promise)),
    );
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() =>
      result.current.addFiles(
        ["A.mp3", "B.mp3", "C.mp3", "D.mp3"].map((name) => mp3(name)),
      ),
    );
    await waitFor(() => expect(uploadStudioAudio).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(createTrack).toHaveBeenCalledTimes(4));
    await settle();
    expect(uploadStudioAudio).toHaveBeenCalledTimes(3);
    expect(result.current.rows[3]?.stage).toBe("queued");
    await act(async () => {
      pendingUploads[0]?.resolve("key-a");
      await Promise.resolve();
    });
    await waitFor(() => expect(uploadStudioAudio).toHaveBeenCalledTimes(4));
  });

  it("creates tracks one at a time in list order", async () => {
    const firstCreate = deferred<{ id: string; title: string }>();
    createTrack
      .mockReset()
      .mockReturnValueOnce(firstCreate.promise)
      .mockImplementationOnce(({ title }: { title: string }) =>
        Promise.resolve({ id: "t2", title }),
      );
    uploadStudioAudio.mockReturnValue(handle(new Promise<string>(() => {})));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() =>
      result.current.addFiles([mp3("01 Tide.mp3"), mp3("02 Pier.mp3")]),
    );
    await waitFor(() => expect(createTrack).toHaveBeenCalledTimes(1));
    await settle();
    expect(createTrack).toHaveBeenCalledTimes(1);
    expect(createTrack).toHaveBeenLastCalledWith({
      releaseId: "r1",
      title: "Tide",
    });
    await act(async () => {
      firstCreate.resolve({ id: "t1", title: "Tide" });
      await Promise.resolve();
    });
    await waitFor(() => expect(createTrack).toHaveBeenCalledTimes(2));
    expect(createTrack).toHaveBeenLastCalledWith({
      releaseId: "r1",
      title: "Pier",
    });
    await waitFor(() =>
      expect(result.current.rows.map((row) => row.trackId)).toEqual([
        "t1",
        "t2",
      ]),
    );
    expect(reorder).not.toHaveBeenCalled();
  });

  it("sends reorders one at a time and restores the server order when one fails", async () => {
    const firstReorder = deferred<void>();
    reorder
      .mockReturnValueOnce(firstReorder.promise)
      .mockRejectedValueOnce(studioRefusal(409, "studio_track_order_mismatch"));
    const tracks = [trackRow("a", "A"), trackRow("b", "B"), trackRow("c", "C")];
    const { result } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", tracks),
    );
    act(() => result.current.move(result.current.rows[2]!.localId, -1));
    act(() => result.current.move(result.current.rows[0]!.localId, 1));
    expect(result.current.rows.map((row) => row.title)).toEqual([
      "C",
      "A",
      "B",
    ]);
    expect(reorder).toHaveBeenCalledTimes(1);
    expect(reorder).toHaveBeenLastCalledWith({
      releaseId: "r1",
      trackIds: ["a", "c", "b"],
    });
    await act(async () => {
      firstReorder.resolve();
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(reorder).toHaveBeenLastCalledWith({
        releaseId: "r1",
        trackIds: ["c", "a", "b"],
      }),
    );
    await waitFor(() =>
      expect(result.current.rows.map((row) => row.title)).toEqual([
        "A",
        "C",
        "B",
      ]),
    );
    expect(reorder).toHaveBeenCalledTimes(2);
    expect(result.current.orderErrorKey).toBe(
      "studio:errors.trackOrderMismatch",
    );
  });

  it("aborts an upload in flight on unmount and confirms nothing after", async () => {
    const pendingUpload = deferred<string>();
    const abort = vi.fn(() =>
      pendingUpload.reject(new StudioAudioUploadError("put", null, true)),
    );
    uploadStudioAudio.mockReturnValue({
      promise: pendingUpload.promise,
      abort,
    });
    const { result, unmount } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", []),
    );
    act(() => result.current.addFiles([mp3("Tide.mp3")]));
    await waitFor(() =>
      expect(result.current.rows[0]?.stage).toBe("uploading"),
    );
    unmount();
    expect(abort).toHaveBeenCalledTimes(1);
    await settle();
    expect(confirmAudio).not.toHaveBeenCalled();
  });

  it("keeps focus on the Move button after its row moves", () => {
    function Harness() {
      const uploads = useStudioTrackUploads("r1", "p1", [
        trackRow("a", "A"),
        trackRow("b", "B"),
      ]);
      return (
        <FileList
          uploads={uploads}
          releaseId="r1"
          releaseTitle="Salt water"
          isPublished={false}
          {...LISTENING_PROPS}
        />
      );
    }
    render(<Harness />);
    const moveUp = screen.getByRole("button", {
      name: "studio:uploadFlow.files.moveUp#2",
    });
    moveUp.focus();
    fireEvent.click(moveUp);
    const movedButton = screen.getByRole("button", {
      name: "studio:uploadFlow.files.moveUp#1",
    });
    expect(movedButton).toBe(moveUp);
    expect(document.activeElement).toBe(movedButton);
    expect(movedButton).toHaveAttribute("aria-disabled", "true");
  });
});

describe("useStudioTrackUploads order after removing a row", () => {
  /** B and D fail their first create; every other create answers with the
   *  lowercased title as the track id. `heldCreate` holds D's second create. */
  function scriptCreates(heldCreate?: Promise<{ id: string; title: string }>) {
    const attemptsByTitle = new Map<string, number>();
    createTrack.mockImplementation(({ title }: { title: string }) => {
      const attempt = (attemptsByTitle.get(title) ?? 0) + 1;
      attemptsByTitle.set(title, attempt);
      if ((title === "B" || title === "D") && attempt === 1)
        return Promise.reject(new Error("network"));
      if (title === "D" && heldCreate) return heldCreate;
      return Promise.resolve({ id: title.toLowerCase(), title });
    });
  }

  async function renderWithTwoFailedCreates() {
    uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key")));
    const rendered = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() =>
      rendered.result.current.addFiles(
        ["A.mp3", "B.mp3", "C.mp3", "D.mp3"].map((name) => mp3(name)),
      ),
    );
    await waitFor(() =>
      expect(rendered.result.current.rows.map((row) => row.stage)).toEqual([
        "ready",
        "failed",
        "ready",
        "failed",
      ]),
    );
    return rendered;
  }

  it("sends the shown order after the last trackless row is removed", async () => {
    scriptCreates();
    const { result } = await renderWithTwoFailedCreates();

    act(() => result.current.retry(result.current.rows[1]!.localId));
    await waitFor(() => expect(result.current.rows[1]?.stage).toBe("ready"));
    // The server holds a, c, b now, but D still has no track.
    expect(reorder).not.toHaveBeenCalled();

    act(() => result.current.remove(result.current.rows[3]!.localId));
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["a", "b", "c"],
      }),
    );
    expect(reorder).toHaveBeenCalledTimes(1);
    expect(deleteTrack).not.toHaveBeenCalled();
    expect(result.current.rows.map((row) => row.title)).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("sends the shown order only after a row removed mid-create loses its track", async () => {
    const heldCreate = deferred<{ id: string; title: string }>();
    scriptCreates(heldCreate.promise);
    const { result } = await renderWithTwoFailedCreates();

    act(() => result.current.retry(result.current.rows[1]!.localId));
    await waitFor(() => expect(result.current.rows[1]?.stage).toBe("ready"));
    act(() => result.current.retry(result.current.rows[3]!.localId));
    await waitFor(() => expect(result.current.rows[3]?.stage).toBe("creating"));

    act(() => result.current.remove(result.current.rows[3]!.localId));
    await settle();
    // D's create is still on its way, so nothing is sent yet.
    expect(reorder).not.toHaveBeenCalled();

    await act(async () => {
      heldCreate.resolve({ id: "d", title: "D" });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(deleteTrack).toHaveBeenCalledWith({
        trackId: "d",
        releaseId: "r1",
      }),
    );
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["a", "b", "c"],
      }),
    );
    expect(reorder).toHaveBeenCalledTimes(1);
  });

  it("sends nothing when a removed row's track delete fails", async () => {
    uploadStudioAudio.mockReturnValue(handle(Promise.resolve("key")));
    deleteTrack.mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => useStudioTrackUploads("r1", "p1", []));
    act(() => result.current.addFiles([mp3("A.mp3"), mp3("B.mp3")]));
    await waitFor(() =>
      expect(result.current.rows.map((row) => row.stage)).toEqual([
        "ready",
        "ready",
      ]),
    );

    act(() => result.current.remove(result.current.rows[0]!.localId));
    await waitFor(() =>
      expect(result.current.rows.map((row) => row.title)).toEqual(["A", "B"]),
    );
    expect(result.current.rows[0]?.stage).toBe("failed");
    expect(reorder).not.toHaveBeenCalled();
  });

  it("sends the shown order once a row removed mid-create fails its create", async () => {
    const heldCreate = deferred<{ id: string; title: string }>();
    scriptCreates(heldCreate.promise);
    const { result } = await renderWithTwoFailedCreates();

    act(() => result.current.retry(result.current.rows[1]!.localId));
    await waitFor(() => expect(result.current.rows[1]?.stage).toBe("ready"));
    act(() => result.current.retry(result.current.rows[3]!.localId));
    await waitFor(() => expect(result.current.rows[3]?.stage).toBe("creating"));

    act(() => result.current.remove(result.current.rows[3]!.localId));
    await settle();
    expect(reorder).not.toHaveBeenCalled();

    await act(async () => {
      heldCreate.reject(new Error("network"));
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["a", "b", "c"],
      }),
    );
    expect(reorder).toHaveBeenCalledTimes(1);
    expect(deleteTrack).not.toHaveBeenCalled();
  });

  it("waits for a removed track's delete before sending the order a later removal changed", async () => {
    const heldDelete = deferred<void>();
    deleteTrack.mockReturnValueOnce(heldDelete.promise);
    scriptCreates();
    const { result } = await renderWithTwoFailedCreates();

    act(() => result.current.retry(result.current.rows[1]!.localId));
    await waitFor(() => expect(result.current.rows[1]?.stage).toBe("ready"));
    // The server holds a, c, b. A's delete is held, then D goes.
    act(() => result.current.remove(result.current.rows[0]!.localId));
    act(() => result.current.remove(result.current.rows[2]!.localId));
    expect(result.current.rows.map((row) => row.title)).toEqual(["B", "C"]);
    await settle();
    // The server still holds a, so an order without it would be refused.
    expect(reorder).not.toHaveBeenCalled();

    await act(async () => {
      heldDelete.resolve();
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["b", "c"],
      }),
    );
    expect(reorder).toHaveBeenCalledTimes(1);
    expect(deleteTrack).toHaveBeenCalledWith({ trackId: "a", releaseId: "r1" });
  });

  it("sends a move made while a removed track's delete is held once that delete lands", async () => {
    const heldDelete = deferred<void>();
    deleteTrack.mockReturnValueOnce(heldDelete.promise);
    const tracks = [trackRow("a", "A"), trackRow("b", "B"), trackRow("c", "C")];
    const { result } = renderHook(() =>
      useStudioTrackUploads("r1", "p1", tracks),
    );

    act(() => result.current.remove(result.current.rows[0]!.localId));
    act(() => result.current.move(result.current.rows[1]!.localId, -1));
    expect(result.current.rows.map((row) => row.title)).toEqual(["C", "B"]);
    await settle();
    // The server still holds a, so the move waits for its delete.
    expect(reorder).not.toHaveBeenCalled();

    await act(async () => {
      heldDelete.resolve();
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({
        releaseId: "r1",
        trackIds: ["c", "b"],
      }),
    );
    expect(reorder).toHaveBeenCalledTimes(1);
  });
});
