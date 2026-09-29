/**
 * Small hex-colour arithmetic for the flat highlights and shadows every
 * template paints (a shine, a tint of the fill colour), since sticker art
 * colours are raw hex and never go through a theme token.
 */

function clampToUnit(amount: number): number {
  return Math.min(1, Math.max(0, amount));
}

function hexPairToByte(hexPair: string): number {
  return parseInt(hexPair, 16);
}

function byteToHexPair(byteValue: number): string {
  return Math.round(byteValue).toString(16).padStart(2, "0");
}

/** Mix two #rrggbb colours; amount 0 keeps `color`, 1 gives `otherColor`. */
export function mixHex(
  color: string,
  otherColor: string,
  amount: number,
): string {
  const clampedAmount = clampToUnit(amount);
  const from = color.replace("#", "");
  const to = otherColor.replace("#", "");
  const mixedChannel = (channelIndex: number) => {
    const fromByte = hexPairToByte(from.slice(channelIndex, channelIndex + 2));
    const toByte = hexPairToByte(to.slice(channelIndex, channelIndex + 2));
    return byteToHexPair(fromByte + (toByte - fromByte) * clampedAmount);
  };
  return `#${mixedChannel(0)}${mixedChannel(2)}${mixedChannel(4)}`.toLowerCase();
}

/** Lighten toward white. Stands in for the translucent highlights in the
 *  previews. */
export function tint(color: string, amount: number): string {
  return mixHex(color, "#ffffff", amount);
}
