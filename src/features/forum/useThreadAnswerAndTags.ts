import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply, type Thread } from "./forum.data";
import { useAcceptAnswer, useEditThreadTags } from "./api/useForumMutations";

/**
 * The two thread-level concerns SOC-13 added, kept out of `useThreadPageState`
 * so that hook stays readable: marking a reply as the thread's answer, and
 * re-filing the thread's tags.
 *
 * Both are permission-gated on flags the DTO carries (`canAcceptAnswer`,
 * `canEditTags`), and both return `undefined` handlers when the viewer lacks
 * the permission — the call sites use that to hide the affordance rather than
 * render a control the server would refuse.
 *
 * DEMO patches the local reply list and the local thread so the mark and the
 * tags visibly move, exactly as the demo OP-vote overlay does; live goes
 * through the real endpoints and lets the invalidation refresh the page.
 */
export function useThreadAnswerAndTags({
  thread,
  demoMode,
  setLocalReplies,
}: {
  thread: Thread | undefined;
  demoMode: boolean;
  setLocalReplies: React.Dispatch<React.SetStateAction<Reply[]>>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { setAccepted, isPending: isAcceptPending } = useAcceptAnswer();
  const editTags = useEditThreadTags(thread?.slug);
  const [isEditingTags, setIsEditingTags] = useState(false);
  // Demo has no server mark to read back, so the page holds its own. Live never
  // reads this: the flag comes off each post's `isAccepted`.
  const [demoAcceptedId, setDemoAcceptedId] = useState<string | null>(null);

  // A viewer may accept an answer only where the DTO says so. Demo threads
  // carry no permission flags, and the demo persona is the thread's author in
  // the scripted mock, so demo shows the control.
  const canAcceptAnswer = demoMode ? true : !!thread?.canAcceptAnswer;
  const canEditTags = demoMode ? true : !!thread?.canEditTags;

  function acceptAnswer(replyItem: Reply) {
    const postId = replyItem.postId ?? replyItem.id;
    const isClearing = demoMode
      ? demoAcceptedId === replyItem.id
      : !!replyItem.accepted;
    if (demoMode) {
      const nextAcceptedId = isClearing ? null : replyItem.id;
      setDemoAcceptedId(nextAcceptedId);
      setLocalReplies((previous) =>
        previous.map((item) => ({
          ...item,
          accepted: item.id === nextAcceptedId,
        })),
      );
      showToast(
        t(
          isClearing
            ? "forum:answer.clearedToast"
            : "forum:answer.acceptedToast",
        ),
        "success",
      );
      return;
    }
    if (!thread?.slug) return;
    setAccepted(thread.slug, isClearing ? null : postId, {
      onSuccess: () =>
        showToast(
          t(
            isClearing
              ? "forum:answer.clearedToast"
              : "forum:answer.acceptedToast",
          ),
          "success",
        ),
      onError: () => showToast(t("forum:toast.error"), "error"),
    });
  }

  function saveTags(tags: string[]) {
    setIsEditingTags(false);
    if (demoMode) {
      showToast(t("forum:tagsEdit.savedToast"), "success");
      return;
    }
    editTags.mutate(
      { tags },
      {
        onSuccess: () => showToast(t("forum:tagsEdit.savedToast"), "success"),
        onError: () => showToast(t("forum:toast.error"), "error"),
      },
    );
  }

  return {
    /** Undefined when the viewer may not accept an answer. */
    acceptAnswer: canAcceptAnswer ? acceptAnswer : undefined,
    isAcceptPending,
    /** Undefined when the viewer may not re-file the thread. */
    openTagsEditor: canEditTags ? () => setIsEditingTags(true) : undefined,
    isEditingTags,
    closeTagsEditor: () => setIsEditingTags(false),
    saveTags,
    isTagsSaving: editTags.isPending,
  };
}

/**
 * Builds the prefilled body for a quote-reply: the quoted passage as leading
 * `>` lines, then a blank line for the answer.
 *
 * This is the whole live implementation of quote-reply, and it is deliberately
 * a body convention rather than a column. `splitLeadingQuote` in
 * `forum.adapters.ts` reads it back out on render, so a quote survives a
 * reload, an edit, and a member who types the chevrons by hand.
 *
 * Long passages are clipped: a quote is a pointer to what is being answered,
 * and re-posting six paragraphs to add one line is how a thread becomes
 * unreadable.
 */
export function buildQuoteDraft(replyItem: Reply): string {
  const MAX_QUOTED_CHARACTERS = 280;
  const source = replyItem.body.join("\n").trim();
  const clipped =
    source.length > MAX_QUOTED_CHARACTERS
      ? `${source.slice(0, MAX_QUOTED_CHARACTERS - 1).trimEnd()}…`
      : source;
  const quotedLines = clipped
    .split("\n")
    .map((line) => `> ${line}`.trimEnd())
    .join("\n");
  return `${quotedLines}\n\n`;
}
