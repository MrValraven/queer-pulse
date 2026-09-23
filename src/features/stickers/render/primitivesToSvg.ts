import type { Primitive } from "../templates/primitives";

/** Rounds a coordinate so the markup stays small and stable across machines.
 *  Three decimals is far below a pixel at 512. */
function round(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function paintAttributes(primitive: {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}): string {
  const parts = [`fill="${primitive.fill ?? "none"}"`];
  if (primitive.stroke) {
    parts.push(`stroke="${primitive.stroke}"`);
    parts.push(`stroke-width="${round(primitive.strokeWidth ?? 1)}"`);
    parts.push(`stroke-linejoin="round"`);
  }
  return parts.join(" ");
}

/**
 * Serialise primitives into a standalone SVG document.
 *
 * The output references nothing outside itself: no fonts, no images, no
 * `href`, no script. That is what makes it safe to store in Postgres as the
 * re-editable source and to rasterise in a headless browser without a font
 * substitution surprise.
 *
 * The clip path ids are deterministic per call, so the same params always
 * produce the same stored source. This document is meant to be stored and
 * rasterised standalone; inlining it alongside another sticker's SVG in the
 * same DOM needs its clip path ids re-prefixed first, or the two clip paths
 * collide.
 */
export function primitivesToSvg(primitives: Primitive[], size: number): string {
  let clipCounter = 0;
  const definitions: string[] = [];

  function serialise(list: Primitive[]): string {
    return list
      .map((primitive) => {
        if (primitive.type === "rect") {
          const radius = primitive.radius
            ? ` rx="${round(primitive.radius)}"`
            : "";
          return (
            `<rect x="${round(primitive.x)}" y="${round(primitive.y)}" ` +
            `width="${round(primitive.width)}" height="${round(primitive.height)}"` +
            `${radius} ${paintAttributes(primitive)}/>`
          );
        }
        if (primitive.type === "ellipse") {
          const rotation = primitive.rotationDeg
            ? ` transform="rotate(${round(primitive.rotationDeg)} ${round(primitive.centerX)} ${round(primitive.centerY)})"`
            : "";
          return (
            `<ellipse cx="${round(primitive.centerX)}" cy="${round(primitive.centerY)}" ` +
            `rx="${round(primitive.radiusX)}" ry="${round(primitive.radiusY)}"` +
            `${rotation} ${paintAttributes(primitive)}/>`
          );
        }
        if (primitive.type === "path") {
          const data = primitive.commands
            .map((command) => {
              if (command.type === "moveTo")
                return `M${round(command.x)} ${round(command.y)}`;
              if (command.type === "lineTo")
                return `L${round(command.x)} ${round(command.y)}`;
              return "Z";
            })
            .join(" ");
          return `<path d="${data}" ${paintAttributes(primitive)}/>`;
        }
        const transforms: string[] = [];
        if (primitive.translateX || primitive.translateY) {
          transforms.push(
            `translate(${round(primitive.translateX ?? 0)} ${round(primitive.translateY ?? 0)})`,
          );
        }
        if (primitive.rotationDeg) {
          transforms.push(`rotate(${round(primitive.rotationDeg)})`);
        }
        if (primitive.scale !== undefined && primitive.scale !== 1) {
          transforms.push(`scale(${round(primitive.scale)})`);
        }
        let clipAttribute = "";
        if (primitive.clipRect) {
          clipCounter += 1;
          const clipId = `sticker-clip-${clipCounter}`;
          const radius = primitive.clipRect.radius
            ? ` rx="${round(primitive.clipRect.radius)}"`
            : "";
          definitions.push(
            `<clipPath id="${clipId}"><rect x="${round(primitive.clipRect.x)}" ` +
              `y="${round(primitive.clipRect.y)}" width="${round(primitive.clipRect.width)}" ` +
              `height="${round(primitive.clipRect.height)}"${radius}/></clipPath>`,
          );
          clipAttribute = ` clip-path="url(#${clipId})"`;
        }
        const transformAttribute = transforms.length
          ? ` transform="${transforms.join(" ")}"`
          : "";
        return `<g${transformAttribute}${clipAttribute}>${serialise(primitive.children)}</g>`;
      })
      .join("");
  }

  const body = serialise(primitives);
  const defs = definitions.length ? `<defs>${definitions.join("")}</defs>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${size} ${size}">${defs}${body}</svg>`
  );
}
