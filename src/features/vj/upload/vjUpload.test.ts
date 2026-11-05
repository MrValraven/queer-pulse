import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { requestUpload } from "../../members/api/uploads.api";
import { vjErrorKeyOf } from "../vjErrors";
import { VjDecodeError, type VjDecodedClip } from "./vjDecode";
import { readVjBlobBytes } from "./vjSniff";
import {
  isVjPresignRateLimited,
  prepareVjClipFile,
  uploadVjClip,
  vjClipTitleOf,
  type VjPrepareSeams,
} from "./vjUpload";
import { VjUploadFailure } from "./vjUploadFailure";

vi.mock("../../members/api/uploads.api", () => ({
  requestUpload: vi.fn(),
}));
vi.mock("../api/vj.api", () => ({
  createVjClip: vi.fn(),
}));

const UNTITLED = "Untitled clip";

function asciiBytes(text: string): number[] {
  return Array.from(text, (letter) => letter.charCodeAt(0));
}

const MP4_BYTES = [0, 0, 0, 0x20, ...asciiBytes("ftypisom"), 0, 0, 0, 0];
const MOV_BYTES = [0, 0, 0, 0x14, ...asciiBytes("ftypqt  "), 0, 0, 0, 0];
const GIF_BYTES = [...asciiBytes("GIF89a"), 1, 0, 1, 0, 0, 0, 0, 0x3b];

function fileOf(bytes: number[], name: string): File {
  return new File([new Uint8Array(bytes)], name);
}

function decodedClip(overrides: Partial<VjDecodedClip> = {}): VjDecodedClip {
  return {
    width: 1920,
    height: 1080,
    durationMs: 8499.6,
    frame: {} as CanvasImageSource,
    release: vi.fn(),
    ...overrides,
  };
}

function fakeSeams(decoded: VjDecodedClip = decodedClip()) {
  return {
    decode: vi.fn<VjPrepareSeams["decode"]>().mockResolvedValue(decoded),
    drawThumbnail: vi
      .fn<VjPrepareSeams["drawThumbnail"]>()
      .mockResolvedValue(new Blob(["webp"], { type: "image/webp" })),
    sanitize: vi
      .fn<VjPrepareSeams["sanitize"]>()
      .mockReturnValue(new Uint8Array([7, 8, 9])),
    findHevc: vi.fn<VjPrepareSeams["findHevc"]>().mockResolvedValue(false),
  };
}

