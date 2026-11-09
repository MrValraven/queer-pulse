import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  isVjPreRollDrawing,
  pickVjTarget,
  useVjConsumableTarget,
  useVjEnginePreRolledTarget,
  useVjPreRolledLiveTarget,
  useVjSimpleConsumer,
  useVjSimpleFallbackClip,
  useVjSourceConsumer,
} from "./useVjScreenShow";
import {
  vjGeneratorSourceKey,
  type VjRenderableClip,
  type VjRenderableGenerator,
  type VjRenderableSource,
} from "./vjLayerMachine";
import { INITIAL_VJ_RENDERER, type VjRendererState } from "./vjRendererKind";
import type { VjStageHandle } from "./vjStageHandle";

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

const EFFECTS_SETTLED: VjRendererState = {
  ...INITIAL_VJ_RENDERER,
  phase: "webgl2",
};
const SIMPLE_ARRIVING: VjRendererState = {
  ...INITIAL_VJ_RENDERER,
  phase: "simple",
  handOffFrom: "webgl2",
};
const SIMPLE_SETTLED: VjRendererState = {
  ...INITIAL_VJ_RENDERER,
  phase: "simple",
};
const ENGINE_ARRIVING: VjRendererState = {
  ...INITIAL_VJ_RENDERER,
  phase: "probing",
  handOffFrom: "simple",
};

interface ConsumableProps {
  renderer: VjRendererState;
  target: VjRenderableClip | null;
}

/** A cache that mints a new URL per read, numbered across clips. */
function mintingCache() {
  let readCount = 0;
  return {
    readObjectUrl: vi.fn((clipId: string) => {
      readCount += 1;
      return Promise.resolve(`blob:fresh-${clipId}-${String(readCount)}`);
    }),
  };
}

/** A stage handle that answers from a set the test fills. */
function stageHandleHolding(heldUrls: Set<string>): {
  current: VjStageHandle | null;
} {
  return {
    current: { holdsSource: (sourceUrl: string) => heldUrls.has(sourceUrl) },
  };
}

/**
 * The page's view of one mix or queue-head target. With `heldUrls` the hook
 * gets a stage handle answering from that set.
 */
function renderConsumable(
  initialProps: ConsumableProps,
  heldUrls?: Set<string>,
) {
  const cache = mintingCache();
  const ledger = { adopt: vi.fn(), release: vi.fn() };
  const handleRef =
    heldUrls === undefined ? undefined : stageHandleHolding(heldUrls);
  /** The URLs the stage released once the engine left (the page revoked them). */
  const revokedUrls = new Set<string>();
  const view = renderHook(
    (props: ConsumableProps) => {
      const consumer = useVjSourceConsumer(props.renderer);
      return useVjConsumableTarget({
        target: props.target,
        consumer,
        cache,
        ledger,
        handleRef,
      });
    },
    { initialProps },
  );
  return { ...view, cache, ledger, revokedUrls };
}

