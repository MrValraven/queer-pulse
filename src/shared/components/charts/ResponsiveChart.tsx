import type { ReactNode } from "react";
import { ParentSize } from "@visx/responsive";

/**
 * Fills its container's width and derives height from `aspect` (width ÷ height).
 * Children render the SVG contents against the measured width + height, so a
 * chart adapts to its column instead of a hardcoded viewBox.
 */
export function ResponsiveChart({
  aspect,
  children,
}: {
  aspect: number;
  children: (width: number, height: number) => ReactNode;
}) {
  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? children(width, Math.round(width / aspect)) : null
      }
    </ParentSize>
  );
}
