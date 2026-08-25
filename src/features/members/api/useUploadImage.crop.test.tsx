import { renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TestProviders } from "../../../test/TestProviders";
import {
  IDENTITY_CROP,
  type CropRect,
} from "../../../shared/components/ui/cropGeometry";
// Statically imported so demo-mode tests share the module graph (and thus
// both the DemoModeContext instance from TestProviders, also a static
// import, and the SAME mocked "./uploads.api" instance asserted on below) —
// mirrors useVouchMember.test.tsx. Live-mode tests instead vi.resetModules()
// + dynamically re-import everything together per `loadLive()`, since they
// need a fresh VITE_API_URL-stubbed config module; mixing a stale static
// import with a post-reset dynamic one would assert on two different mock
// instances.
import { useUploadImage, type UploadResult } from "./useUploadImage";
import * as uploadsApiStatic from "./uploads.api";

/**
 * B6: `useUploadImage` persists a non-identity reframe crop after the live
 * upload PUT succeeds, via `saveCrop` in `uploads.api.ts` — but never lets a
 * crop-save failure block or fail the resolved `{ key, previewUrl }`, and
 * never persists the identity crop (the whole image, unreframed) at all.
 *
 * `requestUpload` and `saveCrop` are mocked at the module boundary (both live
 * in `uploads.api.ts`, imported by name); `uploadProcessing`'s validate/decode
 * pipeline is mocked too since it needs a real canvas/`createImageBitmap`,
 * unavailable in jsdom, and is out of scope for this test (see
 * `PhotoReframeModal.test.tsx` for crop-geometry coverage, and
 * `uploadProcessing.test.ts` — if one exists — for the pipeline itself). The
 * live-mode PUT itself runs for real against a stubbed `XMLHttpRequest`, so
 * `putWithRetry`'s success path (internal to the hook, not exported) is
 * exercised as written rather than assumed.
 */

vi.mock("./uploadProcessing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./uploadProcessing")>();
  return {
    ...actual,
    validateTypeAndSize: vi.fn(),
    processImage: vi.fn(() =>
      Promise.resolve(new Blob(["fake-bytes"], { type: "image/jpeg" })),
    ),
  };
});

vi.mock("./uploads.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./uploads.api")>();
  return {
    ...actual,
    requestUpload: vi.fn(() =>
      Promise.resolve({
        uploadUrl: "https://storage.example.test/upload-slot",
        key: "avatars/test-key.webp",
      }),
    ),
    saveCrop: vi.fn(() => Promise.resolve(undefined)),
  };
});

