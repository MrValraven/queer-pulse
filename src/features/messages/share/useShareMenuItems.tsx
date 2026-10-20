import { FaWhatsapp } from "react-icons/fa6";
import { FiCopy, FiLink, FiSend, FiShare, FiUsers } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ShareMenuOption, ShareContent } from "./shareMenu.types";
import { useShareMenuActions } from "./useShareMenuActions";
import type { ShareToChatController } from "./useShareToChat";
import type { ShareToCommunityController } from "./useShareToCommunityPicker";

export interface ShareMenuItemOptions {
  /** False leaves "Send in a message" out. Defaults to true. */
  shouldOfferSendInMessage?: boolean;
  /** "Share to a community" (`useShareToCommunityPicker`). Omit for none.
   *  It follows `shouldOfferSendInMessage` too: the same persona-playlist
   *  rule keeps both out. */
  shareToCommunity?: ShareToCommunityController;
}

/**
 * A `ShareMenu`'s items, in order: a message inside QueerPulse (signed-in
 * members only), a post in one of your communities (Studio links), WhatsApp,
 * the device's share sheet where it has one, the composed message, and the
 * bare link.
 */
export function useShareMenuItems(
  content: ShareContent,
  shareToChat: ShareToChatController,
  options: ShareMenuItemOptions = {},
): ShareMenuOption[] {
  const { t } = useTranslation();
  const actions = useShareMenuActions(content);
  const shouldOfferSendInMessage = options.shouldOfferSendInMessage ?? true;
  const { shareToCommunity } = options;
  // Read at render: a prerender has no navigator, and a desktop browser
  // without a share sheet simply never shows the item.
  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const items: (ShareMenuOption | false)[] = [
    shareToChat.canShare &&
      shouldOfferSendInMessage && {
        key: "message",
        icon: <FiSend />,
        label: t("messages:share.cta"),
        onSelect: shareToChat.open,
      },
    shareToCommunity !== undefined &&
      shareToCommunity.canShare &&
      shouldOfferSendInMessage && {
        key: "community",
        icon: <FiUsers />,
        label: t("messages:shareMenu.shareToCommunity"),
        onSelect: shareToCommunity.open,
      },
    {
      key: "whatsApp",
      icon: <FaWhatsapp />,
      label: t("messages:shareMenu.whatsApp"),
      href: actions.whatsAppHref,
    },
    canUseNativeShare && {
      key: "nativeShare",
      icon: <FiShare />,
      label: t("messages:shareMenu.nativeShare"),
      onSelect: () => void actions.shareToApp(),
    },
    {
      key: "copyMessage",
      icon: <FiCopy />,
      label: t("messages:shareMenu.copyMessage"),
      onSelect: () => void actions.copyMessage(),
    },
    {
      key: "copyLink",
      icon: <FiLink />,
      label: t("messages:shareMenu.copyLink"),
      onSelect: () => void actions.copyLink(),
    },
  ];
  return items.filter((item): item is ShareMenuOption => item !== false);
}
