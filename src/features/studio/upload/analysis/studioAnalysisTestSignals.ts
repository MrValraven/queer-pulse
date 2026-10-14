/** Test signals for the analysis meters. Pure functions, no randomness. */
export function sineChannel(options: {
  frequency: number;
  amplitudeDbfs: number;
  seconds: number;
  sampleRate: number;
}): Float32Array {
  const length = Math.round(options.seconds * options.sampleRate);
  const amplitude = 10 ** (options.amplitudeDbfs / 20);
  const channel = new Float32Array(length);
  for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
    channel[sampleIndex] =
      amplitude *
      Math.sin(
        (2 * Math.PI * options.frequency * sampleIndex) / options.sampleRate,
      );
  }
  return channel;
}

export function silenceChannel(
  seconds: number,
  sampleRate: number,
): Float32Array {
  return new Float32Array(Math.round(seconds * sampleRate));
}

export function joinChannels(...parts: Float32Array[]): Float32Array {
  const joined = new Float32Array(
    parts.reduce((total, part) => total + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.length;
  }
  return joined;
}
