import { describe, expect, it } from "vitest";
import { unoReverseGeometry } from "../templates/unoReverse.geometry";
import {
  STICKER_CANVAS_SIZE,
  UNO_REVERSE_DEFAULTS,
  UNO_REVERSE_FLAG_IDS,
} from "../templates/unoReverse.params";
import { primitivesToSvg } from "./primitivesToSvg";

function svgFor(flagId: string): string {
  return primitivesToSvg(
    unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId }),
    STICKER_CANVAS_SIZE,
  );
}

describe("primitivesToSvg", () => {
  it("emits a self-contained document for every offered flag", () => {
    for (const flagId of UNO_REVERSE_FLAG_IDS) {
      const svg = svgFor(flagId);
      expect(svg.startsWith("<svg xmlns=")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(svg).toContain(`viewBox="0 0 512 512"`);
    }
  });

  it("references nothing outside the document", () => {
    for (const flagId of UNO_REVERSE_FLAG_IDS) {
      const svg = svgFor(flagId);
      expect(svg).not.toContain("<script");
      expect(svg).not.toContain("href");
      expect(svg).not.toContain("http");
      expect(svg).not.toContain("<image");
      expect(svg).not.toContain("<text");
      expect(svg).not.toContain("<foreignObject");
    }
  });

  it("gives every clip path a unique id", () => {
    const svg = svgFor("bisexual");
    const ids = [...svg.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("paints every band colour of the chosen flag", () => {
    const svg = svgFor("bisexual");
    for (const color of ["#d60270", "#9b4f96", "#0038a8"]) {
      expect(svg).toContain(color);
    }
  });

  it("is stable across calls", () => {
    expect(svgFor("lesbian")).toBe(svgFor("lesbian"));
  });
});
