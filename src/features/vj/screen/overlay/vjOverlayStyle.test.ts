import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  VJ_COLOR_TOKENS,
  VJ_OVERLAY_POSITIONS,
  VJ_OVERLAY_SIZES,
  VJ_OVERLAY_STYLES,
  type VjOverlay,
} from "../../../../shared/contracts/vj";
import {
  vjOverlayClassesOf,
  vjOverlayMirrorFontSizeOf,
} from "./vjOverlayStyle";

const BASE_OVERLAY: VjOverlay = {
  ...createVjStageState("epoch-test", 0).overlay,
  text: "Doors close at 4",
  isVisible: true,
};

function overlayWith(changes: Partial<VjOverlay>): VjOverlay {
  return { ...BASE_OVERLAY, ...changes };
}

describe("vjOverlayClassesOf", () => {
  it("maps every style, position and size to a class and token", () => {
    const styleClasses = VJ_OVERLAY_STYLES.map(
      (style) => vjOverlayClassesOf(overlayWith({ style })).styleClass,
    );
    expect(styleClasses).toEqual([
      "styleBig",
      "styleTicker",
      "styleNeon",
      "styleOutline",
      "styleTypewriter",
      "styleGlitch",
      "styleStacked",
      "styleSlanted",
    ]);

    const positionClasses = VJ_OVERLAY_POSITIONS.map(
      (position) => vjOverlayClassesOf(overlayWith({ position })).positionClass,
    );
    expect(positionClasses).toEqual([
      "positionTop",
      "positionCenter",
      "positionBottom",
    ]);

    const lineTokens = VJ_OVERLAY_SIZES.map(
      (size) => vjOverlayClassesOf(overlayWith({ size })).sizeToken,
    );
    expect(lineTokens).toEqual([
      "--text-screen-overlay-s",
      "--text-screen-overlay-m",
      "--text-screen-overlay-l",
      "--text-screen-overlay-xl",
    ]);

    const tickerTokens = VJ_OVERLAY_SIZES.map(
      (size) =>
        vjOverlayClassesOf(overlayWith({ style: "ticker", size })).sizeToken,
    );
    // Size l keeps the v1 ticker size.
    expect(tickerTokens).toEqual([
      "--text-screen-label",
      "--text-screen-answer",
      "--text-screen-question",
      "--text-screen-overlay-m",
    ]);

    expect(vjOverlayMirrorFontSizeOf(overlayWith({ size: "l" }))).toBe("12cqh");
    expect(
      vjOverlayMirrorFontSizeOf(overlayWith({ style: "ticker", size: "l" })),
    ).toBe("6cqh");
  });

  it("maps every colour token to its palette variable", () => {
    for (const colorToken of VJ_COLOR_TOKENS) {
      expect(vjOverlayClassesOf(overlayWith({ colorToken })).colorValue).toBe(
        `rgb(var(--vj-palette-${colorToken}))`,
      );
    }
  });
});
