import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeVjPreview, type VjPreviewSeams } from "./vjPreview";
import type { VjPreviewEnvironment } from "./vjPreviewFormat";
import { VjPreviewHiddenError } from "./vjPreviewRecorder";
import type { VjPreviewSource } from "./vjPreviewSources";
import { VjUploadFailure } from "./vjUploadFailure";

const WEBM_HEADER = [0x1a, 0x45, 0xdf, 0xa3];
const QUICKTIME_HEADER = [
  0,
  0,
  0,
  0x14,
  ...Array.from("ftypqt  ", (letter) => letter.charCodeAt(0)),
];
const UNDER_CAP_BYTES = 300_000;
const OVER_CAP_BYTES = 600_000;

function recordingOf(
  byteSize: number,
  header: number[] = WEBM_HEADER,
  type = "video/webm",
): Blob {
  const bytes = new Uint8Array(byteSize);
  bytes.set(header);
  return new Blob([bytes], { type });
}

function webmEnvironment(
  overrides: Partial<VjPreviewEnvironment> = {},
): VjPreviewEnvironment {
  return {
    isTypeSupported: (mimeType) => mimeType === "video/webm;codecs=vp9",
    hasCanvasCapture: true,
    hasImageDecoder: true,
    ...overrides,
  };
}

function fakeSource(): VjPreviewSource {
  return {
    width: 1920,
    height: 1080,
    start: vi.fn<VjPreviewSource["start"]>().mockResolvedValue(undefined),
    draw: vi.fn<VjPreviewSource["draw"]>(),
    release: vi.fn<VjPreviewSource["release"]>(),
  };
}

function fakeSeams(source: VjPreviewSource = fakeSource()) {
  return {
    environment: vi
      .fn<VjPreviewSeams["environment"]>()
      .mockReturnValue(webmEnvironment()),
    openVideo: vi.fn<VjPreviewSeams["openVideo"]>().mockResolvedValue(source),
    openGif: vi.fn<VjPreviewSeams["openGif"]>().mockResolvedValue(source),
    record: vi
      .fn<VjPreviewSeams["record"]>()
      .mockResolvedValue(recordingOf(UNDER_CAP_BYTES)),
    waitVisible: vi
      .fn<VjPreviewSeams["waitVisible"]>()
      .mockResolvedValue(undefined),
  };
}

const VIDEO_URL_INPUT = {
  kind: "videoUrl" as const,
  url: "https://storage.example/clip.mp4?signature=abc",
  durationMs: 8000,
};

async function failureOf(work: Promise<unknown>): Promise<VjUploadFailure> {
  const error: unknown = await work.then(
    () => null,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(VjUploadFailure);
  return error as VjUploadFailure;
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);
const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "revokeObjectURL",
);
const createObjectUrl = vi.fn<(object: Blob | MediaSource) => string>();
const revokeObjectUrl = vi.fn<(url: string) => void>();

/** Puts a URL static back as the test setup left it. */
function restoreUrlStatic(
  name: "createObjectURL" | "revokeObjectURL",
  original: PropertyDescriptor | undefined,
) {
  if (original) Object.defineProperty(URL, name, original);
  else Reflect.deleteProperty(URL, name);
}

beforeEach(() => {
  createObjectUrl.mockReset().mockReturnValue("blob:local-clip");
  revokeObjectUrl.mockReset();
  URL.createObjectURL = createObjectUrl;
  URL.revokeObjectURL = revokeObjectUrl;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => ({
      drawImage: vi.fn(),
    })) as never,
  );
});

afterEach(() => {
  restoreUrlStatic("createObjectURL", originalCreateObjectUrl);
  restoreUrlStatic("revokeObjectURL", originalRevokeObjectUrl);
  vi.restoreAllMocks();
});

