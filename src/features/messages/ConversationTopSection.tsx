// src/features/messages/ConversationTopSection.tsx
import { useState } from "react";
import type { MessageResponse } from "../../shared/contracts/contracts";
import { ConnectionStatusBanner } from "./ConnectionStatusBanner";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationPinnedBanner } from "./ConversationPinnedBanner";
import { ThreadSearchModal } from "./ThreadSearchModal";
import type { Conversation } from "./data";

interface ConversationTopSectionProps {
  active: Conversation;
  isCounterpartOnline: boolean;
  onBack?: () => void;
  onOpenStarred: () => void;
  onOpenGroupInfo: () => void;
  pinnedMessages: MessageResponse[];
  onJumpToMessage: (messageId: string) => boolean;
}

/**
 * The conversation's top chrome: the header, the "search in this chat" modal
 * (its open state lives entirely here — nothing outside this section needs
 * it), the connection-status banner, and the pinned-messages banner. Split
 * out of `ConversationPanel` to keep it under the line cap.
 */
export function ConversationTopSection({
  active,
  isCounterpartOnline,
  onBack,
  onOpenStarred,
  onOpenGroupInfo,
  pinnedMessages,
  onJumpToMessage,
}: ConversationTopSectionProps) {
  const [threadSearchOpen, setThreadSearchOpen] = useState(false);
  return (
    <>
      <ConversationHeader
        active={active}
        isCounterpartOnline={isCounterpartOnline}
        onBack={onBack}
        onOpenStarred={onOpenStarred}
        onOpenSearch={() => setThreadSearchOpen(true)}
        onOpenGroupInfo={onOpenGroupInfo}
      />
      {threadSearchOpen && (
        <ThreadSearchModal
          conversation={active}
          onClose={() => setThreadSearchOpen(false)}
          onJumpToMessage={onJumpToMessage}
        />
      )}
      <ConnectionStatusBanner />
      <ConversationPinnedBanner pinned={pinnedMessages} onJump={onJumpToMessage} />
    </>
  );
}
