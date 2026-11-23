import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioReleaseView } from "../api/studio.adapters";
import { StudioAudioUploadError } from "../api/studioAudioUpload";
import { useEpisodeAudioAttach } from "./useEpisodeAudioAttach";

const confirmAudio = vi.fn();
const uploadStudioAudio =
  vi.fn<
    (options: unknown) => { promise: Promise<string>; abort: () => void }
  >();
const confirmStudioAudioUpload = vi.fn<(key: string) => Promise<string>>();

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../api/useStudioTrackMutations", () => ({
  useConfirmStudioTrackAudio: () => ({ mutateAsync: confirmAudio }),
}));
vi.mock("../api/studioAudioUpload", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/studioAudioUpload")>()),
  uploadStudioAudio: (options: unknown) => uploadStudioAudio(options),
  confirmStudioAudioUpload: (key: string) => confirmStudioAudioUpload(key),
}));

/** The two fields the hook reads off a release. */
const RELEASE = {
  id: "r1",
  artist: { id: "p1" },
} as unknown as StudioReleaseView;

const mp3 = () =>
  new File([new Uint8Array(16)], "Episode.mp3", { type: "audio/mpeg" });

const confirmRefusal = (status: number, code: string, key: string) =>
  new StudioAudioUploadError(
    "confirm",
    status,
    false,
    new ApiError(status, "refused", { code }),
    key,
  );

beforeEach(() => {
  confirmAudio.mockReset().mockResolvedValue({ id: "t1" });
  uploadStudioAudio.mockReset();
  confirmStudioAudioUpload
    .mockReset()
    .mockImplementation((key) => Promise.resolve(key));
});

// Open item A: a storage check that failed keeps the stored key, so Retry
// runs that check alone and never presigns or PUTs the file again.
describe("useEpisodeAudioAttach after a failed storage check", () => {
  it("retries the check on the stored key, then confirms the track audio", async () => {
    uploadStudioAudio.mockReturnValueOnce({
      promise: Promise.reject(
        confirmRefusal(503, "UPLOAD_CHECK_UNAVAILABLE", "key-1"),
      ),
      abort: vi.fn(),
    });
    const { result } = renderHook(() => useEpisodeAudioAttach(RELEASE, "t1"));
    await act(() => result.current.attach(mp3()));
    await waitFor(() => expect(result.current.retry).not.toBeNull());
    expect(result.current.lines).toEqual([
      "shared:apiError.uploadCheckUnavailable",
    ]);
    expect(confirmAudio).not.toHaveBeenCalled();
    act(() => result.current.retry?.());
    await waitFor(() => expect(confirmAudio).toHaveBeenCalled());
    expect(confirmStudioAudioUpload).toHaveBeenCalledWith("key-1");
    expect(uploadStudioAudio).toHaveBeenCalledTimes(1);
    expect(confirmAudio).toHaveBeenCalledWith({
      trackId: "t1",
      releaseId: "r1",
      key: "key-1",
    });
    await waitFor(() => expect(result.current.hasHeldFile).toBe(false));
  });

  it("uploads the file again when the check finds no stored object", async () => {
    uploadStudioAudio
      .mockReturnValueOnce({
        promise: Promise.reject(
          confirmRefusal(404, "UPLOAD_NOT_FOUND", "key-3"),
        ),
        abort: vi.fn(),
      })
      .mockReturnValueOnce({
        promise: Promise.resolve("key-4"),
        abort: vi.fn(),
      });
    const { result } = renderHook(() => useEpisodeAudioAttach(RELEASE, "t1"));
    await act(() => result.current.attach(mp3()));
    await waitFor(() => expect(result.current.retry).not.toBeNull());
    expect(result.current.lines).toEqual(["shared:apiError.uploadNotFound"]);
    act(() => result.current.retry?.());
    await waitFor(() => expect(confirmAudio).toHaveBeenCalled());
    expect(confirmStudioAudioUpload).not.toHaveBeenCalled();
    expect(uploadStudioAudio).toHaveBeenCalledTimes(2);
    expect(confirmAudio).toHaveBeenCalledWith({
      trackId: "t1",
      releaseId: "r1",
      key: "key-4",
    });
  });

  it("offers no Retry when the stored bytes are of another type", async () => {
    uploadStudioAudio.mockReturnValueOnce({
      promise: Promise.reject(
        confirmRefusal(422, "UPLOAD_CONTENT_MISMATCH", "key-2"),
      ),
      abort: vi.fn(),
    });
    const { result } = renderHook(() => useEpisodeAudioAttach(RELEASE, "t1"));
    await act(() => result.current.attach(mp3()));
    await waitFor(() =>
      expect(result.current.lines).toEqual([
        "shared:apiError.uploadContentMismatch",
      ]),
    );
    expect(result.current.retry).toBeNull();
    expect(confirmAudio).not.toHaveBeenCalled();
  });
});
