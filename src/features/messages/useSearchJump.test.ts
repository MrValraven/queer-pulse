// src/features/messages/useSearchJump.test.ts
import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useSearchJump } from "./useSearchJump";

// ENG-267: unit coverage for `useSearchJump`, the one-shot hand-off that
// starts a cross-inbox search (or starred-message) jump once the target
// thread is open, then reports "handled" exactly once so the parent clears
// the pending id and can't re-fire it. jsdom implements a real
// `requestAnimationFrame`/`cancelAnimationFrame` pair (backed by a short real
// timer), so these tests await one real animation frame rather than faking
// time, since the hook's whole contract is about ordering across that one
// frame.

/** Waits for one real animation-frame tick to elapse, wrapped in `act` so any
 *  state the callbacks touch is flushed before assertions run. Registered
 *  AFTER whatever effect scheduled its own `requestAnimationFrame`, so on a
 *  single-flush jsdom implementation this resolves once every
 *  already-pending frame (including the hook's) has run. */
async function flushOneAnimationFrame(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
}

describe("useSearchJump", () => {
  it("does nothing when there is no pending jump target", async () => {
    const jumpToMessage = vi.fn().mockReturnValue(true);
    const onJumpHandled = vi.fn();
    renderHook(() => useSearchJump(null, jumpToMessage, onJumpHandled));

    await flushOneAnimationFrame();

    expect(jumpToMessage).not.toHaveBeenCalled();
    expect(onJumpHandled).not.toHaveBeenCalled();
  });

  it("jumps to the target message after mount and reports it handled exactly once", async () => {
    const jumpToMessage = vi.fn().mockReturnValue(true);
    const onJumpHandled = vi.fn();
    renderHook(() =>
      useSearchJump("message-target", jumpToMessage, onJumpHandled),
    );

    await flushOneAnimationFrame();
    expect(jumpToMessage).toHaveBeenCalledTimes(1);
    expect(jumpToMessage).toHaveBeenCalledWith("message-target");
    expect(onJumpHandled).toHaveBeenCalledTimes(1);

    // A correct hook stays quiet on the next tick; a jump that never settles
    // would fire again here.
    await flushOneAnimationFrame();
    expect(jumpToMessage).toHaveBeenCalledTimes(1);
    expect(onJumpHandled).toHaveBeenCalledTimes(1);
  });

  it("hands off once even under a StrictMode mount/cleanup/mount double-invoke", async () => {
    const jumpToMessage = vi.fn().mockReturnValue(true);
    const onJumpHandled = vi.fn();
    renderHook(
      () => useSearchJump("message-target", jumpToMessage, onJumpHandled),
      { wrapper: StrictMode },
    );

    await flushOneAnimationFrame();

    // StrictMode's synchronous mount->cleanup->mount cancels the first
    // requestAnimationFrame before it ever fires (the doc comment's whole
    // reason for handing off via a frame rather than immediately). A broken
    // version of this hook fires the jump twice here.
    expect(jumpToMessage).toHaveBeenCalledTimes(1);
    expect(onJumpHandled).toHaveBeenCalledTimes(1);
  });

  it("cancels the first jump's pending frame when a second jump target arrives before it settles", async () => {
    const jumpToMessage = vi.fn().mockReturnValue(true);
    const onJumpHandled = vi.fn();
    const { rerender } = renderHook(
      ({ jumpToMessageId }) =>
        useSearchJump(jumpToMessageId, jumpToMessage, onJumpHandled),
      { initialProps: { jumpToMessageId: "message-first" } },
    );

    // Re-jump to a different message before the first frame ever runs.
    rerender({ jumpToMessageId: "message-second" });
    await flushOneAnimationFrame();

    expect(jumpToMessage).toHaveBeenCalledTimes(1);
    expect(jumpToMessage).toHaveBeenCalledWith("message-second");
    expect(jumpToMessage).not.toHaveBeenCalledWith("message-first");
    expect(onJumpHandled).toHaveBeenCalledTimes(1);
  });

  it("cancels the pending frame when the member navigates away before it fires", async () => {
    const jumpToMessage = vi.fn().mockReturnValue(true);
    const onJumpHandled = vi.fn();
    const { unmount } = renderHook(() =>
      useSearchJump("message-target", jumpToMessage, onJumpHandled),
    );

    unmount();
    await flushOneAnimationFrame();

    expect(jumpToMessage).not.toHaveBeenCalled();
    expect(onJumpHandled).not.toHaveBeenCalled();
  });

  it("still reports handled when the target isn't in the currently loaded window (jumpToMessage returns false)", async () => {
    // useSearchJump leaves retrying entirely to jumpToMessage's own
    // hunt/page-back logic. This hook's only job is to hand off once,
    // regardless of the outcome, so the parent always clears the pending id.
    const jumpToMessage = vi.fn().mockReturnValue(false);
    const onJumpHandled = vi.fn();
    renderHook(() =>
      useSearchJump("message-not-loaded", jumpToMessage, onJumpHandled),
    );

    await flushOneAnimationFrame();

    expect(jumpToMessage).toHaveBeenCalledTimes(1);
    expect(onJumpHandled).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onJumpHandled is omitted", async () => {
    const jumpToMessage = vi.fn().mockReturnValue(true);
    expect(() =>
      renderHook(() => useSearchJump("message-target", jumpToMessage)),
    ).not.toThrow();

    await flushOneAnimationFrame();
    expect(jumpToMessage).toHaveBeenCalledTimes(1);
  });
});