/** A `XMLHttpRequest` double that resolves every `PUT` as an instant 200. */
class SucceedingXMLHttpRequest {
  status = 0;
  upload: { onprogress: ((event: ProgressEvent) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  withCredentials = false;
  open(): void {}
  setRequestHeader(): void {}
  send(): void {
    this.status = 200;
    queueMicrotask(() => this.onload?.());
  }
}

const NON_IDENTITY_CROP: CropRect = {
  x: 0.1,
  y: 0.05,
  width: 0.6,
  height: 0.6,
  aspect: "1:1",
};

function testFile(): File {
  return new File(["x"], "photo.jpg", { type: "image/jpeg" });
}

async function loadLive() {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "https://api.example.test");
  const { useUploadImage: useUploadImageLive } =
    await import("./useUploadImage");
  const uploadsApi = await import("./uploads.api");
  const { DemoModeProvider } =
    await import("../../../app/providers/DemoModeProvider");
  const { I18nProvider } = await import("../../../app/providers/I18nProvider");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <I18nProvider>
        <DemoModeProvider>{children}</DemoModeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
  return { useUploadImage: useUploadImageLive, wrapper, uploadsApi };
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("XMLHttpRequest", SucceedingXMLHttpRequest);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useUploadImage (live mode) — crop persistence", () => {
  it("saves a non-identity crop after the upload PUT succeeds, without blocking the resolved result", async () => {
    const {
      useUploadImage: useUploadImageLive,
      wrapper,
      uploadsApi,
    } = await loadLive();
    const { result } = renderHook(() => useUploadImageLive("avatar"), {
      wrapper,
    });

    let resolved: UploadResult | undefined;
    await act(async () => {
      resolved = await result.current(testFile(), { crop: NON_IDENTITY_CROP });
    });

    expect(resolved?.key).toBe("avatars/test-key.webp");
    expect(resolved?.crop).toEqual(NON_IDENTITY_CROP);
    await waitFor(() =>
      expect(uploadsApi.saveCrop).toHaveBeenCalledWith(
        "avatars/test-key.webp",
        NON_IDENTITY_CROP,
      ),
    );
    expect(uploadsApi.saveCrop).toHaveBeenCalledTimes(1);
  });

  it("does not call saveCrop for the identity crop", async () => {
    const {
      useUploadImage: useUploadImageLive,
      wrapper,
      uploadsApi,
    } = await loadLive();
    const { result } = renderHook(() => useUploadImageLive("avatar"), {
      wrapper,
    });

    let resolved: UploadResult | undefined;
    await act(async () => {
      resolved = await result.current(testFile(), { crop: IDENTITY_CROP });
    });

    expect(resolved?.key).toBe("avatars/test-key.webp");
    expect(uploadsApi.saveCrop).not.toHaveBeenCalled();
  });

  it("does not call saveCrop when no crop option is passed at all", async () => {
    const {
      useUploadImage: useUploadImageLive,
      wrapper,
      uploadsApi,
    } = await loadLive();
    const { result } = renderHook(() => useUploadImageLive("avatar"), {
      wrapper,
    });

    await act(async () => {
      await result.current(testFile());
    });

    expect(uploadsApi.saveCrop).not.toHaveBeenCalled();
  });

  it("still resolves the upload even when saveCrop fails on both the first attempt and its one retry", async () => {
    const {
      useUploadImage: useUploadImageLive,
      wrapper,
      uploadsApi,
    } = await loadLive();
    vi.mocked(uploadsApi.saveCrop).mockRejectedValue(
      new Error("crop-save-down"),
    );
    const { result } = renderHook(() => useUploadImageLive("avatar"), {
      wrapper,
    });

    let resolved: UploadResult | undefined;
    await act(async () => {
      resolved = await result.current(testFile(), { crop: NON_IDENTITY_CROP });
    });

    // The crop-save failure never surfaces as a rejected upload.
    expect(resolved?.key).toBe("avatars/test-key.webp");
    expect(resolved?.previewUrl).toBeTruthy();
    // Initial attempt + exactly one retry, then swallowed.
    expect(uploadsApi.saveCrop).toHaveBeenCalledTimes(2);
  });
});

describe("useUploadImage (demo mode) — crop echo", () => {
  it("echoes a non-identity crop back and never touches the network", async () => {
    const { result } = renderHook(() => useUploadImage("avatar"), {
      wrapper: TestProviders,
    });

    let resolved: UploadResult | undefined;
    await act(async () => {
      resolved = await result.current(testFile(), { crop: NON_IDENTITY_CROP });
    });

    // Demo mode has no real storage key: key and previewUrl are the same
    // local object URL, and the crop is echoed straight back for the caller
    // to store alongside the preview.
    expect(resolved?.key).toBe(resolved?.previewUrl);
    expect(resolved?.crop).toEqual(NON_IDENTITY_CROP);
    expect(uploadsApiStatic.requestUpload).not.toHaveBeenCalled();
    expect(uploadsApiStatic.saveCrop).not.toHaveBeenCalled();
  });

  it("resolves with no crop when none was passed in", async () => {
    const { result } = renderHook(() => useUploadImage("avatar"), {
      wrapper: TestProviders,
    });

    let resolved: UploadResult | undefined;
    await act(async () => {
      resolved = await result.current(testFile());
    });

    expect(resolved?.crop).toBeUndefined();
  });
});
