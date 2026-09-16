// src/features/messages/MessagesPageModals.tsx
import type { ReactNode } from "react";
import type { StrangerMemberResult } from "./api/useStrangerMemberSearch";
import { NewGroupModal, type GroupMemberPick } from "./NewGroupModal";
import { NewMessageModal } from "./NewMessageModal";
import { StarredMessagesModal } from "./StarredMessagesModal";
import type { CreationOutcome } from "./useMessageCreation";
import type { Conversation } from "./data";

interface MessagesPageModalsProps {
  composing: boolean;
  onCloseComposing: () => void;
  onPickNewMessage: (recipient: Conversation) => void;
  pendingRequestTarget: StrangerMemberResult | null;
  groupComposing: boolean;
  onCloseGroupComposing: () => void;
  onCreateGroup: (
    title: string,
    members: GroupMemberPick[],
    avatarUrl: string | undefined,
    outcome: CreationOutcome,
  ) => void;
  /** The "forward a message" picker's own node (`useForwardPicker`'s own
   *  state), rendered alongside these three so every "compose" surface the
   *  thread list can open sits together. */
  forwardPickerNode: ReactNode;
  starredOpen: boolean;
  onCloseStarred: () => void;
  onPickStarred: (conversationId: string, messageId: string) => void;
}

/** Every modal `MessagesPage` can pop open on top of the list/panel layout:
 *  new-DM and new-group composers, the forward picker (already self-
 *  contained via `useForwardPicker`) and "Starred messages". Grouped into one
 *  wrapper so the page itself stays under the line cap. */
export function MessagesPageModals({
  composing,
  onCloseComposing,
  onPickNewMessage,
  pendingRequestTarget,
  groupComposing,
  onCloseGroupComposing,
  onCreateGroup,
  forwardPickerNode,
  starredOpen,
  onCloseStarred,
  onPickStarred,
}: MessagesPageModalsProps) {
  return (
    <>
      {composing && (
        <NewMessageModal
          onClose={onCloseComposing}
          onPick={onPickNewMessage}
          initialRequestTarget={pendingRequestTarget}
        />
      )}
      {groupComposing && (
        <NewGroupModal
          onClose={onCloseGroupComposing}
          onCreate={(title, members, avatarUrl) => {
            // Only close on success; on failure the modal (and its title/
            // member picks/avatar, all local to it) stays open so the member
            // can retry without re-entering everything. The global mutation-
            // error toast already told them it failed.
            onCreateGroup(title, members, avatarUrl, {
              onSuccess: onCloseGroupComposing,
            });
          }}
        />
      )}
      {forwardPickerNode}
      {starredOpen && (
        <StarredMessagesModal
          onClose={onCloseStarred}
          onPick={(conversationId, messageId) => {
            onPickStarred(conversationId, messageId);
            onCloseStarred();
          }}
        />
      )}
    </>
  );
}