async function failureOf(work: Promise<unknown>): Promise<VjUploadFailure> {
  const error: unknown = await work.then(
    () => null,
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(VjUploadFailure);
  return error as VjUploadFailure;
}

beforeEach(() => {
  vi.mocked(requestUpload).mockReset();
});

describe("prepareVjClipFile", () => {
  it("refuses a file over 100 MB before reading it", async () => {
    const file = fileOf(MP4_BYTES, "huge.mp4");
    Object.defineProperty(file, "size", { value: 140 * 1024 * 1024 });
    const seams = fakeSeams();
    const failure = await failureOf(prepareVjClipFile(file, UNTITLED, seams));
    expect(failure.code).toBe("VJ_UPLOAD_TOO_LARGE");
    expect(failure.byteSize).toBe(146_800_640);
    expect(seams.decode).not.toHaveBeenCalled();
  });

  it("names MOV before any request", async () => {
    const seams = fakeSeams();
    const failure = await failureOf(
      prepareVjClipFile(fileOf(MOV_BYTES, "phone.mov"), UNTITLED, seams),
    );
    expect(failure.code).toBe("VJ_UPLOAD_FORMAT_MOV");
    expect(seams.decode).not.toHaveBeenCalled();
    expect(requestUpload).not.toHaveBeenCalled();
  });

  it("names a file it cannot read as an unsupported type", async () => {
    const failure = await failureOf(
      prepareVjClipFile(
        fileOf([0x89, 0x50, 0x4e, 0x47], "still.mp4"),
        UNTITLED,
        fakeSeams(),
      ),
    );
    expect(failure.code).toBe("VJ_UPLOAD_TYPE_UNSUPPORTED");
  });

  it("names HEVC when the decode fails and the file holds hvc1", async () => {
    const seams = fakeSeams();
    seams.decode.mockRejectedValue(new VjDecodeError("vj-decode-video-error"));
    seams.findHevc.mockResolvedValue(true);
    const failure = await failureOf(
      prepareVjClipFile(fileOf(MP4_BYTES, "hevc.mp4"), UNTITLED, seams),
    );
    expect(failure.code).toBe("VJ_UPLOAD_HEVC");
  });

  it("names an unplayable video when no HEVC marker is found", async () => {
    const seams = fakeSeams();
    seams.decode.mockRejectedValue(new VjDecodeError("vj-decode-video-error"));
    seams.findHevc.mockResolvedValue(false);
    const failure = await failureOf(
      prepareVjClipFile(fileOf(MP4_BYTES, "broken.mp4"), UNTITLED, seams),
    );
    expect(failure.code).toBe("VJ_UPLOAD_UNPLAYABLE");
  });

  it("names a damaged GIF", async () => {
    const seams = fakeSeams(decodedClip({ durationMs: null }));
    seams.sanitize.mockImplementation(() => {
      throw new Error("gif-truncated");
    });
    const failure = await failureOf(
      prepareVjClipFile(fileOf(GIF_BYTES, "loop.gif"), UNTITLED, seams),
    );
    expect(failure.code).toBe("VJ_UPLOAD_GIF_DAMAGED");
  });

  it("names a GIF the browser could not decode as damaged", async () => {
    const seams = fakeSeams();
    seams.decode.mockRejectedValue(new VjDecodeError("vj-decode-gif-error"));
    const failure = await failureOf(
      prepareVjClipFile(fileOf(GIF_BYTES, "loop.gif"), UNTITLED, seams),
    );
    expect(failure.code).toBe("VJ_UPLOAD_GIF_DAMAGED");
    expect(seams.findHevc).not.toHaveBeenCalled();
  });

  it("names a thumbnail the browser could not make", async () => {
    const decoded = decodedClip();
    const seams = fakeSeams(decoded);
    seams.drawThumbnail.mockRejectedValue(
      new VjUploadFailure("VJ_UPLOAD_THUMBNAIL_FAILED"),
    );
    const failure = await failureOf(
      prepareVjClipFile(fileOf(MP4_BYTES, "clip.mp4"), UNTITLED, seams),
    );
    expect(failure.code).toBe("VJ_UPLOAD_THUMBNAIL_FAILED");
    expect(decoded.release).toHaveBeenCalledTimes(1);
  });

  it("refuses a side over 16384 and a video with no usable duration", async () => {
    const wide = await failureOf(
      prepareVjClipFile(
        fileOf(MP4_BYTES, "wide.mp4"),
        UNTITLED,
        fakeSeams(decodedClip({ width: 16_385 })),
      ),
    );
    expect(wide.code).toBe("VJ_CLIP_DIMENSIONS_INVALID");
    const endless = await failureOf(
      prepareVjClipFile(
        fileOf(MP4_BYTES, "live.mp4"),
        UNTITLED,
        fakeSeams(decodedClip({ durationMs: Number.POSITIVE_INFINITY })),
      ),
    );
    expect(endless.code).toBe("VJ_CLIP_DURATION_INVALID");
    const tooLong = await failureOf(
      prepareVjClipFile(
        fileOf(MP4_BYTES, "set.mp4"),
        UNTITLED,
        fakeSeams(decodedClip({ durationMs: 3_600_001 })),
      ),
    );
    expect(tooLong.code).toBe("VJ_CLIP_DURATION_INVALID");
  });

  it("reads the title, size and duration", async () => {
    const decoded = decodedClip();
    const file = fileOf(MP4_BYTES, "Peak Loop 01.final.mp4");
    const prepared = await prepareVjClipFile(
      file,
      UNTITLED,
      fakeSeams(decoded),
    );
    expect(prepared.title).toBe("Peak Loop 01.final");
    expect(prepared.durationMs).toBe(8500);
    expect(prepared.contentType).toBe("video/mp4");
    expect(prepared.width).toBe(1920);
    expect(prepared.height).toBe(1080);
    expect(prepared.body).toBe(file);
    expect(prepared.byteSize).toBe(file.size);
    expect(decoded.release).toHaveBeenCalledTimes(1);
  });

  it("sends a GIF with no duration and its cleaned bytes", async () => {
    const seams = fakeSeams(decodedClip({ durationMs: null }));
    const prepared = await prepareVjClipFile(
      fileOf(GIF_BYTES, "dots.gif"),
      UNTITLED,
      seams,
    );
    expect(prepared.durationMs).toBeNull();
    expect(prepared.contentType).toBe("image/gif");
    expect(Array.from(await readVjBlobBytes(prepared.body))).toEqual([7, 8, 9]);
    expect(prepared.byteSize).toBe(3);
    expect(Array.from(seams.sanitize.mock.calls[0]?.[0] ?? [])).toEqual(
      GIF_BYTES,
    );
  });

  it("ignores the type the browser reports for the file", async () => {
    const file = new File([new Uint8Array(MP4_BYTES)], "clip.mp4", {
      type: "video/quicktime",
    });
    const prepared = await prepareVjClipFile(file, UNTITLED, fakeSeams());
    expect(prepared.contentType).toBe("video/mp4");
  });
});

describe("vjClipTitleOf", () => {
  it("uses the untitled title for a nameless file", () => {
    expect(vjClipTitleOf(".mp4", UNTITLED)).toBe(UNTITLED);
    expect(vjClipTitleOf("   .gif", UNTITLED)).toBe(UNTITLED);
  });

  it("cuts a long name to 120 code points", () => {
    // An astral letter is two UTF-16 units and one code point.
    const title = vjClipTitleOf(`${"\u{20000}".repeat(130)}.mp4`, UNTITLED);
    expect(Array.from(title)).toHaveLength(120);
  });
});

type FakePutOutcome = { status: number } | "network";

/** A stand-in XMLHttpRequest whose PUT answers with `outcome`. */
function fakeXhrClass(outcome: FakePutOutcome) {
  return class FakeXhr {
    status = 0;
    withCredentials = true;
    upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
      onprogress: null,
    };
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onabort: (() => void) | null = null;
    open = vi.fn();
    setRequestHeader = vi.fn();
    abort = vi.fn();
    send = vi.fn(() => {
      queueMicrotask(() => {
        if (outcome === "network") {
          this.onerror?.();
          return;
        }
        this.status = outcome.status;
        this.onload?.();
      });
    });
  };
}

