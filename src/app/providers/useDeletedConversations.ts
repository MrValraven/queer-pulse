import { createContext, useContext } from "react";

export interface DeletedConversationsContextValue {
  /** Conversation ids the user deleted for themselves — DEMO source of truth only. */
  deletedIds: Set<string>;
  markDeleted: (conversationId: string) => void;
}

export const DeletedConversationsContext =
  createContext<DeletedConversationsContextValue | null>(null);

export function useDeletedConversations() {
  const context = useContext(DeletedConversationsContext);
  if (!context) {
    throw new Error(
      "useDeletedConversations must be used within DeletedConversationsProvider",
    );
  }
  return context;
}
