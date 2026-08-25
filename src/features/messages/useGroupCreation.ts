import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Conversation } from "./data";
import type { GroupMemberPick } from "./NewGroupModal";
import { buildDemoGroupConversation } from "./useMessagesController.helpers";
import type { useCreateGroup } from "./api/useMessageMutations";
import type { CreationOutcome } from "./messageCreation.types";

interface GroupCreationDeps {
  demoMode: boolean;
  myProfile: { firstName: string; lastName: string; slug?: string } | undefined;
  t: TFunction;
  setExtraThreads: Dispatch<SetStateAction<Conversation[]>>;
  setActiveId: Dispatch<SetStateAction<string>>;
  setReadIds: Dispatch<SetStateAction<Set<string>>>;
  setView: Dispatch<SetStateAction<"list" | "thread">>;
  createGroupMutation: ReturnType<typeof useCreateGroup>;
}

export interface GroupCreation {
  startGroup: (
    title: string,
    members: GroupMemberPick[],
    avatarUrl?: string,
    outcome?: CreationOutcome,
  ) => void;
}

/**
 * Create a group from the picked members + name and open its thread.
 * Extracted from `useMessageCreation`; behaviour is unchanged.
 */
export function useGroupCreation({
  demoMode,
  myProfile,
  t,
  setExtraThreads,
  setActiveId,
  setReadIds,
  setView,
  createGroupMutation,
}: GroupCreationDeps): GroupCreation {
  /**
   * Create a group from the picked members + name and open its thread. Live mode
   * POSTs /conversations/group and opens the returned thread; demo mode builds a
   * local mock group (owner = the signed-in member) with a `group_created`
   * system message so the prototype shows a working group with no network.
   */
  function startGroup(
    title: string,
    members: GroupMemberPick[],
    avatarUrl?: string,
    outcome?: CreationOutcome,
  ) {
    if (!title.trim() || members.length === 0) return;
    if (demoMode) {
      const conversation = buildDemoGroupConversation(
        title,
        members,
        avatarUrl,
        myProfile,
        t,
      );
      setExtraThreads((previous) => [conversation, ...previous]);
      setActiveId(conversation.id);
      setReadIds((current) => new Set(current).add(conversation.id));
      setView("thread");
      outcome?.onSuccess?.();
      return;
    }
    createGroupMutation.mutate(
      {
        title: title.trim(),
        memberHandles: members.map((member) => member.slug),
        avatarUrl: avatarUrl?.trim() || undefined,
      },
      {
        onSuccess: (conversation) => {
          if (!conversation) return;
          setExtraThreads((previous) => [
            conversation,
            ...previous.filter((existing) => existing.id !== conversation.id),
          ]);
          setActiveId(conversation.id);
          setReadIds((current) => new Set(current).add(conversation.id));
          setView("thread");
          outcome?.onSuccess?.();
        },
        // Nothing was created, so there's no placeholder thread to clean up —
        // unlike `startThread`/`forwardMessage`, the picker never opens a
        // thread optimistically before the server confirms the group exists.
        // The caller (MessagesPage) uses this to keep the NewGroup modal open
        // with its title/members/avatar intact so the member can retry rather
        // than losing the whole picked list to a closed modal; the global
        // mutation-error toast already surfaces the failure.
        onError: () => outcome?.onError?.(),
      },
    );
  }

  return { startGroup };
}
