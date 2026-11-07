import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const kitCss = readFileSync(
  "src/features/vj/remote/kit/VjRemoteKit.module.css",
  "utf8",
);
const layersCss = readFileSync("src/styles/tokens/layers.css", "utf8");

function layerValueOf(tokenName: string): number {
  const match = new RegExp(`${tokenName}:\\s*(\\d+);`).exec(layersCss);
  if (match === null) throw new Error(`${tokenName} is missing`);
  return Number(match[1]);
}

describe("VjRemoteKit.module.css layers", () => {
  it("keeps the dock popover on the popover layer", () => {
    expect(kitCss).toMatch(/\.popover\s*\{[^}]*z-index:\s*var\(--z-popover\)/);
  });

  it("lifts the over-sheets popover onto the flash warning layer", () => {
    expect(kitCss).toMatch(
      /\.popover\[data-over-sheets="true"\]\s*\{[^}]*z-index:\s*var\(--z-vj-flash-warning\)/,
    );
  });

  it("puts the flash warning layer above both modal tiers", () => {
    const flashWarning = layerValueOf("--z-vj-flash-warning");
    expect(flashWarning).toBeGreaterThan(layerValueOf("--z-modal"));
    expect(flashWarning).toBeGreaterThan(layerValueOf("--z-modal-nested"));
    expect(flashWarning).toBeLessThan(layerValueOf("--z-popover-portal"));
  });
});

describe("VjRemoteKit.module.css phone popover", () => {
  it("spans the dock's width inside the page gutters on a phone", () => {
    expect(kitCss).toMatch(
      /@media \(--md\)\s*\{\s*\[data-vj-dock-popover\]\.popover\s*\{\s*inline-size: calc\(100% - 2 \* var\(--wrap-px\)\);\s*max-inline-size: none;/,
    );
  });
});