describe("useVjConsumableTarget", () => {
  it("hands the arriving engine a fresh mix URL after simple mode", async () => {
    const mixClip = videoClip("clip-mix", "blob:mix-first");
    const { result, rerender, cache, ledger, revokedUrls } = renderConsumable({
      renderer: EFFECTS_SETTLED,
      target: mixClip,
    });
    expect(result.current).toBe(mixClip);

    // The engine keeps drawing while the simple renderer arrives.
    rerender({ renderer: SIMPLE_ARRIVING, target: mixClip });
    expect(result.current).toBe(mixClip);

    // The engine left: the stage released the mix URL it held.
    rerender({ renderer: SIMPLE_SETTLED, target: mixClip });
    revokedUrls.add(mixClip.sourceUrl);
    expect(result.current).toBeNull();

    rerender({ renderer: ENGINE_ARRIVING, target: mixClip });
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).not.toBeNull());
    const handed = result.current;
    expect(handed?.clipId).toBe("clip-mix");
    expect(handed?.sourceUrl).toBe("blob:fresh-clip-mix-1");
    expect(revokedUrls.has(handed?.sourceUrl ?? "")).toBe(false);
    expect(cache.readObjectUrl).toHaveBeenCalledWith("clip-mix");
    expect(ledger.adopt).toHaveBeenCalledWith("blob:fresh-clip-mix-1");
  });

  it("hands the arriving engine a fresh URL for a queue head minted in simple mode", async () => {
    const { result, rerender, ledger, revokedUrls } = renderConsumable({
      renderer: SIMPLE_SETTLED,
      target: null,
    });
    // A quantized frame waits: its URL is minted while only the simple
    // renderer draws, nothing holds it, and the page revokes it.
    const queueHead = videoClip("clip-next", "blob:next-first");
    rerender({ renderer: SIMPLE_SETTLED, target: queueHead });
    revokedUrls.add(queueHead.sourceUrl);
    expect(result.current).toBeNull();

    rerender({ renderer: ENGINE_ARRIVING, target: queueHead });
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current?.clipId).toBe("clip-next");
    expect(result.current?.sourceUrl).toBe("blob:fresh-clip-next-1");
    expect(revokedUrls.has(result.current?.sourceUrl ?? "")).toBe(false);
    expect(ledger.adopt).toHaveBeenCalledWith("blob:fresh-clip-next-1");
  });

  it("keeps the same URL when the engine never left", () => {
    const mixClip = videoClip("clip-mix", "blob:mix-first");
    const { result, rerender, cache } = renderConsumable({
      renderer: EFFECTS_SETTLED,
      target: mixClip,
    });
    // The operator reverses before the simple renderer shows.
    rerender({ renderer: SIMPLE_ARRIVING, target: mixClip });
    rerender({ renderer: EFFECTS_SETTLED, target: mixClip });
    expect(result.current).toBe(mixClip);
    expect(cache.readObjectUrl).not.toHaveBeenCalled();
  });

  it("returns a fresh URL to the ledger once its epoch ends and no renderer holds it", async () => {
    const mixClip = videoClip("clip-mix", "blob:mix-first");
    const { result, rerender, ledger } = renderConsumable(
      { renderer: SIMPLE_SETTLED, target: mixClip },
      new Set<string>(),
    );
    rerender({ renderer: ENGINE_ARRIVING, target: mixClip });
    await waitFor(() => expect(result.current).not.toBeNull());
    const freshUrl = result.current?.sourceUrl ?? "";

    // The engine leaves again before it took the URL.
    rerender({ renderer: SIMPLE_SETTLED, target: mixClip });
    expect(result.current).toBeNull();
    expect(ledger.release).toHaveBeenCalledWith(freshUrl);
  });

  it("keeps a fresh URL a renderer still holds when its epoch ends", async () => {
    const mixClip = videoClip("clip-mix", "blob:mix-first");
    const heldUrls = new Set<string>();
    const { result, rerender, ledger } = renderConsumable(
      { renderer: SIMPLE_SETTLED, target: mixClip },
      heldUrls,
    );
    rerender({ renderer: ENGINE_ARRIVING, target: mixClip });
    await waitFor(() => expect(result.current).not.toBeNull());
    const freshUrl = result.current?.sourceUrl ?? "";
    heldUrls.add(freshUrl);

    rerender({ renderer: SIMPLE_SETTLED, target: mixClip });
    expect(ledger.release).not.toHaveBeenCalledWith(freshUrl);
  });
});

const DOM_SETTLED: VjRendererState = {
  ...INITIAL_VJ_RENDERER,
  phase: "dom",
  reason: "forced",
};

interface LiveProps {
  renderer: VjRendererState;
  /** The queue head's live source as the page hands it out (useVjConsumableTarget). */
  nextTarget: VjRenderableClip | null;
  appliedClipId: string | null;
  /** The hook's own target for the applied clip (useVjTargetClip). */
  liveTarget: VjRenderableClip | null;
}

/** The page's live pick: the remembered pre-roll for the applied clip, else its own target. */
function renderLive(initialProps: LiveProps) {
  return renderHook(
    (props: LiveProps) => {
      const preRolled = useVjPreRolledLiveTarget(
        props.nextTarget,
        props.appliedClipId,
        isVjPreRollDrawing(props.renderer),
      );
      return pickVjTarget(props.appliedClipId, props.liveTarget, preRolled);
    },
    { initialProps },
  );
}

