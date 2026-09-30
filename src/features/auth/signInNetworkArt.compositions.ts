import {
  loadGlyphFont,
  traceGlyph,
  type GlyphTrace,
} from "./signInNetworkArt.glyph";
import {
  createTextHandoff,
  drawTextHandoff,
  settleTextHandoff,
  stepTextHandoff,
  type TextAnchor,
  type TextHandoffCues,
} from "./signInNetworkArt.handoff";
import { buildQScene } from "./signInNetworkArt.qScene";
import { renderQScene, type RenderResources } from "./signInNetworkArt.qRender";
import { composeQStill, stepQScene } from "./signInNetworkArt.qSimulation";
import type { QScene } from "./signInNetworkArt.qTypes";

/** The piece the engine runs, behind one small interface: the 3D Q built on
 *  the brand serif's letter, handing off to the wordmark once it has formed.
 *  The engine owns the canvas, the loop and the theme; the composition owns
 *  the scene. */

export interface Composition<Scene> {
  /** Anything to wait for before the first build (the Q's font). */
  prepare: (element: Element) => Promise<void>;
  /** `insetTop` and `insetBottom` are the strips at the top and the foot
   *  that the composition keeps clear: on a phone, the status bar the art
   *  reaches under and the text zone. */
  build: (
    width: number,
    height: number,
    insetTop: number,
    insetBottom: number,
  ) => Scene;
  step: (scene: Scene, deltaSeconds: number) => void;
  still: (scene: Scene) => void;
  render: (
    context: CanvasRenderingContext2D,
    scene: Scene,
    resources: RenderResources,
    pixelRatio: number,
  ) => void;
  /** Where the backdrop's warmth centres. */
  anchor: (scene: Scene) => { anchorX: number; anchorY: number };
  /** Where the text starts, or null once there is no text to hand off to. */
  setTextAnchor: (anchor: TextAnchor | null) => void;
}

const COMPOSITION_SEED = 20260930;
/** How long the Q waits for its font before using the geometric letter. */
const FONT_WAIT_MILLISECONDS = 1000;

export function createQComposition(
  cues: TextHandoffCues = {},
): Composition<QScene> {
  let trace: GlyphTrace | null = null;
  const handoff = createTextHandoff();
  return {
    prepare: async (element) => {
      const family = getComputedStyle(element)
        .getPropertyValue("--serif")
        .trim();
      if (!family) return;
      const isLoaded = await loadGlyphFont(family, FONT_WAIT_MILLISECONDS);
      trace = isLoaded ? traceGlyph(family) : null;
    },
    build: (width, height, insetTop, insetBottom) => {
      settleTextHandoff(handoff, cues);
      return buildQScene(width, height, COMPOSITION_SEED, trace, {
        insetTop,
        insetBottom,
      });
    },
    step: (scene, deltaSeconds) => {
      stepQScene(scene, deltaSeconds);
      stepTextHandoff(handoff, scene, deltaSeconds, cues);
    },
    still: composeQStill,
    render: (context, scene, resources, pixelRatio) => {
      renderQScene(context, scene, resources, pixelRatio);
      drawTextHandoff(context, scene, resources.palette, handoff);
    },
    anchor: (scene) => ({
      anchorX: scene.camera.originX,
      anchorY: scene.camera.originY,
    }),
    setTextAnchor: (anchor) => {
      handoff.anchor = anchor;
    },
  };
}
