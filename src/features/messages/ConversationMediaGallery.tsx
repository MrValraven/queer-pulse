// src/features/messages/ConversationMediaGallery.tsx
import { useId, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  Modal,
  Tabs,
  tabPanelProps,
  type Tab,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConversationMediaKind } from "./api/conversationMedia.api";
import { ConversationMediaTabPanel } from "./ConversationMediaTabPanel";
import { useCachedThreadMessages } from "./useCachedThreadMessages";
import type { MessageGroup } from "./useMessagesController.helpers";
import type { ChatMessage } from "./data";
import styles from "./ConversationMediaGallery.module.css";

const SHELF_ORDER: ConversationMediaKind[] = ["media", "links", "documents"];

export interface ConversationMediaGalleryProps {
  /** Server id in live mode (null for a thread not created yet); the demo
   *  thread id in demo mode. */
  conversationId: string | null;
  isOpen: boolean;
  /** Plain dismissal (close button, Escape, scrim); focus goes back to the
   *  opener (`useConversationMediaGallery().close`). */
  onClose: () => void;
  /** Closes without restoring focus, just before handing over to the photo
   *  viewer or the thread (`useConversationMediaGallery().closeForNavigation`). */
  onNavigateAway: () => void;
  /** DM counterpart or group name, for messages that carry no sender name. */
  counterpartName: string;
  /** The open thread's image viewer (`useChatImageViewerState().openImage`). */
  onOpenPhoto: (message: ChatMessage) => void;
  /** The thread's virtualizer-aware jump, which pages back for an unloaded
   *  message (`jumpToMessageVirtualized`), for the Links shelf's "show in
   *  chat" row, which leaves the viewer closed. */
  onShowInChat: (messageId: string) => void;
  /** The same jump, but for a photo tap: opens the viewer once the jump
   *  actually lands on the message, or leaves the jump's own failure status
   *  on screen and opens nothing (`useGalleryPhotoJumpHandoff`). */
  onShowPhotoInChat: (messageId: string) => void;
  /** The open thread's currently rendered day groups (paged history plus this
   *  session's sends), for demo mode: its shelves are seeded from the
   *  scripted thread, which never carries a message sent this session, so
   *  this fills that gap without touching the live paged-media query. */
  messageGroups: MessageGroup[];
}

/**
 * "Media, links and docs" for one conversation (PRD-373): a sheet on the
 * shared `Modal` (a bottom sheet on phones) with a shelf per tab. Mounted only
 * while open, so the Modal's focus trap and scroll lock run per opening and
 * each shelf fetches only once its tab is shown.
 */
export function ConversationMediaGallery(props: ConversationMediaGalleryProps) {
  if (!props.isOpen) return null;
  return <ConversationMediaGallerySheet {...props} />;
}

function ConversationMediaGallerySheet({
  conversationId,
  onClose,
  onNavigateAway,
  counterpartName,
  onOpenPhoto,
  onShowInChat,
  onShowPhotoInChat,
  messageGroups,
}: ConversationMediaGalleryProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [activeKind, setActiveKind] = useState<ConversationMediaKind>("media");
  const tabsId = useId();
  // The viewer can only open a photo the thread has loaded (it never fetches
  // by itself). Demo history pages 30 at a time through the same infinite
  // query as live, so this reads the same paged cache in both modes.
  const loadedThreadMessages = useCachedThreadMessages(
    conversationId,
    demoMode,
  );

  const tabs: Tab[] = [
    { id: "media", label: t("messages:mediaGallery.tabMedia") },
    { id: "links", label: t("messages:mediaGallery.tabLinks") },
    { id: "documents", label: t("messages:mediaGallery.tabDocuments") },
  ];

  const handleTabChange = (tabId: string) => {
    const nextKind = SHELF_ORDER.find((kind) => kind === tabId);
    if (nextKind) setActiveKind(nextKind);
  };

  const openPhoto = (message: ChatMessage) => {
    // A session-only send (demo mode): the demo delivery path only ever
    // patches `status` on it (`useMessageDeliverCore`'s `setStatus`), so it
    // never gains a server id, and `loadedThreadMessages` (the query cache)
    // never carries it either. It IS the exact object the open thread's own
    // photo gallery already renders from (both read the same
    // `messageGroups`), so it opens directly here, ahead of the loaded-thread
    // check below, which only ever concerns messages the query cache holds.
    if (!message.id) {
      if (!message.localId) return;
      onNavigateAway();
      onOpenPhoto(message);
      return;
    }
    const isInLoadedThread = loadedThreadMessages.some(
      (threadMessage) => threadMessage.id === message.id,
    );
    onNavigateAway();
    // An older photo outside the loaded history hands off to the jump: it
    // pages back through the thread, and the viewer opens once the jump
    // actually lands on the message (`useGalleryPhotoJumpHandoff`). A jump
    // that can't reach it shows the jump's own failure status on screen,
    // with nothing opened.
    if (isInLoadedThread) onOpenPhoto(message);
    else onShowPhotoInChat(message.id);
  };

  const showInChat = (messageId: string) => {
    onNavigateAway();
    onShowInChat(messageId);
  };

  return (
    <Modal title={t("messages:mediaGallery.title")} onClose={onClose}>
      <Tabs
        tabs={tabs}
        active={activeKind}
        onChange={handleTabChange}
        variant="underline"
        idPrefix={tabsId}
        label={t("messages:mediaGallery.tabsLabel")}
        className={styles.tabs}
      />
      <div {...tabPanelProps(tabsId, activeKind)} className={styles.panel}>
        <ConversationMediaTabPanel
          key={activeKind}
          conversationId={conversationId}
          kind={activeKind}
          counterpartName={counterpartName}
          onOpenPhoto={openPhoto}
          onShowInChat={showInChat}
          messageGroups={messageGroups}
        />
      </div>
    </Modal>
  );
}
