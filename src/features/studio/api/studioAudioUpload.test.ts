import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SHARED_CAUSE_KEY,
  causeErrorKey,
} from "../../../shared/api/causeErrorKey";
import { ApiError } from "../../../shared/api/client";
import {
  StudioAudioUploadError,
  confirmStudioAudioUpload,
  uploadStudioAudio,
  uploadedKeyOf,
} from "./studioAudioUpload";

const requestUpload = vi.fn();
const confirmUpload = vi.fn();
vi.mock("../../members/api/uploads.api", () => ({
  requestUpload: (...args: unknown[]) => requestUpload(...args) as unknown,
  confirmUpload: (...args: unknown[]) => confirmUpload(...args) as unknown,
}));

class FakeXhr {
  static last: FakeXhr | null = null;
  upload = {
    onprogress: null as
      | null
      | ((event: {
          lengthComputable: boolean;
          loaded: number;
          total: number;
        }) => void),
  };
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  onabort: null | (() => void) = null;
  status = 0;
  withCredentials = true;
  open = vi.fn();
  setRequestHeader = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => this.onabort?.());
  constructor() {
    FakeXhr.last = this;
  }
}

const file = new File([new Uint8Array(2048)], "01 tide.mp3", {
  type: "audio/mpeg",
});

beforeEach(() => {
  vi.stubGlobal("XMLHttpRequest", FakeXhr);
  requestUpload.mockReset();
  confirmUpload.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("uploadStudioAudio", () => {
  it("presigns with the persona id, PUTs without cookies and resolves the key", async () => {
    requestUpload.mockResolvedValue({
      uploadUrl: "https://bucket.example/put",
      key: "studio-audio/p1/abc.mp3",
    });
    const progress: number[] = [];
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: (percent) => progress.push(percent),
    });
    await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
    expect(requestUpload).toHaveBeenCalledWith(
      "studio_audio",
      "audio/mpeg",
      2048,
      "p1",
    );
    expect(FakeXhr.last?.withCredentials).toBe(false);
    FakeXhr.last?.upload.onprogress?.({
      lengthComputable: true,
      loaded: 1024,
      total: 2048,
    });
    FakeXhr.last!.status = 200;
    FakeXhr.last?.onload?.();
    await expect(handle.promise).resolves.toBe("studio-audio/p1/abc.mp3");
    expect(progress).toEqual([50, 100]);
    expect(confirmUpload).toHaveBeenCalledWith("studio-audio/p1/abc.mp3");
  });

  it("reports a refused presign as a presign failure with its status and cause", async () => {
    const refusal = Object.assign(new Error("too big"), { status: 413 });
    requestUpload.mockRejectedValue(refusal);
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: () => {},
    });
    await expect(handle.promise).rejects.toMatchObject({
      stage: "presign",
      status: 413,
      cause: refusal,
    });
  });

  it("marks an aborted PUT as aborted", async () => {
    requestUpload.mockResolvedValue({
      uploadUrl: "https://bucket.example/put",
      key: "k",
    });
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: () => {},
    });
    await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
    handle.abort();
    const error = await handle.promise.catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(StudioAudioUploadError);
    expect((error as StudioAudioUploadError).isAborted).toBe(true);
  });

  it("simulates progress in demo mode without a request", async () => {
    vi.useFakeTimers();
    const progress: number[] = [];
    const handle = uploadStudioAudio({
      demoMode: true,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: (percent) => progress.push(percent),
    });
    await vi.runAllTimersAsync();
    await expect(handle.promise).resolves.toBe("demo-audio:2048:01 tide.mp3");
    expect(progress.at(-1)).toBe(100);
    expect(requestUpload).not.toHaveBeenCalled();
    expect(confirmUpload).not.toHaveBeenCalled();
  });
});

