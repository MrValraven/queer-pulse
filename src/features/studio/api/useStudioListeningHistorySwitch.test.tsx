import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type {
  StudioPlaybackPreferencesDTO,
  StudioPlaybackUpdateDTO,
} from "./studio.types";
import {
  demoGetStudioPlayback,
  demoPutStudioPlayback,
  resetDemoPlayback,
} from "./studioDemoPlayback";
import { useStudioListeningHistorySwitch } from "./useStudioListeningHistorySwitch";
import { useStudioPlaybackRow } from "./useStudioPlaybackPreferences";

const clearStudioRecentlyPlayed = vi.hoisted(() => vi.fn<() => void>());
const showToast = vi.hoisted(() => vi.fn());
const mode: { demoMode: boolean } = vi.hoisted(() => ({ demoMode: true }));
const getStudioPlayback = vi.hoisted(() =>
  vi.fn<() => Promise<StudioPlaybackPreferencesDTO>>(),
);
const putStudioPlayback = vi.hoisted(() =>
  vi.fn<
    (patch: StudioPlaybackUpdateDTO) => Promise<StudioPlaybackPreferencesDTO>
  >(),
);

vi.mock("../player/studioListeningMemory", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../player/studioListeningMemory")>();
  return {
    ...original,
    clearStudioRecentlyPlayed: () => {
      clearStudioRecentlyPlayed();
      original.clearStudioRecentlyPlayed();
    },
  };
});
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mode.demoMode }),
}));
vi.mock("./studioPlayback.api", () => ({
  getStudioPlayback: () => getStudioPlayback(),
  putStudioPlayback: (patch: StudioPlaybackUpdateDTO) =>
    putStudioPlayback(patch),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [],
  }),
}));
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function wrapperFor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  mode.demoMode = true;
  getStudioPlayback.mockReset();
  putStudioPlayback.mockReset();
  resetDemoPlayback();
  clearStudioRecentlyPlayed.mockClear();
  showToast.mockClear();
});

describe("useStudioListeningHistorySwitch (demo)", () => {
  it("reads on by default and pauses with one save, emptying this device's list", async () => {
    const { result } = renderHook(() => useStudioListeningHistorySwitch(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() => expect(result.current.isAwaitingRow).toBe(false));
    expect(result.current.isOn).toBe(true);
    act(() => result.current.setOn(false));
    await waitFor(() => expect(result.current.isOn).toBe(false));
    expect(clearStudioRecentlyPlayed).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(demoGetStudioPlayback().isListeningHistoryOn).toBe(false),
    );
    expect(showToast).not.toHaveBeenCalled();
  });

  it("turns history back on and leaves the device list alone", async () => {
    demoPutStudioPlayback({ isListeningHistoryOn: false });
    const { result } = renderHook(() => useStudioListeningHistorySwitch(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() => expect(result.current.isOn).toBe(false));
    act(() => result.current.setOn(true));
    await waitFor(() => expect(result.current.isOn).toBe(true));
    expect(clearStudioRecentlyPlayed).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(demoGetStudioPlayback().isListeningHistoryOn).toBe(true),
    );
  });
});

/** The switch and the raw cached row, read from one cache. */
function useSwitchAndRow() {
  return {
    historySwitch: useStudioListeningHistorySwitch(),
    row: useStudioPlaybackRow(),
  };
}

describe("useStudioListeningHistorySwitch (live, no row loaded)", () => {
  it("writes no made-up row while the first read is still pending", async () => {
    mode.demoMode = false;
    getStudioPlayback.mockReturnValue(new Promise(() => {}));
    putStudioPlayback.mockRejectedValue(new ApiError(500, "boom"));
    const { result } = renderHook(() => useSwitchAndRow(), {
      wrapper: wrapperFor(),
    });
    expect(result.current.historySwitch.isAwaitingRow).toBe(true);
    act(() => result.current.historySwitch.setOn(false));
    expect(result.current.row).toBeUndefined();
    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1));
    expect(putStudioPlayback).toHaveBeenCalledWith({
      isListeningHistoryOn: false,
    });
    expect(result.current.row).toBeUndefined();
    expect(result.current.historySwitch.isAwaitingRow).toBe(true);
  });

  it("keeps the load error and creates no row when a save fails after a failed read", async () => {
    mode.demoMode = false;
    getStudioPlayback.mockRejectedValue(new ApiError(500, "boom"));
    putStudioPlayback.mockRejectedValue(new ApiError(500, "boom"));
    const { result } = renderHook(() => useSwitchAndRow(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() =>
      expect(result.current.historySwitch.loadState.isError).toBe(true),
    );
    act(() => result.current.historySwitch.setOn(false));
    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1));
    expect(clearStudioRecentlyPlayed).toHaveBeenCalledTimes(1);
    expect(result.current.row).toBeUndefined();
    await waitFor(() => expect(getStudioPlayback).toHaveBeenCalledTimes(2));
    expect(result.current.row).toBeUndefined();
    expect(result.current.historySwitch.loadState.isError).toBe(true);
    expect(result.current.historySwitch.isAwaitingRow).toBe(true);
  });
});
