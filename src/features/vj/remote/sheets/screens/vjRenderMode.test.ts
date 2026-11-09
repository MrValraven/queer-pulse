import { describe, expect, it } from "vitest";
import type {
  VjRenderer,
  VjScreenStatus,
} from "../../../../../shared/contracts/vj";
import { isVjRenderModeSettled, vjShowRenderModeOf } from "./vjRenderMode";

let screenCount = 0;

/** A screen reporting `renderer`; null means no health report yet. */
function screenWith(
  renderer: VjRenderer | null,
  isConnected = true,
): VjScreenStatus {
  screenCount += 1;
  return {
    screenId: `d0000000-0000-4000-8000-${String(screenCount).padStart(12, "0")}`,
    number: screenCount,
    isConnected,
    isLead: false,
    isFullscreen: true,
    connectedAt: 1_000,
    lastSeenAt: 2_000,
    preload: { packId: null, clips: [] },
    health:
      renderer === null
        ? null
        : {
            renderer,
            fps: 60,
            droppedFrames: 0,
            cacheBytes: 0,
            isEffectLoadHigh: false,
          },
    nextClipId: null,
    mic: null,
  };
}

describe("vjShowRenderModeOf", () => {
  it("reads effects with no screen", () => {
    expect(vjShowRenderModeOf([])).toBe("effects");
  });

  it("reads simple when every connected screen reports simple", () => {
    expect(
      vjShowRenderModeOf([screenWith("simple"), screenWith("simple")]),
    ).toBe("simple");
  });

  it("reads effects while one screen runs the backup renderer", () => {
    expect(vjShowRenderModeOf([screenWith("simple"), screenWith("dom")])).toBe(
      "effects",
    );
  });

  it("reads effects while one screen has sent no health yet", () => {
    expect(vjShowRenderModeOf([screenWith("simple"), screenWith(null)])).toBe(
      "effects",
    );
  });

  it("leaves a disconnected screen out", () => {
    expect(
      vjShowRenderModeOf([screenWith("simple"), screenWith("webgl2", false)]),
    ).toBe("simple");
  });
});

describe("isVjRenderModeSettled", () => {
  it("effects settles once no connected screen reports simple", () => {
    expect(
      isVjRenderModeSettled(
        [screenWith("webgl2"), screenWith("dom")],
        "effects",
      ),
    ).toBe(true);
  });

  it("effects waits while a screen still reports simple", () => {
    expect(
      isVjRenderModeSettled(
        [screenWith("simple"), screenWith("dom")],
        "effects",
      ),
    ).toBe(false);
  });

  it("simple settles once every connected screen reports simple", () => {
    expect(isVjRenderModeSettled([screenWith("simple")], "simple")).toBe(true);
  });

  it("simple waits for a screen with no health report", () => {
    expect(
      isVjRenderModeSettled([screenWith("simple"), screenWith(null)], "simple"),
    ).toBe(false);
  });

  it("simple leaves a disconnected screen out", () => {
    expect(
      isVjRenderModeSettled(
        [screenWith("simple"), screenWith("webgl2", false)],
        "simple",
      ),
    ).toBe(true);
  });

  it("effects leaves a disconnected screen out", () => {
    expect(
      isVjRenderModeSettled(
        [screenWith("webgl2"), screenWith("simple", false)],
        "effects",
      ),
    ).toBe(true);
  });
});
