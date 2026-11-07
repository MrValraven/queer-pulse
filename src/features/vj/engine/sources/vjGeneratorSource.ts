/**
 * A generator layer source (engine plan, decision 10): no texture and no
 * object URL, ready at once. Its draw is the registry's program with the
 * uniforms for its variant and the palette (built once per palette by the
 * registry; the source keeps the palette they were built for, so a frame on
 * the same palette skips the registry lookup). The layer machine takes a generator's
 * first frame from the renderer, so the source reports it on its first update
 * or bind, whichever comes first.
 */
import type { VjRenderableGenerator } from "../../screen/vjLayerMachine";
import { VJ_GENERATOR_REGISTRY } from "../vjGeneratorRegistry";
import type { VjLayerDraw } from "../vjPassGraph";
import type { VjPalette } from "../vjPalette";
import {
  vjEngineSourceKey,
  type VjEngineSource,
  type VjSourceEvents,
} from "./vjSourceTypes";

export class VjGeneratorSource implements VjEngineSource {
  readonly key: string;
  readonly kind = "generator" as const;
  readonly isReady = true;
  readonly playheadMs = 0;
  private readonly generator: VjRenderableGenerator;
  private readonly events: VjSourceEvents;
  private readonly draw: VjLayerDraw;
  /** The palette `draw.uniforms` was built for; null before the first bind. */
  private uniformsPalette: VjPalette | null = null;
  private hasReportedFrame = false;
  private isDisposed = false;

  constructor(generator: VjRenderableGenerator, events: VjSourceEvents) {
    this.generator = generator;
    this.events = events;
    this.key = vjEngineSourceKey(generator);
    this.draw = {
      programKey: VJ_GENERATOR_REGISTRY[generator.generatorId].programKey,
      uniforms: {},
      hasBackdrop: false,
    };
  }

  update(): void {
    this.reportFirstFrame();
  }

  bindDraw(_firstUnit: number, palette: VjPalette): VjLayerDraw {
    if (palette !== this.uniformsPalette) {
      const spec = VJ_GENERATOR_REGISTRY[this.generator.generatorId];
      this.draw.uniforms = spec.uniformsOf(
        this.generator.generatorVariant,
        palette,
      );
      this.uniformsPalette = palette;
    }
    this.reportFirstFrame();
    return this.draw;
  }

  holdsSourceUrl(): boolean {
    return false;
  }

  byteSize(): number {
    return 0;
  }

  restore(): void {
    // Nothing on the GPU belongs to a generator: its program lives in the cache.
  }

  dispose(): void {
    this.isDisposed = true;
  }

  private reportFirstFrame(): void {
    if (this.hasReportedFrame || this.isDisposed) return;
    this.hasReportedFrame = true;
    this.events.onFirstFrame(this.key);
  }
}
