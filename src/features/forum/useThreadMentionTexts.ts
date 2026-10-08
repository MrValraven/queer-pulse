import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { type Reply, type Thread } from "./forum.data";
import { type OpOverride } from "./threadModeration.helpers";

/**
 * Every body the thread page renders through `MentionText`, for the page's
 * `ResolvedMentionNamesProvider` to ask the server to name: the opening post
 * as the OP card shows it (`deriveOpView` layers the demo edit overlay, live
 * reads the thread) and every visible reply. A tombstone renders no body and a
 * quote box renders its passage as plain text, so neither contributes.
 *
 * Memoised on its inputs, so typing in a composer (which re-renders the page)
 * never re-parses the thread.
 */
export function useThreadMentionTexts(
  thread: Thread | undefined,
  opOverride: OpOverride,
  visibleReplies: Reply[],
): string[] {
  const { demoMode } = useDemoMode();
  const isOpDeleted = demoMode ? !!opOverride.deleted : !!thread?.deleted;
  const opBody = (demoMode ? opOverride.body : undefined) ?? thread?.body;
  return useMemo(
    () => [
      ...(opBody && !isOpDeleted ? [opBody.join("\n")] : []),
      ...visibleReplies
        .filter((replyItem) => !replyItem.deleted)
        .map((replyItem) => replyItem.body.join("\n")),
    ],
    [opBody, isOpDeleted, visibleReplies],
  );
}
