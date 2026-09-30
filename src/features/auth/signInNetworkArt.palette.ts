import type { Tone } from "./signInNetworkArt.types";

/** Colours for the network art, read from the design tokens at runtime so the
 *  canvas follows the theme exactly like the CSS around it. Canvas cannot
 *  resolve `var(...)`, so every token is read once per theme change and
 *  turned into ready-made colour strings and glow sprites; the frame loop
 *  then only sets `globalAlpha` and never builds a string. */
export interface NetworkPalette {
  solid: Record<Tone, string>;
  /** A lighter tint of each tone for the lit centre of a member. */
  highlight: Record<Tone, string>;
  channels: Record<Tone, string>;
  plumChannels: string;
  plumDeepChannels: string;
  plumVividChannels: string;
  /** Soft round glow per tone, drawn scaled with `drawImage`. */
  glow: Record<Tone, HTMLCanvasElement>;
  hearthGlow: HTMLCanvasElement;
}

const SPRITE_SIZE = 128;

type GradientStops = readonly (readonly [offset: number, alpha: number])[];

const MEMBER_GLOW_STOPS: GradientStops = [
  [0, 1],
  [0.16, 0.62],
  [0.42, 0.18],
  [0.7, 0.05],
  [1, 0],
];

const HEARTH_GLOW_STOPS: GradientStops = [
  [0, 0.62],
  [0.18, 0.4],
  [0.42, 0.15],
  [0.7, 0.04],
  [1, 0],
];

export function rgba(channels: string, alpha: number): string {
  return `rgba(${channels}, ${alpha})`;
}

/** Converts any CSS colour the canvas understands into "r, g, b" channels, by
 *  letting a scratch context normalise it. Returns "" when it cannot parse. */
function toChannels(scratch: CanvasRenderingContext2D, color: string): string {
  if (!color) return "";
  scratch.fillStyle = color;
  const normalized = String(scratch.fillStyle);
  const hexMatch = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(
    normalized,
  );
  if (hexMatch) {
    return hexMatch
      .slice(1)
      .map((pair) => String(parseInt(pair, 16)))
      .join(", ");
  }
  const functionMatch = /^rgba?\(([^)]+)\)$/.exec(normalized);
  if (!functionMatch?.[1]) return "";
  return functionMatch[1].split(",").slice(0, 3).join(",").trim();
}

function paintGlowSprite(
  channels: string,
  stops: GradientStops,
): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const spriteContext = sprite.getContext("2d");
  if (!spriteContext || !channels) return sprite;
  const center = SPRITE_SIZE / 2;
  const gradient = spriteContext.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center,
  );
  for (const [offset, alpha] of stops) {
    gradient.addColorStop(offset, rgba(channels, alpha));
  }
  spriteContext.fillStyle = gradient;
  spriteContext.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
}

export function readNetworkPalette(element: Element): NetworkPalette | null {
  const scratch = document.createElement("canvas").getContext("2d");
  if (!scratch) return null;
  const computed = getComputedStyle(element);
  const readToken = (name: string) => computed.getPropertyValue(name).trim();
  const readChannels = (name: string) => toChannels(scratch, readToken(name));

  const channels: Record<Tone, string> = {
    coral: readToken("--accent-rgb") || readChannels("--accent"),
    jade: readToken("--jade-rgb") || readChannels("--jade"),
    cream: readToken("--cream-rgb"),
  };
  const plumChannels = readToken("--plum-rgb") || readChannels("--plum");
  // Jade is deep on plum, so its glow and lit centre use the light jade.
  const jadeLight = readChannels("--jade-light") || channels.jade;
  const coralLight = readChannels("--accent-soft") || channels.coral;
  return {
    channels,
    solid: {
      coral: `rgb(${channels.coral})`,
      jade: `rgb(${channels.jade})`,
      cream: `rgb(${channels.cream})`,
    },
    highlight: {
      coral: `rgb(${coralLight})`,
      jade: `rgb(${jadeLight})`,
      cream: `rgb(${channels.cream})`,
    },
    plumChannels,
    plumDeepChannels: readChannels("--plum-deep") || plumChannels,
    plumVividChannels: readChannels("--plum-vivid") || plumChannels,
    glow: {
      coral: paintGlowSprite(channels.coral, MEMBER_GLOW_STOPS),
      jade: paintGlowSprite(jadeLight, MEMBER_GLOW_STOPS),
      cream: paintGlowSprite(channels.cream, MEMBER_GLOW_STOPS),
    },
    hearthGlow: paintGlowSprite(channels.coral, HEARTH_GLOW_STOPS),
  };
}
