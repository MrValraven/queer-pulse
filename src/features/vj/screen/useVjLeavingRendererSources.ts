/**
 * Object URLs across the projector's renderers (moved out of VjScreenStage
 * and widened to the engine, the DOM renderer and the simple renderer).
 *
 * No renderer reports anything on unmount, so the stage reads what every
 * mounted renderer holds just before an event that changes which renderers
 * sit on the stage (`snapshotHeld`). Once that change commits, each URL a
 * renderer that left held is released when no renderer still mounted holds
 * it. A renderer can only hold a URL its props named, so the candidates are
 * every URL the props named that a renderer may still hold.
 */
import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import {
  vjRendererMountsKey,
  type VjDrawingRenderer,
  type VjRendererMounts,
} from "./vjRendererKind";
import type { VjStageHandle } from "./vjStageHandle";

const VJ_DRAWING_RENDERERS: readonly VjDrawingRenderer[] = [
  "engine",
  "dom",
  "simple",
];

/** Per renderer that answered at snapshot time, the URLs it held; a renderer with no handle has no entry. */
type VjHeldSnapshot = ReadonlyMap<VjDrawingRenderer, ReadonlySet<string>>;

function isRendererMounted(
  mounts: VjRendererMounts,
  renderer: VjDrawingRenderer,
): boolean {
  switch (renderer) {
    case "engine":
      return mounts.isEngineMounted;
    case "dom":
      return mounts.isDomMounted;
    case "simple":
      return mounts.isSimpleMounted;
  }
}

function snapshotWithoutUrl(
  snapshot: VjHeldSnapshot,
  sourceUrl: string,
): VjHeldSnapshot {
  const remaining = new Map<VjDrawingRenderer, ReadonlySet<string>>();
  for (const [renderer, heldUrls] of snapshot) {
    const kept = new Set(heldUrls);
    kept.delete(sourceUrl);
    remaining.set(renderer, kept);
  }
  return remaining;
}

export function useVjLeavingRendererSources(input: {
  mounts: VjRendererMounts;
  /** The object URLs the props hand the renderers (live, mix, and the queue head's). */
  sourceUrls: readonly string[];
  handleRefs: Readonly<
    Record<VjDrawingRenderer, RefObject<VjStageHandle | null>>
  >;
  onSourceReleased: (sourceUrl: string) => void;
}): {
  release: (sourceUrl: string) => void;
  /** Reads what every mounted renderer holds; call just before a dispatch that changes the mounts. */
  snapshotHeld: () => void;
  /** True when a mounted renderer other than `renderer` holds the URL. */
  isHeldByOther: (renderer: VjDrawingRenderer, sourceUrl: string) => boolean;
} {
  const { mounts, sourceUrls, handleRefs, onSourceReleased } = input;
  const candidatesRef = useRef<Set<string>>(new Set());
  const snapshotRef = useRef<VjHeldSnapshot | null>(null);

  const holds = (renderer: VjDrawingRenderer, sourceUrl: string): boolean =>
    handleRefs[renderer].current?.holdsSource(sourceUrl) === true;

  const isHeldByMounted = (sourceUrl: string): boolean =>
    VJ_DRAWING_RENDERERS.some((renderer) => holds(renderer, sourceUrl));

  const isHeldByOther = (
    renderer: VjDrawingRenderer,
    sourceUrl: string,
  ): boolean =>
    VJ_DRAWING_RENDERERS.some(
      (otherRenderer) =>
        otherRenderer !== renderer && holds(otherRenderer, sourceUrl),
    );

  /** Reports a URL to the page once and forgets it here. */
  const release = (sourceUrl: string): void => {
    candidatesRef.current.delete(sourceUrl);
    const snapshot = snapshotRef.current;
    if (snapshot !== null) {
      snapshotRef.current = snapshotWithoutUrl(snapshot, sourceUrl);
    }
    onSourceReleased(sourceUrl);
  };

  const snapshotHeld = (): void => {
    const snapshot = new Map<VjDrawingRenderer, ReadonlySet<string>>();
    const candidates = new Set([...candidatesRef.current, ...sourceUrls]);
    for (const renderer of VJ_DRAWING_RENDERERS) {
      if (handleRefs[renderer].current === null) continue;
      const heldUrls = new Set<string>();
      for (const sourceUrl of candidates) {
        if (holds(renderer, sourceUrl)) heldUrls.add(sourceUrl);
      }
      snapshot.set(renderer, heldUrls);
    }
    snapshotRef.current = snapshot;
  };

  /** After the mounts commit: releases what each renderer that left held and no mounted one holds. */
  const settleLeavingRenderers = useEffectEvent(() => {
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    if (snapshot === null) return;
    const leftSourceUrls = new Set<string>();
    for (const [renderer, heldUrls] of snapshot) {
      if (isRendererMounted(mounts, renderer)) continue;
      for (const sourceUrl of heldUrls) leftSourceUrls.add(sourceUrl);
    }
    for (const sourceUrl of leftSourceUrls) {
      if (!isHeldByMounted(sourceUrl)) release(sourceUrl);
    }
  });

  /** Adds the URLs the props name and forgets what nothing names or holds any more (the page released it). */
  const trackNamedUrls = useEffectEvent((named: readonly string[]) => {
    const candidates = candidatesRef.current;
    for (const sourceUrl of named) candidates.add(sourceUrl);
    for (const sourceUrl of [...candidates]) {
      if (!named.includes(sourceUrl) && !isHeldByMounted(sourceUrl)) {
        candidates.delete(sourceUrl);
      }
    }
  });

  const mountsKey = vjRendererMountsKey(mounts);
  useEffect(() => {
    settleLeavingRenderers();
  }, [mountsKey]);

  const sourceUrlsKey = sourceUrls.join("\n");
  useEffect(() => {
    trackNamedUrls(sourceUrlsKey === "" ? [] : sourceUrlsKey.split("\n"));
  }, [sourceUrlsKey]);

  return { release, snapshotHeld, isHeldByOther };
}
