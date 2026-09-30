import {
  blossom,
  drawGlow,
  setCurve,
  tracePiece,
} from "./signInNetworkArt.curve";
import type { NetworkPalette } from "./signInNetworkArt.palette";
import { depthFocus } from "./signInNetworkArt.projection";
import type { QPerson, QScene, QThread } from "./signInNetworkArt.qTypes";
import { easeInOutSine, easeOutCubic } from "./signInNetworkArt.random";
import type { Tone } from "./signInNetworkArt.types";

/** Paints one frame of the 3D Q, back to front: far dust and soft lights,
 *  the hearth's glow, then threads and people interleaved by depth, then
 *  the travelling lights on top. Depth reads through size, brightness and a
 *  depth-of-field softness on whatever is far away. */

function drawFarLayers(
  context: CanvasRenderingContext2D,
  scene: QScene,
  palette: NetworkPalette,
) {
  const parallax = -scene.camera.yaw * 70 * scene.scale;
  const lift = scene.camera.pitch * 40 * scene.scale;
  context.globalCompositeOperation = "lighter";
  for (const light of scene.bokeh) {
    const wander = Math.sin(scene.time * 0.05 + light.driftPhase);
    drawGlow(
      context,
      palette.glow[light.tone],
      light.anchorX + wander * 10 + parallax * 0.2,
      light.anchorY + lift * 0.2,
      light.radius,
      light.brightness,
    );
  }
  context.globalCompositeOperation = "source-over";
  for (const mote of scene.dust) {
    const twinkle =
      0.62 +
      0.38 * Math.sin(scene.time * mote.twinkleSpeed + mote.twinklePhase);
    context.globalAlpha = mote.brightness * twinkle;
    context.fillStyle = mote.isJade ? palette.solid.jade : palette.solid.cream;
    context.beginPath();
    context.arc(
      mote.anchorX + parallax * mote.depth,
      mote.anchorY + lift * mote.depth,
      mote.radius,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
}

function drawHearth(
  context: CanvasRenderingContext2D,
  scene: QScene,
  palette: NetworkPalette,
) {
  const view = scene.hearth.view;
  const bloom = scene.bloom;
  const reach =
    scene.camera.pixelsPerUnit * view.perspective * (0.5 + 0.9 * bloom);
  context.globalCompositeOperation = "lighter";
  drawGlow(
    context,
    palette.hearthGlow,
    view.screenX,
    view.screenY,
    reach * (1 + 0.03 * Math.sin(scene.time * 0.8)),
    0.2 + 0.62 * bloom,
  );
  const coreRadius =
    scene.hearthRadius * view.perspective * (0.45 + 0.55 * bloom);
  drawGlow(
    context,
    palette.glow.coral,
    view.screenX,
    view.screenY,
    coreRadius * 4,
    0.3 + 0.35 * bloom,
  );
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 0.5 + 0.5 * bloom;
  context.fillStyle = palette.solid.coral;
  context.beginPath();
  context.arc(view.screenX, view.screenY, coreRadius, 0, Math.PI * 2);
  context.fill();
  if (bloom <= 0) return;
  // The brand pulse: one soft ring breathing out every few seconds.
  const ringPhase = ((scene.time - scene.bloomStartsAt) % 5) / 5;
  context.globalAlpha = 0.4 * bloom * (1 - ringPhase) * (1 - ringPhase);
  context.strokeStyle = palette.solid.coral;
  context.lineWidth = 1.3 * scene.scale;
  context.beginPath();
  context.arc(
    view.screenX,
    view.screenY,
    coreRadius * (1.6 + 2.6 * easeOutCubic(ringPhase)),
    0,
    Math.PI * 2,
  );
  context.stroke();
}

function curveFor(thread: QThread) {
  setCurve(
    thread.from.view.screenX,
    thread.from.view.screenY,
    thread.to.view.screenX,
    thread.to.view.screenY,
    thread.bend,
  );
}

function drawThread(
  context: CanvasRenderingContext2D,
  scene: QScene,
  palette: NetworkPalette,
  thread: QThread,
) {
  const phase = thread.phase;
  if (phase === "waiting" || phase === "inviting" || phase === "gone") return;
  const presence =
    Math.min(thread.from.presence, thread.to.presence) *
    (phase === "fading" ? 1 - thread.progress : 1);
  if (presence <= 0.01) return;
  const focus = depthFocus(thread.depth);
  const perspective =
    (thread.from.view.perspective + thread.to.view.perspective) / 2;
  const reach = phase === "drawing" ? easeInOutSine(thread.progress) : 1;
  curveFor(thread);
  tracePiece(context, 0, reach);
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = palette.highlight[thread.to.tone];
  context.lineWidth = (4 + 5 * thread.glow) * perspective * scene.scale;
  context.globalAlpha =
    (0.05 + 0.2 * thread.glow) * (0.4 + 0.6 * focus) * presence;
  context.stroke();
  context.globalCompositeOperation = "source-over";
  context.strokeStyle = palette.solid.cream;
  context.lineWidth = (0.7 + 0.7 * focus) * perspective * scene.scale;
  context.globalAlpha = (0.14 + 0.3 * focus + 0.4 * thread.glow) * presence;
  context.stroke();
}

function drawPerson(
  context: CanvasRenderingContext2D,
  scene: QScene,
  palette: NetworkPalette,
  person: QPerson,
) {
  const presence = person.presence;
  if (presence <= 0.01) return;
  const view = person.view;
  const focus = depthFocus(view.depth);
  const blur = 1 - focus;
  const breath = 1 + 0.06 * Math.sin(scene.time * 0.9 + person.breathPhase);
  const radius =
    person.radius * view.perspective * breath * (0.6 + 0.4 * presence);
  context.globalCompositeOperation = "lighter";
  drawGlow(
    context,
    palette.glow[person.tone],
    view.screenX,
    view.screenY,
    radius * (4 + 5 * blur) * (1 + 0.5 * person.flash),
    (0.1 + 0.14 * focus + 0.14 * blur + 0.35 * person.flash) * presence,
  );
  const rimLight = person.rim * scene.bloom;
  if (rimLight > 0.02) {
    drawGlow(
      context,
      palette.glow.coral,
      view.screenX,
      view.screenY,
      radius * 3.4,
      0.75 * rimLight * presence,
    );
  }
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = presence * (0.15 + 0.85 * focus * focus);
  context.fillStyle = palette.solid[person.tone];
  context.beginPath();
  context.arc(view.screenX, view.screenY, radius, 0, Math.PI * 2);
  context.fill();
  if (focus < 0.45) return;
  context.globalAlpha = presence * focus * (0.5 + 0.4 * person.flash);
  context.fillStyle = palette.highlight[person.tone];
  context.beginPath();
  context.arc(view.screenX, view.screenY, radius * 0.45, 0, Math.PI * 2);
  context.fill();
}

function drawLight(
  context: CanvasRenderingContext2D,
  scene: QScene,
  palette: NetworkPalette,
  thread: QThread,
  progress: number,
) {
  curveFor(thread);
  const along = easeInOutSine(Math.min(1, progress));
  const pointX = blossom(along, along, true);
  const pointY = blossom(along, along, false);
  drawHandshakeLight(
    context,
    palette,
    thread.to.tone,
    pointX,
    pointY,
    thread.to.view.perspective,
    scene.scale,
  );
}

/** One handshake light: a glow in the receiver's tone around a cream core.
 *  The text handoff draws the same light on its way to the wordmark. */
export function drawHandshakeLight(
  context: CanvasRenderingContext2D,
  palette: NetworkPalette,
  tone: Tone,
  pointX: number,
  pointY: number,
  perspective: number,
  scale: number,
) {
  drawGlow(
    context,
    palette.glow[tone],
    pointX,
    pointY,
    12 * perspective * scale,
    0.8,
  );
  drawGlow(
    context,
    palette.glow.cream,
    pointX,
    pointY,
    5 * perspective * scale,
    1,
  );
}

/** What the engine prepares once per size and theme and hands to every
 *  frame: the palette's colours and glow sprites, and the painted backdrop. */
export interface RenderResources {
  palette: NetworkPalette;
  backdrop: HTMLCanvasElement;
}

export function renderQScene(
  context: CanvasRenderingContext2D,
  scene: QScene,
  resources: RenderResources,
  pixelRatio: number,
): void {
  const { palette } = resources;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.drawImage(resources.backdrop, 0, 0);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawFarLayers(context, scene, palette);
  drawHearth(context, scene, palette);
  const threads = scene.threadOrder;
  let threadIndex = 0;
  for (const person of scene.drawOrder) {
    while (
      threadIndex < threads.length &&
      (threads[threadIndex]?.depth ?? Infinity) <= person.view.depth
    ) {
      const thread = threads[threadIndex];
      if (thread) drawThread(context, scene, palette, thread);
      threadIndex += 1;
    }
    drawPerson(context, scene, palette, person);
  }
  for (; threadIndex < threads.length; threadIndex += 1) {
    const thread = threads[threadIndex];
    if (thread) drawThread(context, scene, palette, thread);
  }
  context.globalCompositeOperation = "lighter";
  for (const thread of scene.threads) {
    if (thread.phase === "inviting")
      drawLight(context, scene, palette, thread, thread.progress);
  }
  for (const light of scene.lights) {
    if (light.thread)
      drawLight(context, scene, palette, light.thread, light.progress);
  }
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
}
