/**
 * The microphone envelope, computed on the audio thread. Registered as
 * `vj-onset-envelope`; `vjMicInput.ts` loads it through Vite
 * (`?worker&url`), so the module is served from this origin like any other
 * script.
 *
 * Per hop of `VJ_MIC_HOP_SAMPLES` samples it measures the RMS of the first
 * input channel and the mean square of a one-pole 150 Hz low-pass of it,
 * and posts batches of `VJ_MIC_HOPS_PER_BATCH` hops as
 * `{ timeSec, rms, lowEnergy }` (`VjEnvelopeSample`), where `timeSec` is the
 * audio clock time at the middle of the hop.
 *
 * Only these three numbers per hop leave the audio thread; the sound itself
 * is never copied, posted, recorded or stored. The node has no outputs, so
 * nothing reaches the speakers.
 *
 * It imports nothing: a worklet module runs in AudioWorkletGlobalScope, whose
 * globals are declared here because the DOM lib has none of them.
 */

declare const sampleRate: number;
declare const currentFrame: number;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
}
declare function registerProcessor(
  name: string,
  processorConstructor: new () => AudioWorkletProcessor,
): void;

const VJ_MIC_PROCESSOR_NAME = "vj-onset-envelope";
const VJ_MIC_HOP_SAMPLES = 256;
const VJ_MIC_HOPS_PER_BATCH = 4;
const VJ_MIC_LOW_BAND_HZ = 150;

interface VjWorkletEnvelopeSample {
  timeSec: number;
  rms: number;
  lowEnergy: number;
}

class VjOnsetEnvelopeProcessor extends AudioWorkletProcessor {
  /** One-pole low-pass coefficient for the 150 Hz low band. */
  private readonly lowPassCoefficient =
    1 - Math.exp((-2 * Math.PI * VJ_MIC_LOW_BAND_HZ) / sampleRate);
  private lowPassValue = 0;
  private hopSampleCount = 0;
  private hopStartFrame = 0;
  private hopSquareSum = 0;
  private hopLowSquareSum = 0;
  private batch: VjWorkletEnvelopeSample[] = [];

  process(inputs: Float32Array[][]): boolean {
    const channel = inputs[0]?.[0];
    if (channel === undefined) return true;
    for (let index = 0; index < channel.length; index += 1) {
      if (this.hopSampleCount === 0) this.hopStartFrame = currentFrame + index;
      const sample = channel[index] ?? 0;
      this.lowPassValue +=
        this.lowPassCoefficient * (sample - this.lowPassValue);
      this.hopSquareSum += sample * sample;
      this.hopLowSquareSum += this.lowPassValue * this.lowPassValue;
      this.hopSampleCount += 1;
      if (this.hopSampleCount === VJ_MIC_HOP_SAMPLES) this.finishHop();
    }
    return true;
  }

  private finishHop(): void {
    const middleFrame = this.hopStartFrame + VJ_MIC_HOP_SAMPLES / 2;
    this.batch.push({
      timeSec: middleFrame / sampleRate,
      rms: Math.sqrt(this.hopSquareSum / VJ_MIC_HOP_SAMPLES),
      lowEnergy: this.hopLowSquareSum / VJ_MIC_HOP_SAMPLES,
    });
    this.hopSampleCount = 0;
    this.hopSquareSum = 0;
    this.hopLowSquareSum = 0;
    if (this.batch.length < VJ_MIC_HOPS_PER_BATCH) return;
    this.port.postMessage(this.batch);
    this.batch = [];
  }
}

registerProcessor(VJ_MIC_PROCESSOR_NAME, VjOnsetEnvelopeProcessor);
