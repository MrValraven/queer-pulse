import { describe, expect, it } from "vitest";
import {
  SNAPSHOT_STYLE_PROPERTIES,
  serializeVouchSnapshot,
  snapshotFileBaseName,
} from "./vouchSnapshotExport";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function buildSvgWithPhoto(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.innerHTML = `
    <style>.a { fill: var(--accent); }</style>
    <g aria-label="Ana Silva, member">
      <circle class="halo" r="17" fill="none" />
      <circle class="nodeBg" r="10" />
      <image href="https://example.com/ana.jpg" width="20" height="20" />
      <circle class="disc" r="10" fill="none" style="stroke: var(--ink)" />
    </g>`;
  document.body.appendChild(svg);
  return svg;
}

describe("serializeVouchSnapshot", () => {
  it("drops photos and CSS variables and declares the namespace", () => {
    const svg = buildSvgWithPhoto();
    const output = serializeVouchSnapshot(svg);
    expect(output).not.toContain("<image");
    expect(output).not.toContain("var(--");
    expect(output).toContain("xmlns");
    expect(output).toContain(">AS<");
    expect(output).not.toContain('r="17" fill="white"');
    expect(output.indexOf('class="disc"')).toBeLessThan(output.indexOf(">AS<"));
    svg.remove();
  });

  it("lists the style properties the export inlines", () => {
    expect(SNAPSHOT_STYLE_PROPERTIES).toContain("stroke-dasharray");
    expect(SNAPSHOT_STYLE_PROPERTIES).toContain("text-anchor");
    expect(SNAPSHOT_STYLE_PROPERTIES).toContain("paint-order");
  });
});

describe("snapshotFileBaseName", () => {
  it("builds trust-network-{slug}-{date}", () => {
    expect(snapshotFileBaseName("ines", new Date(2026, 9, 5))).toBe(
      "trust-network-ines-2026-10-05",
    );
  });
});
