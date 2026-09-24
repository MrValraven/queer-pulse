import { useEffect, useEffectEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ANCHOR_WAIT_MIN_FRAMES,
  ANCHOR_WAIT_MIN_MS,
  CHAPTER_PARAM,
  FIELD_PARAM,
  PANE_PARAM,
  resolveDeepLinkField,
} from "./editorFieldDeepLink.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { useSubprofileEditorNav } from "./subprofileEditorNav";
import {
  useEditorFieldJump,
  type EditorFieldTarget,
} from "./useEditorFieldJump";

/**
 * Honours a `?field=` deep link once, when the editor opens: the owner "Edit"
 * links on the public page land on the pane (`?pane=`), the Page blocks
 * chapter (`?chapter=`) and then the one field, which is scrolled to, flashed
 * and focused through `useEditorFieldJump`. Renders nothing.
 *
 * The `field` param is dropped with a history REPLACE as soon as it is read,
 * so Back and a refresh never jump again, and no entry is added: the pane and
 * chapter already come from the link, and the jump only switches panes when
 * the link left the right one out (fixed in the same replace).
 *
 * The target can appear a few frames late (a chapter mounts only while it is
 * the active one), so it waits a bounded number of frames for the pane to be
 * active and the anchor to exist, then gives up quietly on an unknown field.
 */
export function EditorFieldDeepLink(): null {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activePane } = useSubprofileEditorNav();
  const { skinBlocks } = useSubprofileEditorContext();
  const jumpToField = useEditorFieldJump();

  const consumeFieldParam = useEffectEvent((): EditorFieldTarget | null => {
    const field = searchParams.get(FIELD_PARAM);
    if (!field) return null;
    const resolved = resolveDeepLinkField(
      field,
      activePane,
      skinBlocks.chapters,
    );
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(FIELD_PARAM);
        if (resolved) next.set(PANE_PARAM, resolved.target.pane);
        if (resolved?.chapter) next.set(CHAPTER_PARAM, resolved.chapter);
        return next;
      },
      { replace: true },
    );
    return resolved?.target ?? null;
  });

  const isTargetReady = useEffectEvent(
    (target: EditorFieldTarget) =>
      target.pane === activePane &&
      target.anchors.some((anchor) => document.getElementById(anchor)),
  );

  const jump = useEffectEvent((target: EditorFieldTarget) =>
    jumpToField(target),
  );

  useEffect(() => {
    const target = consumeFieldParam();
    if (!target) return;
    const startedAt = performance.now();
    let framesWaited = 0;
    let frame = 0;
    const waitForTarget = () => {
      if (isTargetReady(target)) {
        jump(target);
        return;
      }
      framesWaited += 1;
      const hasWaitedEnough =
        framesWaited >= ANCHOR_WAIT_MIN_FRAMES &&
        performance.now() - startedAt >= ANCHOR_WAIT_MIN_MS;
      if (!hasWaitedEnough) frame = window.requestAnimationFrame(waitForTarget);
    };
    frame = window.requestAnimationFrame(waitForTarget);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
