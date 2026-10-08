/** Properties copied onto the mirror so its text wraps exactly like the field. */
const MIRRORED_PROPERTIES = [
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "fontVariant",
  "fontStretch",
  "letterSpacing",
  "wordSpacing",
  "textTransform",
  "textIndent",
  "lineHeight",
  "tabSize",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
] as const;

export interface CaretLineRect {
  /** Viewport y of the top of the line the caret sits on. */
  top: number;
  /** Viewport y of the bottom of that line. */
  bottom: number;
}

/**
 * The viewport rect of the line box holding the caret of a textarea.
 *
 * A hidden mirror div copies the textarea's font, padding, border, width,
 * line height and wrapping, holds the text up to `caretIndex` and ends in a
 * marker span; the marker's offset inside the mirror is the caret's offset
 * inside the textarea. The textarea's own `scrollTop` is subtracted, so a long
 * text scrolled inside the box still maps to where the line is painted. The
 * result is not clamped: a caret scrolled out of view returns a rect outside
 * the field.
 */
export function getCaretLineRect(
  textarea: HTMLTextAreaElement,
  caretIndex: number,
): CaretLineRect {
  const computed = window.getComputedStyle(textarea);
  const mirror = document.createElement("div");
  for (const property of MIRRORED_PROPERTIES) {
    mirror.style[property] = computed[property];
  }
  const borderWidth =
    parseFloat(computed.borderLeftWidth) +
    parseFloat(computed.borderRightWidth);
  // `clientWidth` leaves out the scrollbar, so the text wraps at the same
  // column as the painted field.
  mirror.style.boxSizing = "border-box";
  mirror.style.width = `${textarea.clientWidth + borderWidth}px`;
  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.visibility = "hidden";
  mirror.style.overflow = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.wordBreak = "normal";
  mirror.textContent = textarea.value.slice(0, caretIndex);
  const marker = document.createElement("span");
  // A zero width space gives the marker a box on an empty trailing line.
  marker.textContent = "\u200b";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const fontSize = parseFloat(computed.fontSize);
  const parsedLineHeight = parseFloat(computed.lineHeight);
  const lineHeight = Number.isFinite(parsedLineHeight)
    ? parsedLineHeight
    : fontSize * 1.2;
  const markerTop = marker.offsetTop;
  document.body.removeChild(mirror);
  const fieldRect = textarea.getBoundingClientRect();
  const top =
    fieldRect.top +
    parseFloat(computed.borderTopWidth) +
    markerTop -
    textarea.scrollTop;
  return { top, bottom: top + lineHeight };
}
