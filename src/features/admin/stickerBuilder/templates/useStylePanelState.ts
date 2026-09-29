import { useState } from "react";
import type { TemplateStyle } from "../../../stickers/templates/templateDefinition";

/**
 * The flag list a Blip or Tea colour field checks its colour against: none,
 * since the stripe-contrast warning is Uno's alone. One frozen array shared
 * by every render, so the field's memoised warning never recomputes. Typed
 * `string[]` because that is the field's prop type.
 */
export const NO_CONTRAST_FLAG_IDS: string[] = [];
Object.freeze(NO_CONTRAST_FLAG_IDS);

/** Whether two styles hold the same value in every field. Colours compare
 *  case-insensitively, since a stored pack style may carry `#E8775A`. */
export function isSameStyle(
  firstStyle: TemplateStyle,
  secondStyle: TemplateStyle,
): boolean {
  const fieldNames = new Set([
    ...Object.keys(firstStyle),
    ...Object.keys(secondStyle),
  ]);
  return [...fieldNames].every((fieldName) => {
    const firstValue = firstStyle[fieldName];
    const secondValue = secondStyle[fieldName];
    if (typeof firstValue === "string" && typeof secondValue === "string") {
      return firstValue.toLowerCase() === secondValue.toLowerCase();
    }
    return firstValue === secondValue;
  });
}

/**
 * The bookkeeping every style panel shares: one setter per field, a reset to
 * the template's defaults, and the colour field's reset signal.
 *
 * The signal is handed to `StickerColorField` as `resetSignal`, so it can
 * clear a stale hex draft even when a reset lands on the value the draft was
 * already showing (the colour does not change, so the field's own
 * value-resync never fires). It is bumped on Template defaults, and on every
 * style object this panel did not hand up itself (Use this pack's style, or
 * the pack's style loading on a pack switch), since any of those can land on
 * the same hex.
 */
export function useStylePanelState<Style extends TemplateStyle>({
  style,
  defaultStyle,
  onStyleChange,
}: {
  style: Style;
  defaultStyle: Style;
  onStyleChange: (style: TemplateStyle) => void;
}) {
  const [colorFieldResetSignal, setColorFieldResetSignal] = useState(0);
  // The style object this panel last handed up. Adjusted during render: a
  // different one arriving means the change came from outside.
  const [ownStyle, setOwnStyle] = useState<TemplateStyle>(style);
  if (style !== ownStyle) {
    setOwnStyle(style);
    setColorFieldResetSignal((current) => current + 1);
  }

  function emitStyle(nextStyle: Style) {
    setOwnStyle(nextStyle);
    onStyleChange(nextStyle);
  }

  function setField<Key extends keyof Style>(key: Key, value: Style[Key]) {
    emitStyle({ ...style, [key]: value });
  }

  const isDefaultStyle = isSameStyle(style, defaultStyle);

  function resetToDefaults() {
    if (isDefaultStyle) return;
    setColorFieldResetSignal((current) => current + 1);
    emitStyle(defaultStyle);
  }

  return {
    colorFieldResetSignal,
    emitStyle,
    setField,
    isDefaultStyle,
    resetToDefaults,
  };
}
