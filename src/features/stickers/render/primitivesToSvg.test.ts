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

  it("emits stroke-linecap only when a path asks for round caps", () => {
    const withCap = primitivesToSvg(
      [
        {
          type: "path",
          commands: [
            { type: "moveTo", x: 0, y: 0 },
            { type: "lineTo", x: 10, y: 0 },
          ],
          stroke: "#1b1b1b",
          strokeWidth: 4,
          lineCap: "round",
        },
      ],
      512,
    );
    const withoutCap = primitivesToSvg(
      [
        {
          type: "path",
          commands: [
            { type: "moveTo", x: 0, y: 0 },
            { type: "lineTo", x: 10, y: 0 },
          ],
          stroke: "#1b1b1b",
          strokeWidth: 4,
        },
      ],
      512,
    );
    expect(withCap).toContain('stroke-linecap="round"');
    expect(withoutCap).not.toContain("stroke-linecap");
  });

  it("serialises a path clip into defs with a deterministic id", () => {
    const svg = primitivesToSvg(
      [
        {
          type: "group",
          clipPath: [
            { type: "moveTo", x: 0, y: 0 },
            { type: "lineTo", x: 10, y: 0 },
            { type: "lineTo", x: 10, y: 10 },
            { type: "close" },
          ],
          children: [
            {
              type: "rect",
              x: 0,
              y: 0,
              width: 20,
              height: 20,
              fill: "#ff0000",
            },
          ],
        },
      ],
      512,
    );
    expect(svg).toContain(
      '<clipPath id="sticker-clip-1"><path d="M0 0 L10 0 L10 10 Z"/></clipPath>',
    );
    expect(svg).toContain('clip-path="url(#sticker-clip-1)"');
  });
});
