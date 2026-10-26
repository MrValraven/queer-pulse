import { scaleBand, scaleLinear } from "@visx/scale";

/**
 * Vertical value axis: 0 sits at `plotBottom`, `max` at `plotTop` (SVG y grows
 * downward, so the range is inverted). Seed `max` from the caller's
 * `chartMax(...)` so the axis top stays "nice" and never clips live data.
 */
export function linearScale(max: number, plotTop: number, plotBottom: number) {
  return scaleLinear<number>({
    domain: [0, max],
    range: [plotBottom, plotTop],
  });
}

/**
 * Value-axis ticks for a chart that counts whole things (reports, members):
 * d3 asks for `count` ticks and may land on halves when the axis max is small
 * (max 1 gives 0, 0.5, 1), so only the integers are kept. Integer ticks pass
 * through untouched, so max 1 still draws 0 and 1.
 */
export function wholeNumberTicks(
  valueScale: ReturnType<typeof linearScale>,
  count: number,
): number[] {
  return valueScale.ticks(count).filter((tick) => Number.isInteger(tick));
}

/**
 * Horizontal categorical axis indexed by position (0..count-1). `paddingInner`
 * is the gap between bands as a fraction of the step.
 */
export function bandScale(
  count: number,
  plotLeft: number,
  plotRight: number,
  paddingInner = 0.4,
) {
  return scaleBand<number>({
    domain: Array.from({ length: count }, (_, index) => index),
    range: [plotLeft, plotRight],
    paddingInner,
    paddingOuter: paddingInner / 2,
  });
}
