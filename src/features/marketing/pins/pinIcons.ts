import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FiCheck } from "react-icons/fi";
import { CATEGORY_ICON, PIN_ONLY_ICON, TYPE_ICON } from "../map.data";

// Pre-render each venue-type icon (react-icons) to static SVG markup once, so
// markers can be built as plain DOM without a React root per marker. The
// pin-only icons cover types that never reach the filter chips (the housing
// map's neighbourhood pins). Shared by every pin style.
export const ICON_SVG: Record<string, string> = Object.fromEntries(
  Object.entries({ ...TYPE_ICON, ...CATEGORY_ICON, ...PIN_ONLY_ICON }).map(
    ([type, Icon]) => [type, renderToStaticMarkup(createElement(Icon))],
  ),
);

// The verified badge's check, pre-rendered the same way.
export const CHECK_ICON_SVG = renderToStaticMarkup(createElement(FiCheck));

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
