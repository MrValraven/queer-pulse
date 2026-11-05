import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { vjKeys } from "../api/vjKeys";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjClips,
  demoGetVjPackClips,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { useVjClipUploads } from "./useVjClipUploads";
import { VjUploadFailure } from "./vjUploadFailure";

vi.mock("./vjDecode", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./vjDecode")>()),
  decodeVjClip: vi.fn(() =>
    Promise.resolve({
      width: 320,
      height: 180,
      durationMs: null,
      frame: {} as CanvasImageSource,
      release: () => undefined,
    }),
  ),
}));
vi.mock("./vjThumbnail", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./vjThumbnail")>()),
  drawVjThumbnail: vi.fn(() =>
    Promise.resolve(new Blob(["webp"], { type: "image/webp" })),
  ),
}));

const CLOSING_PACK_ID = "00000000-0000-4000-8000-0000000000a3";
const UPLOAD_TIMEOUT = { timeout: 4000 };

function asciiBytes(text: string): number[] {
  return Array.from(text, (letter) => letter.charCodeAt(0));
}

/** A valid 1x1 GIF89a, so the real GIF clean runs over it. */
const TINY_GIF_BYTES = [
  ...asciiBytes("GIF89a"),
  0x01,
  0x00,
  0x01,
  0x00,
  0x80,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xff,
  0xff,
  0x2c,
  0x00,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x01,
  0x00,
  0x00,
  0x02,
  0x02,
  0x44,
  0x01,
  0x00,
  0x3b,
];
const MOV_BYTES = [0, 0, 0, 0x14, ...asciiBytes("ftypqt  "), 0, 0, 0, 0];

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:vj-test"),
  });
  configureVjDemoStore({
    storage: createMemoryStorage(),
    channel: createVjDemoChannelHub().open(),
  });
  resetVjDemoLibrary();
});

afterEach(() => {
  if (originalCreateObjectUrl) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
});

describe("useVjClipUploads", () => {
  it("adds a GIF to the chosen pack", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    const gifFile = new File(
      [new Uint8Array(TINY_GIF_BYTES)],
      "Sunset loop.gif",
    );
    act(() => {
      result.current.addFiles([gifFile], CLOSING_PACK_ID);
    });
    expect(result.current.isBusy).toBe(true);
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("done"),
      UPLOAD_TIMEOUT,
    );
    expect(result.current.isBusy).toBe(false);
    const closingClips = demoGetVjPackClips(CLOSING_PACK_ID).items;
    const addedClip = closingClips[closingClips.length - 1];
    expect(addedClip?.title).toBe("Sunset loop");
    expect(addedClip?.durationMs).toBeNull();
    expect(addedClip?.byteSize).toBe(TINY_GIF_BYTES.length);
    expect(result.current.rows[0]?.clipId).toBe(addedClip?.id);
  });

  it("fails a MOV row and finishes the GIF row beside it", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    const movFile = new File([new Uint8Array(MOV_BYTES)], "phone.mov");
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "Dots.gif");
    act(() => {
      result.current.addFiles([movFile, gifFile], null);
    });
    await waitFor(
      () => expect(result.current.rows[1]?.stage).toBe("done"),
      UPLOAD_TIMEOUT,
    );
    const movRow = result.current.rows[0];
    expect(movRow?.stage).toBe("failed");
    expect(movRow?.failure).toBeInstanceOf(VjUploadFailure);
    expect((movRow?.failure as VjUploadFailure).code).toBe(
      "VJ_UPLOAD_FORMAT_MOV",
    );
    expect(result.current.rows[1]?.failure).toBeNull();
  });

  it("fails a file past the pack cap before any request", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const fullPack = {
      id: CLOSING_PACK_ID,
      name: "Closing",
      position: 0,
      clipCount: 200,
      totalByteSize: 0,
      coverThumbnailUrl: null,
      createdBy: null,
      createdAt: "2026-11-05T00:00:00.000Z",
      updatedAt: "2026-11-05T00:00:00.000Z",
    } satisfies VjPackDTO;
    queryClient.setQueryData(vjKeys.packs(true), [fullPack]);
    queryClient.setQueryData(vjKeys.clips(true), []);
    const { result } = renderHook(() => useVjClipUploads(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestProviders queryClient={queryClient}>{children}</TestProviders>
      ),
    });
    const clipCountBefore = demoGetVjPackClips(CLOSING_PACK_ID).items.length;
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "Extra.gif");
    act(() => {
      result.current.addFiles([gifFile], CLOSING_PACK_ID);
    });
    const row = result.current.rows[0];
    expect(row?.stage).toBe("failed");
    expect((row?.failure as VjUploadFailure).code).toBe("VJ_PACK_FULL");
    expect(result.current.isBusy).toBe(false);
    expect(demoGetVjPackClips(CLOSING_PACK_ID).items).toHaveLength(
      clipCountBefore,
    );
  });

  it("cancels a row while it uploads", async () => {
    const { result } = renderHook(() => useVjClipUploads(), { wrapper });
    const gifFile = new File([new Uint8Array(TINY_GIF_BYTES)], "Halt.gif");
    act(() => {
      result.current.addFiles([gifFile], null);
    });
    await waitFor(
      () => expect(result.current.rows[0]?.stage).toBe("uploading"),
      UPLOAD_TIMEOUT,
    );
    const rowId = result.current.rows[0]?.rowId ?? "";
    act(() => {
      result.current.cancel(rowId);
    });
    expect(result.current.rows[0]?.stage).toBe("cancelled");
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(result.current.rows[0]?.stage).toBe("cancelled");
    expect(demoGetVjClips().items.some((clip) => clip.title === "Halt")).toBe(
      false,
    );
  });
});
