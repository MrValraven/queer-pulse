import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AuthUser } from "../auth/api/auth.api";
import { useReply } from "./api/useCommunityMutations";
import { replyDtoToThreadReply } from "./api/communities.adapters";
import { nextOptimisticReplyId } from "./communityThread.helpers";
import { viewerPerson } from "./communityPeople";
import type { Reply, Thread as ThreadData } from "./communityDetails";

/** The thread's reply composer: draft text plus the optimistic-post flow (an
 *  immediate local row that's swapped for the stored reply on success, or
 *  rolled back — with the typed text handed back to the composer — on
 *  failure). Its own seam because it's the only slice that mutates via
 *  `useReply` and owns `extraReplies`. */
export function useThreadComposerState(
  slug: string,
  data: ThreadData,
  demoMode: boolean,
  user: AuthUser | null,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reply = useReply(slug);
  const [replyText, setReplyText] = useState("");
  const [extraReplies, setExtraReplies] = useState<Reply[]>([]);

  function postReply() {
    const text = replyText.trim();
    if (!text) return;
    const optimisticId = nextOptimisticReplyId();
    const viewer = viewerPerson(user);
    setExtraReplies((prev) => [
      ...prev,
      {
        id: optimisticId,
        initials: viewer?.initials ?? "?",
        name: viewer?.name ?? "",
        tint: viewer?.tint ?? "plum",
        authorSlug: viewer?.slug,
        createdAt: new Date().toISOString(),
        text,
      },
    ]);
    setReplyText("");
    if (demoMode || !data.id) {
      showToast(t("communities:detail.thread.replyToast"), "success");
      return;
    }
    reply.mutate(
      { id: data.id, text },
      {
        // Swap the optimistic copy for the stored reply rather than dropping
        // it: a new reply is the NEWEST one, so on a thread with more replies
        // than the post's bounded preview it sits outside that window and the
        // refetch would not bring it back — the author would watch their own
        // reply vanish. `replies` dedupes by id, so this copy falls away by
        // itself once the server list carries it.
        onSuccess: (dto) => {
          if (dto) {
            const stored = replyDtoToThreadReply(dto, t);
            setExtraReplies((prev) =>
              prev.map((item) => (item.id === optimisticId ? stored : item)),
            );
          }
          showToast(t("communities:detail.thread.replyToast"), "success");
        },
        // Roll the optimistic reply back and hand the words back to the
        // composer so nothing typed is lost.
        onError: () => {
          setExtraReplies((prev) =>
            prev.filter((item) => item.id !== optimisticId),
          );
          setReplyText(text);
          showToast(t("communities:common.error"), "error");
        },
      },
    );
  }

  return {
    replyText,
    setReplyText,
    extraReplies,
    postReply,
    isReplyPending: reply.isPending,
  };
}
