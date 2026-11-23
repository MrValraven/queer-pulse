import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { DocumentProcessingError } from "./documentUploadProcessing";
import { useUploadDocument } from "./useUploadDocument";

// SEC-43: a document upload asks the server to check the stored bytes after
// the PUT and before the key is handed back to be sent.

interface UploadApiMocks {
  requestUpload: ReturnType<typeof vi.fn>;
  confirmUpload: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted<UploadApiMocks>(() => ({
  requestUpload: vi.fn(),
  confirmUpload: vi.fn(),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../members/api/uploads.api", () => ({
  requestUpload: mocks.requestUpload,
  confirmUpload: mocks.confirmUpload,
}));
vi.mock("../../shared/observability/logger", () => ({
  logError: vi.fn(),
}));

const STORAGE_KEY = "message-documents/owner/file.pdf";

/** A `XMLHttpRequest` double that answers every `PUT` with an instant 200. */
class SucceedingXMLHttpRequest {
  status = 0;
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  withCredentials = false;
  open(): void {}
  setRequestHeader(): void {}
  abort(): void {}
  send(): void {
    this.status = 200;
    queueMicrotask(() => this.onload?.());
  }
}

function pdfFile(): File {
  return new File(["%PDF-1.7"], "lease.pdf", { type: "application/pdf" });
}

describe("useUploadDocument confirm step", () => {
  beforeEach(() => {
    vi.stubGlobal("XMLHttpRequest", SucceedingXMLHttpRequest);
    mocks.requestUpload.mockReset().mockResolvedValue({
      uploadUrl: "https://storage.example.test/slot",
      key: STORAGE_KEY,
    });
    mocks.confirmUpload.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("confirms the stored key before resolving it", async () => {
    const { result } = renderHook(() => useUploadDocument());

    await expect(result.current(pdfFile())).resolves.toMatchObject({
      key: STORAGE_KEY,
    });
    expect(mocks.confirmUpload).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("names a coded refusal of the stored bytes", async () => {
    mocks.confirmUpload.mockRejectedValue(
      new ApiError(422, "x", { code: "UPLOAD_CONTENT_MISMATCH" }),
    );
    const { result } = renderHook(() => useUploadDocument());

    const failure: unknown = await result
      .current(pdfFile())
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(DocumentProcessingError);
    expect((failure as DocumentProcessingError).i18nKey).toBe(
      "shared:apiError.uploadContentMismatch",
    );
  });
});
