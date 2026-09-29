import { describe, expect, it } from "vitest";
import { flagBodyPrimitives, type FlagBox } from "../flagArt";
import { primitivesToSvg } from "../../render/primitivesToSvg";
import { primitivesBounds } from "../kit/fitToCanvas";
import { STICKER_FIT_MARGIN, STICKER_SIZE } from "../kit/palette";
import type { GroupPrimitive, Primitive } from "../primitives";
import { UNO_REVERSE_FLAG_IDS } from "../unoReverse.params";
import { blipGeometry } from "./blip.geometry";
import { BLIP_ITEMS } from "./blip.items.data";
import { BLIP_DEFAULTS, type BlipStyle } from "./blip.params";
import { BLIP_POSES } from "./blip.poses.data";
import { BLIP_TEMPLATE } from "./blip.template";
import { blipFrame } from "./parts/body";

/** Floating-point slack around the fitted margin, well below a pixel. */
const BOUNDS_TOLERANCE = 0.05;
const CANVAS_MIN = STICKER_FIT_MARGIN;
const CANVAS_MAX = STICKER_SIZE - STICKER_FIT_MARGIN;

/** The two flags whose body art has its own custom shape (Review Focus 2):
 *  both must clip that shape to the body silhouette. */
const FLAG_IDS_WITH_SHAPE_ART: readonly string[] = ["progress", "intersex"];

function flagStyle(bodyFlagId: string): BlipStyle {
  return { ...BLIP_DEFAULTS, bodyFlagId };
}

/** The default solid body, plus one style per paintable flag: every body a
 *  Blip sticker can actually be stored with. */
const STYLES_UNDER_TEST: readonly BlipStyle[] = [
  BLIP_DEFAULTS,
  ...UNO_REVERSE_FLAG_IDS.map(flagStyle),
];

function isGroupPrimitive(primitive: Primitive): primitive is GroupPrimitive {
  return primitive.type === "group";
}

/** The flag body's box for the `hi` pose (the same pose the flag-body test
 *  renders), matching how `flagBodyGroup` in `parts/body.ts` derives it from
 *  `blipFrame`'s body points. */
function expectedHiPoseFlagBox(bodyFlagId: string): FlagBox {
  const hiPose = BLIP_POSES.find((pose) => pose.id === "hi");
  if (!hiPose) throw new Error("expected the hi pose");
  const frame = blipFrame(hiPose, flagStyle(bodyFlagId));
  const xValues = frame.bodyPoints.map(([x]) => x);
  return {
    x: Math.min(...xValues),
    y: frame.top,
    width: Math.max(...xValues) - Math.min(...xValues),
    height: frame.height,
  };
}

/** The primitives handed to the sketch's fit wrap, unwrapping the single fit
 *  group `applyFit` always adds and, for a tilted pose, the two nested
 *  groups `rotateAbout` wraps around the whole tree. */
function renderedPrimitivesOf(
  built: readonly Primitive[],
  hasTilt: boolean,
): readonly Primitive[] {
  const [fitGroup] = built;
  if (!fitGroup || !isGroupPrimitive(fitGroup)) {
    throw new Error("expected the outer fit group");
  }
  if (!hasTilt) return fitGroup.children;
  const [rotationOuterGroup] = fitGroup.children;
  if (!rotationOuterGroup || !isGroupPrimitive(rotationOuterGroup)) {
    throw new Error("expected the rotation group");
  }
  const [rotationInnerGroup] = rotationOuterGroup.children;
  if (!rotationInnerGroup || !isGroupPrimitive(rotationInnerGroup)) {
    throw new Error("expected the inner rotation group");
  }
  return rotationInnerGroup.children;
}

function collectGroupsWithClipPath(
  primitives: readonly Primitive[],
): GroupPrimitive[] {
  const found: GroupPrimitive[] = [];
  for (const primitive of primitives) {
    if (!isGroupPrimitive(primitive)) continue;
    if (primitive.clipPath) found.push(primitive);
    found.push(...collectGroupsWithClipPath(primitive.children));
  }
  return found;
}

