import { afterEach, describe, expect, it, vi } from "vitest";
import type { VjRenderableGenerator } from "../../screen/vjLayerMachine";
import { VJ_GENERATOR_REGISTRY } from "../vjGeneratorRegistry";
import { readVjPalette } from "../vjPalette";
import { VjGeneratorSource } from "./vjGeneratorSource";

const PLASMA: VjRenderableGenerator = {
  clipId: "generator:plasma:",
  generatorId: "plasma",
  generatorVariant: null,
  mediaKind: "generator",
  sourceUrl: "",
};

function createEvents() {
  return { onFirstFrame: vi.fn(), onFailed: vi.fn() };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("VjGeneratorSource", () => {
  it("asks the registry for uniforms once per palette", () => {
    const uniformsOf = vi.spyOn(VJ_GENERATOR_REGISTRY.plasma, "uniformsOf");
    const source = new VjGeneratorSource(PLASMA, createEvents());
    const palette = readVjPalette();

    const firstDraw = source.bindDraw(0, palette);
    const firstUniforms = firstDraw.uniforms;
    for (let frame = 0; frame < 10; frame += 1) source.bindDraw(0, palette);
    expect(uniformsOf).toHaveBeenCalledTimes(1);
    expect(source.bindDraw(0, palette).uniforms).toBe(firstUniforms);

    const nextPalette = readVjPalette();
    source.bindDraw(0, nextPalette);
    expect(uniformsOf).toHaveBeenCalledTimes(2);
    expect(uniformsOf).toHaveBeenLastCalledWith(null, nextPalette);
  });

  it("reports its first frame once, on the first bind", () => {
    const events = createEvents();
    const source = new VjGeneratorSource(PLASMA, events);
    source.bindDraw(0, readVjPalette());
    source.update();
    expect(events.onFirstFrame).toHaveBeenCalledTimes(1);
    expect(events.onFirstFrame).toHaveBeenCalledWith(source.key);
  });
});
