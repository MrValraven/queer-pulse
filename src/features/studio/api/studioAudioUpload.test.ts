import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioAudioUploadError, uploadStudioAudio } from "./studioAudioUpload";

const requestUpload = vi.fn();
vi.mock("../../members/api/uploads.api", () => ({
  requestUpload: (...args: unknown[]) => requestUpload(...args) as unknown,
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
  });
});