describe("blipGeometry", () => {
  it("renders every item without throwing, for the default style and every flag body", () => {
    for (const style of STYLES_UNDER_TEST) {
      for (const item of BLIP_ITEMS) {
        expect(() => blipGeometry(style, item.id)).not.toThrow();
      }
    }
  });

  it("keeps every fitted item's bounds inside the canvas margin, for the default style and every flag body", () => {
    for (const style of STYLES_UNDER_TEST) {
      for (const item of BLIP_ITEMS) {
        const primitives = blipGeometry(style, item.id);
        const bounds = primitivesBounds(primitives);
        if (!bounds) throw new Error(`${item.id} produced no primitives`);
        expect(bounds.minX).toBeGreaterThanOrEqual(
          CANVAS_MIN - BOUNDS_TOLERANCE,
        );
        expect(bounds.minY).toBeGreaterThanOrEqual(
          CANVAS_MIN - BOUNDS_TOLERANCE,
        );
        expect(bounds.maxX).toBeLessThanOrEqual(CANVAS_MAX + BOUNDS_TOLERANCE);
        expect(bounds.maxY).toBeLessThanOrEqual(CANVAS_MAX + BOUNDS_TOLERANCE);
      }
    }
  });

  it("produces a deterministic SVG for the same style and item", () => {
    for (const item of BLIP_ITEMS) {
      const firstSvg = primitivesToSvg(
        blipGeometry(BLIP_DEFAULTS, item.id),
        STICKER_SIZE,
      );
      const secondSvg = primitivesToSvg(
        blipGeometry(BLIP_DEFAULTS, item.id),
        STICKER_SIZE,
      );
      expect(secondSvg).toBe(firstSvg);
    }
  });

  it("removes exactly the die-cut underlay entries when hasDieCut is false, leaving every painted primitive untouched", () => {
    for (const pose of BLIP_POSES) {
      const hasTilt = pose.tiltDeg !== undefined;
      const withDieCut = blipGeometry(
        { ...BLIP_DEFAULTS, hasDieCut: true },
        pose.id,
      );
      const withoutDieCut = blipGeometry(
        { ...BLIP_DEFAULTS, hasDieCut: false },
        pose.id,
      );
      const renderedWithDieCut = renderedPrimitivesOf(withDieCut, hasTilt);
      const renderedWithoutDieCut = renderedPrimitivesOf(
        withoutDieCut,
        hasTilt,
      );
      // Every `silhouette()` and `underlay()` call adds exactly one entry
      // ahead of the paint pass (body, antenna, and, for some poses, arms,
      // props or extras such as sweat, sparkles and confetti). Dropping the
      // die-cut removes only that leading run: the paint pass itself never
      // changes.
      const underlayCount =
        renderedWithDieCut.length - renderedWithoutDieCut.length;
      expect(underlayCount).toBeGreaterThan(0);
      expect(renderedWithDieCut.slice(underlayCount)).toEqual(
        renderedWithoutDieCut,
      );
    }
  });

  it("clips the Progress and Intersex flag bodies to the body silhouette, painting the flag's own shape", () => {
    for (const flagId of FLAG_IDS_WITH_SHAPE_ART) {
      const primitives = blipGeometry(flagStyle(flagId), "hi");
      const [flagBodyGroup, ...otherClippedGroups] =
        collectGroupsWithClipPath(primitives);
      expect(flagBodyGroup).toBeDefined();
      expect(otherClippedGroups).toHaveLength(0);
      expect(flagBodyGroup?.children).toEqual(
        flagBodyPrimitives(flagId, expectedHiPoseFlagBox(flagId)),
      );
    }
  });

  it("rejects an item id it cannot paint", () => {
    expect(() => blipGeometry(BLIP_DEFAULTS, "not-a-blip-item")).toThrow(
      "Unknown Blip item: not-a-blip-item",
    );
  });
});

describe("BLIP_TEMPLATE.parseStyle", () => {
  it("rejects a style whose body colour is not a hex code", () => {
    expect(BLIP_TEMPLATE.parseStyle({ bodyColor: "red" })).toBeNull();
  });
});