function liveUpload(): Promise<unknown> {
  return uploadVjClip(
    {
      contentType: "video/mp4",
      body: new Blob(["clip"]),
      byteSize: 4,
      width: 320,
      height: 180,
      durationMs: 2000,
      thumbnail: new Blob(["webp"], { type: "image/webp" }),
      title: "Clip",
    },
    {
      packId: null,
      isDemoMode: false,
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    },
  ).then(
    () => null,
    (reason: unknown) => reason,
  );
}

function presignAnswers(): void {
  vi.mocked(requestUpload).mockResolvedValue({
    uploadUrl: "https://storage.test/put",
    key: "vj-clips/key.mp4",
  });
}

function stubFetch(answer: () => Promise<Response>): void {
  vi.stubGlobal("fetch", vi.fn(answer));
}

const OK_RESPONSE = { ok: true, status: 200 } as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("uploadVjClip", () => {
  it("names a refused thumbnail PUT as an upload that never arrived", async () => {
    presignAnswers();
    stubFetch(() => Promise.resolve({ ok: false, status: 403 } as Response));
    const error = await liveUpload();
    expect(error).toBeInstanceOf(VjUploadFailure);
    expect((error as VjUploadFailure).code).toBe("VJ_UPLOAD_PUT_FAILED");
    expect(vjErrorKeyOf(error)).toBe("vj:error.uploadMissing");
  });

  it("names a thumbnail PUT with no answer as an upload that never arrived", async () => {
    presignAnswers();
    stubFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    const error = await liveUpload();
    expect((error as VjUploadFailure).code).toBe("VJ_UPLOAD_PUT_FAILED");
    expect(vjErrorKeyOf(error)).toBe("vj:error.uploadMissing");
  });

  it("names a refused clip PUT as an upload that never arrived", async () => {
    presignAnswers();
    stubFetch(() => Promise.resolve(OK_RESPONSE));
    vi.stubGlobal("XMLHttpRequest", fakeXhrClass({ status: 403 }));
    const error = await liveUpload();
    expect((error as VjUploadFailure).code).toBe("VJ_UPLOAD_PUT_FAILED");
    expect(vjErrorKeyOf(error)).toBe("vj:error.uploadMissing");
  });

  it("names a clip PUT that lost the network as an upload that never arrived", async () => {
    presignAnswers();
    stubFetch(() => Promise.resolve(OK_RESPONSE));
    vi.stubGlobal("XMLHttpRequest", fakeXhrClass("network"));
    const error = await liveUpload();
    expect((error as VjUploadFailure).code).toBe("VJ_UPLOAD_PUT_FAILED");
    expect(vjErrorKeyOf(error)).toBe("vj:error.uploadMissing");
  });

  it("marks a presign 429 so the row waits and tries again", async () => {
    const refusal = new ApiError(429, "Too Many Requests");
    vi.mocked(requestUpload).mockRejectedValue(refusal);
    const error = await liveUpload();
    expect(error).toBe(refusal);
    expect(isVjPresignRateLimited(error)).toBe(true);
    expect(isVjPresignRateLimited(new ApiError(429, "Too Many Requests"))).toBe(
      false,
    );
  });
});
