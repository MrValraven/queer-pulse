import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { requestUpload } from "../../members/api/uploads.api";
import { setVjClipPreview } from "../api/vj.api";
import { demoSetVjClipPreview } from "../demo/vjDemoStore";
import { makeVjPreview, type VjMadePreview } from "./vjPreview";
import { attachVjPreview, makeAndAttachVjPreview } from "./vjPreviewUpload";
import { VjUploadFailure } from "./vjUploadFailure";

vi.mock("../../members/api/uploads.api", () => ({
  requestUpload: vi.fn(),
}));
vi.mock("../api/vj.api", () => ({
  createVjClip: vi.fn(),
  setVjClipPreview: vi.fn(),
}));
vi.mock("../demo/vjDemoStore", () => ({
  demoSetVjClipPreview: vi.fn(),
}));
vi.mock("./vjPreview", () => ({
  makeVjPreview: vi.fn(),
}));

const CLIP_ID = "6f1c2a7e-0b8d-4f43-9d0e-1f2a3b4c5d6e";
const PREVIEW_KEY =
  "vj-previews/0d9a0d0e-5a39-4f0e-8a51-0a1b2c3d4e5f/5e8f7a6b-4c3d-4b2a-9f1e-0d9c8b7a6f5e.webm";
const UPLOAD_URL = "https://storage.example/upload?signature=abc";

function madePreview(): VjMadePreview {
  return {
    blob: new Blob([new Uint8Array(4096)], { type: "video/webm" }),
    contentType: "video/webm",
  };
}

const SAVED_CLIP = { id: CLIP_ID } as VjClipDTO;

function stubFetch(answer: () => Promise<Response>) {
  const fetchMock = vi.fn(answer);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
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
  vi.mocked(requestUpload).mockReset().mockResolvedValue({
    uploadUrl: UPLOAD_URL,
    key: PREVIEW_KEY,
  });
  vi.mocked(setVjClipPreview).mockReset().mockResolvedValue(SAVED_CLIP);
  vi.mocked(demoSetVjClipPreview).mockReset().mockReturnValue(SAVED_CLIP);
  vi.mocked(makeVjPreview).mockReset().mockResolvedValue(madePreview());
  createObjectUrl.mockReset().mockReturnValue("blob:demo-preview");
  revokeObjectUrl.mockReset();
  URL.createObjectURL = createObjectUrl;
  URL.revokeObjectURL = revokeObjectUrl;
});

afterEach(() => {
  restoreUrlStatic("createObjectURL", originalCreateObjectUrl);
  restoreUrlStatic("revokeObjectURL", originalRevokeObjectUrl);
  vi.unstubAllGlobals();
});

describe("attachVjPreview", () => {
  it("presigns vj_preview with the recorded type and size, PUTs, then attaches the key", async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response(null, { status: 200 })),
    );
    const preview = madePreview();
    const clip = await attachVjPreview({
      clipId: CLIP_ID,
      preview,
      isDemoMode: false,
      signal: new AbortController().signal,
    });
    expect(requestUpload).toHaveBeenCalledWith(
      "vj_preview",
      "video/webm",
      4096,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      UPLOAD_URL,
      expect.objectContaining({
        method: "PUT",
        body: preview.blob,
        headers: { "Content-Type": "video/webm" },
        credentials: "omit",
      }),
    );
    expect(setVjClipPreview).toHaveBeenCalledWith(CLIP_ID, {
      previewStorageKey: PREVIEW_KEY,
    });
    expect(clip).toBe(SAVED_CLIP);
  });

  it("names a failed PUT as VJ_UPLOAD_PUT_FAILED", async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 403 })));
    const error: unknown = await attachVjPreview({
      clipId: CLIP_ID,
      preview: madePreview(),
      isDemoMode: false,
      signal: new AbortController().signal,
    }).then(
      () => null,
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(VjUploadFailure);
    expect((error as VjUploadFailure).code).toBe("VJ_UPLOAD_PUT_FAILED");
    expect(setVjClipPreview).not.toHaveBeenCalled();
  });

  it("names a PUT with no answer as VJ_UPLOAD_PUT_FAILED", async () => {
    stubFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    const error: unknown = await attachVjPreview({
      clipId: CLIP_ID,
      preview: madePreview(),
      isDemoMode: false,
      signal: new AbortController().signal,
    }).then(
      () => null,
      (reason: unknown) => reason,
    );
    expect((error as VjUploadFailure).code).toBe("VJ_UPLOAD_PUT_FAILED");
  });

  it("attaches a blob URL in demo", async () => {
    const fetchMock = stubFetch(() =>
      Promise.resolve(new Response(null, { status: 200 })),
    );
    const preview = madePreview();
    const clip = await attachVjPreview({
      clipId: CLIP_ID,
      preview,
      isDemoMode: true,
      signal: new AbortController().signal,
    });
    expect(createObjectUrl).toHaveBeenCalledWith(preview.blob);
    expect(demoSetVjClipPreview).toHaveBeenCalledWith(CLIP_ID, {
      previewUrl: "blob:demo-preview",
    });
    expect(clip).toBe(SAVED_CLIP);
    expect(requestUpload).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("revokes the demo blob URL when the demo store refuses", async () => {
    const refusal = new Error("VJ_CLIP_NOT_FOUND");
    vi.mocked(demoSetVjClipPreview).mockImplementation(() => {
      throw refusal;
    });
    await expect(
      attachVjPreview({
        clipId: CLIP_ID,
        preview: madePreview(),
        isDemoMode: true,
        signal: new AbortController().signal,
      }),
    ).rejects.toBe(refusal);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:demo-preview");
  });
});

describe("makeAndAttachVjPreview", () => {
  it("reports recording, uploading and saving in order", async () => {
    stubFetch(() => Promise.resolve(new Response(null, { status: 200 })));
    const stages: string[] = [];
    vi.mocked(makeVjPreview).mockImplementation(() => {
      stages.push("makeVjPreview");
      return Promise.resolve(madePreview());
    });
    vi.mocked(requestUpload).mockImplementation(() => {
      stages.push("presign");
      return Promise.resolve({ uploadUrl: UPLOAD_URL, key: PREVIEW_KEY });
    });
    vi.mocked(setVjClipPreview).mockImplementation(() => {
      stages.push("setVjClipPreview");
      return Promise.resolve(SAVED_CLIP);
    });
    const input = { kind: "gif" as const, bytes: new Blob(["GIF89a"]) };
    const signal = new AbortController().signal;
    await makeAndAttachVjPreview({
      clipId: CLIP_ID,
      input,
      isDemoMode: false,
      signal,
      onStage: (stage) => stages.push(stage),
    });
    expect(makeVjPreview).toHaveBeenCalledWith(input, signal);
    expect(stages).toEqual([
      "recording",
      "makeVjPreview",
      "uploading",
      "presign",
      "saving",
      "setVjClipPreview",
    ]);
  });

  it("passes a preview failure through untouched", async () => {
    const failure = new VjUploadFailure("VJ_PREVIEW_UNSUPPORTED");
    vi.mocked(makeVjPreview).mockRejectedValue(failure);
    await expect(
      makeAndAttachVjPreview({
        clipId: CLIP_ID,
        input: { kind: "gif", bytes: new Blob(["GIF89a"]) },
        isDemoMode: false,
        signal: new AbortController().signal,
        onStage: () => undefined,
      }),
    ).rejects.toBe(failure);
    expect(requestUpload).not.toHaveBeenCalled();
  });
});
