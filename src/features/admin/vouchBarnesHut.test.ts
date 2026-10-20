import { describe, expect, it } from "vitest";
import { applyBarnesHutRepulsion, type RepulsionBody } from "./vouchBarnesHut";

function body(x: number, y: number): RepulsionBody {
  return { x, y, vx: 0, vy: 0 };
}

describe("applyBarnesHutRepulsion", () => {
  it("keeps velocities finite when 200 bodies share one point", () => {
    const bodies: RepulsionBody[] = [];
    for (let bodyIndex = 0; bodyIndex < 200; bodyIndex++) {
      bodies.push(body(10, 10));
    }
    bodies.push(body(-300, 40), body(250, -120), body(80, 400));
    applyBarnesHutRepulsion(bodies, 4200);
    for (const repelled of bodies) {
      expect(Number.isFinite(repelled.vx)).toBe(true);
      expect(Number.isFinite(repelled.vy)).toBe(true);
    }
  });

  it("pushes two spread bodies apart", () => {
    const left = body(-50, 0);
    const right = body(50, 0);
    applyBarnesHutRepulsion([left, right], 4200);
    expect(left.vx).toBeLessThan(0);
    expect(right.vx).toBeGreaterThan(0);
  });
});