describe("makeVjPreview", () => {
  it("returns a WebM preview under 512 KB from the first take", async () => {
    const seams = fakeSeams();
    const preview = await makeVjPreview(
      VIDEO_URL_INPUT,
      new AbortController().signal,
      seams,
    );
    expect(preview.contentType).toBe("video/webm");
    expect(preview.blob.size).toBe(UNDER_CAP_BYTES);
    expect(seams.record).toHaveBeenCalledTimes(1);
    const [recordOptions] = at(seams.record.mock.calls, 0);
    expect(recordOptions).toMatchObject({
      mimeType: "video/webm;codecs=vp9",
      bitsPerSecond: 400_000,
      durationMs: 2000,
      fps: 24,
    });
    const canvas = recordOptions.canvas;
    expect(canvas.width).toBe(0);
  });

  it("opens a media URL cross-origin", async () => {
    const seams = fakeSeams();
    await makeVjPreview(VIDEO_URL_INPUT, new AbortController().signal, seams);
    expect(seams.openVideo).toHaveBeenCalledWith(
      VIDEO_URL_INPUT.url,
      expect.objectContaining({ isCrossOrigin: true, durationMs: 8000 }),
    );
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("records again at 200 kbps when the first take is over 512 KB", async () => {
    const source = fakeSource();
    const seams = fakeSeams(source);
    seams.record
      .mockResolvedValueOnce(recordingOf(OVER_CAP_BYTES))
      .mockResolvedValueOnce(recordingOf(UNDER_CAP_BYTES));
    const preview = await makeVjPreview(
      VIDEO_URL_INPUT,
      new AbortController().signal,
      seams,
    );
    expect(preview.blob.size).toBe(UNDER_CAP_BYTES);
    expect(
      seams.record.mock.calls.map((call) => call[0].bitsPerSecond),
    ).toEqual([400_000, 200_000]);
    expect(source.start).toHaveBeenCalledTimes(2);
  });

  it("fails with VJ_PREVIEW_FAILED when the retry is still over 512 KB", async () => {
    const source = fakeSource();
    const seams = fakeSeams(source);
    seams.record.mockResolvedValue(recordingOf(OVER_CAP_BYTES));
    const failure = await failureOf(
      makeVjPreview(VIDEO_URL_INPUT, new AbortController().signal, seams),
    );
    expect(failure.code).toBe("VJ_PREVIEW_FAILED");
    expect(seams.record).toHaveBeenCalledTimes(2);
    expect(source.release).toHaveBeenCalledTimes(1);
  });

  it("fails with VJ_PREVIEW_UNSUPPORTED before opening anything when no recorder type works", async () => {
    const seams = fakeSeams();
    seams.environment.mockReturnValue(
      webmEnvironment({ isTypeSupported: null }),
    );
    const failure = await failureOf(
      makeVjPreview(
        { kind: "videoFile", file: new Blob(["clip"]), durationMs: 4000 },
        new AbortController().signal,
        seams,
      ),
    );
    expect(failure.code).toBe("VJ_PREVIEW_UNSUPPORTED");
    expect(seams.openVideo).not.toHaveBeenCalled();
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("fails with VJ_PREVIEW_UNSUPPORTED for a GIF without ImageDecoder", async () => {
    const seams = fakeSeams();
    seams.environment.mockReturnValue(
      webmEnvironment({ hasImageDecoder: false }),
    );
    const failure = await failureOf(
      makeVjPreview(
        { kind: "gif", bytes: new Blob(["GIF89a"]) },
        new AbortController().signal,
        seams,
      ),
    );
    expect(failure.code).toBe("VJ_PREVIEW_UNSUPPORTED");
    expect(seams.openGif).not.toHaveBeenCalled();
  });

  it("names a QuickTime-branded MP4 take as VJ_PREVIEW_UNSUPPORTED", async () => {
    const seams = fakeSeams();
    seams.environment.mockReturnValue(
      webmEnvironment({
        isTypeSupported: (mimeType) => mimeType === "video/mp4",
      }),
    );
    seams.record.mockResolvedValue(
      recordingOf(UNDER_CAP_BYTES, QUICKTIME_HEADER, "video/mp4"),
    );
    const failure = await failureOf(
      makeVjPreview(VIDEO_URL_INPUT, new AbortController().signal, seams),
    );
    expect(failure.code).toBe("VJ_PREVIEW_UNSUPPORTED");
    expect(seams.record).toHaveBeenCalledTimes(1);
  });

  it("names an empty take as VJ_PREVIEW_FAILED", async () => {
    const seams = fakeSeams();
    seams.record.mockResolvedValue(new Blob([], { type: "video/webm" }));
    const failure = await failureOf(
      makeVjPreview(VIDEO_URL_INPUT, new AbortController().signal, seams),
    );
    expect(failure.code).toBe("VJ_PREVIEW_FAILED");
  });

  it("takes again after the tab comes back when a take was hidden", async () => {
    const source = fakeSource();
    const seams = fakeSeams(source);
    seams.record
      .mockRejectedValueOnce(new VjPreviewHiddenError())
      .mockResolvedValueOnce(recordingOf(UNDER_CAP_BYTES));
    const preview = await makeVjPreview(
      VIDEO_URL_INPUT,
      new AbortController().signal,
      seams,
    );
    expect(preview.blob.size).toBe(UNDER_CAP_BYTES);
    expect(seams.waitVisible).toHaveBeenCalledTimes(1);
    expect(
      seams.record.mock.calls.map((call) => call[0].bitsPerSecond),
    ).toEqual([400_000, 400_000]);
    expect(source.start).toHaveBeenCalledTimes(2);
  });

  it("gives up after three hidden takes", async () => {
    const seams = fakeSeams();
    seams.record.mockRejectedValue(new VjPreviewHiddenError());
    const failure = await failureOf(
      makeVjPreview(VIDEO_URL_INPUT, new AbortController().signal, seams),
    );
    expect(failure.code).toBe("VJ_PREVIEW_FAILED");
    expect(seams.record).toHaveBeenCalledTimes(3);
    expect(seams.waitVisible).toHaveBeenCalledTimes(2);
  });

  it("names VJ_PREVIEW_FAILED when the source will not open", async () => {
    const seams = fakeSeams();
    const openError = new Error("vj-preview-video-error");
    seams.openVideo.mockRejectedValue(openError);
    const failure = await failureOf(
      makeVjPreview(VIDEO_URL_INPUT, new AbortController().signal, seams),
    );
    expect(failure.code).toBe("VJ_PREVIEW_FAILED");
    expect(failure.cause).toBe(openError);
    expect(seams.record).not.toHaveBeenCalled();
  });

  it("rethrows an abort and releases the source", async () => {
    const source = fakeSource();
    const seams = fakeSeams(source);
    const controller = new AbortController();
    seams.record.mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException("aborted", "AbortError"));
    });
    const error: unknown = await makeVjPreview(
      VIDEO_URL_INPUT,
      controller.signal,
      seams,
    ).then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(DOMException);
    expect((error as DOMException).name).toBe("AbortError");
    expect(source.release).toHaveBeenCalledTimes(1);
  });

  it("revokes the object URL of a local file", async () => {
    const seams = fakeSeams();
    const file = new Blob(["clip"], { type: "video/mp4" });
    await makeVjPreview(
      { kind: "videoFile", file, durationMs: 4000 },
      new AbortController().signal,
      seams,
    );
    expect(createObjectUrl).toHaveBeenCalledWith(file);
    expect(seams.openVideo).toHaveBeenCalledWith(
      "blob:local-clip",
      expect.objectContaining({ isCrossOrigin: false, durationMs: 4000 }),
    );
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:local-clip");
  });

  it("revokes the object URL when the local file will not open", async () => {
    const seams = fakeSeams();
    seams.openVideo.mockRejectedValue(new Error("vj-preview-video-error"));
    await failureOf(
      makeVjPreview(
        { kind: "videoFile", file: new Blob(["clip"]), durationMs: 4000 },
        new AbortController().signal,
        seams,
      ),
    );
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:local-clip");
  });
});
