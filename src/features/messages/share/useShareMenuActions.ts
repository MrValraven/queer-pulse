import { useToast } from "../../../shared/components/feedback/useToast";
import { useClipboard } from "../../../shared/hooks/useClipboard";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COPY_FALLBACK_TOAST_MS,
  WHATSAPP_SHARE_BASE_URL,
} from "../../gatherings/shareKit/shareKit.data";
import { buildShareBody, toAbsoluteShareUrl } from "./shareToChat.helpers";
import type { ShareContent } from "./shareMenu.types";

/**
 * What each item in a `ShareMenu` does, around one composed message: the
 * content's text with the absolute link as its last line. The clipboard can
 * refuse (permissions, an insecure origin, an embedded webview), and then the
 * link goes in a long-lived toast where the member can select it by hand.
 */
export function useShareMenuActions(content: ShareContent) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { copy } = useClipboard();
  const url = toAbsoluteShareUrl(content.path);
  const fullMessage = buildShareBody(content.text, url);

  const showCopyFallback = (fallbackKey: string) =>
    showToast(t(fallbackKey, { url }), "info", COPY_FALLBACK_TOAST_MS);

  const copyLink = async () => {
    if (await copy(url)) {
      showToast(t("messages:shareMenu.linkCopiedToast"), "success");
      return;
    }
    showCopyFallback("messages:shareMenu.linkCopyFallbackToast");
  };

  const copyMessage = async () => {
    if (await copy(fullMessage)) {
      showToast(t("messages:shareMenu.messageCopiedToast"), "success");
      return;
    }
    showCopyFallback("messages:shareMenu.copyFallbackToast");
  };

  // The url travels in its own field and stays out of `text`: most share
  // targets append it themselves, and the message would carry it twice.
  const shareToApp = async () => {
    try {
      await navigator.share({ title: content.title, text: content.text, url });
    } catch (error) {
      // Closing the sheet rejects with AbortError, and the sheet already said
      // so. Any other refusal still owes the member the link.
      if (error instanceof Error && error.name === "AbortError") return;
      await copyLink();
    }
  };

  return {
    whatsAppHref: `${WHATSAPP_SHARE_BASE_URL}${encodeURIComponent(fullMessage)}`,
    copyLink,
    copyMessage,
    shareToApp,
  };
}
