import { FaWhatsapp } from "react-icons/fa6";
import { FiBookmark, FiLink, FiUsers } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useShareLink } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
// The one WhatsApp share-link builder in the app. It takes a title and a URL
// and knows nothing about gatherings, so a second copy here would only be a
// second place for the message shape to drift.
import { whatsAppShareUrl } from "../../gatherings/shareKit/shareLinks";
import styles from "./ComposeSuccessPanel.module.css";

/** Copy the link, send it on, keep it, or take it somewhere else too. */
export function ComposeSuccessShareRow({
  threadTitle,
  threadUrl,
  onPinToProfile,
  onPostToCommunity,
}: {
  threadTitle: string;
  threadUrl: string | null;
  onPinToProfile?: () => void;
  onPostToCommunity?: () => void;
}) {
  const { t } = useTranslation();
  const { share } = useShareLink({
    copied: t("forum:composePage.success.linkCopiedToast"),
    failed: t("forum:composePage.success.linkCopyFailedToast"),
  });

  return (
    <div
      className={styles.share}
      role="group"
      aria-label={t("forum:composePage.success.shareLabel")}
    >
      {threadUrl && (
        <Button
          variant="ghost-dark"
          size="sm"
          onClick={() => void share(threadUrl)}
        >
          <FiLink aria-hidden /> {t("forum:composePage.success.copyLink")}
        </Button>
      )}
      {threadUrl && (
        <Button
          variant="ghost-dark"
          size="sm"
          href={whatsAppShareUrl(threadTitle, threadUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp aria-hidden /> {t("forum:composePage.success.whatsApp")}
          <span className="visuallyHidden">
            {" "}
            {t("forum:composePage.success.opensInNewTab")}
          </span>
        </Button>
      )}
      {onPinToProfile && (
        <Button variant="ghost-dark" size="sm" onClick={onPinToProfile}>
          <FiBookmark aria-hidden />{" "}
          {t("forum:composePage.success.pinToProfile")}
        </Button>
      )}
      {onPostToCommunity && (
        <Button variant="ghost-dark" size="sm" onClick={onPostToCommunity}>
          <FiUsers aria-hidden />{" "}
          {t("forum:composePage.success.postToCommunity")}
        </Button>
      )}
    </div>
  );
}
