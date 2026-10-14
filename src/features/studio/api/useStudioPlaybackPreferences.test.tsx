import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioPlaybackPreferencesDTO } from "./studio.types";
import { resetDemoPlayback } from "./studioDemoPlayback";
import {
  useStudioHideExplicit,
  useStudioPlaybackPreferences,
} from "./useStudioPlaybackPreferences";

const mode = vi.hoisted(() => ({ demoMode: false, hasAccess: true }));
const showToast = vi.hoisted(() => vi.fn());
const getStudioPlayback = vi.hoisted(() =>
  vi.fn<() => Promise<StudioPlaybackPreferencesDTO>>(),
);
const putStudioPlayback = vi.hoisted(() =>
  vi.fn<
    (
      patch: Partial<StudioPlaybackPreferencesDTO>,
    ) => Promise<StudioPlaybackPreferencesDTO>
  >(),
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mode.demoMode }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: mode.hasAccess ? "granted" : "denied",
    hasAccess: mode.hasAccess,
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
vi.mock("./studioPlayback.api", () => ({
  getStudioPlayback: () => getStudioPlayback(),
  putStudioPlayback: (patch: Partial<StudioPlaybackPreferencesDTO>) =>
    putStudioPlayback(patch),
}));

const STORED: StudioPlaybackPreferencesDTO = {
  autoplayNext: true,
  hideExplicit: false,
  crossfadeSeconds: 4,
};

function wrapperFor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  mode.demoMode = false;
  mode.hasAccess = true;
  showToast.mockClear();
  getStudioPlayback.mockReset();
  putStudioPlayback.mockReset();
  getStudioPlayback.mockResolvedValue(STORED);
  resetDemoPlayback();
});

describe("useStudioPlaybackPreferences (live)", () => {
  it("reads the stored row", async () => {
    const { result } = renderHook(() => useStudioPlaybackPreferences(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() =>
      expect(result.current.preferences.crossfadeSeconds).toBe(4),
    );
    expect(getStudioPlayback).toHaveBeenCalledTimes(1);
  });

  it("moves the control at once and keeps the server's answer", async () => {
    let resolvePut: (row: StudioPlaybackPreferencesDTO) => void = () => {};
    putStudioPlayback.mockImplementation(
      () => new Promise((resolve) => (resolvePut = resolve)),
    );
    const { result } = renderHook(() => useStudioPlaybackPreferences(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.savePreferences({ autoplayNext: false }));
    await waitFor(() =>
      expect(result.current.preferences.autoplayNext).toBe(false),
    );
    expect(putStudioPlayback).toHaveBeenCalledWith({ autoplayNext: false });
    await act(async () => {
      resolvePut({ ...STORED, autoplayNext: false });
      await Promise.resolve();
    });
    expect(result.current.preferences).toEqual({
      ...STORED,
      autoplayNext: false,
    });
    expect(showToast).not.toHaveBeenCalled();
  });

  it("rolls a refused save back, says so once and re-reads the stored row", async () => {
    putStudioPlayback.mockRejectedValue(new ApiError(500, "boom"));
    const { result } = renderHook(() => useStudioPlaybackPreferences(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.savePreferences({ hideExplicit: true }));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        "studio:settingsLive.saveError",
        "error",
      ),
    );
    expect(result.current.preferences.hideExplicit).toBe(false);
    await waitFor(() => expect(getStudioPlayback).toHaveBeenCalledTimes(2));
    expect(showToast).toHaveBeenCalledTimes(1);
  });

  it("settles two quick changes on what the server holds when the first fails", async () => {
    putStudioPlayback
      .mockRejectedValueOnce(new ApiError(500, "boom"))
      .mockResolvedValueOnce({ ...STORED, crossfadeSeconds: 8 });
    getStudioPlayback
      .mockResolvedValueOnce(STORED)
      .mockResolvedValue({ ...STORED, crossfadeSeconds: 8 });
    const { result } = renderHook(() => useStudioPlaybackPreferences(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => {
      result.current.savePreferences({ autoplayNext: false });
      result.current.savePreferences({ crossfadeSeconds: 8 });
    });
    await waitFor(() =>
      expect(result.current.preferences).toEqual({
        ...STORED,
        crossfadeSeconds: 8,
      }),
    );
  });

  it("asks nothing without a Studio grant and answers the defaults", () => {
    mode.hasAccess = false;
    const { result } = renderHook(() => useStudioHideExplicit(), {
      wrapper: wrapperFor(),
    });
    expect(result.current).toBe(false);
    expect(getStudioPlayback).not.toHaveBeenCalled();
  });
});

describe("useStudioPlaybackPreferences (demo)", () => {
  it("reads and writes the demo store with no network", async () => {
    mode.demoMode = true;
    const wrapper = wrapperFor();
    const { result } = renderHook(
      () => ({
        settings: useStudioPlaybackPreferences(),
        isHidden: useStudioHideExplicit(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.settings.preferences.autoplayNext).toBe(true),
    );
    act(() => result.current.settings.savePreferences({ hideExplicit: true }));
    await waitFor(() => expect(result.current.isHidden).toBe(true));
    expect(getStudioPlayback).not.toHaveBeenCalled();
    expect(putStudioPlayback).not.toHaveBeenCalled();
  });
});

describe("useStudioPlaybackPreferences load failure", () => {
  it("reports isError with the defaults and retries through refetch", async () => {
    getStudioPlayback.mockRejectedValueOnce(new ApiError(500, "boom"));
    const { result } = renderHook(() => useStudioPlaybackPreferences(), {
      wrapper: wrapperFor(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.preferences.autoplayNext).toBe(true);
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(getStudioPlayback).toHaveBeenCalledTimes(2);
  });
});