describe("useVjPreRolledLiveTarget", () => {
  const clipA = videoClip("clip-a", "blob:own-a");
  const preRoll = videoClip("clip-x", "blob:pre-roll-x");
  const ownX = videoClip("clip-x", "blob:own-x");

  it("hands the arriving engine the pre-rolled URL after a trip through simple mode", () => {
    /** The page releases its own URL for clip X: the engine cut to the pre-roll and never took it. */
    const releasedUrls = new Set<string>();
    const { result, rerender } = renderLive({
      renderer: EFFECTS_SETTLED,
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      liveTarget: clipA,
    });
    rerender({
      renderer: EFFECTS_SETTLED,
      nextTarget: null,
      appliedClipId: "clip-x",
      liveTarget: ownX,
    });
    releasedUrls.add(ownX.sourceUrl);
    expect(result.current).toBe(preRoll);

    for (const renderer of [
      SIMPLE_ARRIVING,
      SIMPLE_SETTLED,
      ENGINE_ARRIVING,
      EFFECTS_SETTLED,
    ]) {
      rerender({
        renderer,
        nextTarget: null,
        appliedClipId: "clip-x",
        liveTarget: ownX,
      });
      expect(result.current).toBe(preRoll);
      expect(releasedUrls.has(result.current?.sourceUrl ?? "")).toBe(false);
    }
  });

  it("hands an arriving DOM renderer the pre-rolled URL the simple renderer plays", () => {
    const { result, rerender } = renderLive({
      renderer: SIMPLE_SETTLED,
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      liveTarget: clipA,
    });
    rerender({
      renderer: SIMPLE_SETTLED,
      nextTarget: null,
      appliedClipId: "clip-x",
      liveTarget: ownX,
    });
    expect(result.current).toBe(preRoll);

    rerender({
      renderer: { ...DOM_SETTLED, handOffFrom: "simple" },
      nextTarget: null,
      appliedClipId: "clip-x",
      liveTarget: ownX,
    });
    expect(result.current).toBe(preRoll);
  });

  it("takes in no pre-roll while the DOM renderer draws alone", () => {
    const { result, rerender } = renderLive({
      renderer: DOM_SETTLED,
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      liveTarget: clipA,
    });
    rerender({
      renderer: DOM_SETTLED,
      nextTarget: null,
      appliedClipId: "clip-x",
      liveTarget: ownX,
    });
    expect(result.current).toBe(ownX);
  });

  it("forgets the pre-roll once the applied clip moves on", () => {
    const clipY = videoClip("clip-y", "blob:own-y");
    const { result, rerender } = renderLive({
      renderer: EFFECTS_SETTLED,
      nextTarget: preRoll,
      appliedClipId: "clip-a",
      liveTarget: clipA,
    });
    rerender({
      renderer: SIMPLE_SETTLED,
      nextTarget: null,
      appliedClipId: "clip-x",
      liveTarget: ownX,
    });
    rerender({
      renderer: SIMPLE_SETTLED,
      nextTarget: null,
      appliedClipId: "clip-y",
      liveTarget: clipY,
    });
    expect(result.current).toBe(clipY);

    // Back on clip X later: the page hands out its own fresh target.
    rerender({
      renderer: EFFECTS_SETTLED,
      nextTarget: null,
      appliedClipId: "clip-x",
      liveTarget: ownX,
    });
    expect(result.current).toBe(ownX);
  });
});

function generatorSource(): VjRenderableGenerator {
  return {
    clipId: vjGeneratorSourceKey("plasma", null),
    generatorId: "plasma",
    generatorVariant: null,
    mediaKind: "generator",
    sourceUrl: "",
  };
}

interface FallbackProps {
  renderer: VjRendererState;
  live: VjRenderableSource | null;
}

