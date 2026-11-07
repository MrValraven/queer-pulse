import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useVjEnginePreRolledTarget } from "./useVjScreenShow";
import type { VjRenderableClip } from "./vjLayerMachine";

function videoClip(clipId: string, sourceUrl: string): VjRenderableClip {
  return {
    clipId,
    mediaKind: "video",
    fitMode: "fill",
    width: 1920,
    height: 1080,
    sourceUrl,
    durationMs: 10_000,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    defaultSpeed: 1,
  };
}

interface PreRollProps {
  nextTarget: VjRenderableClip | null;
  appliedClipId: string | null;
  isEngineDrawing: boolean;
}

function renderPreRoll(initialProps: PreRollProps) {
  return renderHook(
    (props: PreRollProps) =>
      useVjEnginePreRolledTarget(
        props.nextTarget,
        props.appliedClipId,
        props.isEngineDrawing,
      ),
    { initialProps },
  );
}

describe("useVjEnginePreRolledTarget", () => {
  const preRoll = videoClip("clip-x", "blob:pre-roll-x");

  it("keeps the engine's pre-roll after the queue head applies", () => {
    const { result, rerender } = renderPreRoll({
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      isEngineDrawing: true,
    });
    expect(result.current).toBe(preRoll);

    // The queue head applied: clip X plays, nothing waits.
    rerender({
      nextTarget: null,
      appliedClipId: "clip-x",
      isEngineDrawing: true,
    });
    expect(result.current).toBe(preRoll);

    // The applied state moved on: the pre-roll is forgotten.
    rerender({
      nextTarget: null,
      appliedClipId: "clip-y",
      isEngineDrawing: true,
    });
    expect(result.current).toBeNull();
  });

  it("keeps the DOM's applied URL when the context comes back after an apply", () => {
    // WebGL is restoring: the DOM renderer draws and the hidden engine pre-rolls.
    const { result, rerender } = renderPreRoll({
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      isEngineDrawing: false,
    });
    expect(result.current).toBeNull();

    // The queue head applies while the DOM renderer draws its own URL for clip X.
    rerender({
      nextTarget: null,
      appliedClipId: "clip-x",
      isEngineDrawing: false,
    });
    expect(result.current).toBeNull();

    // The context comes back: live stays on the DOM's applied URL.
    rerender({
      nextTarget: null,
      appliedClipId: "clip-x",
      isEngineDrawing: true,
    });
    expect(result.current).toBeNull();
  });

  it("forgets a pre-roll remembered before the context was lost", () => {
    const { result, rerender } = renderPreRoll({
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      isEngineDrawing: true,
    });
    rerender({
      nextTarget: null,
      appliedClipId: "clip-x",
      isEngineDrawing: true,
    });
    expect(result.current).toBe(preRoll);

    rerender({
      nextTarget: null,
      appliedClipId: "clip-x",
      isEngineDrawing: false,
    });
    expect(result.current).toBeNull();
    rerender({
      nextTarget: null,
      appliedClipId: "clip-x",
      isEngineDrawing: true,
    });
    expect(result.current).toBeNull();
  });
});
