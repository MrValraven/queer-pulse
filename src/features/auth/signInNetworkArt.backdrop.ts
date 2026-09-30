import { rgba, type NetworkPalette } from "./signInNetworkArt.palette";

/** The still plum night behind the network, painted once per size and theme
 *  into its own canvas, then copied into every frame with one `drawImage`. */
export function paintBackdrop(
  palette: NetworkPalette,
  width: number,
  height: number,
  pixelRatio: number,
  hearthX: number,
  hearthY: number,
): HTMLCanvasElement {
  const backdrop = document.createElement("canvas");
  backdrop.width = Math.max(1, Math.round(width * pixelRatio));
  backdrop.height = Math.max(1, Math.round(height * pixelRatio));
  const context = backdrop.getContext("2d");
  if (!context) return backdrop;
  context.scale(pixelRatio, pixelRatio);
  const longest = Math.max(width, height);

  const fillWith = (gradient: CanvasGradient) => {
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  };

  context.fillStyle = rgba(palette.plumChannels, 1);
  context.fillRect(0, 0, width, height);

  // A brighter plum sky drifting down from the top-left.
  const sky = context.createRadialGradient(
    width * 0.22,
    -height * 0.05,
    0,
    width * 0.22,
    -height * 0.05,
    longest * 0.95,
  );
  sky.addColorStop(0, rgba(palette.plumVividChannels, 1));
  sky.addColorStop(0.55, rgba(palette.plumVividChannels, 0.35));
  sky.addColorStop(1, rgba(palette.plumVividChannels, 0));
  fillWith(sky);

  // A far, cool jade haze low on the right, for depth against the warm hearth.
  const haze = context.createRadialGradient(
    width * 0.86,
    height * 0.78,
    0,
    width * 0.86,
    height * 0.78,
    longest * 0.55,
  );
  haze.addColorStop(0, rgba(palette.channels.jade, 0.13));
  haze.addColorStop(1, rgba(palette.channels.jade, 0));
  fillWith(haze);

  // The hearth's widest warmth, reaching almost the whole box.
  const warmth = context.createRadialGradient(
    hearthX,
    hearthY,
    0,
    hearthX,
    hearthY,
    longest * 0.8,
  );
  warmth.addColorStop(0, rgba(palette.channels.coral, 0.09));
  warmth.addColorStop(1, rgba(palette.channels.coral, 0));
  fillWith(warmth);

  // A soft vignette so the edges settle into deep plum.
  const vignette = context.createRadialGradient(
    width / 2,
    height * 0.45,
    longest * 0.3,
    width / 2,
    height * 0.45,
    longest * 0.78,
  );
  vignette.addColorStop(0, rgba(palette.plumDeepChannels, 0));
  vignette.addColorStop(1, rgba(palette.plumDeepChannels, 0.75));
  fillWith(vignette);
  return backdrop;
}
