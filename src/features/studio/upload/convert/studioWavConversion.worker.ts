import { registerMp3Encoder } from "@mediabunny/mp3-encoder";
import {
  BlobSource,
  BufferTarget,
  Conversion,
  CustomSource,
  Input,
  Mp3OutputFormat,
  Output,
  Quality,
  WAVE,
  type Source,
} from "mediabunny";
import {
  createCanonicalWaveReader,
  needsCanonicalWave,
} from "./studioAiffAsWave";
import { mp3TargetFor } from "./studioMp3Bitrate";
import type {
  WavConversionRequest,
  WavConversionResponse,
} from "./studioWavConversionProtocol";

/** The dedicated worker scope, typed by hand: tsconfig.app has the DOM lib
 *  only, where `postMessage` is Window's and wants a target origin. */
interface ConversionWorkerScope {
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WavConversionRequest>) => void,
  ) => void;
  postMessage: (
    message: WavConversionResponse,
    transfer?: Transferable[],
  ) => void;
}

const scope = globalThis as unknown as ConversionWorkerScope;
let isEncoderRegistered = false;

/** LAME is registered even where the browser has an MP3 encoder of its own,
 *  so every file encodes at a constant bitrate and fits the size it was given.
 *  The WebAssembly loads here, on the first conversion only. */
function registerEncoderOnce() {
  if (isEncoderRegistered) return;
  registerMp3Encoder();
  isEncoderRegistered = true;
}

function sourceFor(request: WavConversionRequest): Source {
  if (!needsCanonicalWave(request.header)) return new BlobSource(request.file);
  const reader = createCanonicalWaveReader(request.file, request.header);
  return new CustomSource({
    getSize: () => reader.size,
    read: (start, end) => reader.read(start, end),
  });
}

async function convert(request: WavConversionRequest): Promise<ArrayBuffer> {
  registerEncoderOnce();
  const mp3Target = mp3TargetFor(request.header);
  const input = new Input({ formats: [WAVE], source: sourceFor(request) });
  const output = new Output({
    format: new Mp3OutputFormat(),
    target: new BufferTarget(),
  });
  try {
    const conversion = await Conversion.init({
      input,
      output,
      showWarnings: false,
      audio: {
        codec: "mp3",
        sampleRate: mp3Target.sampleRate,
        numberOfChannels: mp3Target.numberOfChannels,
        quality: new Quality({
          bitrate: request.bitrateKbps * 1000,
          bitrateMode: "constant",
        }),
        forceTranscode: true,
      },
    });
    if (!conversion.isValid)
      throw new Error(
        `No MP3 track: ${conversion.discardedTracks.map((discarded) => discarded.reason).join(", ")}`,
      );
    let lastPercent = -1;
    conversion.onProgress = (progress) => {
      const percent = Math.floor(progress * 100);
      if (percent === lastPercent) return;
      lastPercent = percent;
      scope.postMessage({ type: "progress", progress: percent / 100 });
    };
    await conversion.execute();
    const buffer = output.target.buffer;
    if (!buffer) throw new Error("The MP3 came out empty");
    return buffer;
  } finally {
    input.dispose();
  }
}

scope.addEventListener("message", (event) => {
  void convert(event.data).then(
    (buffer) => scope.postMessage({ type: "done", buffer }, [buffer]),
    (error: unknown) =>
      scope.postMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Conversion failed",
      }),
  );
});
