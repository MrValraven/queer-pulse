/**
 * Hooks the two DOM stage renderers share: the backup renderer
 * (VjStageRenderer) and the simple renderer the remote picks
 * (VjSimpleRenderer).
 */
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
  type RefObject,
} from "react";
import {
  INITIAL_VJ_LAYERS,
  releasedVjSourceUrls,
  type VjLayerMachineState,
} from "./vjLayerMachine";
import type { VjStageHandle } from "./vjStageHandle";

function readViewport(): { width: number; height: number } {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useWindowViewport(): { width: number; height: number } {
  const [viewport, setViewport] = useState(readViewport);
  useEffect(() => {
    const handleResize = (): void => setViewport(readViewport());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return viewport;
}

/** Every object URL the layers and the pending target hold (generators hold none). */
function layerHeldSourceUrls(layers: VjLayerMachineState): string[] {
  // Nothing is held in the initial state, so the URLs released going back to
  // it are exactly the URLs held now.
  return releasedVjSourceUrls(layers, INITIAL_VJ_LAYERS);
}

function heldSourceUrls(
  layers: VjLayerMachineState,
  extraSourceUrls: readonly (string | null)[],
): string[] {
  const held = layerHeldSourceUrls(layers);
  for (const sourceUrl of extraSourceUrls) {
    if (sourceUrl && !held.includes(sourceUrl)) held.push(sourceUrl);
  }
  return held;
}

/**
 * Reports each URL nothing holds any more and exposes the stage handle. The
 * mix layer reports its URL in a layout effect, so both see it before any
 * passive effect of the page runs. `pinnedSourceUrl` is a URL the renderer
 * holds for as long as its props name it (the simple renderer's queue head),
 * so the page keeps it while the layers have no room for it yet.
 */
export function useVjHeldSources(
  layers: VjLayerMachineState,
  mixSourceUrl: string | null,
  handleRef: Ref<VjStageHandle> | undefined,
  onSourceReleased: (sourceUrl: string) => void,
  pinnedSourceUrl: string | null = null,
): RefObject<string | null> {
  const mixHeldRef = useRef<string | null>(null);
  const previousHeldRef = useRef<readonly string[]>([]);
  const releaseSource = useEffectEvent((sourceUrl: string) =>
    onSourceReleased(sourceUrl),
  );
  useEffect(() => {
    const held = heldSourceUrls(layers, [mixHeldRef.current, pinnedSourceUrl]);
    const released = previousHeldRef.current.filter(
      (sourceUrl) => !held.includes(sourceUrl),
    );
    previousHeldRef.current = held;
    for (const sourceUrl of released) releaseSource(sourceUrl);
  }, [layers, mixSourceUrl, pinnedSourceUrl]);

  useImperativeHandle(
    handleRef,
    () => ({
      holdsSource: (sourceUrl: string) =>
        sourceUrl !== "" &&
        heldSourceUrls(layers, [mixHeldRef.current, pinnedSourceUrl]).includes(
          sourceUrl,
        ),
    }),
    [layers, pinnedSourceUrl],
  );
  return mixHeldRef;
}

/** The black curtain's settle state and whether the front clip is paused under it. */
export function useVjCurtain(layers: VjLayerMachineState): {
  isFrontPaused: boolean;
  markSettled: () => void;
} {
  const [curtain, setCurtain] = useState({
    isBlack: layers.isBlackRequested,
    isSettled: false,
  });
  if (curtain.isBlack !== layers.isBlackRequested) {
    setCurtain({ isBlack: layers.isBlackRequested, isSettled: false });
  }
  const isFrontPaused =
    layers.isBlackRequested && (layers.curtainFadeMs <= 0 || curtain.isSettled);
  const markSettled = (): void =>
    setCurtain({ isBlack: true, isSettled: true });
  return { isFrontPaused, markSettled };
}

/** Calls onShown once per mount, from an effect, the first render isShowing is true. */
export function useVjLayersShown(
  isShowing: boolean,
  onShown: (() => void) | undefined,
): void {
  const hasReportedRef = useRef(false);
  const reportShown = useEffectEvent(() => onShown?.());
  useEffect(() => {
    if (!isShowing || hasReportedRef.current) return;
    hasReportedRef.current = true;
    reportShown();
  }, [isShowing]);
}
