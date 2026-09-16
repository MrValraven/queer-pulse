import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageResponse } from "../../shared/contracts/contracts";
import type { ConversationOverlaysProps } from "./ConversationOverlays";
import { useChatImageViewerState } from "./useChatImageViewerState";
import { useConversationPinStar } from "./useConversationPinStar";
import {
  useMessageActionMenu,
  type MessageActionMenu,
} from "./useMessageActionMenu";
import type { ChatMessage, Conversation } from "./data";

/** The `overlays` prop of `ConversationPanelOverlays`: everything
 *  `ConversationOverlays` takes except the three values it reads from the
 *  group modals' props. */
export type ConversationPanelOverlayProps = Omit<
  ConversationOverlaysProps,
  "active" | "myUserId" | "groupSeenBy"
>;

/**
 * The per-message surfaces `ConversationPanel` opens over its log: the
 * long-press/right-click action menu (`useMessageActionMenu`), pin and star
 * (`useConversationPinStar`) and the full screen photo viewer
 * (`useChatImageViewerState`), plus the one mapping from their state onto the
 * overlay props. Split out of `ConversationPanel` to keep that component under
 * the line cap. The three hooks run in the same order the panel called them
 * in, and `overlays` is rebuilt every render exactly as the inline literal was.
 */
export function useConversationOverlays(
  active: Conversation,
  messageGroups: { day: string; items: ChatMessage[] }[],
  options: {
    /** The signed-in member's own avatar, read by the panel from `useAuth`. */
    youAvatar?: string;
    onSetReply?: (message: ChatMessage) => void;
    onForwardMessage: (message: ChatMessage) => void;
  },
): {
  actionMenu: MessageActionMenu;
  pinnedMessages: MessageResponse[];
  openImage: (message: ChatMessage, origin?: HTMLElement | null) => void;
  overlays: ConversationPanelOverlayProps;
} {
  const { t } = useTranslation();

  const { pinnedMessages, onTogglePin, onToggleStar } =
    useConversationPinStar(active);

  const actionMenu = useMessageActionMenu(active.id);

  // The thread's photo sequence and which one the full screen viewer is on.
  const { photos, openIndex, openOriginRef, openImage, closeViewer } =
    useChatImageViewerState(messageGroups, {
      counterpartName: active.name,
      youLabel: t("messages:viewer.you"),
      /* Excluded for a group, where `avatarUrl` holds the GROUP's own
         picture. The gallery falls back to this whenever a message carries no
         `senderAvatar` of its own, so passing it here painted the group's
         image as the face of every member who has no profile photo. Undefined
         lets the viewer's initials avatar do the right thing instead.
         Deliberately NOT mirrored onto `counterpartName` above, which has the
         same shape: a group message with no `senderName` already falls back to
         the group's name today, and changing that is a separate call. */
      counterpartAvatar: active.isGroup ? undefined : active.avatarUrl,
      youAvatar: options.youAvatar,
    });

  const overlays: ConversationPanelOverlayProps = {
    actionTarget: actionMenu.actionTarget,
    deleteTarget: actionMenu.deleteTarget,
    deleteForMeTarget: actionMenu.deleteForMeTarget,
    reportTarget: actionMenu.reportTarget,
    onReactionToggle: actionMenu.handleReactionToggle,
    onSetReply: options.onSetReply,
    onBeginEdit: actionMenu.beginEdit,
    onCopyMessage: actionMenu.copyMessage,
    onForward: options.onForwardMessage,
    onTogglePin,
    onToggleStar,
    setActionTarget: actionMenu.setActionTarget,
    setDeleteTarget: actionMenu.setDeleteTarget,
    setDeleteForMeTarget: actionMenu.setDeleteForMeTarget,
    setReportTarget: actionMenu.setReportTarget,
    onConfirmDelete: actionMenu.confirmDelete,
    onConfirmDeleteForMe: actionMenu.confirmDeleteForMe,
    deletePending: actionMenu.deletePending,
    deleteForMePending: actionMenu.deleteForMePending,
    photos,
    photoIndex: openIndex,
    photoOrigin: openOriginRef,
    onClosePhoto: closeViewer,
    onForwardPhoto: options.onForwardMessage,
  };

  return { actionMenu, pinnedMessages, openImage, overlays };
}
