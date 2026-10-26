import type { ReactNode } from "react";
import { ParentSize } from "@visx/responsive";

/**
 * Fills its container's width and derives height from `aspect` (width ÷ height).
 * Children render the SVG contents against the measured width + height, so a
 * chart adapts to its column instead of a hardcoded viewBox.
 *
 * `minHeight` (optional, in px) keeps a wide-aspect chart from flattening on
 * a narrow column: the height becomes `max(minHeight, width / aspect)`.
 * Omitted, the height follows the aspect alone.
 */
export function ResponsiveChart({
  aspect,
  minHeight,
  children,
}: {
  aspect: number;
  minHeight?: number;
  children: (width: number, height: number) => ReactNode;
}) {
  return (
    <ParentSize
      parentSizeStyles={{
        position: "relative",
        width: "100%",
        height: "auto",
        aspectRatio: String(aspect),
        ...(minHeight !== undefined ? { minHeight } : null),
      }}
    >
      {({ width }) =>
        width > 0
          ? children(
              width,
              Math.max(minHeight ?? 0, Math.round(width / aspect)),
            )
          : null
      }
    </ParentSize>
  );
}
