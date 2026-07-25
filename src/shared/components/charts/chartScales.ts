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
