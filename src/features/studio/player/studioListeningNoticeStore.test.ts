import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_STUDIO_PLAYBACK,
  type StudioPlaybackPreferencesDTO,
} from "../api/studio.types";
import { putStudioPlayback } from "../api/studioPlayback.api";
import { studioKeys } from "../api/studioQueryKeys";
import {
  dismissStudioListeningNotice,
  maybeShowStudioListeningNotice,
  readStudioListeningNotice,
  resetStudioListeningNoticeForTests,
  subscribeStudioListeningNotice,
} from "./studioListeningNoticeStore";

vi.mock("../api/studioPlayback.api", () => ({
  putStudioPlayback: vi.fn(() => Promise.resolve(DEFAULT_STUDIO_PLAYBACK)),
}));

function clientWith(row: StudioPlaybackPreferencesDTO | undefined) {
  const client = new QueryClient();
  if (row !== undefined) client.setQueryData(studioKeys.playback(false), row);
  return client;
}

beforeEach(() => {
  resetStudioListeningNoticeForTests();
  vi.clearAllMocks();
});

describe("studioListeningNoticeStore", () => {
  it("shows once for a loaded row that is on and unstamped, then stamps it", () => {
    const client = clientWith({
      ...DEFAULT_STUDIO_PLAYBACK,
      listeningNoticeSeenAt: null,
    });
    maybeShowStudioListeningNotice(client, false);
    expect(readStudioListeningNotice()).toBe(true);
    expect(
      client.getQueryData<StudioPlaybackPreferencesDTO>(
        studioKeys.playback(false),
      )?.listeningNoticeSeenAt,
    ).toMatch(/\.\d{3}Z$/);
    expect(putStudioPlayback).toHaveBeenCalledWith({
      hasSeenListeningNotice: true,
    });
    dismissStudioListeningNotice();
    maybeShowStudioListeningNotice(client, false);
    expect(readStudioListeningNotice()).toBe(false);
    expect(putStudioPlayback).toHaveBeenCalledTimes(1);
  });

  it("shows nothing for a paused row, a stamped row, a row without the field, or no row", () => {
    const rows: (StudioPlaybackPreferencesDTO | undefined)[] = [
      {
        ...DEFAULT_STUDIO_PLAYBACK,
        isListeningHistoryOn: false,
        listeningNoticeSeenAt: null,
      },
      {
        ...DEFAULT_STUDIO_PLAYBACK,
        listeningNoticeSeenAt: "2026-10-20T10:00:00.000Z",
      },
      { autoplayNext: true, hideExplicit: false, crossfadeSeconds: 0 },
      undefined,
    ];
    for (const row of rows) {
      maybeShowStudioListeningNotice(clientWith(row), false);
      expect(readStudioListeningNotice()).toBe(false);
    }
    expect(putStudioPlayback).not.toHaveBeenCalled();
  });

  it("keeps the stamp on screen when the save fails, so this session shows it once", async () => {
    vi.mocked(putStudioPlayback).mockRejectedValueOnce(
      new TypeError("Failed to fetch"),
    );
    const client = clientWith({
      ...DEFAULT_STUDIO_PLAYBACK,
      listeningNoticeSeenAt: null,
    });
    maybeShowStudioListeningNotice(client, false);
    await Promise.resolve();
    expect(
      client.getQueryData<StudioPlaybackPreferencesDTO>(
        studioKeys.playback(false),
      )?.listeningNoticeSeenAt,
    ).not.toBeNull();
    dismissStudioListeningNotice();
    client.setQueryData(studioKeys.playback(false), {
      ...DEFAULT_STUDIO_PLAYBACK,
      listeningNoticeSeenAt: null,
    });
    maybeShowStudioListeningNotice(client, false);
    expect(readStudioListeningNotice()).toBe(false);
  });

  it("tells each subscriber when the notice shows and when it is dismissed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeStudioListeningNotice(listener);
    maybeShowStudioListeningNotice(
      clientWith({ ...DEFAULT_STUDIO_PLAYBACK, listeningNoticeSeenAt: null }),
      false,
    );
    dismissStudioListeningNotice();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
