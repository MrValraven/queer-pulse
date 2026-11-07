/**
 * The compositor's mix slot (engine plan, Task E21): the clip the crossfader
 * blends over the live source.
 *
 * - `current` draws. A new mix clip loads hidden as `pending` and swaps in on
 *   its first frame, so the mix layer never shows black between clips.
 * - `prepared` is the scheduled frame's mix clip (decision 9): it loads at
 *   once and waits; when that frame applies it swaps in at once if it already
 *   has a frame, else it becomes `pending`.
 * - A second URL for the clip the slot already holds is never adopted (v1
 *   rule): clips compare by `clipId`.
 * - Swap (decision 12): `takeCurrent` hands the playing source to the live
 *   layers, playhead and all.
 * Every source this slot drops goes back to the host, which disposes it
 * after a frame and reports its URL.
 */
import type { VjPreloadFailure } from "../../../shared/contracts/vj";
import type { VjRenderableClip } from "../screen/vjLayerMachine";
import {
  heldVjSourceOf,
  type VjHeldSource,
  type VjSourceHost,
  type VjSourceListener,
} from "./vjCompositorLayers";
import type { VjEngineSource } from "./sources/vjSourceTypes";

export class VjCompositorMixSlot implements VjSourceListener {
  private readonly sources: VjSourceHost;
  private currentHeld: VjHeldSource | null = null;
  private pendingHeld: VjHeldSource | null = null;
  private preparedHeld: VjHeldSource | null = null;
  private isPreparedReady = false;

  constructor(sources: VjSourceHost) {
    this.sources = sources;
  }

  /** The mix source on screen, else null. */
  get current(): VjHeldSource | null {
    return this.currentHeld;
  }

  get currentClipId(): string | null {
    return this.currentHeld?.renderable.clipId ?? null;
  }

  get pending(): VjHeldSource | null {
    return this.pendingHeld;
  }

  get prepared(): VjHeldSource | null {
    return this.preparedHeld;
  }

  /** The mix clip the look shows now; null empties the slot. */
  setClip(clip: VjRenderableClip | null): void {
    if (clip === null) {
      this.dropPending();
      this.retireCurrent();
      return;
    }
    if (this.currentHeld?.renderable.clipId === clip.clipId) {
      this.dropPending();
      return;
    }
    if (this.pendingHeld?.renderable.clipId === clip.clipId) return;
    this.dropPending();
    const prepared = this.preparedHeld;
    if (prepared?.renderable.clipId === clip.clipId) {
      this.preparedHeld = null;
      if (this.isPreparedReady) this.swapIn(prepared);
      else this.pendingHeld = prepared;
      return;
    }
    this.pendingHeld = this.create(clip);
  }

  /** Loads the scheduled frame's mix clip hidden; null cancels it. */
  prepare(clip: VjRenderableClip | null): void {
    if (clip === null) {
      this.dropPrepared();
      return;
    }
    const isHeld =
      this.currentHeld?.renderable.clipId === clip.clipId ||
      this.pendingHeld?.renderable.clipId === clip.clipId ||
      this.preparedHeld?.renderable.clipId === clip.clipId;
    if (isHeld) return;
    this.dropPrepared();
    this.preparedHeld = this.create(clip);
    this.isPreparedReady = false;
  }

  /** Hands the source on screen to the live layers (swap); the slot is left empty. */
  takeCurrent(): VjHeldSource | null {
    const held = this.currentHeld;
    this.currentHeld = null;
    return held;
  }

  onFirstFrame(source: VjEngineSource): void {
    const pending = this.pendingHeld;
    if (pending?.source === source) {
      this.pendingHeld = null;
      this.swapIn(pending);
      return;
    }
    if (this.preparedHeld?.source === source) this.isPreparedReady = true;
  }

  /** A mix clip that fails to load is dropped; the clip on screen keeps playing. */
  onFailed(source: VjEngineSource, _failure: VjPreloadFailure): void {
    if (this.pendingHeld?.source === source) this.dropPending();
    else if (this.preparedHeld?.source === source) this.dropPrepared();
  }

  /** Forgets every source; the registry disposes them with no release reports (compositor dispose). */
  disposeAll(): void {
    this.currentHeld = null;
    this.pendingHeld = null;
    this.preparedHeld = null;
    this.isPreparedReady = false;
  }

  private create(clip: VjRenderableClip): VjHeldSource {
    return heldVjSourceOf(this.sources.create(clip, this), clip);
  }

  private swapIn(held: VjHeldSource): void {
    this.retireCurrent();
    this.currentHeld = held;
  }

  private retireCurrent(): void {
    const current = this.currentHeld;
    this.currentHeld = null;
    if (current) this.sources.retire(current.source);
  }

  private dropPending(): void {
    const pending = this.pendingHeld;
    this.pendingHeld = null;
    if (pending) this.sources.retire(pending.source);
  }

  private dropPrepared(): void {
    const prepared = this.preparedHeld;
    this.preparedHeld = null;
    this.isPreparedReady = false;
    if (prepared) this.sources.retire(prepared.source);
  }
}
