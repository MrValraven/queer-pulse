import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioReleaseView } from "./api/studio.adapters";
import {
  StudioEpisodeAudioAttach,
  StudioEpisodeAudioStep,
} from "./StudioEpisodeAudioStep";
import type {
  ConvertOptions,
  ConvertResult,
} from "./upload/convert/studioWavConverter";
import type { StudioTrackUploads, UploadRow } from "./useStudioTrackUploads";

const convertToMp3 =
  vi.fn<
    (
      file: File,
      maxBytes: number,
      options: ConvertOptions,
    ) => Promise<ConvertResult>
  >();
const uploadStudioAudio = vi.fn<
  (options: { file: File; contentType: string }) => {
    promise: Promise<string>;
    abort: () => void;
  }
>();
const confirmAudio = vi.fn();
const uploadsState = vi.hoisted(() => ({ rows: [] as UploadRow[] }));

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("./api/useStudioTrackMutations", () => ({
  useConfirmStudioTrackAudio: () => ({ mutateAsync: confirmAudio }),
}));
vi.mock("./api/studioAudioUpload", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/studioAudioUpload")>()),
  uploadStudioAudio: (options: { file: File; contentType: string }) =>
    uploadStudioAudio(options),
}));
vi.mock("./upload/convert/studioWavConverter", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./upload/convert/studioWavConverter")
  >()),
  convertToMp3: (file: File, maxBytes: number, options: ConvertOptions) =>
    convertToMp3(file, maxBytes, options),
}));
vi.mock("./useStudioTrackUploads", () => ({
  useStudioTrackUploads: (): StudioTrackUploads => ({
    rows: uploadsState.rows,
    rejections: [],
    addFiles: vi.fn(),
    retry: vi.fn(),
    retryAll: vi.fn(),
    cancel: vi.fn(),
    attachAudio: vi.fn(),
    remove: vi.fn(),
    move: vi.fn(),
    moveTo: vi.fn(),
    rename: vi.fn(),
    canReorder: false,
    hasPendingUploads: uploadsState.rows.length > 0,
    hasActiveUploads: uploadsState.rows.length > 0,
    hasHeldFiles: false,
    orderErrorKey: null,
  }),
}));

const RELEASE = {
  id: "r1",
  artist: { id: "p1" },
} as unknown as StudioReleaseView;
const CONVERTING_ROW: UploadRow = {
  localId: "u1",
  trackId: null,
  title: "Interview",
  fileName: "Interview.wav",
  stage: "converting",
  progress: 40,
  errorKey: null,
  durationLabel: null,
  isRetryable: true,
};

function deferred<Value>() {
  let resolve: (value: Value) => void = () => undefined;
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const pickFile = (file: File) =>
  fireEvent.change(screen.getByLabelText("studio:episodeUpload.chooseFile"), {
    target: { files: [file] },
  });

beforeEach(() => {
  [convertToMp3, uploadStudioAudio, confirmAudio].forEach((mock) =>
    mock.mockReset(),
  );
  uploadsState.rows = [];
});

describe("a new episode while its WAV converts", () => {
  it("shows the converting line, its percent and the tab hint", () => {
    uploadsState.rows = [CONVERTING_ROW];
    render(<StudioEpisodeAudioStep release={RELEASE} onReady={vi.fn()} />);
    expect(
      screen.getByText(
        'studio:episodeUpload.converting {"fileName":"Interview.wav","percent":80}',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", {
        name: 'studio:episodeUpload.convertingLabel {"fileName":"Interview.wav"}',
      }),
    ).toHaveAttribute("value", "40");
    expect(
      screen.getByText("studio:uploadFlow.files.convertingHint"),
    ).toBeInTheDocument();
  });

  it("says how long a file may run when it is too long", () => {
    uploadsState.rows = [
      {
        ...CONVERTING_ROW,
        stage: "failed",
        errorKey: "studio:uploadFlow.files.errorTooLong",
        errorValues: { maxMinutes: 265 },
        isRetryable: false,
      },
    ];
    render(<StudioEpisodeAudioStep release={RELEASE} onReady={vi.fn()} />);
    expect(
      screen.getByText(
        'studio:uploadFlow.files.errorTooLong {"maxMinutes":265}',
      ),
    ).toBeInTheDocument();
  });
});

describe("attaching a WAV to an episode without audio", () => {
  it("converts at the podcast cap, then uploads the MP3", async () => {
    const conversion = deferred<ConvertResult>();
    convertToMp3.mockImplementation((_file, _maxBytes, options) => {
      options.onProgress(0.4);
      return conversion.promise;
    });
    uploadStudioAudio.mockReturnValue({
      promise: new Promise<string>(() => undefined),
      abort: vi.fn(),
    });
    render(<StudioEpisodeAudioAttach release={RELEASE} trackId="t1" />);
    const source = new File([new Uint8Array(64)], "Interview.wav", {
      type: "audio/wav",
    });
    pickFile(source);
    expect(
      await screen.findByText(
        'studio:episodeUpload.converting {"fileName":"Interview.wav","percent":40}',
      ),
    ).toBeInTheDocument();
    expect(convertToMp3).toHaveBeenCalledWith(
      source,
      262144000,
      expect.anything(),
    );
    const converted = new File([new Uint8Array(8)], "Interview.mp3", {
      type: "audio/mpeg",
    });
    act(() => conversion.resolve({ ok: true, file: converted, bitrate: 320 }));
    expect(
      await screen.findByText(
        'studio:episodeUpload.uploading {"fileName":"Interview.wav"}',
      ),
    ).toBeInTheDocument();
    expect(uploadStudioAudio).toHaveBeenCalledWith(
      expect.objectContaining({ file: converted, contentType: "audio/mpeg" }),
    );
  });

  it("refuses a file too long for the cap with the minutes line", async () => {
    convertToMp3.mockResolvedValue({
      ok: false,
      reason: "tooLong",
      maxMinutes: 265,
    });
    render(<StudioEpisodeAudioAttach release={RELEASE} trackId="t1" />);
    pickFile(new File([new Uint8Array(64)], "Long.wav", { type: "audio/wav" }));
    expect(
      await screen.findByText(
        'studio:uploadFlow.files.errorTooLong {"maxMinutes":265}',
      ),
    ).toBeInTheDocument();
    expect(uploadStudioAudio).not.toHaveBeenCalled();
  });

  it("stops the conversion when the form goes away", async () => {
    convertToMp3.mockImplementation((_file, _maxBytes, options) => {
      options.onProgress(0);
      return new Promise<ConvertResult>(() => undefined);
    });
    const { unmount } = render(
      <StudioEpisodeAudioAttach release={RELEASE} trackId="t1" />,
    );
    pickFile(
      new File([new Uint8Array(64)], "Interview.wav", { type: "audio/wav" }),
    );
    await screen.findByText(
      'studio:episodeUpload.converting {"fileName":"Interview.wav","percent":0}',
    );
    unmount();
    expect(convertToMp3.mock.calls[0]?.[2].signal.aborted).toBe(true);
  });
});
