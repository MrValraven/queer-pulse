/**
 * Builds the engine source for one renderable source: a generator draws
 * itself, a GIF decodes into frames (or falls back to an `<img>`), a video
 * plays in the media host. Every clip source reports its first frame and its
 * failure through `deps.events`, keyed by `vjEngineSourceKey`.
 */
import type { VjRenderableSource } from "../../screen/vjLayerMachine";
import { VjGeneratorSource } from "./vjGeneratorSource";
import { VjGifSource } from "./vjGifSource";
import type { VjEngineSource, VjEngineSourceDeps } from "./vjSourceTypes";
import { VjVideoSource } from "./vjVideoSource";

export function createVjEngineSource(
  source: VjRenderableSource,
  deps: VjEngineSourceDeps,
): VjEngineSource {
  if (source.mediaKind === "generator") {
    return new VjGeneratorSource(source, deps.events);
  }
  if (source.mediaKind === "gif") return new VjGifSource(source, deps);
  return new VjVideoSource(source, deps);
}
