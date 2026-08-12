import type { PoemLine, PoemMark, PoemSpan } from "./poemModel";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Stable nesting order regardless of a span's `marks` array order — strong
// always wraps outside em, so `["em","strong"]` and `["strong","em"]`
// serialize identically.
function wrapMarks(escapedText: string, marks: PoemMark[]): string {
  let result = escapedText;
  if (marks.includes("em")) result = `<em>${result}</em>`;
  if (marks.includes("strong")) result = `<strong>${result}</strong>`;
  return result;
}

function serializeSpan(span: PoemSpan): string {
  return wrapMarks(escapeHtml(span.text), span.marks);
}

function serializeLine(line: PoemLine): string {
  return line.map(serializeSpan).join("");
}

/**
 * Model → HTML for seeding the contentEditable editor DOM. The bridge
 * counterpart to `parsePoemHtml`: lines join with `<br>`, spans wrap in
 * `<em>`/`<strong>` per their marks, text is HTML-escaped. Round-trips with
 * `parsePoemHtml` for the mark/line set (whitespace/attribute-free by
 * construction, so no lossy allowlist stripping happens on the way back).
 */
export function serializePoemLines(lines: PoemLine[]): string {
  return lines.map(serializeLine).join("<br>");
}
