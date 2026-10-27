import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const STYLESHEET = readFileSync(
  "src/features/marketing/audiences/shared/TryItSwitch.module.css",
  "utf8",
);

/** The body of the first `@media (max-width: 719px)` block. */
function phoneBlock(css: string): string {
  const start = css.indexOf("@media (max-width: 719px)");
  if (start < 0) return "";
  let depth = 0;
  for (let index = css.indexOf("{", start); index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(start, index + 1);
  }
  return css.slice(start);
}

describe("TryItSwitch phone layout", () => {
  it("scrolls the chip row inside itself at 719px and below", () => {
    const block = phoneBlock(STYLESHEET);
    const ruleStart = block.indexOf(".tryIt .chipRow {");
    expect(ruleStart).toBeGreaterThanOrEqual(0);
    const rule = block.slice(ruleStart, block.indexOf("}", ruleStart));
    expect(rule).toMatch(/flex-wrap:\s*nowrap/);
    expect(rule).toMatch(/overflow-x:\s*auto/);
    expect(rule).toMatch(/min-width:\s*0/);
  });
});
