import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { safeStorage } from "../../../shared/storage/safeStorage";
import {
  DEFAULT_STUDIO_PLAYBACK,
  type StudioPlaybackPreferencesDTO,
} from "../api/studio.types";
import { putStudioPlayback } from "../api/studioPlayback.api";
import { studioKeys } from "../api/studioQueryKeys";
import {
  readLegacyRecentlyPlayedOff,
  STUDIO_LISTENING_PREFERENCES_KEY,
} from "./studioPlayerPreferences";
import { useStudioListeningSwitchMigration } from "./useStudioListeningSwitchMigration";

const mocks: { row: StudioPlaybackPreferencesDTO | undefined } = vi.hoisted(
  () => ({ row: undefined }),
);

vi.mock("../api/studioPlayback.api", () => ({
  putStudioPlayback: vi.fn(),
}));
vi.mock("../api/useStudioPlaybackPreferences", () => ({
  useStudioPlaybackRow: () => mocks.row,
}));

function storeDevice(record: Record<string, boolean>) {
  safeStorage.set(STUDIO_LISTENING_PREFERENCES_KEY, JSON.stringify(record));
}

function renderMigration(setup: {
  row: StudioPlaybackPreferencesDTO | undefined;
  demoMode?: boolean;
  isEnabled?: boolean;
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  mocks.row = setup.row;
  renderHook(
    () =>
      useStudioListeningSwitchMigration({
        demoMode: setup.demoMode ?? false,
        isEnabled: setup.isEnabled ?? true,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    },
  );
  return queryClient;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  safeStorage.remove(STUDIO_LISTENING_PREFERENCES_KEY);
});

describe("useStudioListeningSwitchMigration", () => {
  it("pauses history with one PUT when this device had Recently played off, then drops the field", async () => {
    storeDevice({
      isRecentlyPlayedOn: false,
      shouldResumeAcrossSessions: true,
    });
    vi.mocked(putStudioPlayback).mockResolvedValue({
      ...DEFAULT_STUDIO_PLAYBACK,
      isListeningHistoryOn: false,
    });
    const queryClient = renderMigration({ row: DEFAULT_STUDIO_PLAYBACK });
    await waitFor(() =>
      expect(putStudioPlayback).toHaveBeenCalledWith({
        isListeningHistoryOn: false,
      }),
    );
    await waitFor(() => expect(readLegacyRecentlyPlayedOff()).toBe(false));
    expect(
      JSON.parse(safeStorage.get(STUDIO_LISTENING_PREFERENCES_KEY) ?? "null"),
    ).toEqual({
      shouldResumeAcrossSessions: true,
      areSingleKeyShortcutsOn: true,
    });
    expect(
      queryClient.getQueryData<StudioPlaybackPreferencesDTO>(
        studioKeys.playback(false),
      )?.isListeningHistoryOn,
    ).toBe(false);
    expect(putStudioPlayback).toHaveBeenCalledTimes(1);
  });

  it("drops the field without a PUT when the server is already paused, or the device had it on", async () => {
    storeDevice({ isRecentlyPlayedOn: false });
    renderMigration({
      row: { ...DEFAULT_STUDIO_PLAYBACK, isListeningHistoryOn: false },
    });
    await waitFor(() => expect(readLegacyRecentlyPlayedOff()).toBe(false));
    storeDevice({ isRecentlyPlayedOn: true });
    renderMigration({ row: DEFAULT_STUDIO_PLAYBACK });
    await waitFor(() =>
      expect(safeStorage.get(STUDIO_LISTENING_PREFERENCES_KEY)).not.toContain(
        "isRecentlyPlayedOn",
      ),
    );
    expect(putStudioPlayback).not.toHaveBeenCalled();
  });

  it("keeps the field after a failed PUT, for the next load", async () => {
    storeDevice({ isRecentlyPlayedOn: false });
    vi.mocked(putStudioPlayback).mockRejectedValue(
      new TypeError("Failed to fetch"),
    );
    renderMigration({ row: DEFAULT_STUDIO_PLAYBACK });
    await waitFor(() => expect(putStudioPlayback).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(readLegacyRecentlyPlayedOff()).toBe(true);
  });

  it("does nothing in demo, while disabled, or before the playback row loads", () => {
    storeDevice({ isRecentlyPlayedOn: false });
    renderMigration({ row: DEFAULT_STUDIO_PLAYBACK, demoMode: true });
    renderMigration({ row: DEFAULT_STUDIO_PLAYBACK, isEnabled: false });
    renderMigration({ row: undefined });
    expect(putStudioPlayback).not.toHaveBeenCalled();
    expect(readLegacyRecentlyPlayedOff()).toBe(true);
  });
});
