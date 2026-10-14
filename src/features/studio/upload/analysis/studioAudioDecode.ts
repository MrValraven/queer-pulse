export interface DecodedAudio {
  sampleRate: number;
  channels: Float32Array[];
}

export type DecodeAudio = (
  bytes: ArrayBuffer,
  sampleRate: number,
) => Promise<DecodedAudio>;

type OfflineContextConstructor = new (
  channelCount: number,
  length: number,
  sampleRate: number,
) => OfflineAudioContext;

function offlineContextConstructor(): OfflineContextConstructor | null {
  const scope = window as unknown as {
    OfflineAudioContext?: OfflineContextConstructor;
    webkitOfflineAudioContext?: OfflineContextConstructor;
  };
  return scope.OfflineAudioContext ?? scope.webkitOfflineAudioContext ?? null;
}

/** decodeAudioData on a one-frame offline context at `sampleRate`. The
 *  browser decodes off the main thread; the channel copies are made once
 *  so the AudioBuffer can be dropped and the copies transferred. */
export const decodeAudioBytes: DecodeAudio = async (bytes, sampleRate) => {
  const OfflineContext = offlineContextConstructor();
  if (!OfflineContext) throw new Error("Web Audio is unavailable");
  const buffer = await new OfflineContext(1, 1, sampleRate).decodeAudioData(
    bytes,
  );
  const channels = Array.from(
    { length: buffer.numberOfChannels },
    (_channel, channelIndex) =>
      new Float32Array(buffer.getChannelData(channelIndex)),
  );
  return { sampleRate: buffer.sampleRate, channels };
};
