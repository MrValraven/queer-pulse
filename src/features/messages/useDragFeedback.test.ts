import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDragFeedback } from "./useDragFeedback";

/**
 * The drag controller's own behaviour: what it paints while a finger is down,
 * and what it commits to when the finger lifts. The arithmetic it paints with
 * is covered by `chatImageZoom.test.ts`; these cases are about the decisions
 * around it, which is where the viewer's gestures can go wrong without any
 * test noticing.
 */
function setup(
  options: { reducedMotion?: boolean; hasSiblings?: boolean } = {},
) {
  // The controller reaches the stage through an explicit `stageRef` (see
  // `useDragFeedback.ts`), the same ref `useZoomPan` attaches to `.stage`, so
  // standing up `stageNode` directly and handing it in as `stageRef` is what
  // the real wiring does too, not a shape the test invents on its own. The
  // drag transform lands on `stageNode`; the wash stays a separate node the
  // controller writes to directly.
  const stageNode = document.createElement("div");
  const washNode = document.createElement("div");
  const stageRef = createRef<HTMLDivElement>() as {
    current: HTMLDivElement | null;
  };
  const scrimWashRef = createRef<HTMLDivElement>() as {
    current: HTMLDivElement | null;
  };
  stageRef.current = stageNode;
  scrimWashRef.current = washNode;
  const actions = {
    onDragActive: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onDismiss: vi.fn(),
  };
  const { result } = renderHook(() =>
    useDragFeedback({
      stageRef,
      scrimWashRef,
      reducedMotion: options.reducedMotion ?? false,
      hasSiblings: options.hasSiblings ?? true,
      ...actions,
    }),
  );
  return { controller: result.current, stageNode, washNode, actions };
}

/** A pointer event shaped enough for the controller's own reads. */
function pointerAt(clientX: number, clientY: number) {
  return { clientX, clientY } as React.PointerEvent;
}

