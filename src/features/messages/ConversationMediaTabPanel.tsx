// src/features/messages/ConversationMediaTabPanel.tsx
import type { ConversationMediaKind } from "./api/conversationMedia.api";
import { useConversationMedia } from "./api/useConversationMedia";
import { ConversationMediaDocumentList } from "./ConversationMediaDocumentList";
import { ConversationMediaGrid } from "./ConversationMediaGrid";
import { ConversationMediaLinkList } from "./ConversationMediaLinkList";
import { ConversationMediaLoadMore } from "./ConversationMediaLoadMoreFooter";
import {
  ConversationMediaEmpty,
  ConversationMediaError,
  ConversationMediaSkeleton,
} from "./ConversationMediaStates";
import type { MessageGroup } from "./useMessagesController.helpers";
import type { ChatMessage } from "./data";

interface ConversationMediaTabPanelProps {
  conversationId: string | null;
  kind: ConversationMediaKind;
  counterpartName: string;
  onOpenPhoto: (message: ChatMessage) => void;
  onShowInChat: (messageId: string) => void;
  /** The open thread's currently rendered day groups, for demo mode's shelf
   *  builder (see `useConversationMedia`). Ignored live. */
  messageGroups: MessageGroup[];
}

/** One shelf's body: the loading skeleton, the error with Retry, the empty
 *  state, or the shelf itself with its load-more footer. */
export function ConversationMediaTabPanel({
  conversationId,
  kind,
  counterpartName,
  onOpenPhoto,
  onShowInChat,
  messageGroups,
}: ConversationMediaTabPanelProps) {
  const media = useConversationMedia(conversationId, kind, messageGroups);

  if (media.isLoading) return <ConversationMediaSkeleton kind={kind} />;
  if (media.isError) return <ConversationMediaError onRetry={media.retry} />;
  // A page can hold nothing the client classifier accepts while older pages
  // remain, so "empty" waits for the last page.
  if (media.entries.length === 0 && !media.hasNextPage) {
    return <ConversationMediaEmpty kind={kind} />;
  }

  return (
    <>
      {kind === "media" && (
        <ConversationMediaGrid
          entries={media.entries}
          counterpartName={counterpartName}
          onOpenPhoto={onOpenPhoto}
        />
      )}
      {kind === "links" && (
        <ConversationMediaLinkList
          entries={media.entries}
          counterpartName={counterpartName}
          onShowInChat={onShowInChat}
        />
      )}
      {kind === "documents" && (
        <ConversationMediaDocumentList entries={media.entries} />
      )}
      <ConversationMediaLoadMore
        hasNextPage={media.hasNextPage}
        isFetchingNextPage={media.isFetchingNextPage}
        isNextPageError={media.isNextPageError}
        onLoadMore={media.loadMore}
      />
    </>
  );
}
