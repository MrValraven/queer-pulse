import { afterEach, describe, expect, it, vi } from "vitest";
import type { PcmHeader, PcmHeaderResult } from "./studioPcmHeader";
import { wavBytes } from "./studioPcmTestFiles";
import type {
  WavConversionRequest,
  WavConversionResponse,
} from "./studioWavConversionProtocol";
import {
  conversionTimeoutMs,
  createWavConverter,
  isConvertibleAudio,
  type ConvertOptions,
  type ConvertResult,
  type WavConversionWorkerPort,
} from "./studioWavConverter";

const MUSIC_CAP = 52428800;

const HEADER: PcmHeader = {
  container: "wav",
  channels: 2,
  sampleRate: 44100,
  bitsPerSample: 16,
  isFloat: false,
  isLittleEndian: true,
  dataOffset: 44,
  dataBytes: 10584000,
  durationSeconds: 60,
  hasUnreliableSizes: false,
};

type Listener = (event: { data?: WavConversionResponse }) => void;

class FakeWorker {
  readonly posted: WavConversionRequest[] = [];
  isTerminated = false;
  private readonly listeners = new Map<string, Listener[]>();
  postMessage(message: WavConversionRequest) {
    this.posted.push(message);
  }
  addEventListener(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  terminate() {
    this.isTerminated = true;
  }
  reply(response: WavConversionResponse) {
    this.listeners
      .get("message")
      ?.forEach((listener) => listener({ data: response }));
  }
  failToLoad() {
    this.listeners.get("error")?.forEach((listener) => listener({}));
  }
}

function converterWith(header: PcmHeader | null = HEADER) {
  const workers: FakeWorker[] = [];
  const converter = createWavConverter({
    createWorker: () => {
      const worker = new FakeWorker();
      workers.push(worker);
      return worker as unknown as WavConversionWorkerPort;
    },
    ...(header
      ? {
          readHeader: () =>
            Promise.resolve<PcmHeaderResult>({ ok: true, header }),
        }
      : {}),
  });
  return { converter, workers };
}

const fileNamed = (name: string) =>
  new File([new Uint8Array(8)], name, { type: "audio/wav" });
const optionsWith = (controller = new AbortController()): ConvertOptions => ({
  onProgress: vi.fn<(progress: number) => void>(),
  signal: controller.signal,
});
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
/** Lets the injected header resolve and the job start, without touching timers. */
async function flushMicrotasks() {
  for (let round = 0; round < 10; round += 1) await Promise.resolve();
}

function track(promise: Promise<ConvertResult>) {
  const state: { result: ConvertResult | null } = { result: null };
  void promise.then((result) => {
    state.result = result;
  });
  return state;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("isConvertibleAudio", () => {
  it("knows WAV and AIFF by extension, even with an empty or generic type", () => {
    const cases: [string, string][] = [
      ["take.wav", "audio/wav"],
      ["take.WAV", ""],
      ["take.wave", ""],
      ["mix.aif", "application/octet-stream"],
      ["mix.aiff", ""],
      ["demo.aifc", ""],
      ["noext", "audio/vnd.wave"],
      ["noext", "audio/x-aiff"],
    ];
    for (const [name, type] of cases)
      expect(isConvertibleAudio(new File([], name, { type }))).toBe(true);
  });

  it("leaves MP3, M4A, FLAC and a bare name alone", () => {
    const cases: [string, string][] = [
      ["a.mp3", "audio/mpeg"],
      ["a.m4a", ""],
      ["a.flac", "audio/flac"],
      ["wav", ""],
    ];
    for (const [name, type] of cases)
      expect(isConvertibleAudio(new File([], name, { type }))).toBe(false);
  });
});

describe("convert, before any worker", () => {
  it("refuses bytes it cannot read straight away", async () => {
    const workers: FakeWorker[] = [];
    const converter = createWavConverter({
      createWorker: () => {
        const worker = new FakeWorker();
        workers.push(worker);
        return worker as unknown as WavConversionWorkerPort;
      },
    });
    const result = await converter.convert(
      new File([new Uint8Array(100)], "take.wav"),
      MUSIC_CAP,
      optionsWith(),
    );
    expect(result).toEqual({ ok: false, reason: "unsupported" });
    expect(workers).toHaveLength(0);
  });

  it("refuses a file too long for the cap straight away, with the minutes", async () => {
    const { converter, workers } = converterWith({
      ...HEADER,
      durationSeconds: 3600,
    });
    expect(
      await converter.convert(fileNamed("set.wav"), MUSIC_CAP, optionsWith()),
    ).toEqual({
      ok: false,
      reason: "tooLong",
      maxMinutes: 53,
    });
    expect(workers).toHaveLength(0);
  });

  it("sends a real WAV to the worker with its header and bitrate", async () => {
    const workers: FakeWorker[] = [];
    const converter = createWavConverter({
      createWorker: () => {
        const worker = new FakeWorker();
        workers.push(worker);
        return worker as unknown as WavConversionWorkerPort;
      },
    });
    const file = new File(
      [
        wavBytes({
          channels: 2,
          sampleRate: 44100,
          bitsPerSample: 16,
          frames: 4410,
        }),
      ],
      "take.wav",
    );
    void converter.convert(file, MUSIC_CAP, optionsWith());
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    expect(workers[0]?.posted[0]).toMatchObject({
      type: "convert",
      file,
      bitrateKbps: 320,
      header: { container: "wav", sampleRate: 44100, dataBytes: 17640 },
    });
  });

  it("never settles and starts no worker when aborted before the header comes back", async () => {
    const { converter, workers } = converterWith();
    const controller = new AbortController();
    const state = track(
      converter.convert(fileNamed("a.wav"), MUSIC_CAP, optionsWith(controller)),
    );
    controller.abort();
    await tick();
    expect(state.result).toBeNull();
    expect(workers).toHaveLength(0);
  });
});

describe("convert, one job at a time", () => {
  it("runs one worker at a time, reports progress and names the MP3", async () => {
    const { converter, workers } = converterWith();
    const firstOptions = optionsWith();
    const secondOptions = optionsWith();
    const first = converter.convert(
      fileNamed("Take 3.wav"),
      MUSIC_CAP,
      firstOptions,
    );
    void converter.convert(fileNamed("Take 4.aiff"), MUSIC_CAP, secondOptions);
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    expect(firstOptions.onProgress).toHaveBeenCalledWith(0);
    expect(secondOptions.onProgress).not.toHaveBeenCalled();
    workers[0]?.reply({ type: "progress", progress: 0.5 });
    expect(firstOptions.onProgress).toHaveBeenLastCalledWith(0.5);
    workers[0]?.reply({ type: "done", buffer: new ArrayBuffer(1000) });
    const result = await first;
    expect(
      result.ok && [
        result.file.name,
        result.file.type,
        result.file.size,
        result.bitrate,
      ],
    ).toEqual(["Take 3.mp3", "audio/mpeg", 1000, 320]);
    expect(workers[0]?.isTerminated).toBe(true);
    await vi.waitFor(() => expect(workers).toHaveLength(2));
    expect(secondOptions.onProgress).toHaveBeenCalledWith(0);
  });

  it("fails a worker that cannot load at once, and the next job starts", async () => {
    const { converter, workers } = converterWith();
    const first = converter.convert(
      fileNamed("a.wav"),
      MUSIC_CAP,
      optionsWith(),
    );
    void converter.convert(fileNamed("b.wav"), MUSIC_CAP, optionsWith());
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    workers[0]?.failToLoad();
    expect(await first).toEqual({ ok: false, reason: "failed" });
    expect(workers[0]?.isTerminated).toBe(true);
    await vi.waitFor(() => expect(workers).toHaveLength(2));
  });

  it("fails on an error message from the worker", async () => {
    const { converter, workers } = converterWith();
    const first = converter.convert(
      fileNamed("a.wav"),
      MUSIC_CAP,
      optionsWith(),
    );
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    workers[0]?.reply({ type: "error", message: "decoder broke" });
    expect(await first).toEqual({ ok: false, reason: "failed" });
  });

  it("refuses an MP3 that came out bigger than the cap", async () => {
    const { converter, workers } = converterWith();
    const first = converter.convert(
      fileNamed("a.wav"),
      MUSIC_CAP,
      optionsWith(),
    );
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    workers[0]?.reply({ type: "done", buffer: new ArrayBuffer(MUSIC_CAP + 1) });
    expect(await first).toEqual({
      ok: false,
      reason: "tooLong",
      maxMinutes: 53,
    });
  });
});

describe("convert, stopping", () => {
  it("stops a silent worker at the deadline", async () => {
    vi.useFakeTimers();
    const { converter, workers } = converterWith();
    const state = track(
      converter.convert(fileNamed("a.wav"), MUSIC_CAP, optionsWith()),
    );
    await flushMicrotasks();
    expect(workers).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(conversionTimeoutMs(60) - 1);
    expect(state.result).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(state.result).toEqual({ ok: false, reason: "failed" });
    expect(workers[0]?.isTerminated).toBe(true);
  });

  it("stops the running job on abort, settles nothing and moves on", async () => {
    const { converter, workers } = converterWith();
    const controller = new AbortController();
    const state = track(
      converter.convert(fileNamed("a.wav"), MUSIC_CAP, optionsWith(controller)),
    );
    void converter.convert(fileNamed("b.wav"), MUSIC_CAP, optionsWith());
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    controller.abort();
    expect(workers[0]?.isTerminated).toBe(true);
    await vi.waitFor(() => expect(workers).toHaveLength(2));
    await tick();
    expect(state.result).toBeNull();
  });

  it("drops a queued job on abort without ever starting its worker", async () => {
    const { converter, workers } = converterWith();
    const queuedController = new AbortController();
    void converter.convert(fileNamed("a.wav"), MUSIC_CAP, optionsWith());
    const queued = track(
      converter.convert(
        fileNamed("b.wav"),
        MUSIC_CAP,
        optionsWith(queuedController),
      ),
    );
    const third = fileNamed("c.wav");
    void converter.convert(third, MUSIC_CAP, optionsWith());
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    queuedController.abort();
    workers[0]?.reply({ type: "done", buffer: new ArrayBuffer(10) });
    await vi.waitFor(() => expect(workers).toHaveLength(2));
    expect(workers[1]?.posted[0]?.file).toBe(third);
    await tick();
    expect(queued.result).toBeNull();
  });
});