describe("useDragFeedback while the finger is down", () => {
  it("paints nothing and announces nothing until the drag has an intent", () => {
    const { controller, stageNode, actions } = setup();
    controller.follow(100, 100, pointerAt(104, 103));
    expect(actions.onDragActive).not.toHaveBeenCalled();
    expect(stageNode.style.transform).toBe("");
    expect(controller.isActive()).toBe(false);
  });

  it("announces the drag once, not on every frame", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 140));
    controller.follow(100, 100, pointerAt(100, 180));
    controller.follow(100, 100, pointerAt(100, 220));
    expect(actions.onDragActive).toHaveBeenCalledTimes(1);
    expect(actions.onDragActive).toHaveBeenCalledWith(true);
    expect(controller.isActive()).toBe(true);
  });

  it("follows a downward drag with no transition, since the finger is the animation", () => {
    const { controller, stageNode, washNode } = setup();
    controller.follow(100, 100, pointerAt(100, 155));
    expect(stageNode.style.transform).toContain("translate(0px, 55px)");
    expect(stageNode.style.transition).toBe("none");
    expect(Number(washNode.style.opacity)).toBeLessThan(1);
  });

  it("leaves the wash alone during a sideways drag, since nothing is being dismissed", () => {
    const { controller, stageNode, washNode } = setup();
    controller.follow(100, 100, pointerAt(40, 100));
    expect(stageNode.style.transform).toContain("translate(-60px, 0px)");
    expect(washNode.style.opacity).toBe("1");
  });

  it("does not shrink the photo under reduced motion, but still follows it", () => {
    const { controller, stageNode } = setup({ reducedMotion: true });
    controller.follow(100, 100, pointerAt(100, 210));
    expect(stageNode.style.transform).toContain("scale(1)");
    expect(stageNode.style.transform).toContain("translate(0px, 110px)");
  });

  it("locks vertical on an exactly diagonal drag, never horizontal", () => {
    // The lock distance is 18px in both axes at once here, an exact tie.
    // Spec: an exactly diagonal drag counts as vertical, so a dismiss is
    // never stolen by a stray sideways pixel.
    const { controller, stageNode, washNode } = setup();
    controller.follow(100, 100, pointerAt(118, 118));
    expect(stageNode.style.transform).toContain("translate(0px, 18px)");
    // A horizontal lock would leave the wash untouched at full opacity; a
    // vertical lock fades it. This is what actually distinguishes the two.
    expect(Number(washNode.style.opacity)).toBeLessThan(1);
  });

  it("locks the axis on an upward flick without announcing, since nothing has moved yet", () => {
    // An 18px+ upward flick locks the vertical axis immediately (axis
    // locking is a pure magnitude check), but `dragFeedbackFor`'s vertical
    // branch returns IDLE_DRAG for any non-positive deltaY, since there is no
    // upward dismiss to promise. Announcing here would fade both chrome bars
    // for a photo that has not actually moved, a flicker with zero feedback
    // to justify it, and an upward flick is an easy gesture to make.
    const { controller, stageNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 78));
    expect(actions.onDragActive).not.toHaveBeenCalled();
    expect(stageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    // The axis is still recorded at lock time: `end()` needs it to keep the
    // two axes exclusive regardless of whether this drag ever painted.
    expect(controller.isActive()).toBe(true);
  });

  it("announces on the first frame that actually moves the photo, even after an idle upward lock", () => {
    const { controller, stageNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 78)); // locks vertical, idle
    controller.follow(100, 100, pointerAt(100, 130)); // reverses down 30px net
    expect(actions.onDragActive).toHaveBeenCalledTimes(1);
    expect(actions.onDragActive).toHaveBeenCalledWith(true);
    expect(stageNode.style.transform).toContain("translate(0px, 30px)");
  });

  it("never locks an axis purely because one coordinate came back NaN", () => {
    // A flaky touchscreen reporting one bad coordinate must not hide the
    // chrome for what reads as a stable tap: a deltaY of 5px sits well inside
    // the tap slop and cannot lock on its own, and a NaN deltaX carries no
    // intent to lock on either. `lockDragAxis` rejects non-finite input up
    // front, because every magnitude comparison below it is false against NaN
    // and would otherwise fall through to the "vertical" default.
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(NaN, 105));
    expect(controller.isActive()).toBe(false);
    expect(actions.onDragActive).not.toHaveBeenCalled();
  });
});

