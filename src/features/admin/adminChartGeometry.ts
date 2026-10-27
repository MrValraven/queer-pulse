/** Path for a bar whose top two corners are rounded and bottom is square. */
export function roundedTopPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height));
  const bottom = y + height;
  return [
    `M${x},${bottom}`,
    `L${x},${y + safeRadius}`,
    `Q${x},${y} ${x + safeRadius},${y}`,
    `L${x + width - safeRadius},${y}`,
    `Q${x + width},${y} ${x + width},${y + safeRadius}`,
    `L${x + width},${bottom}`,
    "Z",
  ].join(" ");
}
