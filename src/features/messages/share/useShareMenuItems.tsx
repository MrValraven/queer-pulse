import { FaWhatsapp } from "react-icons/fa6";
import { FiCopy, FiLink, FiSend, FiShare } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ShareMenuOption, ShareContent } from "./shareMenu.types";
import { useShareMenuActions } from "./useShareMenuActions";
import type { ShareToChatController } from "./useShareToChat";

/**
 * A `ShareMenu`'s items, in order: a message inside QueerPulse (signed-in
 * members only), WhatsApp, the device's share sheet where it has one, the
 * composed message, and the bare link.
 */
export function useShareMenuItems(
  content: ShareContent,
  shareToChat: ShareToChatController,
): ShareMenuOption[] {
  const { t } = useTranslation();
  const actions = useShareMenuActions(content);
  // Read at render: a prerender has no navigator, and a desktop browser
  // without a share sheet simply never shows the item.
  const canUseNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const items: (ShareMenuOption | false)[] = [
    shareToChat.canShare && {
      key: "message",
      icon: <FiSend />,
      label: t("messages:share.cta"),
      onSelect: shareToChat.open,
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