describe("useDragFeedback when the finger lifts", () => {
  it("dismisses a downward drag that crossed the threshold", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 220));
    controller.end(0, 120);
    expect(actions.onDismiss).toHaveBeenCalledTimes(1);
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(actions.onDragActive).toHaveBeenLastCalledWith(false);
  });

  it("settles back, committing nothing, when the drag fell short", () => {
    const { controller, stageNode, washNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 160));
    controller.end(0, 60);
    expect(actions.onDismiss).not.toHaveBeenCalled();
    expect(stageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(stageNode.style.transition).toContain("transform");
    expect(washNode.style.opacity).toBe("1");
  });

  it("moves to the next photo on a leftward drag past the threshold", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(20, 100));
    controller.end(-80, 0);
    expect(actions.onNext).toHaveBeenCalledTimes(1);
    expect(actions.onPrev).not.toHaveBeenCalled();
  });

  it("moves to the previous photo on a rightward drag past the threshold", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(180, 100));
    controller.end(80, 0);
    expect(actions.onPrev).toHaveBeenCalledTimes(1);
    expect(actions.onNext).not.toHaveBeenCalled();
  });

  it("settles a committed photo change instantly, so nothing animates on its way out", () => {
    const { controller, stageNode } = setup();
    controller.follow(100, 100, pointerAt(20, 100));
    controller.end(-80, 0);
    expect(stageNode.style.transition).toBe("none");
  });

  it("never starts a drag for a press that stayed inside the tap slop", () => {
    // The axis lock sits deliberately above `useZoomPan`'s 16px tap slop, so a
    // shaky tap cannot hide the chrome and show it again on release.
    const { controller, stageNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 112));
    expect(controller.isActive()).toBe(false);
    expect(actions.onDragActive).not.toHaveBeenCalled();
    expect(stageNode.style.transform).toBe("");
  });

  it("commits nothing when a real drag is settled without committing", () => {
    const { controller, stageNode, washNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 150));
    controller.settleWithoutCommitting();
    expect(actions.onDismiss).not.toHaveBeenCalled();
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(actions.onDragActive).toHaveBeenLastCalledWith(false);
    expect(controller.isActive()).toBe(false);
    expect(stageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(washNode.style.opacity).toBe("1");
  });

  it("ignores an end with no drag in progress", () => {
    const { controller, actions } = setup();
    controller.end(0, 500);
    expect(actions.onDismiss).not.toHaveBeenCalled();
    expect(actions.onDragActive).not.toHaveBeenCalled();
  });

  it("does not animate the settle under reduced motion", () => {
    const { controller, stageNode } = setup({ reducedMotion: true });
    controller.follow(100, 100, pointerAt(100, 160));
    controller.end(0, 60);
    expect(stageNode.style.transition).toBe("none");
  });

  it("clears everything instantly on a photo change", () => {
    const { controller, stageNode, washNode } = setup();
    controller.follow(100, 100, pointerAt(100, 200));
    controller.reset();
    expect(controller.isActive()).toBe(false);
    expect(stageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(stageNode.style.transition).toBe("none");
    expect(washNode.style.opacity).toBe("1");
  });

  it("announces the drag ended on a photo change, so the chrome is not stranded", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 200));
    actions.onDragActive.mockClear();
    controller.reset();
    expect(actions.onDragActive).toHaveBeenCalledWith(false);
  });

  it("never dismisses on a sideways-locked drag, however far down it also travelled", () => {
    // An L-shaped drag: locked horizontal, then travelled past the dismiss
    // distance vertically. The follow promised a slide, so the release must
    // not close the viewer.
    const { controller, actions } = setup({ hasSiblings: false });
    controller.follow(100, 100, pointerAt(119, 105));
    controller.end(25, 130);
    expect(actions.onDismiss).not.toHaveBeenCalled();
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(actions.onPrev).not.toHaveBeenCalled();
  });

  it("does not dismiss on a sideways-locked drag even with siblings present", () => {
    const { controller, actions } = setup({ hasSiblings: true });
    controller.follow(100, 100, pointerAt(119, 105));
    controller.end(25, 130);
    expect(actions.onDismiss).not.toHaveBeenCalled();
  });

  it("settles back rather than committing a sideways drag with nowhere to go", () => {
    const { controller, stageNode, actions } = setup({ hasSiblings: false });
    controller.follow(100, 100, pointerAt(20, 100));
    controller.end(-80, 0);
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(actions.onPrev).not.toHaveBeenCalled();
    // Settled, not hard-cut: a gesture that commits nothing should animate back.
    expect(stageNode.style.transition).toContain("transform");
  });

  it("never navigates on a vertical-locked drag, however far sideways it also travelled", () => {
    // The mirror of the L-shaped case above: locked vertical, then travelled
    // well past the navigate distance sideways. The follow promised a
    // dismiss-style fade, so the release must not slide to another photo.
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(105, 119));
    controller.end(120, 40);
    expect(actions.onNext).not.toHaveBeenCalled();
    expect(actions.onPrev).not.toHaveBeenCalled();
  });

  it("leaves the dragged pose on screen when a drag dismisses, for the exit to carry out", () => {
    // The one place this controller deliberately does NOT reset, unlike the
    // horizontal commit branches. The viewer plays an exit animation before it
    // unmounts, and snapping the photo back to the middle of the screen first
    // would visibly undo the throw the member just made.
    const { controller, stageNode, washNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 230));
    controller.end(0, 130);
    expect(actions.onDismiss).toHaveBeenCalledTimes(1);
    expect(stageNode.style.transform).toContain("translate(0px, 130px)");
    expect(stageNode.style.transition).toBe("none");
    expect(Number(washNode.style.opacity)).toBeLessThan(1);
  });

  it("commits a navigation only once even if end is called twice in a row", () => {
    // A lost-then-redelivered pointerup, or a duplicate event from a flaky
    // touchscreen, must not fire onNext twice for one physical swipe.
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(20, 100));
    controller.end(-80, 0);
    controller.end(-80, 0);
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("lets a cancelled gesture win over a position that would have committed", () => {
    // `settleWithoutCommitting` exists precisely for a release that must not
    // commit (a tap, or a lost pointer) regardless of where the finger
    // actually was. It must ignore the threshold entirely, not just skip the
    // callback while still treating the position as "past" it.
    const { controller, stageNode, washNode, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 260));
    controller.settleWithoutCommitting();
    expect(actions.onDismiss).not.toHaveBeenCalled();
    expect(stageNode.style.transform).toBe("translate(0px, 0px) scale(1)");
    expect(washNode.style.opacity).toBe("1");
  });

  it("does nothing when settled without committing while no drag is active", () => {
    const { controller, stageNode, actions } = setup();
    controller.settleWithoutCommitting();
    expect(actions.onDragActive).not.toHaveBeenCalled();
    expect(stageNode.style.transform).toBe("");
  });

  it("settles back when a drag crosses the dismiss distance and then returns short of it", () => {
    // An out-and-back-ish reversal: the drag touches well past the commit
    // distance at its peak, then eases back up before release. The decision
    // must be read off the final delta handed to `end`, not remembered from
    // whatever `follow` last painted mid-gesture.
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 250));
    controller.follow(100, 100, pointerAt(100, 140));
    controller.end(0, 40);
    expect(actions.onDismiss).not.toHaveBeenCalled();
  });

  it("treats a reset mid-drag as a clean slate: the next lock still announces exactly once", () => {
    // A photo change (an arrow key, say) can land mid-drag and calls
    // `reset()` while a finger is still down. If the gesture continues from
    // there, it must behave like a brand new drag: silent inside the slop,
    // one `true` when it re-locks, not a second `true` stacked on the first.
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 160));
    expect(actions.onDragActive).toHaveBeenCalledTimes(1);
    controller.reset();
    expect(actions.onDragActive).toHaveBeenLastCalledWith(false);
    controller.follow(300, 300, pointerAt(305, 304));
    expect(controller.isActive()).toBe(false);
    expect(actions.onDragActive).toHaveBeenCalledTimes(2);
    controller.follow(300, 300, pointerAt(300, 340));
    expect(controller.isActive()).toBe(true);
    expect(actions.onDragActive).toHaveBeenCalledTimes(3);
    expect(actions.onDragActive).toHaveBeenLastCalledWith(true);
  });

  it("commits a downward drag of exactly the dismiss distance", () => {
    // "Past 110px" is implemented as >=, so exactly 110 already commits.
    // Pinning the boundary here so it cannot silently drift to a strict `>`.
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 220));
    controller.end(0, 110);
    expect(actions.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("settles back one pixel short of the dismiss distance", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(100, 220));
    controller.end(0, 109);
    expect(actions.onDismiss).not.toHaveBeenCalled();
  });

  it("navigates on a sideways drag of exactly the swipe distance", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(20, 100));
    controller.end(-64, 0);
    expect(actions.onNext).toHaveBeenCalledTimes(1);
  });

  it("settles back one pixel short of the swipe distance", () => {
    const { controller, actions } = setup();
    controller.follow(100, 100, pointerAt(20, 100));
    controller.end(-63, 0);
    expect(actions.onNext).not.toHaveBeenCalled();
  });
});