// Open item A: the server checks the stored bytes once the PUT lands.
describe("uploadStudioAudio confirm step", () => {
  it("confirms the stored bytes only after the PUT lands", async () => {
    requestUpload.mockResolvedValue({
      uploadUrl: "https://bucket.example/put",
      key: "studio-audio/p1/abc.mp3",
    });
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: () => {},
    });
    await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
    expect(confirmUpload).not.toHaveBeenCalled();
    FakeXhr.last!.status = 200;
    FakeXhr.last?.onload?.();
    await expect(handle.promise).resolves.toBe("studio-audio/p1/abc.mp3");
    expect(confirmUpload).toHaveBeenCalledTimes(1);
  });

  it.each([
    [422, "UPLOAD_CONTENT_MISMATCH", SHARED_CAUSE_KEY.uploadContentMismatch],
    [404, "UPLOAD_NOT_FOUND", SHARED_CAUSE_KEY.uploadNotFound],
    [503, "UPLOAD_CHECK_UNAVAILABLE", SHARED_CAUSE_KEY.uploadCheckUnavailable],
  ])(
    "reports a %i %s confirm refusal as a confirm failure whose cause names it",
    async (status, code, causeKey) => {
      const refusal = new ApiError(status, "refused", { code });
      requestUpload.mockResolvedValue({
        uploadUrl: "https://bucket.example/put",
        key: "studio-audio/p1/abc.mp3",
      });
      confirmUpload.mockRejectedValue(refusal);
      const handle = uploadStudioAudio({
        demoMode: false,
        subprofileId: "p1",
        file,
        contentType: "audio/mpeg",
        onProgress: () => {},
      });
      await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
      FakeXhr.last!.status = 200;
      FakeXhr.last?.onload?.();
      const error = await handle.promise.catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(StudioAudioUploadError);
      expect(error).toMatchObject({
        stage: "confirm",
        status,
        isAborted: false,
        cause: refusal,
      });
      expect(causeErrorKey((error as StudioAudioUploadError).cause).key).toBe(
        causeKey,
      );
    },
  );

  it("keeps the stored key on a confirm refusal so Retry can check it alone", async () => {
    requestUpload.mockResolvedValue({
      uploadUrl: "https://bucket.example/put",
      key: "studio-audio/p1/abc.mp3",
    });
    confirmUpload.mockRejectedValue(
      new ApiError(503, "unavailable", { code: "UPLOAD_CHECK_UNAVAILABLE" }),
    );
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: () => {},
    });
    await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
    FakeXhr.last!.status = 200;
    FakeXhr.last?.onload?.();
    const error = await handle.promise.catch((caught: unknown) => caught);
    expect(error).toMatchObject({
      stage: "confirm",
      uploadedKey: "studio-audio/p1/abc.mp3",
    });
    expect(uploadedKeyOf(error)).toBe("studio-audio/p1/abc.mp3");
    expect(uploadedKeyOf(new StudioAudioUploadError("put", 500))).toBeNull();
  });

  it("drops the key of a confirm that found no stored object, so Retry uploads again", () => {
    const missing = new StudioAudioUploadError(
      "confirm",
      404,
      false,
      new ApiError(404, "missing", { code: "UPLOAD_NOT_FOUND" }),
      "studio-audio/p1/abc.mp3",
    );
    expect(uploadedKeyOf(missing)).toBeNull();
    const unavailable = new StudioAudioUploadError(
      "confirm",
      503,
      false,
      new ApiError(503, "unavailable", { code: "UPLOAD_CHECK_UNAVAILABLE" }),
      "studio-audio/p1/abc.mp3",
    );
    expect(uploadedKeyOf(unavailable)).toBe("studio-audio/p1/abc.mp3");
  });

  it("rejects as cancelled when the upload is aborted during the confirm", async () => {
    requestUpload.mockResolvedValue({
      uploadUrl: "https://bucket.example/put",
      key: "studio-audio/p1/abc.mp3",
    });
    let answerConfirm: () => void = () => undefined;
    confirmUpload.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          answerConfirm = resolve;
        }),
    );
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: () => {},
    });
    await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
    FakeXhr.last!.status = 200;
    FakeXhr.last?.onload?.();
    await vi.waitFor(() => expect(confirmUpload).toHaveBeenCalled());
    handle.abort();
    answerConfirm();
    const error = await handle.promise.catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(StudioAudioUploadError);
    expect((error as StudioAudioUploadError).isAborted).toBe(true);
  });

  it("checks a stored key alone and names a refusal with the key kept", async () => {
    await expect(
      confirmStudioAudioUpload("studio-audio/p1/abc.mp3"),
    ).resolves.toBe("studio-audio/p1/abc.mp3");
    expect(requestUpload).not.toHaveBeenCalled();
    const refusal = new ApiError(422, "mismatch", {
      code: "UPLOAD_CONTENT_MISMATCH",
    });
    confirmUpload.mockRejectedValueOnce(refusal);
    const error = await confirmStudioAudioUpload(
      "studio-audio/p1/abc.mp3",
    ).catch((caught: unknown) => caught);
    expect(error).toMatchObject({
      stage: "confirm",
      status: 422,
      cause: refusal,
      uploadedKey: "studio-audio/p1/abc.mp3",
    });
  });

  it("skips the confirm when the PUT fails", async () => {
    requestUpload.mockResolvedValue({
      uploadUrl: "https://bucket.example/put",
      key: "studio-audio/p1/abc.mp3",
    });
    const handle = uploadStudioAudio({
      demoMode: false,
      subprofileId: "p1",
      file,
      contentType: "audio/mpeg",
      onProgress: () => {},
    });
    await vi.waitFor(() => expect(FakeXhr.last?.send).toHaveBeenCalled());
    FakeXhr.last!.status = 500;
    FakeXhr.last?.onload?.();
    await expect(handle.promise).rejects.toMatchObject({
      stage: "put",
      status: 500,
    });
    expect(confirmUpload).not.toHaveBeenCalled();
  });
});