function renderFallback(initialProps: FallbackProps) {
  const cache = mintingCache();
  const ledger = { adopt: vi.fn(), release: vi.fn() };
  const heldUrls = new Set<string>();
  const handleRef = stageHandleHolding(heldUrls);
  const view = renderHook(
    (props: FallbackProps) => {
      const simpleConsumer = useVjSimpleConsumer(props.renderer);
      return useVjSimpleFallbackClip({
        live: props.live,
        simpleConsumer,
        cache,
        ledger,
        handleRef,
      });
    },
    { initialProps },
  );
  return { ...view, cache, ledger, heldUrls };
}

describe("useVjSimpleFallbackClip", () => {
  const clipA = videoClip("clip-a", "blob:own-a");

  it("reads the last clip as soon as a generator goes live", async () => {
    const { result, rerender, ledger } = renderFallback({
      renderer: EFFECTS_SETTLED,
      live: clipA,
    });
    expect(result.current).toBeNull();

    rerender({ renderer: EFFECTS_SETTLED, live: generatorSource() });
    await waitFor(() => expect(result.current).not.toBeNull());
    const fallback = result.current;
    expect(fallback?.clipId).toBe("clip-a");
    expect(fallback?.sourceUrl).toBe("blob:fresh-clip-a-1");
    expect(ledger.adopt).toHaveBeenCalledWith("blob:fresh-clip-a-1");

    // A simple renderer mounts: it gets the URL already read.
    rerender({ renderer: SIMPLE_ARRIVING, live: generatorSource() });
    expect(result.current).toBe(fallback);
  });

  it("answers null for a generator with no earlier clip", async () => {
    const { result, cache } = renderFallback({
      renderer: SIMPLE_SETTLED,
      live: generatorSource(),
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current).toBeNull();
    expect(cache.readObjectUrl).not.toHaveBeenCalled();
  });

  it("releases the fallback URL once a clip comes back and no renderer holds it", async () => {
    const { result, rerender, ledger } = renderFallback({
      renderer: SIMPLE_SETTLED,
      live: clipA,
    });
    rerender({ renderer: SIMPLE_SETTLED, live: generatorSource() });
    await waitFor(() => expect(result.current).not.toBeNull());

    rerender({
      renderer: SIMPLE_SETTLED,
      live: videoClip("clip-b", "blob:own-b"),
    });
    expect(result.current).toBeNull();
    expect(ledger.release).toHaveBeenCalledWith("blob:fresh-clip-a-1");
  });

  it("leaves a fallback the simple renderer shows for it to release", async () => {
    const { result, rerender, ledger, heldUrls } = renderFallback({
      renderer: SIMPLE_SETTLED,
      live: clipA,
    });
    rerender({ renderer: SIMPLE_SETTLED, live: generatorSource() });
    await waitFor(() => expect(result.current).not.toBeNull());
    heldUrls.add("blob:fresh-clip-a-1");

    rerender({
      renderer: SIMPLE_SETTLED,
      live: videoClip("clip-b", "blob:own-b"),
    });
    expect(result.current).toBeNull();
    expect(ledger.release).not.toHaveBeenCalled();
  });

  it("reads a fresh URL for the next simple renderer after one left", async () => {
    const { result, rerender, ledger } = renderFallback({
      renderer: SIMPLE_SETTLED,
      live: clipA,
    });
    rerender({ renderer: SIMPLE_SETTLED, live: generatorSource() });
    await waitFor(() =>
      expect(result.current?.sourceUrl).toBe("blob:fresh-clip-a-1"),
    );

    // Effects and back: the stage released what the leaving simple renderer held.
    rerender({ renderer: ENGINE_ARRIVING, live: generatorSource() });
    rerender({ renderer: EFFECTS_SETTLED, live: generatorSource() });
    expect(ledger.release).toHaveBeenCalledWith("blob:fresh-clip-a-1");
    await waitFor(() =>
      expect(result.current?.sourceUrl).toBe("blob:fresh-clip-a-2"),
    );
    rerender({ renderer: SIMPLE_ARRIVING, live: generatorSource() });
    expect(result.current?.sourceUrl).toBe("blob:fresh-clip-a-2");
  });
});
