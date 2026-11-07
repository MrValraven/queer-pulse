/**
 * Turns the program's displayed clip into the renderer's target, and owns
 * every object URL minted for it. A fresh object URL is minted per target,
 * so the renderer releasing a leaving slot never pulls the source from under
 * a newer layer of the same clip.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import type { VjRenderableClip } from "./vjLayerMachine";
import type { VjScreenPreloadResult } from "./useVjScreenPreload";
import type { VjStageHandle } from "./vjStageHandle";

/** The object URLs the screen still holds, revoked when released or on unmount. */
export interface VjSourceUrlLedger {
  /** Takes ownership of a freshly minted object URL. */
  adopt: (sourceUrl: string) => void;
  /** Revokes one URL this ledger holds; an unknown URL is ignored. */
  release: (sourceUrl: string) => void;
}

interface VjOwnedSourceUrlLedger extends VjSourceUrlLedger {
  scheduleReleaseAll: () => void;
  cancelScheduledReleaseAll: () => void;
}

function createSourceUrlLedger(): VjOwnedSourceUrlLedger {
  const heldSourceUrls = new Set<string>();
  let scheduledTimerId: number | undefined;
  const releaseAll = (): void => {
    for (const sourceUrl of heldSourceUrls) URL.revokeObjectURL(sourceUrl);
    heldSourceUrls.clear();
  };
  return {
    adopt: (sourceUrl) => {
      heldSourceUrls.add(sourceUrl);
    },
    release: (sourceUrl) => {
      if (!heldSourceUrls.delete(sourceUrl)) return;
      URL.revokeObjectURL(sourceUrl);
    },
    scheduleReleaseAll: () => {
      window.clearTimeout(scheduledTimerId);
      scheduledTimerId = window.setTimeout(releaseAll, 0);
    },
    cancelScheduledReleaseAll: () => {
      window.clearTimeout(scheduledTimerId);
      scheduledTimerId = undefined;
    },
  };
}

/**
 * One ledger per mount. The release on unmount waits one task, so a
 * StrictMode remount (which runs the cleanup and the setup back to back)
 * keeps the URLs the stage is showing.
 */
export function useVjSourceUrlLedger(): VjSourceUrlLedger {
  const [ledger] = useState(createSourceUrlLedger);
  useEffect(() => {
    ledger.cancelScheduledReleaseAll();
    return () => ledger.scheduleReleaseAll();
  }, [ledger]);
  return ledger;
}

function renderableClipOf(
  clip: VjClipDTO,
  sourceUrl: string,
): VjRenderableClip {
  return {
    clipId: clip.id,
    mediaKind: clip.mediaKind,
    fitMode: clip.fitMode,
    width: clip.width,
    height: clip.height,
    sourceUrl,
    durationMs: clip.durationMs,
    loopInMs: clip.loopInMs,
    loopOutMs: clip.loopOutMs,
    loopMode: clip.loopMode,
    defaultSpeed: clip.defaultSpeed,
  };
}

export interface VjTargetClipInput {
  displayedClipId: string | null;
  preload: VjScreenPreloadResult;
  /** Owner of the minted URLs; the hook keeps its own when none is given. */
  ledger?: VjSourceUrlLedger;
}

/**
 * The renderer's target. It keeps the previous target until the next clip's
 * object URL is read from the cache, so the projector never waits on a blank
 * layer; a clip that is not cached yet is read again once it turns ready.
 */
export function useVjTargetClip({
  displayedClipId,
  preload,
  ledger,
}: VjTargetClipInput): VjRenderableClip | null {
  const ownLedger = useVjSourceUrlLedger();
  const activeLedger = ledger ?? ownLedger;
  const [target, setTarget] = useState<VjRenderableClip | null>(null);
  if (displayedClipId === null && target !== null) setTarget(null);

  const preloadRef = useRef(preload);
  useEffect(() => {
    preloadRef.current = preload;
  });

  const isDisplayedReady =
    displayedClipId !== null && preload.readyClipIds.includes(displayedClipId);
  const targetClipId = target?.clipId ?? null;

  useEffect(() => {
    if (displayedClipId === null || displayedClipId === targetClipId) {
      return undefined;
    }
    const clip = preloadRef.current.clipById(displayedClipId);
    if (clip === null) return undefined;
    let isCurrent = true;
    void preloadRef.current.cache.readObjectUrl(displayedClipId).then(
      (sourceUrl) => {
        if (sourceUrl === null) return;
        if (!isCurrent) {
          URL.revokeObjectURL(sourceUrl);
          return;
        }
        activeLedger.adopt(sourceUrl);
        setTarget(renderableClipOf(clip, sourceUrl));
      },
      () => undefined,
    );
    return () => {
      isCurrent = false;
    };
  }, [displayedClipId, targetClipId, isDisplayedReady, activeLedger]);

  return target;
}

/**
 * The renderer never adopts a new URL for a clip it already shows or is
 * loading, and never reports it. After each target change commits, the page
 * asks the renderer's handle whether it holds the target URL and releases it
 * when not. Child effects run before the page's, so the renderer has adopted
 * the target by then. With no handle mounted yet, nothing is released.
 */
export function useReleaseUnadoptedVjSource(
  handleRef: RefObject<VjStageHandle | null>,
  target: VjRenderableClip | null,
  ledger: VjSourceUrlLedger,
): void {
  useEffect(() => {
    const handle = handleRef.current;
    if (target === null || handle === null) return;
    if (!handle.holdsSource(target.sourceUrl)) {
      ledger.release(target.sourceUrl);
    }
  }, [handleRef, target, ledger]);
}
